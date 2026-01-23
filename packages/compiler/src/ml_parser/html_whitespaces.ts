/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as html from './ast';
import {NGSP_UNICODE} from './entities';
import {ParseTreeResult} from './parser';
import {InterpolatedTextToken, TextToken, TokenType} from './tokens';

export const PRESERVE_WS_ATTR_NAME = 'ngPreserveWhitespaces';

const SKIP_WS_TRIM_TAGS = new Set(['pre', 'template', 'textarea', 'script', 'style']);

// Equivalent to \s with \u00a0 (non-breaking space) excluded.
// Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp
const WS_CHARS = ' \f\n\r\t\v\u1680\u180e\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff';
const NO_WS_REGEXP = new RegExp(`[^${WS_CHARS}]`);
const WS_REPLACE_REGEXP = new RegExp(`[${WS_CHARS}]{2,}`, 'g');

function hasPreserveWhitespacesAttr(attrs: html.Attribute[]): boolean {
  return attrs.some((attr: html.Attribute) => attr.name === PRESERVE_WS_ATTR_NAME);
}

/**
 * &ngsp; is a placeholder for non-removable space
 * &ngsp; is converted to the 0xE500 PUA (Private Use Areas) unicode character
 * and later on replaced by a space.
 */
export function replaceNgsp(value: string): string {
  // lexer is replacing the &ngsp; pseudo-entity with NGSP_UNICODE
  return value.replace(new RegExp(NGSP_UNICODE, 'g'), ' ');
}

/**
 * This visitor can walk HTML parse tree and remove / trim text nodes using the following rules:
 * - consider spaces, tabs and new lines as whitespace characters;
 * - drop text nodes consisting of whitespace characters only;
 * - for all other text nodes replace consecutive whitespace characters with one space;
 * - convert &ngsp; pseudo-entity to a single space;
 *
 * Removal and trimming of whitespaces have positive performance impact (less code to generate
 * while compiling templates, faster view creation). At the same time it can be "destructive"
 * in some cases (whitespaces can influence layout). Because of the potential of breaking layout
 * this visitor is not activated by default in Angular 5 and people need to explicitly opt-in for
 * whitespace removal. The default option for whitespace removal will be revisited in Angular 6
 * and might be changed to "on" by default.
 *
 * If `originalNodeMap` is provided, the transformed nodes will be mapped back to their original
 * inputs. Any output nodes not in the map were not transformed. This supports correlating and
 * porting information between the trimmed nodes and original nodes (such as `i18n` properties)
 * such that trimming whitespace does not does not drop required information from the node.
 */
export class WhitespaceVisitor implements html.Visitor {
  // How many ICU expansions which are currently being visited. ICUs can be nested, so this
  // tracks the current depth of nesting. If this depth is greater than 0, then this visitor is
  // currently processing content inside an ICU expansion.
  private icuExpansionDepth = 0;

  constructor(
    private readonly preserveSignificantWhitespace: boolean,
    private readonly originalNodeMap?: Map<html.Node, html.Node>,
    private readonly requireContext = true,
  ) {}

  visitElement(element: html.Element, context: any): any {
    if (SKIP_WS_TRIM_TAGS.has(element.name) || hasPreserveWhitespacesAttr(element.attrs)) {
      // don't descent into elements where we need to preserve whitespaces
      // but still visit all attributes to eliminate one used as a market to preserve WS
      const newElement = new html.Element(
        element.name,
        visitAllWithSiblings(this, element.attrs),
        visitAllWithSiblings(this, element.directives),
        element.children,
        element.isSelfClosing,
        element.sourceSpan,
        element.startSourceSpan,
        element.endSourceSpan,
        element.isVoid,
        element.i18n,
      );
      this.originalNodeMap?.set(newElement, element);
      return newElement;
    }

    const newElement = new html.Element(
      element.name,
      element.attrs,
      element.directives,
      visitAllWithSiblings(this, element.children),
      element.isSelfClosing,
      element.sourceSpan,
      element.startSourceSpan,
      element.endSourceSpan,
      element.isVoid,
      element.i18n,
    );
    this.originalNodeMap?.set(newElement, element);
    return newElement;
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    return attribute.name !== PRESERVE_WS_ATTR_NAME ? attribute : null;
  }

