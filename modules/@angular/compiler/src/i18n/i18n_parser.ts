/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { extractAstMessages} from './extractor';
import * as hAst from '../html_ast';
import * as i18nAst from './i18n_ast';
import {Parser as ExpressionParser} from '../expression_parser/parser';
import {Lexer as ExpressionLexer} from '../expression_parser/lexer';
import {ParseSourceSpan} from "../parse_util";
import {HtmlAst} from "../html_ast";
import {extractPlaceholderName} from "@angular/compiler/src/i18n/shared";

export class Message {
  constructor(public nodes: i18nAst.I18nNode[], public meaning: string, public description: string) {}
}

// TODO: should get the interpolation config
export function extractI18nMessages(
  sourceAst: HtmlAst[], implicitTags: string[],
  implicitAttrs: {[k: string]: string[]}): Message[] {
    const extractionResult = extractAstMessages(sourceAst, implicitTags, implicitAttrs);

    if (extractionResult.errors.length) {
      return[];
    }

    const visitor = new _I18nVisitor(new ExpressionParser(new ExpressionLexer()));

    return extractionResult.messages.map((msg): Message => {
      return new Message(visitor.convertToI18nAst(msg.nodes), msg.meaning, msg.description);
    });
}

class _I18nVisitor implements hAst.HtmlAstVisitor {
  private _isIcu: boolean;
  private _icuDepth: number;

  constructor(private _expressionParser: ExpressionParser) {}

  visitElement(el:hAst.HtmlElementAst, context:any):i18nAst.I18nNode {
    const children = hAst.htmlVisitAll(this, el.children);
    const attrs: {[k: string]: string} = {};
    el.attrs.forEach(attr => {
      // Do not visit the attributes, translatable ones are top-level ASTs
      attrs[attr.name] = attr.value;
    });
    return new i18nAst.TagPlaceholder(el.name, attrs, children, el.sourceSpan);
  }

  visitAttr(attr:hAst.HtmlAttrAst, context:any):i18nAst.I18nNode {
    return this._visitTextWithInterpolation(attr.value, attr.sourceSpan);
  }

  visitText(text:hAst.HtmlTextAst, context:any):i18nAst.I18nNode {
    return this._visitTextWithInterpolation(text.value, text.sourceSpan);
  }

  visitComment(comment:hAst.HtmlCommentAst, context:any):i18nAst.I18nNode {
    return null;
  }

  visitExpansion(icu:hAst.HtmlExpansionAst, context:any):i18nAst.I18nNode {
    this._icuDepth++;
    const i18nIcuCases: {[k: string]: i18nAst.I18nNode} = {};
    const i18nIcu = new i18nAst.Icu(icu.switchValue, icu.type, i18nIcuCases, icu.sourceSpan);
    icu.cases.forEach((caze): void => {
      i18nIcuCases[caze.value] = new i18nAst.Container(caze.expression.map((hAst) => hAst.visit(this, {})), caze.expSourceSpan);
     });
    this._icuDepth--;

    if (this._isIcu || this._icuDepth > 0) {
      // If the message (vs a part of the message) is an ICU message return its
      return i18nIcu;
    }

    // else returns a placeholder
    return new i18nAst.IcuPlaceholder(i18nIcu, 'icu', icu.sourceSpan);
  }

  visitExpansionCase(icuCase:hAst.HtmlExpansionCaseAst, context:any):i18nAst.I18nNode {
    throw new Error('Unreachable code');
  }

  public convertToI18nAst(htmlAsts: hAst.HtmlAst[]): i18nAst.I18nNode[] {
    this._isIcu = htmlAsts.length == 1 && htmlAsts[0] instanceof hAst.HtmlExpansionAst;
    this._icuDepth = 0;
    return hAst.htmlVisitAll(this, htmlAsts, {});
  }

  private _visitTextWithInterpolation(text: string, sourceSpan: ParseSourceSpan): i18nAst.I18nNode {
    const splitInterpolation = this._expressionParser.splitInterpolation(text, sourceSpan.start.toString());

    if (!splitInterpolation) {
      // No expression, return a single text
      return new i18nAst.Text(text, sourceSpan);
    }

    // Return a group of text + expressions
    const nodes: i18nAst.I18nNode[] = [];
    const container = new i18nAst.Container(nodes, sourceSpan);

    for (let i = 0; i < splitInterpolation.strings.length - 1; i++) {
      const expression = splitInterpolation.expressions[i];
      const phName = extractPlaceholderName(expression);
      nodes.push(
        new i18nAst.Text(splitInterpolation.strings[i], sourceSpan),
        new i18nAst.Placeholder(expression, phName, sourceSpan)
      )
    }

    // The last index contains no expression
    const lastStringIdx = splitInterpolation.strings.length - 1;
    nodes.push(new i18nAst.Text(splitInterpolation.strings[lastStringIdx], sourceSpan));

    return container;
  }
}

