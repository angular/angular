import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/testing_internal';


import {HtmlParser, HtmlParseTreeResult} from 'angular2/src/compiler/html_parser';
import {
  HtmlAst,
  HtmlAstVisitor,
  HtmlElementAst,
  HtmlAttrAst,
  HtmlTextAst,
  htmlVisitAll
} from 'angular2/src/compiler/html_ast';

export function main() {
  describe('HtmlParser', () => {
    var parser: HtmlParser;
    beforeEach(() => { parser = new HtmlParser(); });

    // TODO: add more test cases
    // TODO: separate tests for source spans from tests for tree parsing
    // TODO: find a better way to assert the tree structure!
    // -> maybe with arrays and object hashes!!

    describe('parse', () => {
      describe('text nodes', () => {
        it('should parse root level text nodes', () => {
          expect(humanizeDom(parser.parse('a', 'TestComp'))).toEqual([[HtmlTextAst, 'a']]);
        });

        it('should parse text nodes inside regular elements', () => {
          expect(humanizeDom(parser.parse('<div>a</div>', 'TestComp')))
              .toEqual([[HtmlElementAst, 'div'], [HtmlTextAst, 'a']]);
        });

        it('should parse text nodes inside template elements', () => {
          expect(humanizeDom(parser.parse('<template>a</template>', 'TestComp')))
              .toEqual([[HtmlElementAst, 'template'], [HtmlTextAst, 'a']]);
        });
      });

      describe('elements', () => {
        it('should parse root level elements', () => {
          expect(humanizeDom(parser.parse('<div></div>', 'TestComp')))
              .toEqual([[HtmlElementAst, 'div']]);
        });

        it('should parse elements inside of regular elements', () => {
          expect(humanizeDom(parser.parse('<div><span></span></div>', 'TestComp')))
              .toEqual([[HtmlElementAst, 'div'], [HtmlElementAst, 'span']]);
        });

        it('should parse elements inside of template elements', () => {
          expect(humanizeDom(parser.parse('<template><span></span></template>', 'TestComp')))
              .toEqual([[HtmlElementAst, 'template'], [HtmlElementAst, 'span']]);
        });
      });

      describe('attributes', () => {
        it('should parse attributes on regular elements', () => {
          expect(humanizeDom(parser.parse('<div kEy="v" key2=v2></div>', 'TestComp')))
              .toEqual([
                [HtmlElementAst, 'div'],
                [HtmlAttrAst, 'kEy', 'v'],
                [HtmlAttrAst, 'key2', 'v2'],
              ]);
        });

        it('should parse attributes without values', () => {
          expect(humanizeDom(parser.parse('<div k></div>', 'TestComp')))
              .toEqual([[HtmlElementAst, 'div'], [HtmlAttrAst, 'k', '']]);
        });

        it('should parse attributes on svg elements case sensitive', () => {
          expect(humanizeDom(parser.parse('<svg viewBox="0"></svg>', 'TestComp')))
              .toEqual([[HtmlElementAst, '@svg:svg'], [HtmlAttrAst, 'viewBox', '0']]);
        });

        it('should parse attributes on template elements', () => {
          expect(humanizeDom(parser.parse('<template k="v"></template>', 'TestComp')))
              .toEqual([[HtmlElementAst, 'template'], [HtmlAttrAst, 'k', 'v']]);
        });

      });
    });
  });
}

function humanizeDom(parseResult: HtmlParseTreeResult): any[] {
  // TODO: humanize errors as well!
  if (parseResult.errors.length > 0) {
    throw parseResult.errors;
  }
  var humanizer = new Humanizer();
  htmlVisitAll(humanizer, parseResult.rootNodes);
  return humanizer.result;
}

class Humanizer implements HtmlAstVisitor {
  result: any[] = [];

  visitElement(ast: HtmlElementAst, context: any): any {
    this.result.push([HtmlElementAst, ast.name]);
    htmlVisitAll(this, ast.attrs);
    htmlVisitAll(this, ast.children);
    return null;
  }

  visitAttr(ast: HtmlAttrAst, context: any): any {
    this.result.push([HtmlAttrAst, ast.name, ast.value]);
    return null;
  }

  visitText(ast: HtmlTextAst, context: any): any {
    this.result.push([HtmlTextAst, ast.value]);
    return null;
  }
}
