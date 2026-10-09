use oxc_ast::ast::{Argument, CallExpression, ClassElement, Decorator, Expression};

use crate::analyzer::class_data::{
    ExpressionValueData, ExpressionValueKind, HostBindingData, HostListenerArgsError,
    HostListenerData,
};
use crate::analyzer::imports::AngularImports;

use super::utils::{extract_literal_string, extract_property_key, is_angular_decorator_named};
use crate::evaluator::{EvalInput, Resolved};
use oxc_span::GetSpan;

/// Parse @HostBinding() decorator on a property or accessor
pub fn parse_host_binding_decorator<'a>(
    decorator: &'a Decorator<'a>,
    member_name: ExpressionValueData,
    member_span: oxc_span::Span,
    eval: &EvalInput<'a, '_>,
    angular_imports: &AngularImports,
) -> Option<HostBindingData> {
    if !is_angular_decorator_named(decorator, "HostBinding", eval.semantic, angular_imports) {
        return None;
    }
    match &decorator.expression {
        // @HostBinding() or @HostBinding('propName')
        Expression::CallExpression(call) => {
            parse_host_binding_args(call, member_name, decorator.span, member_span, eval)
        }
        // @HostBinding / @core.HostBinding (no parentheses - uses the property name as binding).
        // Matched precisely rather than with a catch-all: a wrapped call such as
        // `@(HostBinding('class.active'))` must not be mistaken for the no-argument form, which
        // would silently drop the argument. ngtsc rejects those outright in `_reflectDecorator`,
        // since `isDecoratorIdentifier` only accepts an identifier or a single-level `a.b`.
        Expression::Identifier(_) | Expression::StaticMemberExpression(_) => {
            Some(HostBindingData {
                member_name,
                arguments: vec![],
                host_property_name: None,
                decorator_span: decorator.span,
                member_span,
            })
        }
        _ => None,
    }
}

fn create_source_node(
    span: oxc_span::Span,
    kind: ExpressionValueKind,
    text: Option<String>,
) -> ExpressionValueData {
    ExpressionValueData { kind, text, span }
}

/// Classify expression kind according to ngtsc's `sourceNodeFromTs` (for TCB host metadata):
/// StringLiteral and NoSubstitutionTemplateLiteral -> String, Identifier -> Identifier,
/// any other expression -> Unspecified (intentionally unevaluated).
/// https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L783-L803
fn classify_source_node_kind(expr: &Expression<'_>) -> ExpressionValueKind {
    if extract_literal_string(expr).is_some() {
        ExpressionValueKind::String
    } else if matches!(expr, Expression::Identifier(_)) {
        ExpressionValueKind::Identifier
    } else {
        ExpressionValueKind::Unspecified
    }
}

fn parse_host_argument_expression(
    expr: Option<&Expression<'_>>,
    span: oxc_span::Span,
) -> ExpressionValueData {
    let Some(expr) = expr else {
        return create_source_node(span, ExpressionValueKind::Unspecified, None);
    };

    let kind = classify_source_node_kind(expr);
    let text = match kind {
        ExpressionValueKind::String => extract_literal_string(expr),
        ExpressionValueKind::Identifier => match expr {
            Expression::Identifier(ident) => Some(ident.name.to_string()),
            _ => None,
        },
        _ => None,
    };

    create_source_node(span, kind, text)
}

fn parse_host_binding_args(
    call: &CallExpression,
    name_node: ExpressionValueData,
    decorator_span: oxc_span::Span,
    member_span: oxc_span::Span,
    eval: &EvalInput<'_, '_>,
) -> Option<HostBindingData> {
    // For TCB metadata: reference ngtsc maps decorator arguments via `sourceNodeFromTs`.
    let arguments = call
        .arguments
        .iter()
        .map(|arg| parse_host_argument_expression(arg.as_expression(), arg.span()))
        .collect();

    let host_property_name = call.arguments.first().map(|arg| {
        let value = match arg.as_expression() {
            Some(expr) => crate::evaluator::evaluate_expression(expr, eval),
            // A spread argument has no single value to fold; it reads as not-a-string.
            None => crate::evaluator::ResolvedValue::Undefined,
        };
        Resolved::from_syntax(value, eval.file)
    });

    Some(HostBindingData {
        member_name: name_node,
        arguments,
        host_property_name,
        decorator_span,
        member_span,
    })
}

