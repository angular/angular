use oxc_ast::ast::{
    ArrayExpressionElement, ChainElement, Decorator, Expression, ObjectPropertyKind,
};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;
use std::collections::HashMap;

use crate::analyzer::class_data::{NgModuleData, TopLevelImport};
use crate::evaluator::{evaluate_expression, EvalInput, Resolved};

use super::imports::ImportedSymbol;
use super::utils::{extract_property_key, extract_schemas};

/// Parse an @NgModule decorator
pub fn parse_decorator<'a>(
    decorator: &Decorator<'a>,
    converter: &crate::utils::Utf8ToUtf16,
    semantic: &Semantic<'a>,
    import_map: &HashMap<String, ImportedSymbol>,
    eval: &EvalInput<'a, '_>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<NgModuleData> {
    let Expression::CallExpression(call_expr) = &decorator.expression else {
        return None;
    };

    if !crate::analyzer::utils::is_angular_decorator_named(
        decorator,
        "NgModule",
        semantic,
        angular_imports,
    ) {
        return None;
    }
    parse_ng_module_args(
        call_expr,
        crate::analyzer::utils::extract_decorator_name(decorator),
        converter,
        semantic,
        import_map,
        eval,
    )
}

fn parse_ng_module_args<'a>(
    call_expr: &oxc_ast::ast::CallExpression<'a>,
    decorator_name: Option<String>,
    _converter: &crate::utils::Utf8ToUtf16,
    semantic: &Semantic<'a>,
    import_map: &HashMap<String, ImportedSymbol>,
    eval: &EvalInput<'a, '_>,
) -> Option<NgModuleData> {
    if call_expr.arguments.len() > 1 {
        return None; // Match Angular diagnostic for too many arguments
    }

    let mut declarations = None;
    let mut imports = None;
    let mut parsed_imports = Vec::new();
    let mut top_level_imports = None;
    let mut exports = None;
    let mut bootstrap = None;
    let mut providers_span = None;
    let mut schemas = None;
    let mut id_span = None;
    let mut module_id_span = None;
    let mut args_span = None;

    // Raw source spans captured for LOCAL compilation mode verbatim emission.
    let mut declarations_span = None;
    let mut imports_span = None;
    let mut exports_span = None;
    let mut bootstrap_span = None;
    let mut local_imports_element_spans = None;
    let mut local_exports_element_spans = None;
    let mut isolated_imports = None;
    let mut isolated_exports = None;

    if let Some(oxc_ast::ast::Argument::ObjectExpression(obj)) = call_expr.arguments.first() {
        args_span = Some(obj.span());
        for prop in &obj.properties {
            match prop {
                ObjectPropertyKind::ObjectProperty(p) => {
                    if let Some(key_name) = extract_property_key(&p.key) {
                        match key_name.as_ref() {
                            "declarations" => {
                                declarations_span = Some(p.value.span());
                                declarations = Some(Resolved::from_syntax(
                                    evaluate_expression(&p.value, eval),
                                    eval.file,
                                ));
                            }
                            "imports" => {
                                imports_span = Some(p.value.span());
                                // The entries as written, for `may_export_providers`' recursive
                                // question: does an imported NgModule carry providers?
                                parsed_imports = super::imports::resolve_imports_expression(
                                    &p.value, true, semantic, import_map,
                                );
                                local_imports_element_spans =
                                    Some(top_level_element_spans(&p.value));
                                isolated_imports =
                                    extract_isolated_type_tuple(&p.value, semantic, eval);
                                imports = Some(Resolved::from_syntax(
                                    evaluate_expression(&p.value, eval),
                                    eval.file,
                                ));
                                // Assigned (not merged) so that a duplicate `imports:` key
                                // replaces the syntax recorded for the value it shadows.
                                top_level_imports = Some(extract_top_level_imports(&p.value, eval));
                            }
                            "exports" => {
                                exports_span = Some(p.value.span());
                                local_exports_element_spans =
                                    Some(top_level_element_spans(&p.value));
                                isolated_exports =
                                    extract_isolated_type_tuple(&p.value, semantic, eval);
                                exports = Some(Resolved::from_syntax(
                                    evaluate_expression(&p.value, eval),
                                    eval.file,
                                ));
                            }
                            "bootstrap" => {
                                bootstrap_span = Some(p.value.span());
                                bootstrap = Some(Resolved::from_syntax(
                                    evaluate_expression(&p.value, eval),
                                    eval.file,
                                ));
                            }
                            "schemas" => {
                                schemas = extract_schemas(&p.value, semantic);
                            }
                            "providers" => {
                                // In most cases the providers will be an array literal. Check if it has any elements
                                // and don't include the providers if it doesn't which saves us a few bytes.
                                // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L608-L619
                                let is_empty_array = matches!(
                                    &p.value,
                                    Expression::ArrayExpression(arr) if arr.elements.is_empty()
                                );
                                if !is_empty_array {
                                    providers_span = Some(p.value.span());
                                }
                            }
                            "jit" => {
                                // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L352-L356
                                return None;
                            }
                            "id" => {
                                if is_module_id_expression(&p.value) {
                                    id_span = None;
                                    module_id_span = Some(p.value.span());
                                } else {
                                    id_span = Some(emit_span(&p.value));
                                    module_id_span = None;
                                }
                            }
                            _ => {}
                        }
                    }
                }
                // Ignored, matching ngtsc's `reflectObjectLiteral`, which skips spread properties.
                // https://github.com/angular/angular/blob/5b525f9/packages/compiler-cli/src/ngtsc/reflection/src/typescript.ts#L748-L764
                ObjectPropertyKind::SpreadProperty(_) => {}
            }
        }
    }

    Some(NgModuleData {
        declarations,
        imports,
        parsed_imports,
        injector_imports: None,
        injector_import_raws: None,
        top_level_imports,
        exports,
        bootstrap,
        providers_span,
        id_span,
        module_id_span,
        schemas,
        args_span,
        declarations_span,
        imports_span,
        exports_span,
        bootstrap_span,
        local_imports_element_spans,
        local_exports_element_spans,
        isolated_imports,
        isolated_exports,
        injectable: None,
        service: None,
        decorator_name,
    })
}

