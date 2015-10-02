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

    describe('parse', () => {

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
    });

    describe('unparse', () => {
      it('should unparse text nodes',
         () => { expect(parser.unparse(parser.parse('a', null))).toEqual('a'); });

      it('should unparse elements',
         () => { expect(parser.unparse(parser.parse('<a></a>', null))).toEqual('<a></a>'); });

      it('should unparse attributes', () => {
        expect(parser.unparse(parser.parse('<div a b="c"></div>', null)))
            .toEqual('<div a="" b="c"></div>');
      });

      it('should unparse nested elements', () => {
        expect(parser.unparse(parser.parse('<div><a></a></div>', null)))
            .toEqual('<div><a></a></div>');
      });

      it('should unparse nested text nodes', () => {
        expect(parser.unparse(parser.parse('<div>a</div>', null))).toEqual('<div>a</div>');
      });
    });
  });
}

function humanizeDom(asts: HtmlAst[]): any[] {
  var humanizer = new Humanizer();
  htmlVisitAll(humanizer, asts);
  return humanizer.result;
}

class Humanizer implements HtmlAstVisitor {
  result: any[] = [];
  visitElement(ast: HtmlElementAst, context: any): any {
    this.result.push([HtmlElementAst, ast.name, ast.sourceInfo]);
    htmlVisitAll(this, ast.attrs);
    htmlVisitAll(this, ast.children);
    return null;
  }
  visitAttr(ast: HtmlAttrAst, context: any): any {
    this.result.push([HtmlAttrAst, ast.name, ast.value, ast.sourceInfo]);
    return null;
  }
  visitText(ast: HtmlTextAst, context: any): any {
    this.result.push([HtmlTextAst, ast.value, ast.sourceInfo]);
    return null;
  }
}