/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Lexer as ExpressionLexer} from '../expression_parser/lexer';
import {Parser as ExpressionParser} from '../expression_parser/parser';
import * as html from '../ml_parser/ast';
import {getHtmlTagDefinition} from '../ml_parser/html_tags';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
import {InterpolatedAttributeToken, InterpolatedTextToken, TokenType} from '../ml_parser/tokens';
import {ParseSourceSpan} from '../parse_util';

import * as i18n from './i18n_ast';
import {PlaceholderRegistry} from './serializers/placeholder';

const _expParser = new ExpressionParser(new ExpressionLexer());

export type VisitNodeFn = (html: html.Node, i18n: i18n.Node) => i18n.Node;

export interface I18nMessageFactory {
  (nodes: html.Node[], meaning: string|undefined, description: string|undefined,
   customId: string|undefined, visitNodeFn?: VisitNodeFn): i18n.Message;
}

/**
 * Returns a function converting html nodes to an i18n Message given an interpolationConfig
 */
export function createI18nMessageFactory(interpolationConfig: InterpolationConfig):
    I18nMessageFactory {
  const visitor = new _I18nVisitor(_expParser, interpolationConfig);
  return (nodes, meaning, description, customId, visitNodeFn) =>
             visitor.toI18nMessage(nodes, meaning, description, customId, visitNodeFn);
}

interface I18nMessageVisitorContext {
  isIcu: boolean;
  icuDepth: number;
  placeholderRegistry: PlaceholderRegistry;
  placeholderToContent: {[phName: string]: i18n.MessagePlaceholder};
  placeholderToMessage: {[phName: string]: i18n.Message};
  visitNodeFn: VisitNodeFn;
}

function noopVisitNodeFn(_html: html.Node, i18n: i18n.Node): i18n.Node {
  return i18n;
}

class _I18nVisitor implements html.Visitor {
  constructor(
      private _expressionParser: ExpressionParser,
      private _interpolationConfig: InterpolationConfig) {}

  public toI18nMessage(
      nodes: html.Node[], meaning = '', description = '', customId = '',
      visitNodeFn: VisitNodeFn|undefined): i18n.Message {
    const context: I18nMessageVisitorContext = {
      isIcu: nodes.length == 1 && nodes[0] instanceof html.Expansion,
      icuDepth: 0,
      placeholderRegistry: new PlaceholderRegistry(),
      placeholderToContent: {},
      placeholderToMessage: {},
      visitNodeFn: visitNodeFn || noopVisitNodeFn,
    };

    const i18nodes: i18n.Node[] = html.visitAll(this, nodes, context);

    return new i18n.Message(
        i18nodes, context.placeholderToContent, context.placeholderToMessage, meaning, description,
        customId);
  }

  visitElement(el: html.Element, context: I18nMessageVisitorContext): i18n.Node {
    const children = html.visitAll(this, el.children, context);
    const attrs: {[k: string]: string} = {};
    el.attrs.forEach(attr => {
      // Do not visit the attributes, translatable ones are top-level ASTs
      attrs[attr.name] = attr.value;
    });

    const isVoid: boolean = getHtmlTagDefinition(el.name).isVoid;
    const startPhName =
        context.placeholderRegistry.getStartTagPlaceholderName(el.name, attrs, isVoid);
    context.placeholderToContent[startPhName] = {
      text: el.startSourceSpan.toString(),
      sourceSpan: el.startSourceSpan,
    };

    let closePhName = '';

    if (!isVoid) {
      closePhName = context.placeholderRegistry.getCloseTagPlaceholderName(el.name);
      context.placeholderToContent[closePhName] = {
        text: `</${el.name}>`,
        sourceSpan: el.endSourceSpan ?? el.sourceSpan,
      };
    }

    const node = new i18n.TagPlaceholder(
        el.name, attrs, startPhName, closePhName, children, isVoid, el.sourceSpan,
        el.startSourceSpan, el.endSourceSpan);
    return context.visitNodeFn(el, node);
  }

