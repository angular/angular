//! Restores the implicit `@nocollapse` tsickle adds to statics of decorated classes.
//!
//! tsickle tags every static property of a class with a class decorator (`hasClassDecorator`)
//! with `@nocollapse`. Under ngtsc the Angular decorator is still present when tsickle runs;
//! here it is stripped beforehand, so statics read only reflectively get collapsed and removed by
//! Closure. We write the tag into the source instead; `processFile` applies it only when Closure
//! annotations are enabled.

use oxc_ast::ast::{Class, ClassElement, Comment, PropertyKey};
use oxc_semantic::Semantic;
use oxc_span::GetSpan;

const NOCOLLAPSE_TAG: &str = "nocollapse";

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NoCollapseInsertion {
    pub position: u32,
    pub text: String,
}

/// Edits adding `@nocollapse` to each static property of `class`.
///
/// Empty unless every class decorator is in `stripped_decorators`; if any other decorator
/// survives, tsickle adds the tag itself.
pub fn collect_nocollapse_insertions(
    class: &Class<'_>,
    stripped_decorators: &[oxc_span::Span],
    semantic: &Semantic<'_>,
) -> Vec<NoCollapseInsertion> {
    if class.decorators.is_empty()
        || !class
            .decorators
            .iter()
            .all(|decorator| stripped_decorators.contains(&decorator.span))
    {
        return Vec::new();
    }

    class
        .body
        .body
        .iter()
        .filter(|element| is_closure_static_property(element))
        .filter_map(|element| nocollapse_insertion(element.span().start, semantic))
        .collect()
}

