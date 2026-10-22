use std::collections::{HashMap, HashSet};

use oxc_ast::ast::{Class, ClassElement, Expression};
use oxc_ast_visit::Visit;
use oxc_semantic::Semantic;
use oxc_span::Span;

use super::class_data::{ClassData, DecoratorData, InjectableData, ValueIssue};
use super::imports::AngularImports;
use super::utils::{extract_property_key, get_canonical_decorator_name};
use crate::evaluator::value::{DeclKind, ValueReference};
use crate::evaluator::{evaluate_expression, EvalInput, Resolved, ResolvedValue};
use crate::query::{FileId, QueryCtx, ReferenceId};
use crate::types::analysis::Reference;
use crate::{DeclarationTuple, ResourceResolverFs};

const INJECTABLE_REGISTERING_DECORATORS: [&str; 5] =
    ["Component", "Directive", "Pipe", "Injectable", "NgModule"];

#[derive(Clone, Debug)]
pub struct ProvidersData {
    pub resolved: Resolved<Vec<Reference>>,
    identifier_spans: Vec<(String, Span)>,
}

impl ProvidersData {
    pub(crate) fn from_expression<'a>(expr: &Expression<'a>, eval: &EvalInput<'a, '_>) -> Self {
        let mut identifiers = IdentifierSpans::default();
        identifiers.visit_expression(expr);
        Self {
            resolved: Resolved::from_syntax(evaluate_expression(expr, eval), eval.file),
            identifier_spans: identifiers.0,
        }
    }

    /// The first identifier in the expression by which `file` names `reference`.
    fn identifier_span_of(&self, reference: &ValueReference, file: FileId) -> Option<Span> {
        let local_name = if reference.file == file {
            reference.name.as_str()
        } else {
            reference
                .aliases
                .iter()
                .find(|(alias_file, _)| *alias_file == file)
                .map(|(_, name)| name.as_str())?
        };
        self.identifier_spans
            .iter()
            .find(|(name, _)| name == local_name)
            .map(|(_, span)| *span)
    }
}

#[derive(Default)]
struct IdentifierSpans(Vec<(String, Span)>);

impl<'a> Visit<'a> for IdentifierSpans {
    fn visit_identifier_reference(&mut self, ident: &oxc_ast::ast::IdentifierReference<'a>) {
        self.0.push((ident.name.to_string(), ident.span));
    }

    fn visit_ts_type(&mut self, _ty: &oxc_ast::ast::TSType<'a>) {}
}

#[derive(Clone, Debug)]
pub struct ClassDiFacts {
    pub reference_id: ReferenceId,
    pub class_name: String,
    pub is_injectable: bool,
    pub ctor_param_count: Option<usize>,
    pub ctor_deps_invalid: bool,
    pub super_class: Option<DeclarationTuple>,
}

/// Facts for a `.ts` class.
pub(crate) fn ts_class_di_facts<'a>(
    class: &Class<'a>,
    reference_id: ReferenceId,
    semantic: &Semantic<'a>,
    angular_imports: &AngularImports,
    super_class: Option<DeclarationTuple>,
    ctor_params_di: Option<&[super::CtorParamDi]>,
) -> Option<ClassDiFacts> {
    let class_name = class.id.as_ref()?.name.to_string();
    let is_injectable = class.decorators.iter().any(|decorator| {
        get_canonical_decorator_name(decorator, semantic, angular_imports)
            .is_some_and(|name| INJECTABLE_REGISTERING_DECORATORS.contains(&name))
    });
    Some(ClassDiFacts {
        reference_id,
        class_name,
        is_injectable,
        ctor_param_count: super::constructor_param_count(class, false),
        ctor_deps_invalid: ctor_params_di
            .is_some_and(|params| params.iter().any(|param| param.missing_token().is_some())),
        super_class,
    })
}

pub(crate) fn dts_class_di_facts(
    class: &Class<'_>,
    reference_id: ReferenceId,
    super_class: Option<DeclarationTuple>,
) -> Option<ClassDiFacts> {
    let class_name = class.id.as_ref()?.name.to_string();
    let is_injectable = class.body.body.iter().any(|element| {
        let ClassElement::PropertyDefinition(prop) = element else {
            return false;
        };
        prop.r#static
            && matches!(
                extract_property_key(&prop.key).as_deref(),
                Some("ɵprov" | "ɵfac")
            )
    });
    Some(ClassDiFacts {
        reference_id,
        class_name,
        is_injectable,
        ctor_param_count: super::constructor_param_count(class, true),
        // `.d.ts` constructors lack the `@Inject()` metadata to tell, so ngtsc accepts them.
        ctor_deps_invalid: false,
        super_class,
    })
}

