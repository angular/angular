use crate::ResourceResolverFs;
use oxc_ast::ast::{Decorator, Expression, ObjectPropertyKind};
use oxc_resolver::ResolverGeneric;
use oxc_semantic::Semantic;
use oxc_span::GetSpan;
use std::collections::HashMap;

use std::path::Path;

use crate::analyzer::class_data::{
    ComponentData, DirectiveData, ForeignImportData, ForeignImportIssue, ForeignImportIssueKind,
    StyleUrlSource, UrlData, ValueIssue,
};
use crate::evaluator::{evaluate_expression, EvalInput, Resolved, ResolvedValue};

use super::imports::{resolve_imports_expression, ImportInfo, ImportedSymbol};

use super::utils::{
    extract_bool, extract_property_key, extract_schemas, extract_string, resolve_local_expression,
};

/// Parse a @Component decorator
#[allow(clippy::too_many_arguments)]
pub fn parse_decorator<'a, Fs: ResourceResolverFs>(
    decorator: &Decorator<'a>,
    file_path: &Path,
    fs: &Fs,
    resolver: &ResolverGeneric<Fs>,
    semantic: &Semantic<'a>,
    import_map: &HashMap<String, ImportedSymbol>,
    angular_imports: &crate::analyzer::imports::AngularImports,
    eval: &EvalInput<'a, '_>,
) -> Option<ComponentData> {
    let Expression::CallExpression(call_expr) = &decorator.expression else {
        return None;
    };

    if !crate::analyzer::utils::is_angular_decorator_named(
        decorator,
        "Component",
        semantic,
        angular_imports,
    ) {
        return None;
    }

    let directive_data = super::directive::parse_directive_args(
        call_expr,
        crate::analyzer::utils::extract_decorator_name(decorator),
        semantic,
        angular_imports,
        eval,
    )?;

    let obj = match call_expr.arguments.first() {
        Some(oxc_ast::ast::Argument::ObjectExpression(o)) => o,
        _ => {
            return Some(ComponentData {
                directive: directive_data,
                ..Default::default()
            });
        }
    };

    if directive_data.is_jit {
        return Some(ComponentData {
            directive: directive_data,
            ..Default::default()
        });
    }

    parse_component_metadata(
        obj,
        decorator.span,
        semantic,
        import_map,
        file_path,
        fs,
        resolver,
        directive_data,
        angular_imports,
        eval,
    )
}

// TODO(#60): To achieve full feature parity with `@angular/compiler-cli`, we will eventually need to use the `Semantic` model to follow static identifier references (e.g., `const myAnimations = [...]`). For now, falling back to dynamic is fine.
fn collect_animation_triggers<'a>(
    expr: &'a Expression<'a>,
    static_trigger_names: &mut Vec<String>,
    includes_dynamic_animations: &mut bool,
    semantic: &Semantic<'a>,
) {
    let resolved = resolve_local_expression(expr, semantic);
    match resolved.get_inner_expression() {
        Expression::CallExpression(call) => {
            let callee_resolved = resolve_local_expression(&call.callee, semantic);
            let Expression::Identifier(ident) = callee_resolved else {
                *includes_dynamic_animations = true;
                return;
            };
            if ident.name != "trigger" || call.arguments.is_empty() {
                *includes_dynamic_animations = true;
                return;
            }
            let Some(arg_expr) = call.arguments[0].as_expression() else {
                *includes_dynamic_animations = true;
                return;
            };
            let Some(name) = extract_string(arg_expr, semantic) else {
                *includes_dynamic_animations = true;
                return;
            };
            static_trigger_names.push(name);
        }
        Expression::ArrayExpression(arr) => {
            for elem in &arr.elements {
                let Some(nested_expr) = elem.as_expression() else {
                    *includes_dynamic_animations = true;
                    continue;
                };
                collect_animation_triggers(
                    nested_expr,
                    static_trigger_names,
                    includes_dynamic_animations,
                    semantic,
                );
            }
        }
        _ => {
            *includes_dynamic_animations = true;
        }
    }
}