/// Split an `imports` value into its top-level elements and evaluate each one separately,
/// mirroring ngtsc's `topLevelImports` so `ɵinj.imports` can emit a source element's expression
/// whenever all of its references survive filtering. Elements are evaluated individually because
/// the whole-`imports` evaluation splices spreads; a spread contributes its argument.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L621-L660
///
/// Array holes are skipped (a fatal `NG1010` non-reference in ngtsc), whereas LOCAL mode's
/// [`top_level_element_spans`] keeps them because it re-prints without resolving.
fn extract_top_level_imports<'a>(
    value: &Expression<'a>,
    eval: &EvalInput<'a, '_>,
) -> Vec<TopLevelImport> {
    let evaluate = |expr: &Expression<'a>| TopLevelImport {
        span: emit_span(expr),
        resolved: Resolved::from_syntax(evaluate_expression(expr, eval), eval.file),
    };

    let Expression::ArrayExpression(arr) = value.get_inner_expression() else {
        return vec![evaluate(value)];
    };

    let mut entries = Vec::with_capacity(arr.elements.len());
    for elem in &arr.elements {
        match elem {
            ArrayExpressionElement::SpreadElement(spread) => {
                entries.push(evaluate(&spread.argument))
            }
            ArrayExpressionElement::Elision(_) => {}
            other => entries.push(evaluate(other.to_expression())),
        }
    }
    entries
}

/// Whether the expression is syntactically `module.id` (or `module?.id`).
fn is_module_id_expression(expr: &Expression) -> bool {
    let member = match expr {
        Expression::StaticMemberExpression(member) => member,
        Expression::ChainExpression(chain) => match &chain.expression {
            ChainElement::StaticMemberExpression(member) => member,
            _ => return false,
        },
        _ => return false,
    };

    let Expression::Identifier(object) = &member.object else {
        return false;
    };
    object.name == "module" && member.property.name == "id"
}

