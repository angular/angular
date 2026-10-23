use oxc_ast::ast::{Argument, ClassElement, Expression, MethodDefinitionKind, ObjectPropertyKind};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

use crate::evaluator::{evaluate_expression, EvalInput, Resolved};

use super::utils::{
    decorator_local_name, extract_bool, extract_literal_string, extract_property_key,
    get_canonical_decorator_name, get_decorator_args, resolve_angular_call,
    resolve_expression_symbol, resolve_local_expression, unwrap_forward_ref, ResolvedAngularCall,
};
use crate::analyzer::class_data::{
    AngularField, MemberAccessLevel, QueryData, QueryPredicate, ValueIssue,
};

const QUERY_ALLOWED_ACCESS_LEVELS: [MemberAccessLevel; 4] = [
    MemberAccessLevel::PublicWritable,
    MemberAccessLevel::PublicReadonly,
    MemberAccessLevel::Protected,
    MemberAccessLevel::Private,
];

fn get_runtime_expression<'a>(
    expr: &'a oxc_ast::ast::Expression<'a>,
) -> &'a oxc_ast::ast::Expression<'a> {
    let mut curr = expr.get_inner_expression();
    loop {
        match curr {
            oxc_ast::ast::Expression::TSInstantiationExpression(inst) => {
                curr = inst.expression.get_inner_expression();
            }
            oxc_ast::ast::Expression::TSAsExpression(as_expr) => {
                curr = as_expr.expression.get_inner_expression();
            }
            oxc_ast::ast::Expression::TSSatisfiesExpression(sat) => {
                curr = sat.expression.get_inner_expression();
            }
            oxc_ast::ast::Expression::TSTypeAssertion(assert) => {
                curr = assert.expression.get_inner_expression();
            }
            oxc_ast::ast::Expression::TSNonNullExpression(non_null) => {
                curr = non_null.expression.get_inner_expression();
            }
            _ => break,
        }
    }
    curr
}

/// Which reading of a query's predicate applies: ngtsc evaluates a decorator query's
/// predicate but only inspects a signal query's locator syntactically.
#[derive(Clone, Copy, PartialEq, Eq)]
enum PredicateKind {
    Decorator,
    Signal,
}

/// A query's predicate: the expression to emit when it is not a selector list, how it reads,
/// and whether it was wrapped in `forwardRef`.
struct ExtractedPredicate {
    span: oxc_span::Span,
    predicate: QueryPredicate,
    is_forward_ref: bool,
}

fn extract_predicate<'a>(
    arg: &'a Argument<'a>,
    kind: PredicateKind,
    eval: &EvalInput<'a, '_>,
) -> ExtractedPredicate {
    let Some(expr) = arg.as_expression() else {
        return ExtractedPredicate {
            span: arg.span(),
            predicate: QueryPredicate::Expression,
            is_forward_ref: false,
        };
    };

    let unwrapped = unwrap_forward_ref(expr, eval.semantic);
    let target_expr = unwrapped.unwrap_or(expr);

    let predicate = match kind {
        // `extractDecoratorQueryMetadata`: whatever the evaluator makes of the predicate.
        PredicateKind::Decorator => QueryPredicate::Evaluated(Resolved::from_syntax(
            evaluate_expression(target_expr, eval),
            eval.file,
        )),
        // `parseLocator`: a string-literal-like node as written, not unwrapped any further, so
        // a template literal with substitutions stays an expression.
        PredicateKind::Signal => match extract_literal_string(target_expr) {
            Some(text) => QueryPredicate::Literal(text),
            None => QueryPredicate::Expression,
        },
    };

    ExtractedPredicate {
        span: get_runtime_expression(target_expr).span(),
        predicate,
        is_forward_ref: unwrapped.is_some(),
    }
}

pub(crate) fn extract_query_options<'a>(
    args: &'a oxc_allocator::Vec<Argument<'a>>,
    default_descendants: bool,
    semantic: &Semantic<'a>,
) -> (bool, bool, Option<oxc_span::Span>, bool) {
    let mut descendants = default_descendants;
    // emitDistinctChangesOnly defaults true for both signals and decorators
    // https://github.com/angular/angular/blob/fd95735/packages/compiler-cli/src/ngtsc/annotations/directive/src/query_functions.ts#L123
    let mut emit_distinct = true;
    let mut read_span = None;
    let mut is_static = false;

    if args.len() <= 1 {
        return (descendants, emit_distinct, read_span, is_static);
    }

    let Some(expr) = args[1].as_expression() else {
        return (descendants, emit_distinct, read_span, is_static);
    };

    let resolved = resolve_local_expression(expr, semantic);
    let Some(Expression::ObjectExpression(obj)) = Some(resolved.get_inner_expression()) else {
        return (descendants, emit_distinct, read_span, is_static);
    };

    for prop in &obj.properties {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        let Some(name) = extract_property_key(&p.key) else {
            continue;
        };

        match name.as_ref() {
            "descendants" => {
                if let Some(b) = extract_bool(&p.value, semantic) {
                    descendants = b;
                }
            }
            "emitDistinctChangesOnly" => {
                if let Some(b) = extract_bool(&p.value, semantic) {
                    emit_distinct = b;
                }
            }
            "static" => {
                if let Some(b) = extract_bool(&p.value, semantic) {
                    is_static = b;
                }
            }
            "read" => {
                read_span = Some(p.value.span());
            }
            _ => {}
        }
    }

    (descendants, emit_distinct, read_span, is_static)
}