/// The source span of an inline template's text when the `template` expression is itself a
/// string literal or a no-substitution template literal, excluding the delimiters.
///
/// Mirrors ngtsc's `extractTemplate`, which parses exactly these two node kinds straight out of
/// the component file (`getTemplateRange`, with `escapedString: true`) and maps their spans
/// `direct`ly. The check is on the expression as written — a parenthesized literal, an `as`
/// cast, an identifier or a template literal with substitutions is evaluated instead, and its
/// spans refer to the resolved string (`indirect`).
fn direct_template_content_span(expr: &Expression<'_>) -> Option<oxc_span::Span> {
    let literal_span = match expr {
        Expression::StringLiteral(literal) => literal.span,
        Expression::TemplateLiteral(literal) if literal.expressions.is_empty() => literal.span,
        _ => return None,
    };
    Some(oxc_span::Span::new(
        literal_span.start + 1,
        literal_span.end - 1,
    ))
}

/// Represents a URL parsed directly from the component decorator that has not yet been resolved
/// to an absolute filesystem path or checked for existence.
struct UnresolvedUrl {
    url: String,
    string_literal_span: Option<oxc_span::Span>,
}

#[allow(clippy::too_many_arguments)]
fn parse_component_metadata<'a, Fs: ResourceResolverFs>(
    obj: &'a oxc_ast::ast::ObjectExpression<'a>,
    decorator_span: oxc_span::Span,
    semantic: &Semantic<'a>,
    import_map: &HashMap<String, ImportedSymbol>,
    file_path: &Path,
    fs: &Fs,
    resolver: &ResolverGeneric<Fs>,
    directive_data: DirectiveData,
    _angular_imports: &crate::analyzer::imports::AngularImports,
    eval: &EvalInput<'a, '_>,
) -> Option<ComponentData> {
    let mut data = ComponentData {
        directive: directive_data,
        ..Default::default()
    };

    let mut template_url: Option<UnresolvedUrl> = None;
    let mut style_url: Option<StyleUrlSource> = None;
    let mut style_urls: Option<Vec<StyleUrlSource>> = None;

    for prop in &obj.properties {
        let ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        let Some(key_name) = extract_property_key(&p.key) else {
            continue;
        };
        match key_name.as_ref() {
            "template" => {
                let eval_val = evaluate_expression(&p.value, eval);
                data.template = Some(Resolved::from_syntax(eval_val, eval.file));
                let span = p.value.span();
                data.template_span = Some(span);
                data.template_content_span = direct_template_content_span(&p.value);
            }
            "templateUrl" => {
                data.template_url_span = Some(p.value.span());
                if let Some(url) = extract_string(&p.value, semantic) {
                    let string_literal_span =
                        if let Expression::StringLiteral(s) = p.value.get_inner_expression() {
                            Some(s.span)
                        } else {
                            None
                        };
                    template_url = Some(UnresolvedUrl {
                        url,
                        string_literal_span,
                    });
                }
            }
            "styles" => {
                data.styles_span = Some(p.value.span());
                data.styles = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));
            }
            "styleUrl" => style_url = Some(single_style_url_source(&p.value, eval)),
            "styleUrls" => {
                let mut sources = Vec::new();
                collect_style_urls_sources(&p.value, eval, &mut sources);
                style_urls = Some(sources);
            }
            "encapsulation" => {
                let span = p.value.span();
                data.encapsulation_span = Some(span);
                data.encapsulation_text = semantic
                    .source_text()
                    .get(span.start as usize..span.end as usize)
                    .map(|text| text.trim().to_string());
                data.encapsulation = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));
            }
            "schemas" => data.schemas = extract_schemas(&p.value, semantic),
            "imports" => {
                data.raw_imports_span = Some(p.value.span());
                data.imports_factory_span = Some(p.value.span());

                data.imports = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));

                data.parsed_imports =
                    resolve_imports_expression(&p.value, true, semantic, import_map);
            }
            "deferredImports" => {
                data.deferred_imports_span = Some(p.value.span());
                data.deferred_imports = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));

                let resolved_expr =
                    resolve_local_expression(&p.value, semantic).get_inner_expression();
                match resolved_expr {
                    Expression::ArrayExpression(_) => {
                        data.parsed_deferred_imports =
                            resolve_imports_expression(&p.value, true, semantic, import_map);
                        data.parsed_deferred_imports_by_block = None;
                    }
                    Expression::ObjectExpression(obj) => {
                        let object_in_decorator = matches!(
                            p.value.get_inner_expression(),
                            Expression::ObjectExpression(_)
                        );
                        let mut by_block = std::collections::HashMap::new();
                        let mut flattened = Vec::new();
                        for prop in &obj.properties {
                            let ObjectPropertyKind::ObjectProperty(prop) = prop else {
                                continue;
                            };
                            let block_name = match &prop.key {
                                oxc_ast::ast::PropertyKey::StaticIdentifier(id) => {
                                    Some(id.name.to_string())
                                }
                                oxc_ast::ast::PropertyKey::StringLiteral(s) => {
                                    Some(s.value.to_string())
                                }
                                _ => None,
                            };
                            let Some(block_name) = block_name else {
                                continue;
                            };

                            let prop_val = resolve_local_expression(&prop.value, semantic)
                                .get_inner_expression();
                            if let Expression::ArrayExpression(_) = prop_val {
                                let block_imports = resolve_imports_expression(
                                    &prop.value,
                                    object_in_decorator,
                                    semantic,
                                    import_map,
                                );
                                for imp in &block_imports {
                                    if !flattened.iter().any(|existing: &ImportInfo| {
                                        existing.local_name == imp.local_name
                                            && existing.import_source == imp.import_source
                                    }) {
                                        flattened.push(imp.clone());
                                    }
                                }
                                by_block.insert(block_name, block_imports);
                            }
                        }
                        data.parsed_deferred_imports = flattened;
                        data.parsed_deferred_imports_by_block = Some(by_block);
                    }
                    _ => {}
                }
            }
            "foreignImports" => {
                data.foreign_imports_span = Some(p.value.span());
                let (entries, issues) = extract_foreign_imports_from_ast(&p.value);
                data.foreign_imports = entries;
                data.foreign_import_issues = issues;
            }
            "viewProviders" => data.view_providers_span = Some(p.value.span()),
            "changeDetection" => {
                data.change_detection_span = Some(p.value.span());
                data.change_detection = Some(Resolved::from_syntax(
                    evaluate_expression(&p.value, eval),
                    eval.file,
                ));
            }
            "preserveWhitespaces" => {
                data.preserve_whitespaces = extract_bool(&p.value, semantic);
            }
            "animations" => {
                data.animations_span = Some(p.value.span());

                let mut static_trigger_names = Vec::new();
                let mut includes_dynamic_animations = false;

                collect_animation_triggers(
                    &p.value,
                    &mut static_trigger_names,
                    &mut includes_dynamic_animations,
                    semantic,
                );

                data.animation_trigger_names = Some(crate::LegacyAnimationTriggerNames {
                    static_trigger_names,
                    includes_dynamic_animations,
                });
            }
            _ => {}
        }
    }

    let resource_resolver = crate::ResourceResolver::new(fs, resolver);
    let default_span = data.directive.args_span.unwrap_or(decorator_span);

    process_component_styles(
        style_url,
        style_urls,
        &mut data,
        &resource_resolver,
        file_path,
        fs,
        default_span,
    );

    process_component_template_url(
        template_url,
        &mut data,
        &resource_resolver,
        file_path,
        fs,
        eval.file,
    );

    Some(data)
}

