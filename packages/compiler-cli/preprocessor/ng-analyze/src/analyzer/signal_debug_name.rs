//! Finds signal-creating calls that should get an implicit `debugName` (the variable or property
//! they're assigned to), for Angular DevTools. The TS emitter splices the recorded insertions in
//! (`insertSignalDebugNames` in `src/processor.ts`).
//!
//! https://github.com/angular/angular/blob/5b525f9/packages/compiler-cli/src/ngtsc/transform/src/implicit_signal_debug_name_transform.ts

use oxc_ast::ast::{
    AccessorProperty, Argument, AssignmentExpression, AssignmentOperator, AssignmentTarget,
    CallExpression, Expression, ExpressionStatement, IdentifierReference, ObjectExpression,
    ObjectPropertyKind, Program, PropertyDefinition, PropertyKey, VariableDeclarator,
};
use oxc_ast_visit::{walk, Visit};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

/// Where one `debugName` goes, as a byte offset.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct SignalDebugNameInsertion {
    pub position: u32,
    /// Source text of the name, so a quoted key keeps its quotes.
    pub debug_name: String,
    pub kind: SignalDebugNameInsertionKind,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SignalDebugNameInsertionKind {
    /// Append a spread argument, at the end of the last argument (or before `)`).
    Arguments {
        /// Needs a leading `, `.
        has_arguments: bool,
        /// Pass `undefined` for the initial value first.
        prepend_undefined: bool,
    },
    /// Spread into the options object literal, just after its `{`.
    Options {
        /// Needs a trailing `, `.
        has_properties: bool,
    },
}

/// Every signal-creating call in `program` that gets a `debugName`. A separate walk because
/// candidates can be anywhere in the file, not only in decorated classes.
pub fn collect_signal_debug_names<'a>(
    program: &Program<'a>,
    semantic: &Semantic<'a>,
    source_text: &str,
) -> Vec<SignalDebugNameInsertion> {
    // Cheap bail-out: without an Angular import there can be no candidates.
    if !imports_signal_package(program) {
        return Vec::new();
    }
    let mut collector = SignalDebugNameCollector {
        semantic,
        source_text,
        insertions: Vec::new(),
    };
    collector.visit_program(program);
    collector.insertions
}

/// Whether `program` imports from `@angular/core` or `@angular/common` (or their entry points).
fn imports_signal_package(program: &Program<'_>) -> bool {
    program.body.iter().any(|stmt| {
        let oxc_ast::ast::Statement::ImportDeclaration(decl) = stmt else {
            return false;
        };
        let specifier = decl.source.value.as_str();
        is_package_or_entry_point(specifier, crate::utils::ANGULAR_CORE)
            || is_package_or_entry_point(specifier, "@angular/common")
    })
}

/// `specifier` is `package` or `package/...`.
fn is_package_or_entry_point(specifier: &str, package: &str) -> bool {
    specifier
        .strip_prefix(package)
        .is_some_and(|rest| rest.is_empty() || rest.starts_with('/'))
}

/// The package a signal function must be imported from, keyed by its *local* name: so
/// `import {signal as s}` is not recognized, but `import {computed as signal}` is.
fn package_of_signal_function(local_name: &str) -> Option<&'static str> {
    match local_name {
        "signal" | "computed" | "linkedSignal" | "input" | "model" | "viewChild"
        | "viewChildren" | "contentChild" | "contentChildren" | "effect" | "afterRenderEffect"
        | "resource" => Some("@angular/core"),
        "httpResource" => Some("@angular/common"),
        _ => None,
    }
}

struct SignalDebugNameCollector<'s, 'a> {
    semantic: &'s Semantic<'a>,
    source_text: &'s str,
    insertions: Vec<SignalDebugNameInsertion>,
}

// A candidate's children are never visited, even if it ends up not being rewritten, so a signal
// nested in another candidate's initializer gets no name.
impl<'a> Visit<'a> for SignalDebugNameCollector<'_, 'a> {
    fn visit_variable_declarator(&mut self, decl: &VariableDeclarator<'a>) {
        let Some(call) = signal_call(decl.init.as_ref()) else {
            walk::walk_variable_declarator(self, decl);
            return;
        };
        // The binding as written, destructuring patterns included.
        let name = decl.id.span().source_text(self.source_text);
        self.record(call, name.to_string());
    }

