use super::*;
use crate::test_utils::with_expression_semantic;
use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_semantic::SemanticBuilder;
use oxc_span::SourceType;

#[test]
fn test_get_type_only_exports() {
    let allocator = Allocator::default();
    let source_type = SourceType::default().with_typescript(true);
    let source = r#"
export interface Foo { bar: string; }
export type Bar = string | number;
export class Baz {}
export { type Qux } from './qux';
export type { Quux } from './quux';
export { Corge } from './corge';
export default interface DefaultInterface {}
interface LocalInterface {}
export { LocalInterface };
import type { SomeType } from './some-module';
export { SomeType };
interface RenameMe {}
export { RenameMe as Renamed };
class Merged {}
interface Merged {}
export { Merged };
type LocalType = string;
export { LocalType };
"#;
    let ret = Parser::new(&allocator, source, source_type).parse();
    let semantic_ret = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(&ret.program);
    let result = get_type_only_exports(&ret.module_record, &semantic_ret.semantic);
    assert!(result.contains(&"Foo".to_string()));
    assert!(result.contains(&"Bar".to_string()));
    assert!(!result.contains(&"Baz".to_string()));
    assert!(result.contains(&"Qux".to_string()));
    assert!(result.contains(&"Quux".to_string()));
    assert!(!result.contains(&"Corge".to_string()));
    assert!(result.contains(&"default".to_string()));
    assert!(result.contains(&"LocalInterface".to_string()));
    assert!(result.contains(&"SomeType".to_string()));
    assert!(result.contains(&"Renamed".to_string()));
    assert!(!result.contains(&"RenameMe".to_string()));
    assert!(!result.contains(&"Merged".to_string()));
    assert!(result.contains(&"LocalType".to_string()));
}

#[test]
fn test_extract_template_guards_method_and_property() {
    let source_text = "
    class TestDir {
        [ɵNgFieldDirective] = true;
        static ngTemplateContextGuard(): any {}
        static ngTemplateGuard_bindingGuard: 'binding';
        static ngTemplateGuard_invocationGuard(): void {}
        static ngTemplateGuard_ignoredGuard: 'something_else';
        static ngTemplateGuard_anotherInvocationGuard;
    }
    ";
    let allocator = Allocator::default();
    let source_type = SourceType::default()
        .with_typescript(true)
        .with_module(true);
    let ret = Parser::new(&allocator, source_text, source_type).parse();

    let mut found_class = false;
    for stmt in ret.program.body {
        if let oxc_ast::ast::Statement::ClassDeclaration(class) = stmt {
            found_class = true;
            let (has_context_guard, guards, has_field_directive) =
                extract_template_guards_and_field_directive(&class);

            assert!(
                has_field_directive,
                "Expected has_ng_field_directive to be true"
            );
            assert!(
                has_context_guard,
                "Expected has_ng_template_context_guard to be true"
            );
            assert_eq!(
                guards.len(),
                2,
                "Expected exactly 2 template guards to be extracted"
            );

            let binding_guard = guards
                .iter()
                .find(|g| g.input_name == "bindingGuard")
                .unwrap();
            assert_eq!(binding_guard.type_, "binding");

            let invocation_guard = guards
                .iter()
                .find(|g| g.input_name == "invocationGuard")
                .unwrap();
            assert_eq!(invocation_guard.type_, "invocation");
        }
    }
    assert!(found_class, "Test class not found");
}

#[test]
fn test_extract_template_guards_dts() {
    let source_text = "
    export declare class TestDir {
        [ɵNgFieldDirective]: any;
        static ngTemplateContextGuard(): any;
        static ngTemplateGuard_bindingGuard: 'binding';
        static ngTemplateGuard_invocationGuard(): void;
        static ngTemplateGuard_invocationTypeGuard: 'invocation';
    }
    ";
    let allocator = Allocator::default();
    let source_type = SourceType::default()
        .with_typescript(true)
        .with_module(true);
    let ret = Parser::new(&allocator, source_text, source_type).parse();

    let mut found_class = false;
    for stmt in ret.program.body {
        if let oxc_ast::ast::Statement::ExportDeclaration(decl) = stmt {
            if let oxc_ast::ast::Declaration::ClassDeclaration(class) = &decl.declaration {
                found_class = true;
                let (has_context_guard, guards, has_field_directive) =
                    extract_template_guards_and_field_directive(class);

                assert!(
                    has_field_directive,
                    "Expected has_ng_field_directive to be true"
                );

                assert!(
                    has_context_guard,
                    "Expected has_ng_template_context_guard to be true"
                );
                assert_eq!(
                    guards.len(),
                    2,
                    "Expected exactly 2 template guards to be extracted"
                );

                let binding_guard = guards
                    .iter()
                    .find(|g| g.input_name == "bindingGuard")
                    .unwrap();
                assert_eq!(binding_guard.type_, "binding");

                let invocation_guard = guards
                    .iter()
                    .find(|g| g.input_name == "invocationGuard")
                    .unwrap();
                assert_eq!(invocation_guard.type_, "invocation");
            }
        }
    }
    assert!(found_class, "Test class not found");
}

