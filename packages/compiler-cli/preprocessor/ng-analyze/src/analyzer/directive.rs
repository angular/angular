use oxc_ast::ast::{Decorator, Expression, ObjectPropertyKind};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

use crate::analyzer::class_data::{
    DirectiveData, ExpressionValueData, ExpressionValueKind, HostPropertyData,
};
use crate::evaluator::{evaluate_expression, EvalInput, Resolved};

use super::evaluated_io::{IoKind, IoMetadataArray};
use super::input_output::object_literal_transform;
use super::queries::parse_legacy_query;
use super::utils::{extract_bool, extract_literal_string, extract_property_key, extract_string};

/// Parse a @Directive decorator
pub fn parse_decorator<'a>(
    decorator: &'a Decorator<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    eval: &EvalInput<'a, '_>,
) -> Option<DirectiveData> {
    let Expression::CallExpression(call_expr) = &decorator.expression else {
        return None;
    };

    if !crate::analyzer::utils::is_angular_decorator_named(
        decorator,
        "Directive",
        semantic,
        angular_imports,
    ) {
        return None;
    }

    parse_directive_args(
        call_expr,
        crate::analyzer::utils::extract_decorator_name(decorator),
        semantic,
        angular_imports,
        eval,
    )
}

/// `decorator_name` is the decorator's name exactly as written at the use site (an alias such as
/// `AngularDirective`, or a namespaced `core.Directive`), which `ɵsetClassMetadata` re-emits
/// verbatim the way ngtsc re-emits `decorator.identifier`.
pub fn parse_directive_args<'a>(
    call_expr: &'a oxc_ast::ast::CallExpression<'a>,
    decorator_name: Option<String>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    eval: &EvalInput<'a, '_>,
) -> Option<DirectiveData> {
    let mut data = match call_expr.arguments.first() {
        Some(oxc_ast::ast::Argument::ObjectExpression(obj)) => {
            extract_directive_metadata(obj, Some(obj.span()), semantic, angular_imports, eval)?
        }
        _ => DirectiveData::default(),
    };
    data.decorator_name = decorator_name;
    Some(data)
}