pub(crate) fn index_di_facts(facts: Vec<ClassDiFacts>) -> HashMap<String, ClassDiFacts> {
    facts
        .into_iter()
        .map(|facts| (facts.class_name.clone(), facts))
        .collect()
}

/// The facts of the class `decl` names from `module_file`, following re-exports.
async fn resolve_di_facts<Fs: ResourceResolverFs + Clone + 'static>(
    decl: &DeclarationTuple,
    module_file: &std::path::Path,
    ctx: &QueryCtx<Fs>,
) -> Option<ClassDiFacts> {
    let mut visited = HashSet::new();
    let Ok(Some(resolved)) = crate::evaluator::cross_file::cross_file_resolve(
        ctx,
        module_file,
        decl.import_source.as_deref(),
        decl.export_name().to_owned(),
        &mut visited,
    )
    .await
    else {
        return None;
    };
    let decl_file_id = ctx.engine.intern_path(&resolved.file_path);
    let syntax = ctx.analyze_file_syntax(decl_file_id).await;
    let parsed = ctx.parse_file(decl_file_id).await;
    let guard = parsed.lock().unwrap();
    let symbol_name = guard
        .borrow_dependent()
        .semantic
        .scoping()
        .symbol_name(resolved.symbol_id);
    syntax.di_facts.get(symbol_name).cloned()
}

/// The facts of the class a reference points at.
async fn referenced_di_facts<Fs: ResourceResolverFs + Clone + 'static>(
    reference: &ValueReference,
    ctx: &QueryCtx<Fs>,
) -> Option<ClassDiFacts> {
    ctx.analyze_file_syntax(reference.file)
        .await
        .di_facts
        .get(&reference.name)
        .cloned()
}

/// The constructor a class without one of its own inherits.
pub struct InheritedCtor {
    /// The nearest base class declaring a constructor.
    pub base: ClassDiFacts,
    pub param_count: usize,
}

/// Walk the `extends` chain of a class without a constructor to the first base class declaring
/// one; `None` when the class has its own constructor, no base declares one, or the chain
/// cannot be followed (a dynamic `extends` expression or an unresolvable import), which ngtsc
/// also leaves alone.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/common/src/diagnostics.ts#L405-L455
pub async fn find_inherited_ctor<Fs: ResourceResolverFs + Clone + 'static>(
    facts: &ClassDiFacts,
    ctx: &QueryCtx<Fs>,
) -> Option<InheritedCtor> {
    if facts.ctor_param_count.is_some() {
        return None;
    }
    let mut visited = HashSet::from([facts.reference_id]);
    let mut current = facts.clone();
    loop {
        let super_decl = current.super_class.as_ref()?;
        let module_file = ctx.engine.lookup_path(current.reference_id.file);
        let base = resolve_di_facts(super_decl, &module_file, ctx).await?;
        if !visited.insert(base.reference_id) {
            return None;
        }
        if let Some(param_count) = base.ctor_param_count {
            return Some(InheritedCtor { base, param_count });
        }
        current = base;
    }
}

