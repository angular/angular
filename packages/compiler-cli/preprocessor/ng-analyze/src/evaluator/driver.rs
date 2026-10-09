//! Semantic-mode driver: resolves [`IncompleteValue`] holes across files and re-runs the
//! synchronous interpreter until a value is complete or genuinely dynamic.
//!
//! Implemented as a plain recursive async function rather than a cached query so cyclic imports
//! do not deadlock (two `SharedQuery` tasks awaiting each other would park forever — barrel-file
//! cycles are common, and on WASM's single-threaded pump a deadlock hangs the entire compiler).
//! Parsing, semantic analysis, and export tables are already cached queries.
// TODO(perf): promote to `QueryKey::EvaluateExport(FileId, ExportAtom)` once the engine
// supports query-level cycle detection.
//!
//! Locking discipline: the interpreter runs under a single file's `ParsedFile` lock, which is
//! always dropped before any `.await`; no two file locks are ever held simultaneously.

use crate::analyzer::{extract_import_map, ImportKind};
use crate::evaluator::cross_file::{resolve_specifier, ChasedExport};
use crate::evaluator::foreign::ForeignFunctionResolver;
use crate::evaluator::interpreter::{
    evaluate_expression, evaluate_function_call, evaluate_static_member,
    evaluate_symbol_declaration, EvalInput, EvalMode,
};
use crate::evaluator::value::{
    collect_holes, collect_reevaluation_holes, demote_incomplete_to_dynamic, fingerprint_args,
    stamp_owning_reference, substitute, DeclKind, DynamicReason, IncompleteDep, IncompleteValue,
    ResolvedEnv, ResolvedValue, UnresolvedReference, ValueReference,
};
use crate::query::{FileId, QueryContext};
use crate::types::analysis::OwningReference;
use crate::types::ParsedFile;
use crate::ResourceResolverFs;
use futures::future::{BoxFuture, FutureExt};
use oxc_ast::{ast::Expression, AstKind};
use oxc_semantic::SymbolId;
use oxc_span::Span;
use std::collections::{HashMap, HashSet};
use std::path::Path;
use std::sync::{Arc, Mutex};

/// Cross-file recursion depth cap (mirrors ngtsc's guard against pathological chains).
const MAX_FILE_DEPTH: usize = 64;
/// Backstop only: each productive iteration strictly grows the env or changes a re-evaluated
/// node, and one expression's hole-key space is finite.
const MAX_FIXPOINT_ITERS: usize = 16;

async fn reevaluate_ast_expression<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryContext<Fs>,
    file_id: FileId,
    node_id: Option<oxc_semantic::NodeId>,
    env: &ResolvedEnv,
    foreign: &[&dyn ForeignFunctionResolver],
) -> Option<ResolvedValue> {
    let node_id = node_id?;
    let parsed = ctx.parse_file(file_id).await;
    let guard = parsed.lock().expect("ParsedFile lock poisoned");
    let dep = guard.borrow_dependent();
    let import_map = crate::analyzer::extract_import_map(&dep.module_record);
    let input = EvalInput {
        semantic: &dep.semantic,
        file: file_id,
        import_map: &import_map,
        mode: EvalMode::Semantic,
        env,
        foreign,
    };

    crate::evaluator::interpreter::evaluate_node_id(node_id, &input)
}

/// Resolves all [`IncompleteValue`] holes in `value` via `ctx`, demoting any remaining
/// unresolvable holes to `Dynamic`.
pub async fn evaluate_value_completely<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryContext<Fs>,
    value: &ResolvedValue,
    foreign: &[&dyn ForeignFunctionResolver],
) -> ResolvedValue {
    if !value.contains_incomplete() {
        return value.clone();
    }
    let mut state = ResolutionState::default();
    let mut env = ResolvedEnv::new();
    let mut ast_results = std::collections::HashMap::new();
    let mut current = value.clone();
    // Re-evaluating a node can emit a hole whose key is already in `env`, requiring another substitution pass.
    let mut reevaluation_changed = false;

    for _ in 0..MAX_FIXPOINT_ITERS {
        if !current.contains_incomplete() {
            return current;
        }
        let holes = collect_holes(&current);
        let mut progressed = false;
        let mut postponed_calls = Vec::new();
        for hole in &holes {
            let key = hole.key();
            if env.contains_key(&key) {
                continue;
            }
            if let IncompleteDep::Call { args, .. } = &hole.dep {
                if args.iter().any(|arg| arg.contains_incomplete()) {
                    postponed_calls.push(hole.clone());
                    continue;
                }
            }
            let resolved = resolve_hole(ctx, hole.clone(), &mut state, 0, foreign).await;
            env.insert(key, resolved);
            progressed = true;
        }
        if !progressed && !postponed_calls.is_empty() {
            for hole in postponed_calls {
                let key = hole.key();
                let resolved = resolve_hole(ctx, hole, &mut state, 0, foreign).await;
                env.insert(key, resolved);
            }
            progressed = true;
        }
        if !progressed && !reevaluation_changed {
            break;
        }
        current = substitute(current, &env, &ast_results);
        reevaluation_changed = false;

        if current.contains_incomplete() {
            // Re-evaluate every non-transparent hole node (even if keys repeat across call sites).
            for hole in collect_reevaluation_holes(&current) {
                let Some(reevaluated) =
                    reevaluate_ast_expression(ctx, hole.file, hole.node_id, &env, foreign).await
                else {
                    continue;
                };
                if ast_results.get(&hole.span) == Some(&reevaluated) {
                    continue;
                }
                ast_results.insert(hole.span, reevaluated);
                reevaluation_changed = true;
            }
            if reevaluation_changed {
                current = substitute(current, &env, &ast_results);
            }
        }
    }
    demote_incomplete_to_dynamic(current)
}

/// Re-runnable single-file evaluation target. Re-running with a growing env is what lets
/// non-transparent holes (spreads, operators, call arguments) complete without access-path
/// bookkeeping.
enum EvalTask {
    /// Top-level declaration identified by local `SymbolId` (rather than export name, which may
    /// be aliased via `export { local as exported }` or `export default local`).
    Declaration { symbol: SymbolId },
    /// Unnamed `export default <expression>`.
    DefaultExpression,
    /// Static member access on a class in this file.
    Member {
        base: ValueReference,
        member: String,
    },
    /// Function/method call on a declaration in this file with pre-resolved arguments.
    Call {
        callee: ValueReference,
        args: Vec<ResolvedValue>,
        call_span: Span,
    },
}

/// Runs `task` to a hole-free value in `file_id`, iteratively resolving cross-file holes and
/// re-evaluating with the populated `env` until complete (or demoting remaining holes to `Dynamic`).
fn complete_value<'a, Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &'a QueryContext<Fs>,
    file_id: FileId,
    task: EvalTask,
    initial: Option<ResolvedValue>,
    state: &'a mut ResolutionState,
    depth: usize,
    foreign: &'a [&'a dyn ForeignFunctionResolver],
) -> BoxFuture<'a, ResolvedValue> {
    async move {
        let parsed = ctx.parse_file(file_id).await;
        let mut env = ResolvedEnv::new();
        let mut value =
            initial.unwrap_or_else(|| run_task_locked(&parsed, file_id, &env, &task, foreign));

        for _ in 0..MAX_FIXPOINT_ITERS {
            if !value.contains_incomplete() {
                return value;
            }
            let holes = collect_holes(&value);
            let mut progressed = false;
            let mut postponed_calls = Vec::new();
            for hole in &holes {
                let key = hole.key();
                if env.contains_key(&key) {
                    continue;
                }
                // Defer Call holes with incomplete arguments so inner holes resolve first and
                // produce a stable argument fingerprint on the next iteration.
                if let IncompleteDep::Call { args, .. } = &hole.dep {
                    if args.iter().any(|arg| arg.contains_incomplete()) {
                        postponed_calls.push(hole.clone());
                        continue;
                    }
                }
                // `resolve_hole` is total (worst case `Dynamic`), so every insertion is monotone
                // progress.
                let resolved = resolve_hole(ctx, hole.clone(), state, depth, foreign).await;
                env.insert(key, resolved);
                progressed = true;
            }
            if !progressed && !postponed_calls.is_empty() {
                // If inner arguments could not progress, still attempt the outer Call hole so
                // return-type foreign recognizers (e.g. `ModuleWithProviders`) can succeed.
                for hole in postponed_calls {
                    let key = hole.key();
                    let resolved = resolve_hole(ctx, hole, state, depth, foreign).await;
                    env.insert(key, resolved);
                }
                progressed = true;
            }
            if !progressed {
                break;
            }
            // Fast path: when all holes are transparent value positions with env entries,
            // owned-tree substitution completes the value directly without arena re-evaluation.
            if holes
                .iter()
                .all(|h| h.transparent && env.contains_key(&h.key()))
            {
                value = substitute(value, &env, &std::collections::HashMap::new());
            } else {
                value = run_task_locked(&parsed, file_id, &env, &task, foreign);
            }
        }
        demote_incomplete_to_dynamic(value)
    }
    .boxed()
}

fn run_task_locked(
    parsed: &Arc<Mutex<ParsedFile>>,
    file_id: FileId,
    env: &ResolvedEnv,
    task: &EvalTask,
    foreign: &[&dyn ForeignFunctionResolver],
) -> ResolvedValue {
    let guard = parsed.lock().expect("ParsedFile lock poisoned");
    let dep = guard.borrow_dependent();
    let import_map = extract_import_map(&dep.module_record);
    let input = EvalInput {
        semantic: &dep.semantic,
        file: file_id,
        import_map: &import_map,
        mode: EvalMode::Semantic,
        env,
        foreign,
    };
    match task {
        EvalTask::Declaration { symbol } => evaluate_symbol_declaration(*symbol, &input),
        EvalTask::DefaultExpression => match find_default_export_expression(dep) {
            Some(expr) => evaluate_expression(expr, &input),
            None => ResolvedValue::dynamic(file_id, Span::default(), DynamicReason::ExportNotFound),
        },
        EvalTask::Member { base, member } => evaluate_static_member(base, member, &input),
        EvalTask::Call {
            callee,
            args,
            call_span,
        } => evaluate_function_call(callee, args, *call_span, &input),
    }
}