/// Parse a whole program and hand the callback its final expression statement, so tests can
/// declare the imports that `forwardRef` provenance checks depend on.
fn with_trailing_expression<F>(source: &str, f: F)
where
    F: FnOnce(&Expression, &Semantic),
{
    let allocator = Allocator::default();
    let source_type = SourceType::default().with_typescript(true);
    let ret = Parser::new(&allocator, source, source_type).parse();
    // Most assertions below are negative (`is_none`), which would also hold if the source
    // simply failed to parse. Fail loudly instead so they cannot pass vacuously.
    assert!(
        ret.diagnostics.is_empty(),
        "parse errors: {:?}",
        ret.diagnostics
    );
    let semantic_ret = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(&ret.program);
    assert!(
        semantic_ret.diagnostics.is_empty(),
        "semantic errors: {:?}",
        semantic_ret.diagnostics
    );
    let stmt = ret
        .program
        .body
        .last()
        .expect("Expected at least one statement");
    let oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) = stmt else {
        panic!("Expected the last statement to be an ExpressionStatement");
    };
    f(&expr_stmt.expression, &semantic_ret.semantic);
}

#[test]
fn test_extract_raw_expression_with_forward_ref_helper() {
    let source = "import { forwardRef } from '@angular/core';\nforwardRef(() => SharedModule)";
    with_trailing_expression(source, |expr, semantic| {
        let res = extract_provider_span_with_forward_ref(expr, semantic);
        assert_eq!(
            &source[res.span.start as usize..res.span.end as usize],
            "SharedModule"
        );
        assert!(res.is_forward_ref);
    });
}