impl ClassData {
    /// The handler kinds whose `resolve` runs ngtsc's `checkInheritanceOfInjectable` for this
    /// class: directives and components always, injectables unless the decorator supplies
    /// the instance another way (`requiresValidCtor`). Pipes never do.
    /// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/src/injectable.ts#L418-L425
    fn inherited_ctor_checked_kinds(&self) -> Vec<&'static str> {
        let mut kinds = Vec::new();
        let injectable = match &self.decorator {
            DecoratorData::Component(c) => {
                kinds.push("Component");
                c.directive.injectable.as_ref()
            }
            DecoratorData::Directive(d) => {
                kinds.push("Directive");
                d.injectable.as_ref()
            }
            DecoratorData::Pipe(p) => p.injectable.as_ref(),
            DecoratorData::NgModule(m) => m.injectable.as_ref(),
            DecoratorData::Injectable(i) => Some(i),
            DecoratorData::Service(_) => None,
        };
        if injectable.is_some_and(InjectableData::requires_valid_ctor) {
            kinds.push("Injectable");
        }
        kinds
    }

    /// Stage 2: the diagnostics for the constructor this class inherits — NG2006 when it comes
    /// from an undecorated class and NG2016 when its parameters are not valid for DI
    /// (`checkInheritanceOfInjectable`), and NG2028 when an `@Service` class inherits
    /// constructor parameters (`getDependencyInjectionDiagnostics`).
    /// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/common/src/diagnostics.ts#L360-L397
    /// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/src/service.ts#L278-L309
    pub(crate) async fn inherited_ctor_issues<Fs: ResourceResolverFs + Clone + 'static>(
        &self,
        facts: Option<&ClassDiFacts>,
        ctx: &QueryCtx<Fs>,
    ) -> Vec<ValueIssue> {
        let kinds = self.inherited_ctor_checked_kinds();
        let is_service = self.service_data().is_some();
        if kinds.is_empty() && !is_service {
            return Vec::new();
        }
        let (Some(facts), Some(name_span), Some(class_name)) =
            (facts, self.name_span, self.class_name.as_deref())
        else {
            return Vec::new();
        };
        let Some(inherited) = find_inherited_ctor(facts, ctx).await else {
            return Vec::new();
        };
        if inherited.param_count == 0 {
            return Vec::new();
        }
        let mut issues = Vec::new();
        if is_service {
            issues.push(ValueIssue::service_constructor_di(name_span));
        }
        let base = &inherited.base;
        let issue: fn(Span, &str, &str, &str) -> ValueIssue = if !base.is_injectable {
            ValueIssue::inherits_undecorated_ctor
        } else if base.ctor_deps_invalid
            && ctx.engine.strict_injection_parameters
            && !self.is_abstract
        {
            ValueIssue::inherits_invalid_ctor
        } else {
            return issues;
        };
        for kind in kinds {
            issues.push(issue(name_span, class_name, &base.class_name, kind));
        }
        issues
    }

    /// Stage 2: NG2005 for each class in this class's `providers`/`viewProviders` that DI would
    /// have to construct through a factory it does not have
    /// (`resolveProvidersRequiringFactory` + `getProviderDiagnostics`).
    /// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L337-L385
    pub(crate) async fn undecorated_provider_issues<Fs: ResourceResolverFs + Clone + 'static>(
        &self,
        ctx: &QueryCtx<Fs>,
    ) -> Vec<ValueIssue> {
        let provider_lists: Vec<(&ProvidersData, Option<Span>)> = match &self.decorator {
            DecoratorData::Component(c) => [
                (c.directive.providers.as_ref(), c.directive.providers_span),
                (c.view_providers.as_ref(), c.view_providers_span),
            ]
            .into_iter()
            .filter_map(|(providers, span)| Some((providers?, span)))
            .collect(),
            DecoratorData::Directive(d) => d
                .providers
                .as_ref()
                .map(|providers| (providers, d.providers_span))
                .into_iter()
                .collect(),
            DecoratorData::NgModule(m) => m
                .providers
                .as_ref()
                .map(|providers| (providers, m.providers_span))
                .into_iter()
                .collect(),
            _ => Vec::new(),
        };

        let mut issues = Vec::new();
        for (providers, providers_span) in provider_lists {
            let mut entries = Vec::new();
            collect_provider_classes(providers.resolved.raw(), None, &mut entries);
            for (reference, named_span) in entries {
                // ngtsc skips `.d.ts` classes here outright (a g3 compatibility measure).
                if crate::utils::is_dts(&ctx.engine.lookup_path(reference.file)) {
                    continue;
                }
                let Some(facts) = referenced_di_facts(reference, ctx).await else {
                    continue;
                };
                if facts.is_injectable || !facts.ctor_param_count.is_some_and(|count| count > 0) {
                    continue;
                }
                let Some(span) = named_span
                    .or_else(|| providers.identifier_span_of(reference, self.reference_id.file))
                    .or(providers_span)
                else {
                    continue;
                };
                issues.push(ValueIssue::undecorated_provider(span, &facts.class_name));
            }
        }
        issues
    }
}

/// The classes a `providers` value instantiates: direct class references and `useClass`
/// targets without explicit `deps`, through nested arrays.
fn collect_provider_classes<'v>(
    value: &'v ResolvedValue,
    named_span: Option<Span>,
    out: &mut Vec<(&'v ValueReference, Option<Span>)>,
) {
    match value {
        ResolvedValue::Named { span, value, .. } => {
            collect_provider_classes(value, Some(*span), out);
        }
        ResolvedValue::Array(items) => {
            for item in items {
                collect_provider_classes(item, None, out);
            }
        }
        ResolvedValue::Reference(reference)
            if reference.kind == DeclKind::Class && reference.member.is_none() =>
        {
            out.push((reference, named_span));
        }
        ResolvedValue::Map(map) if !map.contains_key("deps") => {
            if let Some(use_class) = map.get("useClass") {
                collect_provider_classes(use_class, None, out);
            }
        }
        _ => {}
    }
}
