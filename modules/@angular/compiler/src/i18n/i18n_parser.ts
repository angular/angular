/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Lexer as ExpressionLexer} from '../expression_parser/lexer';
import {Parser as ExpressionParser} from '../expression_parser/parser';
import * as hAst from '../html_ast';
import {getHtmlTagDefinition} from '../html_tags';
import {InterpolationConfig} from '../interpolation_config';
import {ParseSourceSpan} from '../parse_util';

import {extractAstMessages} from './extractor';
import * as i18nAst from './i18n_ast';
import {PlaceholderRegistry} from './serializers/util';
import {extractPlaceholderName} from './shared';

export function extractI18nMessages(
    sourceAst: hAst.HtmlAst[], interpolationConfig: InterpolationConfig, implicitTags: string[],
    implicitAttrs: {[k: string]: string[]}): i18nAst.Message[] {
  const extractionResult = extractAstMessages(sourceAst, implicitTags, implicitAttrs);

  if (extractionResult.errors.length) {
    return [];
  }

  const visitor =
      new _I18nVisitor(new ExpressionParser(new ExpressionLexer()), interpolationConfig);

  return extractionResult.messages.map((msg): i18nAst.Message => {
    return new i18nAst.Message(visitor.convertToI18nAst(msg.nodes), msg.meaning, msg.description);
  });
}

class _I18nVisitor implements hAst.HtmlAstVisitor {
  private _isIcu: boolean;
  private _icuDepth: number;
  private _placeholderRegistry: PlaceholderRegistry;

  constructor(
      private _expressionParser: ExpressionParser,
      private _interpolationConfig: InterpolationConfig) {}

  visitElement(el: hAst.HtmlElementAst, context: any): i18nAst.Node {
    const children = hAst.htmlVisitAll(this, el.children);
    const attrs: {[k: string]: string} = {};
    el.attrs.forEach(attr => {
      // Do not visit the attributes, translatable ones are top-level ASTs
      attrs[attr.name] = attr.value;
    });

    const isVoid: boolean = getHtmlTagDefinition(el.name).isVoid;
    const startPhName =
        this._placeholderRegistry.getStartTagPlaceholderName(el.name, attrs, isVoid);
    const closePhName = isVoid ? '' : this._placeholderRegistry.getCloseTagPlaceholderName(el.name);

    return new i18nAst.TagPlaceholder(
        el.name, attrs, startPhName, closePhName, children, isVoid, el.sourceSpan);
  }

  visitAttr(attr: hAst.HtmlAttrAst, context: any): i18nAst.Node {
    return this._visitTextWithInterpolation(attr.value, attr.sourceSpan);
  }

  visitText(text: hAst.HtmlTextAst, context: any): i18nAst.Node {
    return this._visitTextWithInterpolation(text.value, text.sourceSpan);
  }

  visitComment(comment: hAst.HtmlCommentAst, context: any): i18nAst.Node { return null; }

  visitExpansion(icu: hAst.HtmlExpansionAst, context: any): i18nAst.Node {
    this._icuDepth++;
    const i18nIcuCases: {[k: string]: i18nAst.Node} = {};
    const i18nIcu = new i18nAst.Icu(icu.switchValue, icu.type, i18nIcuCases, icu.sourceSpan);
    icu.cases.forEach((caze): void => {
      i18nIcuCases[caze.value] = new i18nAst.Container(
          caze.expression.map((hAst) => hAst.visit(this, {})), caze.expSourceSpan);
    });
    this._icuDepth--;

    if (this._isIcu || this._icuDepth > 0) {
      // If the message (vs a part of the message) is an ICU message return its
      return i18nIcu;
    }

    // else returns a placeholder
    const phName = this._placeholderRegistry.getPlaceholderName('ICU', icu.sourceSpan.toString());
    return new i18nAst.IcuPlaceholder(i18nIcu, phName, icu.sourceSpan);
  }

  visitExpansionCase(icuCase: hAst.HtmlExpansionCaseAst, context: any): i18nAst.Node {
    throw new Error('Unreachable code');
  }

  public convertToI18nAst(htmlAsts: hAst.HtmlAst[]): i18nAst.Node[] {
    this._isIcu = htmlAsts.length == 1 && htmlAsts[0] instanceof hAst.HtmlExpansionAst;
    this._icuDepth = 0;
    this._placeholderRegistry = new PlaceholderRegistry();

    return hAst.htmlVisitAll(this, htmlAsts, {});
  }

  private _visitTextWithInterpolation(text: string, sourceSpan: ParseSourceSpan): i18nAst.Node {
    const splitInterpolation = this._expressionParser.splitInterpolation(
        text, sourceSpan.start.toString(), this._interpolationConfig);

    if (!splitInterpolation) {
      // No expression, return a single text
      return new i18nAst.Text(text, sourceSpan);
    }

    // Return a group of text + expressions
    const nodes: i18nAst.Node[] = [];
    const container = new i18nAst.Container(nodes, sourceSpan);

    for (let i = 0; i < splitInterpolation.strings.length - 1; i++) {
      const expression = splitInterpolation.expressions[i];
      const baseName = extractPlaceholderName(expression) || 'INTERPOLATION';
      const phName = this._placeholderRegistry.getPlaceholderName(baseName, expression);

      if (splitInterpolation.strings[i].length) {
        nodes.push(new i18nAst.Text(splitInterpolation.strings[i], sourceSpan));
      }

      nodes.push(new i18nAst.Placeholder(expression, phName, sourceSpan));
    }

    // The last index contains no expression
    const lastStringIdx = splitInterpolation.strings.length - 1;
    if (splitInterpolation.strings[lastStringIdx].length) {
      nodes.push(new i18nAst.Text(splitInterpolation.strings[lastStringIdx], sourceSpan));
    }
    return container;
  }
}