/// Returns the span to re-print for a top-level `imports` or `id` expression, peeling outer
/// type-only syntax (and parentheses that only wrap type-only syntax) to match TypeScript's
/// AST printer in ngtsc, e.g. `(Mod.forRoot())` keeps its parentheses while `(Mod as any)`
/// narrows to `Mod`. In `imports`, `<T>x`, `satisfies` and `f<T>` are also peeled even though
/// ngtsc's evaluator rejects them (fatal `NG1010`), so there is no ngtsc output to match.
///
/// TODO(parity): Only outermost type assertions are peeled; assertions nested inside an element
/// (e.g. `[[A as any, B]]`) remain in the sliced source text and are erased by `tsc` downstream.
fn emit_span(expr: &Expression) -> oxc_span::Span {
    if let Some(inner) = strip_type_only_syntax(expr) {
        return emit_span(inner);
    }
    if let Expression::ParenthesizedExpression(paren) = expr {
        if wraps_type_only_syntax(&paren.expression) {
            return emit_span(&paren.expression);
        }
    }
    expr.span()
}

/// Unwraps one layer of TypeScript type-only syntax. Single source of truth for both
/// [`emit_span`] and [`wraps_type_only_syntax`], so they cannot drift apart.
fn strip_type_only_syntax<'b, 'a>(expr: &'b Expression<'a>) -> Option<&'b Expression<'a>> {
    match expr {
        Expression::TSAsExpression(e) => Some(&e.expression),
        Expression::TSSatisfiesExpression(e) => Some(&e.expression),
        Expression::TSNonNullExpression(e) => Some(&e.expression),
        Expression::TSTypeAssertion(e) => Some(&e.expression),
        Expression::TSInstantiationExpression(e) => Some(&e.expression),
        _ => None,
    }
}

/// Whether an expression is type-only syntax, or parentheses around it.
fn wraps_type_only_syntax(expr: &Expression) -> bool {
    if strip_type_only_syntax(expr).is_some() {
        return true;
    }
    match expr {
        Expression::ParenthesizedExpression(e) => wraps_type_only_syntax(&e.expression),
        _ => false,
    }
}

/// Compute raw source spans of the top-level elements of an `imports`/`exports` value for LOCAL
/// compilation mode, keeping spread elements and representing array elisions as empty spans.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/ng_module/src/handler.ts#L670-L688
fn top_level_element_spans(value: &Expression) -> Vec<oxc_span::Span> {
    match value {
        Expression::ArrayExpression(arr) => arr
            .elements
            .iter()
            .map(|el| match el {
                oxc_ast::ast::ArrayExpressionElement::Elision(e) => {
                    oxc_span::Span::empty(e.span.start)
                }
                other => other
                    .as_expression()
                    .map_or_else(|| other.span(), emit_span),
            })
            .collect(),
        other => vec![emit_span(other)],
    }
}

/// Extract the `emitDeclarationOnly` (`R3NgModuleMetadataKind.Isolated`) type-tuple classification
/// for an `@NgModule` `imports` or `exports` expression, mirroring `transformToTypeTupleExpression`
/// in `ngtsc/annotations/ng_module/src/handler.ts`.
///
/// An empty array literal returns `None` (emitted as `never` by `createNgModuleType`, matching
/// an omitted slot).
fn extract_isolated_type_tuple<'a>(
    expr: &Expression<'a>,
    semantic: &Semantic<'a>,
    eval: &EvalInput<'a, '_>,
) -> Option<super::class_data::IsolatedTypeTupleData> {
    use super::class_data::{IsolatedTypeElementData, IsolatedTypeTupleData};

    if let Expression::ArrayExpression(arr) = expr {
        if arr.elements.is_empty() {
            return None;
        }
        let elements = arr
            .elements
            .iter()
            .map(|elem| match elem.as_expression() {
                Some(el_expr) => classify_isolated_element(el_expr, semantic, eval),
                None => IsolatedTypeElementData::Never { span: elem.span() },
            })
            .collect();
        return Some(IsolatedTypeTupleData {
            is_array_literal: true,
            elements,
        });
    }

    let element = classify_isolated_element(expr, semantic, eval);
    Some(IsolatedTypeTupleData {
        is_array_literal: false,
        elements: vec![element],
    })
}

