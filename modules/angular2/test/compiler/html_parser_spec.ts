import {ddescribe, describe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {
  HtmlAst,
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  htmlVisitAll
} from 'angular2/src/compiler/html_ast';

export function main() {
  describe('DomParser', () => {
    var parser: HtmlParser;
    beforeEach(() => { parser = new HtmlParser(); });

    describe('text nodes', () => {
      it('should parse root level text nodes', () => {
        expect(humanizeDom(parser.parse('a', 'TestComp')))
            .toEqual([[HtmlTextAst, 'a', 'TestComp > #text(a):nth-child(0)']]);
      });

      it('should parse text nodes inside regular elements', () => {
        expect(humanizeDom(parser.parse('<div>a</div>', 'TestComp')))
            .toEqual([
              [HtmlElementAst, 'div', 'TestComp > div:nth-child(0)'],
              [HtmlTextAst, 'a', 'TestComp > div:nth-child(0) > #text(a):nth-child(0)']
            ]);
      });

      it('should parse text nodes inside template elements', () => {
        expect(humanizeDom(parser.parse('<template>a</template>', 'TestComp')))
            .toEqual([
              [HtmlElementAst, 'template', 'TestComp > template:nth-child(0)'],
              [HtmlTextAst, 'a', 'TestComp > template:nth-child(0) > #text(a):nth-child(0)']
            ]);
      });
    });

    describe('elements', () => {
      it('should parse root level elements', () => {
        expect(humanizeDom(parser.parse('<div></div>', 'TestComp')))
            .toEqual([[HtmlElementAst, 'div', 'TestComp > div:nth-child(0)']]);
      });

      it('should parse elements inside of regular elements', () => {
        expect(humanizeDom(parser.parse('<div><span></span></div>', 'TestComp')))
            .toEqual([
              [HtmlElementAst, 'div', 'TestComp > div:nth-child(0)'],
              [HtmlElementAst, 'span', 'TestComp > div:nth-child(0) > span:nth-child(0)']
            ]);
      });

      it('should parse elements inside of template elements', () => {
        expect(humanizeDom(parser.parse('<template><span></span></template>', 'TestComp')))
            .toEqual([
              [HtmlElementAst, 'template', 'TestComp > template:nth-child(0)'],
              [HtmlElementAst, 'span', 'TestComp > template:nth-child(0) > span:nth-child(0)']
            ]);
      });
    });

    describe('attributes', () => {
      it('should parse attributes on regular elements', () => {
        expect(humanizeDom(parser.parse('<div k="v"></div>', 'TestComp')))
            .toEqual([
              [HtmlElementAst, 'div', 'TestComp > div:nth-child(0)'],
              [HtmlAttrAst, 'k', 'v', 'TestComp > div:nth-child(0)[k=v]']
            ]);
      });

      it('should parse attributes on template elements', () => {
        expect(humanizeDom(parser.parse('<template k="v"></template>', 'TestComp')))
            .toEqual([
              [HtmlElementAst, 'template', 'TestComp > template:nth-child(0)'],
              [HtmlAttrAst, 'k', 'v', 'TestComp > template:nth-child(0)[k=v]']
            ]);
      });
    });

    describe('ng-non-bindable', () => {
      it('should ignore text nodes and elements inside of elements with ng-non-bindable', () => {
        expect(
            humanizeDom(parser.parse('<div ng-non-bindable>hello<span></span></div>', 'TestComp')))
            .toEqual([
              [HtmlElementAst, 'div', 'TestComp > div:nth-child(0)'],
              [
                HtmlAttrAst,
                'ng-non-bindable',
                '',
                'TestComp > div:nth-child(0)[ng-non-bindable=]'
              ]
            ]);
      });
    });
  });
}

export function humanizeDom(asts: HtmlAst[]): any[] {
  var humanizer = new Humanizer();
  htmlVisitAll(humanizer, asts);
  return humanizer.result;
}

class Humanizer implements HtmlAstVisitor {
  result: any[] = [];
  visitElement(ast: HtmlElementAst): any {
    this.result.push([HtmlElementAst, ast.name, ast.sourceInfo]);
    htmlVisitAll(this, ast.attrs);
    htmlVisitAll(this, ast.children);
    return null;
  }
  visitAttr(ast: HtmlAttrAst): any {
    this.result.push([HtmlAttrAst, ast.name, ast.value, ast.sourceInfo]);
    return null;
  }
  visitText(ast: HtmlTextAst): any {
    this.result.push([HtmlTextAst, ast.value, ast.sourceInfo]);
    return null;
  }
}