  visitAttribute(attribute: html.Attribute, context: I18nMessageVisitorContext): i18n.Node {
    const node = attribute.valueTokens === undefined || attribute.valueTokens.length === 1 ?
        new i18n.Text(attribute.value, attribute.valueSpan || attribute.sourceSpan) :
        this._visitTextWithInterpolation(
            attribute.valueTokens, attribute.valueSpan || attribute.sourceSpan, context,
            attribute.i18n);
    return context.visitNodeFn(attribute, node);
  }

  visitText(text: html.Text, context: I18nMessageVisitorContext): i18n.Node {
    const node = text.tokens.length === 1 ?
        new i18n.Text(text.value, text.sourceSpan) :
        this._visitTextWithInterpolation(text.tokens, text.sourceSpan, context, text.i18n);
    return context.visitNodeFn(text, node);
  }

  visitComment(comment: html.Comment, context: I18nMessageVisitorContext): i18n.Node|null {
    return null;
  }

  visitExpansion(icu: html.Expansion, context: I18nMessageVisitorContext): i18n.Node {
    context.icuDepth++;
    const i18nIcuCases: {[k: string]: i18n.Node} = {};
    const i18nIcu = new i18n.Icu(icu.switchValue, icu.type, i18nIcuCases, icu.sourceSpan);
    icu.cases.forEach((caze): void => {
      i18nIcuCases[caze.value] = new i18n.Container(
          caze.expression.map((node) => node.visit(this, context)), caze.expSourceSpan);
    });
    context.icuDepth--;

    if (context.isIcu || context.icuDepth > 0) {
      // Returns an ICU node when:
      // - the message (vs a part of the message) is an ICU message, or
      // - the ICU message is nested.
      const expPh = context.placeholderRegistry.getUniquePlaceholder(`VAR_${icu.type}`);
      i18nIcu.expressionPlaceholder = expPh;
      context.placeholderToContent[expPh] = {
        text: icu.switchValue,
        sourceSpan: icu.switchValueSourceSpan,
      };
      return context.visitNodeFn(icu, i18nIcu);
    }

    // Else returns a placeholder
    // ICU placeholders should not be replaced with their original content but with the their
    // translations.
    // TODO(vicb): add a html.Node -> i18n.Message cache to avoid having to re-create the msg
    const phName = context.placeholderRegistry.getPlaceholderName('ICU', icu.sourceSpan.toString());
    context.placeholderToMessage[phName] = this.toI18nMessage([icu], '', '', '', undefined);
    const node = new i18n.IcuPlaceholder(i18nIcu, phName, icu.sourceSpan);
    return context.visitNodeFn(icu, node);
  }

  visitExpansionCase(_icuCase: html.ExpansionCase, _context: I18nMessageVisitorContext): i18n.Node {
    throw new Error('Unreachable code');
  }

