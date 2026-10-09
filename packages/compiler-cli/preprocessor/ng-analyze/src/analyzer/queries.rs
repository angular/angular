use oxc_ast::ast::{Argument, ClassElement, Expression, MethodDefinitionKind, ObjectPropertyKind};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

use crate::evaluator::{evaluate_expression, EvalInput, Resolved};

use super::utils::{
    extract_bool, extract_literal_string, extract_property_key, get_decorator_args,
    resolve_angular_call, resolve_expression_symbol, resolve_local_expression, unwrap_forward_ref,
    ResolvedAngularCall,
};
use crate::analyzer::class_data::{AngularField, QueryData, QueryPredicate};

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

/// Extract query metadata from class members.
pub fn extract_queries<'a>(
    class: &'a oxc_ast::ast::Class<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    semantic: &Semantic<'a>,
    eval: &crate::evaluator::EvalInput<'a, '_>,
) -> Vec<AngularField> {
    let mut fields = Vec::new();

    for element in &class.body.body {
        let (decorators, key, value) = match element {
            ClassElement::PropertyDefinition(prop) => {
                (&prop.decorators, &prop.key, prop.value.as_ref())
            }
            ClassElement::MethodDefinition(method)
                if matches!(
                    method.kind,
                    MethodDefinitionKind::Set | MethodDefinitionKind::Get
                ) =>
            {
                (&method.decorators, &method.key, None)
            }
            _ => continue,
        };

        let Some(prop_name_cow) = crate::analyzer::utils::extract_property_key(key) else {
            continue;
        };
        let mut is_decorator_query = false;

        for decorator in decorators {
            let Some(canonical_name) = crate::analyzer::utils::get_canonical_decorator_name(
                decorator,
                semantic,
                angular_imports,
            ) else {
                continue;
            };

            let (is_view, first) = match canonical_name {
                "ViewChild" => (true, true),
                "ViewChildren" => (true, false),
                "ContentChild" => (false, true),
                "ContentChildren" => (false, false),
                _ => continue,
            };

            let Some(args) = get_decorator_args(decorator) else {
                continue;
            };

            if args.is_empty() {
                continue;
            }

            let predicate = extract_predicate(&args[0], PredicateKind::Decorator, eval);
            // https://github.com/angular/angular/blob/fd95735/packages/compiler-cli/src/ngtsc/annotations/directive/src/query_functions.ts#L60
            let default_descendants = canonical_name != "ContentChildren";
            let (descendants, emit_distinct_changes_only, read_span, is_static) =
                extract_query_options(args, default_descendants, semantic);

            let meta = QueryData {
                property_name: prop_name_cow.as_ref().to_string(),
                first,
                predicate_span: predicate.span,
                predicate: predicate.predicate,
                is_forward_ref: predicate.is_forward_ref,
                descendants,
                emit_distinct_changes_only,
                read_span,
                is_static,
                is_signal: false,
                decorator_span: Some(decorator.span),
                is_view,
                property_span: Some(element.span()),
            };

            fields.push(AngularField::Query(meta));
            is_decorator_query = true;
            break;
        }

        if is_decorator_query {
            continue;
        }

        let Some(Expression::CallExpression(call)) = value.map(Expression::get_inner_expression)
        else {
            continue;
        };

        let Some(resolved_call) = resolve_angular_call(call, semantic, angular_imports) else {
            continue;
        };

        let (is_view, first, default_descendants) = match resolved_call {
            ResolvedAngularCall::ViewChild { .. } => (true, true, true),
            ResolvedAngularCall::ViewChildren => (true, false, true),
            ResolvedAngularCall::ContentChild { .. } => (false, true, true),
            ResolvedAngularCall::ContentChildren => (false, false, false),
            _ => continue,
        };

        if call.arguments.is_empty() {
            continue;
        }

        let predicate = extract_predicate(&call.arguments[0], PredicateKind::Signal, eval);
        let (descendants, emit_distinct_changes_only, read_span, is_static) =
            extract_query_options(&call.arguments, default_descendants, semantic);

        let meta = QueryData {
            property_name: prop_name_cow.into_owned(),
            first,
            predicate_span: predicate.span,
            predicate: predicate.predicate,
            is_forward_ref: predicate.is_forward_ref,
            descendants,
            emit_distinct_changes_only,
            read_span,
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

pub(crate) fn parse_legacy_query<'a>(
    property_name: String,
    expr: &'a Expression<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    semantic: &Semantic<'a>,
    eval: &EvalInput<'a, '_>,
) -> Option<QueryData> {
    let (symbol, args) = match expr.get_inner_expression() {
        Expression::NewExpression(n) => {
            let symbol = resolve_expression_symbol(expr, semantic, angular_imports)?;
            (symbol, &n.arguments)
        }
        Expression::CallExpression(c) => {
            let symbol = resolve_expression_symbol(expr, semantic, angular_imports)?;
            (symbol, &c.arguments)
        }
        _ => return None,
    };

    let (is_view, first) = match symbol {
        crate::analyzer::imports::AngularImportSymbol::ViewChildDecorator => (true, true),
        crate::analyzer::imports::AngularImportSymbol::ViewChildrenDecorator => (true, false),
        crate::analyzer::imports::AngularImportSymbol::ContentChildDecorator => (false, true),
        crate::analyzer::imports::AngularImportSymbol::ContentChildrenDecorator => (false, false),
        _ => return None,
    };

    if args.is_empty() {
        return None;
    }

    let predicate = extract_predicate(&args[0], PredicateKind::Decorator, eval);

    let default_descendants =
        symbol != crate::analyzer::imports::AngularImportSymbol::ContentChildrenDecorator;
    let (descendants, emit_distinct_changes_only, read_span, is_static) =
        extract_query_options(args, default_descendants, semantic);

    Some(QueryData {
        property_name,
        first,
        predicate_span: predicate.span,
        predicate: predicate.predicate,
        is_forward_ref: predicate.is_forward_ref,
        descendants,
        emit_distinct_changes_only,
        read_span,
        is_static,
        is_signal: false,
        decorator_span: Some(expr.span()),
        is_view,
        property_span: None,
    })
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
        is_static: bool,
        is_signal: bool,
    }

    fn parse_class(source_text: &str) -> (Vec<QueryTestResult>, Vec<QueryTestResult>) {
        parse_class_with_core(source_text, false)
    }

    fn parse_class_with_core(
        source_text: &str,
        is_core: bool,
    ) -> (Vec<QueryTestResult>, Vec<QueryTestResult>) {
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

        for stmt in &ret.program.body {
            if let oxc_ast::ast::Statement::ClassDeclaration(class_decl) = stmt {
                let fields = extract_queries(class_decl, &angular_imports, &semantic, &eval);
                for field in fields {
                    if let AngularField::Query(q) = field {
                        // The selectors when there are any, otherwise the emitted expression.
                        let selectors = q.predicate.selectors();
                        let is_predicate_string = selectors.is_some();
                        let predicate = selectors.unwrap_or_else(|| {
                            vec![q.predicate_span.source_text(source_text).to_string()]
                        });
                        let read = q.read_span.map(|s| s.source_text(source_text).to_string());

                        let res = QueryTestResult {
                            property_name: q.property_name,
                            first: q.first,
                            is_forward_ref: q.is_forward_ref,
                            predicate,
                            is_predicate_string,
                            descendants: q.descendants,
                            emit_distinct_changes_only: q.emit_distinct_changes_only,
                            read,
                            is_static: q.is_static,
                            is_signal: q.is_signal,
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

        (queries, view_queries)
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

        assert_eq!(queries[1].property_name, "signalContentItems");
        assert!(!queries[1].first);
        assert!(queries[1].is_signal);
        assert!(!queries[1].descendants);

        assert_eq!(queries[2].property_name, "signalContentItemsDefault");
        assert!(!queries[2].first);
        assert!(!queries[2].descendants);
        assert!(queries[2].emit_distinct_changes_only);

        assert_eq!(queries[3].property_name, "signalContentItemsNoDistinct");
        assert!(!queries[3].first);
        assert!(!queries[3].emit_distinct_changes_only);

        assert_eq!(view_queries.len(), 6);

        assert_eq!(view_queries[0].property_name, "signalDiv");
        assert!(view_queries[0].first);
        assert!(view_queries[0].is_signal);
        assert!(view_queries[0].descendants);
        assert!(view_queries[0].emit_distinct_changes_only);

        assert_eq!(view_queries[1].property_name, "signalTpl");
        assert!(view_queries[1].first);
        assert_eq!(view_queries[1].read.as_deref(), Some("TemplateRef"));

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

        let (content_off, view_off) = parse_class_with_core(source, false);
        assert!(view_off.is_empty());
        assert!(content_off.is_empty());

        let (content_on, view_on) = parse_class_with_core(source, true);
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
}