struct DecoratorQueryOptions {
    descendants: bool,
    emit_distinct_changes_only: bool,
    read_span: Option<oxc_span::Span>,
    is_static: bool,
}

fn query_decorator_name(is_view: bool, first: bool) -> &'static str {
    match (is_view, first) {
        (true, true) => "ViewChild",
        (true, false) => "ViewChildren",
        (false, true) => "ContentChild",
        (false, false) => "ContentChildren",
    }
}

fn query_decorator_kind(canonical_name: &str) -> Option<(bool, bool)> {
    match canonical_name {
        "ViewChild" => Some((true, true)),
        "ViewChildren" => Some((true, false)),
        "ContentChild" => Some((false, true)),
        "ContentChildren" => Some((false, false)),
        _ => None,
    }
}

fn evaluate_boolean_option(
    expr: &Expression<'_>,
    eval: &EvalInput<'_, '_>,
) -> Result<Option<bool>, Box<crate::evaluator::ResolvedValue>> {
    let value = evaluate_expression(expr, eval);
    match value.unwrap_named() {
        crate::evaluator::ResolvedValue::Boolean(b) => Ok(Some(*b)),
        other if other.contains_incomplete() => Ok(None),
        _ => Err(Box::new(value)),
    }
}

fn decorator_query_options<'a>(
    options_arg: &'a Argument<'a>,
    name: &str,
    predicate_span: oxc_span::Span,
    default_descendants: bool,
    eval: &EvalInput<'a, '_>,
    issues: &mut Vec<ValueIssue>,
) -> Option<DecoratorQueryOptions> {
    let unwrapped = options_arg
        .as_expression()
        .map(super::utils::unwrap_expression);
    let Some(Expression::ObjectExpression(obj)) = unwrapped else {
        let span = unwrapped.map_or_else(|| options_arg.span(), GetSpan::span);
        issues.push(ValueIssue::arg_not_literal(
            span,
            format!("@{name} options must be an object literal"),
        ));
        return None;
    };

    let mut options = DecoratorQueryOptions {
        descendants: default_descendants,
        emit_distinct_changes_only: true,
        read_span: None,
        is_static: false,
    };

    for prop in &obj.properties {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        let Some(key) = extract_property_key(&p.key) else {
            continue;
        };
        let (slot, option, anchor) = match key.as_ref() {
            "read" => {
                options.read_span = Some(p.value.span());
                continue;
            }
            "descendants" => (&mut options.descendants, "descendants", p.value.span()),
            "emitDistinctChangesOnly" => (
                &mut options.emit_distinct_changes_only,
                "emitDistinctChangesOnly",
                p.value.span(),
            ),
            "static" => (&mut options.is_static, "static", predicate_span),
            _ => continue,
        };
        match evaluate_boolean_option(&p.value, eval) {
            Ok(Some(value)) => *slot = value,
            Ok(None) => {}
            Err(value) => {
                issues.push(ValueIssue::wrong_type_of(
                    anchor,
                    &value,
                    &format!("@{name} options.{option} must be a boolean"),
                ));
                return None;
            }
        }
    }

    Some(options)
}

struct DecoratorQuerySite<'a, 'b> {
    node_span: oxc_span::Span,
    name: &'static str,
    is_view: bool,
    first: bool,
    args: &'b [Argument<'a>],
    property_name: String,
    decorator_span: oxc_span::Span,
    property_span: Option<oxc_span::Span>,
}

fn extract_decorator_query_metadata<'a>(
    site: DecoratorQuerySite<'a, '_>,
    eval: &EvalInput<'a, '_>,
    issues: &mut Vec<ValueIssue>,
) -> Option<QueryData> {
    let name = site.name;
    let Some(first_arg) = site.args.first() else {
        issues.push(ValueIssue::arity_wrong(
            site.node_span,
            format!("@{name} must have arguments"),
        ));
        return None;
    };

    let predicate = extract_predicate(first_arg, PredicateKind::Decorator, eval);
    let default_descendants = name != "ContentChildren";

    let options = match site.args {
        [_] => None,
        [_, options_arg] => Some(decorator_query_options(
            options_arg,
            name,
            predicate.span,
            default_descendants,
            eval,
            issues,
        )?),
        _ => {
            issues.push(ValueIssue::arity_wrong(
                predicate.span,
                format!("@{name} has too many arguments"),
            ));
            return None;
        }
    };
    let options = options.unwrap_or(DecoratorQueryOptions {
        descendants: default_descendants,
        emit_distinct_changes_only: true,
        read_span: None,
        is_static: false,
    });

    Some(QueryData {
        property_name: site.property_name,
        first: site.first,
        predicate_span: predicate.span,
        predicate: predicate.predicate,
        is_forward_ref: predicate.is_forward_ref,
        descendants: options.descendants,
        emit_distinct_changes_only: options.emit_distinct_changes_only,
        read_span: options.read_span,
        options_span: None,
        is_static: options.is_static,
        is_signal: false,
        decorator_span: Some(site.decorator_span),
        is_view: site.is_view,
        property_span: site.property_span,
    })
}

struct MemberQueryDecorator<'a, 'b> {
    decorator: &'b oxc_ast::ast::Decorator<'a>,
    name: &'static str,
    is_view: bool,
    first: bool,
}