/// Parse @HostListener() decorator on a method
pub fn parse_host_listener_decorator<'a>(
    decorator: &'a Decorator<'a>,
    method_name: ExpressionValueData,
    member_span: oxc_span::Span,
    eval: &EvalInput<'a, '_>,
    angular_imports: &AngularImports,
) -> Option<HostListenerData> {
    if !is_angular_decorator_named(decorator, "HostListener", eval.semantic, angular_imports) {
        return None;
    }
    match &decorator.expression {
        Expression::CallExpression(call) => {
            parse_host_listener_args(call, method_name, decorator.span, member_span, eval)
        }
        // Bare `@HostListener` / `@core.HostListener`. Matched precisely for the same reason as
        // in `parse_host_binding_decorator`: a wrapped call must not read as the no-argument form.
        Expression::Identifier(_) | Expression::StaticMemberExpression(_) => Some(
            member_named_listener(method_name, decorator.span, member_span, eval.file),
        ),
        _ => None,
    }
}

fn member_named_listener(
    method_name: ExpressionValueData,
    decorator_span: oxc_span::Span,
    member_span: oxc_span::Span,
    file: crate::query::FileId,
) -> HostListenerData {
    let name = method_name.text.clone().unwrap_or_default();
    HostListenerData {
        method_name,
        event_name: None,
        resolved_event_name: Resolved::from_syntax(
            crate::evaluator::ResolvedValue::String(name),
            file,
        ),
        args: Vec::new(),
        runtime_args: None,
        decorator_span,
        member_span,
        args_errors: Vec::new(),
    }
}

fn parse_host_listener_args(
    call: &CallExpression,
    method_name: ExpressionValueData,
    decorator_span: oxc_span::Span,
    member_span: oxc_span::Span,
    eval: &EvalInput<'_, '_>,
) -> Option<HostListenerData> {
    let Some(arg) = call.arguments.first() else {
        return Some(member_named_listener(
            method_name,
            decorator_span,
            member_span,
            eval.file,
        ));
    };
    let expr = arg.as_expression()?;
    let event_name = Some(parse_host_argument_expression(Some(expr), arg.span()));
    let resolved_event_name =
        Resolved::from_syntax(crate::evaluator::evaluate_expression(expr, eval), eval.file);

    let Some(arg) = call.arguments.get(1) else {
        return Some(HostListenerData {
            method_name,
            event_name,
            resolved_event_name,
            args: Vec::new(),
            runtime_args: None,
            decorator_span,
            member_span,
            args_errors: Vec::new(),
        });
    };

    // For TCB metadata: ngtsc maps array literal elements via `sourceNodeFromTs`, or leaves `args` empty.
    // https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L758-L762
    let args = match arg {
        Argument::ArrayExpression(arr) => arr
            .elements
            .iter()
            .map(|elem| parse_host_argument_expression(elem.as_expression(), elem.span()))
            .collect(),
        _ => Vec::new(),
    };

    // For runtime metadata: ngtsc evaluates the 2nd argument via `evaluator.evaluate` and
    // validates it as a string array (`isStringArrayOrDie`), reporting NG1010 otherwise.
    // TODO(parity): evaluated in Syntax mode (within-file) only; cross-file imported constants
    // in `@HostListener` args are not resolved in Stage 2.
    // https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L732-L743
    // https://github.com/angular/angular/blob/1c9c453/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L1082-L1097
    let (runtime_args, args_errors) = evaluate_host_listener_runtime_args(arg, eval);

    Some(HostListenerData {
        method_name,
        event_name,
        resolved_event_name,
        args,
        runtime_args,
        decorator_span,
        member_span,
        args_errors,
    })
}