// Roughly mimics the shape of `extractDirectiveMetadata` in the compiler-cli:
// https://github.com/angular/angular/blob/1c9c4536d6029372b192b2561d60bad6ba7d87e8/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L128
//
// Returns `None` when the decorator opts into JIT compilation (`jit: true`), mirroring the
// reference's `jitForced` early return: the class is skipped entirely — no analysis is
// produced and the decorator is left intact for runtime JIT compilation. The reference keys
// off the mere presence of the `jit` property (its type only permits `true`):
// https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L176-L179
pub fn extract_directive_metadata<'a>(
    obj: &'a oxc_ast::ast::ObjectExpression<'a>,
    args_span: Option<oxc_span::Span>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    eval: &EvalInput<'a, '_>,
) -> Option<DirectiveData> {
    let has_jit = obj.properties.iter().any(|prop| {
        matches!(prop, ObjectPropertyKind::ObjectProperty(p)
            if extract_property_key(&p.key).as_deref() == Some("jit"))
    });

    let has_template_url = obj.properties.iter().any(|prop| {
        matches!(prop, ObjectPropertyKind::ObjectProperty(p)
            if extract_property_key(&p.key).as_deref() == Some("templateUrl"))
    });

    let mut data = DirectiveData {
        args_span,
        is_jit: has_jit,
        ..Default::default()
    };

    let mut preserved_decorator_properties = Vec::new();

    for prop in &obj.properties {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        let Some(key_name) = extract_property_key(&p.key) else {
            continue;
        };

        // Record every NON-resource property so it can be re-emitted verbatim in
        // `ɵsetClassMetadata`. The resource fields are excluded because the metadata block
        // regenerates them (templateUrl -> inline `template`, styleUrls/styleUrl/styles ->
        // a collapsed `styles` array), mirroring the reference's `transformDecoratorResources`.
        // If `templateUrl` is present, `template` is also excluded as it is superseded by `templateUrl`.
        let is_resource = match key_name.as_ref() {
            "templateUrl" | "styleUrls" | "styleUrl" | "styles" => true,
            "template" => has_template_url,
            _ => false,
        };

        if !is_resource {
            preserved_decorator_properties.push(p.span());
        }

        match key_name.as_ref() {
            "selector" => {
                data.selector_span = Some(p.value.span());
                let evaluated = evaluate_expression(&p.value, eval);
                data.selector = Some(Resolved::from_syntax(evaluated, eval.file));
            }
            "standalone" => {
                data.standalone_span = Some(p.value.span());
                match extract_bool(&p.value, semantic) {
                    Some(value) => data.standalone = value,
                    None => {
                        data.standalone = true;
                        data.standalone_dynamic = true;
                    }
                }
            }
            "signals" => data.signals = extract_bool(&p.value, semantic).unwrap_or(false),
            "exportAs" => {
                data.export_as_span = Some(p.value.span());
                data.export_as = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));
            }
            "host" => {
                // Two independent readings of the same expression, as in ngtsc's
                // `extractHostBindings`: the partial evaluator drives compilation, while the
                // untouched object-literal syntax drives the type-check block.
                // https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L607-L622
                data.host_expr = Some(Box::new(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                )));
                data.host_span = Some(p.value.span());
                data.host_properties = extract_host_object(&p.value);
            }
            "hostDirectives" => {
                // Evaluated via the partial evaluator (`extractHostDirectives` in ngtsc `shared.ts`).
                data.host_directives = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));
            }
            "providers" => {
                data.providers_span = Some(p.value.span());
            }
            // ngtsc evaluates the whole field, so the array may be reached through a
            // constant or assembled from spreads and `concat`:
            // https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L195-L231
            "inputs" => {
                let array = IoMetadataArray {
                    kind: IoKind::Input,
                    value: Resolved::from_syntax(evaluate_expression(&p.value, eval), eval.file),
                    span: p.value.span(),
                    transforms: inline_input_transforms(&p.value, semantic),
                };
                fold_or_defer_io_array(&mut data, array);
            }
            "outputs" => {
                let array = IoMetadataArray {
                    kind: IoKind::Output,
                    value: Resolved::from_syntax(evaluate_expression(&p.value, eval), eval.file),
                    span: p.value.span(),
                    transforms: Vec::new(),
                };
                fold_or_defer_io_array(&mut data, array);
            }
            "queries" => {
                if let Expression::ObjectExpression(queries_obj) = p.value.get_inner_expression() {
                    for prop in &queries_obj.properties {
                        let ObjectPropertyKind::ObjectProperty(qp) = prop else {
                            continue;
                        };
                        let Some(prop_name) = extract_property_key(&qp.key).map(|n| n.into_owned())
                        else {
                            continue;
                        };
                        if let Some(query) = parse_legacy_query(
                            prop_name,
                            &qp.value,
                            angular_imports,
                            semantic,
                            eval,
                        ) {
                            data.fields
                                .push(crate::analyzer::class_data::AngularField::Query(query));
                        }
                    }
                }
            }
            _ => {}
        }
    }

    data.preserved_decorator_properties = Some(preserved_decorator_properties);

    Some(data)
}

/// Fold an evaluated `inputs`/`outputs` array into the directive's fields now, or keep it for
/// Stage 2 when it names a constant from another file. Member-level declarations are merged
/// over the result later (`populate_directive_members`), as ngtsc's `{...meta, ...fields}` does.
fn fold_or_defer_io_array(data: &mut DirectiveData, array: IoMetadataArray) {
    if data.fold_io_array(&array, &[]) {
        return;
    }
    data.evaluated_io
        .get_or_insert_with(Default::default)
        .arrays
        .push(array);
}

/// The transforms of the `inputs` entries written in place as object literals, keyed by the
/// class property each names. The entries themselves are read through the evaluator; a
/// transform is emitted from its source text, so it is taken from the syntax.
fn inline_input_transforms<'a>(
    inputs: &'a Expression<'a>,
    semantic: &Semantic<'a>,
) -> Vec<(String, crate::analyzer::class_data::TransformData)> {
    let expr = inputs.get_inner_expression();
    let arr = match expr {
        Expression::ArrayExpression(arr) => Some(arr.as_ref()),
        Expression::Identifier(ident) => {
            let symbol_id = ident
                .reference_id
                .get()
                .and_then(|r| semantic.scoping().get_reference(r).symbol_id())
                .or_else(|| semantic.scoping().get_root_binding(ident.name));
            symbol_id.and_then(|sym| {
                let decl = semantic.symbol_declaration(sym);
                match decl.kind() {
                    oxc_ast::AstKind::VariableDeclarator(v) => match &v.init {
                        Some(Expression::ArrayExpression(arr)) => Some(arr.as_ref()),
                        _ => None,
                    },
                    _ => None,
                }
            })
        }
        _ => None,
    };
    let Some(arr) = arr else {
        return Vec::new();
    };
    arr.elements
        .iter()
        .filter_map(|element| {
            let Expression::ObjectExpression(obj) = element.as_expression()?.get_inner_expression()
            else {
                return None;
            };
            let transform = object_literal_transform(obj)?;
            let name = obj.properties.iter().find_map(|prop| {
                let ObjectPropertyKind::ObjectProperty(p) = prop else {
                    return None;
                };
                (extract_property_key(&p.key).as_deref() == Some("name"))
                    .then(|| extract_string(&p.value, semantic))
                    .flatten()
            })?;
            Some((name, transform))
        })
        .collect()
}

