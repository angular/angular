use std::collections::HashMap;

use oxc_ast::ast::{
    ArrowFunctionExpression, CallExpression, Class, ClassElement, ClassType, Expression,
    MethodDefinitionKind,
};
use oxc_ast::AstKind;
use oxc_ast_visit::{walk, Visit};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

use super::class_data::ValueIssue;
use super::imports::AngularImports;
use super::utils::{extract_property_key, get_canonical_decorator_name, resolve_angular_call};

/// Every `NG8110` and `NG8118` in the file, in source order of the offending node.
pub fn initializer_api_usage_issues<'a>(
    semantic: &Semantic<'a>,
    angular_imports: &AngularImports,
    source_text: &str,
) -> Vec<ValueIssue> {
    // `shouldCheck`: nothing to find without an initializer API in scope.
    if !angular_imports
        .symbols
        .values()
        .any(|symbol| symbol.is_initializer_fn() || symbol.is_namespace())
    {
        return Vec::new();
    }

    let mut issues = Vec::new();
    for node in semantic.nodes().iter() {
        match node.kind() {
            AstKind::CallExpression(call) => {
                issues.extend(unsupported_usage_issue(
                    call,
                    node.id(),
                    semantic,
                    angular_imports,
                ));
            }
            AstKind::Class(class) if class.r#type == ClassType::ClassDeclaration => {
                issues.extend(forbidden_required_invocations(
                    class,
                    semantic,
                    angular_imports,
                    source_text,
                ));
            }
            _ => {}
        }
    }
    issues
}

/// `InitializerApiUsageRule.checkNode` for one call.
fn unsupported_usage_issue<'a>(
    call: &CallExpression<'a>,
    node_id: oxc_semantic::NodeId,
    semantic: &Semantic<'a>,
    angular_imports: &AngularImports,
) -> Option<ValueIssue> {
    let api = resolve_angular_call(call, semantic, angular_imports)?;
    let nodes = semantic.nodes();
    let parent = nodes.parent_node(node_id);

    // ngtsc climbs out of parentheses and `as` casts and then requires the node it landed on to
    // be a call, which a wrapped call never is: wrapped calls are not checked at all.
    if matches!(
        parent.kind(),
        AstKind::ParenthesizedExpression(_) | AstKind::TSAsExpression(_)
    ) {
        return None;
    }

    let function_name = format!(
        "{}{}",
        api.function_name(),
        if api.is_required() { ".required" } else { "" }
    );

    let initialized_property = match parent.kind() {
        AstKind::PropertyDefinition(prop) => prop
            .value
            .as_ref()
            .is_some_and(|value| value.span() == call.span),
        _ => false,
    };
    if initialized_property {
        let mut ancestor = parent;
        let class = loop {
            match ancestor.kind() {
                AstKind::Class(class) if class.r#type == ClassType::ClassDeclaration => {
                    break Some(class)
                }
                AstKind::Program(_) => break None,
                _ => ancestor = nodes.parent_node(ancestor.id()),
            }
        };
        if let Some(class) = class {
            let is_component_or_directive = class.decorators.iter().any(|decorator| {
                matches!(
                    get_canonical_decorator_name(decorator, semantic, angular_imports),
                    Some("Component" | "Directive")
                )
            });
            if is_component_or_directive {
                return None;
            }
            return Some(ValueIssue::unsupported_initializer_api_usage(
                call.span,
                format!(
                    "Unsupported call to the {function_name} function. This function can only be \
                     used as the initializer of a property on a @Component or @Directive class."
                ),
            ));
        }
    }

    Some(ValueIssue::unsupported_initializer_api_usage(
        call.span,
        format!(
            "Unsupported call to the {function_name} function. This function can only be called \
             in the initializer of a class member."
        ),
    ))
}