fn evaluate_host_listener_runtime_args(
    arg: &Argument<'_>,
    eval: &EvalInput<'_, '_>,
) -> (Option<Vec<String>>, Vec<HostListenerArgsError>) {
    let Some(expr) = arg.as_expression() else {
        return (
            None,
            vec![HostListenerArgsError::NotStringArray(arg.span())],
        );
    };

    let resolved = crate::evaluator::evaluate_expression(expr, eval);

    // Avoid false NG1010 diagnostics when the expression contains unresolved cross-file holes;
    // leave `runtime_args` as `None` so downstream code falls back to the identifier text.
    if resolved.contains_incomplete() {
        return (None, Vec::new());
    }

    let crate::evaluator::ResolvedValue::Array(items) = resolved else {
        return (
            None,
            vec![HostListenerArgsError::NotStringArray(arg.span())],
        );
    };

    let mut runtime_args = Vec::with_capacity(items.len());
    for (i, item) in items.into_iter().enumerate() {
        if item.contains_incomplete() {
            return (None, Vec::new());
        }
        let crate::evaluator::ResolvedValue::String(s) = item else {
            return (
                None,
                vec![HostListenerArgsError::ElementNotString {
                    span: arg.span(),
                    index: i,
                }],
            );
        };
        runtime_args.push(s);
    }

    (Some(runtime_args), Vec::new())
}

fn get_member_span_excluding_decorators(
    span: oxc_span::Span,
    decorators: &[oxc_ast::ast::Decorator],
) -> oxc_span::Span {
    let mut start = span.start;
    if let Some(last_decorator) = decorators.last() {
        if last_decorator.span.end <= span.end {
            start = last_decorator.span.end;
        }
    }
    oxc_span::Span::new(start, span.end)
}

fn extract_property_host_bindings_listeners<'a>(
    decorators: &'a [oxc_ast::ast::Decorator<'a>],
    key: &oxc_ast::ast::PropertyKey,
    span: oxc_span::Span,
    eval: &EvalInput<'a, '_>,
    angular_imports: &AngularImports,
) -> (Vec<HostBindingData>, Vec<HostListenerData>) {
    let mut host_bindings = Vec::new();
    let mut host_listeners = Vec::new();
    let Some(prop_name) = extract_property_key(key).map(|n| n.into_owned()) else {
        return (host_bindings, host_listeners);
    };
    let name_node = create_source_node(
        key.span(),
        ExpressionValueKind::Identifier,
        Some(prop_name.clone()),
    );

    let member_span = get_member_span_excluding_decorators(span, decorators);

    for decorator in decorators {
        if let Some(binding) = parse_host_binding_decorator(
            decorator,
            name_node.clone(),
            member_span,
            eval,
            angular_imports,
        ) {
            host_bindings.push(binding);
        }
        if let Some(listener) = parse_host_listener_decorator(
            decorator,
            name_node.clone(),
            member_span,
            eval,
            angular_imports,
        ) {
            host_listeners.push(listener);
        }
    }
    (host_bindings, host_listeners)
}

fn extract_method_host_bindings_listeners<'a>(
    method: &'a oxc_ast::ast::MethodDefinition<'a>,
    eval: &EvalInput<'a, '_>,
    angular_imports: &AngularImports,
) -> (Vec<HostBindingData>, Vec<HostListenerData>) {
    let mut host_bindings = Vec::new();
    let mut host_listeners = Vec::new();
    let Some(method_name) = extract_property_key(&method.key).map(|n| n.into_owned()) else {
        return (host_bindings, host_listeners);
    };
    let member_span = get_member_span_excluding_decorators(method.span, &method.decorators);
    let name_node = create_source_node(
        method.key.span(),
        ExpressionValueKind::Identifier,
        Some(method_name.clone()),
    );

    for decorator in &method.decorators {
        if let Some(listener) = parse_host_listener_decorator(
            decorator,
            name_node.clone(),
            member_span,
            eval,
            angular_imports,
        ) {
            host_listeners.push(listener);
        }

        if matches!(
            method.kind,
            oxc_ast::ast::MethodDefinitionKind::Get | oxc_ast::ast::MethodDefinitionKind::Set
        ) {
            if let Some(binding) = parse_host_binding_decorator(
                decorator,
                name_node.clone(),
                member_span,
                eval,
                angular_imports,
            ) {
                host_bindings.push(binding);
            }
        }
    }
    (host_bindings, host_listeners)
}

