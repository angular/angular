use oxc_ast::ast::{Argument, Expression, ObjectPropertyKind};
use oxc_span::GetSpan;

use crate::analyzer::class_data::{AngularField, InputData, OutputData, TransformData, ValueIssue};
use crate::analyzer::evaluated_io::{
    read_input_options, read_output_alias, ClassMemberFacts, IoKind, MemberIoOptions, Read,
};
use crate::evaluator::{evaluate_expression, EvalInput, Resolved};
use oxc_semantic::Semantic;

pub struct ExtractContext<'a, 'e> {
    pub angular_imports: &'a crate::analyzer::imports::AngularImports,
    pub semantic: &'a Semantic<'a>,
    pub eval: &'a EvalInput<'a, 'e>,
}

use super::utils::{
    extract_literal_string, extract_property_key, get_decorator_args, is_angular_decorator_named,
    resolve_angular_call, ResolvedAngularCall,
};

/// Member-level input/output extraction results, including class member facts for binding
/// decorator metadata arrays, pending cross-file `@Input`/`@Output` arguments, and diagnostics.
#[derive(Default)]
pub struct MemberIo {
    pub fields: Vec<AngularField>,
    pub members: Vec<ClassMemberFacts>,
    pub pending_options: Vec<MemberIoOptions>,
    pub issues: Vec<ValueIssue>,
}

#[derive(Default)]
struct InputOptions {
    alias: Option<String>,
    required: bool,
    transform: Option<TransformData>,
}

/// Evaluate the argument of `@Input(...)`/`@Output(...)`. Returns the value when it can be read
/// now; otherwise records it as pending (a constant from another file) or as an issue.
fn evaluate_member_argument<T>(
    kind: IoKind,
    arg: &Expression<'_>,
    member: &str,
    decorator_span: oxc_span::Span,
    read: fn(&crate::evaluator::ResolvedValue) -> Read<T>,
    ctx: &ExtractContext<'_, '_>,
    out: &mut MemberIo,
) -> Option<T> {
    let value = evaluate_expression(arg, ctx.eval);
    match read(&value) {
        Read::Ready(parsed) => Some(parsed),
        Read::Pending => {
            out.pending_options.push(MemberIoOptions {
                kind,
                member: member.to_string(),
                value: Resolved::from_syntax(value, ctx.eval.file),
                decorator_span,
            });
            None
        }
        Read::Invalid(message) => {
            out.issues.push(ValueIssue {
                span: decorator_span,
                message,
            });
            None
        }
    }
}

/// `@Input('alias')` or `@Input({alias, required, transform})`. ngtsc evaluates the argument;
/// a transform is emitted from its source text, so it is read from an object literal only.
fn decorator_input_options(
    decorator: &oxc_ast::ast::Decorator<'_>,
    member: &str,
    ctx: &ExtractContext<'_, '_>,
    out: &mut MemberIo,
) -> InputOptions {
    let Some(first) = get_decorator_args(decorator).and_then(|args| args.first()) else {
        return InputOptions::default();
    };
    let Some(arg) = first.as_expression() else {
        return InputOptions::default();
    };
    let transform = match arg.get_inner_expression() {
        Expression::ObjectExpression(obj) => object_literal_transform(obj),
        _ => None,
    };
    let options = evaluate_member_argument(
        IoKind::Input,
        arg,
        member,
        decorator.span,
        read_input_options,
        ctx,
        out,
    );
    let Some(options) = options else {
        return InputOptions {
            transform,
            ..Default::default()
        };
    };
    InputOptions {
        alias: options.alias,
        required: options.required,
        transform,
    }
}

pub fn parse_input_decorator(
    decorator: &oxc_ast::ast::Decorator,
    prop_name: &str,
    property_span: Option<oxc_span::Span>,
    ctx: &ExtractContext<'_, '_>,
    out: &mut MemberIo,
) -> Option<(InputData, bool)> {
    if !is_angular_decorator_named(decorator, "Input", ctx.semantic, ctx.angular_imports) {
        return None;
    }
    let options = decorator_input_options(decorator, prop_name, ctx, out);

    let has_transform = options.transform.is_some();
    Some((
        InputData {
            name: prop_name.to_string(),
            alias: options.alias,
            required: options.required,
            is_signal: false,
            decorator_span: Some(decorator.span),
            property_span,
            transform: options.transform,
            is_restricted: false,
            is_literal: false,
        },
        has_transform,
    ))
}