/// Classify a single top-level `imports`/`exports` element for `emitDeclarationOnly`, mirroring
/// `resolvedToTypeTupleElement` + `transformToTypeTupleElement` in
/// `ngtsc/annotations/ng_module/src/handler.ts`.
fn classify_isolated_element<'a>(
    el: &Expression<'a>,
    semantic: &Semantic<'a>,
    eval: &EvalInput<'a, '_>,
) -> super::class_data::IsolatedTypeElementData {
    use super::class_data::IsolatedTypeElementData;
    use crate::evaluator::ResolvedValue;
    use crate::types::analysis::Reference;

    // `transformToTypeTupleExpression` calls `evaluator.evaluate(el)` without foreign function
    // resolvers (relying on the syntactic `unwrap_forward_ref` loop below for top-level
    // `forwardRef`s).
    let isolated_eval = EvalInput {
        foreign: &[],
        ..*eval
    };
    let resolved = evaluate_expression(el, &isolated_eval);
    match resolved.unwrap_named() {
        ResolvedValue::Reference(r) => {
            return IsolatedTypeElementData::Typeof {
                span: None,
                reference: Some(Reference::from_value_reference(r)),
            };
        }
        ResolvedValue::Array(items) if !items.is_empty() => {
            let mut references = Vec::with_capacity(items.len());
            let mut all_valid = true;
            for item in items {
                let ResolvedValue::Reference(r) = item.unwrap_named() else {
                    all_valid = false;
                    break;
                };
                references.push(Reference::from_value_reference(r));
            }
            if all_valid {
                return IsolatedTypeElementData::ReferenceTuple { references };
            }
        }
        _ => {}
    }

    // Fallback to syntactic transform (`transformToTypeTupleElement`).
    let mut current = super::utils::unwrap_expression(el);
    while let Some(unwrapped) = super::utils::unwrap_forward_ref(current, semantic) {
        current = super::utils::unwrap_expression(unwrapped);
    }

    match current {
        Expression::CallExpression(call) if is_entity_name(&call.callee) => {
            IsolatedTypeElementData::CallReturnType {
                callee_span: call.callee.span(),
            }
        }
        expr if is_entity_name(expr) => IsolatedTypeElementData::Typeof {
            span: Some(expr.span()),
            reference: None,
        },
        expr => IsolatedTypeElementData::Never { span: expr.span() },
    }
}

