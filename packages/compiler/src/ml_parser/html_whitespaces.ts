/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from './ast';
import {NGSP_UNICODE} from './entities';
import {ParseTreeResult} from './parser';
import {TextToken, TokenType} from './tokens';

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
 */
export class WhitespaceVisitor implements html.Visitor {
  visitElement(element: html.Element, context: any): any {
    if (SKIP_WS_TRIM_TAGS.has(element.name) || hasPreserveWhitespacesAttr(element.attrs)) {
      // don't descent into elements where we need to preserve whitespaces
      // but still visit all attributes to eliminate one used as a market to preserve WS
      return new html.Element(
          element.name, html.visitAll(this, element.attrs), element.children, element.sourceSpan,
          element.startSourceSpan, element.endSourceSpan, element.i18n);
    }

    return new html.Element(
        element.name, element.attrs, visitAllWithSiblings(this, element.children),
        element.sourceSpan, element.startSourceSpan, element.endSourceSpan, element.i18n);
  }

  visitAttribute(attribute: html.Attribute, context: any): any {
    return attribute.name !== PRESERVE_WS_ATTR_NAME ? attribute : null;
  }

  visitText(text: html.Text, context: SiblingVisitorContext|null): any {
    const isNotBlank = text.value.match(NO_WS_REGEXP);
    const hasExpansionSibling = context &&
        (context.prev instanceof html.Expansion || context.next instanceof html.Expansion);

    if (isNotBlank || hasExpansionSibling) {
      // Process the whitespace in the tokens of this Text node
      const tokens = text.tokens.map(
          token =>
              token.type === TokenType.TEXT ? createWhitespaceProcessedTextToken(token) : token);
      // Process the whitespace of the value of this Text node
      const value = processWhitespace(text.value);
      return new html.Text(value, text.sourceSpan, tokens, text.i18n);
    }

    return null;
  }

  visitComment(comment: html.Comment, context: any): any {
    return comment;
  }

  visitExpansion(expansion: html.Expansion, context: any): any {
    return expansion;
  }

  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
    return expansionCase;
  }
}

function createWhitespaceProcessedTextToken({type, parts, sourceSpan}: TextToken): TextToken {
  return {type, parts: [processWhitespace(parts[0])], sourceSpan};
}

function processWhitespace(text: string): string {
  return replaceNgsp(text).replace(WS_REPLACE_REGEXP, ' ');
}

export function removeWhitespaces(htmlAstWithErrors: ParseTreeResult): ParseTreeResult {
  return new ParseTreeResult(
      html.visitAll(new WhitespaceVisitor(), htmlAstWithErrors.rootNodes),
      htmlAstWithErrors.errors);
}

interface SiblingVisitorContext {
  prev: html.Node|undefined;
  next: html.Node|undefined;
}

function visitAllWithSiblings(visitor: WhitespaceVisitor, nodes: html.Node[]): any[] {
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
