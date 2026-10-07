use oxc_ast::ast::{Decorator, Expression, ObjectPropertyKind};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

use crate::analyzer::class_data::PipeData;
use crate::evaluator::{evaluate_expression, EvalInput, Resolved};

use super::utils::{extract_bool, extract_property_key};

/// Parse a @Pipe decorator
pub fn parse_decorator<'a>(
    decorator: &'a Decorator<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    eval: &EvalInput<'a, '_>,
) -> Option<PipeData> {
    let Expression::CallExpression(call_expr) = &decorator.expression else {
        return None;
    };

    if !crate::analyzer::utils::is_angular_decorator_named(
        decorator,
        "Pipe",
        semantic,
        angular_imports,
    ) {
        return None;
    }

    Some(parse_pipe_args(
        call_expr,
        crate::analyzer::utils::extract_decorator_name(decorator),
        semantic,
        eval,
    ))
}

/// Mirrors the metadata half of ngtsc's `PipeDecoratorHandler.analyze`: `name` and `pure` go
/// through the partial evaluator, so either may be reached through a constant, including one
/// imported from another file (Stage 2 completes those).
fn parse_pipe_args<'a>(
    call_expr: &'a oxc_ast::ast::CallExpression<'a>,
    decorator_name: Option<String>,
    semantic: &Semantic<'a>,
    eval: &EvalInput<'a, '_>,
) -> PipeData {
    let mut data = PipeData {
        decorator_name,
        ..Default::default()
    };

    let Some(oxc_ast::ast::Argument::ObjectExpression(obj)) = call_expr.arguments.first() else {
        return data;
    };
    data.args_span = Some(obj.span);

    for prop in &obj.properties {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        let Some(key_name) = extract_property_key(&p.key) else {
            continue;
        };
        match key_name.as_ref() {
            "name" => {
                data.name_span = Some(p.value.span());
                data.name = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));
            }
            "pure" => {
                data.pure_span = Some(p.value.span());
                data.pure = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));
            }
            "standalone" => {
                data.standalone_span = Some(p.value.span());
                // TODO(parity): ngtsc evaluates `standalone`; it is still read syntactically
                // here, so a constant imported from another file reports NG1010.
                data.standalone = extract_bool(&p.value, semantic);
            }
            _ => {}
        }
    }

    data
}
