import {
  HtmlAst,
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  HtmlCommentAst,
  HtmlExpansionAst,
  HtmlExpansionCaseAst,
  htmlVisitAll
} from 'angular2/src/compiler/html_ast';

import {BaseException} from 'angular2/src/facade/exceptions';


/**
 * Expands special forms into elements.
 *
 * For example,
 *
 * ```
 * { messages.length, plural,
 *   =0 {zero}
 *   =1 {one}
 *   =other {more than one}
 * }
 * ```
 *
 * will be expanded into
 *
 * ```
 * <ul [ngPlural]="messages.length">
 *   <template [ngPluralCase]="0"><li i18n="plural_0">zero</li></template>
 *   <template [ngPluralCase]="1"><li i18n="plural_1">one</li></template>
 *   <template [ngPluralCase]="other"><li i18n="plural_other">more than one</li></template>
 * </ul>
 * ```
 */
export function expandNodes(nodes: HtmlAst[]): ExpansionResult {
  let e = new _Expander();
  let n = htmlVisitAll(e, nodes);
  return new ExpansionResult(n, e.expanded);
}

export class ExpansionResult {
  constructor(public nodes: HtmlAst[], public expanded: boolean) {}
}

class _Expander implements HtmlAstVisitor {
  expanded: boolean = false;
  constructor() {}

  visitElement(ast: HtmlElementAst, context: any): any {
    return new HtmlElementAst(ast.name, ast.attrs, htmlVisitAll(this, ast.children), ast.sourceSpan,
                              ast.startSourceSpan, ast.endSourceSpan);
  }

  visitAttr(ast: HtmlAttrAst, context: any): any { return ast; }

  visitText(ast: HtmlTextAst, context: any): any { return ast; }

  visitComment(ast: HtmlCommentAst, context: any): any { return ast; }

  visitExpansion(ast: HtmlExpansionAst, context: any): any {
    this.expanded = true;
    return ast.type == "plural" ? _expandPluralForm(ast) : _expandDefaultForm(ast);
  }

  visitExpansionCase(ast: HtmlExpansionCaseAst, context: any): any {
    throw new BaseException("Should not be reached");
  }
}

function _expandPluralForm(ast: HtmlExpansionAst): HtmlElementAst {
  let children = ast.cases.map(c => {
    let expansionResult = expandNodes(c.expression);
    let i18nAttrs = expansionResult.expanded ?
                        [] :
                        [new HtmlAttrAst("i18n", `${ast.type}_${c.value}`, c.valueSourceSpan)];

    return new HtmlElementAst(`template`,
                              [
                                new HtmlAttrAst("ngPluralCase", c.value, c.valueSourceSpan),
                              ],
                              [
                                new HtmlElementAst(`li`, i18nAttrs, expansionResult.nodes,
                                                   c.sourceSpan, c.sourceSpan, c.sourceSpan)
                              ],
                              c.sourceSpan, c.sourceSpan, c.sourceSpan);
  });
  let switchAttr = new HtmlAttrAst("[ngPlural]", ast.switchValue, ast.switchValueSourceSpan);
  return new HtmlElementAst("ul", [switchAttr], children, ast.sourceSpan, ast.sourceSpan,
                            ast.sourceSpan);
}

function _expandDefaultForm(ast: HtmlExpansionAst): HtmlElementAst {
  let children = ast.cases.map(c => {
    let expansionResult = expandNodes(c.expression);
    let i18nAttrs = expansionResult.expanded ?
                        [] :
                        [new HtmlAttrAst("i18n", `${ast.type}_${c.value}`, c.valueSourceSpan)];

    return new HtmlElementAst(`template`,
                              [
                                new HtmlAttrAst("ngSwitchWhen", c.value, c.valueSourceSpan),
                              ],
                              [
                                new HtmlElementAst(`li`, i18nAttrs, expansionResult.nodes,
                                                   c.sourceSpan, c.sourceSpan, c.sourceSpan)
                              ],
                              c.sourceSpan, c.sourceSpan, c.sourceSpan);
  });
  let switchAttr = new HtmlAttrAst("[ngSwitch]", ast.switchValue, ast.switchValueSourceSpan);
  return new HtmlElementAst("ul", [switchAttr], children, ast.sourceSpan, ast.sourceSpan,
                            ast.sourceSpan);
}