/// Identity of a Member/Call resolution for cycle detection and memoization.
#[derive(Clone, Debug, PartialEq, Eq, Hash)]
enum ResolutionKey {
    Member {
        file: FileId,
        class: String,
        member: String,
    },
    Call {
        file: FileId,
        callee: String,
        member: Option<String>,
        args_fingerprint: u64,
    },
}

/// Per-evaluation Member/Call cycle stack and memo table across frames.
#[derive(Default)]
struct ResolutionState {
    /// Keys currently being resolved on the active path, outermost first.
    in_progress: Vec<ResolutionKey>,
    /// Path-independent completed values (stored before stamping the caller's owning reference).
    completed: HashMap<ResolutionKey, ResolvedValue>,
    /// Shallowest `in_progress` depth a cycle or depth-limit cut depended on (0 = whole path).
    shallowest_cut: Option<usize>,
}

impl ResolutionState {
    fn cut_cycle(&mut self, key: &ResolutionKey) -> bool {
        let Some(index) = self.in_progress.iter().position(|k| k == key) else {
            return false;
        };
        self.note_cut(index + 1);
        true
    }

    fn note_cut(&mut self, depth: usize) {
        self.shallowest_cut = Some(self.shallowest_cut.map_or(depth, |cut| cut.min(depth)));
    }

    fn note_depth_limit(&mut self) {
        self.note_cut(0);
    }
}

/// Resolves one hole to a hole-free value, converting failures to `Dynamic`.
fn resolve_hole<'a, Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &'a QueryContext<Fs>,
    hole: IncompleteValue,
    state: &'a mut ResolutionState,
    depth: usize,
    foreign: &'a [&'a dyn ForeignFunctionResolver],
) -> BoxFuture<'a, ResolvedValue> {
    async move {
        if depth >= MAX_FILE_DEPTH {
            state.note_depth_limit();
            return ResolvedValue::dynamic(hole.file, hole.span, DynamicReason::DepthLimit);
        }
        let (key, file, owning, task) = match hole.dep {
            IncompleteDep::Reference(unresolved) => {
                return resolve_import(ctx, unresolved, hole.span, state, depth + 1, foreign).await;
            }
            IncompleteDep::Member { base, member } => (
                ResolutionKey::Member {
                    file: base.file,
                    class: base.name.clone(),
                    member: member.clone(),
                },
                base.file,
                base.owning_reference.clone(),
                EvalTask::Member { base, member },
            ),
            IncompleteDep::Call { callee, args } => (
                ResolutionKey::Call {
                    file: callee.file,
                    callee: callee.name.clone(),
                    member: callee.member.clone(),
                    args_fingerprint: fingerprint_args(&args),
                },
                callee.file,
                callee.owning_reference.clone(),
                EvalTask::Call {
                    callee,
                    args,
                    // Span of the call in the requesting file, preserved on target-frame dynamics.
                    call_span: hole.span,
                },
            ),
        };

        if let Some(done) = state.completed.get(&key) {
            return apply_owning_reference(done.clone(), file, owning);
        }
        if state.cut_cycle(&key) {
            return ResolvedValue::dynamic(hole.file, hole.span, DynamicReason::ImportCycle);
        }

        let index = state.in_progress.len();
        let outer_cut = state.shallowest_cut.take();
        state.in_progress.push(key);
        let value = complete_value(ctx, file, task, None, state, depth + 1, foreign).await;
        let key = state
            .in_progress
            .pop()
            .expect("in-progress stack is balanced across complete_value");
        let inner_cut = state.shallowest_cut;
        state.shallowest_cut = match (outer_cut, inner_cut) {
            (Some(outer), Some(inner)) => Some(outer.min(inner)),
            (outer, inner) => outer.or(inner),
        };
        if inner_cut.is_none_or(|cut| cut > index) {
            state.completed.insert(key, value.clone());
        }
        apply_owning_reference(value, file, owning)
    }
    .boxed()
}

/// Stamps `owning` onto references declared in `file` (e.g. so `RouterModule.forRoot()`'s
/// `ngModule` stays importable as `@angular/router`).
fn apply_owning_reference(
    value: ResolvedValue,
    file: FileId,
    owning: Option<OwningReference>,
) -> ResolvedValue {
    let Some(owning) = owning else {
        return value;
    };
    stamp_owning_reference(value, file, &owning)
}

async fn resolve_import<Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &QueryContext<Fs>,
    unresolved: UnresolvedReference,
    usage_span: Span,
    state: &mut ResolutionState,
    depth: usize,
    foreign: &[&dyn ForeignFunctionResolver],
) -> ResolvedValue {
    let export_name = match &unresolved.symbol {
        ImportKind::Named(name) => name.clone(),
        ImportKind::Default => "default".to_string(),
        ImportKind::Namespace => {
            // TODO(parity): Materialize unrefined namespace imports as a `Map` of exports
            // (upstream `ResolvedModule`).
            return ResolvedValue::dynamic(
                unresolved.importer,
                usage_span,
                DynamicReason::UnresolvedImport(Box::new(unresolved)),
            );
        }
    };
    let importer_path = ctx.engine.lookup_path(unresolved.importer);
    let mut value = resolve_named_export(
        ctx,
        &importer_path,
        unresolved.specifier.clone(),
        export_name,
        unresolved.clone(),
        usage_span,
        state,
        depth,
        foreign,
    )
    .await;

    // Record the importing file's local binding at the tail of the alias chain.
    if let (ResolvedValue::Reference(ref_val), Some(local_name)) =
        (&mut value, &unresolved.local_name)
    {
        if !ref_val
            .aliases
            .iter()
            .any(|(file, _)| *file == unresolved.importer)
        {
            ref_val
                .aliases
                .push((unresolved.importer, local_name.clone()));
        }
    }
    value
}

#[allow(clippy::too_many_arguments)]
fn resolve_named_export<'a, Fs: ResourceResolverFs + Clone + 'static>(
    ctx: &'a QueryContext<Fs>,
    file_path: &'a Path,
    specifier: String,
    export_name: String,
    unresolved: UnresolvedReference,
    usage_span: Span,
    state: &'a mut ResolutionState,
    depth: usize,
    foreign: &'a [&'a dyn ForeignFunctionResolver],
) -> BoxFuture<'a, ResolvedValue> {
    async move {
        if depth >= MAX_FILE_DEPTH {
            state.note_depth_limit();
            return ResolvedValue::dynamic(
                unresolved.importer,
                usage_span,
                DynamicReason::DepthLimit,
            );
        }

        let mut chase_visited = HashSet::new();
        let chased_decl = crate::evaluator::cross_file::cross_file_resolve_export(
            ctx,
            file_path,
            Some(&specifier),
            export_name.clone(),
            &mut chase_visited,
        )
        .await;

        match chased_decl {
            Ok(Some(ChasedExport::DefaultExpression(default_export))) => {
                // Parity: `visitDeclaration` evaluates an `ExportAssignment` to its expression in
                // the declaring module's frame.
                let decl_file_id = ctx.engine.intern_path(&default_export.file_path);
                let completed = complete_value(
                    ctx,
                    decl_file_id,
                    EvalTask::DefaultExpression,
                    None,
                    state,
                    depth + 1,
                    foreign,
                )
                .await;
                apply_owning_reference(completed, decl_file_id, default_export.owning_reference)
            }
            Ok(Some(ChasedExport::Symbol(decl))) => {
                let decl_file_id = ctx.engine.intern_path(&decl.file_path);

                let syntax = ctx.analyze_file_syntax(decl_file_id).await;
                let parsed = ctx.parse_file(decl_file_id).await;
                // `ClassInfo::name_span` is UTF-16; `ValueReference::span` must be a byte span.
                let (symbol_name, symbol_span) = {
                    let guard = parsed.lock().unwrap();
                    let dep = guard.borrow_dependent();
                    let scoping = dep.semantic.scoping();
                    (
                        scoping.symbol_name(decl.symbol_id).to_string(),
                        scoping.symbol_span(decl.symbol_id),
                    )
                };

                if let Some(info) = syntax.class_index.get(&symbol_name) {
                    return ResolvedValue::Reference(ValueReference {
                        file: decl_file_id,
                        name: info.class_name.clone(),
                        member: None,
                        reference_id: Some(info.reference_id),
                        span: symbol_span,
                        kind: DeclKind::Class,
                        owning_reference: decl.owning_reference.clone(),
                        synthetic: false,
                        aliases: decl.aliases,
                        is_default_export: decl.exported_as_default,
                    });
                }

                if !decl
                    .flags
                    .intersects(oxc_syntax::symbol::SymbolFlags::Value)
                {
                    return ResolvedValue::dynamic(
                        decl_file_id,
                        usage_span,
                        DynamicReason::ExportNotFound,
                    );
                }

                let probe = {
                    let guard = parsed.lock().unwrap();
                    let dep = guard.borrow_dependent();
                    let import_map = extract_import_map(&dep.module_record);
                    let input = EvalInput {
                        semantic: &dep.semantic,
                        file: decl_file_id,
                        import_map: &import_map,
                        mode: EvalMode::Semantic,
                        env: &ResolvedEnv::new(),
                        foreign,
                    };
                    evaluate_symbol_declaration(decl.symbol_id, &input)
                };

                // Parity: re-run the declaration the chase resolved (as `visitDeclaration` does),
                // not an export-name lookup.
                let completed = complete_value(
                    ctx,
                    decl_file_id,
                    EvalTask::Declaration {
                        symbol: decl.symbol_id,
                    },
                    Some(probe),
                    state,
                    depth + 1,
                    foreign,
                )
                .await;
                apply_owning_reference(completed, decl_file_id, decl.owning_reference)
            }
            Err(crate::evaluator::cross_file::ChaseSymbolError::DepthLimitExceeded) => {
                ResolvedValue::dynamic(unresolved.importer, usage_span, DynamicReason::DepthLimit)
            }
            Err(crate::evaluator::cross_file::ChaseSymbolError::CycleDetected) => {
                let file_id =
                    resolve_specifier(ctx.engine.resolver.as_ref(), file_path, &specifier)
                        .map(|p| ctx.engine.intern_path(&p))
                        .unwrap_or(unresolved.importer);
                ResolvedValue::dynamic(file_id, usage_span, DynamicReason::ImportCycle)
            }
            Ok(None) => {
                let file_id =
                    resolve_specifier(ctx.engine.resolver.as_ref(), file_path, &specifier)
                        .map(|p| ctx.engine.intern_path(&p))
                        .unwrap_or(unresolved.importer);
                ResolvedValue::dynamic(
                    file_id,
                    usage_span,
                    DynamicReason::UnresolvedImport(Box::new(unresolved)),
                )
            }
        }
    }
    .boxed()
}

