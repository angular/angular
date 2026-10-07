use oxc_ast::ast::{Decorator, Expression, ObjectPropertyKind};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

use crate::analyzer::class_data::{DependencyData, InjectableData};

use super::utils::{extract_property_key, extract_provider_span_with_forward_ref};

pub fn parse_decorator<'a>(
    decorator: &'a Decorator<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<InjectableData> {
    if !crate::analyzer::utils::is_angular_decorator_named(
        decorator,
        "Injectable",
        semantic,
        angular_imports,
    ) {
        return None;
    }

    let decorator_name = crate::analyzer::utils::extract_decorator_name(decorator);
    let mut data = match &decorator.expression {
        Expression::CallExpression(call_expr) => {
            parse_injectable_args(call_expr, semantic, angular_imports)
        }
        _ => InjectableData {
            provided_in: None,
            use_class: None,
            use_existing: None,
            use_factory: None,
            use_value: None,
            args_span: None,
            deps: None,
            decorator_name: None,
        },
    };
    data.decorator_name = decorator_name;
    Some(data)
}

fn parse_injectable_args<'a>(
    call_expr: &'a oxc_ast::ast::CallExpression<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> InjectableData {
    let mut provided_in = None;
    let mut use_class = None;
    let mut use_existing = None;
    let mut use_factory = None;
    let mut use_value = None;
    let mut args_span = None;
    let mut deps = None;

    let extract_field =
        |expr: &'a Expression<'a>| Some(extract_provider_span_with_forward_ref(expr, semantic));

    if let Some(oxc_ast::ast::Argument::ObjectExpression(obj)) = call_expr.arguments.first() {
        args_span = Some(obj.span());
        for prop in &obj.properties {
            if let ObjectPropertyKind::ObjectProperty(p) = prop {
                if let Some(key_name) = extract_property_key(&p.key) {
                    match key_name.as_ref() {
                        "providedIn" => provided_in = extract_field(&p.value),
                        "useClass" => use_class = extract_field(&p.value),
                        "useExisting" => use_existing = extract_field(&p.value),
                        "useFactory" => use_factory = extract_field(&p.value),
                        "useValue" => use_value = extract_field(&p.value),
                        "deps" => {
                            deps = parse_deps(&p.value, semantic, angular_imports);
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    InjectableData {
        provided_in,
        use_class,
        use_existing,
        use_factory,
        use_value,
        args_span,
        deps,
        decorator_name: None,
    }
}

fn parse_deps<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<Vec<DependencyData>> {
    let expr = expr.get_inner_expression();
    let Expression::ArrayExpression(arr) = expr else {
        return None;
    };
    let mut deps = Vec::new();
    for elem in &arr.elements {
        let Some(expr) = elem.as_expression() else {
            continue;
        };
        deps.push(parse_dep_entry(expr, semantic, angular_imports));
    }
    Some(deps)
}

fn parse_dep_entry<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> DependencyData {
    let expr = expr.get_inner_expression();
    if let Expression::ArrayExpression(arr) = expr {
        parse_dep_array(arr, semantic, angular_imports)
    } else {
        parse_dep_single(expr)
    }
}

fn parse_dep_array<'a>(
    arr: &'a oxc_ast::ast::ArrayExpression<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> DependencyData {
    let mut token_span = None;
    let mut optional = false;
    let mut self_qualifier = false;
    let mut skip_self = false;

    for elem in &arr.elements {
        let Some(inner_expr) = elem.as_expression() else {
            continue;
        };
        let inner_expr = inner_expr.get_inner_expression();
        let Some((decorator_name, decorator_token_span)) =
            extract_decorator_info(inner_expr, semantic, angular_imports)
        else {
            token_span = Some(inner_expr.span());
            continue;
        };
        match decorator_name {
            "Optional" => optional = true,
            "Self" => self_qualifier = true,
            "SkipSelf" => skip_self = true,
            "Inject" => {
                token_span = decorator_token_span;
            }
            _ => {}
        }
    }

    DependencyData {
        token_span,
        host: false,
        optional,
        self_qualifier,
        skip_self,
    }
}

fn parse_dep_single(expr: &Expression) -> DependencyData {
    DependencyData {
        token_span: Some(expr.span()),
        host: false,
        optional: false,
        self_qualifier: false,
        skip_self: false,
    }
}

/// Recognises a `deps: [[...]]` entry as one of the DI qualifier decorators, returning its
/// canonical name and, for `new Inject(TOKEN)`, the span of the token argument.
///
/// Mirrors ngtsc's `getDep`, which accepts exactly two shapes — a bare identifier (`Optional`) and
/// a `new` expression over a bare identifier (`new Inject(TOKEN)`) — and resolves that identifier
/// through the import graph, requiring it to come from `@angular/core`. Notably a namespaced
/// `core.Optional` is *not* a qualifier for ngtsc (`ts.isIdentifier` fails), it is just a token,
/// so it is deliberately not matched here either. `Host` and `Attribute` are likewise unsupported
/// in `deps`.
/// https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/annotations/src/injectable.ts#L427-L482
fn extract_decorator_info<'a>(
    expr: &'a Expression<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Option<(&'static str, Option<oxc_span::Span>)> {
    let inner = expr.get_inner_expression();
    let (callee, token_arg) = match inner {
        Expression::Identifier(_) => (inner, None),
        Expression::NewExpression(new_expr) => (
            new_expr.callee.get_inner_expression(),
            new_expr
                .arguments
                .first()
                .and_then(|arg| arg.as_expression().map(|e| e.span())),
        ),
        _ => return None,
    };
    if !matches!(callee, Expression::Identifier(_)) {
        return None;
    }

    let name =
        match crate::analyzer::utils::resolve_expression_symbol(callee, semantic, angular_imports)?
        {
            crate::analyzer::imports::AngularImportSymbol::InjectDecorator => "Inject",
            crate::analyzer::imports::AngularImportSymbol::OptionalDecorator => "Optional",
            crate::analyzer::imports::AngularImportSymbol::SelfDecorator => "Self",
            crate::analyzer::imports::AngularImportSymbol::SkipSelfDecorator => "SkipSelf",
            _ => return None,
        };

    // Only `new Inject(TOKEN)` carries a token; the bare qualifiers never do.
    let token_span = (name == "Inject").then_some(token_arg).flatten();
    Some((name, token_span))
}