fn member_query_decorator<'a, 'b>(
    element: &'b ClassElement<'a>,
    decorators: &'b [oxc_ast::ast::Decorator<'a>],
    semantic: &Semantic<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
) -> Result<Option<MemberQueryDecorator<'a, 'b>>, ValueIssue> {
    let mut query_decorators = decorators.iter().filter_map(|decorator| {
        let name = get_canonical_decorator_name(decorator, semantic, angular_imports)?;
        let (is_view, first) = query_decorator_kind(name)?;
        Some(MemberQueryDecorator {
            decorator,
            name,
            is_view,
            first,
        })
    });
    let Some(found) = query_decorators.next() else {
        return Ok(None);
    };
    if query_decorators.next().is_some() {
        return Err(ValueIssue::decorator_collision(
            element.span(),
            "Cannot combine multiple query decorators.",
        ));
    }

    if decorators
        .iter()
        .any(|decorator| decorator_local_name(decorator) == Some("Input"))
    {
        return Err(ValueIssue::decorator_collision(
            element.span(),
            "Cannot combine @Input decorators with query decorators",
        ));
    }

    // `isPropertyTypeMember`: a property (auto-accessors included), getter or setter.
    let is_property_type_member = match element {
        ClassElement::PropertyDefinition(_) | ClassElement::AccessorProperty(_) => true,
        ClassElement::MethodDefinition(method) => matches!(
            method.kind,
            MethodDefinitionKind::Get | MethodDefinitionKind::Set
        ),
        _ => false,
    };
    if !is_property_type_member {
        return Err(ValueIssue::decorator_unexpected(
            element.span(),
            "Query decorator must go on a property-type member",
        ));
    }

    Ok(Some(found))
}

