import { HtmlElementAst, HtmlAttrAst, htmlVisitAll } from 'angular2/src/compiler/html_ast';
import { BaseException } from 'angular2/src/facade/exceptions';
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
export function expandNodes(nodes) {
    let e = new _Expander();
    let n = htmlVisitAll(e, nodes);
    return new ExpansionResult(n, e.expanded);
}
export class ExpansionResult {
    constructor(nodes, expanded) {
        this.nodes = nodes;
        this.expanded = expanded;
    }
}
class _Expander {
    constructor() {
        this.expanded = false;
    }
    visitElement(ast, context) {
        return new HtmlElementAst(ast.name, ast.attrs, htmlVisitAll(this, ast.children), ast.sourceSpan, ast.startSourceSpan, ast.endSourceSpan);
    }
    visitAttr(ast, context) { return ast; }
    visitText(ast, context) { return ast; }
    visitComment(ast, context) { return ast; }
    visitExpansion(ast, context) {
        this.expanded = true;
        return ast.type == "plural" ? _expandPluralForm(ast) : _expandDefaultForm(ast);
    }
    visitExpansionCase(ast, context) {
        throw new BaseException("Should not be reached");
    }
}
function _expandPluralForm(ast) {
    let children = ast.cases.map(c => {
        let expansionResult = expandNodes(c.expression);
        let i18nAttrs = expansionResult.expanded ?
            [] :
            [new HtmlAttrAst("i18n", `${ast.type}_${c.value}`, c.valueSourceSpan)];
        return new HtmlElementAst(`template`, [
            new HtmlAttrAst("ngPluralCase", c.value, c.valueSourceSpan),
        ], [
            new HtmlElementAst(`li`, i18nAttrs, expansionResult.nodes, c.sourceSpan, c.sourceSpan, c.sourceSpan)
        ], c.sourceSpan, c.sourceSpan, c.sourceSpan);
    });
    let switchAttr = new HtmlAttrAst("[ngPlural]", ast.switchValue, ast.switchValueSourceSpan);
    return new HtmlElementAst("ul", [switchAttr], children, ast.sourceSpan, ast.sourceSpan, ast.sourceSpan);
}
function _expandDefaultForm(ast) {
    let children = ast.cases.map(c => {
        let expansionResult = expandNodes(c.expression);
        let i18nAttrs = expansionResult.expanded ?
            [] :
            [new HtmlAttrAst("i18n", `${ast.type}_${c.value}`, c.valueSourceSpan)];
        return new HtmlElementAst(`template`, [
            new HtmlAttrAst("ngSwitchWhen", c.value, c.valueSourceSpan),
        ], [
            new HtmlElementAst(`li`, i18nAttrs, expansionResult.nodes, c.sourceSpan, c.sourceSpan, c.sourceSpan)
        ], c.sourceSpan, c.sourceSpan, c.sourceSpan);
    });
    let switchAttr = new HtmlAttrAst("[ngSwitch]", ast.switchValue, ast.switchValueSourceSpan);
    return new HtmlElementAst("ul", [switchAttr], children, ast.sourceSpan, ast.sourceSpan, ast.sourceSpan);
}
