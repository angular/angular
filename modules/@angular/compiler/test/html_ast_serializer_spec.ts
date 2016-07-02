import {HtmlAst, HtmlAstVisitor, HtmlAttrAst, HtmlCommentAst, HtmlElementAst, HtmlExpansionAst, HtmlExpansionCaseAst, HtmlTextAst, htmlVisitAll} from '@angular/compiler/src/html_ast';
import {HtmlParser} from '@angular/compiler/src/html_parser';
import {beforeEach, ddescribe, describe, expect, it} from '@angular/core/testing/testing_internal';

export function main() {
  ddescribe('HtmlAst serilaizer', () => {
    var parser: HtmlParser;

    beforeEach(() => { parser = new HtmlParser(); });

    it('should support element', () => {
      const html = '<p></p>';
      const ast = parser.parse(html, 'url');
      expect(serializeHtmlAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support attributes', () => {
      const html = '<p k="value"></p>';
      const ast = parser.parse(html, 'url');
      expect(serializeHtmlAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support text', () => {
      const html = 'some text';
      const ast = parser.parse(html, 'url');
      expect(serializeHtmlAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support expansion', () => {
      const html = '{number, plural, =0 {none} =1 {one} other {many}}';
      const ast = parser.parse(html, 'url', true);
      expect(serializeHtmlAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support comment', () => {
      const html = '<!--comment-->';
      const ast = parser.parse(html, 'url', true);
      expect(serializeHtmlAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support nesting', () => {
      const html = `<div i18n="meaning|desc">
        <span>{{ interpolation }}</span>
        <!--comment-->
        <p expansion="true">
          {number, plural, =0 {{sex, gender, other {<b>?</b>}}}}
        </p>                            
      </div>`;
      const ast = parser.parse(html, 'url', true);
      expect(serializeHtmlAst(ast.rootNodes)).toEqual([html]);
    });
  });
}

class _SerializerVisitor implements HtmlAstVisitor {
  visitElement(ast: HtmlElementAst, context: any): any {
    return `<${ast.name}${this._visitAll(ast.attrs)}>${this._visitAll(ast.children)}</${ast.name}>`;
  }

  visitAttr(ast: HtmlAttrAst, context: any): any { return ` ${ast.name}="${ast.value}"`; }

  visitText(ast: HtmlTextAst, context: any): any { return ast.value; }

  visitComment(ast: HtmlCommentAst, context: any): any { return `<!--${ast.value}-->`; }

  visitExpansion(ast: HtmlExpansionAst, context: any): any {
    return `{${ast.switchValue}, ${ast.type},${this._visitAll(ast.cases)}}`;
  }

  visitExpansionCase(ast: HtmlExpansionCaseAst, context: any): any {
    return ` ${ast.value} {${this._visitAll(ast.expression)}}`;
  }

  private _visitAll(ast: HtmlAst[]) { return ast.map(a => a.visit(this, null)).join(''); }
}

const serializerVisitor = new _SerializerVisitor();

export function serializeHtmlAst(ast: HtmlAst[]) {
  return ast.map(a => a.visit(serializerVisitor, null));
}