  visitText(text: html.Text, context: SiblingVisitorContext | null): any {
    const isNotBlank = text.value.match(NO_WS_REGEXP);
    const hasExpansionSibling =
      context && (context.prev instanceof html.Expansion || context.next instanceof html.Expansion);

    // Do not trim whitespace within ICU expansions when preserving significant whitespace.
    // Historically, ICU whitespace was never trimmed and this is really a bug. However fixing it
    // would change message IDs which we can't easily do. Instead we only trim ICU whitespace within
    // ICU expansions when not preserving significant whitespace, which is the new behavior where it
    // most matters.
    const inIcuExpansion = this.icuExpansionDepth > 0;
    if (inIcuExpansion && this.preserveSignificantWhitespace) return text;

    if (isNotBlank || hasExpansionSibling) {
      // Process the whitespace in the tokens of this Text node
      const tokens = text.tokens.map((token) =>
        token.type === TokenType.TEXT ? createWhitespaceProcessedTextToken(token) : token,
      );

      // Fully trim message when significant whitespace is not preserved.
      if (!this.preserveSignificantWhitespace && tokens.length > 0) {
        // The first token should only call `.trimStart()` and the last token
        // should only call `.trimEnd()`, but there might be only one token which
        // needs to call both.
        const firstToken = tokens[0]!;
        tokens.splice(0, 1, trimLeadingWhitespace(firstToken, context));

        const lastToken = tokens[tokens.length - 1]; // Could be the same as the first token.
        tokens.splice(tokens.length - 1, 1, trimTrailingWhitespace(lastToken, context));
      }

      // Process the whitespace of the value of this Text node. Also trim the leading/trailing
      // whitespace when we don't need to preserve significant whitespace.
      const processed = processWhitespace(text.value);
      const value = this.preserveSignificantWhitespace
        ? processed
        : trimLeadingAndTrailingWhitespace(processed, context);
      const result = new html.Text(value, text.sourceSpan, tokens, text.i18n);
      this.originalNodeMap?.set(result, text);
      return result;
    }

    return null;
  }

  visitComment(comment: html.Comment, context: any): any {
    return comment;
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
    this.icuExpansionDepth++;
    let newExpansion: html.Expansion;
    try {
      newExpansion = new html.Expansion(
        expansion.switchValue,
        expansion.type,
        visitAllWithSiblings(this, expansion.cases),
        expansion.sourceSpan,
        expansion.switchValueSourceSpan,
        expansion.i18n,
      );
    } finally {
      this.icuExpansionDepth--;
    }

    this.originalNodeMap?.set(newExpansion, expansion);

    return newExpansion;
  }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
    const newExpansionCase = new html.ExpansionCase(
      expansionCase.value,
      visitAllWithSiblings(this, expansionCase.expression),
      expansionCase.sourceSpan,
      expansionCase.valueSourceSpan,
      expansionCase.expSourceSpan,
    );
    this.originalNodeMap?.set(newExpansionCase, expansionCase);
    return newExpansionCase;
  }

  visitBlock(block: html.Block, context: any): any {
    const newBlock = new html.Block(
      block.name,
      block.parameters,
      visitAllWithSiblings(this, block.children),
      block.sourceSpan,
      block.nameSpan,
      block.startSourceSpan,
      block.endSourceSpan,
    );
    this.originalNodeMap?.set(newBlock, block);
    return newBlock;
  }

  visitBlockParameter(parameter: html.BlockParameter, context: any) {
    return parameter;
  }

  visitLetDeclaration(decl: html.LetDeclaration, context: any) {
    return decl;
  }

  visitComponent(node: html.Component, context: any): any {
    if (
      (node.tagName && SKIP_WS_TRIM_TAGS.has(node.tagName)) ||
      hasPreserveWhitespacesAttr(node.attrs)
    ) {
      // don't descent into elements where we need to preserve whitespaces
      // but still visit all attributes to eliminate one used as a market to preserve WS
      const newElement = new html.Component(
        node.componentName,
        node.tagName,
        node.fullName,
        visitAllWithSiblings(this, node.attrs),
        visitAllWithSiblings(this, node.directives),
        node.children,
        node.isSelfClosing,
        node.sourceSpan,
        node.startSourceSpan,
        node.endSourceSpan,
        node.i18n,
      );
      this.originalNodeMap?.set(newElement, node);
      return newElement;
    }

    const newElement = new html.Component(
      node.componentName,
      node.tagName,
      node.fullName,
      node.attrs,
      node.directives,
      visitAllWithSiblings(this, node.children),
      node.isSelfClosing,
      node.sourceSpan,
      node.startSourceSpan,
      node.endSourceSpan,
      node.i18n,
    );
    this.originalNodeMap?.set(newElement, node);
    return newElement;
  }

  visitDirective(directive: html.Directive, context: any) {
    return directive;
  }

  visit(_node: html.Node, context: any) {
    // `visitAllWithSiblings` provides context necessary for ICU messages to be handled correctly.
    // Prefer that over calling `html.visitAll` directly on this visitor.
    if (this.requireContext && !context) {
      throw new Error(
        `WhitespaceVisitor requires context. Visit via \`visitAllWithSiblings\` to get this context.`,
      );
    }

    return false;
  }
}

