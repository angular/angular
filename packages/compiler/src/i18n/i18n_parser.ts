/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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

/**
 * Returns a function converting html nodes to an i18n Message given an interpolationConfig
 */
export function createI18nMessageFactory(interpolationConfig: InterpolationConfig): (
    nodes: html.Node[], meaning: string, description: string, id: string) => i18n.Message {
  const visitor = new _I18nVisitor(_expParser, interpolationConfig);

  return (nodes: html.Node[], meaning: string, description: string, id: string) =>
             visitor.toI18nMessage(nodes, meaning, description, id);
}

class _I18nVisitor implements html.Visitor {
  private _isIcu: boolean;
  private _icuDepth: number;
  private _placeholderRegistry: PlaceholderRegistry;
  private _placeholderToContent: {[phName: string]: string};
  private _placeholderToMessage: {[phName: string]: i18n.Message};

  constructor(
      private _expressionParser: ExpressionParser,
      private _interpolationConfig: InterpolationConfig) {}

  public toI18nMessage(nodes: html.Node[], meaning: string, description: string, id: string):
      i18n.Message {
    this._isIcu = nodes.length == 1 && nodes[0] instanceof html.Expansion;
    this._icuDepth = 0;
    this._placeholderRegistry = new PlaceholderRegistry();
    this._placeholderToContent = {};
    this._placeholderToMessage = {};

    const i18nodes: i18n.Node[] = html.visitAll(this, nodes, {});

    return new i18n.Message(
        i18nodes, this._placeholderToContent, this._placeholderToMessage, meaning, description, id);
  }

  visitElement(el: html.Element, context: any): i18n.Node {
    const children = html.visitAll(this, el.children);
    const attrs: {[k: string]: string} = {};
    el.attrs.forEach(attr => {
      // Do not visit the attributes, translatable ones are top-level ASTs
      attrs[attr.name] = attr.value;
    });

    const isVoid: boolean = getHtmlTagDefinition(el.name).isVoid;
    const startPhName =
        this._placeholderRegistry.getStartTagPlaceholderName(el.name, attrs, isVoid);
    this._placeholderToContent[startPhName] = el.sourceSpan !.toString();

    let closePhName = '';

    if (!isVoid) {
      closePhName = this._placeholderRegistry.getCloseTagPlaceholderName(el.name);
      this._placeholderToContent[closePhName] = `</${el.name}>`;
    }

    return new i18n.TagPlaceholder(
        el.name, attrs, startPhName, closePhName, children, isVoid, el.sourceSpan !);
  }

  visitAttribute(attribute: html.Attribute, context: any): i18n.Node {
    return this._visitTextWithInterpolation(attribute.value, attribute.sourceSpan);
  }

  visitText(text: html.Text, context: any): i18n.Node {
    return this._visitTextWithInterpolation(text.value, text.sourceSpan !);
  }

  visitComment(comment: html.Comment, context: any): i18n.Node|null { return null; }

  visitExpansion(icu: html.Expansion, context: any): i18n.Node {
    this._icuDepth++;
    const i18nIcuCases: {[k: string]: i18n.Node} = {};
    const i18nIcu = new i18n.Icu(icu.switchValue, icu.type, i18nIcuCases, icu.sourceSpan);
    icu.cases.forEach((caze): void => {
      i18nIcuCases[caze.value] = new i18n.Container(
          caze.expression.map((node) => node.visit(this, {})), caze.expSourceSpan);
    });
    this._icuDepth--;

    if (this._isIcu || this._icuDepth > 0) {
      // Returns an ICU node when:
      // - the message (vs a part of the message) is an ICU message, or
      // - the ICU message is nested.
      const expPh = this._placeholderRegistry.getUniquePlaceholder(`VAR_${icu.type}`);
      i18nIcu.expressionPlaceholder = expPh;
      this._placeholderToContent[expPh] = icu.switchValue;

      return i18nIcu;
    }

    // Else returns a placeholder
    // ICU placeholders should not be replaced with their original content but with the their
    // translations. We need to create a new visitor (they are not re-entrant) to compute the
    // message id.
    // TODO(vicb): add a html.Node -> i18n.Message cache to avoid having to re-create the msg
    const phName = this._placeholderRegistry.getPlaceholderName('ICU', icu.sourceSpan.toString());
    const visitor = new _I18nVisitor(this._expressionParser, this._interpolationConfig);
    this._placeholderToMessage[phName] = visitor.toI18nMessage([icu], '', '', '');
    return new i18n.IcuPlaceholder(i18nIcu, phName, icu.sourceSpan);
  }

  visitExpansionCase(icuCase: html.ExpansionCase, context: any): i18n.Node {
    throw new Error('Unreachable code');
  }

  private _visitTextWithInterpolation(text: string, sourceSpan: ParseSourceSpan): i18n.Node {
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
      const phName = this._placeholderRegistry.getPlaceholderName(baseName, expression);

      if (splitInterpolation.strings[i].length) {
        // No need to add empty strings
        nodes.push(new i18n.Text(splitInterpolation.strings[i], sourceSpan));
      }

      nodes.push(new i18n.Placeholder(expression, phName, sourceSpan));
      this._placeholderToContent[phName] = sDelimiter + expression + eDelimiter;
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