/// Extract the *syntax* of a `host` object literal, for the type-check block.
///
/// Deliberately unevaluated: ngtsc maps each property through `sourceNodeFromTs`, which keeps
/// only string literals and identifiers and reports everything else as unspecified, and skips
/// the whole step unless `host` is written as an object literal. Compilation reads the
/// evaluated form instead (`DirectiveData::host_expr`).
/// https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L610-L622
pub fn extract_host_object(expr: &Expression) -> Vec<HostPropertyData> {
    let mut properties = Vec::new();

    let Expression::ObjectExpression(obj) = expr else {
        return properties;
    };

    for prop in &obj.properties {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };

        // Get the key - use the shared helper
        let Some(key) = extract_property_key(&p.key).map(|n| n.into_owned()) else {
            continue;
        };

        // Optional: exclude quotes from span if it's a string literal
        let mut raw_key_span = p.key.span();
        let key_kind = if matches!(&p.key, oxc_ast::ast::PropertyKey::StringLiteral(_)) {
            raw_key_span = oxc_span::Span::new(raw_key_span.start + 1, raw_key_span.end - 1);
            ExpressionValueKind::String
        } else {
            ExpressionValueKind::Identifier
        };
        let key_node = ExpressionValueData {
            kind: key_kind,
            text: Some(key),
            span: raw_key_span,
        };

        // Get the value - should be a string literal for host bindings
        let mut raw_value_span = p.value.span();

        let (value_text, value_kind) = if let Some(text) = extract_literal_string(&p.value) {
            raw_value_span = oxc_span::Span::new(raw_value_span.start + 1, raw_value_span.end - 1);
            (Some(text), ExpressionValueKind::String)
        } else if let Expression::Identifier(ident) = &p.value {
            (
                Some(ident.name.to_string()),
                ExpressionValueKind::Identifier,
            )
        } else {
            (None, ExpressionValueKind::Unspecified)
        };
        let value_node = ExpressionValueData {
            kind: value_kind,
            text: value_text,
            span: raw_value_span,
        };

        properties.push(HostPropertyData {
            key: key_node,
            value: value_node,
        });
    }

    properties
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::analyzer::class_data::TransformData;
    use crate::analyzer::AngularField;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    #[test]
    fn test_extract_host_object_spans() {
        let source_text = r#"
            let x = {
                'class.active': "isActive",
                '[attr.disabled]': isDisabled
            };
        "#;

        let allocator = Allocator::default();
        let source_type = SourceType::default();
        let ret = Parser::new(&allocator, source_text, source_type).parse();

        // Extract the object expression
        let mut object_expr = None;
        if let oxc_ast::ast::Statement::VariableDeclaration(decl) = &ret.program.body[0] {
            if let Some(init) = &decl.declarations[0].init {
                object_expr = Some(init);
            }
        }

        let expr = object_expr.expect("Expected object expression");

        let properties = extract_host_object(expr);

        assert_eq!(properties.len(), 2);

        // Check first property
        assert_eq!(properties[0].key.text, Some("class.active".to_string()));
        assert_eq!(properties[0].value.text, Some("isActive".to_string()));
        let key1_start = source_text.find("class.active").unwrap() as u32;
        assert_eq!(properties[0].key.span.start, key1_start);
        assert_eq!(properties[0].key.span.end, key1_start + 12);

        let val1_start = source_text.find("isActive").unwrap() as u32;
        assert_eq!(properties[0].value.span.start, val1_start);
        assert_eq!(properties[0].value.span.end, val1_start + 8);

        // Check second property
        assert_eq!(properties[1].key.text, Some("[attr.disabled]".to_string()));
        assert_eq!(properties[1].value.text, Some("isDisabled".to_string()));
        assert_eq!(properties[1].value.kind, ExpressionValueKind::Identifier);
        let key2_start = source_text.find("[attr.disabled]").unwrap() as u32;
        assert_eq!(properties[1].key.span.start, key2_start);
        assert_eq!(properties[1].key.span.end, key2_start + 15);

        // The value isDisabled is not a string literal, so we still get the full source for it
        let val2_start = source_text.find("isDisabled").unwrap() as u32;
        assert_eq!(properties[1].value.span.start, val2_start);
        assert_eq!(properties[1].value.span.end, val2_start + 10);
    }

    #[test]
    fn test_extract_host_object_no_substitution_template_literal() {
        // A no-substitution template literal host value (e.g. an animation binding) must be
        // treated as a plain string of its cooked content, with the backticks excluded from
        // the span, so the binding parser receives a parseable Angular expression.
        let source_text = "let x = { '[@anim]': `{ value: _v, params: { p: _p } }` };";

        let allocator = Allocator::default();
        let source_type = SourceType::default();
        let ret = Parser::new(&allocator, source_text, source_type).parse();

        let mut object_expr = None;
        if let oxc_ast::ast::Statement::VariableDeclaration(decl) = &ret.program.body[0] {
            if let Some(init) = &decl.declarations[0].init {
                object_expr = Some(init);
            }
        }
        let expr = object_expr.expect("Expected object expression");
        let properties = extract_host_object(expr);

        assert_eq!(properties.len(), 1);
        assert_eq!(properties[0].key.text, Some("[@anim]".to_string()));
        // Cooked content without the surrounding backticks.
        assert_eq!(
            properties[0].value.text,
            Some("{ value: _v, params: { p: _p } }".to_string())
        );
        assert_eq!(properties[0].value.kind, ExpressionValueKind::String);

        // Span must exclude the backticks.
        let backtick_start = source_text.find('`').unwrap() as u32;
        let backtick_end = source_text.rfind('`').unwrap() as u32;
        assert_eq!(properties[0].value.span.start, backtick_start + 1);
        assert_eq!(properties[0].value.span.end, backtick_end);
    }

    #[test]
    fn test_extract_directive_metadata_signals() {
        let source_text = r#"
            let x = {
                selector: '[signalDir]',
                standalone: false,
                signals: true
            };
        "#;

        let allocator = Allocator::default();
        let source_type = SourceType::default();
        let ret = Parser::new(&allocator, source_text, source_type).parse();

        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);

        let mut object_expr = None;
        if let oxc_ast::ast::Statement::VariableDeclaration(decl) = &ret.program.body[0] {
            if let Some(init) = &decl.declarations[0].init {
                object_expr = Some(init);
            }
        }

        let expr = object_expr.expect("Expected object expression");
        let oxc_ast::ast::Expression::ObjectExpression(obj) = expr else {
            panic!("Expected object expression");
        };

        let import_map = crate::analyzer::extract_import_map(&ret.module_record);
        let angular_imports = crate::analyzer::imports::extract_angular_imports(
            &ret.module_record,
            &semantic_ret.semantic,
            false,
        );
        let env = crate::evaluator::ResolvedEnv::new();
        let interner = crate::query::FileIdInterner::new();
        let eval = EvalInput {
            semantic: &semantic_ret.semantic,
            file: interner.intern_path("/test/file.ts"),
            import_map: &import_map,
            mode: crate::evaluator::EvalMode::Syntax,
            env: &env,
            foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
        };
        let meta =
            extract_directive_metadata(obj, None, &semantic_ret.semantic, &angular_imports, &eval)
                .expect("non-jit metadata should be extracted");

        assert_eq!(
            meta.selector.as_ref().and_then(Resolved::get_optional),
            Some("[signalDir]".to_string())
        );
        assert!(!meta.standalone);
        assert!(meta.signals);
    }

    #[test]
    fn test_extract_directive_metadata_legacy_decorator_fields() {
        let source_text = r#"
            import { Component, Input, Output, ViewChild, ContentChildren, TemplateRef } from '@angular/core';
            
            let x = {
                inputs: [
                    'simpleInput',
                    'propertyWithAlias: publicAlias',
                    { name: 'objectInput', alias: 'objAlias', required: true }
                ],
                outputs: [
                    'simpleOutput',
                    'outputWithAlias: publicOutputAlias'
                ],
                queries: {
                    myViewChild: new ViewChild('myRef', { static: true }),
                    myContentChildren: new ContentChildren(TemplateRef)
                }
            };
        "#;

        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source_text, source_type).parse();

        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);

        let mut object_expr = None;
        if let oxc_ast::ast::Statement::VariableDeclaration(decl) = &ret.program.body[1] {
            if let Some(init) = &decl.declarations[0].init {
                object_expr = Some(init);
            }
        }

        let expr = object_expr.expect("Expected object expression");
        let oxc_ast::ast::Expression::ObjectExpression(obj) = expr else {
            panic!("Expected object expression");
        };

        let import_map = crate::analyzer::extract_import_map(&ret.module_record);
        let angular_imports = crate::analyzer::imports::extract_angular_imports(
            &ret.module_record,
            &semantic_ret.semantic,
            false,
        );
        let env = crate::evaluator::ResolvedEnv::new();
        let interner = crate::query::FileIdInterner::new();
        let eval = EvalInput {
            semantic: &semantic_ret.semantic,
            file: interner.intern_path("/test/file.ts"),
            import_map: &import_map,
            mode: crate::evaluator::EvalMode::Syntax,
            env: &env,
            foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
        };

        let meta =
            extract_directive_metadata(obj, None, &semantic_ret.semantic, &angular_imports, &eval)
                .expect("non-jit metadata should be extracted");

        let mut inputs = Vec::new();
        let mut outputs = Vec::new();
        let mut queries = Vec::new();

        for field in meta.fields {
            match field {
                crate::analyzer::class_data::AngularField::Input(i) => inputs.push(i),
                crate::analyzer::class_data::AngularField::Output(o) => outputs.push(o),
                crate::analyzer::class_data::AngularField::Query(q) => queries.push(q),
                _ => {}
            }
        }

        // Verify Inputs
        assert_eq!(inputs.len(), 3);

        assert_eq!(inputs[0].name, "simpleInput");
        assert_eq!(inputs[0].alias, None);
        assert!(!inputs[0].required);

        assert_eq!(inputs[1].name, "propertyWithAlias");
        assert_eq!(inputs[1].alias.as_deref(), Some("publicAlias"));
        assert!(!inputs[1].required);

        assert_eq!(inputs[2].name, "objectInput");
        assert_eq!(inputs[2].alias.as_deref(), Some("objAlias"));
        assert!(inputs[2].required);

        // Verify Outputs
        assert_eq!(outputs.len(), 2);

        assert_eq!(outputs[0].name, "simpleOutput");
        assert_eq!(outputs[0].alias, None);

        assert_eq!(outputs[1].name, "outputWithAlias");
        assert_eq!(outputs[1].alias.as_deref(), Some("publicOutputAlias"));

        // Verify Queries
        assert_eq!(queries.len(), 2);

        assert_eq!(queries[0].property_name, "myViewChild");
        assert!(queries[0].first);
        assert!(queries[0].is_view);
        assert!(queries[0].is_static);
        assert_eq!(
            &source_text
                [queries[0].predicate_span.start as usize..queries[0].predicate_span.end as usize],
            "'myRef'"
        );

        assert_eq!(queries[1].property_name, "myContentChildren");
        assert!(!queries[1].first);
        assert!(!queries[1].is_view);
        assert_eq!(
            &source_text
                [queries[1].predicate_span.start as usize..queries[1].predicate_span.end as usize],
            "TemplateRef"
        );
    }

    /// Parses `source_text`, locates the first `let x = {...}` object literal, and runs
    /// `extract_directive_metadata` over it.
    fn extract_metadata_from_object_literal(source_text: &str) -> Option<DirectiveData> {
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source_text, source_type).parse();

        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);

        let obj = ret
            .program
            .body
            .iter()
            .find_map(|stmt| {
                let oxc_ast::ast::Statement::VariableDeclaration(decl) = stmt else {
                    return None;
                };
                match &decl.declarations[0].init {
                    Some(oxc_ast::ast::Expression::ObjectExpression(obj)) => Some(obj),
                    _ => None,
                }
            })
            .expect("Expected object expression");

        let import_map = crate::analyzer::extract_import_map(&ret.module_record);
        let angular_imports = crate::analyzer::imports::extract_angular_imports(
            &ret.module_record,
            &semantic_ret.semantic,
            false,
        );
        let env = crate::evaluator::ResolvedEnv::new();
        let interner = crate::query::FileIdInterner::new();
        let eval = EvalInput {
            semantic: &semantic_ret.semantic,
            file: interner.intern_path("/test/file.ts"),
            import_map: &import_map,
            mode: crate::evaluator::EvalMode::Syntax,
            env: &env,
            foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
        };

        extract_directive_metadata(obj, None, &semantic_ret.semantic, &angular_imports, &eval)
    }

    #[test]
    fn test_extract_directive_metadata_jit_true_records_is_jit() {
        let meta = extract_metadata_from_object_literal(
            r#"
            let x = {
                selector: '[jitDir]',
                jit: true
            };
        "#,
        )
        .expect("jit: true metadata should be extracted with is_jit flag");
        assert!(meta.is_jit, "jit: true must record is_jit: true");
    }

    #[test]
    fn test_extract_directive_metadata_jit_false_records_is_jit() {
        // The reference keys off the presence of the `jit` property, not its value
        // (`directive.has('jit')` in shared.ts), since its type only permits `true`.
        let meta = extract_metadata_from_object_literal(
            r#"
            let x = {
                selector: '[jitDir]',
                jit: false
            };
        "#,
        )
        .expect("jit: false metadata should be extracted with is_jit flag");
        assert!(meta.is_jit, "presence of `jit` must record is_jit: true");
    }

    #[test]
    fn test_extract_directive_metadata_without_jit_is_extracted() {
        let meta = extract_metadata_from_object_literal(
            r#"
            let x = {
                selector: '[plainDir]'
            };
        "#,
        )
        .expect("non-jit metadata should be extracted");
        assert_eq!(
            meta.selector.as_ref().and_then(Resolved::get_optional),
            Some("[plainDir]".to_string())
        );
        assert!(!meta.is_jit);
    }

    #[test]
    fn test_extract_directive_metadata_template_url_excludes_template_from_preserved_properties() {
        let meta = extract_metadata_from_object_literal(
            r#"
            let x = {
                selector: 'app-comp',
                template: '',
                templateUrl: './app.html'
            };
        "#,
        )
        .expect("metadata should be extracted");

        let preserved = meta
            .preserved_decorator_properties
            .expect("preserved properties should exist");
        // Only `selector` should be preserved, both `template` and `templateUrl` should be excluded
        assert_eq!(preserved.len(), 1);
    }

    #[test]
    fn test_extract_directive_metadata_inline_template_preserved_when_no_template_url() {
        let meta = extract_metadata_from_object_literal(
            r#"
            let x = {
                selector: 'app-comp',
                template: '<div>Hello</div>'
            };
        "#,
        )
        .expect("metadata should be extracted");

        let preserved = meta
            .preserved_decorator_properties
            .expect("preserved properties should exist");
        // Both `selector` and `template` should be preserved when there is no `templateUrl`
        assert_eq!(preserved.len(), 2);
    }

    fn legacy_inputs(meta: &DirectiveData) -> Vec<&crate::analyzer::class_data::InputData> {
        meta.fields
            .iter()
            .filter_map(|field| match field {
                AngularField::Input(input) => Some(input),
                _ => None,
            })
            .collect()
    }

    fn legacy_outputs(meta: &DirectiveData) -> Vec<&crate::analyzer::class_data::OutputData> {
        meta.fields
            .iter()
            .filter_map(|field| match field {
                AngularField::Output(output) => Some(output),
                _ => None,
            })
            .collect()
    }

    #[test]
    fn test_legacy_inputs_through_constant() {
        // The `@angular/material-experimental/popover-edit` shape.
        let meta = extract_metadata_from_object_literal(
            r#"
            const POPOVER_EDIT_INPUTS = [
                {name: 'template', alias: 'matPopoverEdit'},
                {name: 'context', alias: 'matPopoverEditContext'},
            ];
            let x = { selector: '[matPopoverEdit]', inputs: POPOVER_EDIT_INPUTS };
        "#,
        )
        .expect("metadata should be extracted");

        let inputs = legacy_inputs(&meta);
        assert_eq!(
            inputs
                .iter()
                .map(|i| (i.name.as_str(), i.alias.as_deref()))
                .collect::<Vec<_>>(),
            vec![
                ("template", Some("matPopoverEdit")),
                ("context", Some("matPopoverEditContext")),
            ]
        );
        assert!(inputs.iter().all(|i| i.property_span.is_none()));
        assert!(meta.evaluated_io.is_none(), "a same-file value is complete");
    }

    #[test]
    fn test_legacy_inputs_spread_concat_and_as_const() {
        let meta = extract_metadata_from_object_literal(
            r#"
            const BASE = ['a', 'b: bAlias'] as const;
            const MORE = ['d'];
            let x = { inputs: [...BASE, 'c'].concat(MORE) };
        "#,
        )
        .expect("metadata should be extracted");

        assert_eq!(
            legacy_inputs(&meta)
                .iter()
                .map(|i| (i.name.as_str(), i.alias.as_deref()))
                .collect::<Vec<_>>(),
            vec![("a", None), ("b", Some("bAlias")), ("c", None), ("d", None)]
        );
    }

    #[test]
    fn test_legacy_outputs_through_constant() {
        let meta = extract_metadata_from_object_literal(
            r#"
            const OUTPUTS = ['opened', 'closed: matClosed'];
            let x = { outputs: [...OUTPUTS, 'toggled'] };
        "#,
        )
        .expect("metadata should be extracted");

        assert_eq!(
            legacy_outputs(&meta)
                .iter()
                .map(|o| (o.name.as_str(), o.alias.as_deref()))
                .collect::<Vec<_>>(),
            vec![
                ("opened", None),
                ("closed", Some("matClosed")),
                ("toggled", None)
            ]
        );
    }

    #[test]
    fn test_legacy_inputs_later_entry_replaces_earlier() {
        // ngtsc keys the result by property name, so the last entry wins, in place.
        let meta = extract_metadata_from_object_literal(
            r#"
            const BASE = ['value', 'other'];
            let x = { inputs: [...BASE, {name: 'value', alias: 'v', required: true}] };
        "#,
        )
        .expect("metadata should be extracted");

        let inputs = legacy_inputs(&meta);
        assert_eq!(inputs.len(), 2);
        assert_eq!(inputs[0].name, "value");
        assert_eq!(inputs[0].alias.as_deref(), Some("v"));
        assert!(inputs[0].required);
        assert_eq!(inputs[1].name, "other");
    }

    #[test]
    fn test_legacy_inputs_mapping_string_keeps_two_segments() {
        // `parseMappingString` is `split(':', 2)`: a third segment is dropped.
        let meta = extract_metadata_from_object_literal(
            r#"
            let x = { inputs: [' field : binding : extra '] };
        "#,
        )
        .expect("metadata should be extracted");

        let inputs = legacy_inputs(&meta);
        assert_eq!(inputs[0].name, "field");
        assert_eq!(inputs[0].alias.as_deref(), Some("binding"));
    }

    #[test]
    fn test_legacy_input_transforms_through_constant() {
        let source = r#"
            function toNumber(v: string | number) { return Number(v); }
            const INPUTS = [
                {name: 'typed', transform: (v: boolean | string) => v !== false},
                {name: 'untyped', transform: (v) => v},
                {name: 'declared', transform: toNumber},
            ];
            let x = { inputs: INPUTS };
        "#;
        let meta =
            extract_metadata_from_object_literal(source).expect("metadata should be extracted");

        let inputs = legacy_inputs(&meta);
        let text = |span: oxc_span::Span| &source[span.start as usize..span.end as usize];

        let Some(TransformData::Type {
            type_span,
            value_span,
        }) = inputs[0].transform
        else {
            panic!("expected a typed transform, got {:?}", inputs[0].transform);
        };
        assert_eq!(text(type_span), "boolean | string");
        assert_eq!(text(value_span), "(v: boolean | string) => v !== false");

        // As on `@Input({transform})`, an untyped inline function records no transform.
        assert!(inputs[1].transform.is_none());

        let Some(TransformData::Expression(span)) = inputs[2].transform else {
            panic!(
                "expected an expression transform, got {:?}",
                inputs[2].transform
            );
        };
        assert_eq!(text(span), "toNumber");
    }

    #[test]
    fn test_legacy_inputs_imported_constant_is_kept_for_stage_2() {
        let meta = extract_metadata_from_object_literal(
            r#"
            import {BASE_INPUTS, BASE_OUTPUTS} from './base';
            let x = { inputs: [...BASE_INPUTS, 'local'], outputs: BASE_OUTPUTS };
        "#,
        )
        .expect("metadata should be extracted");

        // Under EvaluatedIo, array evaluation with unresolved spread constants waits for Stage 2.
        let inputs = legacy_inputs(&meta);
        assert!(inputs.is_empty());
        let evaluated_io = meta.evaluated_io.as_ref().expect("pending io");
        assert_eq!(evaluated_io.arrays.len(), 2);
        assert!(legacy_outputs(&meta).is_empty());
    }

    /// The directive names (and their `isForwardReference` flags) a `hostDirectives` value
    /// reduced to, in order.
    fn host_directive_names(source_text: &str) -> Vec<(String, bool)> {
        let meta = extract_metadata_from_object_literal(source_text)
            .expect("non-jit metadata should be extracted");
        meta.host_directives
            .as_ref()
            .and_then(Resolved::get_optional)
            .expect("hostDirectives should reduce")
            .into_iter()
            .map(|entry| (entry.directive.name().to_string(), entry.is_forward_ref))
            .collect()
    }

    #[test]
    fn host_directives_resolves_indirect_spellings() {
        // Each of these is a spelling upstream accepts for free, because it evaluates the
        // `hostDirectives` expression rather than matching the array literal syntactically.
        let cases: &[(&str, &str)] = &[
            ("array literal", "hostDirectives: [Dir]"),
            ("const-referenced array", "hostDirectives: HOST_DIRS"),
            ("spread element", "hostDirectives: [...HOST_DIRS]"),
            ("const-aliased class", "hostDirectives: [Aliased]"),
            (
                "object literal entry",
                "hostDirectives: [{ directive: Dir }]",
            ),
        ];
        for (label, field) in cases {
            let source = format!(
                r#"
                class Dir {{}}
                const HOST_DIRS = [Dir];
                const Aliased = Dir;
                let x = {{ {field} }};
                "#
            );
            assert_eq!(
                host_directive_names(&source),
                vec![("Dir".to_string(), false)],
                "{label} should resolve to Dir"
            );
        }
    }

    #[test]
    fn host_directives_recognizes_forward_ref_value_alias() {
        let names = host_directive_names(
            r#"
            import { forwardRef } from '@angular/core';
            const fref = forwardRef;
            let x = { hostDirectives: [forwardRef(() => Dir), fref(() => Other)] };
            class Dir {}
            class Other {}
            "#,
        );
        assert_eq!(
            names,
            vec![("Dir".to_string(), true), ("Other".to_string(), true)]
        );
    }

    #[test]
    fn host_directives_parse_input_and_output_mappings() {
        let meta = extract_metadata_from_object_literal(
            r#"
            const INPUTS = ['a: b', 'plain'];
            let x = {
                hostDirectives: [{ directive: Dir, inputs: INPUTS, outputs: ['c: d'] }]
            };
            class Dir {}
            "#,
        )
        .expect("non-jit metadata should be extracted");
        let entries = meta
            .host_directives
            .as_ref()
            .and_then(Resolved::get_optional)
            .expect("hostDirectives should reduce");
        let [entry] = entries.as_slice() else {
            panic!("expected exactly one host directive");
        };
        let pairs = |bindings: &Option<Vec<crate::types::metadata::HostDirectiveBinding>>| {
            bindings
                .as_ref()
                .map(|list| {
                    list.iter()
                        .map(|b| (b.public_name.clone(), b.binding_name.clone()))
                        .collect::<Vec<_>>()
                })
                .unwrap_or_default()
        };
        // `'plain'` with no alias maps the field onto itself.
        assert_eq!(
            pairs(&entry.inputs),
            vec![
                ("a".to_string(), "b".to_string()),
                ("plain".to_string(), "plain".to_string())
            ]
        );
        assert_eq!(
            pairs(&entry.outputs),
            vec![("c".to_string(), "d".to_string())]
        );
    }

    #[test]
    fn host_directives_skips_entries_that_name_no_class() {
        // Upstream throws on these; we drop the entry rather than the whole class.
        assert!(host_directive_names(
            r#"
            let x = { hostDirectives: [42, 'Dir', null] };
            "#
        )
        .is_empty());
    }
}
