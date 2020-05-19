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
  placeholderToContent: {[phName: string]: string};
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
    context.placeholderToContent[startPhName] = el.sourceSpan!.toString();

    let closePhName = '';

    if (!isVoid) {
      closePhName = context.placeholderRegistry.getCloseTagPlaceholderName(el.name);
      context.placeholderToContent[closePhName] = `</${el.name}>`;
    }

    const node = new i18n.TagPlaceholder(
        el.name, attrs, startPhName, closePhName, children, isVoid, el.sourceSpan!);
    return context.visitNodeFn(el, node);
  }

  visitAttribute(attribute: html.Attribute, context: I18nMessageVisitorContext): i18n.Node {
    const node = this._visitTextWithInterpolation(attribute.value, attribute.sourceSpan, context);
    return context.visitNodeFn(attribute, node);
  }

  visitText(text: html.Text, context: I18nMessageVisitorContext): i18n.Node {
    const node = this._visitTextWithInterpolation(text.value, text.sourceSpan!, context);
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
      context.placeholderToContent[expPh] = icu.switchValue;
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

  private _visitTextWithInterpolation(
      text: string, sourceSpan: ParseSourceSpan, context: I18nMessageVisitorContext): i18n.Node {
    const splitInterpolation = this._expressionParser.splitInterpolation(
        text, sourceSpan.start.toString(), this._interpolationConfig);

    if (!splitInterpolation) {
      // No expression, return a single text
      return new i18n.Text(text, sourceSpan);
    }

    // Return a group of text + expressions
    const nodes: i18n.Node[] = [];
    const container = new i18n.Container(nodes, sourceSpan);
    const {start: sDelimiter, end: eDelimiter} = this._interpolationConfig;

    for (let i = 0; i < splitInterpolation.strings.length - 1; i++) {
      const expression = splitInterpolation.expressions[i];
      const baseName = _extractPlaceholderName(expression) || 'INTERPOLATION';
      const phName = context.placeholderRegistry.getPlaceholderName(baseName, expression);

      if (splitInterpolation.strings[i].length) {
        // No need to add empty strings
        nodes.push(new i18n.Text(splitInterpolation.strings[i], sourceSpan));
      }

      nodes.push(new i18n.Placeholder(expression, phName, sourceSpan));
      context.placeholderToContent[phName] = sDelimiter + expression + eDelimiter;
    }

    // The last index contains no expression
    const lastStringIdx = splitInterpolation.strings.length - 1;
    if (splitInterpolation.strings[lastStringIdx].length) {
      nodes.push(new i18n.Text(splitInterpolation.strings[lastStringIdx], sourceSpan));
    }
    return container;
  }
}

const _CUSTOM_PH_EXP =
    /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*("|')([\s\S]*?)\1[\s\S]*\)/g;

function _extractPlaceholderName(input: string): string {
  return input.split(_CUSTOM_PH_EXP)[2];
}