/// `styleUrl`, or one element of a `styleUrls` array literal: evaluated on its own and
/// required to be a string.
fn single_style_url_source<'a>(
    expr: &'a Expression<'a>,
    eval: &EvalInput<'a, '_>,
) -> StyleUrlSource {
    let string_literal_span = match expr.get_inner_expression() {
        Expression::StringLiteral(s) => Some(s.span),
        _ => None,
    };
    StyleUrlSource::Single {
        url: Resolved::from_syntax(evaluate_expression(expr, eval), eval.file),
        span: expr.span(),
        string_literal_span,
    }
}

/// Mirrors ngtsc's `extractStyleUrlsFromExpression`: an array literal is walked element by
/// element (a spread recursing into its argument), while any other expression is evaluated as
/// a whole and must yield an array of strings.
fn collect_style_urls_sources<'a>(
    expr: &'a Expression<'a>,
    eval: &EvalInput<'a, '_>,
    out: &mut Vec<StyleUrlSource>,
) {
    let Expression::ArrayExpression(arr) = expr.get_inner_expression() else {
        out.push(StyleUrlSource::List {
            urls: Resolved::from_syntax(evaluate_expression(expr, eval), eval.file),
            span: expr.span(),
        });
        return;
    };
    for element in &arr.elements {
        match element {
            oxc_ast::ast::ArrayExpressionElement::SpreadElement(spread) => {
                collect_style_urls_sources(&spread.argument, eval, out);
            }
            oxc_ast::ast::ArrayExpressionElement::Elision(elision) => {
                // An array hole evaluates to `undefined`, which is not a string.
                out.push(StyleUrlSource::Single {
                    url: Resolved::from_syntax(ResolvedValue::Undefined, eval.file),
                    span: elision.span,
                    string_literal_span: None,
                });
            }
            _ => {
                let Some(element) = element.as_expression() else {
                    continue;
                };
                out.push(single_style_url_source(element, eval));
            }
        }
    }
}