fn find_default_export_expression<'r, 'a>(
    dep: &'r crate::types::ParsedFileDependent<'a>,
) -> Option<&'r Expression<'a>> {
    for node in dep.semantic.nodes() {
        if let AstKind::ExportDefaultDeclaration(decl) = node.kind() {
            if let Some(expr) = decl.declaration.as_expression() {
                return Some(expr);
            }
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fs::OverlayFileSystem;
    use crate::query::{QueryEngine, QueryKey};
    use crate::resource_registry::ResourceRegistry;
    use oxc_resolver::{ResolveOptions, ResolverGeneric};
    use std::path::PathBuf;
    use std::sync::Arc;
    use std::time::Duration;

    fn build_engine(
        files: &[(&str, &str)],
        entrypoints: &[&str],
    ) -> Arc<QueryEngine<OverlayFileSystem>> {
        let fs = crate::test_utils::create_test_fs(files);
        let resolver = Arc::new(ResolverGeneric::new_with_file_system(
            fs.clone(),
            ResolveOptions {
                extensions: vec![".ts".into(), ".tsx".into(), ".d.ts".into(), ".js".into()],
                ..ResolveOptions::default()
            },
        ));
        let registry = Arc::new(ResourceRegistry::default());
        let entrypoints = Arc::new(std::sync::RwLock::new(
            entrypoints.iter().map(PathBuf::from).collect::<Vec<_>>(),
        ));
        QueryEngine::new_default(fs, resolver, registry, entrypoints)
    }

    /// Run a future on a worker thread with a deadline, so a regression toward deadlock (the
    /// reason the driver is NOT a cached query) fails the test instead of hanging the suite.
    fn block_on_with_timeout<T: Send + 'static>(
        fut: impl std::future::Future<Output = T> + Send + 'static,
    ) -> T {
        let (tx, rx) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let _ = tx.send(futures::executor::block_on(fut));
        });
        rx.recv_timeout(Duration::from_secs(30))
            .expect("evaluation deadlocked or timed out")
    }

    fn expect_component(class: &crate::analyzer::ClassData) -> &crate::analyzer::ComponentData {
        let Some(component) = class.as_component() else {
            panic!("expected a component classification");
        };
        component
    }

    const APP_WITH_SHARED: &str = r#"
        import { Component } from '@angular/core';
        import { SHARED } from './shared';
        @Component({
            selector: 'app',
            standalone: true,
            imports: SHARED,
            template: '<lib-foo></lib-foo>'
        })
        export class AppComponent {}
    "#;

    const SHARED_CONSTS: &str = r#"
        import { FooComponent } from './foo.component';
        import { BarDirective } from './bar.directive';
        export const SHARED = [FooComponent, BarDirective];
    "#;

    const FOO_COMPONENT: &str = r#"
        import { Component } from '@angular/core';
        @Component({ selector: 'lib-foo', standalone: true, template: '' })
        export class FooComponent {}
    "#;

    const BAR_DIRECTIVE: &str = r#"
        import { Directive } from '@angular/core';
        @Directive({ selector: '[libBar]', standalone: true })
        export class BarDirective {}
    "#;

    #[test]
    fn cross_file_const_array_in_standalone_imports() {
        let engine = build_engine(
            &[
                ("/app/app.component.ts", APP_WITH_SHARED),
                ("/app/shared.ts", SHARED_CONSTS),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        // `app.component.ts` imports only `SHARED`, so it has no binding for either
        // declaration: both must be emitted through a generated import of their real
        // exported names, never through an invented identifier.
        assert!(names.contains(&"FooComponent"), "got: {names:?}");
        assert!(names.contains(&"BarDirective"), "got: {names:?}");
        let foo = decls
            .iter()
            .find(|d| d.reference.name_in_file(app_id) == "FooComponent")
            .unwrap();
        assert!(!foo.reference.is_in_scope_of(app_id));
        assert_eq!(
            foo.reference
                .aliases
                .get(&engine.intern_path("/app/shared.ts")),
            Some(&"FooComponent".to_string()),
            "the barrel that imported it must record its name there"
        );
        let foo_id = engine.intern_path("/app/foo.component.ts");
        assert!(foo.reference.owning_reference.is_none());
        assert_eq!(foo.reference.file, foo_id);
        assert!(
            component.raw_imports_span.is_none(),
            "fully evaluated imports must clear the runtime fallback"
        );
    }

    #[test]
    fn nested_imported_const_array_in_imports() {
        let app = r#"
            import { Component } from '@angular/core';
            import { SHARED } from './shared';
            import { BazComponent } from './baz.component';
            @Component({
                selector: 'app',
                standalone: true,
                imports: [SHARED, BazComponent],
                template: ''
            })
            export class AppComponent {}
        "#;
        let baz = r#"
            import { Component } from '@angular/core';
            @Component({ selector: 'baz', standalone: true, template: '' })
            export class BazComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                ("/app/shared.ts", SHARED_CONSTS),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
                ("/app/baz.component.ts", baz),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert_eq!(
            names.len(),
            3,
            "nested array must flatten imports: {names:?}"
        );
        assert!(names.contains(&"FooComponent"));
        assert!(names.contains(&"BarDirective"));
        assert!(names.contains(&"BazComponent"));
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn module_with_providers_map_in_imports() {
        let app = r#"
            import { Component } from '@angular/core';
            import { FooModule } from './foo.module';
            const MWP = { ngModule: FooModule, providers: [] };
            @Component({
                selector: 'app',
                standalone: true,
                imports: [MWP],
                template: ''
            })
            export class AppComponent {}
        "#;
        let foo_module = r#"
            import { NgModule } from '@angular/core';
            @NgModule({})
            export class FooModule {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                ("/app/foo.module.ts", foo_module),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert_eq!(names, vec!["FooModule"]);
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn spread_local_const_array_in_imports() {
        let app = r#"
            import { Component, Directive } from '@angular/core';
            @Component({ selector: 'foo', standalone: true, template: '' })
            export class FooComponent {}
            @Directive({ selector: '[bar]', standalone: true })
            export class BarDirective {}
            @Component({ selector: 'baz', standalone: true, template: '' })
            export class BazComponent {}

            const LOCAL = [FooComponent, BarDirective] as const;

            @Component({
                selector: 'app',
                standalone: true,
                imports: [...LOCAL, BazComponent],
                template: ''
            })
            export class AppComponent {}
        "#;
        let engine = build_engine(
            &[("/app/app.component.ts", app)],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[3]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert_eq!(names.len(), 3, "spread of local array: {names:?}");
        assert!(names.contains(&"FooComponent"));
        assert!(names.contains(&"BarDirective"));
        assert!(names.contains(&"BazComponent"));
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn namespace_import_member_in_imports() {
        let app = r#"
            import { Component } from '@angular/core';
            import * as shared from './shared';
            @Component({
                selector: 'app',
                standalone: true,
                imports: [shared.FooComponent],
                template: ''
            })
            export class AppComponent {}
        "#;
        let shared = r#"
            import { Component } from '@angular/core';
            @Component({ selector: 'foo', standalone: true, template: '' })
            export class FooComponent {}
        "#;
        let engine = build_engine(
            &[("/app/app.component.ts", app), ("/app/shared.ts", shared)],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert_eq!(names, vec!["FooComponent"]);
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn wildcard_export_with_local_binding_precedence() {
        let app = r#"
            import { Component } from '@angular/core';
            import { MyComponent } from './barrel';
            @Component({
                selector: 'app',
                standalone: true,
                imports: [MyComponent],
                template: ''
            })
            export class AppComponent {}
        "#;
        let barrel = r#"
            export * from './other';
            import { Component } from '@angular/core';
            @Component({ selector: 'my-comp', standalone: true, template: '' })
            export class MyComponent {}
        "#;
        let other = r#"
            import { Component } from '@angular/core';
            @Component({ selector: 'other-comp', standalone: true, template: '' })
            export class OtherComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                ("/app/barrel.ts", barrel),
                ("/app/other.ts", other),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert_eq!(names, vec!["MyComponent"]);
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn spread_of_imported_const_array() {
        let app = r#"
            import { Component } from '@angular/core';
            import { SHARED } from './shared';
            import { BazComponent } from './baz.component';
            @Component({
                selector: 'app',
                standalone: true,
                imports: [...SHARED, BazComponent],
                template: ''
            })
            export class AppComponent {}
        "#;
        let baz = r#"
            import { Component } from '@angular/core';
            @Component({ selector: 'baz', standalone: true, template: '' })
            export class BazComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                ("/app/shared.ts", SHARED_CONSTS),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
                ("/app/baz.component.ts", baz),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert_eq!(
            names.len(),
            3,
            "spread must splice the imported array: {names:?}"
        );
        assert!(names.contains(&"FooComponent"));
        assert!(names.contains(&"BarDirective"));
        // Directly imported here, so this one *is* nameable without a generated import.
        assert!(names.contains(&"BazComponent"));
        let baz = decls
            .iter()
            .find(|d| d.reference.name_in_file(app_id) == "BazComponent")
            .unwrap();
        assert!(baz.reference.is_in_scope_of(app_id));
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn element_access_on_imported_const_array_in_imports() {
        // `SHARED[0]` is one element of the imported array, not the whole of it.
        let app = r#"
            import { Component } from '@angular/core';
            import { SHARED } from './shared';
            import { BazComponent } from './baz.component';
            @Component({
                selector: 'app',
                standalone: true,
                imports: [SHARED[0], BazComponent],
                template: '<lib-foo></lib-foo>'
            })
            export class AppComponent {}
        "#;
        let baz = r#"
            import { Component } from '@angular/core';
            @Component({ selector: 'baz', standalone: true, template: '' })
            export class BazComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                ("/app/shared.ts", SHARED_CONSTS),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
                ("/app/baz.component.ts", baz),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let names: Vec<&str> = component
            .resolved_declarations
            .as_ref()
            .unwrap()
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert_eq!(names, ["FooComponent", "BazComponent"]);
        assert!(component.raw_imports_span.is_none());
    }

    #[test]
    fn element_access_on_imported_const_array_in_ngmodule_imports() {
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { MODULES } from './modules';
            @NgModule({ imports: [MODULES[0]] })
            export class AppModule {}
        "#;
        let modules = r#"
            import { WidgetModule } from './widget.module';
            import { OtherModule } from './other.module';
            export const MODULES = [WidgetModule, OtherModule];
        "#;
        let widget_module = r#"
            import { NgModule, Component } from '@angular/core';
            @Component({ selector: 'widget', template: '' })
            export class WidgetComponent {}
            @NgModule({ declarations: [WidgetComponent], exports: [WidgetComponent] })
            export class WidgetModule {}
        "#;
        let other_module = r#"
            import { NgModule, Component } from '@angular/core';
            @Component({ selector: 'other', template: '' })
            export class OtherComponent {}
            @NgModule({ declarations: [OtherComponent], exports: [OtherComponent] })
            export class OtherModule {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.module.ts", app_module),
                ("/app/modules.ts", modules),
                ("/app/widget.module.ts", widget_module),
                ("/app/other.module.ts", other_module),
            ],
            &[
                "/app/app.module.ts",
                "/app/widget.module.ts",
                "/app/other.module.ts",
            ],
        );
        let ctx = QueryContext::new(engine.clone());
        let scope = block_on_with_timeout(async move {
            let syntax = ctx
                .analyze_file_syntax(ctx.engine.intern_path("/app/app.module.ts"))
                .await;
            let app_module_symbol = syntax.classes[0].reference_id;
            ctx.ngmodule_imports_scope(app_module_symbol).await
        });

        let names: Vec<&str> = scope
            .declarations
            .iter()
            .map(|d| d.reference.name())
            .collect();
        assert_eq!(names, ["WidgetComponent"]);
    }

    /// Every file the evaluation passes through that *binds* the symbol records the name it
    /// binds it under, so a consumer can ask "what do I call this here?" for any of them.
    #[test]
    fn alias_chain_records_every_binding_file() {
        let user = r#"
            import { Component } from '@angular/core';
            import { Something as Thing } from './somewhere';
            @Component({ selector: 'app', standalone: true, imports: [Thing], template: '' })
            export class MyCmp {}
        "#;
        // `Something` is imported *and* re-exported here, so this file binds it too — unlike a
        // bare `export {Something} from './elsewhere'`, which would introduce no binding.
        let somewhere = r#"
            import { Something } from './elsewhere';
            export { Something };
        "#;
        let elsewhere = r#"
            import { Directive } from '@angular/core';
            @Directive({ selector: '[something]', standalone: true })
            export class Something {}
        "#;
        let engine = build_engine(
            &[
                ("/app/user.ts", user),
                ("/app/somewhere.ts", somewhere),
                ("/app/elsewhere.ts", elsewhere),
            ],
            &["/app/user.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/user.ts"))
                .await
        });

        let user_id = engine.intern_path("/app/user.ts");
        let somewhere_id = engine.intern_path("/app/somewhere.ts");
        let elsewhere_id = engine.intern_path("/app/elsewhere.ts");

        let decls = expect_component(&result.classes[0])
            .resolved_declarations
            .as_ref()
            .unwrap();
        assert_eq!(decls.len(), 1, "got: {decls:?}");
        let reference = &decls[0].reference;

        assert_eq!(reference.name, "Something");
        assert_eq!(reference.file, elsewhere_id);
        assert_eq!(reference.name_in_file(user_id), "Thing");
        assert_eq!(reference.name_in_file(somewhere_id), "Something");
        assert_eq!(reference.name_in_file(elsewhere_id), "Something");
        assert_eq!(reference.aliases.len(), 3, "got: {:?}", reference.aliases);

        // The consumer binds it, so it is emitted by name rather than through an import.
        assert!(reference.is_in_scope_of(user_id));
        assert_eq!(decls[0].ref_meta.local_alias.as_deref(), Some("Thing"));
    }

    /// A package barrel may rename on the way out. Importers must use the *barrel's* name,
    /// not the declared one — `lib` has no export called `InternalDir`.
    #[test]
    fn package_barrel_rename_is_the_importable_name() {
        let app = r#"
            import { Component } from '@angular/core';
            import { PublicDir } from 'lib';
            @Component({ selector: 'app', standalone: true, imports: [PublicDir], template: '' })
            export class AppComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                (
                    "/app/node_modules/lib/index.ts",
                    "export { InternalDir as PublicDir } from './deep';",
                ),
                (
                    "/app/node_modules/lib/deep.ts",
                    r#"
                    import { Directive } from '@angular/core';
                    @Directive({ selector: '[pub]', standalone: true })
                    export class InternalDir {}
                "#,
                ),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let decls = expect_component(&result.classes[0])
            .resolved_declarations
            .as_ref()
            .unwrap();
        assert_eq!(decls.len(), 1, "got: {decls:?}");
        let reference = &decls[0].reference;

        // The declaration keeps its real name...
        assert_eq!(reference.name, "InternalDir");
        // ...but an import through the package must ask for what the package exports.
        let owning = reference
            .owning_reference
            .as_ref()
            .expect("reached through a package specifier");
        assert_eq!(owning.specifier(), "lib");
        assert_eq!(owning.export_name(), "PublicDir");
        assert_eq!(reference.export_name(), "PublicDir");

        let importable = decls[0]
            .ref_meta
            .typecheck_import
            .as_ref()
            .expect("declared in another file");
        assert_eq!(importable.specifier, "lib");
        assert_eq!(importable.symbol, "PublicDir");
    }

    /// Same rename, but reached through an NgModule's export scope — the consumer imports only
    /// the module, so the directive is never nameable locally and *must* go through the
    /// package's published name. The package ships declaration files: only an NgModule read
    /// from a `.d.ts` hands its owning module down (`DtsMetadataReader.getNgModuleMetadata`).
    #[test]
    fn package_barrel_rename_through_module_scope() {
        let app = r#"
            import { Component } from '@angular/core';
            import { LibModule } from 'lib';
            @Component({ selector: 'app', standalone: true, imports: [LibModule], template: '' })
            export class AppComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                (
                    "/app/node_modules/lib/index.d.ts",
                    "export { InternalDir as PublicDir, LibModule } from './deep';",
                ),
                (
                    "/app/node_modules/lib/deep.d.ts",
                    r#"
                    import * as i0 from '@angular/core';
                    export declare class InternalDir {
                        static ɵdir: i0.ɵɵDirectiveDeclaration<InternalDir, '[pub]', never, {}, {}, never, never, false, never>;
                    }
                    export declare class LibModule {
                        static ɵmod: i0.ɵɵNgModuleDeclaration<LibModule, [typeof InternalDir], never, [typeof InternalDir]>;
                        static ɵinj: i0.ɵɵInjectorDeclaration<LibModule>;
                    }
                "#,
                ),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });
        let decls = expect_component(&result.classes[0])
            .resolved_declarations
            .as_ref()
            .unwrap();
        let dir = decls
            .iter()
            .find(|d| d.reference.name == "InternalDir")
            .expect("the module's exported directive joins the scope");

        // Not imported by the consumer, so there is no local name to fall back on.
        assert!(dir.ref_meta.local_alias.is_none());
        let importable = dir.ref_meta.typecheck_import.as_ref().unwrap();
        assert_eq!(importable.specifier, "lib");
        assert_eq!(
            importable.symbol, "PublicDir",
            "`lib` publishes no `InternalDir`; importing that name emits a dangling reference"
        );
    }

    /// The same package shipped as sources. A source NgModule's scope keeps the references
    /// resolved in its own file (`LocalModuleScopeRegistry`), so the directive has no owning
    /// module and is imported from its declaring file under its own name, as ngc emits
    /// (`LogicalProjectStrategy`) — not through the specifier the NgModule was reached by.
    #[test]
    fn source_package_module_scope_imports_declaring_file() {
        let app = r#"
            import { Component } from '@angular/core';
            import { LibModule } from 'lib';
            @Component({ selector: 'app', standalone: true, imports: [LibModule], template: '' })
            export class AppComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                (
                    "/app/node_modules/lib/index.ts",
                    "export { InternalDir as PublicDir, LibModule } from './deep';",
                ),
                (
                    "/app/node_modules/lib/deep.ts",
                    r#"
                    import { Directive, NgModule } from '@angular/core';
                    @Directive({ selector: '[pub]', standalone: false })
                    export class InternalDir {}
                    @NgModule({ declarations: [InternalDir], exports: [InternalDir] })
                    export class LibModule {}
                "#,
                ),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });
        let decls = expect_component(&result.classes[0])
            .resolved_declarations
            .as_ref()
            .unwrap();
        let dir = decls
            .iter()
            .find(|d| d.reference.name == "InternalDir")
            .expect("the module's exported directive joins the scope");

        assert!(dir.reference.owning_reference.is_none());
        assert!(dir.ref_meta.local_alias.is_none());
        let importable = dir.ref_meta.typecheck_import.as_ref().unwrap();
        assert_eq!(importable.specifier, "./node_modules/lib/deep");
        assert_eq!(importable.symbol, "InternalDir");
    }

    /// A file that only forwards a symbol cannot name it: recording an alias there would emit
    /// an identifier that does not exist in that file.
    #[test]
    fn bare_reexport_contributes_no_alias() {
        let user = r#"
            import { Component } from '@angular/core';
            import { Something } from './barrel';
            @Component({ selector: 'app', standalone: true, imports: [Something], template: '' })
            export class MyCmp {}
        "#;
        let engine = build_engine(
            &[
                ("/app/user.ts", user),
                ("/app/barrel.ts", "export { Something } from './elsewhere';"),
                (
                    "/app/elsewhere.ts",
                    r#"
                    import { Directive } from '@angular/core';
                    @Directive({ selector: '[something]', standalone: true })
                    export class Something {}
                "#,
                ),
            ],
            &["/app/user.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/user.ts"))
                .await
        });

        let barrel_id = engine.intern_path("/app/barrel.ts");
        let decls = expect_component(&result.classes[0])
            .resolved_declarations
            .as_ref()
            .unwrap();
        let reference = &decls[0].reference;
        assert!(
            !reference.is_in_scope_of(barrel_id),
            "a pure re-export binds nothing: {:?}",
            reference.aliases
        );
    }

    #[test]
    fn const_array_through_barrel_reexports() {
        let app = r#"
            import { Component } from '@angular/core';
            import { SHARED } from './barrel';
            @Component({ selector: 'app', standalone: true, imports: SHARED, template: '' })
            export class AppComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                ("/app/barrel.ts", "export { SHARED } from './inner';"),
                ("/app/inner.ts", "export * from './shared';"),
                ("/app/shared.ts", SHARED_CONSTS),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let ctx_for_deps = ctx.clone();
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert!(names.contains(&"FooComponent"), "got: {names:?}");
        assert!(names.contains(&"BarDirective"), "got: {names:?}");

        // Every barrel traversed must be a recorded dependency (invalidation correctness).
        let deps = ctx_for_deps.dependencies();
        for file in ["/app/barrel.ts", "/app/inner.ts", "/app/shared.ts"] {
            let id = engine.intern_path(file);
            assert!(deps.contains(&id), "{file} must be a recorded dependency");
        }
    }

    #[test]
    fn cyclic_const_imports_terminate_with_fallback() {
        let app = r#"
            import { Component } from '@angular/core';
            import { A } from './a';
            @Component({ selector: 'app', standalone: true, imports: A, template: '' })
            export class AppComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                (
                    "/app/a.ts",
                    "import { B } from './b'; export const A = [B];",
                ),
                (
                    "/app/b.ts",
                    "import { A } from './a'; export const B = [A];",
                ),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        // The whole point versus a query-cached design: cycles terminate instead of
        // deadlocking, and the component keeps its runtime fallback.
        let component = expect_component(&result.classes[0]);
        assert!(component.raw_imports_span.is_some());
    }

    #[test]
    fn module_with_providers_structural_ts() {
        let widget_module = r#"
            import { NgModule } from '@angular/core';
            import { WidgetComponent } from './widget.component';
            @NgModule({ declarations: [WidgetComponent], exports: [WidgetComponent] })
            export class WidgetModule {}
            export class WidgetProviders {
                static forRoot() {
                    return { ngModule: WidgetModule, providers: [] };
                }
            }
        "#;
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { WidgetProviders } from './widget.module';
            @NgModule({ imports: [WidgetProviders.forRoot()] })
            export class AppModule {}
        "#;
        let widget_component = r#"
            import { Component } from '@angular/core';
            @Component({ selector: 'widget', template: '' })
            export class WidgetComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.module.ts", app_module),
                ("/app/widget.module.ts", widget_module),
                ("/app/widget.component.ts", widget_component),
            ],
            &[
                "/app/app.module.ts",
                "/app/widget.module.ts",
                "/app/widget.component.ts",
            ],
        );
        let ctx = QueryContext::new(engine.clone());
        let scope = block_on_with_timeout(async move {
            let syntax = ctx
                .analyze_file_syntax(ctx.engine.intern_path("/app/app.module.ts"))
                .await;
            let app_module_symbol = syntax.classes[0].reference_id;
            ctx.ngmodule_imports_scope(app_module_symbol).await
        });

        // forRoot()'s structural { ngModule: WidgetModule } pulls WidgetModule's exports scope.
        let names: Vec<&str> = scope
            .declarations
            .iter()
            .map(|d| d.reference.name())
            .collect();
        assert!(
            names.contains(&"WidgetComponent"),
            "imports scope must contain the MWP module's exports: {names:?}"
        );
    }

    #[test]
    fn module_with_providers_dts_return_type() {
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { RouterModule } from 'router-lib';
            @NgModule({ imports: [RouterModule.forRoot([])] })
            export class AppModule {}
        "#;
        // Body-less static method whose return type names the module (the `.d.ts` pattern).
        let router_dts = r#"
            import { ModuleWithProviders } from '@angular/core';
            export declare class RouterModule {
                static forRoot(routes: unknown[]): ModuleWithProviders<RouterModule>;
            }
        "#;
        let core_dts = "export declare type ModuleWithProviders<T> = { ngModule: unknown };";
        let engine = build_engine(
            &[
                ("/app/app.module.ts", app_module),
                ("/app/node_modules/router-lib/index.d.ts", router_dts),
                ("/app/node_modules/@angular/core/index.d.ts", core_dts),
            ],
            &["/app/app.module.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let value = block_on_with_timeout(async move {
            let syntax = ctx
                .analyze_file_syntax(ctx.engine.intern_path("/app/app.module.ts"))
                .await;
            let class_syntax = &syntax.classes[0];
            let mut imports = class_syntax
                .as_ng_module()
                .and_then(|m| m.imports.as_ref())
                .expect("imports evaluation must exist")
                .clone();
            imports
                .complete_with(
                    &ctx,
                    crate::analyzer::resolvers::angular_foreign_resolvers(),
                )
                .await;
            imports.raw().clone()
        });

        let ResolvedValue::Array(items) = &value else {
            panic!("expected array, got {value:?}");
        };
        let ResolvedValue::Synthetic(
            crate::evaluator::value::SyntheticValue::ModuleWithProviders { ng_module, .. },
        ) = &items[0]
        else {
            panic!("expected ModuleWithProviders synthetic, got {:?}", items[0]);
        };
        assert_eq!(ng_module.name, "RouterModule");
        let owning = ng_module
            .owning_reference
            .as_ref()
            .expect("the ngModule must stay importable via the package specifier");
        assert_eq!(owning.specifier(), "router-lib");
        assert_eq!(owning.export_name(), "RouterModule");
    }

    /// Evaluate the `imports` of the (only) NgModule in `/app/app.module.ts` to a hole-free
    /// value, the way the NgModule handler does (Angular's foreign-function resolvers
    /// installed).
    fn complete_app_module_imports(files: &[(&str, &str)]) -> ResolvedValue {
        let engine = build_engine(files, &["/app/app.module.ts"]);
        let ctx = QueryContext::new(engine);
        block_on_with_timeout(async move {
            let syntax = ctx
                .analyze_file_syntax(ctx.engine.intern_path("/app/app.module.ts"))
                .await;
            let mut imports = syntax.classes[0]
                .as_ng_module()
                .and_then(|m| m.imports.as_ref())
                .expect("imports evaluation must exist")
                .clone();
            imports
                .complete_with(
                    &ctx,
                    crate::analyzer::resolvers::angular_foreign_resolvers(),
                )
                .await;
            imports.raw().clone()
        })
    }

    /// The `ngModule` class a `ModuleWithProviders`-shaped import entry names, or a panic
    /// describing what the entry evaluated to instead.
    fn mwp_ng_module_name(entry: &ResolvedValue) -> &str {
        match entry.unwrap_named() {
            ResolvedValue::Synthetic(
                crate::evaluator::value::SyntheticValue::ModuleWithProviders { ng_module, .. },
            ) => &ng_module.name,
            ResolvedValue::Map(map) => {
                let Some(ResolvedValue::Reference(ng_module)) =
                    map.get("ngModule").map(ResolvedValue::unwrap_named)
                else {
                    panic!("expected an `ngModule` reference, got {entry:?}");
                };
                &ng_module.name
            }
            other => panic!("expected a ModuleWithProviders entry, got {other:?}"),
        }
    }

    fn expect_array(value: &ResolvedValue) -> &[ResolvedValue] {
        let ResolvedValue::Array(items) = value.unwrap_named() else {
            panic!("expected array, got {value:?}");
        };
        items
    }

    fn collect_dynamic_root_reasons<'v>(
        value: &'v ResolvedValue,
        out: &mut Vec<&'v DynamicReason>,
    ) {
        match value.unwrap_named() {
            ResolvedValue::Dynamic(d) => out.push(&d.root_cause().reason),
            ResolvedValue::Array(items) => {
                for item in items {
                    collect_dynamic_root_reasons(item, out);
                }
            }
            ResolvedValue::Map(map) => {
                for (_, item) in map.iter() {
                    collect_dynamic_root_reasons(item, out);
                }
            }
            _ => {}
        }
    }

    const MWP_CORE_DTS: &str = r#"
        export declare function NgModule(meta: unknown): ClassDecorator;
        export declare interface ModuleWithProviders<T> { ngModule: T; providers?: unknown[]; }
    "#;

    const X_MODULE_WITH_FOR_ROOT: &str = r#"
        import { NgModule, ModuleWithProviders } from '@angular/core';
        @NgModule({})
        export class X {
            static forRoot(): ModuleWithProviders<X> {
                return { ngModule: X, providers: [] };
            }
        }
    "#;

    const MORE_WITH_FOR_ROOT: &str = "import { X } from './x'; export const MORE = [X.forRoot()];";

    #[test]
    fn static_call_reached_on_sibling_paths_resolves_every_occurrence() {
        // `X.forRoot()` is reached twice along sibling (non-cyclic) paths: directly, and
        // through the `MORE` const. Each occurrence must resolve exactly as it would alone.
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { X } from './x';
            import { MORE } from './more';
            @NgModule({ imports: [X.forRoot(), ...MORE] })
            export class AppModule {}
        "#;
        let value = complete_app_module_imports(&[
            ("/app/app.module.ts", app_module),
            ("/app/x.ts", X_MODULE_WITH_FOR_ROOT),
            ("/app/more.ts", MORE_WITH_FOR_ROOT),
            ("/app/node_modules/@angular/core/index.d.ts", MWP_CORE_DTS),
        ]);

        let items = expect_array(&value);
        assert_eq!(items.len(), 2, "got: {value:?}");
        for entry in items {
            assert_eq!(mwp_ng_module_name(entry), "X", "got: {value:?}");
        }
    }

    #[test]
    fn static_call_reached_through_several_spreads_resolves_every_occurrence() {
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { X } from './x';
            import { MORE } from './more';
            import { MORE2 } from './more2';
            @NgModule({ imports: [...MORE, ...MORE2, X.forRoot()] })
            export class AppModule {}
        "#;
        let value = complete_app_module_imports(&[
            ("/app/app.module.ts", app_module),
            ("/app/x.ts", X_MODULE_WITH_FOR_ROOT),
            ("/app/more.ts", MORE_WITH_FOR_ROOT),
            (
                "/app/more2.ts",
                "import { X } from './x'; export const MORE2 = [X.forRoot()];",
            ),
            ("/app/node_modules/@angular/core/index.d.ts", MWP_CORE_DTS),
        ]);

        let items = expect_array(&value);
        assert_eq!(items.len(), 3, "got: {value:?}");
        for entry in items {
            assert_eq!(mwp_ng_module_name(entry), "X", "got: {value:?}");
        }
    }

    #[test]
    fn static_member_reached_on_sibling_paths_resolves_every_occurrence() {
        // The same diamond through a static property (a Member hole, not a Call hole). NgModule
        // `imports` accept nested arrays, so the entries are left unspread.
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { Holder } from './holder';
            import { MORE } from './more';
            @NgModule({ imports: [Holder.MODULES, MORE] })
            export class AppModule {}
        "#;
        let holder = r#"
            import { X } from './x';
            export class Holder {
                static MODULES = [X];
            }
        "#;
        let value = complete_app_module_imports(&[
            ("/app/app.module.ts", app_module),
            ("/app/holder.ts", holder),
            ("/app/x.ts", X_MODULE_WITH_FOR_ROOT),
            (
                "/app/more.ts",
                "import { Holder } from './holder'; export const MORE = [...Holder.MODULES];",
            ),
            ("/app/node_modules/@angular/core/index.d.ts", MWP_CORE_DTS),
        ]);

        let items = expect_array(&value);
        assert_eq!(items.len(), 2, "got: {value:?}");
        for entry in items {
            let [module] = expect_array(entry) else {
                panic!("expected `[X]`, got {value:?}");
            };
            let ResolvedValue::Reference(reference) = module.unwrap_named() else {
                panic!("expected a reference to X, got {value:?}");
            };
            assert_eq!(reference.name, "X", "got: {value:?}");
        }
    }

    #[test]
    fn repeated_static_calls_across_files_are_memoized() {
        // A 40-level diamond chain of static calls stays linear when completed calls are memoized.
        const LEVELS: usize = 40;
        let mut files: Vec<(String, String)> = vec![(
            "/app/app.module.ts".to_string(),
            r#"
                import { NgModule } from '@angular/core';
                import { L0 } from './l0';
                @NgModule({ imports: [L0.a()] })
                export class AppModule {}
            "#
            .to_string(),
        )];
        for i in 0..LEVELS {
            let next = i + 1;
            files.push((
                format!("/app/l{i}.ts"),
                format!(
                    "import {{ L{next} }} from './l{next}';
                     export class L{i} {{
                         static a() {{ return L{next}.a() + L{next}.b(); }}
                         static b() {{ return L{next}.a(); }}
                     }}"
                ),
            ));
        }
        files.push((
            format!("/app/l{LEVELS}.ts"),
            format!(
                "export class L{LEVELS} {{ static a() {{ return 1; }} static b() {{ return 1; }} }}"
            ),
        ));
        files.push((
            "/app/node_modules/@angular/core/index.d.ts".to_string(),
            MWP_CORE_DTS.to_string(),
        ));
        let file_refs: Vec<(&str, &str)> = files
            .iter()
            .map(|(path, source)| (path.as_str(), source.as_str()))
            .collect();

        let value = complete_app_module_imports(&file_refs);

        let (mut a, mut b) = (1.0_f64, 1.0_f64);
        for _ in 0..LEVELS {
            (a, b) = (a + b, a);
        }
        let [ResolvedValue::Number(n)] = expect_array(&value) else {
            panic!("expected [{a}], got {value:?}");
        };
        assert_eq!(*n, a);
    }

    #[test]
    fn genuine_static_call_cycle_still_reports_import_cycle() {
        // `A.m()` calls `B.n()`, which calls `A.m()` again: a real cycle, which must still be
        // cut (and reported as one) rather than recursing until the depth limit.
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { A } from './a';
            @NgModule({ imports: [A.m()] })
            export class AppModule {}
        "#;
        let value = complete_app_module_imports(&[
            ("/app/app.module.ts", app_module),
            (
                "/app/a.ts",
                "import { B } from './b'; export class A { static m() { return [B.n()]; } }",
            ),
            (
                "/app/b.ts",
                "import { A } from './a'; export class B { static n() { return [A.m()]; } }",
            ),
            ("/app/node_modules/@angular/core/index.d.ts", MWP_CORE_DTS),
        ]);

        let mut reasons = Vec::new();
        collect_dynamic_root_reasons(&value, &mut reasons);
        assert!(
            reasons
                .iter()
                .any(|reason| matches!(reason, DynamicReason::ImportCycle)),
            "a genuine member-call cycle must be cut as an ImportCycle, got: {value:?}"
        );
        assert!(
            !reasons
                .iter()
                .any(|reason| matches!(reason, DynamicReason::DepthLimit)),
            "the cycle must be cut before the depth limit, got: {value:?}"
        );
    }

    #[test]
    fn ngmodule_scope_includes_module_reached_on_sibling_paths() {
        // Downstream effect: a single cycle-cut entry used to make the whole `imports` slot
        // unusable, dropping the imported module's exports from the scope.
        let x_module = r#"
            import { NgModule, ModuleWithProviders } from '@angular/core';
            import { FooComponent } from './foo.component';
            @NgModule({ imports: [FooComponent], exports: [FooComponent] })
            export class X {
                static forRoot(): ModuleWithProviders<X> {
                    return { ngModule: X, providers: [] };
                }
            }
        "#;
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { X } from './x';
            import { MORE } from './more';
            @NgModule({ imports: [X.forRoot(), ...MORE] })
            export class AppModule {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.module.ts", app_module),
                ("/app/x.ts", x_module),
                ("/app/more.ts", MORE_WITH_FOR_ROOT),
                ("/app/foo.component.ts", FOO_COMPONENT),
            ],
            &[
                "/app/app.module.ts",
                "/app/x.ts",
                "/app/more.ts",
                "/app/foo.component.ts",
            ],
        );
        let ctx = QueryContext::new(engine.clone());
        let scope = block_on_with_timeout(async move {
            let syntax = ctx
                .analyze_file_syntax(ctx.engine.intern_path("/app/app.module.ts"))
                .await;
            let app_module_symbol = syntax.classes[0].reference_id;
            ctx.ngmodule_imports_scope(app_module_symbol).await
        });

        let names: Vec<&str> = scope
            .declarations
            .iter()
            .map(|d| d.reference.name())
            .collect();
        assert!(
            names.contains(&"FooComponent"),
            "imports scope must contain X's exports: {names:?}"
        );
    }

    fn complete_lib_module_imports(app_module: String) -> ResolvedValue {
        let lib_dts = r#"
            import { ModuleWithProviders } from '@angular/core';
            export declare class LibModule {
                static forRoot(config: unknown): ModuleWithProviders<LibModule>;
                static forChild(name: string, config?: unknown): ModuleWithProviders<LibModule>;
            }
        "#;
        let core_dts = "export declare type ModuleWithProviders<T> = { ngModule: unknown };";
        let engine = build_engine(
            &[
                ("/app/app.module.ts", app_module.as_str()),
                ("/app/node_modules/lib/index.d.ts", lib_dts),
                ("/app/node_modules/@angular/core/index.d.ts", core_dts),
            ],
            &["/app/app.module.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        block_on_with_timeout(async move {
            let syntax = ctx
                .analyze_file_syntax(ctx.engine.intern_path("/app/app.module.ts"))
                .await;
            let mut imports = syntax.classes[0]
                .as_ng_module()
                .and_then(|m| m.imports.as_ref())
                .expect("imports evaluation must exist")
                .clone();
            imports
                .complete_with(
                    &ctx,
                    crate::analyzer::resolvers::angular_foreign_resolvers(),
                )
                .await;
            imports.raw().clone()
        })
    }

    fn assert_all_lib_module_mwps(value: &ResolvedValue, expected_len: usize) {
        let ResolvedValue::Array(items) = value else {
            panic!("expected array, got {value:?}");
        };
        assert_eq!(items.len(), expected_len);
        for (i, item) in items.iter().enumerate() {
            let ResolvedValue::Synthetic(
                crate::evaluator::value::SyntheticValue::ModuleWithProviders { ng_module, .. },
            ) = item
            else {
                panic!("imports[{i}] must be a ModuleWithProviders synthetic, got {item:?}");
            };
            assert_eq!(ng_module.name, "LibModule");
        }
    }

    #[test]
    fn many_mwp_calls_on_same_imported_class() {
        let calls: Vec<String> = (0..48)
            .map(|i| format!("LibModule.forChild('c{i}')"))
            .collect();
        let app_module = format!(
            r#"
            import {{ NgModule }} from '@angular/core';
            import {{ LibModule }} from 'lib';
            @NgModule({{ imports: [LibModule.forRoot({{}}), {}] }})
            export class AppModule {{}}
        "#,
            calls.join(", ")
        );
        let value = complete_lib_module_imports(app_module);
        assert_all_lib_module_mwps(&value, 49);
    }

    #[test]
    fn few_identical_mwp_calls_on_same_imported_class() {
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { LibModule } from 'lib';
            @NgModule({
                imports: [
                    LibModule.forChild('c'),
                    LibModule.forChild('c'),
                    LibModule.forChild('c'),
                    LibModule.forChild('c'),
                ],
            })
            export class AppModule {}
        "#
        .to_string();
        let value = complete_lib_module_imports(app_module);
        assert_all_lib_module_mwps(&value, 4);
    }

    #[test]
    fn ngmodule_array_spread_in_declarations() {
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { FooComponent } from './foo.component';
            import { EXTRA } from './extra';
            @NgModule({ declarations: [FooComponent, ...EXTRA] })
            export class AppModule {}
        "#;
        let extra = r#"
            import { BarDirective } from './bar.directive';
            export const EXTRA = [BarDirective];
        "#;
        let engine = build_engine(
            &[
                ("/app/app.module.ts", app_module),
                ("/app/extra.ts", extra),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
            ],
            &[
                "/app/app.module.ts",
                "/app/foo.component.ts",
                "/app/bar.directive.ts",
            ],
        );
        let ctx = QueryContext::new(engine.clone());
        let scope = block_on_with_timeout(async move {
            let syntax = ctx
                .analyze_file_syntax(ctx.engine.intern_path("/app/app.module.ts"))
                .await;
            let app_module_symbol = syntax.classes[0].reference_id;
            ctx.ngmodule_imports_scope(app_module_symbol).await
        });

        let names: Vec<&str> = scope
            .declarations
            .iter()
            .map(|d| d.reference.name())
            .collect();
        assert!(names.contains(&"FooComponent"), "got: {names:?}");
        assert!(
            names.contains(&"BarDirective"),
            "spread of an imported const array must contribute declarations: {names:?}"
        );
    }

    #[test]
    fn edit_to_referenced_const_file_invalidates_consumer() {
        let engine = build_engine(
            &[
                ("/app/app.component.ts", APP_WITH_SHARED),
                ("/app/shared.ts", SHARED_CONSTS),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
            ],
            &["/app/app.component.ts"],
        );

        // Prime the semantic query.
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });
        assert_eq!(
            expect_component(&result.classes[0])
                .resolved_declarations
                .as_ref()
                .unwrap()
                .len(),
            2
        );

        // The transitively-referenced const file must map back to the consumer's semantic key.
        let app_id = engine.intern_path("/app/app.component.ts");
        let shared_id = engine.intern_path("/app/shared.ts");
        let foo_id = engine.intern_path("/app/foo.component.ts");
        {
            let index = engine.reverse_index.read().unwrap();
            for (label, id) in [("shared.ts", shared_id), ("foo.component.ts", foo_id)] {
                let keys = index.get(&id).unwrap_or_else(|| {
                    panic!("{label} must appear in the reverse index");
                });
                assert!(
                    keys.contains(&QueryKey::AnalyzeFileSemantic(app_id)),
                    "{label} must invalidate the consuming component's semantic query"
                );
            }
        }

        // Edit the const file: drop BarDirective from the shared array.
        let evicted = engine.invalidate_file(Path::new("/app/shared.ts"));
        assert!(evicted.contains(&QueryKey::AnalyzeFileSemantic(app_id)));
        engine.fs.upsert_file(
            PathBuf::from("/app/shared.ts"),
            r#"
                import { FooComponent } from './foo.component';
                export const SHARED = [FooComponent];
            "#
            .to_string(),
        );

        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });
        let decls = expect_component(&result.classes[0])
            .resolved_declarations
            .as_ref()
            .unwrap();
        assert_eq!(decls.len(), 1, "stale cache: edit was not picked up");
        assert_eq!(decls[0].reference.name_in_file(app_id), "FooComponent");
    }

    #[test]
    fn unresolvable_import_keeps_runtime_fallback() {
        let app = r#"
            import { Component } from '@angular/core';
            import { THINGS } from 'not-installed-pkg';
            @Component({ selector: 'app', standalone: true, imports: THINGS, template: '' })
            export class AppComponent {}
        "#;
        let engine = build_engine(
            &[("/app/app.component.ts", app)],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });
        let component = expect_component(&result.classes[0]);
        assert!(
            component.raw_imports_span.is_some(),
            "an unresolvable import must keep the runtime-resolution fallback"
        );
    }

    #[test]
    fn deep_reexport_chain_hits_depth_limit_gracefully() {
        let mut files: Vec<(String, String)> = Vec::new();
        files.push((
            "/app/app.component.ts".to_string(),
            r#"
                import { Component } from '@angular/core';
                import { SHARED } from './hop0';
                @Component({ selector: 'app', standalone: true, imports: SHARED, template: '' })
                export class AppComponent {}
            "#
            .to_string(),
        ));
        for i in 0..70 {
            files.push((
                format!("/app/hop{i}.ts"),
                format!("export {{ SHARED }} from './hop{}';", i + 1),
            ));
        }
        files.push((
            "/app/hop70.ts".to_string(),
            "export const SHARED = [];".to_string(),
        ));
        let file_refs: Vec<(&str, &str)> = files
            .iter()
            .map(|(p, c)| (p.as_str(), c.as_str()))
            .collect();
        let engine = build_engine(&file_refs, &["/app/app.component.ts"]);
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });
        // 70 hops exceeds MAX_FILE_DEPTH: must terminate and keep the fallback.
        let component = expect_component(&result.classes[0]);
        assert!(component.raw_imports_span.is_some());
    }

    /// Evaluate the initializer of `export const <name>` in `file`, then complete it across
    /// files the way the analyzer does.
    fn evaluate_exported_const(
        engine: Arc<QueryEngine<OverlayFileSystem>>,
        file: &'static str,
        name: &'static str,
    ) -> ResolvedValue {
        let ctx = QueryContext::new(engine);
        block_on_with_timeout(async move {
            let file_id = ctx.engine.intern_path(file);
            let parsed = ctx.parse_file(file_id).await;
            let probe = {
                let guard = parsed.lock().unwrap();
                let dep = guard.borrow_dependent();
                let symbol_id = dep
                    .semantic
                    .scoping()
                    .get_root_binding(name.into())
                    .expect("exported const binding");
                let import_map = extract_import_map(&dep.module_record);
                let input = EvalInput {
                    semantic: &dep.semantic,
                    file: file_id,
                    import_map: &import_map,
                    mode: EvalMode::Semantic,
                    env: &ResolvedEnv::new(),
                    foreign: &[],
                };
                evaluate_symbol_declaration(symbol_id, &input)
            };
            evaluate_value_completely(&ctx, &probe, &[]).await
        })
    }

    /// `ValueReference::span` is a byte span into the declaring file (the interpreter reuses it
    /// as an oxc span there), so a class reached across files must not inherit the UTF-16 wire
    /// `nameSpan` of its registration. Non-ASCII text ahead of the class is what makes the two
    /// units diverge.
    #[test]
    fn cross_file_class_reference_span_is_a_byte_span() {
        const PREFIX: &str = "// © ünïcode 🎉\n";
        let lib_dts = format!(
            "{PREFIX}import * as i0 from '@angular/core';\nexport declare class LibDir {{\n  static ɵdir: i0.ɵɵDirectiveDeclaration<LibDir, \"[lib]\", never, {{}}, {{}}, never, never, true, never>;\n}}\n"
        );
        let local_ts = format!(
            "{PREFIX}import {{ Directive }} from '@angular/core';\n@Directive({{ selector: '[local]', standalone: true }})\nexport class LocalDir {{}}\n"
        );
        let deps = "import { LibDir } from './lib';\nimport { LocalDir } from './local';\nexport const LIB = LibDir;\nexport const LOCAL = LocalDir;\n";
        let engine = build_engine(
            &[
                ("/app/deps.ts", deps),
                ("/app/lib.d.ts", &lib_dts),
                ("/app/local.ts", &local_ts),
            ],
            &["/app/deps.ts"],
        );

        for (export, source, class_name) in [
            ("LIB", &lib_dts, "LibDir"),
            ("LOCAL", &local_ts, "LocalDir"),
        ] {
            let ResolvedValue::Reference(reference) =
                evaluate_exported_const(engine.clone(), "/app/deps.ts", export)
            else {
                panic!("{export} should resolve to a class reference");
            };
            assert_eq!(reference.name, class_name);
            assert_eq!(
                &source[reference.span.start as usize..reference.span.end as usize],
                class_name,
                "span {:?} of {class_name} must be a byte span",
                reference.span
            );
        }
    }

    const MORE_CONSTS: &str = r#"
        import { BarDirective } from './bar.directive';
        export const MORE = [BarDirective];
    "#;

    const BAZ_COMPONENT: &str = r#"
        import { Component } from '@angular/core';
        @Component({ selector: 'baz', standalone: true, template: '' })
        export class BazComponent {}
    "#;

    /// Analyze a standalone `AppComponent` whose `imports` is the `SHARED` binding that
    /// `app_import` brings in from `./shared`, and return the names of its resolved
    /// dependencies (`None` when the evaluation fell back to runtime resolution).
    fn standalone_imports_from_shared(app_import: &str, shared: &str) -> Option<Vec<String>> {
        let app = format!(
            r#"
            import {{ Component }} from '@angular/core';
            {app_import}
            @Component({{ selector: 'app', standalone: true, imports: SHARED, template: '' }})
            export class AppComponent {{}}
        "#
        );
        let engine = build_engine(
            &[
                ("/app/app.component.ts", &app),
                ("/app/shared.ts", shared),
                ("/app/more.ts", MORE_CONSTS),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
                ("/app/baz.component.ts", BAZ_COMPONENT),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });
        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        if component.raw_imports_span.is_some() {
            return None;
        }
        let decls = component.resolved_declarations.as_ref()?;
        Some(
            decls
                .iter()
                .map(|d| d.reference.name_in_file(app_id).to_string())
                .collect(),
        )
    }

    fn foo_and_bar() -> Option<Vec<String>> {
        Some(vec!["FooComponent".to_string(), "BarDirective".to_string()])
    }

    /// A value that needs a re-run (the spread of an imported array is a non-transparent
    /// hole) exported under its own name: the baseline the aliased forms below must match.
    #[test]
    fn rerun_of_directly_exported_declaration() {
        let names = standalone_imports_from_shared(
            "import { SHARED } from './shared';",
            r#"
                import { FooComponent } from './foo.component';
                import { MORE } from './more';
                export const SHARED = [FooComponent, ...MORE];
            "#,
        );
        assert_eq!(names, foo_and_bar());
    }

    /// `export { LOCAL as SHARED }`: the re-run must evaluate the declaration the chase
    /// resolved (`LOCAL`), not look up an export named after the local binding.
    #[test]
    fn rerun_of_aliased_local_export() {
        let names = standalone_imports_from_shared(
            "import { SHARED } from './shared';",
            r#"
                import { FooComponent } from './foo.component';
                import { MORE } from './more';
                const LOCAL = [FooComponent, ...MORE];
                export { LOCAL as SHARED };
            "#,
        );
        assert_eq!(names, foo_and_bar());
    }

    /// Another export named like the local binding must not redirect the re-run to that
    /// other declaration (`export { a as SHARED, b as a }`).
    #[test]
    fn rerun_of_aliased_export_ignores_export_named_like_the_local() {
        let names = standalone_imports_from_shared(
            "import { SHARED } from './shared';",
            r#"
                import { FooComponent } from './foo.component';
                import { BazComponent } from './baz.component';
                import { MORE } from './more';
                const a = [FooComponent, ...MORE];
                const b = [BazComponent];
                export { a as SHARED, b as a };
            "#,
        );
        assert_eq!(names, foo_and_bar());
    }

    /// `export default LOCAL` binds no export named `LOCAL` either.
    #[test]
    fn rerun_of_default_exported_identifier() {
        let names = standalone_imports_from_shared(
            "import SHARED from './shared';",
            r#"
                import { FooComponent } from './foo.component';
                import { MORE } from './more';
                const LOCAL = [FooComponent, ...MORE];
                export default LOCAL;
            "#,
        );
        assert_eq!(names, foo_and_bar());
    }

    /// The same aliased export consumed by an NgModule.
    #[test]
    fn rerun_of_aliased_local_export_in_ngmodule_declarations() {
        let app_module = r#"
            import { NgModule } from '@angular/core';
            import { EXTRA } from './extra';
            @NgModule({ declarations: EXTRA })
            export class AppModule {}
        "#;
        let extra = r#"
            import { FooComponent } from './foo.component';
            import { MORE } from './more';
            const LOCAL = [FooComponent, ...MORE];
            export { LOCAL as EXTRA };
        "#;
        let engine = build_engine(
            &[
                ("/app/app.module.ts", app_module),
                ("/app/extra.ts", extra),
                ("/app/more.ts", MORE_CONSTS),
                ("/app/foo.component.ts", FOO_COMPONENT),
                ("/app/bar.directive.ts", BAR_DIRECTIVE),
            ],
            &[
                "/app/app.module.ts",
                "/app/foo.component.ts",
                "/app/bar.directive.ts",
            ],
        );
        let ctx = QueryContext::new(engine.clone());
        let scope = block_on_with_timeout(async move {
            let syntax = ctx
                .analyze_file_syntax(ctx.engine.intern_path("/app/app.module.ts"))
                .await;
            let app_module_symbol = syntax.classes[0].reference_id;
            ctx.ngmodule_imports_scope(app_module_symbol).await
        });

        let names: Vec<&str> = scope
            .declarations
            .iter()
            .map(|d| d.reference.name())
            .collect();
        assert!(names.contains(&"FooComponent"), "got: {names:?}");
        assert!(names.contains(&"BarDirective"), "got: {names:?}");
    }

    const DEFAULT_A: &str = r#"
        import { Component } from '@angular/core';
        @Component({ selector: 'a-cmp', standalone: true, template: '' })
        export class A {}
    "#;

    /// Resolve `import <local> from '<specifier>'` as seen from `/app/app.ts`.
    fn resolve_default_import(files: &[(&str, &str)], specifier: &str) -> ResolvedValue {
        let engine = build_engine(files, &["/app/app.ts"]);
        let ctx = QueryContext::new(engine.clone());
        let unresolved = UnresolvedReference {
            importer: engine.intern_path("/app/app.ts"),
            specifier: specifier.to_string(),
            symbol: ImportKind::Default,
            local_name: Some("SHARED".to_string()),
            is_namespace_member: false,
        };
        block_on_with_timeout(async move {
            let mut state = ResolutionState::default();
            resolve_import(&ctx, unresolved, Span::default(), &mut state, 0, &[]).await
        })
    }

    fn array_reference_names(value: &ResolvedValue) -> Vec<String> {
        let ResolvedValue::Array(items) = value.unwrap_named() else {
            panic!("expected an array, got {value:?}");
        };
        items
            .iter()
            .map(|item| {
                let ResolvedValue::Reference(reference) = item.unwrap_named() else {
                    panic!("expected a reference, got {item:?}");
                };
                reference.name.clone()
            })
            .collect()
    }

    #[test]
    fn default_export_expression_resolves_in_declaring_file() {
        let value = resolve_default_import(
            &[
                ("/app/app.ts", "import SHARED from './shared';"),
                (
                    "/app/shared.ts",
                    "import { A } from './a'; export default [A];",
                ),
                ("/app/a.ts", DEFAULT_A),
            ],
            "./shared",
        );
        assert_eq!(array_reference_names(&value), vec!["A"]);
    }

    #[test]
    fn default_export_expression_through_reexport_chain() {
        let shared = "import { A } from './a'; export default [A];";
        for barrel in [
            "export { default } from './shared';",
            "export { default as default } from './shared';",
            "import S from './shared'; export default S;",
        ] {
            let value = resolve_default_import(
                &[
                    ("/app/app.ts", "import SHARED from './barrel';"),
                    ("/app/barrel.ts", barrel),
                    ("/app/shared.ts", shared),
                    ("/app/a.ts", DEFAULT_A),
                ],
                "./barrel",
            );
            assert_eq!(array_reference_names(&value), vec!["A"], "barrel: {barrel}");
        }
    }

    #[test]
    fn default_export_is_not_forwarded_through_export_star() {
        let value = resolve_default_import(
            &[
                ("/app/app.ts", "import SHARED from './shared';"),
                ("/app/shared.ts", "export * from './c';"),
                ("/app/c.ts", "export default class C {}"),
            ],
            "./shared",
        );
        let ResolvedValue::Dynamic(dynamic) = &value else {
            panic!("`export *` must not forward `default`, got {value:?}");
        };
        assert!(
            matches!(dynamic.reason, DynamicReason::UnresolvedImport(_)),
            "got {:?}",
            dynamic.reason
        );
    }

    #[test]
    fn own_default_export_wins_over_export_star() {
        let value = resolve_default_import(
            &[
                ("/app/app.ts", "import SHARED from './shared';"),
                (
                    "/app/shared.ts",
                    "import { A } from './a'; export default [A]; export * from './c';",
                ),
                ("/app/a.ts", DEFAULT_A),
                ("/app/c.ts", "export default class C {}"),
            ],
            "./shared",
        );
        assert_eq!(array_reference_names(&value), vec!["A"]);
    }

    #[test]
    fn default_export_bindings_still_resolve() {
        const DECORATED_DEFAULT: &str = r#"
            import { Directive } from '@angular/core';
            @Directive({ selector: '[x]', standalone: true })
            export default class X {}
        "#;
        const DECORATED_ALIAS: &str = r#"
            import { Directive } from '@angular/core';
            @Directive({ selector: '[x]', standalone: true })
            class X {}
            export { X as default };
        "#;
        for shared in [DECORATED_DEFAULT, DECORATED_ALIAS] {
            let value = resolve_default_import(
                &[
                    ("/app/app.ts", "import SHARED from './shared';"),
                    ("/app/shared.ts", shared),
                ],
                "./shared",
            );
            let ResolvedValue::Reference(reference) = value.unwrap_named() else {
                panic!("{shared}: expected a reference, got {value:?}");
            };
            assert_eq!(reference.name, "X", "{shared}");
            assert!(reference.is_default_export, "{shared}");
        }

        let value = resolve_default_import(
            &[
                ("/app/app.ts", "import SHARED from './shared';"),
                ("/app/shared.ts", "export default function X() {}"),
            ],
            "./shared",
        );
        let ResolvedValue::Reference(reference) = value.unwrap_named() else {
            panic!("expected a reference, got {value:?}");
        };
        assert_eq!(reference.name, "X");

        let value = resolve_default_import(
            &[
                ("/app/app.ts", "import SHARED from './shared';"),
                (
                    "/app/shared.ts",
                    "import { A } from './a'; const L = [A]; export default L;",
                ),
                ("/app/a.ts", DEFAULT_A),
            ],
            "./shared",
        );
        assert_eq!(array_reference_names(&value), vec!["A"]);
    }

    #[test]
    fn default_exported_array_in_standalone_imports() {
        let app = r#"
            import { Component } from '@angular/core';
            import SHARED from './shared';
            @Component({ selector: 'app', standalone: true, imports: SHARED, template: '' })
            export class AppComponent {}
        "#;
        let engine = build_engine(
            &[
                ("/app/app.component.ts", app),
                (
                    "/app/shared.ts",
                    "import { A } from './a'; export default [A];",
                ),
                ("/app/a.ts", DEFAULT_A),
            ],
            &["/app/app.component.ts"],
        );
        let ctx = QueryContext::new(engine.clone());
        let result = block_on_with_timeout(async move {
            ctx.analyze_file_semantic(ctx.engine.intern_path("/app/app.component.ts"))
                .await
        });

        let app_id = engine.intern_path("/app/app.component.ts");
        let component = expect_component(&result.classes[0]);
        let decls = component.resolved_declarations.as_ref().unwrap();
        let names: Vec<&str> = decls
            .iter()
            .map(|d| d.reference.name_in_file(app_id))
            .collect();
        assert_eq!(names, vec!["A"]);
        assert!(
            component.raw_imports_span.is_none(),
            "fully evaluated imports must clear the runtime fallback"
        );
    }
}