  /**
   * Convert, text and interpolated tokens up into text and placeholder pieces.
   *
   * @param tokens The text and interpolated tokens.
   * @param sourceSpan The span of the whole of the `text` string.
   * @param context The current context of the visitor, used to compute and store placeholders.
   * @param previousI18n Any i18n metadata associated with this `text` from a previous pass.
   */
  private _visitTextWithInterpolation(
      tokens: (InterpolatedTextToken|InterpolatedAttributeToken)[], sourceSpan: ParseSourceSpan,
      context: I18nMessageVisitorContext, previousI18n: i18n.I18nMeta|undefined): i18n.Node {
    // Return a sequence of `Text` and `Placeholder` nodes grouped in a `Container`.
    const nodes: i18n.Node[] = [];
    // We will only create a container if there are actually interpolations,
    // so this flag tracks that.
    let hasInterpolation = false;
    for (const token of tokens) {
      switch (token.type) {
        case TokenType.INTERPOLATION:
        case TokenType.ATTR_VALUE_INTERPOLATION:
          hasInterpolation = true;
          const expression = token.parts[1];
          const baseName = extractPlaceholderName(expression) || 'INTERPOLATION';
          const phName = context.placeholderRegistry.getPlaceholderName(baseName, expression);
          context.placeholderToContent[phName] = {
            text: token.parts.join(''),
            sourceSpan: token.sourceSpan
          };
          nodes.push(new i18n.Placeholder(expression, phName, token.sourceSpan));
          break;
        default:
          if (token.parts[0].length > 0) {
            // This token is text or an encoded entity.
            // If it is following on from a previous text node then merge it into that node
            // Otherwise, if it is following an interpolation, then add a new node.
            const previous = nodes[nodes.length - 1];
            if (previous instanceof i18n.Text) {
              previous.value += token.parts[0];
              previous.sourceSpan = new ParseSourceSpan(
                  previous.sourceSpan.start, token.sourceSpan.end, previous.sourceSpan.fullStart,
                  previous.sourceSpan.details);
            } else {
              nodes.push(new i18n.Text(token.parts[0], token.sourceSpan));
            }
          }
          break;
      }
    }

    if (hasInterpolation) {
      // Whitespace removal may have invalidated the interpolation source-spans.
      reusePreviousSourceSpans(nodes, previousI18n);
      return new i18n.Container(nodes, sourceSpan);
    } else {
      return nodes[0];
    }
  }
}

/**
 * Re-use the source-spans from `previousI18n` metadata for the `nodes`.
 *
 * Whitespace removal can invalidate the source-spans of interpolation nodes, so we
 * reuse the source-span stored from a previous pass before the whitespace was removed.
 *
 * @param nodes The `Text` and `Placeholder` nodes to be processed.
 * @param previousI18n Any i18n metadata for these `nodes` stored from a previous pass.
 */
function reusePreviousSourceSpans(nodes: i18n.Node[], previousI18n: i18n.I18nMeta|undefined): void {
  if (previousI18n instanceof i18n.Message) {
    // The `previousI18n` is an i18n `Message`, so we are processing an `Attribute` with i18n
    // metadata. The `Message` should consist only of a single `Container` that contains the
    // parts (`Text` and `Placeholder`) to process.
    assertSingleContainerMessage(previousI18n);
    previousI18n = previousI18n.nodes[0];
  }

  if (previousI18n instanceof i18n.Container) {
    // The `previousI18n` is a `Container`, which means that this is a second i18n extraction pass
    // after whitespace has been removed from the AST nodes.
    assertEquivalentNodes(previousI18n.children, nodes);

    // Reuse the source-spans from the first pass.
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].sourceSpan = previousI18n.children[i].sourceSpan;
    }
  }
}

/**
 * Asserts that the `message` contains exactly one `Container` node.
 */
function assertSingleContainerMessage(message: i18n.Message): void {
  const nodes = message.nodes;
  if (nodes.length !== 1 || !(nodes[0] instanceof i18n.Container)) {
    throw new Error(
        'Unexpected previous i18n message - expected it to consist of only a single `Container` node.');
  }
}

/**
 * Asserts that the `previousNodes` and `node` collections have the same number of elements and
 * corresponding elements have the same node type.
 */
function assertEquivalentNodes(previousNodes: i18n.Node[], nodes: i18n.Node[]): void {
  if (previousNodes.length !== nodes.length) {
    throw new Error('The number of i18n message children changed between first and second pass.');
  }
  if (previousNodes.some((node, i) => nodes[i].constructor !== node.constructor)) {
    throw new Error(
        'The types of the i18n message children changed between first and second pass.');
  }
}

const _CUSTOM_PH_EXP =
    /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*("|')([\s\S]*?)\1[\s\S]*\)/g;

function extractPlaceholderName(input: string): string {
  return input.split(_CUSTOM_PH_EXP)[2];
}
