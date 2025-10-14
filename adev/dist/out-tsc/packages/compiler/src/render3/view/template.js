/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Lexer} from '../../expression_parser/lexer';
import {Parser} from '../../expression_parser/parser';
import * as html from '../../ml_parser/ast';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../ml_parser/defaults';
import {HtmlParser} from '../../ml_parser/html_parser';
import {WhitespaceVisitor} from '../../ml_parser/html_whitespaces';
import {DomElementSchemaRegistry} from '../../schema/dom_element_schema_registry';
import {BindingParser} from '../../template_parser/binding_parser';
import {htmlAstToRender3Ast} from '../r3_template_transform';
import {I18nMetaVisitor} from './i18n/meta';
export const LEADING_TRIVIA_CHARS = [' ', '\n', '\r', '\t'];
/**
 * Parse a template into render3 `Node`s and additional metadata, with no other dependencies.
 *
 * @param template text of the template to parse
 * @param templateUrl URL to use for source mapping of the parsed template
 * @param options options to modify how the template is parsed
 */
export function parseTemplate(template, templateUrl, options = {}) {
  const {interpolationConfig, preserveWhitespaces, enableI18nLegacyMessageIdFormat} = options;
  const selectorlessEnabled = options.enableSelectorless ?? false;
  const bindingParser = makeBindingParser(interpolationConfig, selectorlessEnabled);
  const htmlParser = new HtmlParser();
  const parseResult = htmlParser.parse(template, templateUrl, {
    leadingTriviaChars: LEADING_TRIVIA_CHARS,
    ...options,
    tokenizeExpansionForms: true,
    tokenizeBlocks: options.enableBlockSyntax ?? true,
    tokenizeLet: options.enableLetSyntax ?? true,
    selectorlessEnabled,
  });
  if (
    !options.alwaysAttemptHtmlToR3AstConversion &&
    parseResult.errors &&
    parseResult.errors.length > 0
  ) {
    const parsedTemplate = {
      interpolationConfig,
      preserveWhitespaces,
      errors: parseResult.errors,
      nodes: [],
      styleUrls: [],
      styles: [],
      ngContentSelectors: [],
    };
    if (options.collectCommentNodes) {
      parsedTemplate.commentNodes = [];
    }
    return parsedTemplate;
  }
  let rootNodes = parseResult.rootNodes;
  // We need to use the same `retainEmptyTokens` value for both parses to avoid
  // causing a mismatch when reusing source spans, even if the
  // `preserveSignificantWhitespace` behavior is different between the two
  // parses.
  const retainEmptyTokens = !(options.preserveSignificantWhitespace ?? true);
  // process i18n meta information (scan attributes, generate ids)
  // before we run whitespace removal process, because existing i18n
  // extraction process (ng extract-i18n) relies on a raw content to generate
  // message ids
  const i18nMetaVisitor = new I18nMetaVisitor(
    interpolationConfig,
    /* keepI18nAttrs */ !preserveWhitespaces,
    enableI18nLegacyMessageIdFormat,
    /* containerBlocks */ undefined,
    options.preserveSignificantWhitespace,
    retainEmptyTokens,
  );
  const i18nMetaResult = i18nMetaVisitor.visitAllWithErrors(rootNodes);
  if (
    !options.alwaysAttemptHtmlToR3AstConversion &&
    i18nMetaResult.errors &&
    i18nMetaResult.errors.length > 0
  ) {
    const parsedTemplate = {
      interpolationConfig,
      preserveWhitespaces,
      errors: i18nMetaResult.errors,
      nodes: [],
      styleUrls: [],
      styles: [],
      ngContentSelectors: [],
    };
    if (options.collectCommentNodes) {
      parsedTemplate.commentNodes = [];
    }
    return parsedTemplate;
  }
  rootNodes = i18nMetaResult.rootNodes;
  if (!preserveWhitespaces) {
    // Always preserve significant whitespace here because this is used to generate the `goog.getMsg`
    // and `$localize` calls which should retain significant whitespace in order to render the
    // correct output. We let this diverge from the message IDs generated earlier which might not
    // have preserved significant whitespace.
    //
    // This should use `visitAllWithSiblings` to set `WhitespaceVisitor` context correctly, however
    // there is an existing bug where significant whitespace is not properly retained in the JS
    // output of leading/trailing whitespace for ICU messages due to the existing lack of context\
    // in `WhitespaceVisitor`. Using `visitAllWithSiblings` here would fix that bug and retain the
    // whitespace, however it would also change the runtime representation which we don't want to do
    // right now.
    rootNodes = html.visitAll(
      new WhitespaceVisitor(
        /* preserveSignificantWhitespace */ true,
        /* originalNodeMap */ undefined,
        /* requireContext */ false,
      ),
      rootNodes,
    );
    // run i18n meta visitor again in case whitespaces are removed (because that might affect
    // generated i18n message content) and first pass indicated that i18n content is present in a
    // template. During this pass i18n IDs generated at the first pass will be preserved, so we can
    // mimic existing extraction process (ng extract-i18n)
    if (i18nMetaVisitor.hasI18nMeta) {
      rootNodes = html.visitAll(
        new I18nMetaVisitor(
          interpolationConfig,
          /* keepI18nAttrs */ false,
          /* enableI18nLegacyMessageIdFormat */ undefined,
          /* containerBlocks */ undefined,
          /* preserveSignificantWhitespace */ true,
          retainEmptyTokens,
        ),
        rootNodes,
      );
    }
  }
  const {nodes, errors, styleUrls, styles, ngContentSelectors, commentNodes} = htmlAstToRender3Ast(
    rootNodes,
    bindingParser,
    {collectCommentNodes: !!options.collectCommentNodes},
  );
  errors.push(...parseResult.errors, ...i18nMetaResult.errors);
  const parsedTemplate = {
    interpolationConfig,
    preserveWhitespaces,
    errors: errors.length > 0 ? errors : null,
    nodes,
    styleUrls,
    styles,
    ngContentSelectors,
  };
  if (options.collectCommentNodes) {
    parsedTemplate.commentNodes = commentNodes;
  }
  return parsedTemplate;
}
const elementRegistry = new DomElementSchemaRegistry();
/**
 * Construct a `BindingParser` with a default configuration.
 */
export function makeBindingParser(
  interpolationConfig = DEFAULT_INTERPOLATION_CONFIG,
  selectorlessEnabled = false,
) {
  return new BindingParser(
    new Parser(new Lexer(), selectorlessEnabled),
    interpolationConfig,
    elementRegistry,
    [],
  );
}
//# sourceMappingURL=template.js.map