fn process_component_styles<Fs: ResourceResolverFs>(
    style_url: Option<StyleUrlSource>,
    style_urls: Option<Vec<StyleUrlSource>>,
    data: &mut ComponentData,
    resource_resolver: &crate::ResourceResolver<'_, Fs>,
    file_path: &Path,
    fs: &Fs,
    default_span: oxc_span::Span,
) {
    let literal_span = |source: &StyleUrlSource| match source {
        StyleUrlSource::Single {
            string_literal_span,
            ..
        } => *string_literal_span,
        StyleUrlSource::List { .. } => None,
    };
    if let (Some(style_url), Some(style_urls)) = (&style_url, &style_urls) {
        data.style_conflict_span = Some(
            literal_span(style_url)
                .or_else(|| style_urls.first().and_then(literal_span))
                .or(data.directive.args_span)
                .unwrap_or(default_span),
        );
    }

    if style_url.is_none() && style_urls.is_none() {
        return;
    }
    let sources: Vec<StyleUrlSource> = style_url
        .into_iter()
        .chain(style_urls.into_iter().flatten())
        .collect();
    load_style_urls(&sources, data, resource_resolver, file_path, fs);
    if sources.iter().any(StyleUrlSource::contains_incomplete) {
        data.pending_style_urls = Some(sources);
    }
}

/// Read every stylesheet `sources` names, in order, into `data.style_urls` and
/// `data.styles_from_urls`, recording each source that did not evaluate to the expected shape
/// as an `NG1010` issue with ngtsc's `extractComponentStyleUrls` message. Shared by Stage 1 and
/// by Stage 2, which reloads once constants imported from other files are known.
pub(crate) fn load_style_urls<Fs: ResourceResolverFs>(
    sources: &[StyleUrlSource],
    data: &mut ComponentData,
    resource_resolver: &crate::ResourceResolver<'_, Fs>,
    file_path: &Path,
    fs: &Fs,
) {
    let mut styles_from_urls = Vec::new();
    let mut style_urls = Vec::new();
    let mut issues = Vec::new();

    for source in sources {
        match source {
            StyleUrlSource::Single {
                url,
                span,
                string_literal_span,
            } => {
                let Some(url) = url.get_optional() else {
                    issues.push(ValueIssue {
                        span: *span,
                        message: "styleUrl must be a string".to_string(),
                    });
                    continue;
                };
                style_urls.push(load_style_url(
                    url,
                    *string_literal_span,
                    resource_resolver,
                    file_path,
                    fs,
                    &mut styles_from_urls,
                ));
            }
            StyleUrlSource::List { urls, span } => {
                let Some(urls) = urls.get_optional() else {
                    issues.push(ValueIssue {
                        span: *span,
                        message: "styleUrls must be an array of strings".to_string(),
                    });
                    continue;
                };
                for url in urls.0 {
                    style_urls.push(load_style_url(
                        url,
                        None,
                        resource_resolver,
                        file_path,
                        fs,
                        &mut styles_from_urls,
                    ));
                }
            }
        }
    }

    data.styles_from_urls = Some(styles_from_urls);
    data.style_urls = Some(style_urls);
    data.style_url_issues = issues;
}

