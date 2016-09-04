/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ParseError, ParseSourceSpan} from '../parse_util';

import * as html from './ast';

// http://cldr.unicode.org/index/cldr-spec/plural-rules
const PLURAL_CASES: string[] = ['zero', 'one', 'two', 'few', 'many', 'other'];

/**
 * Expands special forms into elements.
 *
 * For example,
 *
 * ```
 * { messages.length, plural,
 *   =0 {zero}
 *   =1 {one}
 *   other {more than one}
 * }
 * ```
 *
 * will be expanded into
 *
 * ```
 * <ng-container [ngPlural]="messages.length">
 *   <template ngPluralCase="=0">zero</ng-container>
 *   <template ngPluralCase="=1">one</ng-container>
 *   <template ngPluralCase="other">more than one</ng-container>
 * </ng-container>
 * ```
 */
export function expandNodes(nodes: html.Node[]): ExpansionResult {
  const expander = new _Expander();
  return new ExpansionResult(html.visitAll(expander, nodes), expander.isExpanded, expander.errors);
}

export class ExpansionResult {
  constructor(public nodes: html.Node[], public expanded: boolean, public errors: ParseError[]) {}
}

export class ExpansionError extends ParseError {
  constructor(span: ParseSourceSpan, errorMsg: string) { super(span, errorMsg); }
}

/**
 * Expand expansion forms (plural, select) to directives
 *
 * @internal
 */
class _Expander implements html.Visitor {
  isExpanded: boolean = false;
  errors: ParseError[] = [];

  visitElement(element: html.Element, context: any): any {
    return new html.Element(
        element.name, element.attrs, html.visitAll(this, element.children), element.sourceSpan,
        element.startSourceSpan, element.endSourceSpan);
  }

  visitAttribute(attribute: html.Attribute, context: any): any { return attribute; }

  visitText(text: html.Text, context: any): any { return text; }

  visitComment(comment: html.Comment, context: any): any { return comment; }

  visitExpansion(icu: html.Expansion, context: any): any {
    this.isExpanded = true;
    return icu.type == 'plural' ? _expandPluralForm(icu, this.errors) :
                                  _expandDefaultForm(icu, this.errors);
  }

  visitExpansionCase(icuCase: html.ExpansionCase, context: any): any {
    throw new Error('Should not be reached');
  }
}

function _expandPluralForm(ast: html.Expansion, errors: ParseError[]): html.Element {
  const children = ast.cases.map(c => {
    if (PLURAL_CASES.indexOf(c.value) == -1 && !c.value.match(/^=\d+$/)) {
      errors.push(new ExpansionError(
          c.valueSourceSpan,
          `Plural cases should be "=<number>" or one of ${PLURAL_CASES.join(", ")}`));
    }

    const expansionResult = expandNodes(c.expression);
    errors.push(...expansionResult.errors);

    return new html.Element(
        `template`, [new html.Attribute('ngPluralCase', `${c.value}`, c.valueSourceSpan)],
        expansionResult.nodes, c.sourceSpan, c.sourceSpan, c.sourceSpan);
  });
  const switchAttr = new html.Attribute('[ngPlural]', ast.switchValue, ast.switchValueSourceSpan);
  return new html.Element(
      'ng-container', [switchAttr], children, ast.sourceSpan, ast.sourceSpan, ast.sourceSpan);
}

function _expandDefaultForm(ast: html.Expansion, errors: ParseError[]): html.Element {
  let children = ast.cases.map(c => {
    const expansionResult = expandNodes(c.expression);
    errors.push(...expansionResult.errors);

    return new html.Element(
        `template`, [new html.Attribute('ngSwitchCase', `${c.value}`, c.valueSourceSpan)],
        expansionResult.nodes, c.sourceSpan, c.sourceSpan, c.sourceSpan);
  });
  const switchAttr = new html.Attribute('[ngSwitch]', ast.switchValue, ast.switchValueSourceSpan);
  return new html.Element(
      'ng-container', [switchAttr], children, ast.sourceSpan, ast.sourceSpan, ast.sourceSpan);
}