    fn visit_property_definition(&mut self, prop: &PropertyDefinition<'a>) {
        let Some(call) = signal_call(prop.value.as_ref()) else {
            walk::walk_property_definition(self, prop);
            return;
        };
        let name = self.property_key_text(&prop.key, prop.computed);
        self.record(call, name);
    }

    /// `accessor x = signal(0)`.
    fn visit_accessor_property(&mut self, prop: &AccessorProperty<'a>) {
        let Some(call) = signal_call(prop.value.as_ref()) else {
            walk::walk_accessor_property(self, prop);
            return;
        };
        let name = self.property_key_text(&prop.key, prop.computed);
        self.record(call, name);
    }

    /// `<object>.<name> = <call>;`
    fn visit_expression_statement(&mut self, stmt: &ExpressionStatement<'a>) {
        let Some((call, name)) = property_assignment_signal_call(&stmt.expression) else {
            walk::walk_expression_statement(self, stmt);
            return;
        };
        self.record(call, name);
    }
}

impl<'a> SignalDebugNameCollector<'_, 'a> {
    /// The key as written, quotes included.
    fn property_key_text(&self, key: &PropertyKey<'a>, computed: bool) -> String {
        let text = key.span().source_text(self.source_text);
        if !computed {
            return text.to_string();
        }
        // TODO(parity): oxc drops the brackets' span, so whitespace inside them is lost.
        format!("[{text}]")
    }

    /// Records the insertion if the callee resolves to an Angular import.
    fn record(&mut self, call: &CallExpression<'a>, debug_name: String) {
        let Some(callee) = signal_function_identifier(&call.callee) else {
            return;
        };
        if !is_angular_import(callee, self.semantic) {
            return;
        }
        let Some((position, kind)) = insertion_for_call(call) else {
            return;
        };
        self.insertions.push(SignalDebugNameInsertion {
            position,
            debug_name,
            kind,
        });
    }
}

/// `init` if it's a call to a recognized signal function.
///
/// TODO(parity): optional calls (`signal?.(0)`) are wrapped in a `ChainExpression` and skipped.
fn signal_call<'b, 'a>(init: Option<&'b Expression<'a>>) -> Option<&'b CallExpression<'a>> {
    let Some(Expression::CallExpression(call)) = init else {
        return None;
    };
    signal_function_identifier(&call.callee)?;
    Some(call)
}

/// The call and property name for `<object>.<name> = <call>`. Parenthesized, compound and chained
/// assignments don't match.
fn property_assignment_signal_call<'b, 'a>(
    expr: &'b Expression<'a>,
) -> Option<(&'b CallExpression<'a>, String)> {
    let Expression::AssignmentExpression(assign) = expr else {
        return None;
    };
    let AssignmentExpression {
        operator: AssignmentOperator::Assign,
        left,
        right,
        ..
    } = assign.as_ref()
    else {
        return None;
    };
    let call = signal_call(Some(right))?;
    // A private name keeps its `#`.
    let name = match left {
        AssignmentTarget::StaticMemberExpression(member) => member.property.name.to_string(),
        AssignmentTarget::PrivateFieldExpression(field) => format!("#{}", field.field.name),
        _ => return None,
    };
    Some((call, name))
}

/// The signal function's identifier in a callee `fn` or `fn.<name>` (e.g. `input.required`).
fn signal_function_identifier<'b, 'a>(
    callee: &'b Expression<'a>,
) -> Option<&'b IdentifierReference<'a>> {
    let ident = match callee {
        Expression::Identifier(ident) => ident,
        Expression::StaticMemberExpression(member) => {
            let Expression::Identifier(ident) = &member.object else {
                return None;
            };
            ident
        }
        _ => return None,
    };
    package_of_signal_function(ident.name.as_str())?;
    Some(ident)
}

/// Whether `ident` is a named import from its function's package. Namespace and default imports
/// don't count, nor do shadowing locals.
fn is_angular_import(ident: &IdentifierReference<'_>, semantic: &Semantic<'_>) -> bool {
    let Some((specifier, Some(_))) = super::utils::import_of_identifier(ident, semantic) else {
        return false;
    };
    let Some(package) = package_of_signal_function(ident.name.as_str()) else {
        return false;
    };
    is_package_or_entry_point(specifier, package)
}

