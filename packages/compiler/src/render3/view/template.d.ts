/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InterpolationConfig } from '../../ml_parser/defaults';
import { LexerRange } from '../../ml_parser/lexer';
import { ParseError } from '../../parse_util';
import { BindingParser } from '../../template_parser/binding_parser';
import * as t from '../r3_ast';
export declare const LEADING_TRIVIA_CHARS: string[];
/**
 * Options that can be used to modify how a template is parsed by `parseTemplate()`.
 */
export interface ParseTemplateOptions {
    /**
     * Include whitespace nodes in the parsed output.
     */
    preserveWhitespaces?: boolean;
    /**
     * Preserve original line endings instead of normalizing '\r\n' endings to '\n'.
     */
    preserveLineEndings?: boolean;
    /**
     * Preserve whitespace significant to rendering.
     */
    preserveSignificantWhitespace?: boolean;
    /**
     * How to parse interpolation markers.
     */
    interpolationConfig?: InterpolationConfig;
    /**
     * The start and end point of the text to parse within the `source` string.
     * The entire `source` string is parsed if this is not provided.
     * */
    range?: LexerRange;
    /**
     * If this text is stored in a JavaScript string, then we have to deal with escape sequences.
     *
     * **Example 1:**
     *
     * ```
     * "abc\"def\nghi"
     * ```
     *
     * - The `\"` must be converted to `"`.
     * - The `\n` must be converted to a new line character in a token,
     *   but it should not increment the current line for source mapping.
     *
     * **Example 2:**
     *
     * ```
     * "abc\
     *  def"
     * ```
     *
     * The line continuation (`\` followed by a newline) should be removed from a token
     * but the new line should increment the current line for source mapping.
     */
    escapedString?: boolean;
    /**
     * An array of characters that should be considered as leading trivia.
     * Leading trivia are characters that are not important to the developer, and so should not be
     * included in source-map segments.  A common example is whitespace.
     */
    leadingTriviaChars?: string[];
    /**
     * Render `$localize` message ids with additional legacy message ids.
     *
     * This option defaults to `true` but in the future the default will be flipped.
     *
     * For now set this option to false if you have migrated the translation files to use the new
     * `$localize` message id format and you are not using compile time translation merging.
     */
    enableI18nLegacyMessageIdFormat?: boolean;
    /**
     * If this text is stored in an external template (e.g. via `templateUrl`) then we need to decide
     * whether or not to normalize the line-endings (from `\r\n` to `\n`) when processing ICU
     * expressions.
     *
     * If `true` then we will normalize ICU expression line endings.
     * The default is `false`, but this will be switched in a future major release.
     */
    i18nNormalizeLineEndingsInICUs?: boolean;
    /**
     * Whether to always attempt to convert the parsed HTML AST to an R3 AST, despite HTML or i18n
     * Meta parse errors.
     *
     *
     * This option is useful in the context of the language service, where we want to get as much
     * information as possible, despite any errors in the HTML. As an example, a user may be adding
     * a new tag and expecting autocomplete on that tag. In this scenario, the HTML is in an errored
     * state, as there is an incomplete open tag. However, we're still able to convert the HTML AST
     * nodes to R3 AST nodes in order to provide information for the language service.
     *
     * Note that even when `true` the HTML parse and i18n errors are still appended to the errors
     * output, but this is done after converting the HTML AST to R3 AST.
     */
    alwaysAttemptHtmlToR3AstConversion?: boolean;
    /**
     * Include HTML Comment nodes in a top-level comments array on the returned R3 AST.
     *
     * This option is required by tooling that needs to know the location of comment nodes within the
     * AST. A concrete example is @angular-eslint which requires this in order to enable
     * "eslint-disable" comments within HTML templates, which then allows users to turn off specific
     * rules on a case by case basis, instead of for their whole project within a configuration file.
     */
    collectCommentNodes?: boolean;
    /** Whether the @ block syntax is enabled. */
    enableBlockSyntax?: boolean;
    /** Whether the `@let` syntax is enabled. */
    enableLetSyntax?: boolean;
    /** Whether the selectorless syntax is enabled. */
    enableSelectorless?: boolean;
}
/**
 * Parse a template into render3 `Node`s and additional metadata, with no other dependencies.
 *
 * @param template text of the template to parse
 * @param templateUrl URL to use for source mapping of the parsed template
 * @param options options to modify how the template is parsed
 */
export declare function parseTemplate(template: string, templateUrl: string, options?: ParseTemplateOptions): ParsedTemplate;
/**
 * Construct a `BindingParser` with a default configuration.
 */
export declare function makeBindingParser(interpolationConfig?: InterpolationConfig, selectorlessEnabled?: boolean): BindingParser;
/**
 * Information about the template which was extracted during parsing.
 *
 * This contains the actual parsed template as well as any metadata collected during its parsing,
 * some of which might be useful for re-parsing the template with different options.
 */
export interface ParsedTemplate {
    /**
     * Include whitespace nodes in the parsed output.
     */
    preserveWhitespaces?: boolean;
    /**
     * How to parse interpolation markers.
     */
    interpolationConfig?: InterpolationConfig;
    /**
     * Any errors from parsing the template the first time.
     *
     * `null` if there are no errors. Otherwise, the array of errors is guaranteed to be non-empty.
     */
    errors: ParseError[] | null;
    /**
     * The template AST, parsed from the template.
     */
    nodes: t.Node[];
    /**
     * Any styleUrls extracted from the metadata.
     */
    styleUrls: string[];
    /**
     * Any inline styles extracted from the metadata.
     */
    styles: string[];
    /**
     * Any ng-content selectors extracted from the template.
     */
    ngContentSelectors: string[];
    /**
     * Any R3 Comment Nodes extracted from the template when the `collectCommentNodes` parse template
     * option is enabled.
     */
    commentNodes?: t.Comment[];
}