/// Mirrors `expressionToEntityName` in `ngtsc/annotations/ng_module/src/handler.ts`: true when
/// `expr` is an identifier (`Foo`) or a non-optional property-access chain on identifiers
/// (`ns.Foo`, `a.b.c`).
fn is_entity_name(expr: &Expression) -> bool {
    match expr {
        Expression::Identifier(_) => true,
        Expression::StaticMemberExpression(member) => {
            !member.optional && is_entity_name(&member.object)
        }
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    use oxc_semantic::SemanticBuilder;
    fn parse_decorator_from_class(source: &str) -> Option<NgModuleData> {
        let allocator = Allocator::default();
        // Decorators require TS syntax
        let ret = Parser::new(&allocator, source, SourceType::ts()).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let class_decl = ret.program.body.iter().find_map(|stmt| match stmt {
            oxc_ast::ast::Statement::ClassDeclaration(c) if !c.decorators.is_empty() => Some(c),
            _ => None,
        })?;
        let decorator = class_decl.decorators.first()?;
        let import_map = crate::analyzer::imports::extract_import_map(&ret.module_record);
        let angular_imports = crate::analyzer::imports::extract_angular_imports(
            &ret.module_record,
            &semantic_ret.semantic,
            false,
        );
        let env = crate::evaluator::value::ResolvedEnv::default();
        let foreign = crate::analyzer::resolvers::angular_foreign_resolvers();
        let eval = crate::evaluator::EvalInput {
            semantic: &semantic_ret.semantic,
            file: 0,
            import_map: &import_map,
            mode: crate::evaluator::EvalMode::Syntax,
            env: &env,
            foreign,
        };
        let converter = crate::utils::Utf8ToUtf16::new(source);
        parse_decorator(
            decorator,
            &converter,
            &semantic_ret.semantic,
            &import_map,
            &eval,
            &angular_imports,
        )
    }

    #[test]
    fn test_parse_ng_module_basic() {
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                declarations: [A, B],
                imports: [C, D],
                exports: [E, F],
                schemas: [CUSTOM_ELEMENTS_SCHEMA]
            })
            class MyModule {}
            class A {} class B {} class C {} class D {} class E {} class F {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let declarations: Vec<String> = meta
            .declarations
            .unwrap()
            .get_optional()
            .unwrap()
            .into_iter()
            .map(|s| s.name().to_string())
            .collect();
        let imports: Vec<String> = meta
            .imports
            .unwrap()
            .get_optional()
            .unwrap()
            .into_iter()
            .map(|s| s.name().to_string())
            .collect();
        let exports: Vec<String> = meta
            .exports
            .unwrap()
            .get_optional()
            .unwrap()
            .into_iter()
            .map(|s| s.name().to_string())
            .collect();

        assert_eq!(declarations, vec!["A", "B"]);
        assert_eq!(imports, vec!["C", "D"]);
        assert_eq!(exports, vec!["E", "F"]);
        assert_eq!(meta.schemas.unwrap(), vec!["CUSTOM_ELEMENTS_SCHEMA"]);
    }

    #[test]
    fn test_top_level_imports_keep_elements_as_written() {
        // Each element is one entry, kept exactly as written — parentheses included, since
        // ngtsc wraps the element node rather than its unwrapped inner expression.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: [C, provideD(), (E.forRoot()), [F, G]],
            })
            class MyModule {}
            class C {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .top_level_imports
            .as_ref()
            .expect("Expected top-level imports")
            .iter()
            .map(|entry| &source[entry.span.start as usize..entry.span.end as usize])
            .collect();
        assert_eq!(texts, vec!["C", "provideD()", "(E.forRoot())", "[F, G]"]);
    }

    #[test]
    fn test_top_level_imports_unwrap_spread_arguments() {
        // A spread contributes its argument: ngtsc pushes `element.expression`, treating
        // `...SHARED` exactly like a direct reference to `SHARED`.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: [...EMPTY, provideA(), ...TWO],
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .top_level_imports
            .as_ref()
            .expect("Expected top-level imports")
            .iter()
            .map(|entry| &source[entry.span.start as usize..entry.span.end as usize])
            .collect();
        assert_eq!(texts, vec!["EMPTY", "provideA()", "TWO"]);
    }

    #[test]
    fn test_top_level_imports_non_array_value_is_one_entry() {
        // A non-array `imports` value is a single top-level expression covering the whole thing.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: SHARED,
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .top_level_imports
            .as_ref()
            .expect("Expected top-level imports")
            .iter()
            .map(|entry| &source[entry.span.start as usize..entry.span.end as usize])
            .collect();
        assert_eq!(texts, vec!["SHARED"]);
    }

    #[test]
    fn test_top_level_imports_unwrap_parenthesized_array() {
        // ngtsc reads `imports` through `unwrapExpression`, so a parenthesized array still
        // splits into its elements rather than becoming one whole-expression entry.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: ([A, B]),
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .top_level_imports
            .as_ref()
            .expect("Expected top-level imports")
            .iter()
            .map(|entry| &source[entry.span.start as usize..entry.span.end as usize])
            .collect();
        assert_eq!(texts, vec!["A", "B"]);
    }

    #[test]
    fn test_top_level_imports_empty_array_is_empty_not_absent() {
        // `Some(vec![])` and `None` mean different things to `optimize_ng_module`: the former
        // is a module whose `imports` resolved to nothing, the latter has no recorded syntax
        // at all and falls back to reference filtering.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: [],
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        assert_eq!(
            meta.top_level_imports.as_deref().map(<[_]>::len),
            Some(0),
            "an empty `imports` array must record an empty entry list, not `None`"
        );
    }

    #[test]
    fn test_top_level_imports_duplicate_key_takes_the_last() {
        // A duplicate `imports:` key shadows the earlier one at runtime, so the recorded
        // syntax must be replaced rather than merged.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: [A, B],
                imports: [C],
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .top_level_imports
            .as_ref()
            .expect("Expected top-level imports")
            .iter()
            .map(|entry| &source[entry.span.start as usize..entry.span.end as usize])
            .collect();
        assert_eq!(texts, vec!["C"]);
    }

    #[test]
    fn test_top_level_imports_skip_type_only_syntax() {
        // The span is copied into a JavaScript file, so type-only syntax must be excluded —
        // TypeScript's printer erases it for ngtsc. Parentheses are kept otherwise.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: [A as any, B!, <any>C, (D as any), (E.forRoot())],
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .top_level_imports
            .as_ref()
            .expect("Expected top-level imports")
            .iter()
            .map(|entry| &source[entry.span.start as usize..entry.span.end as usize])
            .collect();
        assert_eq!(texts, vec!["A", "B", "C", "D", "(E.forRoot())"]);
    }

    #[test]
    fn test_top_level_imports_skip_satisfies_and_instantiation() {
        // `satisfies` and an instantiation expression (`f<T>`) are erased by TypeScript's printer
        // like the other type-only wrappers, so the span must exclude them. ngtsc's own
        // `unwrapExpression` handles neither — both are a fatal NG1010 there — so there is no
        // emitted output to match; peeling yields the sensible text for input ngtsc refuses.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: [A satisfies any, B<Thing>, (C satisfies any)],
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .top_level_imports
            .as_ref()
            .expect("Expected top-level imports")
            .iter()
            .map(|entry| &source[entry.span.start as usize..entry.span.end as usize])
            .collect();
        assert_eq!(texts, vec!["A", "B", "C"]);
    }

    /// LOCAL mode re-prints each element from source without resolving it, so it peels the same
    /// type-only syntax the optimized path does — ngtsc wraps each element in a `WrappedNodeExpr`
    /// in both modes, and its printer erases the assertion either way. Holes keep their slot.
    #[test]
    fn test_local_element_spans_peel_type_only_syntax() {
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: [A as any, B!, <any>C, (D as any), (E.forRoot()), , ...F],
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .local_imports_element_spans
            .as_ref()
            .expect("Expected local element spans")
            .iter()
            .map(|span| &source[span.start as usize..span.end as usize])
            .collect();
        // The spread keeps its `...`: peeling its argument would mean rewriting the text rather
        // than selecting a subrange of it.
        assert_eq!(texts, vec!["A", "B", "C", "D", "(E.forRoot())", "", "...F"]);
    }

    #[test]
    fn test_top_level_imports_skip_array_holes() {
        // An array hole can never be emitted verbatim (ngtsc rejects it with a fatal NG1010),
        // so it contributes no entry.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({
                imports: [A, , B],
            })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        let texts: Vec<&str> = meta
            .top_level_imports
            .as_ref()
            .expect("Expected top-level imports")
            .iter()
            .map(|entry| &source[entry.span.start as usize..entry.span.end as usize])
            .collect();
        assert_eq!(texts, vec!["A", "B"]);
    }

    /// The source text `id_span` selects, or `None` when no id was recorded.
    fn id_text(source: &str) -> Option<String> {
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        meta.id_span
            .map(|s| source[s.start as usize..s.end as usize].to_string())
    }

    #[test]
    fn test_ng_module_id_is_captured_verbatim_not_evaluated() {
        // ngtsc does not run the partial evaluator on `id`; it re-prints the expression as
        // written. So every shape below is captured as-is — including the ones an evaluator
        // could fold (the literal, the local `const`) and the ones it could not (the enum
        // member access, which is the shape that used to be dropped entirely).
        for (id_expr, expected) in [
            ("'literal_id'", "'literal_id'"),
            ("ChunkId.LAZY_THING", "ChunkId.LAZY_THING"),
            ("LOCAL_ID", "LOCAL_ID"),
            ("`tpl_${suffix}`", "`tpl_${suffix}`"),
            ("'a' + 'b'", "'a' + 'b'"),
            ("42", "42"),
        ] {
            let source = format!(
                r#"import {{NgModule}} from '@angular/core';
                @NgModule({{ id: {id_expr} }})
                class MyModule {{}}
            "#
            );
            assert_eq!(
                id_text(&source).as_deref(),
                Some(expected),
                "id `{id_expr}` must be captured verbatim"
            );
        }
    }

    #[test]
    fn test_ng_module_id_peels_type_only_syntax() {
        // The span is copied into the output, so it must exclude syntax TypeScript's printer
        // erases — the same rule `emit_span` applies to `imports` elements.
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({ id: ChunkId.LAZY_THING as any })
            class MyModule {}
        "#;
        assert_eq!(id_text(source).as_deref(), Some("ChunkId.LAZY_THING"));
    }

    #[test]
    fn test_ng_module_module_id_is_rejected_and_reported() {
        // ngtsc leaves `id` null for `module.id`, emitting neither the definition field nor
        // the `registerNgModuleType` call, and reports NG6100 against the expression.
        //
        // `module?.id` is rejected too: TypeScript keeps `?.` as a token on the
        // `PropertyAccessExpression`, so upstream's `ts.isPropertyAccessExpression` check sees
        // the same node shape. oxc models it as a `ChainExpression` instead, which is why the
        // guard has to step through one.
        for id_expr in ["module.id", "module?.id"] {
            let source = format!(
                r#"import {{NgModule}} from '@angular/core';
                @NgModule({{ id: {id_expr} }})
                class MyModule {{}}
            "#
            );
            let meta = parse_decorator_from_class(&source).expect("Expected metadata");
            assert!(
                meta.id_span.is_none(),
                "`{id_expr}` must not be emitted as an id"
            );
            let span = meta.module_id_span.expect("Expected NG6100 span");
            assert_eq!(&source[span.start as usize..span.end as usize], id_expr);
        }
    }

    #[test]
    fn test_ng_module_wrapped_module_id_is_accepted_like_ngtsc() {
        for (id_expr, expected) in [
            ("(module.id)", "(module.id)"),
            ("(module.id as any)", "module.id"),
            ("module.id!", "module.id"),
        ] {
            let source = format!(
                r#"import {{NgModule}} from '@angular/core';
                @NgModule({{ id: {id_expr} }})
                class MyModule {{}}
            "#
            );
            let meta = parse_decorator_from_class(&source).expect("Expected metadata");
            assert!(
                meta.module_id_span.is_none(),
                "`{id_expr}` does not match upstream's syntactic check"
            );
            assert_eq!(
                id_text(&source).as_deref(),
                Some(expected),
                "id `{id_expr}` must be emitted as ngtsc prints it"
            );
        }
    }

    #[test]
    fn test_ng_module_id_module_lookalikes_are_not_rejected() {
        for id_expr in ["module.name", "notModule.id", "module['id']", "a.module.id"] {
            let source = format!(
                r#"import {{NgModule}} from '@angular/core';
                @NgModule({{ id: {id_expr} }})
                class MyModule {{}}
            "#
            );
            let meta = parse_decorator_from_class(&source).expect("Expected metadata");
            assert!(
                meta.id_span.is_some() && meta.module_id_span.is_none(),
                "`{id_expr}` is not the `module.id` anti-pattern"
            );
        }
    }

    #[test]
    fn test_ng_module_absent_id_records_nothing() {
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({ imports: [A] })
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        assert!(meta.id_span.is_none());
        assert!(meta.module_id_span.is_none());
    }

    #[test]
    fn test_parse_ng_module_empty() {
        let source = r#"import {NgModule} from '@angular/core';
            @NgModule({})
            class MyModule {}
        "#;
        let meta = parse_decorator_from_class(source).expect("Expected metadata");
        assert!(meta.declarations.is_none());
        assert!(meta.imports.is_none());
        assert!(meta.exports.is_none());
        assert!(meta.schemas.is_none());
    }

    #[test]
    fn test_parse_not_ng_module() {
        let source = r#"import {Component} from '@angular/core';
            @Component({
                selector: 'my-comp'
            })
            class MyComp {}
        "#;
        let meta = parse_decorator_from_class(source);
        assert!(meta.is_none());
    }

    #[test]
    fn test_isolated_type_tuple_extraction() {
        use crate::analyzer::class_data::IsolatedTypeElementData;

        let source = r#"
            import {NgModule, forwardRef} from '@angular/core';
            import {AveLoggingModule} from '@external/ave-logging';
            import {FooModule, provideFoo} from './foo';
            import {isDev} from './config';

            class LocalModule {}
            class PermissionsChecker {}
            function getLocalImports() {
                return [LocalModule];
            }
            const NG_MODULE_IMPORTS = [AveLoggingModule];

            @NgModule({
                imports: [
                    NG_MODULE_IMPORTS,
                    FooModule.forRoot(),
                    provideFoo(),
                    getLocalImports(),
                    forwardRef(() => FooModule),
                    isDev ? LocalModule : PermissionsChecker,
                ],
                exports: [PermissionsChecker],
            })
            class PermissionsCheckerModule {}
        "#;

        let meta = parse_decorator_from_class(source).expect("Expected NgModuleData");
        let isolated_imports = meta
            .isolated_imports
            .as_ref()
            .expect("Expected isolated_imports");
        assert!(isolated_imports.is_array_literal);
        assert_eq!(isolated_imports.elements.len(), 6);

        // 0: `NG_MODULE_IMPORTS` (local const with unresolved import -> syntactic fallback `typeof NG_MODULE_IMPORTS`)
        match &isolated_imports.elements[0] {
            IsolatedTypeElementData::Typeof {
                span: Some(span),
                reference: None,
            } => {
                assert_eq!(
                    &source[span.start as usize..span.end as usize],
                    "NG_MODULE_IMPORTS"
                );
            }
            other => panic!("Expected Typeof span for NG_MODULE_IMPORTS, got {other:?}"),
        }

        // 1: `FooModule.forRoot()` -> CallReturnType with `FooModule.forRoot`
        match &isolated_imports.elements[1] {
            IsolatedTypeElementData::CallReturnType { callee_span } => {
                assert_eq!(
                    &source[callee_span.start as usize..callee_span.end as usize],
                    "FooModule.forRoot"
                );
            }
            other => panic!("Expected CallReturnType for FooModule.forRoot(), got {other:?}"),
        }

        // 2: `provideFoo()` -> CallReturnType with `provideFoo`
        match &isolated_imports.elements[2] {
            IsolatedTypeElementData::CallReturnType { callee_span } => {
                assert_eq!(
                    &source[callee_span.start as usize..callee_span.end as usize],
                    "provideFoo"
                );
            }
            other => panic!("Expected CallReturnType for provideFoo(), got {other:?}"),
        }

        // 3: `getLocalImports()` -> ReferenceTuple([LocalModule])
        match &isolated_imports.elements[3] {
            IsolatedTypeElementData::ReferenceTuple { references } => {
                assert_eq!(references.len(), 1);
                assert_eq!(references[0].name, "LocalModule");
            }
            other => panic!("Expected ReferenceTuple for getLocalImports(), got {other:?}"),
        }

        // 4: `forwardRef(() => FooModule)` -> Typeof span `FooModule`
        match &isolated_imports.elements[4] {
            IsolatedTypeElementData::Typeof {
                span: Some(span),
                reference: None,
            } => {
                assert_eq!(&source[span.start as usize..span.end as usize], "FooModule");
            }
            other => panic!("Expected Typeof span for forwardRef(() => FooModule), got {other:?}"),
        }

        // 5: `isDev ? LocalModule : PermissionsChecker` -> Never
        assert!(matches!(
            isolated_imports.elements[5],
            IsolatedTypeElementData::Never { .. }
        ));

        // exports: `[PermissionsChecker]` -> Typeof reference `PermissionsChecker`
        let isolated_exports = meta
            .isolated_exports
            .as_ref()
            .expect("Expected isolated_exports");
        assert!(isolated_exports.is_array_literal);
        assert_eq!(isolated_exports.elements.len(), 1);
        match &isolated_exports.elements[0] {
            IsolatedTypeElementData::Typeof {
                reference: Some(r), ..
            } => {
                assert_eq!(r.name, "PermissionsChecker");
            }
            other => panic!("Expected Typeof reference for PermissionsChecker, got {other:?}"),
        }
    }
}
