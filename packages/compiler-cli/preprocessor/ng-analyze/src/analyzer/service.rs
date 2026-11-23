use oxc_ast::ast::{Decorator, Expression, ObjectPropertyKind};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

use crate::analyzer::class_data::ServiceData;

use super::utils::{extract_bool, extract_property_key, extract_provider_span_with_forward_ref};

pub fn parse_decorator<'a>(
    decorator: &'a Decorator<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<ServiceData> {
    if !crate::analyzer::utils::is_angular_decorator_named(
        decorator,
        "Service",
        semantic,
        angular_imports,
    ) {
        return None;
    }

    let decorator_name = crate::analyzer::utils::extract_decorator_name(decorator);
    Some(match &decorator.expression {
        Expression::CallExpression(call_expr) => {
            parse_service_args(call_expr, decorator_name, semantic)
        }
        // `@Service` with no parentheses.
        _ => ServiceData {
            auto_provided: None,
            factory: None,
            args_span: None,
            decorator_name,
        },
    })
}

fn parse_service_args<'a>(
    call_expr: &'a oxc_ast::ast::CallExpression<'a>,
    decorator_name: Option<String>,
    semantic: &Semantic<'a>,
) -> ServiceData {
    let mut auto_provided = None;
    let mut factory = None;
    let mut args_span = None;

    let extract_field =
        |expr: &Expression| Some(extract_provider_span_with_forward_ref(expr, semantic));

    let Some(oxc_ast::ast::Argument::ObjectExpression(obj)) = call_expr.arguments.first() else {
        return ServiceData {
            auto_provided,
            factory,
            args_span,
            decorator_name,
        };
    };

    args_span = Some(obj.span());

    for prop in &obj.properties {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        let Some(key_name) = extract_property_key(&p.key) else {
            continue;
        };
        match key_name.as_ref() {
            "autoProvided" => auto_provided = extract_bool(&p.value, semantic),
            "factory" => factory = extract_field(&p.value),
            _ => {}
        }
    }

    ServiceData {
        auto_provided,
        factory,
        args_span,
        decorator_name,
    }
}