fn load_style_url<Fs: ResourceResolverFs>(
    url: String,
    string_literal_span: Option<oxc_span::Span>,
    resource_resolver: &crate::ResourceResolver<'_, Fs>,
    file_path: &Path,
    fs: &Fs,
    styles_from_urls: &mut Vec<String>,
) -> UrlData {
    let Ok(resolved_path) = resource_resolver.resolve_resource(file_path, &url) else {
        return UrlData {
            url,
            resolved_path: String::new(),
            string_literal_span,
            is_missing: true,
        };
    };
    let is_missing = match fs.read_to_string(&resolved_path) {
        Ok(content) => {
            styles_from_urls.push(content);
            false
        }
        Err(_) => true,
    };
    let canonical = fs.canonicalize(&resolved_path).unwrap_or(resolved_path);
    UrlData {
        url,
        resolved_path: crate::fs::path_to_string(canonical),
        string_literal_span,
        is_missing,
    }
}

fn process_component_template_url<Fs: ResourceResolverFs>(
    template_url: Option<UnresolvedUrl>,
    data: &mut ComponentData,
    resource_resolver: &crate::ResourceResolver<'_, Fs>,
    file_path: &Path,
    fs: &Fs,
    eval_file: crate::query::FileId,
) {
    let Some(t_url) = template_url else {
        return;
    };

    let resolved_path_opt = resource_resolver
        .resolve_resource(file_path, &t_url.url)
        .ok();

    let (resolved_path_str, is_missing) = if let Some(resolved_path) = resolved_path_opt {
        let is_missing = match fs.read_to_string(&resolved_path) {
            Ok(content) => {
                data.template = Some(Resolved::from_syntax(
                    ResolvedValue::String(content),
                    eval_file,
                ));
                false
            }
            Err(_) => true,
        };
        let canonical = fs.canonicalize(&resolved_path).unwrap_or(resolved_path);
        (crate::fs::path_to_string(canonical), is_missing)
    } else {
        (String::new(), true)
    };

    data.template_url = Some(UrlData {
        url: t_url.url,
        resolved_path: resolved_path_str,
        string_literal_span: t_url.string_literal_span,
        is_missing,
    });
}