/// Whether tsickle's `createMemberTypeDeclaration` would tag `element`: a static property,
/// `accessor` field or optional method keyed by an identifier or a valid Closure property
/// name. tsickle skips private, computed and numeric keys.
fn is_closure_static_property(element: &ClassElement<'_>) -> bool {
    let (is_static, key) = match element {
        ClassElement::PropertyDefinition(property) => (property.r#static, &property.key),
        ClassElement::AccessorProperty(accessor) => (accessor.r#static, &accessor.key),
        ClassElement::MethodDefinition(method) if method.optional => (method.r#static, &method.key),
        _ => return false,
    };
    if !is_static {
        return false;
    }
    match key {
        PropertyKey::StaticIdentifier(_) => true,
        PropertyKey::StringLiteral(literal) => is_valid_closure_property_name(&literal.value),
        _ => false,
    }
}

/// tsickle's `isValidClosurePropertyName`: `/^[a-zA-Z_][a-zA-Z0-9_]*$/`.
fn is_valid_closure_property_name(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_')
}

/// tsickle only reads the *last* leading JSDoc, so `@nocollapse` is merged into an existing
/// JSDoc rather than added as a separate comment.
fn nocollapse_insertion(member_start: u32, semantic: &Semantic<'_>) -> Option<NoCollapseInsertion> {
    let trivia = ts_leading_trivia(member_start, semantic);
    let Some(jsdoc) = trivia.last_jsdoc else {
        // TypeScript ignores comments on the previous token's line, so start a new line.
        let line_break = if trivia.starts_line { "" } else { "\n" };
        return Some(NoCollapseInsertion {
            position: member_start,
            text: format!("{line_break}/** @{NOCOLLAPSE_TAG} */ "),
        });
    };
    let source_text = semantic.source_text();
    if jsdoc_has_tag(&source_text[jsdoc.content_span()], NOCOLLAPSE_TAG) {
        return None;
    }
    Some(append_tag_to_jsdoc(jsdoc, source_text))
}

/// A member's leading trivia as TypeScript (and thus tsickle) sees it.
struct LeadingTrivia<'s> {
    last_jsdoc: Option<&'s Comment>,
    /// Whether a line break separates the member from the previous token.
    starts_line: bool,
}

/// Unlike oxc, TypeScript's `getLeadingCommentRanges` skips comments on the previous token's
/// line; those trail that token instead.
fn ts_leading_trivia<'s>(member_start: u32, semantic: &'s Semantic<'_>) -> LeadingTrivia<'s> {
    let source_text = semantic.source_text();
    let mut attached: Vec<&Comment> = semantic
        .comments_range(..member_start)
        .rev()
        .take_while(|comment| comment.is_leading() && comment.attached_to == member_start)
        .collect();
    attached.reverse();

    // Only whitespace lies between the previous token and the attached comments.
    let first_start = attached
        .first()
        .map_or(member_start, |comment| comment.span.start);
    let previous_token_end = source_text[..first_start as usize]
        .trim_end_matches(char::is_whitespace)
        .len();
    let mut after_line_break = previous_token_end == 0
        || source_text[previous_token_end..first_start as usize].contains('\n');

    let mut last_jsdoc = None;
    let mut gap_start = first_start;
    for comment in attached {
        after_line_break |=
            source_text[gap_start as usize..comment.span.start as usize].contains('\n');
        if after_line_break && comment.is_jsdoc() {
            last_jsdoc = Some(comment);
        }
        gap_start = comment.span.end;
    }
    after_line_break |= source_text[gap_start as usize..member_start as usize].contains('\n');

    LeadingTrivia {
        last_jsdoc,
        starts_line: after_line_break,
    }
}

/// Whether JSDoc `content` (between `/*` and `*/`) has `@tag`. Like tsickle, a tag must start
/// a line after stripping the leading ` * `.
fn jsdoc_has_tag(content: &str, tag: &str) -> bool {
    // `content_span` includes the second `*` of `/**`.
    let content = content.strip_prefix('*').unwrap_or(content);
    content.lines().any(|line| {
        let line = line.trim_start();
        let line = line.strip_prefix('*').unwrap_or(line).trim_start();
        line.strip_prefix('@')
            .and_then(|rest| rest.split_whitespace().next())
            == Some(tag)
    })
}

/// Adds a `@nocollapse` line above the closing `*/` of `jsdoc`, moving an inline `*/` onto
/// its own line since tags must start a line.
fn append_tag_to_jsdoc(jsdoc: &Comment, source_text: &str) -> NoCollapseInsertion {
    let close = jsdoc.span.end - 2;
    let before_close = &source_text[jsdoc.span.start as usize..close as usize];
    let last_line = before_close.rsplit('\n').next().unwrap_or(before_close);
    // Match the line ending that follows the comment.
    let after_close = &source_text[jsdoc.span.end as usize..];
    let newline = match after_close.find('\n') {
        Some(index) if after_close[..index].ends_with('\r') => "\r\n",
        _ => "\n",
    };

    // `*/` on its own line: reuse its indentation.
    if before_close.contains('\n') && last_line.trim().is_empty() {
        return NoCollapseInsertion {
            position: close,
            text: format!("* @{NOCOLLAPSE_TAG}{newline}{last_line}"),
        };
    }

    // Inline `*/`: the existing space before it aligns it under the `*` of `/**`.
    let text_end = before_close.trim_end().len() as u32 + jsdoc.span.start;
    let indent = line_indentation(source_text, jsdoc.span.start);
    NoCollapseInsertion {
        position: text_end,
        text: format!("{newline}{indent} * @{NOCOLLAPSE_TAG}{newline}{indent}"),
    }
}

/// The indentation before `offset`, or `""` if non-whitespace precedes it on its line.
fn line_indentation(source_text: &str, offset: u32) -> &str {
    let before = &source_text[..offset as usize];
    let line_start = before.rfind('\n').map_or(0, |index| index + 1);
    let prefix = &before[line_start..];
    if prefix.chars().all(|c| c == ' ' || c == '\t') {
        prefix
    } else {
        ""
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_semantic::SemanticBuilder;
    use oxc_span::SourceType;

    /// Applies the edits for the first class in `source`, treating decorators named in
    /// `stripped` as removed.
    fn apply(source: &str, stripped: &[&str]) -> String {
        struct FirstClass<'s, 'a> {
            semantic: &'s Semantic<'a>,
            stripped: &'s [&'s str],
            insertions: Option<Vec<NoCollapseInsertion>>,
        }
        impl<'a> oxc_ast_visit::Visit<'a> for FirstClass<'_, 'a> {
            fn visit_class(&mut self, class: &Class<'a>) {
                if self.insertions.is_some() {
                    return;
                }
                let stripped_spans: Vec<oxc_span::Span> = class
                    .decorators
                    .iter()
                    .filter(|decorator| {
                        crate::analyzer::utils::extract_decorator_name(decorator)
                            .is_some_and(|name| self.stripped.contains(&name.as_str()))
                    })
                    .map(|decorator| decorator.span)
                    .collect();
                self.insertions = Some(collect_nocollapse_insertions(
                    class,
                    &stripped_spans,
                    self.semantic,
                ));
            }
        }

        let allocator = Allocator::default();
        let parsed = Parser::new(&allocator, source, SourceType::ts()).parse();
        assert!(parsed.diagnostics.is_empty(), "{:?}", parsed.diagnostics);
        let semantic = SemanticBuilder::new().build(&parsed.program).semantic;
        let mut finder = FirstClass {
            semantic: &semantic,
            stripped,
            insertions: None,
        };
        oxc_ast_visit::Visit::visit_program(&mut finder, &parsed.program);

        let mut insertions = finder.insertions.expect("a class");
        insertions.sort_by_key(|insertion| std::cmp::Reverse(insertion.position));
        let mut output = source.to_string();
        for insertion in insertions {
            output.insert_str(insertion.position as usize, &insertion.text);
        }
        output
    }

    #[test]
    fn tags_undocumented_static_properties() {
        let source = "\
@Injectable()
export class MyService {
  static readonly $inject: readonly string[] = ['depA'];
  static accessor count = 0;
  static optionalHook?(): void;
  instanceField = 1;
  static method() {}
  static #secret = 1;
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "\
@Injectable()
export class MyService {
  /** @nocollapse */ static readonly $inject: readonly string[] = ['depA'];
  /** @nocollapse */ static accessor count = 0;
  /** @nocollapse */ static optionalHook?(): void;
  instanceField = 1;
  static method() {}
  static #secret = 1;
}
"
        );
    }

    #[test]
    fn leaves_classes_tsickle_still_sees_as_decorated() {
        let source = "\
@Custom()
@Injectable()
export class MyService {
  static readonly $inject = ['depA'];
}
";
        assert_eq!(apply(source, &["Injectable"]), source);
    }

    #[test]
    fn leaves_undecorated_classes() {
        let source = "export class Plain {\n  static value = 1;\n}\n";
        assert_eq!(apply(source, &[]), source);
    }

    #[test]
    fn keeps_an_existing_nocollapse_tag() {
        let source = "\
@Injectable()
export class MyService {
  /** @nocollapse */
  static a = 1;
  /**
   * Documented.
   * @nocollapse
   */
  static b = 2;
  /** @nocollapse @export */
  static c = 3;
}
";
        assert_eq!(apply(source, &["Injectable"]), source);
    }

    #[test]
    fn adds_the_tag_to_an_existing_multi_line_jsdoc() {
        let source = "\
@Injectable()
export class MyService {
  /**
   * Injection annotation.
   * @export
   */
  static readonly $inject = ['depA'];
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "\
@Injectable()
export class MyService {
  /**
   * Injection annotation.
   * @export
   * @nocollapse
   */
  static readonly $inject = ['depA'];
}
"
        );
    }

    #[test]
    fn moves_an_inline_closing_delimiter_onto_its_own_line() {
        let source = "\
@Injectable()
export class MyService {
  /** Injection annotation. */
  static readonly $inject = ['depA'];
  /**
   * Injection annotation. */
  static readonly other = ['depB'];
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "\
@Injectable()
export class MyService {
  /** Injection annotation.
   * @nocollapse
   */
  static readonly $inject = ['depA'];
  /**
   * Injection annotation.
   * @nocollapse
   */
  static readonly other = ['depB'];
}
"
        );
    }

    #[test]
    fn only_the_last_jsdoc_counts() {
        // tsickle only reads `/** Second. */`.
        let source = "\
@Injectable()
export class MyService {
  /** @nocollapse */
  // A line comment in between.
  /** Second. */
  static value = 1;
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "\
@Injectable()
export class MyService {
  /** @nocollapse */
  // A line comment in between.
  /** Second.
   * @nocollapse
   */
  static value = 1;
}
"
        );
    }

    #[test]
    fn a_description_mentioning_the_tag_is_not_the_tag() {
        let source = "\
@Injectable()
export class MyService {
  // @nocollapse
  static a = 1;
  /** Not a tag: @nocollapse */
  static b = 2;
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "\
@Injectable()
export class MyService {
  // @nocollapse
  /** @nocollapse */ static a = 1;
  /** Not a tag: @nocollapse
   * @nocollapse
   */
  static b = 2;
}
"
        );
    }

    #[test]
    fn precedes_member_decorators() {
        let source = "\
@Injectable()
export class MyService {
  @Custom() static value = 1;
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "\
@Injectable()
export class MyService {
  /** @nocollapse */ @Custom() static value = 1;
}
"
        );
    }

    #[test]
    fn skips_keys_tsickle_declares_no_property_for() {
        let source = "\
@Injectable()
export class MyService {
  static 'quoted' = 1;
  static 'not-an-identifier' = 2;
  static [Symbol.iterator] = 3;
  static 4 = 4;
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "\
@Injectable()
export class MyService {
  /** @nocollapse */ static 'quoted' = 1;
  static 'not-an-identifier' = 2;
  static [Symbol.iterator] = 3;
  static 4 = 4;
}
"
        );
    }

    #[test]
    fn same_line_comments_are_not_leading_for_typescript() {
        // Both JSDocs trail the previous token, so tsickle ignores them. The space before each
        // member stays put, so the expected lines end in whitespace; they're escaped so that
        // trimming on save doesn't break the test.
        let source = "\
@Injectable()
export class MyService { /** a */ static a = 1; /** b */ static b = 2;
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "@Injectable()\n\
             export class MyService { /** a */ \n\
             /** @nocollapse */ static a = 1; /** b */ \n\
             /** @nocollapse */ static b = 2;\n\
             }\n"
        );
    }

    #[test]
    fn a_same_line_comment_before_a_line_break_is_skipped() {
        let source = "\
@Injectable()
export class MyService { /** Trails the brace. */
  static value = 1;
}
";
        assert_eq!(
            apply(source, &["Injectable"]),
            "\
@Injectable()
export class MyService { /** Trails the brace. */
  /** @nocollapse */ static value = 1;
}
"
        );
    }

    #[test]
    fn keeps_crlf_line_endings_and_tab_indentation() {
        let source = "@Injectable()\r\nexport class MyService {\r\n\t/** Single. */\r\n\tstatic a = 1;\r\n\t/**\r\n\t * Multi.\r\n\t */\r\n\tstatic b = 2;\r\n}\r\n";
        assert_eq!(
            apply(source, &["Injectable"]),
            "@Injectable()\r\nexport class MyService {\r\n\t/** Single.\r\n\t * @nocollapse\r\n\t */\r\n\tstatic a = 1;\r\n\t/**\r\n\t * Multi.\r\n\t * @nocollapse\r\n\t */\r\n\tstatic b = 2;\r\n}\r\n"
        );
    }
}