pub fn extract_host_bindings_listeners<'a>(
    class: &'a oxc_ast::ast::Class<'a>,
    eval: &EvalInput<'a, '_>,
    angular_imports: &AngularImports,
) -> (Vec<HostBindingData>, Vec<HostListenerData>) {
    let mut host_bindings = Vec::new();
    let mut host_listeners = Vec::new();

    for element in &class.body.body {
        match element {
            ClassElement::PropertyDefinition(prop) => {
                if prop.r#static {
                    continue;
                }
                let (bindings, listeners) = extract_property_host_bindings_listeners(
                    &prop.decorators,
                    &prop.key,
                    prop.span,
                    eval,
                    angular_imports,
                );
                host_bindings.extend(bindings);
                host_listeners.extend(listeners);
            }

            ClassElement::AccessorProperty(acc) => {
                if acc.r#static {
                    continue;
                }
                let (bindings, listeners) = extract_property_host_bindings_listeners(
                    &acc.decorators,
                    &acc.key,
                    acc.span,
                    eval,
                    angular_imports,
                );
                host_bindings.extend(bindings);
                host_listeners.extend(listeners);
            }

            ClassElement::MethodDefinition(method) => {
                if method.r#static {
                    continue;
                }
                let (bindings, listeners) =
                    extract_method_host_bindings_listeners(method, eval, angular_imports);
                host_bindings.extend(bindings);
                host_listeners.extend(listeners);
            }

            _ => {}
        }
    }

    (host_bindings, host_listeners)
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    fn parse_class(source_text: &str) -> (Vec<HostBindingData>, Vec<HostListenerData>) {
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source_text, source_type).parse();
        let semantic = oxc_semantic::SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program)
            .semantic;

        let import_map = crate::analyzer::extract_import_map(&ret.module_record);
        let angular_imports =
            crate::analyzer::imports::extract_angular_imports(&ret.module_record, &semantic, false);
        let env = crate::evaluator::ResolvedEnv::new();
        let interner = crate::query::FileIdInterner::new();
        let eval = crate::evaluator::EvalInput {
            semantic: &semantic,
            file: interner.intern_path("/test/file.ts"),
            import_map: &import_map,
            mode: crate::evaluator::EvalMode::Syntax,
            env: &env,
            foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
        };

        let mut bindings = Vec::new();
        let mut listeners = Vec::new();

        for stmt in &ret.program.body {
            if let oxc_ast::ast::Statement::ClassDeclaration(class_decl) = stmt {
                let (b, l) = extract_host_bindings_listeners(class_decl, &eval, &angular_imports);
                bindings.extend(b);
                listeners.extend(l);
            }
        }

        (bindings, listeners)
    }

    #[test]
    fn test_extract_host_bindings_listeners_spans() {
        let source_text = r#"import {HostBinding, HostListener} from '@angular/core';
        class TestComponent {
            @HostBinding('class.active') isActive = true;

            @HostListener('click', ['$event'])
            onClick(e: Event) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 1);
        assert_eq!(bindings[0].member_name.text, Some("isActive".to_string()));
        assert_eq!(bindings[0].arguments.len(), 1);
        assert_eq!(
            bindings[0].arguments[0].text,
            Some("class.active".to_string())
        );

        // Find expected name_span based on 'isActive' and 'onClick'
        let is_active_start = source_text.find("isActive").unwrap() as u32;
        let is_active_end = is_active_start + 8; // "isActive".len()
        assert_eq!(bindings[0].member_name.span.start, is_active_start);
        assert_eq!(bindings[0].member_name.span.end, is_active_end);

        let prop1_text = "isActive = true;";
        let prop1_start = source_text.find(prop1_text).unwrap() as u32;
        let last_decorator_end = source_text.find("@HostBinding('class.active')").unwrap() as u32
            + "@HostBinding('class.active')".len() as u32;
        assert_eq!(bindings[0].member_span.start, last_decorator_end);
        assert_eq!(
            bindings[0].member_span.end,
            prop1_start + prop1_text.len() as u32
        );

        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onClick".to_string()));
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().text,
            Some("click".to_string())
        );
        assert_eq!(listeners[0].args.len(), 1);
        assert_eq!(listeners[0].args[0].text, Some("$event".to_string()));

        let on_click_start = source_text.find("onClick").unwrap() as u32;
        let on_click_end = on_click_start + 7; // "onClick".len()
        assert_eq!(listeners[0].method_name.span.start, on_click_start);
        assert_eq!(listeners[0].method_name.span.end, on_click_end);

        let listener1_text = "onClick(e: Event) {}";
        let listener1_start = source_text.find(listener1_text).unwrap() as u32;
        let last_listener_decorator_end = source_text
            .find("@HostListener('click', ['$event'])")
            .unwrap() as u32
            + "@HostListener('click', ['$event'])".len() as u32;
        assert_eq!(listeners[0].member_span.start, last_listener_decorator_end);
        assert_eq!(
            listeners[0].member_span.end,
            listener1_start + listener1_text.len() as u32
        );
    }

    #[test]
    fn test_extract_host_bindings_arguments() {
        let source_text = r#"import {HostBinding} from '@angular/core';
        class TestComponent {
            @HostBinding() noArgs = true;
            @HostBinding('style.color') stringArg = 'red';
            @HostBinding(SOME_CONST) identifierArg = true;
        }
        "#;

        let (bindings, _) = parse_class(source_text);

        assert_eq!(bindings.len(), 3);

        // No args
        assert_eq!(bindings[0].member_name.text, Some("noArgs".to_string()));
        assert_eq!(bindings[0].arguments.len(), 0);

        // String arg
        assert_eq!(bindings[1].member_name.text, Some("stringArg".to_string()));
        assert_eq!(bindings[1].arguments.len(), 1);
        assert_eq!(bindings[1].arguments[0].kind, ExpressionValueKind::String);
        assert_eq!(
            bindings[1].arguments[0].text,
            Some("style.color".to_string())
        );

        // Identifier arg
        assert_eq!(
            bindings[2].member_name.text,
            Some("identifierArg".to_string())
        );
        assert_eq!(bindings[2].arguments.len(), 1);
        assert_eq!(
            bindings[2].arguments[0].kind,
            ExpressionValueKind::Identifier
        );
        assert_eq!(
            bindings[2].arguments[0].text,
            Some("SOME_CONST".to_string())
        );
    }

    #[test]
    fn test_extract_host_bindings_and_listeners_template_literal() {
        let source_text = r#"import {HostBinding, HostListener} from '@angular/core';
        class TestComponent {
            @HostBinding(`class.active`) isActive = true;
            @HostListener(`click`, [`$event`]) onClick(e: Event) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 1);
        assert_eq!(bindings[0].member_name.text, Some("isActive".to_string()));
        assert_eq!(bindings[0].arguments.len(), 1);
        assert_eq!(bindings[0].arguments[0].kind, ExpressionValueKind::String);
        assert_eq!(
            bindings[0].arguments[0].text,
            Some("class.active".to_string())
        );

        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onClick".to_string()));
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().kind,
            ExpressionValueKind::String
        );
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().text,
            Some("click".to_string())
        );
        assert_eq!(listeners[0].args.len(), 1);
        assert_eq!(listeners[0].args[0].kind, ExpressionValueKind::String);
        assert_eq!(listeners[0].args[0].text, Some("$event".to_string()));
    }

    #[test]
    fn test_extract_host_listener_on_property_definition() {
        let source_text = r#"import {HostListener} from '@angular/core';
        class TestComponent {
            @HostListener('click', ['$event'])
            handleClick = ($event: any) => {};
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(
            listeners[0].method_name.text,
            Some("handleClick".to_string())
        );
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().text,
            Some("click".to_string())
        );
        assert_eq!(listeners[0].args.len(), 1);
        assert_eq!(listeners[0].args[0].text, Some("$event".to_string()));
    }

    #[test]
    fn test_extract_host_listener_template_literal_constant_folded() {
        let source_text = r#"import {HostListener} from '@angular/core';
        const MIN_LARGE_SCREEN_WIDTH = 1000;
        class TestComponent {
            @HostListener('window:resize', [`$event.target.innerWidth < ${MIN_LARGE_SCREEN_WIDTH}`])
            onResize(isSmallScreen: boolean) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onResize".to_string()));
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().text,
            Some("window:resize".to_string())
        );
        assert_eq!(listeners[0].args.len(), 1);
        assert_eq!(listeners[0].args[0].kind, ExpressionValueKind::Unspecified);
        assert_eq!(listeners[0].args[0].text, None);
        assert_eq!(
            listeners[0].runtime_args,
            Some(vec!["$event.target.innerWidth < 1000".to_string()])
        );
    }

    #[test]
    fn test_extract_host_listener_non_literal_argument_preserved_as_unspecified() {
        let source_text = r#"import {HostListener} from '@angular/core';
        class TestComponent {
            @HostListener('window:resize', [`$event.target.innerWidth < ${MIN_LARGE_SCREEN_WIDTH}`])
            onResize(isSmallScreen: boolean) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onResize".to_string()));
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().text,
            Some("window:resize".to_string())
        );
        assert_eq!(listeners[0].args.len(), 1);
        assert_eq!(listeners[0].args[0].kind, ExpressionValueKind::Unspecified);
        assert_eq!(listeners[0].args[0].text, None);
        assert_eq!(listeners[0].runtime_args, None);
        assert_eq!(listeners[0].args_errors.len(), 1);
        assert!(matches!(
            listeners[0].args_errors[0],
            HostListenerArgsError::ElementNotString { index: 0, .. }
        ));
    }

    #[test]
    fn test_extract_host_listener_identifier_argument_constant_resolved() {
        let source_text = r#"import {HostListener} from '@angular/core';
        const customEventArg = '$event';
        class TestComponent {
            @HostListener('click', [customEventArg])
            onClick(event: any) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onClick".to_string()));
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().text,
            Some("click".to_string())
        );
        assert_eq!(listeners[0].args.len(), 1);
        assert_eq!(listeners[0].args[0].kind, ExpressionValueKind::Identifier);
        assert_eq!(
            listeners[0].args[0].text,
            Some("customEventArg".to_string())
        );
        assert_eq!(listeners[0].runtime_args, Some(vec!["$event".to_string()]));
        assert_eq!(listeners[0].args_errors.len(), 0);
    }

    #[test]
    fn test_extract_host_listener_non_array_argument_error() {
        let source_text = r#"import {HostListener} from '@angular/core';
        class TestComponent {
            @HostListener('click', 'notAnArray')
            onClick(event: any) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].args_errors.len(), 1);
        assert!(matches!(
            listeners[0].args_errors[0],
            HostListenerArgsError::NotStringArray(_)
        ));
    }

    #[test]
    fn test_extract_host_listener_array_reference_constant_resolved() {
        let source_text = r#"import {HostListener} from '@angular/core';
        const customArgs = ['$event'];
        class TestComponent {
            @HostListener('click', customArgs)
            onClick(event: any) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onClick".to_string()));
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().text,
            Some("click".to_string())
        );
        // In ngtsc, non-array-literal arguments result in empty args for TCB
        assert_eq!(listeners[0].args.len(), 0);
        assert_eq!(listeners[0].runtime_args, Some(vec!["$event".to_string()]));
        assert_eq!(listeners[0].args_errors.len(), 0);
    }

    #[test]
    fn test_extract_host_listener_array_reference_invalid_element_diagnostic() {
        let source_text = r#"import {HostListener} from '@angular/core';
        const customArgs = [123];
        class TestComponent {
            @HostListener('click', customArgs)
            onClick(event: any) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].args.len(), 0);
        assert_eq!(listeners[0].runtime_args, None);
        assert_eq!(listeners[0].args_errors.len(), 1);
        assert!(matches!(
            listeners[0].args_errors[0],
            HostListenerArgsError::ElementNotString { index: 0, .. }
        ));
    }

    #[test]
    fn test_extract_host_listener_spread_argument() {
        let source_text = r#"import {HostListener} from '@angular/core';
        const baseArgs = ['$event'];
        class TestComponent {
            @HostListener('click', [...baseArgs])
            onClick(event: any) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onClick".to_string()));
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().text,
            Some("click".to_string())
        );
        assert_eq!(listeners[0].args.len(), 1);
        assert_eq!(listeners[0].args[0].kind, ExpressionValueKind::Unspecified);
        assert_eq!(listeners[0].runtime_args, Some(vec!["$event".to_string()]));
        assert_eq!(listeners[0].args_errors.len(), 0);
    }

    #[test]
    fn test_extract_host_listener_incomplete_imported_arg_does_not_error() {
        let source_text = r#"import {HostListener} from '@angular/core';
        import { customArgs, customArg } from './constants';
        class TestComponent {
            @HostListener('click', customArgs)
            onClick(event: any) {}

            @HostListener('keydown', [customArg])
            onKeydown(event: any) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 2);

        // customArgs is imported, so in syntax mode it evaluates to Incomplete.
        // It should NOT produce a false NG1010 NotStringArray error.
        assert_eq!(listeners[0].method_name.text, Some("onClick".to_string()));
        assert_eq!(listeners[0].runtime_args, None);
        assert_eq!(listeners[0].args_errors.len(), 0);

        // [customArg] contains an imported symbol, so the element is Incomplete.
        // It should NOT produce a false NG1010 ElementNotString error.
        assert_eq!(listeners[1].method_name.text, Some("onKeydown".to_string()));
        assert_eq!(listeners[1].runtime_args, None);
        assert_eq!(listeners[1].args_errors.len(), 0);
    }

    #[test]
    fn test_extract_host_listener_dynamic_event_name_unspecified_kind() {
        let source_text = r#"import {HostListener} from '@angular/core';
        const SHORTCUT = { eventName: 'window:keydown.r' };
        class TestComponent {
            @HostListener(`${SHORTCUT.eventName}`, ['$event'])
            onKey(event?: KeyboardEvent) {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 0);
        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onKey".to_string()));
        assert_eq!(
            listeners[0].resolved_event_name.get_optional(),
            Some("window:keydown.r".to_string())
        );
        assert_eq!(
            listeners[0].event_name.as_ref().unwrap().kind,
            ExpressionValueKind::Unspecified
        );
        assert_eq!(listeners[0].event_name.as_ref().unwrap().text, None);
    }

    #[test]
    fn test_extract_host_listener_event_name_kept_for_stage_2() {
        let source_text = r#"import {HostListener} from '@angular/core';
        import {CUSTOM_CLICK_EVENT, PREFIX} from './events';
        const LOCAL_EVENT = 'focus';
        class TestComponent {
            @HostListener(CUSTOM_CLICK_EVENT, ['$event'])
            onImported(e: Event) {}

            @HostListener(`${PREFIX}:keydown`)
            onImportedTemplate() {}

            @HostListener(LOCAL_EVENT)
            onLocal() {}

            @HostListener(42)
            onNotAString() {}
        }
        "#;

        let (_, listeners) = parse_class(source_text);

        assert_eq!(listeners.len(), 4);
        let imported = &listeners[0];
        assert_eq!(imported.method_name.text, Some("onImported".to_string()));
        assert!(imported.resolved_event_name.contains_incomplete());
        assert_eq!(imported.resolved_event_name.get_optional(), None);
        assert_eq!(
            imported.event_name.as_ref().unwrap().kind,
            ExpressionValueKind::Identifier
        );
        assert_eq!(
            imported.event_name.as_ref().unwrap().text,
            Some("CUSTOM_CLICK_EVENT".to_string())
        );
        assert_eq!(imported.runtime_args, Some(vec!["$event".to_string()]));

        let imported_template = &listeners[1];
        assert!(imported_template.resolved_event_name.contains_incomplete());
        assert_eq!(
            imported_template.event_name.as_ref().unwrap().kind,
            ExpressionValueKind::Unspecified
        );

        let local = &listeners[2];
        assert_eq!(
            local.resolved_event_name.get_optional(),
            Some("focus".to_string())
        );
        assert_eq!(
            local.event_name.as_ref().unwrap().kind,
            ExpressionValueKind::Identifier
        );
        assert_eq!(
            local.event_name.as_ref().unwrap().text,
            Some("LOCAL_EVENT".to_string())
        );

        let not_a_string = &listeners[3];
        assert!(!not_a_string.resolved_event_name.contains_incomplete());
        assert_eq!(not_a_string.resolved_event_name.get_optional(), None);
    }

    #[test]
    fn test_extract_host_listener_without_arguments_uses_member_name() {
        let source_text = r#"import * as core from '@angular/core';
        import {HostListener} from '@angular/core';
        class TestComponent {
            @HostListener()
            click() {}

            @HostListener
            keydown() {}

            @core.HostListener()
            handler = () => {};
        }
        "#;

        let (_, listeners) = parse_class(source_text);

        let summary: Vec<_> = listeners
            .iter()
            .map(|l| {
                (
                    l.method_name.text.clone(),
                    l.resolved_event_name.get_optional(),
                    l.event_name.is_none(),
                    l.args.len(),
                    l.runtime_args.clone(),
                )
            })
            .collect();
        let expected = |name: &str| {
            (
                Some(name.to_string()),
                Some(name.to_string()),
                true,
                0,
                None,
            )
        };
        assert_eq!(
            summary,
            vec![expected("click"), expected("keydown"), expected("handler")]
        );
    }

    #[test]
    fn test_extract_host_bindings_and_listeners_ignores_static_members() {
        let source_text = r#"import {HostBinding, HostListener} from '@angular/core';
        class TestComponent {
            @HostBinding('class')
            static readonly className = 'themeable';

            @HostBinding('attr.aria-hidden')
            static get isHidden(): boolean {
                return true;
            }

            @HostListener('click')
            static onClick(): void {}

            @HostBinding('class.active')
            isActive = true;

            @HostListener('keydown')
            onKeyDown(): void {}
        }
        "#;

        let (bindings, listeners) = parse_class(source_text);

        assert_eq!(bindings.len(), 1);
        assert_eq!(bindings[0].member_name.text, Some("isActive".to_string()));

        assert_eq!(listeners.len(), 1);
        assert_eq!(listeners[0].method_name.text, Some("onKeyDown".to_string()));
    }

    #[test]
    fn test_extract_host_binding_on_setter_and_getter() {
        let source_text = r#"import {HostBinding} from '@angular/core';
        class TestComponent {
            @HostBinding('class.ready')
            set isReady(v: boolean) { this._ready = v; }
            get isReady(): boolean { return this._ready; }

            @HostBinding('attr.title')
            get title(): string { return ''; }
            set title(v: string) {}
        }
        "#;

        let (bindings, _) = parse_class(source_text);

        assert_eq!(bindings.len(), 2);
        assert_eq!(bindings[0].member_name.text, Some("isReady".to_string()));
        assert_eq!(
            bindings[0]
                .host_property_name
                .as_ref()
                .and_then(|n| n.get_optional()),
            Some("class.ready".to_string())
        );
        assert_eq!(bindings[1].member_name.text, Some("title".to_string()));
        assert_eq!(
            bindings[1]
                .host_property_name
                .as_ref()
                .and_then(|n| n.get_optional()),
            Some("attr.title".to_string())
        );
    }

    #[test]
    fn test_extract_host_binding_evaluated_property_name() {
        let source_text = r#"import {HostBinding} from '@angular/core';
        import {IMPORTED} from './constants';
        const ACTIVE_CLASS = 'is-active';
        const ATTR = 'attr.role';
        class TestComponent {
            @HostBinding(`class.${ACTIVE_CLASS}`) active = true;
            @HostBinding(ATTR) role = 'button';
            @HostBinding('style.color') color = 'red';
            @HostBinding() noArgs = true;
            @HostBinding(IMPORTED) imported = true;
            @HostBinding(42) notAString = true;
        }
        "#;

        let (bindings, _) = parse_class(source_text);
        assert_eq!(bindings.len(), 6);
        let name = |i: usize| {
            bindings[i]
                .host_property_name
                .as_ref()
                .and_then(|n| n.get_optional())
        };

        assert_eq!(name(0), Some("class.is-active".to_string()));
        assert_eq!(
            bindings[0].arguments[0].kind,
            ExpressionValueKind::Unspecified
        );
        assert_eq!(name(1), Some("attr.role".to_string()));
        assert_eq!(
            bindings[1].arguments[0].kind,
            ExpressionValueKind::Identifier
        );
        assert_eq!(bindings[1].arguments[0].text, Some("ATTR".to_string()));
        assert_eq!(name(2), Some("style.color".to_string()));
        assert!(bindings[3].host_property_name.is_none());
        let imported = bindings[4].host_property_name.as_ref().unwrap();
        assert!(imported.contains_incomplete());
        assert_eq!(imported.get_optional(), None);
        let not_a_string = bindings[5].host_property_name.as_ref().unwrap();
        assert!(!not_a_string.contains_incomplete());
        assert_eq!(not_a_string.get_optional(), None);
    }
}
