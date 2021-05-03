/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Lexer as ExpressionLexer} from '../expression_parser/lexer';
import {InterpolationPiece, Parser as ExpressionParser} from '../expression_parser/parser';
import * as html from '../ml_parser/ast';
import {getHtmlTagDefinition} from '../ml_parser/html_tags';
import {InterpolationConfig} from '../ml_parser/interpolation_config';
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
    const node = this._visitTextWithInterpolation(
        attribute.value, attribute.valueSpan || attribute.sourceSpan, context, attribute.i18n);
    return context.visitNodeFn(attribute, node);
  }

  visitText(text: html.Text, context: I18nMessageVisitorContext): i18n.Node {
    const node = this._visitTextWithInterpolation(text.value, text.sourceSpan, context, text.i18n);
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
   * Split the, potentially interpolated, text up into text and placeholder pieces.
   *
   * @param text The potentially interpolated string to be split.
   * @param sourceSpan The span of the whole of the `text` string.
   * @param context The current context of the visitor, used to compute and store placeholders.
   * @param previousI18n Any i18n metadata associated with this `text` from a previous pass.
   */
  private _visitTextWithInterpolation(
      text: string, sourceSpan: ParseSourceSpan, context: I18nMessageVisitorContext,
      previousI18n: i18n.I18nMeta|undefined): i18n.Node {
    const {strings, expressions} = this._expressionParser.splitInterpolation(
        text, sourceSpan.start.toString(), this._interpolationConfig);

    // No expressions, return a single text.
    if (expressions.length === 0) {
      return new i18n.Text(text, sourceSpan);
    }

    // Return a sequence of `Text` and `Placeholder` nodes grouped in a `Container`.
    const nodes: i18n.Node[] = [];
    for (let i = 0; i < strings.length - 1; i++) {
      this._addText(nodes, strings[i], sourceSpan);
      this._addPlaceholder(nodes, context, expressions[i], sourceSpan);
    }
    // The last index contains no expression
    this._addText(nodes, strings[strings.length - 1], sourceSpan);

    // Whitespace removal may have invalidated the interpolation source-spans.
    reusePreviousSourceSpans(nodes, previousI18n);

    return new i18n.Container(nodes, sourceSpan);
  }

  /**
   * Create a new `Text` node from the `textPiece` and add it to the `nodes` collection.
   *
   * @param nodes The nodes to which the created `Text` node should be added.
   * @param textPiece The text and relative span information for this `Text` node.
   * @param interpolationSpan The span of the whole interpolated text.
   */
  private _addText(
      nodes: i18n.Node[], textPiece: InterpolationPiece, interpolationSpan: ParseSourceSpan): void {
    if (textPiece.text.length > 0) {
      // No need to add empty strings
      const stringSpan = getOffsetSourceSpan(interpolationSpan, textPiece);
      nodes.push(new i18n.Text(textPiece.text, stringSpan));
    }
  }

  /**
   * Create a new `Placeholder` node from the `expression` and add it to the `nodes` collection.
   *
   * @param nodes The nodes to which the created `Text` node should be added.
   * @param context The current context of the visitor, used to compute and store placeholders.
   * @param expression The expression text and relative span information for this `Placeholder`
   *     node.
   * @param interpolationSpan The span of the whole interpolated text.
   */
  private _addPlaceholder(
      nodes: i18n.Node[], context: I18nMessageVisitorContext, expression: InterpolationPiece,
      interpolationSpan: ParseSourceSpan): void {
    const sourceSpan = getOffsetSourceSpan(interpolationSpan, expression);
    const baseName = extractPlaceholderName(expression.text) || 'INTERPOLATION';
    const phName = context.placeholderRegistry.getPlaceholderName(baseName, expression.text);
    const text = this._interpolationConfig.start + expression.text + this._interpolationConfig.end;
    context.placeholderToContent[phName] = {text, sourceSpan};
    nodes.push(new i18n.Placeholder(expression.text, phName, sourceSpan));
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
    // after whitespace has been removed from the AST ndoes.
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

/**
 * Create a new `ParseSourceSpan` from the `sourceSpan`, offset by the `start` and `end` values.
 */
function getOffsetSourceSpan(
    sourceSpan: ParseSourceSpan, {start, end}: InterpolationPiece): ParseSourceSpan {
  return new ParseSourceSpan(sourceSpan.fullStart.moveBy(start), sourceSpan.fullStart.moveBy(end));
}

const _CUSTOM_PH_EXP =
    /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*("|')([\s\S]*?)\1[\s\S]*\)/g;

function extractPlaceholderName(input: string): string {
  return input.split(_CUSTOM_PH_EXP)[2];
}