pub fn parse_output_decorator<'a>(
    decorator: &'a oxc_ast::ast::Decorator<'a>,
    prop_name: &str,
    property_span: Option<oxc_span::Span>,
    ctx: &ExtractContext<'_, '_>,
    out: &mut MemberIo,
) -> Option<OutputData> {
    if !is_angular_decorator_named(decorator, "Output", ctx.semantic, ctx.angular_imports) {
        return None;
    }
    let alias = get_decorator_args(decorator)
        .and_then(|args| args.first())
        .and_then(Argument::as_expression)
        .and_then(|arg| {
            evaluate_member_argument(
                IoKind::Output,
                arg,
                prop_name,
                decorator.span,
                read_output_alias,
                ctx,
                out,
            )
        });

    Some(OutputData {
        name: prop_name.to_string(),
        alias,
        decorator_span: Some(decorator.span),
        property_span,
        is_signal: false,
    })
}
/// Check if property is initialized with input(), output() or model()
fn parse_signal_input_output(
    prop: &oxc_ast::ast::PropertyDefinition,
    ctx: &ExtractContext<'_, '_>,
    out: &mut MemberIo,
) -> bool {
    let Some(init) = prop.value.as_ref() else {
        return false;
    };

    let call = match init.get_inner_expression() {
        Expression::CallExpression(c) => c,
        _ => return false,
    };

    let Some(prop_name_cow) = extract_property_key(&prop.key) else {
        return false;
    };
    let prop_name = prop_name_cow.into_owned();

    let Some(resolved_call) = resolve_angular_call(call, ctx.semantic, ctx.angular_imports) else {
        return false;
    };

    match resolved_call {
        ResolvedAngularCall::Input { is_required } => {
            let options_arg = if is_required {
                call.arguments.first()
            } else {
                call.arguments.get(1)
            };
            let options = signal_options(options_arg, out);
            let input = InputData {
                name: prop_name,
                alias: options.alias,
                required: is_required,
                is_signal: true,
                decorator_span: None,
                property_span: Some(prop.span),
                transform: options.transform,
                is_restricted: false,
                is_literal: false,
            };
            out.fields.push(AngularField::Input(input));
            true
        }
        ResolvedAngularCall::Model { is_required } => {
            let options_arg = if is_required {
                call.arguments.first()
            } else {
                call.arguments.get(1)
            };
            let options = signal_options(options_arg, out);
            let input = InputData {
                name: prop_name.clone(),
                alias: options.alias.clone(),
                required: is_required,
                is_signal: true,
                decorator_span: None,
                property_span: Some(prop.span),
                transform: None,
                is_restricted: false,
                is_literal: false,
            };
            let output_alias = Some(format!(
                "{}Change",
                options.alias.as_ref().unwrap_or(&prop_name)
            ));
            let output = OutputData {
                name: prop_name,
                alias: output_alias,
                decorator_span: None,
                property_span: Some(prop.span),
                is_signal: true,
            };
            out.fields.push(AngularField::Input(input));
            out.fields.push(AngularField::Output(output));
            true
        }
        ResolvedAngularCall::Output => {
            let options = signal_options(call.arguments.first(), out);
            let output = OutputData {
                name: prop_name,
                alias: options.alias,
                is_signal: true,
                decorator_span: None,
                property_span: Some(prop.span),
            };
            out.fields.push(AngularField::Output(output));
            false
        }
        ResolvedAngularCall::OutputFromObservable => {
            let options = signal_options(call.arguments.get(1), out);
            let output = OutputData {
                name: prop_name,
                alias: options.alias,
                is_signal: true,
                decorator_span: None,
                property_span: Some(prop.span),
            };
            out.fields.push(AngularField::Output(output));
            false
        }
        _ => false,
    }
}