fn forbidden_required_invocations<'a>(
    class: &Class<'a>,
    semantic: &Semantic<'a>,
    angular_imports: &AngularImports,
    source_text: &str,
) -> Vec<ValueIssue> {
    let mut required: HashMap<String, &str> = HashMap::new();
    for element in &class.body.body {
        let ClassElement::PropertyDefinition(prop) = element else {
            continue;
        };
        let Some(Expression::CallExpression(call)) = prop.value.as_ref() else {
            continue;
        };
        let Some(api) = resolve_angular_call(call, semantic, angular_imports) else {
            continue;
        };
        if !api.is_required() || !api.is_required_initializer_candidate() {
            continue;
        }
        let Expression::StaticMemberExpression(callee) = &call.callee else {
            continue;
        };
        let Some(name) = extract_property_key(&prop.key) else {
            continue;
        };
        required.insert(
            name.into_owned(),
            callee.object.span().source_text(source_text),
        );
    }
    if required.is_empty() {
        return Vec::new();
    }

    let mut finder = ForbiddenInvocationFinder {
        required: &required,
        issues: Vec::new(),
    };
    for element in &class.body.body {
        if let ClassElement::PropertyDefinition(prop) = element {
            if let Some(value) = &prop.value {
                finder.visit_expression(value);
            }
        }
    }
    let constructor = class.body.body.iter().find_map(|element| match element {
        ClassElement::MethodDefinition(method)
            if method.kind == MethodDefinitionKind::Constructor && method.value.body.is_some() =>
        {
            Some(method)
        }
        _ => None,
    });
    if let Some(constructor) = constructor {
        finder.visit_method_definition(constructor);
    }
    finder.issues
}

struct ForbiddenInvocationFinder<'r> {
    required: &'r HashMap<String, &'r str>,
    issues: Vec<ValueIssue>,
}