/// Upstream `tryUnwrapForwardRef` resolves the callee through
/// `ReflectionHost.getImportOfIdentifier`, so recognition follows the *import binding*,
/// not the local spelling.
#[test]
fn test_unwrap_forward_ref_provenance() {
    // The ordinary spelling.
    with_trailing_expression(
        "import { forwardRef } from '@angular/core';\nforwardRef(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_some());
        },
    );

    // Aliased named import: upstream compares the *exported* name, so this is Angular's.
    with_trailing_expression(
        "import { forwardRef as fwd } from '@angular/core';\nfwd(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_some());
        },
    );

    // Namespace member access.
    with_trailing_expression(
        "import * as core from '@angular/core';\ncore.forwardRef(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_some());
        },
    );

    // Same name, different package: not Angular's `forwardRef`.
    with_trailing_expression(
        "import { forwardRef } from './utils';\nforwardRef(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );

    // Locally *spelled* `forwardRef` but bound to a different export of `@angular/core`.
    // Upstream compares the exported name, so this is not Angular's `forwardRef`; an
    // implementation comparing the local spelling would wrongly accept it.
    with_trailing_expression(
        "import { inject as forwardRef } from '@angular/core';\nforwardRef(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );

    // Same trick, from another package entirely.
    with_trailing_expression(
        "import { wrap as forwardRef } from './utils';\nforwardRef(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );

    // A local alias is NOT an import binding. Upstream's syntactic helper does not follow
    // these either (the partial evaluator's `createForwardRefResolver` is what does).
    with_trailing_expression(
        "import { forwardRef } from '@angular/core';\nconst fref = forwardRef;\nfref(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );

    // Locally declared function that merely shares the name.
    with_trailing_expression(
        "function forwardRef(fn: any) { return fn(); }\nforwardRef(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );

    // Upstream never unwraps the callee itself (`unwrapExpression` is applied to the call
    // node and the argument only), so a cast or parenthesized callee is not an identifier
    // and is rejected.
    with_trailing_expression(
        "import { forwardRef } from '@angular/core';\n(forwardRef as any)(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );
    with_trailing_expression(
        "import { forwardRef } from '@angular/core';\n(forwardRef)(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );
    with_trailing_expression(
        "import * as core from '@angular/core';\n(core as any).forwardRef(() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );

    // Computed member access is not a `PropertyAccessExpression` upstream.
    with_trailing_expression(
        "import * as core from '@angular/core';\ncore['forwardRef'](() => Foo)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );

    // Upstream requires exactly one argument.
    with_trailing_expression(
        "import { forwardRef } from '@angular/core';\nforwardRef(() => Foo, 1)",
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
        },
    );
}

/// The wrappers upstream's `unwrapExpression` strips, and the ones it deliberately keeps.
///
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L176-L181
#[test]
fn test_unwrap_forward_ref_outer_wrappers() {
    const IMPORT: &str = "import { forwardRef } from '@angular/core';\n";

    // Stripped by `unwrapExpression`: parentheses and `as` casts.
    for expr in ["(forwardRef(() => Foo))", "forwardRef(() => Foo) as any"] {
        with_trailing_expression(&format!("{IMPORT}{expr}"), |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_some());
            assert!(unwrap_forward_ref_evaluated(expr, semantic).is_some());
        });
    }

    // Kept by `unwrapExpression`, so the syntactic helper declines. The partial evaluator does
    // see through `!`, so the evaluated form still resolves that one.
    with_trailing_expression(
        &format!("{IMPORT}forwardRef(() => Foo)!"),
        |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
            assert!(unwrap_forward_ref_evaluated(expr, semantic).is_some());
        },
    );

    // Neither helper sees through `<T>x` or `satisfies` -- upstream's evaluator reports
    // `DynamicValue.fromUnsupportedSyntax` for both.
    for expr in [
        "<any>forwardRef(() => Foo)",
        "forwardRef(() => Foo) satisfies any",
    ] {
        with_trailing_expression(&format!("{IMPORT}{expr}"), |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
            assert!(unwrap_forward_ref_evaluated(expr, semantic).is_none());
        });
    }
}

/// The evaluated entry point shares the syntactic one's provenance rules; only the outer
/// wrapper set differs. `imports` and `hostDirectives` depend on this, so assert it directly.
#[test]
fn test_unwrap_forward_ref_evaluated_provenance() {
    // Angular's `forwardRef`, however it is spelled at the import.
    for source in [
        "import { forwardRef } from '@angular/core';\nforwardRef(() => Foo)",
        "import { forwardRef as fwd } from '@angular/core';\nfwd(() => Foo)",
        "import * as core from '@angular/core';\ncore.forwardRef(() => Foo)",
    ] {
        with_trailing_expression(source, |expr, semantic| {
            assert!(unwrap_forward_ref_evaluated(expr, semantic).is_some());
        });
    }

    // Same name, different origin -- must not be unwrapped by either entry point.
    for source in [
        "import { forwardRef } from './utils';\nforwardRef(() => Foo)",
        "import { inject as forwardRef } from '@angular/core';\nforwardRef(() => Foo)",
        "function forwardRef(fn: any) { return fn(); }\nforwardRef(() => Foo)",
    ] {
        with_trailing_expression(source, |expr, semantic| {
            assert!(unwrap_forward_ref(expr, semantic).is_none());
            assert!(unwrap_forward_ref_evaluated(expr, semantic).is_none());
        });
    }

    // Upstream requires exactly one argument here too.
    with_trailing_expression(
        "import { forwardRef } from '@angular/core';\nforwardRef(() => Foo, 1)",
        |expr, semantic| {
            assert!(unwrap_forward_ref_evaluated(expr, semantic).is_none());
        },
    );
}

/// `expandForwardRef` reaches the arrow/function through `unwrapExpression` and requires a
/// block body to hold exactly one statement.
///
/// https://github.com/angular/angular/blob/96b80424c7/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L183-L205
#[test]
fn test_expand_forward_ref_argument() {
    const IMPORT: &str = "import { forwardRef } from '@angular/core';\n";

    for arg in [
        "() => Foo",
        "(() => Foo)",
        "((() => Foo) as any)",
        "() => { return Foo; }",
        "function () { return Foo; }",
    ] {
        with_trailing_expression(&format!("{IMPORT}forwardRef({arg})"), |expr, semantic| {
            assert!(
                unwrap_forward_ref(expr, semantic).is_some(),
                "expected `{arg}` to expand"
            );
        });
    }

    for arg in [
        // `unwrapExpression` does not strip `!`, so the argument is not a function.
        "(() => Foo)!",
        // Two statements, whichever order the `return` comes in.
        "() => { log(1); return Foo; }",
        "() => { return Foo; log(1); }",
        "function () { return Foo; log(1); }",
        // A block body with no `return` at all, and a bare `return;` (upstream's
        // `stmt.expression === undefined` check).
        "() => { log(Foo); }",
        "() => { return; }",
        "function () { return; }",
    ] {
        with_trailing_expression(&format!("{IMPORT}forwardRef({arg})"), |expr, semantic| {
            assert!(
                unwrap_forward_ref(expr, semantic).is_none(),
                "expected `{arg}` not to expand"
            );
            assert!(
                unwrap_forward_ref_evaluated(expr, semantic).is_none(),
                "expected `{arg}` not to expand (evaluated)"
            );
        });
    }
}

fn parse_property_key(source: &str) -> Option<String> {
    let allocator = Allocator::default();
    let wrapped = format!("const x = {{ {} }};", source);
    let ret = Parser::new(&allocator, &wrapped, SourceType::ts()).parse();
    if ret.program.body.is_empty() {
        panic!("Empty body! Errors: {:?}", ret.diagnostics);
    }
    let stmt = ret.program.body.first().unwrap();
    if let oxc_ast::ast::Statement::VariableDeclaration(decl) = stmt {
        let decl = decl.declarations.first().unwrap();
        if let Some(oxc_ast::ast::Expression::ObjectExpression(obj)) = &decl.init {
            let prop = obj.properties.first().unwrap();
            if let oxc_ast::ast::ObjectPropertyKind::ObjectProperty(p) = prop {
                return extract_property_key(&p.key).map(|c| c.into_owned());
            }
        }
    }
    None
}

#[test]
fn test_extract_property_key_helper() {
    assert_eq!(parse_property_key("foo: bar"), Some("foo".to_string()));
    assert_eq!(parse_property_key("'foo': bar"), Some("foo".to_string()));
    assert_eq!(parse_property_key("123: bar"), Some("123".to_string()));
    assert_eq!(parse_property_key("[`foo`]: bar"), Some("foo".to_string()));
    assert_eq!(parse_property_key("[foo]: bar"), Some("foo".to_string()));
    assert_eq!(parse_property_key("[`foo${x}`]: bar"), None);
}

fn assert_string(source: &str, expected: Option<&str>) {
    with_expression_semantic(source, |expr, semantic| {
        assert_eq!(
            extract_string(expr, semantic),
            expected.map(|s| s.to_string())
        );
    });
}

fn assert_bool(source: &str, expected: Option<bool>) {
    with_expression_semantic(source, |expr, semantic| {
        assert_eq!(extract_bool(expr, semantic), expected);
    });
}

#[test]
fn test_unwrap_parentheses_and_casts() {
    assert_string("('hello')", Some("hello"));
    assert_string("'hello' as any", Some("hello"));
    assert_string("'hello' satisfies string", Some("hello"));

    assert_bool("(true)", Some(true));
    assert_bool("false as boolean", Some(false));

    let source = "import { forwardRef } from '@angular/core';\n(forwardRef(() => Foo) as any)";
    with_trailing_expression(source, |expr, semantic| {
        let unwrapped = unwrap_forward_ref(expr, semantic).unwrap();
        assert!(matches!(unwrapped, oxc_ast::ast::Expression::Identifier(_)));
        assert_eq!(unwrapped.span().source_text(source), "Foo");
    });
}

fn assert_string_in_program(source: &str, expected: Option<&str>) {
    let allocator = Allocator::default();
    let source_type = SourceType::default().with_typescript(true);
    let ret = Parser::new(&allocator, source, source_type).parse();
    let semantic_ret = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(&ret.program);
    let last_stmt = ret
        .program
        .body
        .last()
        .expect("Expected at least one statement");
    let oxc_ast::ast::Statement::ExpressionStatement(expr_stmt) = last_stmt else {
        panic!("Expected the last statement to be an ExpressionStatement");
    };
    assert_eq!(
        extract_string(&expr_stmt.expression, &semantic_ret.semantic),
        expected.map(|s| s.to_string())
    );
}

#[test]
fn test_extract_string_constant_folding() {
    // 1. Template literal without expressions
    assert_string_in_program("`hello`", Some("hello"));

    // 2. Template literal with string literal expression
    assert_string_in_program("`hello ${'world'}`", Some("hello world"));

    // 3. Template literal with local constant string reference
    assert_string_in_program(
        r#"
        const name = 'world';
        `hello ${name}`
        "#,
        Some("hello world"),
    );

    // 4. Template literal with multiple local constant references
    assert_string_in_program(
        r#"
        const greeting = 'hello';
        const name = 'world';
        `${greeting} ${name}!`
        "#,
        Some("hello world!"),
    );

    // 5. Template literal with nested template literals
    assert_string_in_program(
        r#"
        const name = 'world';
        `hello ${`beautiful ${name}`}`
        "#,
        Some("hello beautiful world"),
    );

    // 6. String concatenation of literals
    assert_string_in_program("'hello' + ' ' + 'world'", Some("hello world"));

    // 7. String concatenation with local constants
    assert_string_in_program(
        r#"
        const greeting = 'hello';
        const target = 'world';
        greeting + ' ' + target
        "#,
        Some("hello world"),
    );

    // 8. Mixed template literal and string concatenation
    assert_string_in_program(
        r#"
        const name = 'world';
        'hello ' + `beautiful ${name}`
        "#,
        Some("hello beautiful world"),
    );

    // 9. Edge case: Unresolved identifier
    assert_string_in_program("`hello ${unresolved}`", None);

    // 10. Edge case: Non-string constant (number) inside template
    assert_string_in_program(
        r#"
        const age = 25;
        `age: ${age}`
        "#,
        Some("age: 25"),
    );

    // 11. Edge case: Non-string constant (boolean) inside template
    assert_string_in_program(
        r#"
        const is_active = true;
        `active: ${is_active}`
        "#,
        Some("active: true"),
    );

    // 12. Edge case: Non-string constant (null) inside template
    assert_string_in_program(
        r#"
        const value = null;
        `value: ${value}`
        "#,
        Some("value: null"),
    );

    // 13. Edge case: Unsupported binary operation
    assert_string_in_program("greeting - target", None);
}

/// Parse `source` and hand its final expression statement to `f`, with the preceding
/// declarations in scope.
fn with_last_expression<F>(source: &str, f: F)
where
    F: FnOnce(&Expression, &Semantic),
{
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
    let expr = ret
        .program
        .body
        .iter()
        .rev()
        .find_map(|stmt| match stmt {
            oxc_ast::ast::Statement::ExpressionStatement(s) => Some(&s.expression),
            _ => None,
        })
        .expect("source must end with an expression statement");
    f(expr, &semantic);
}

#[test]
fn resolve_local_expression_declines_destructured_bindings() {
    // Regression: a declarator's initializer is the value of the whole *pattern*, not of any
    // single name it binds. Handing it back made `template: x` emit an unrelated string.
    with_last_expression(
        "const STYLES = ['.a {}', '.b {}']; const [firstStyle] = STYLES; firstStyle;",
        |expr, semantic| assert_eq!(extract_string(expr, semantic), None),
    );
    with_last_expression(
        "const TPL = '<p>outer</p>'; const {x} = {x: TPL}; x;",
        |expr, semantic| assert_eq!(extract_string(expr, semantic), None),
    );
    // Plain identifier bindings still resolve, including through a chain.
    with_last_expression(
        "const TPL = '<p>outer</p>'; const ALIAS = TPL; ALIAS;",
        |expr, semantic| {
            assert_eq!(
                extract_string(expr, semantic),
                Some("<p>outer</p>".to_string())
            );
        },
    );
}

#[test]
fn test_qualified_name_utils() {
    let allocator = Allocator::default();
    let source_type = SourceType::default().with_typescript(true);
    let source = r#"
type T1 = a.b.c;
"#;
    let ret = Parser::new(&allocator, source, source_type).parse();
    assert!(
        ret.diagnostics.is_empty(),
        "parse errors: {:?}",
        ret.diagnostics
    );

    let oxc_ast::ast::Statement::TSTypeAliasDeclaration(alias) = &ret.program.body[0] else {
        panic!("expected type alias");
    };
    let oxc_ast::ast::TSType::TSTypeReference(type_ref) = &alias.type_annotation else {
        panic!("expected type reference");
    };
    let oxc_ast::ast::TSTypeName::QualifiedName(qualified) = &type_ref.type_name else {
        panic!("expected qualified name");
    };

    assert_eq!(qualified_name_to_string(qualified), "a.b.c");
    let leftmost = get_leftmost_identifier_in_qualified(qualified).expect("should find leftmost");
    assert_eq!(leftmost.name.as_str(), "a");
}