/// The options argument of `input()`, `model()`, `output()` or `outputFromObservable()`, read
/// the way ngtsc's `parseAndValidateInputAndOutputOptions` reads it: *not* evaluated. The
/// argument must be an object literal and its `alias` a string literal; anything else is
/// reported rather than followed through a constant.
fn signal_options(arg: Option<&Argument>, out: &mut MemberIo) -> InputOptions {
    let Some(arg) = arg.and_then(Argument::as_expression) else {
        return InputOptions::default();
    };
    let Expression::ObjectExpression(obj) = arg else {
        out.issues.push(ValueIssue {
            span: arg.span(),
            message: "Argument needs to be an object literal that is statically analyzable."
                .to_string(),
        });
        return InputOptions::default();
    };

    let mut alias = None;
    for prop in &obj.properties {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        if extract_property_key(&p.key).as_deref() != Some("alias") {
            continue;
        }
        alias = extract_literal_string(&p.value);
        if alias.is_none() {
            out.issues.push(ValueIssue {
                span: p.value.span(),
                message: "Alias needs to be a string that is statically analyzable.".to_string(),
            });
        }
    }

    InputOptions {
        alias,
        required: false,
        transform: object_literal_transform(obj),
    }
}

/// The `transform` of an input options object written as a literal: emitted from its source
/// text, so only its syntax is read.
pub(crate) fn object_literal_transform(
    obj: &oxc_ast::ast::ObjectExpression<'_>,
) -> Option<TransformData> {
    obj.properties.iter().find_map(|prop| {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            return None;
        };
        if extract_property_key(&p.key).as_deref() != Some("transform") {
            return None;
        }
        let t_type = crate::analyzer::transforms::extract_transform_type(&p.value)?;
        Some(match t_type {
            crate::analyzer::transforms::ExtractedTransformType::Type(type_span) => {
                TransformData::Type {
                    type_span,
                    value_span: p.value.span(),
                }
            }
            crate::analyzer::transforms::ExtractedTransformType::Expression(span) => {
                TransformData::Expression(span)
            }
        })
    })
}

#[allow(clippy::too_many_arguments)]
fn process_decorators<'a>(
    decorators: &'a [oxc_ast::ast::Decorator<'a>],
    prop_name: &str,
    key: &'a oxc_ast::ast::PropertyKey<'a>,
    accessibility: Option<oxc_ast::ast::TSAccessibility>,
    readonly: bool,
    is_signal: bool,
    property_span: Option<oxc_span::Span>,
    ctx: &ExtractContext<'_, '_>,
    out: &mut MemberIo,
) {
    let mut is_input = is_signal;

    for decorator in decorators {
        if let Some((input, _transform)) =
            parse_input_decorator(decorator, prop_name, property_span, ctx, out)
        {
            out.fields.push(AngularField::Input(input));
            is_input = true;
        }
        if let Some(output) = parse_output_decorator(decorator, prop_name, property_span, ctx, out)
        {
            out.fields.push(AngularField::Output(output));
        }
    }

    let is_restricted = accessibility == Some(oxc_ast::ast::TSAccessibility::Private)
        || accessibility == Some(oxc_ast::ast::TSAccessibility::Protected)
        || readonly;
    let is_literal = matches!(key, oxc_ast::ast::PropertyKey::StringLiteral(_));
    if let Some(span) = property_span {
        out.members.push(ClassMemberFacts {
            name: prop_name.to_string(),
            span,
            is_restricted,
            is_literal,
        });
    }

    if !is_input {
        return;
    }
    let input = out.fields.iter_mut().find_map(|f| match f {
        AngularField::Input(i) if i.name == prop_name => Some(i),
        _ => None,
    });
    if let Some(input) = input {
        input.is_restricted = is_restricted;
        input.is_literal = is_literal;
    }
}