/// Extract query metadata from class members. The arguments of signal queries feed
/// `top_level_reads` (their predicate and `read` are re-emitted in `ɵcmp`); decorator queries are
/// covered by `get_member_decorators`.
pub fn extract_queries<'a>(
    class: &'a oxc_ast::ast::Class<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    semantic: &Semantic<'a>,
    eval: &crate::evaluator::EvalInput<'a, '_>,
    mut top_level_reads: Option<&mut super::TopLevelReads<'_, 'a, '_>>,
    issues: &mut Vec<ValueIssue>,
) -> Vec<AngularField> {
    let mut fields = Vec::new();

    for element in &class.body.body {
        let (decorators, key, value, is_static, access_level) = match element {
            ClassElement::PropertyDefinition(prop) => (
                &prop.decorators,
                &prop.key,
                prop.value.as_ref(),
                prop.r#static,
                MemberAccessLevel::of(&prop.key, prop.accessibility, prop.readonly),
            ),
            ClassElement::MethodDefinition(method) => (
                &method.decorators,
                &method.key,
                None,
                method.r#static,
                MemberAccessLevel::of(&method.key, method.accessibility, false),
            ),
            ClassElement::AccessorProperty(accessor) => (
                &accessor.decorators,
                &accessor.key,
                None,
                accessor.r#static,
                MemberAccessLevel::of(&accessor.key, accessor.accessibility, false),
            ),
            _ => continue,
        };

        // ngtsc's `reflectClassMember` only reflects members with an identifier, string or
        // private-identifier name; computed and numeric keys are not members to it.
        let Some(prop_name_cow) = crate::analyzer::utils::class_member_name(key) else {
            continue;
        };

        let found = match member_query_decorator(element, decorators, semantic, angular_imports) {
            Ok(found) => found,
            Err(issue) => {
                issues.push(issue);
                continue;
            }
        };

        let signal_call = value
            .map(Expression::get_inner_expression)
            .and_then(|expr| match expr {
                Expression::CallExpression(call) => Some(call),
                _ => None,
            })
            .and_then(|call| {
                let resolved = resolve_angular_call(call, semantic, angular_imports)?;
                let (is_view, first, default_descendants) = match resolved {
                    ResolvedAngularCall::ViewChild { .. } => (true, true, true),
                    ResolvedAngularCall::ViewChildren => (true, false, true),
                    ResolvedAngularCall::ContentChild { .. } => (false, true, true),
                    ResolvedAngularCall::ContentChildren => (false, false, false),
                    _ => return None,
                };
                Some((call, resolved, is_view, first, default_descendants))
            });

        if let (Some(found), Some(_)) = (&found, &signal_call) {
            issues.push(ValueIssue::disallowed_decorator(
                found.decorator.span,
                format!(
                    "Using @{} with a signal-based query is not allowed.",
                    found.name
                ),
            ));
            continue;
        }
        let query_node_span = match (&found, &signal_call) {
            (Some(found), _) => Some(found.decorator.span),
            (None, Some((call, ..))) => Some(call.span),
            (None, None) => None,
        };
        if let (Some(span), true) = (query_node_span, is_static) {
            issues.push(ValueIssue::declared_on_static_member(
                span,
                "Query is incorrectly declared on a static class member.",
            ));
            continue;
        }

        if let Some(found) = found {
            let args: &[Argument<'a>] =
                get_decorator_args(found.decorator).map_or(&[], |args| args);
            let query = extract_decorator_query_metadata(
                DecoratorQuerySite {
                    node_span: element.span(),
                    name: found.name,
                    is_view: found.is_view,
                    first: found.first,
                    args,
                    property_name: prop_name_cow.into_owned(),
                    decorator_span: found.decorator.span,
                    property_span: Some(element.span()),
                },
                eval,
                issues,
            );
            fields.extend(query.map(AngularField::Query));
            continue;
        }

        let Some((call, resolved_call, is_view, first, default_descendants)) = signal_call else {
            continue;
        };

        if !QUERY_ALLOWED_ACCESS_LEVELS.contains(&access_level) {
            issues.push(ValueIssue::disallowed_member_visibility(
                call.span,
                resolved_call.function_name(),
                access_level,
                &QUERY_ALLOWED_ACCESS_LEVELS,
            ));
            continue;
        }
        if let Some(issue) = signal_query_argument_issue(call) {
            issues.push(issue);
            continue;
        }

        let predicate = extract_predicate(&call.arguments[0], PredicateKind::Signal, eval);
        let (descendants, emit_distinct_changes_only, read_span, is_static) =
            extract_query_options(&call.arguments, default_descendants, semantic);
        let options_span = call
            .arguments
            .get(1)
            .and_then(|arg| arg.as_expression())
            .map(GetSpan::span);
        if let Some(reads) = top_level_reads.as_deref_mut() {
            super::collect_argument_references(
                &call.arguments,
                semantic,
                class.span.end,
                None,
                Some(reads),
                None,
            );
        }

        let meta = QueryData {
            property_name: prop_name_cow.into_owned(),
            first,
            predicate_span: predicate.span,
            predicate: predicate.predicate,
            is_forward_ref: predicate.is_forward_ref,
            descendants,
            emit_distinct_changes_only,
            read_span,
            options_span,
            is_static,
            is_signal: true,
            decorator_span: None,
            is_view,
            property_span: Some(element.span()),
        };

        fields.push(AngularField::Query(meta));
    }
    fields
}

fn signal_query_argument_issue(call: &oxc_ast::ast::CallExpression<'_>) -> Option<ValueIssue> {
    if call.arguments.is_empty() {
        return Some(ValueIssue::wrong_type(call.span, "No locator specified."));
    }
    let options = call.arguments.get(1)?;
    let Some(Expression::ObjectExpression(options)) = options.as_expression() else {
        return Some(ValueIssue::wrong_type(
            options.span(),
            "Argument needs to be an object literal.",
        ));
    };
    for prop in &options.properties {
        let ObjectPropertyKind::ObjectProperty(prop) = prop else {
            continue;
        };
        match extract_property_key(&prop.key).as_deref() {
            Some("read") if !is_literal_class_reference(&prop.value) => {
                return Some(ValueIssue::not_literal(
                    prop.value.span(),
                    "Query \"read\" option expected a literal class reference.",
                ));
            }
            Some("descendants") if !matches!(prop.value, Expression::BooleanLiteral(_)) => {
                return Some(ValueIssue::wrong_type(
                    prop.value.span(),
                    "Expected \"descendants\" option to be a boolean literal.",
                ));
            }
            _ => {}
        }
    }
    None
}

/// ngtsc's `parseReadOption` acceptance: `X`, `ns.X`, or either behind parentheses, `as` or
/// type arguments.
fn is_literal_class_reference(value: &Expression<'_>) -> bool {
    match value {
        Expression::ParenthesizedExpression(inner) => is_literal_class_reference(&inner.expression),
        Expression::TSAsExpression(inner) => is_literal_class_reference(&inner.expression),
        Expression::TSInstantiationExpression(inner) => {
            is_literal_class_reference(&inner.expression)
        }
        Expression::Identifier(_) => true,
        Expression::StaticMemberExpression(member) => {
            matches!(member.object, Expression::Identifier(_))
        }
        _ => false,
    }
}

pub(crate) fn validate_decorator_query_predicate(query: &QueryData) -> Option<ValueIssue> {
    let QueryPredicate::Evaluated(resolved) = &query.predicate else {
        return None;
    };
    let value = resolved.raw();
    if value.contains_incomplete() {
        return None;
    }
    let name = query_decorator_name(query.is_view, query.first);
    match value.unwrap_named() {
        crate::evaluator::ResolvedValue::Reference(_)
        | crate::evaluator::ResolvedValue::Dynamic(_)
        | crate::evaluator::ResolvedValue::String(_) => None,
        crate::evaluator::ResolvedValue::Array(items) => {
            let (position, item) = items.iter().enumerate().find(|(_, item)| {
                !matches!(
                    item.unwrap_named(),
                    crate::evaluator::ResolvedValue::String(_)
                )
            })?;
            Some(ValueIssue::wrong_type_of(
                query.predicate_span,
                item,
                &format!("Failed to resolve @{name} predicate at position {position} to a string"),
            ))
        }
        _ => Some(ValueIssue::wrong_type_of(
            query.predicate_span,
            value,
            &format!("@{name} predicate cannot be interpreted"),
        )),
    }
}

pub(crate) fn parse_queries_metadata<'a>(
    queries: &'a Expression<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    semantic: &Semantic<'a>,
    eval: &EvalInput<'a, '_>,
    issues: &mut Vec<ValueIssue>,
) -> Vec<QueryData> {
    let Expression::ObjectExpression(queries_obj) = queries else {
        issues.push(ValueIssue::wrong_type(
            queries.span(),
            "Decorator queries metadata must be an object literal",
        ));
        return Vec::new();
    };

    let mut out = Vec::new();
    for prop in &queries_obj.properties {
        let ObjectPropertyKind::ObjectProperty(qp) = prop else {
            continue;
        };
        let Some(property_name) = extract_property_key(&qp.key).map(|n| n.into_owned()) else {
            continue;
        };
        let query_expr = super::utils::unwrap_expression(&qp.value);
        let Expression::NewExpression(new_expr) = query_expr else {
            issues.push(ValueIssue::wrong_type(
                queries.span(),
                "Decorator query metadata must be an instance of a query type",
            ));
            continue;
        };
        let name = resolve_expression_symbol(query_expr, semantic, angular_imports)
            .and_then(|symbol| symbol.decorator_name())
            .filter(|name| query_decorator_kind(name).is_some());
        let Some(name) = name else {
            issues.push(ValueIssue::wrong_type(
                queries.span(),
                "Decorator query metadata must be an instance of a query type",
            ));
            continue;
        };
        let (is_view, first) = query_decorator_kind(name).expect("filtered to query decorators");
        let query = extract_decorator_query_metadata(
            DecoratorQuerySite {
                node_span: query_expr.span(),
                name,
                is_view,
                first,
                args: &new_expr.arguments,
                property_name,
                decorator_span: query_expr.span(),
                property_span: None,
            },
            eval,
            issues,
        );
        out.extend(query);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    #[derive(Debug)]
    struct QueryTestResult {
        property_name: String,
        first: bool,
        is_forward_ref: bool,
        predicate: Vec<String>,
        is_predicate_string: bool,
        descendants: bool,
        emit_distinct_changes_only: bool,
        read: Option<String>,
        options: Option<String>,
        is_static: bool,
        is_signal: bool,
        predicate_issue: Option<(&'static str, String, String)>,
    }

    fn parse_class(source_text: &str) -> (Vec<QueryTestResult>, Vec<QueryTestResult>) {
        let (queries, view_queries, issues) = parse_class_with_core(source_text, false);
        assert_eq!(issues, vec![], "unexpected issues");
        (queries, view_queries)
    }

    #[allow(clippy::type_complexity)]
    fn parse_class_with_core(
        source_text: &str,
        is_core: bool,
    ) -> (
        Vec<QueryTestResult>,
        Vec<QueryTestResult>,
        Vec<(&'static str, String, String)>,
    ) {
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source_text, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;

        let mut queries = Vec::new();
        let mut view_queries = Vec::new();
        let angular_imports = crate::analyzer::imports::extract_angular_imports(
            &ret.module_record,
            &semantic,
            is_core,
        );

        let import_map = crate::analyzer::extract_import_map(&ret.module_record);
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

        let mut issues = Vec::new();
        for stmt in &ret.program.body {
            if let oxc_ast::ast::Statement::ClassDeclaration(class_decl) = stmt {
                let fields = extract_queries(
                    class_decl,
                    &angular_imports,
                    &semantic,
                    &eval,
                    None,
                    &mut issues,
                );
                for field in fields {
                    if let AngularField::Query(q) = field {
                        // The selectors when there are any, otherwise the emitted expression.
                        let selectors = q.predicate.selectors();
                        let is_predicate_string = selectors.is_some();
                        let predicate = selectors.unwrap_or_else(|| {
                            vec![q.predicate_span.source_text(source_text).to_string()]
                        });
                        let read = q.read_span.map(|s| s.source_text(source_text).to_string());
                        let options = q
                            .options_span
                            .map(|s| s.source_text(source_text).to_string());
                        let predicate_issue = validate_decorator_query_predicate(&q).map(|issue| {
                            (
                                issue.code,
                                issue.message,
                                issue.span.source_text(source_text).to_string(),
                            )
                        });

                        let res = QueryTestResult {
                            property_name: q.property_name,
                            first: q.first,
                            is_forward_ref: q.is_forward_ref,
                            predicate,
                            is_predicate_string,
                            descendants: q.descendants,
                            emit_distinct_changes_only: q.emit_distinct_changes_only,
                            read,
                            options,
                            is_static: q.is_static,
                            is_signal: q.is_signal,
                            predicate_issue,
                        };
                        if q.is_view {
                            view_queries.push(res);
                        } else {
                            queries.push(res);
                        }
                    }
                }
            }
        }

        let sort_key = |q: &QueryTestResult| {
            if q.is_signal {
                0
            } else if q.first {
                1
            } else {
                2
            }
        };
        queries.sort_by_key(sort_key);
        view_queries.sort_by_key(sort_key);

        let issues = issues
            .into_iter()
            .map(|issue| {
                (
                    issue.code,
                    issue.message,
                    issue.span.source_text(source_text).to_string(),
                )
            })
            .collect();
        (queries, view_queries, issues)
    }

    #[test]
    fn test_extract_queries_decorators() {
        let source = r#"
        import { ViewChild, ViewChildren, ContentChild, ContentChildren, forwardRef } from '@angular/core';

        class SomeComponent {}

        class TestComponent {
            @ViewChild('myDiv') div!: ElementRef;
            @ViewChild('myTpl', { read: TemplateRef, static: true }) tpl!: TemplateRef<any>;
            @ViewChildren('item', { emitDistinctChangesOnly: false }) items!: QueryList<ElementRef>;
            @ContentChild('content', { descendants: true }) content!: ElementRef;
            @ContentChildren('contentItem', { descendants: false, emitDistinctChangesOnly: true }) contentItems!: QueryList<ElementRef>;
            @ContentChildren('contentItemDefault') contentItemsDefault!: QueryList<ElementRef>;

            @ViewChild(forwardRef(() => SomeComponent)) forwardComponent!: SomeComponent;
            @ContentChild(SomeModule.SomeDirective, { read: x.y.z }) complexComponent!: any;

            @ViewChild('setterQuery') set setterQuery(val: ElementRef) {}
        }
        "#;

        let (queries, view_queries) = parse_class(source);

        assert_eq!(queries.len(), 4);

        assert_eq!(queries[0].property_name, "content");
        assert!(queries[0].first);
        assert!(queries[0].descendants);
        assert_eq!(queries[0].predicate.len(), 1);
        assert_eq!(queries[0].predicate[0], "content");
        assert!(queries[0].is_predicate_string);
        assert!(queries[0].emit_distinct_changes_only);

        assert_eq!(queries[1].property_name, "complexComponent");
        assert!(queries[1].first);
        assert_eq!(queries[1].predicate[0], "SomeModule.SomeDirective");
        assert_eq!(queries[1].read.as_deref(), Some("x.y.z"));

        assert_eq!(queries[2].property_name, "contentItems");
        assert!(!queries[2].first);
        assert!(!queries[2].descendants);
        assert!(queries[2].emit_distinct_changes_only);

        assert_eq!(queries[3].property_name, "contentItemsDefault");
        assert!(!queries[3].first);
        assert!(!queries[3].descendants);
        assert!(queries[3].emit_distinct_changes_only);

        assert_eq!(view_queries.len(), 5);

        assert_eq!(view_queries[0].property_name, "div");
        assert!(view_queries[0].first);
        assert_eq!(view_queries[0].predicate.len(), 1);
        assert_eq!(view_queries[0].predicate[0], "myDiv");
        assert!(view_queries[0].descendants);
        assert!(view_queries[0].emit_distinct_changes_only);

        assert_eq!(view_queries[1].property_name, "tpl");
        assert!(view_queries[1].first);
        assert!(view_queries[1].is_static);
        assert_eq!(view_queries[1].read.as_deref(), Some("TemplateRef"));

        assert_eq!(view_queries[2].property_name, "forwardComponent");
        assert!(view_queries[2].first);
        assert!(view_queries[2].is_forward_ref);
        assert_eq!(view_queries[2].predicate[0], "SomeComponent");

        assert_eq!(view_queries[3].property_name, "setterQuery");
        assert!(view_queries[3].first);
        assert_eq!(view_queries[3].predicate[0], "setterQuery");

        assert_eq!(view_queries[4].property_name, "items");
        assert!(!view_queries[4].first);
        assert!(!view_queries[4].emit_distinct_changes_only);
    }

    #[test]
    fn test_extract_queries_signals() {
        let source = r#"
        import { viewChild, viewChildren, contentChild, contentChildren } from '@angular/core';
        import * as core from '@angular/core';
        class SignalComponent {
            signalDiv = viewChild<ElementRef>('myDiv');
            signalTpl = viewChild('myTpl', { read: TemplateRef });
            signalItems = viewChildren<ElementRef>('item');
            reqSignalDiv = viewChild.required<ElementRef>('myDiv');

            signalContent = contentChild<ElementRef>('content', { descendants: true });
            signalContentItems = contentChildren<ElementRef>('contentItem', { descendants: false });
            signalContentItemsDefault = contentChildren<ElementRef>('contentItemDefault');
            signalContentItemsNoDistinct = contentChildren<ElementRef>('contentItemNoDistinct', { emitDistinctChangesOnly: false });

            namespacedView = core.viewChild('nsView');
            namespacedReqView = core.viewChild.required('nsReqView');
        }
        "#;

        let (queries, view_queries) = parse_class(source);

        assert_eq!(queries.len(), 4);

        assert_eq!(queries[0].property_name, "signalContent");
        assert!(queries[0].first);
        assert!(queries[0].is_signal);
        assert!(queries[0].descendants);
        assert!(queries[0].emit_distinct_changes_only);
        assert_eq!(queries[0].options.as_deref(), Some("{ descendants: true }"));

        assert_eq!(queries[1].property_name, "signalContentItems");
        assert!(!queries[1].first);
        assert!(queries[1].is_signal);
        assert!(!queries[1].descendants);
        assert_eq!(
            queries[1].options.as_deref(),
            Some("{ descendants: false }")
        );

        assert_eq!(queries[2].property_name, "signalContentItemsDefault");
        assert!(!queries[2].first);
        assert!(!queries[2].descendants);
        assert!(queries[2].emit_distinct_changes_only);
        assert_eq!(queries[2].options, None);

        assert_eq!(queries[3].property_name, "signalContentItemsNoDistinct");
        assert!(!queries[3].first);
        assert!(!queries[3].emit_distinct_changes_only);
        assert_eq!(
            queries[3].options.as_deref(),
            Some("{ emitDistinctChangesOnly: false }")
        );

        assert_eq!(view_queries.len(), 6);

        assert_eq!(view_queries[0].property_name, "signalDiv");
        assert!(view_queries[0].first);
        assert!(view_queries[0].is_signal);
        assert!(view_queries[0].descendants);
        assert!(view_queries[0].emit_distinct_changes_only);
        assert_eq!(view_queries[0].options, None);

        assert_eq!(view_queries[1].property_name, "signalTpl");
        assert!(view_queries[1].first);
        assert_eq!(view_queries[1].read.as_deref(), Some("TemplateRef"));
        assert_eq!(
            view_queries[1].options.as_deref(),
            Some("{ read: TemplateRef }")
        );

        assert_eq!(view_queries[2].property_name, "signalItems");
        assert!(!view_queries[2].first);

        assert_eq!(view_queries[3].property_name, "reqSignalDiv");
        assert!(view_queries[3].first);
        assert_eq!(view_queries[3].predicate[0], "myDiv");

        assert_eq!(view_queries[4].property_name, "namespacedView");
        assert!(view_queries[4].first);
        assert_eq!(view_queries[4].predicate[0], "nsView");
        assert!(view_queries[4].is_signal);

        assert_eq!(view_queries[5].property_name, "namespacedReqView");
        assert!(view_queries[5].first);
        assert_eq!(view_queries[5].predicate[0], "nsReqView");
        assert!(view_queries[5].is_signal);
    }

    /// Regression: when Angular symbols are imported through a package-internal relative path
    /// (ngtsc's `isCore` mode, e.g. `@angular/core`'s own test files) they must still be
    /// recognized as queries.
    #[test]
    fn test_extract_queries_core_internal_import() {
        let source = r#"
        import { ViewChild, ContentChild } from '../../src/core';

        class SomeComponent {
            @ViewChild('viewQuery') viewChild!: any;

            @ContentChild(TextDirective, { static: true })
            get textDir(): any {
                return this._textDir;
            }
        }
        "#;

        let (content_off, view_off, _) = parse_class_with_core(source, false);
        assert!(view_off.is_empty());
        assert!(content_off.is_empty());

        let (content_on, view_on, issues) = parse_class_with_core(source, true);
        assert_eq!(issues, vec![]);
        assert_eq!(view_on.len(), 1);
        assert_eq!(view_on[0].property_name, "viewChild");
        assert_eq!(view_on[0].predicate[0], "viewQuery");

        assert_eq!(content_on.len(), 1);
        assert_eq!(content_on[0].property_name, "textDir");
        assert!(content_on[0].is_static);
    }

    /// A decorator query's predicate goes through the partial evaluator
    /// (`extractDecoratorQueryMetadata`), so substitutions fold, escapes are cooked and arrays
    /// keep their elements. A signal query's locator is only ever read as a string literal
    /// (`parseLocator`): anything else, a substituted template literal included, is an
    /// expression.
    #[test]
    fn test_query_predicates_follow_ngtsc_evaluation() {
        let source = r#"
        import { ViewChild, ViewChildren, ContentChild, viewChild, contentChild } from '@angular/core';

        const PREFIX = 'my';
        class Marker {}

        class TestComponent {
            @ViewChild(`${PREFIX}Ref`) templated: any;
            @ViewChild(Marker) byType: any;
            @ViewChildren(['x,y', 'z'] as any) arrayWithComma: any;
            @ContentChild('it\'s') escaped: any;

            signalTemplate = viewChild(`${PREFIX}Sig`);
            signalBare = viewChild(`bare`);
            signalEscaped = contentChild('sig\'s');
        }
        "#;

        let (content, view) = parse_class(source);

        assert_eq!(content.len(), 2);
        assert_eq!(content[0].property_name, "signalEscaped");
        assert!(content[0].is_predicate_string);
        assert_eq!(content[0].predicate, ["sig's"]);
        assert_eq!(content[1].property_name, "escaped");
        assert!(content[1].is_predicate_string);
        assert_eq!(content[1].predicate, ["it's"]);

        assert_eq!(view.len(), 5);
        assert_eq!(view[0].property_name, "signalTemplate");
        assert!(!view[0].is_predicate_string);
        assert_eq!(view[0].predicate, ["`${PREFIX}Sig`"]);
        assert_eq!(view[1].property_name, "signalBare");
        assert!(view[1].is_predicate_string);
        assert_eq!(view[1].predicate, ["bare"]);
        assert_eq!(view[2].property_name, "templated");
        assert!(view[2].is_predicate_string);
        assert_eq!(view[2].predicate, ["myRef"]);
        assert_eq!(view[3].property_name, "byType");
        assert!(!view[3].is_predicate_string);
        assert_eq!(view[3].predicate, ["Marker"]);
        // Selectors stay unsplit here: splitting on commas is `getQueryPredicate`'s job.
        assert_eq!(view[4].property_name, "arrayWithComma");
        assert!(view[4].is_predicate_string);
        assert_eq!(view[4].predicate, ["x,y", "z"]);
    }

    #[test]
    fn test_extract_queries_string_literal_key() {
        let source = r#"
        import { ViewChild } from '@angular/core';

        class SomeComponent {
            @ViewChild('viewQuery') 'quotedProp'!: any;
        }
        "#;

        let (_, view) = parse_class(source);
        assert_eq!(view.len(), 1);
        assert_eq!(view[0].property_name, "quotedProp");
        assert_eq!(view[0].predicate[0], "viewQuery");
    }

    #[test]
    fn test_extract_queries_setter_accessor() {
        let source = r#"
        import { ContentChild } from '@angular/core';

        class SomeComponent {
            @ContentChild('setterQuery')
            set myProp(val: any) {
                this._val = val;
            }
        }
        "#;

        let (content, _) = parse_class(source);
        assert_eq!(content.len(), 1);
        assert_eq!(content[0].property_name, "myProp");
        assert_eq!(content[0].predicate[0], "setterQuery");
    }

    #[test]
    fn test_decorator_query_member_shape_issues() {
        let source = r#"
        import { ViewChild, ContentChild, ContentChildren, Input } from '@angular/core';

        class TestCmp {
            @ContentChild('bar', {static: true})
            @ContentChild('foo')
            multiple: any;

            @Input() @ViewChild('foo') withInput: any;

            @ContentChildren('foo')
            private someFn() {}

            @ViewChild('ok') fine: any;
        }
        "#;

        let (content, view, issues) = parse_class_with_core(source, false);
        assert!(content.is_empty());
        assert_eq!(view.len(), 1);
        assert_eq!(view[0].property_name, "fine");
        assert_eq!(
            issues,
            vec![
                (
                    "1006",
                    "Cannot combine multiple query decorators.".to_string(),
                    "@ContentChild('bar', {static: true})\n            @ContentChild('foo')\n            multiple: any;"
                        .to_string()
                ),
                (
                    "1006",
                    "Cannot combine @Input decorators with query decorators".to_string(),
                    "@Input() @ViewChild('foo') withInput: any;".to_string()
                ),
                (
                    "1005",
                    "Query decorator must go on a property-type member".to_string(),
                    "@ContentChildren('foo')\n            private someFn() {}".to_string()
                ),
            ]
        );
    }

    #[test]
    fn test_decorator_query_arity_issues() {
        let source = r#"
        import { ViewChild, ViewChildren, ContentChild } from '@angular/core';

        class TestCmp {
            @ViewChild() none: any;
            @ViewChildren bare: any;
            @ContentChild('foo', {}, 'invalid-extra-arg') tooMany: any;
        }
        "#;

        let (content, view, issues) = parse_class_with_core(source, false);
        assert!(content.is_empty());
        assert!(view.is_empty());
        assert_eq!(
            issues,
            vec![
                (
                    "1002",
                    "@ViewChild must have arguments".to_string(),
                    "@ViewChild() none: any;".to_string()
                ),
                (
                    "1002",
                    "@ViewChildren must have arguments".to_string(),
                    "@ViewChildren bare: any;".to_string()
                ),
                (
                    "1002",
                    "@ContentChild has too many arguments".to_string(),
                    "'foo'".to_string()
                ),
            ]
        );
    }

    #[test]
    fn test_decorator_query_options_issues() {
        let source = r#"
        import { ViewChild, ContentChild, ContentChildren } from '@angular/core';

        const OPTIONS = {static: true};
        const DESCENDANTS = 'invalid';

        class TestCmp {
            @ViewChild('foo', 'invalidOptionsArgumentType') notLiteral: any;
            @ViewChild('foo', OPTIONS) throughConstant: any;
            @ContentChild('foo', {descendants: 'invalid'}) badDescendants: any;
            @ContentChildren('foo', {descendants: DESCENDANTS}) badDescendantsConst: any;
            @ViewChild('foo', {emitDistinctChangesOnly: 1}) badDistinct: any;
            @ViewChild('foo', {static: null}) badStatic: any;
            @ViewChild('foo', ({read: ElementRef, static: true} as any)) wrapped: any;
        }
        "#;

        let (content, view, issues) = parse_class_with_core(source, false);
        assert!(content.is_empty());
        assert_eq!(view.len(), 1);
        assert_eq!(view[0].property_name, "wrapped");
        assert!(view[0].is_static);
        assert_eq!(view[0].read.as_deref(), Some("ElementRef"));
        assert_eq!(
            issues,
            vec![
                (
                    "1001",
                    "@ViewChild options must be an object literal".to_string(),
                    "'invalidOptionsArgumentType'".to_string()
                ),
                (
                    "1001",
                    "@ViewChild options must be an object literal".to_string(),
                    "OPTIONS".to_string()
                ),
                (
                    "1010",
                    "@ContentChild options.descendants must be a boolean\n  Value is of type 'string'."
                        .to_string(),
                    "'invalid'".to_string()
                ),
                (
                    "1010",
                    "@ContentChildren options.descendants must be a boolean\n  Value is of type 'string'."
                        .to_string(),
                    "DESCENDANTS".to_string()
                ),
                (
                    "1010",
                    "@ViewChild options.emitDistinctChangesOnly must be a boolean\n  Value is of type 'number'."
                        .to_string(),
                    "1".to_string()
                ),
                (
                    "1010",
                    "@ViewChild options.static must be a boolean\n  Value is of type 'null'."
                        .to_string(),
                    "'foo'".to_string()
                ),
            ]
        );
    }

    #[test]
    fn test_decorator_query_predicate_issues() {
        let source = r#"
        import { ViewChild, ContentChildren } from '@angular/core';

        class Marker {}

        class TestCmp {
            @ViewChild({'invalid-predicate-type': true}) object: any;
            @ContentChildren(['predicate-a', {'invalid-predicate-type': true}]) mixed: any;
            @ViewChild(42) number: any;
            @ViewChild(Marker) reference: any;
            @ViewChild(globalThis.whatever) dynamic: any;
            @ViewChild(['a', 'b']) strings: any;
        }
        "#;

        let (content, view, issues) = parse_class_with_core(source, false);
        assert_eq!(issues, vec![]);
        let predicate_issues: Vec<_> = content
            .iter()
            .chain(&view)
            .filter_map(|q| q.predicate_issue.clone())
            .collect();
        assert_eq!(
            predicate_issues,
            vec![
                (
                    "1010",
                    "Failed to resolve @ContentChildren predicate at position 1 to a string\n  Value is of type '{ 'invalid-predicate-type': boolean }'."
                        .to_string(),
                    "['predicate-a', {'invalid-predicate-type': true}]".to_string()
                ),
                (
                    "1010",
                    "@ViewChild predicate cannot be interpreted\n  Value is of type '{ 'invalid-predicate-type': boolean }'."
                        .to_string(),
                    "{'invalid-predicate-type': true}".to_string()
                ),
                (
                    "1010",
                    "@ViewChild predicate cannot be interpreted\n  Value is of type 'number'."
                        .to_string(),
                    "42".to_string()
                ),
            ]
        );
    }
}