function trimLeadingWhitespace(
  token: InterpolatedTextToken,
  context: SiblingVisitorContext | null,
): InterpolatedTextToken {
  if (token.type !== TokenType.TEXT) return token;

  const isFirstTokenInTag = !context?.prev;
  if (!isFirstTokenInTag) return token;

  return transformTextToken(token, (text) => text.trimStart());
}

function trimTrailingWhitespace(
  token: InterpolatedTextToken,
  context: SiblingVisitorContext | null,
): InterpolatedTextToken {
  if (token.type !== TokenType.TEXT) return token;

  const isLastTokenInTag = !context?.next;
  if (!isLastTokenInTag) return token;

  return transformTextToken(token, (text) => text.trimEnd());
}

function trimLeadingAndTrailingWhitespace(
  text: string,
  context: SiblingVisitorContext | null,
): string {
  const isFirstTokenInTag = !context?.prev;
  const isLastTokenInTag = !context?.next;

  const maybeTrimmedStart = isFirstTokenInTag ? text.trimStart() : text;
  const maybeTrimmed = isLastTokenInTag ? maybeTrimmedStart.trimEnd() : maybeTrimmedStart;
  return maybeTrimmed;
}

function createWhitespaceProcessedTextToken({type, parts, sourceSpan}: TextToken): TextToken {
  return {type, parts: [processWhitespace(parts[0])], sourceSpan};
}

function transformTextToken(
  {type, parts, sourceSpan}: TextToken,
  transform: (parts: string) => string,
): TextToken {
  // `TextToken` only ever has one part as defined in its type, so we just transform the first element.
  return {type, parts: [transform(parts[0])], sourceSpan};
}

function processWhitespace(text: string): string {
  return replaceNgsp(text).replace(WS_REPLACE_REGEXP, ' ');
}

export function removeWhitespaces(
  htmlAstWithErrors: ParseTreeResult,
  preserveSignificantWhitespace: boolean,
): ParseTreeResult {
  return new ParseTreeResult(
    visitAllWithSiblings(
      new WhitespaceVisitor(preserveSignificantWhitespace),
      htmlAstWithErrors.rootNodes,
    ),
    htmlAstWithErrors.errors,
  );
}

interface SiblingVisitorContext {
  prev: html.Node | undefined;
  next: html.Node | undefined;
}

export function visitAllWithSiblings(visitor: WhitespaceVisitor, nodes: html.Node[]): any[] {
  const result: any[] = [];

  nodes.forEach((ast, i) => {
    const context: SiblingVisitorContext = {prev: nodes[i - 1], next: nodes[i + 1]};
    const astResult = ast.visit(visitor, context);
    if (astResult) {
      result.push(astResult);
    }
  });
  return result;
}