/// Extract the inputs and outputs a class declares through its members.
pub fn extract_inputs_outputs<'a>(
    class: &'a oxc_ast::ast::Class<'a>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    semantic: &'a Semantic<'a>,
    eval: &'a EvalInput<'a, '_>,
) -> MemberIo {
    let ctx = ExtractContext {
        angular_imports,
        semantic,
        eval,
    };
    let mut out = MemberIo::default();
    let mut static_coerced = Vec::new();

    for element in &class.body.body {
        match element {
            oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
                let Some(prop_name) = extract_property_key(&prop.key).map(|n| n.into_owned())
                else {
                    continue;
                };

                if !prop.computed && prop.r#static && prop_name.starts_with("ngAcceptInputType_") {
                    static_coerced.push(prop_name["ngAcceptInputType_".len()..].to_string());
                }

                let is_signal = parse_signal_input_output(prop, &ctx, &mut out);

                process_decorators(
                    &prop.decorators,
                    &prop_name,
                    &prop.key,
                    prop.accessibility,
                    prop.readonly,
                    is_signal,
                    Some(prop.span),
                    &ctx,
                    &mut out,
                );
            }
            oxc_ast::ast::ClassElement::MethodDefinition(method) => {
                let Some(prop_name) = extract_property_key(&method.key).map(|n| n.into_owned())
                else {
                    continue;
                };

                process_decorators(
                    &method.decorators,
                    &prop_name,
                    &method.key,
                    method.accessibility,
                    false,
                    false,
                    Some(method.span),
                    &ctx,
                    &mut out,
                );
            }
            oxc_ast::ast::ClassElement::AccessorProperty(acc) => {
                let Some(prop_name) = extract_property_key(&acc.key).map(|n| n.into_owned()) else {
                    continue;
                };

                process_decorators(
                    &acc.decorators,
                    &prop_name,
                    &acc.key,
                    acc.accessibility,
                    false,
                    false,
                    Some(acc.span),
                    &ctx,
                    &mut out,
                );
            }
            _ => {}
        }
    }

    for field in static_coerced {
        out.fields.push(AngularField::InputCoercion(field));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_semantic::SemanticBuilder;

    struct TestExtracted {
        inputs: Vec<InputData>,
        outputs: Vec<OutputData>,
        coerced: Vec<String>,
        pending: Vec<MemberIoOptions>,
        issues: Vec<ValueIssue>,
    }

    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    fn parse_class(source_text: &str) -> TestExtracted {
        let allocator = Allocator::default();
        let source_type = SourceType::default().with_typescript(true);
        let ret = Parser::new(&allocator, source_text, source_type).parse();
        let semantic_ret = SemanticBuilder::new()
            .with_build_nodes(true)
            .build(&ret.program);
        let semantic = semantic_ret.semantic;
        let angular_imports =
            crate::analyzer::imports::extract_angular_imports(&ret.module_record, &semantic, false);
        let import_map = crate::analyzer::extract_import_map(&ret.module_record);
        let env = crate::evaluator::ResolvedEnv::new();
        let interner = crate::query::FileIdInterner::new();
        let eval = EvalInput {
            semantic: &semantic,
            file: interner.intern_path("/test/file.ts"),
            import_map: &import_map,
            mode: crate::evaluator::EvalMode::Syntax,
            env: &env,
            foreign: crate::analyzer::resolvers::angular_foreign_resolvers(),
        };

        let mut inputs = Vec::new();
        let mut outputs = Vec::new();
        let mut coerced = Vec::new();
        let mut pending = Vec::new();
        let mut issues = Vec::new();

        for stmt in &ret.program.body {
            if let oxc_ast::ast::Statement::ClassDeclaration(class_decl) = stmt {
                let res = extract_inputs_outputs(class_decl, &angular_imports, &semantic, &eval);
                pending.extend(res.pending_options);
                issues.extend(res.issues);
                for field in res.fields {
                    match field {
                        AngularField::Input(i) => inputs.push(i),
                        AngularField::Output(o) => outputs.push(o),
                        AngularField::InputCoercion(name) => coerced.push(name),
                        _ => {}
                    }
                }
            }
        }

        TestExtracted {
            inputs,
            outputs,
            coerced,
            pending,
            issues,
        }
    }

    #[test]
    fn test_extract_inputs_outputs_from_properties() {
        let source = r#"import {Input, Output} from '@angular/core';
        class TestComponent {
            @Input() simpleInput: string;
            @Input('alias') aliasedInput: string;
            @Input({ required: true, alias: 'reqAlias' }) configInput: string;
            @Input({ transform: (v: boolean) => !v }) transformInput: boolean;


            @Output() simpleOutput = new EventEmitter();
            @Output('outAlias') aliasedOutput = new EventEmitter();
        }
        "#;

        let ext = parse_class(source);
        let inputs = ext.inputs;
        let outputs = ext.outputs;

        assert_eq!(inputs.len(), 4);
        assert_eq!(inputs[0].name, "simpleInput");
        assert_eq!(inputs[0].alias, None);
        assert!(!inputs[0].required);

        assert_eq!(inputs[1].name, "aliasedInput");
        assert_eq!(inputs[1].alias.as_deref(), Some("alias"));

        assert_eq!(inputs[2].name, "configInput");
        assert_eq!(inputs[2].alias.as_deref(), Some("reqAlias"));
        assert!(inputs[2].required);

        assert_eq!(inputs[3].name, "transformInput");
        let tt = inputs[3].transform.as_ref().unwrap();
        let (type_span, value_span) = match tt {
            TransformData::Type {
                type_span,
                value_span,
            } => (type_span, value_span),
            TransformData::Expression(s) => (s, s),
        };
        assert!(matches!(tt, TransformData::Type { .. }));
        assert_eq!(
            &source[type_span.start as usize..type_span.end as usize],
            "boolean"
        );
        assert_eq!(
            &source[value_span.start as usize..value_span.end as usize],
            "(v: boolean) => !v"
        );

        assert_eq!(outputs.len(), 2);
        assert_eq!(outputs[0].name, "simpleOutput");
        assert_eq!(outputs[0].alias, None);

        assert_eq!(outputs[1].name, "aliasedOutput");
        assert_eq!(outputs[1].alias.as_deref(), Some("outAlias"));
    }

    #[test]
    fn test_extract_inputs_outputs_from_methods_and_accessors() {
        let source = r#"import {Input, Output} from '@angular/core';
        class TestComponent {
            @Input()
            set routerLink(commands: any[] | string | null | undefined) {}

            @Input('rtAlias')
            set aliasedLink(val: string) {}

            @Output()
            get activeStateChange() { return this._output; }

            @Input() accessor myAccessorProp: string;
        }
        "#;

        let ext = parse_class(source);
        let inputs = ext.inputs;
        let outputs = ext.outputs;

        assert_eq!(inputs.len(), 3);
        assert_eq!(inputs[0].name, "routerLink");
        assert_eq!(inputs[0].alias, None);

        assert_eq!(inputs[1].name, "aliasedLink");
        assert_eq!(inputs[1].alias.as_deref(), Some("rtAlias"));

        assert_eq!(inputs[2].name, "myAccessorProp");

        assert_eq!(outputs.len(), 1);
        assert_eq!(outputs[0].name, "activeStateChange");
    }

    #[test]
    fn test_extract_signal_inputs_outputs() {
        let source = r#"
        import { input, model, output } from '@angular/core';
        class SignalComponent {
            name = input<string>('World');
            aliasObj = input(123, { alias: 'inputAlias' });
            req = input.required<number>();
            reqAlias = input.required<string>({ alias: 'reqInputAlias' });

            submitted = output<string>();
            aliasedOut = output<void>({ alias: 'outLimit' });

            val = model(0);
            checked = model(false, { alias: 'isChecked' });
            reqModel = model.required<string>();
            reqModelAlias = model.required<number>({ alias: 'reqModelAlias' });
        }
        "#;

        let ext = parse_class(source);
        let inputs = ext.inputs;
        let outputs = ext.outputs;

        assert_eq!(inputs.len(), 8);

        assert_eq!(inputs[0].name, "name");
        assert!(inputs[0].is_signal);
        assert!(!inputs[0].required);
        assert_eq!(inputs[0].alias, None);

        assert_eq!(inputs[1].name, "aliasObj");
        assert_eq!(inputs[1].alias.as_deref(), Some("inputAlias"));

        assert_eq!(inputs[2].name, "req");
        assert!(inputs[2].required);

        assert_eq!(inputs[3].name, "reqAlias");
        assert!(inputs[3].required);
        assert_eq!(inputs[3].alias.as_deref(), Some("reqInputAlias"));

        assert_eq!(inputs[4].name, "val");
        assert!(inputs[4].is_signal);

        assert_eq!(inputs[5].name, "checked");
        assert_eq!(inputs[5].alias.as_deref(), Some("isChecked"));

        assert_eq!(inputs[6].name, "reqModel");
        assert!(inputs[6].required);

        assert_eq!(inputs[7].name, "reqModelAlias");
        assert_eq!(inputs[7].alias.as_deref(), Some("reqModelAlias"));

        assert_eq!(outputs.len(), 6);

        assert_eq!(outputs[0].name, "submitted");
        assert_eq!(outputs[0].alias, None);

        assert_eq!(outputs[1].name, "aliasedOut");
        assert_eq!(outputs[1].alias.as_deref(), Some("outLimit"));

        assert_eq!(outputs[2].name, "val");
        assert_eq!(outputs[2].alias.as_deref(), Some("valChange"));

        assert_eq!(outputs[3].name, "checked");
        assert_eq!(outputs[3].alias.as_deref(), Some("isCheckedChange"));

        assert_eq!(outputs[4].name, "reqModel");
        assert_eq!(outputs[4].alias.as_deref(), Some("reqModelChange"));

        assert_eq!(outputs[5].name, "reqModelAlias");
        assert_eq!(outputs[5].alias.as_deref(), Some("reqModelAliasChange"));
    }

    #[test]
    fn test_extract_output_from_observable() {
        let source = r#"
        import { outputFromObservable } from '@angular/core/rxjs-interop';
        class ObservableOutputComponent {
            basic = outputFromObservable(myObs);
            aliased = outputFromObservable(myObs, { alias: 'customAlias' });
        }
        "#;

        let ext = parse_class(source);
        let outputs = ext.outputs;

        assert_eq!(outputs.len(), 2);
        assert_eq!(outputs[0].name, "basic");
        assert_eq!(outputs[0].alias, None);

        assert_eq!(outputs[1].name, "aliased");
        assert_eq!(outputs[1].alias.as_deref(), Some("customAlias"));
    }

    #[test]
    fn test_extract_inputs_outputs_without_parens() {
        let source = r#"import {Input, Output} from '@angular/core';
        class NoParensComponent {
            @Input inputNoParens: string;
            @Output outputNoParens = new EventEmitter();
        }
        "#;

        let ext = parse_class(source);
        let inputs = ext.inputs;
        let outputs = ext.outputs;

        assert_eq!(inputs.len(), 1, "Should detect @Input without parens");
        assert_eq!(inputs[0].name, "inputNoParens");

        assert_eq!(outputs.len(), 1, "Should detect @Output without parens");
        assert_eq!(outputs[0].name, "outputNoParens");
    }

    #[test]
    fn test_extract_signal_inputs_initial_value_object() {
        let source = r#"
        import { input } from '@angular/core';
        class InitialValueComponent {
            // Single object arg is the initial value, not options.
            state = input({ alias: 'internal', count: 0 });
            correct = input({ count: 0 }, { alias: 'external' });
        }
        "#;

        let ext = parse_class(source);
        let inputs = ext.inputs;

        assert_eq!(inputs.len(), 2);

        assert_eq!(inputs[0].name, "state");
        assert_eq!(inputs[0].alias, None);

        assert_eq!(inputs[1].name, "correct");
        assert_eq!(inputs[1].alias.as_deref(), Some("external"));
    }

    #[test]
    fn test_extract_options_with_template_literal() {
        let source = r#"
        import { input, Input } from '@angular/core';
        class TemplateLiteralComponent {
            input1 = input(0, { alias: `tmplAlias` });
            @Input(`decAlias`) input2: string;
        }
        "#;

        let ext = parse_class(source);
        let inputs = ext.inputs;

        assert_eq!(inputs.len(), 2);
        assert_eq!(inputs[0].alias.as_deref(), Some("tmplAlias"));
        assert_eq!(inputs[1].alias.as_deref(), Some("decAlias"));
    }
    #[test]
    fn test_extract_string_literal_property_keys() {
        let source = r#"import {Input} from '@angular/core';
        class LiteralKeysComponent {
            @Input() 'stringLiteral'!: string;
            @Input() 123!: number;
        }
        "#;

        let ext = parse_class(source);
        let literal_inputs: Vec<String> = ext
            .inputs
            .iter()
            .filter(|i| i.is_literal)
            .map(|i| i.name.clone())
            .collect();
        assert_eq!(literal_inputs, vec!["stringLiteral"]);
    }

    #[test]
    fn test_extract_coerced_input_fields() {
        let source = r#"
        import { input, Input } from '@angular/core';
        class CoercedComponent {
            @Input() noTransform: string;
            @Input({ transform: booleanAttribute }) withTransform: boolean;

            static ngAcceptInputType_staticCoerced: string | boolean;
            @Input() staticCoerced: string;

            static ngAcceptInputType_signalField: string | number;
            signalField = input<number>(0);

            signalWithTransform = input(false, { transform: booleanAttribute });
        }
        "#;

        let ext = parse_class(source);
        let mut coerced: Vec<String> = ext
            .coerced
            .into_iter()
            .filter(|name| ext.inputs.iter().any(|i| &i.name == name && !i.is_signal))
            .collect();
        let coerced_transforms: Vec<String> = ext
            .inputs
            .iter()
            .filter(|i| !i.is_signal && i.transform.is_some())
            .map(|i| i.name.clone())
            .collect();
        coerced.extend(coerced_transforms);
        coerced.sort();
        let mut expected = vec!["staticCoerced", "withTransform"];
        expected.sort();
        assert_eq!(coerced, expected);
    }

    #[test]
    fn test_extract_restricted_input_fields() {
        let source = r#"import {Input} from '@angular/core';
        class RestrictedComponent {
            @Input() private privateField: string;
            @Input() protected protectedField: string;
            @Input() readonly readonlyField: string;

            @Input() private set privateSetter(v: string) {}
            @Input() protected set protectedSetter(v: string) {}

            @Input() publicField: string;
            @Input() set publicSetter(v: string) {}

            @Input() private accessor privateAccessor: string;
        }
        "#;

        let ext = parse_class(source);
        let mut restricted: Vec<String> = ext
            .inputs
            .iter()
            .filter(|i| i.is_restricted)
            .map(|i| i.name.clone())
            .collect();
        restricted.sort();
        let mut expected = vec![
            "privateAccessor",
            "privateField",
            "privateSetter",
            "protectedField",
            "protectedSetter",
            "readonlyField",
        ];
        expected.sort();
        assert_eq!(restricted, expected);
    }

    #[test]
    fn test_extract_transform_type_variations() {
        let source = r#"
        import { input, Input } from '@angular/core';
        class TransformTests {
            @Input({ transform: (v) => v }) noType: any;
            @Input({ transform: (v: string | number) => v }) unionType: any;
            @Input({ transform: function(v: boolean[]) { return v; } }) funcExpr: any;
            @Input({ transform: booleanAttribute }) identifier: any;

            sigNoType = input(null, { transform: (v) => v });
            sigUnionType = input(null, { transform: (v: 'a' | 'b') => v });
            sigFuncExpr = input(null, { transform: function(v: {a: string}) { return v; } });
        }
        "#;

        let ext = parse_class(source);
        let inputs = ext.inputs;
        assert_eq!(inputs.len(), 7);

        assert_eq!(inputs[0].name, "noType");
        assert!(inputs[0].transform.is_none());

        assert_eq!(inputs[1].name, "unionType");
        let ut = inputs[1].transform.as_ref().unwrap();
        let TransformData::Type {
            type_span,
            value_span,
        } = ut
        else {
            panic!("Expected Type variant")
        };
        assert_eq!(
            &source[type_span.start as usize..type_span.end as usize],
            "string | number"
        );
        assert_eq!(
            &source[value_span.start as usize..value_span.end as usize],
            "(v: string | number) => v"
        );

        assert_eq!(inputs[2].name, "funcExpr");
        let fe = inputs[2].transform.as_ref().unwrap();
        let TransformData::Type {
            type_span,
            value_span,
        } = fe
        else {
            panic!("Expected Type variant")
        };
        assert_eq!(
            &source[type_span.start as usize..type_span.end as usize],
            "boolean[]"
        );
        assert_eq!(
            &source[value_span.start as usize..value_span.end as usize],
            "function(v: boolean[]) { return v; }"
        );

        assert_eq!(inputs[3].name, "identifier");
        let id = inputs[3].transform.as_ref().unwrap();
        let TransformData::Expression(span) = id else {
            panic!("Expected Expression variant")
        };
        assert_eq!(
            &source[span.start as usize..span.end as usize],
            "booleanAttribute"
        );

        assert_eq!(inputs[4].name, "sigNoType");
        assert!(inputs[4].transform.is_none());

        assert_eq!(inputs[5].name, "sigUnionType");
        let sut = inputs[5].transform.as_ref().unwrap();
        let TransformData::Type {
            type_span,
            value_span,
        } = sut
        else {
            panic!("Expected Type variant")
        };
        assert_eq!(
            &source[type_span.start as usize..type_span.end as usize],
            "'a' | 'b'"
        );
        assert_eq!(
            &source[value_span.start as usize..value_span.end as usize],
            "(v: 'a' | 'b') => v"
        );

        assert_eq!(inputs[6].name, "sigFuncExpr");
        let sfe = inputs[6].transform.as_ref().unwrap();
        let TransformData::Type {
            type_span,
            value_span,
        } = sfe
        else {
            panic!("Expected Type variant")
        };
        assert_eq!(
            &source[type_span.start as usize..type_span.end as usize],
            "{a: string}"
        );
        assert_eq!(
            &source[value_span.start as usize..value_span.end as usize],
            "function(v: {a: string}) { return v; }"
        );
    }

    #[test]
    fn test_member_decorator_arguments_are_evaluated() {
        let source = r#"import {Input, Output, EventEmitter} from '@angular/core';
        import {REMOTE_ALIAS} from './remote';
        const ALIAS = 'local' + 'Alias';
        const OPTIONS = {alias: 'optionsAlias', required: true};
        class TestComponent {
            @Input(ALIAS) viaConstant: string;
            @Input(OPTIONS) viaOptionsConstant: string;
            @Input({alias: ALIAS, required: true}) viaLiteralOptions: string;
            @Input(REMOTE_ALIAS) viaImport: string;
            @Output(ALIAS) event = new EventEmitter();
            @Input(42) wrongShape: string;
        }
        "#;

        let ext = parse_class(source);
        let aliases: Vec<(&str, Option<&str>, bool)> = ext
            .inputs
            .iter()
            .map(|i| (i.name.as_str(), i.alias.as_deref(), i.required))
            .collect();
        assert_eq!(
            aliases,
            vec![
                ("viaConstant", Some("localAlias"), false),
                ("viaOptionsConstant", Some("optionsAlias"), true),
                ("viaLiteralOptions", Some("localAlias"), true),
                // Waits for Stage 2, which can follow the import.
                ("viaImport", None, false),
                ("wrongShape", None, false),
            ]
        );
        assert_eq!(ext.outputs[0].alias.as_deref(), Some("localAlias"));

        assert_eq!(ext.pending.len(), 1);
        assert_eq!(ext.pending[0].member, "viaImport");
        assert_eq!(ext.pending[0].kind, IoKind::Input);

        let messages: Vec<&str> = ext.issues.iter().map(|i| i.message.as_str()).collect();
        assert_eq!(
            messages,
            vec!["@Input decorator argument must resolve to a string or an object literal"]
        );
    }

    #[test]
    fn test_signal_options_are_not_evaluated() {
        // ngtsc's `parseAndValidateInputAndOutputOptions` requires literals here rather than
        // evaluating them, so neither a constant alias nor a constant options object is read.
        let source = r#"import {input, output} from '@angular/core';
        const ALIAS = 'constantAlias';
        const OPTIONS = {alias: 'optionsAlias'};
        class TestComponent {
            viaConstant = input(0, {alias: ALIAS});
            viaOptionsConstant = input(0, OPTIONS);
            literal = output({alias: 'literalAlias'});
        }
        "#;

        let ext = parse_class(source);
        assert_eq!(ext.inputs[0].alias, None);
        assert_eq!(ext.inputs[1].alias, None);
        assert_eq!(ext.outputs[0].alias.as_deref(), Some("literalAlias"));

        let messages: Vec<&str> = ext.issues.iter().map(|i| i.message.as_str()).collect();
        assert_eq!(
            messages,
            vec![
                "Alias needs to be a string that is statically analyzable.",
                "Argument needs to be an object literal that is statically analyzable.",
            ]
        );
    }
}