impl<'a> Visit<'a> for ForbiddenInvocationFinder<'_> {
    // Arrow and function *expressions* are skipped (ngtsc: reads inside an `effect` callback are
    // fine); method bodies, which oxc also models as `Function`, are not.
    fn visit_arrow_function_expression(&mut self, _: &ArrowFunctionExpression<'a>) {}

    fn visit_expression(&mut self, expr: &Expression<'a>) {
        if matches!(expr, Expression::FunctionExpression(_)) {
            return;
        }
        walk::walk_expression(self, expr);
    }

    fn visit_call_expression(&mut self, call: &CallExpression<'a>) {
        if let Expression::StaticMemberExpression(member) = &call.callee {
            if matches!(member.object, Expression::ThisExpression(_)) {
                let name = member.property.name.as_str();
                if let Some(api) = self.required.get(name) {
                    self.issues
                        .push(ValueIssue::forbidden_required_initializer_invocation(
                            member.span,
                            format!(
                                "`{name}` is a required `{api}` and does not have a value in this \
                             context."
                            ),
                        ));
                }
            }
        }
        walk::walk_call_expression(self, call);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    fn issues(source: &str) -> Vec<(&'static str, String, String)> {
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
        let angular_imports =
            super::super::imports::extract_angular_imports(&ret.module_record, &semantic, false);
        initializer_api_usage_issues(&semantic, &angular_imports, source)
            .into_iter()
            .map(|issue| {
                let text = &source[issue.span.start as usize..issue.span.end as usize];
                (issue.code, issue.message, text.to_string())
            })
            .collect()
    }

    const NOT_INITIALIZER: &str =
        "This function can only be called in the initializer of a class member.";
    const NOT_DIRECTIVE: &str = "This function can only be used as the initializer of a property \
                                 on a @Component or @Directive class.";

    #[test]
    fn reports_calls_outside_initializers() {
        let found = issues(
            "import {Component, input, model as m} from '@angular/core';\n\
             import * as ng from '@angular/core';\n\
             function a() { return input(); }\n\
             function b() { return input.required<boolean>(); }\n\
             function c() { return m(); }\n\
             function d() { return ng.viewChild('x'); }\n\
             @Component({template: ''})\n\
             export class TestDir {\n  inp: any;\n  constructor() { this.inp = input(); }\n\
             \x20 nested = (() => { return input(); })();\n}",
        );
        let messages: Vec<String> = found
            .iter()
            .map(|(code, message, text)| format!("{code} {text} => {message}"))
            .collect();
        assert_eq!(
            messages,
            [
                format!(
                    "8110 input() => Unsupported call to the input function. {NOT_INITIALIZER}"
                ),
                format!(
                    "8110 input.required<boolean>() => Unsupported call to the input.required \
                     function. {NOT_INITIALIZER}"
                ),
                format!("8110 m() => Unsupported call to the model function. {NOT_INITIALIZER}"),
                format!(
                    "8110 ng.viewChild('x') => Unsupported call to the viewChild function. \
                     {NOT_INITIALIZER}"
                ),
                format!(
                    "8110 input() => Unsupported call to the input function. {NOT_INITIALIZER}"
                ),
                format!(
                    "8110 input() => Unsupported call to the input function. {NOT_INITIALIZER}"
                ),
            ]
        );
    }

    #[test]
    fn reports_initializers_on_classes_that_are_not_directives() {
        let found = issues(
            "import {input, Pipe, Component, Directive} from '@angular/core';\n\
             export class Plain { inp = input(); }\n\
             @Pipe({name: 'p'}) export class P { inp = input(); }\n\
             @Component({template: ''}) export class C { inp = input(); }\n\
             @Directive() export class D { inp = input(); }",
        );
        assert_eq!(found.len(), 2);
        assert!(found
            .iter()
            .all(|(code, message, _)| *code == "8110" && message.ends_with(NOT_DIRECTIVE)));
    }

    #[test]
    fn checks_output_from_observable_without_core_initializer_imports() {
        let found = issues(
            "import {outputFromObservable} from '@angular/core/rxjs-interop';\n\
             function a() { return outputFromObservable({} as any); }\n\
             export class Plain { out = outputFromObservable({} as any); }",
        );
        assert_eq!(
            found,
            [
                (
                    "8110",
                    format!(
                        "Unsupported call to the outputFromObservable function. {NOT_INITIALIZER}"
                    ),
                    "outputFromObservable({} as any)".to_string(),
                ),
                (
                    "8110",
                    format!(
                        "Unsupported call to the outputFromObservable function. {NOT_DIRECTIVE}"
                    ),
                    "outputFromObservable({} as any)".to_string(),
                ),
            ]
        );
    }

    #[test]
    fn wrapped_calls_are_not_checked() {
        assert!(issues(
            "import {Component, input} from '@angular/core';\n\
             @Component({template: ''}) export class C { a = (input()); b = input() as any; }\n\
             export class Plain { c = (((input()))); }",
        )
        .is_empty());
    }

    #[test]
    fn reports_required_initializers_read_without_a_value() {
        let found = issues(
            "import {input, model, viewChild, Component, effect} from '@angular/core';\n\
             import * as ng from '@angular/core';\n\
             function foobar(x: any) {}\n\
             @Component({template: ''})\n\
             export class Test {\n\
             \x20 reqInp = input.required<string>();\n\
             \x20 reqModel = model.required<string>();\n\
             \x20 reqChild = viewChild.required('ref');\n\
             \x20 reqNs = ng.input.required<string>();\n\
             \x20 plain = input<string>('');\n\
             \x20 a = this.reqInp();\n\
             \x20 b = foobar(this.reqModel());\n\
             \x20 c = this.plain();\n\
             \x20 d = effect(() => this.reqInp());\n\
             \x20 e = this.reqInp;\n\
             \x20 constructor() {\n\
             \x20   this.reqModel.set('x');\n\
             \x20   const x = this.reqChild();\n\
             \x20   const y = this.reqNs();\n\
             \x20   effect(function(this: Test) { this.reqInp(); });\n\
             \x20 }\n}",
        );
        assert_eq!(
            found,
            [
                (
                    "8118",
                    "`reqInp` is a required `input` and does not have a value in this context."
                        .to_string(),
                    "this.reqInp".to_string()
                ),
                (
                    "8118",
                    "`reqModel` is a required `model` and does not have a value in this context."
                        .to_string(),
                    "this.reqModel".to_string()
                ),
                (
                    "8118",
                    "`reqChild` is a required `viewChild` and does not have a value in this \
                     context."
                        .to_string(),
                    "this.reqChild".to_string()
                ),
                (
                    "8118",
                    "`reqNs` is a required `ng.input` and does not have a value in this context."
                        .to_string(),
                    "this.reqNs".to_string()
                ),
            ]
        );
    }
}
