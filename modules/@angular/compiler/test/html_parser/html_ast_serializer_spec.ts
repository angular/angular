import {beforeEach, ddescribe, describe, expect, it} from '../../../core/testing/testing_internal';
import {HtmlAst, HtmlAstVisitor, HtmlAttrAst, HtmlCommentAst, HtmlElementAst, HtmlExpansionAst, HtmlExpansionCaseAst, HtmlTextAst, htmlVisitAll} from '../../src/html_parser/html_ast';
import {HtmlParser} from '../../src/html_parser/html_parser';

export function main() {
  describe('HtmlAst serilaizer', () => {
    var parser: HtmlParser;

    beforeEach(() => { parser = new HtmlParser(); });

    it('should support element', () => {
      const html = '<p></p>';
      const ast = parser.parse(html, 'url');
      expect(serializeAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support attributes', () => {
      const html = '<p k="value"></p>';
      const ast = parser.parse(html, 'url');
      expect(serializeAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support text', () => {
      const html = 'some text';
      const ast = parser.parse(html, 'url');
      expect(serializeAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support expansion', () => {
      const html = '{number, plural, =0 {none} =1 {one} other {many}}';
      const ast = parser.parse(html, 'url', true);
      expect(serializeAst(ast.rootNodes)).toEqual([html]);
    });

    it('should support comment', () => {
      const html = '<!--comment-->';
      const ast = parser.parse(html, 'url', true);
      expect(serializeAst(ast.rootNodes)).toEqual([html]);
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
      expect(serializeAst(ast.rootNodes)).toEqual([html]);
    });
  });
}

class _SerializerVisitor implements HtmlAstVisitor {
  visitElement(ast: HtmlElementAst, context: any): any {
    return `<${ast.name}${this._visitAll(ast.attrs, ' ')}>${this._visitAll(ast.children)}</${ast.name}>`;
  }

  visitAttr(ast: HtmlAttrAst, context: any): any { return `${ast.name}="${ast.value}"`; }

  visitText(ast: HtmlTextAst, context: any): any { return ast.value; }

  visitComment(ast: HtmlCommentAst, context: any): any { return `<!--${ast.value}-->`; }

  visitExpansion(ast: HtmlExpansionAst, context: any): any {
    return `{${ast.switchValue}, ${ast.type},${this._visitAll(ast.cases)}}`;
  }

  visitExpansionCase(ast: HtmlExpansionCaseAst, context: any): any {
    return ` ${ast.value} {${this._visitAll(ast.expression)}}`;
  }

  private _visitAll(ast: HtmlAst[], join: string = ''): string {
    if (ast.length == 0) {
      return '';
    }
    return join + ast.map(a => a.visit(this, null)).join(join);
  }
}

const serializerVisitor = new _SerializerVisitor();

export function serializeAst(ast: HtmlAst[]): string[] {
  return ast.map(a => a.visit(serializerVisitor, null));
}