/// Where the `debugName` goes in `call`, or `None` if the options argument isn't an object literal
/// or already has a `debugName`.
fn insertion_for_call(call: &CallExpression<'_>) -> Option<(u32, SignalDebugNameInsertionKind)> {
    let is_required_input = is_required_input_function(&call.callee);
    let has_no_args = call.arguments.is_empty();
    let config_position =
        if has_no_args || is_signal_with_object_only_definition(call) || is_required_input {
            0
        } else {
            1
        };

    match call.arguments.get(config_position) {
        None => {
            // `)` is the last character of a call expression.
            let position = call
                .arguments
                .last()
                .map_or(call.span.end - 1, |arg| arg.span().end);
            Some((
                position,
                SignalDebugNameInsertionKind::Arguments {
                    has_arguments: !has_no_args,
                    prepend_undefined: has_no_args && !is_required_input,
                },
            ))
        }
        Some(Argument::ObjectExpression(options)) => {
            if has_debug_name_property(options) {
                return None;
            }
            Some((
                options.span.start + 1,
                SignalDebugNameInsertionKind::Options {
                    has_properties: !options.properties.is_empty(),
                },
            ))
        }
        // Not statically analyzable (a variable, a spread, ...).
        Some(_) => None,
    }
}

/// Whether the literal has a `debugName: <value>` property. Shorthand, quoted keys and methods
/// don't count.
fn has_debug_name_property(options: &ObjectExpression<'_>) -> bool {
    options.properties.iter().any(|prop| {
        let ObjectPropertyKind::ObjectProperty(prop) = prop else {
            return false;
        };
        if prop.shorthand
            || prop.method
            || prop.computed
            || prop.kind != oxc_ast::ast::PropertyKind::Init
        {
            return false;
        }
        matches!(&prop.key, PropertyKey::StaticIdentifier(key) if key.name == "debugName")
    })
}

/// `input.required` or `model.required`.
fn is_required_input_function(callee: &Expression<'_>) -> bool {
    let Expression::StaticMemberExpression(member) = callee else {
        return false;
    };
    let Expression::Identifier(object) = &member.object else {
        return false;
    };
    member.property.name == "required" && matches!(object.name.as_str(), "input" | "model")
}