/// Extract each well-formed `myImport(MyComponent)` entry, recording an issue (rather than a
/// diagnostic — `validate()` owns those) for every malformed shape ngtsc reports `NG1010` on.
/// Check order matches the reference: call expression, then callee, then arity, then argument.
/// https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/component/src/util.ts#L167-L241
fn extract_foreign_imports_from_ast(
    value: &Expression,
) -> (Option<Vec<ForeignImportData>>, Vec<ForeignImportIssue>) {
    let mut issues = Vec::new();
    let Expression::ArrayExpression(arr) = value.get_inner_expression() else {
        issues.push(ForeignImportIssue {
            kind: ForeignImportIssueKind::NotAnArray,
            span: value.span(),
        });
        return (None, issues);
    };
    let mut entries = Vec::with_capacity(arr.elements.len());
    for elem in &arr.elements {
        // Array holes and spreads are not call expressions either; ngtsc reports the same
        // shape error for them.
        let Some(Expression::CallExpression(call)) = elem
            .as_expression()
            .map(|el_expr| el_expr.get_inner_expression())
        else {
            issues.push(ForeignImportIssue {
                kind: ForeignImportIssueKind::EntryNotCall,
                span: elem.span(),
            });
            continue;
        };
        if !matches!(
            call.callee.get_inner_expression(),
            Expression::Identifier(_)
        ) {
            issues.push(ForeignImportIssue {
                kind: ForeignImportIssueKind::CalleeNotIdentifier,
                span: call.callee.span(),
            });
            continue;
        }
        if call.arguments.len() != 1 {
            issues.push(ForeignImportIssue {
                kind: ForeignImportIssueKind::WrongArity,
                span: elem.span(),
            });
            continue;
        }
        let arg_ident = match call.arguments[0]
            .as_expression()
            .map(|arg| arg.get_inner_expression())
        {
            Some(Expression::Identifier(arg_ident)) => arg_ident,
            _ => {
                issues.push(ForeignImportIssue {
                    kind: ForeignImportIssueKind::ArgNotIdentifier,
                    span: call.arguments[0].span(),
                });
                continue;
            }
        };
        entries.push(ForeignImportData {
            name: arg_ident.name.to_string(),
            span: call.span,
        });
    }
    (Some(entries), issues)
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    /// Parse `source` as a single expression and run `extract_foreign_imports_from_ast` on it,
    /// returning each entry's `(name, sliced call text)` plus each recorded issue's
    /// `(kind, sliced span text)`.
    #[allow(clippy::type_complexity)]
    fn extract(
        source: &str,
    ) -> (
        Option<Vec<(String, String)>>,
        Vec<(ForeignImportIssueKind, String)>,
    ) {
        let allocator = Allocator::default();
        let ret = Parser::new(&allocator, source, SourceType::ts()).parse();
        let Some(oxc_ast::ast::Statement::ExpressionStatement(stmt)) = ret.program.body.first()
        else {
            panic!("expected a single expression statement");
        };
        let (entries, issues) = extract_foreign_imports_from_ast(&stmt.expression);
        (
            entries.map(|entries| {
                entries
                    .iter()
                    .map(|fi| {
                        (
                            fi.name.clone(),
                            source[fi.span.start as usize..fi.span.end as usize].to_string(),
                        )
                    })
                    .collect()
            }),
            issues
                .iter()
                .map(|issue| {
                    (
                        issue.kind,
                        source[issue.span.start as usize..issue.span.end as usize].to_string(),
                    )
                })
                .collect(),
        )
    }

    #[test]
    fn keeps_valid_entries_with_any_callee_identifier() {
        // Any identifier callee is accepted (not just `frameworkImport`); each valid entry keeps
        // the argument identifier as `name` and the whole call span for verbatim re-emission.
        let (got, issues) = extract("[frameworkImport(FancyButton), myImport(OtherCmp)]");
        assert_eq!(
            got.unwrap(),
            vec![
                (
                    "FancyButton".to_string(),
                    "frameworkImport(FancyButton)".to_string()
                ),
                ("OtherCmp".to_string(), "myImport(OtherCmp)".to_string()),
            ]
        );
        assert_eq!(issues, vec![]);
    }

    #[test]
    fn records_issue_per_malformed_entry() {
        // Not a call, non-identifier callee, wrong arity, and non-identifier argument each
        // record the issue ngtsc reports NG1010 for, on the node ngtsc reports it on; the
        // surrounding valid entries are still kept.
        let (got, issues) =
            extract("[bad, two(A, B), obj.member(C), fn(x.y), frameworkImport(Kept)]");
        assert_eq!(
            got.unwrap(),
            vec![("Kept".to_string(), "frameworkImport(Kept)".to_string())]
        );
        assert_eq!(
            issues,
            vec![
                (ForeignImportIssueKind::EntryNotCall, "bad".to_string()),
                (ForeignImportIssueKind::WrongArity, "two(A, B)".to_string()),
                (
                    ForeignImportIssueKind::CalleeNotIdentifier,
                    "obj.member".to_string()
                ),
                (ForeignImportIssueKind::ArgNotIdentifier, "x.y".to_string()),
            ]
        );
    }

    #[test]
    fn non_array_value_records_issue() {
        let (got, issues) = extract("SHARED_IMPORTS");
        assert!(got.is_none());
        assert_eq!(
            issues,
            vec![(
                ForeignImportIssueKind::NotAnArray,
                "SHARED_IMPORTS".to_string()
            )]
        );
    }
}