/// Calls whose first argument holds both the computation and the options:
/// `linkedSignal({source, computation})` and `resource({...})`.
fn is_signal_with_object_only_definition(call: &CallExpression<'_>) -> bool {
    let Expression::Identifier(callee) = &call.callee else {
        return false;
    };
    match callee.name.as_str() {
        "linkedSignal" => matches!(call.arguments.first(), Some(Argument::ObjectExpression(_))),
        "resource" => true,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    fn collect(source: &str) -> Vec<SignalDebugNameInsertion> {
        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, source, SourceType::ts()).parse();
        assert!(
            ret.diagnostics.is_empty(),
            "parse errors: {:?}",
            ret.diagnostics
        );
        let semantic = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program)
            .semantic;
        collect_signal_debug_names(&ret.program, &semantic, source)
    }

    /// Applies the insertions like `insertSignalDebugNames` (TS output). Keep the templates in
    /// sync with it.
    fn transform(source: &str) -> String {
        let mut insertions = collect(source);
        insertions.sort_by_key(|i| std::cmp::Reverse(i.position));
        let mut out = source.to_string();
        for insertion in insertions {
            let debug_name = format!(
                "{{ debugName: {} }}",
                serde_json::to_string(&insertion.debug_name).unwrap()
            );
            let text = match insertion.kind {
                SignalDebugNameInsertionKind::Arguments {
                    has_arguments,
                    prepend_undefined,
                } => format!(
                    "{}...(ngDevMode ? [{}{debug_name}] : /* istanbul ignore next */ []) as []",
                    if has_arguments { ", " } else { "" },
                    if prepend_undefined { "undefined, " } else { "" },
                ),
                SignalDebugNameInsertionKind::Options { has_properties } => format!(
                    "...(ngDevMode ? {debug_name} : /* istanbul ignore next */ {{}}){}",
                    if has_properties { ", " } else { "" },
                ),
            };
            out.insert_str(insertion.position as usize, &text);
        }
        out
    }

    /// Asserts that transforming `source` gives `expected`, both given as lines.
    fn assert_transform(source: &[&str], expected: &[&str]) {
        assert_eq!(transform(&source.join("\n")), expected.join("\n"));
    }

    #[test]
    fn variable_declaration() {
        assert_transform(
            &[
                "import {signal} from '@angular/core';",
                "const testSignal = signal('Hello World');",
            ],
            &[
                "import {signal} from '@angular/core';",
                r#"const testSignal = signal('Hello World', ...(ngDevMode ? [{ debugName: "testSignal" }] : /* istanbul ignore next */ []) as []);"#,
            ],
        );
    }

    #[test]
    fn property_declaration_and_type_arguments() {
        assert_transform(
            &[
                "import {signal} from '@angular/core';",
                "class A {",
                "  s = signal<number>(1);",
                "}",
            ],
            &[
                "import {signal} from '@angular/core';",
                "class A {",
                r#"  s = signal<number>(1, ...(ngDevMode ? [{ debugName: "s" }] : /* istanbul ignore next */ []) as []);"#,
                "}",
            ],
        );
    }

    #[test]
    fn property_assignment() {
        assert_transform(
            &[
                "import {signal} from '@angular/core';",
                "class A {",
                "  s;",
                "  #p;",
                "  constructor() {",
                "    this.s = signal(1);",
                "    this.#p = signal(2);",
                "  }",
                "}",
            ],
            &[
                "import {signal} from '@angular/core';",
                "class A {",
                "  s;",
                "  #p;",
                "  constructor() {",
                r#"    this.s = signal(1, ...(ngDevMode ? [{ debugName: "s" }] : /* istanbul ignore next */ []) as []);"#,
                r##"    this.#p = signal(2, ...(ngDevMode ? [{ debugName: "#p" }] : /* istanbul ignore next */ []) as []);"##,
                "  }",
                "}",
            ],
        );
    }

    #[test]
    fn property_assignment_requires_plain_assignment_statement() {
        assert!(collect(
            "import {signal} from '@angular/core';\nlet a: any;\na.s ??= signal(1);\n(a.t = signal(1));\na.u = a.v = signal(1);",
        )
        .is_empty());
    }

    #[test]
    fn no_arguments_passes_undefined() {
        assert_transform(
            &[
                "import {input, model} from '@angular/core';",
                "class A {",
                "  i = input();",
                "  m = model();",
                "}",
            ],
            &[
                "import {input, model} from '@angular/core';",
                "class A {",
                r#"  i = input(...(ngDevMode ? [undefined, { debugName: "i" }] : /* istanbul ignore next */ []) as []);"#,
                r#"  m = model(...(ngDevMode ? [undefined, { debugName: "m" }] : /* istanbul ignore next */ []) as []);"#,
                "}",
            ],
        );
    }

    #[test]
    fn required_inputs_take_options_first() {
        assert_transform(
            &[
                "import {input, model} from '@angular/core';",
                "class A {",
                "  i = input.required<string>();",
                "  m = model.required({alias: 'x'});",
                "}",
            ],
            &[
                "import {input, model} from '@angular/core';",
                "class A {",
                r#"  i = input.required<string>(...(ngDevMode ? [{ debugName: "i" }] : /* istanbul ignore next */ []) as []);"#,
                r#"  m = model.required({...(ngDevMode ? { debugName: "m" } : /* istanbul ignore next */ {}), alias: 'x'});"#,
                "}",
            ],
        );
    }

    #[test]
    fn existing_options_object() {
        assert_transform(
            &[
                "import {signal, computed} from '@angular/core';",
                "const a = signal(0, {equal: () => true});",
                "const b = computed(() => 1, {});",
            ],
            &[
                "import {signal, computed} from '@angular/core';",
                r#"const a = signal(0, {...(ngDevMode ? { debugName: "a" } : /* istanbul ignore next */ {}), equal: () => true});"#,
                r#"const b = computed(() => 1, {...(ngDevMode ? { debugName: "b" } : /* istanbul ignore next */ {})});"#,
            ],
        );
    }

    #[test]
    fn existing_debug_name_or_opaque_options_are_left_alone() {
        assert!(collect(
            "import {signal} from '@angular/core';\nconst opts = {};\nconst a = signal(0, {debugName: 'x'});\nconst b = signal(0, opts);\nconst c = signal(0, ...[opts]);",
        )
        .is_empty());
    }

    #[test]
    fn debug_name_lookalikes_do_not_count() {
        // Only a `debugName: <value>` property counts.
        assert_transform(
            &[
                "import {signal} from '@angular/core';",
                "const debugName = 'x';",
                "const a = signal(0, {debugName});",
                "const b = signal(0, {'debugName': 'x'});",
            ],
            &[
                "import {signal} from '@angular/core';",
                "const debugName = 'x';",
                r#"const a = signal(0, {...(ngDevMode ? { debugName: "a" } : /* istanbul ignore next */ {}), debugName});"#,
                r#"const b = signal(0, {...(ngDevMode ? { debugName: "b" } : /* istanbul ignore next */ {}), 'debugName': 'x'});"#,
            ],
        );
    }

    #[test]
    fn object_only_definitions() {
        assert_transform(
            &[
                "import {linkedSignal, resource} from '@angular/core';",
                "const a = linkedSignal({source: () => 1, computation: (s) => s});",
                "const b = linkedSignal(() => 1);",
                "const c = resource({loader: async () => 1});",
            ],
            &[
                "import {linkedSignal, resource} from '@angular/core';",
                r#"const a = linkedSignal({...(ngDevMode ? { debugName: "a" } : /* istanbul ignore next */ {}), source: () => 1, computation: (s) => s});"#,
                r#"const b = linkedSignal(() => 1, ...(ngDevMode ? [{ debugName: "b" }] : /* istanbul ignore next */ []) as []);"#,
                r#"const c = resource({...(ngDevMode ? { debugName: "c" } : /* istanbul ignore next */ {}), loader: async () => 1});"#,
            ],
        );
    }

    #[test]
    fn http_resource_comes_from_common() {
        // Even without an `@angular/core` import.
        assert_eq!(
            collect("import {httpResource} from '@angular/common/http';\nconst a = httpResource(() => '/x');").len(),
            1
        );
        assert!(collect(
            "import {httpResource} from '@angular/core';\nconst a = httpResource(() => '/x');"
        )
        .is_empty());
    }

    #[test]
    fn requires_named_angular_import_under_its_own_name() {
        assert!(collect("const signal = (v: number) => v;\nconst a = signal(1);").is_empty());
        assert!(collect("import {signal} from 'other';\nconst a = signal(1);").is_empty());
        assert!(collect("import {signal} from '@angular/corex';\nconst a = signal(1);").is_empty());
        assert!(collect("import {signal as s} from '@angular/core';\nconst a = s(1);").is_empty());
        assert!(
            collect("import * as core from '@angular/core';\nconst a = core.signal(1);").is_empty()
        );
        assert!(collect(
            "import {signal} from '@angular/core';\nfunction f(signal: any) { const a = signal(1); }",
        )
        .is_empty());
        // The local name is what counts.
        assert_eq!(
            collect(
                "import {computed as signal} from '@angular/core';\nconst a = signal(() => 1);"
            )
            .len(),
            1
        );
        assert_eq!(
            collect("import {signal} from '@angular/core/primitives';\nconst a = signal(1);").len(),
            1
        );
    }

    #[test]
    fn candidates_are_not_descended_into() {
        // Not even when the outer callee isn't an Angular import.
        let insertions = collect(
            "import {signal, computed} from '@angular/core';\nconst a = computed(() => { const inner = signal(1); return inner(); });\nconst b = (() => { const nested = signal(1); return nested; })();",
        );
        let names: Vec<_> = insertions.iter().map(|i| i.debug_name.as_str()).collect();
        assert_eq!(names, ["a", "nested"]);
    }

    #[test]
    fn names_are_the_source_text() {
        let insertions = collect(
            "import {signal} from '@angular/core';\nclass A { 'quoted' = signal(1); #priv = signal(2); [Symbol.iterator] = signal(3); accessor acc = signal(4); }\nconst {x} = signal({x: 1});",
        );
        let names: Vec<_> = insertions.iter().map(|i| i.debug_name.as_str()).collect();
        assert_eq!(
            names,
            ["'quoted'", "#priv", "[Symbol.iterator]", "acc", "{x}"]
        );
    }

    #[test]
    fn trailing_comma_and_multibyte_source() {
        let source = "import {signal} from '@angular/core';\n// ✨\nconst a = signal(1,);";
        let insertions = collect(source);
        assert_eq!(insertions.len(), 1);
        // Byte offset just past `1` (converted to UTF-16 on the wire).
        assert_eq!(
            insertions[0].position as usize,
            source.find("1,)").unwrap() + 1
        );
    }
}
