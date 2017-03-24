/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as html from '../../src/ml_parser/ast';
import {HtmlParser, ParseTreeResult, TreeError} from '../../src/ml_parser/html_parser';
import {TokenType} from '../../src/ml_parser/lexer';
import {ParseError} from '../../src/parse_util';

import {humanizeDom, humanizeDomSourceSpans, humanizeLineColumn} from './ast_spec_utils';

export function main() {
  describe('HtmlParser', () => {
    let parser: HtmlParser;

    beforeEach(() => { parser = new HtmlParser(); });

    describe('parse', () => {
      describe('text nodes', () => {
        it('should parse root level text nodes', () => {
          expect(humanizeDom(parser.parse('a', 'TestComp'))).toEqual([[html.Text, 'a', 0]]);
        });

        it('should parse text nodes inside regular elements', () => {
          expect(humanizeDom(parser.parse('<div>a</div>', 'TestComp'))).toEqual([
            [html.Element, 'div', 0], [html.Text, 'a', 1]
          ]);
        });

        it('should parse text nodes inside <ng-template> elements', () => {
          // deprecated in 4.0
          expect(humanizeDom(parser.parse('<template>a</template>', 'TestComp'))).toEqual([
            [html.Element, 'template', 0], [html.Text, 'a', 1]
          ]);
          expect(humanizeDom(parser.parse('<ng-template>a</ng-template>', 'TestComp'))).toEqual([
            [html.Element, 'ng-template', 0], [html.Text, 'a', 1]
          ]);
        });

        it('should parse CDATA', () => {
          expect(humanizeDom(parser.parse('<![CDATA[text]]>', 'TestComp'))).toEqual([
            [html.Text, 'text', 0]
          ]);
        });
      });

      describe('elements', () => {
        it('should parse root level elements', () => {
          expect(humanizeDom(parser.parse('<div></div>', 'TestComp'))).toEqual([
            [html.Element, 'div', 0]
          ]);
        });

        it('should parse elements inside of regular elements', () => {
          expect(humanizeDom(parser.parse('<div><span></span></div>', 'TestComp'))).toEqual([
            [html.Element, 'div', 0], [html.Element, 'span', 1]
          ]);
        });

        it('should parse elements inside  <ng-template> elements', () => {
          expect(humanizeDom(parser.parse('<template><span></span></template>', 'TestComp')))
              .toEqual([[html.Element, 'template', 0], [html.Element, 'span', 1]]);
          expect(humanizeDom(parser.parse('<ng-template><span></span></ng-template>', 'TestComp')))
              .toEqual([[html.Element, 'ng-template', 0], [html.Element, 'span', 1]]);
        });

        it('should support void elements', () => {
          expect(humanizeDom(parser.parse('<link rel="author license" href="/about">', 'TestComp')))
              .toEqual([
                [html.Element, 'link', 0],
                [html.Attribute, 'rel', 'author license'],
                [html.Attribute, 'href', '/about'],
              ]);
        });

        it('should not error on void elements from HTML5 spec',
           () => {  // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements without:
             // <base> - it can be present in head only
             // <meta> - it can be present in head only
             // <command> - obsolete
             // <keygen> - obsolete
             ['<map><area></map>', '<div><br></div>', '<colgroup><col></colgroup>',
              '<div><embed></div>', '<div><hr></div>', '<div><img></div>', '<div><input></div>',
              '<object><param>/<object>', '<audio><source></audio>', '<audio><track></audio>',
              '<p><wbr></p>',
             ].forEach((html) => { expect(parser.parse(html, 'TestComp').errors).toEqual([]); });
           });

        it('should close void elements on text nodes', () => {
          expect(humanizeDom(parser.parse('<p>before<br>after</p>', 'TestComp'))).toEqual([
            [html.Element, 'p', 0],
            [html.Text, 'before', 1],
            [html.Element, 'br', 1],
            [html.Text, 'after', 1],
          ]);
        });

        it('should support optional end tags', () => {
          expect(humanizeDom(parser.parse('<div><p>1<p>2</div>', 'TestComp'))).toEqual([
            [html.Element, 'div', 0],
            [html.Element, 'p', 1],
            [html.Text, '1', 2],
            [html.Element, 'p', 1],
            [html.Text, '2', 2],
          ]);
        });

        it('should support nested elements', () => {
          expect(humanizeDom(parser.parse('<ul><li><ul><li></li></ul></li></ul>', 'TestComp')))
              .toEqual([
                [html.Element, 'ul', 0],
                [html.Element, 'li', 1],
                [html.Element, 'ul', 2],
                [html.Element, 'li', 3],
              ]);
        });

        it('should add the requiredParent', () => {
          expect(
              humanizeDom(parser.parse(
                  '<table><thead><tr head></tr></thead><tr noparent></tr><tbody><tr body></tr></tbody><tfoot><tr foot></tr></tfoot></table>',
                  'TestComp')))
              .toEqual([
                [html.Element, 'table', 0],
                [html.Element, 'thead', 1],
                [html.Element, 'tr', 2],
                [html.Attribute, 'head', ''],
                [html.Element, 'tbody', 1],
                [html.Element, 'tr', 2],
                [html.Attribute, 'noparent', ''],
                [html.Element, 'tbody', 1],
                [html.Element, 'tr', 2],
                [html.Attribute, 'body', ''],
                [html.Element, 'tfoot', 1],
                [html.Element, 'tr', 2],
                [html.Attribute, 'foot', ''],
              ]);
        });

        it('should append the required parent considering ng-container', () => {
          expect(humanizeDom(parser.parse(
                     '<table><ng-container><tr></tr></ng-container></table>', 'TestComp')))
              .toEqual([
                [html.Element, 'table', 0],
                [html.Element, 'tbody', 1],
                [html.Element, 'ng-container', 2],
                [html.Element, 'tr', 3],
              ]);
        });

        it('should special case ng-container when adding a required parent', () => {
          expect(humanizeDom(parser.parse(
                     '<table><thead><ng-container><tr></tr></ng-container></thead></table>',
                     'TestComp')))
              .toEqual([
                [html.Element, 'table', 0],
                [html.Element, 'thead', 1],
                [html.Element, 'ng-container', 2],
                [html.Element, 'tr', 3],
              ]);
        });

        it('should not add the requiredParent when the parent is a <ng-template>', () => {
          expect(humanizeDom(parser.parse('<template><tr></tr></template>', 'TestComp'))).toEqual([
            [html.Element, 'template', 0],
            [html.Element, 'tr', 1],
          ]);
          expect(humanizeDom(parser.parse('<ng-template><tr></tr></ng-template>', 'TestComp')))
              .toEqual([
                [html.Element, 'ng-template', 0],
                [html.Element, 'tr', 1],
              ]);
        });

        // https://github.com/angular/angular/issues/5967
        it('should not add the requiredParent to a template root element', () => {
          expect(humanizeDom(parser.parse('<tr></tr>', 'TestComp'))).toEqual([
            [html.Element, 'tr', 0],
          ]);
        });

        it('should support explicit mamespace', () => {
          expect(humanizeDom(parser.parse('<myns:div></myns:div>', 'TestComp'))).toEqual([
            [html.Element, ':myns:div', 0]
          ]);
        });

        it('should support implicit mamespace', () => {
          expect(humanizeDom(parser.parse('<svg></svg>', 'TestComp'))).toEqual([
            [html.Element, ':svg:svg', 0]
          ]);
        });

        it('should propagate the namespace', () => {
          expect(humanizeDom(parser.parse('<myns:div><p></p></myns:div>', 'TestComp'))).toEqual([
            [html.Element, ':myns:div', 0],
            [html.Element, ':myns:p', 1],
          ]);
        });

        it('should match closing tags case sensitive', () => {
          const errors = parser.parse('<DiV><P></p></dIv>', 'TestComp').errors;
          expect(errors.length).toEqual(2);
          expect(humanizeErrors(errors)).toEqual([
            [
              'p',
              'Unexpected closing tag "p". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags',
              '0:8'
            ],
            [
              'dIv',
              'Unexpected closing tag "dIv". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags',
              '0:12'
            ],
          ]);
        });

        it('should support self closing void elements', () => {
          expect(humanizeDom(parser.parse('<input />', 'TestComp'))).toEqual([
            [html.Element, 'input', 0]
          ]);
        });

        it('should support self closing foreign elements', () => {
          expect(humanizeDom(parser.parse('<math />', 'TestComp'))).toEqual([
            [html.Element, ':math:math', 0]
          ]);
        });

        it('should ignore LF immediately after textarea, pre and listing', () => {
          expect(humanizeDom(parser.parse(
                     '<p>\n</p><textarea>\n</textarea><pre>\n\n</pre><listing>\n\n</listing>',
                     'TestComp')))
              .toEqual([
                [html.Element, 'p', 0],
                [html.Text, '\n', 1],
                [html.Element, 'textarea', 0],
                [html.Element, 'pre', 0],
                [html.Text, '\n', 1],
                [html.Element, 'listing', 0],
                [html.Text, '\n', 1],
              ]);
        });

      });

      describe('attributes', () => {
        it('should parse attributes on regular elements case sensitive', () => {
          expect(humanizeDom(parser.parse('<div kEy="v" key2=v2></div>', 'TestComp'))).toEqual([
            [html.Element, 'div', 0],
            [html.Attribute, 'kEy', 'v'],
            [html.Attribute, 'key2', 'v2'],
          ]);
        });

        it('should parse attributes without values', () => {
          expect(humanizeDom(parser.parse('<div k></div>', 'TestComp'))).toEqual([
            [html.Element, 'div', 0],
            [html.Attribute, 'k', ''],
          ]);
        });

        it('should parse attributes on svg elements case sensitive', () => {
          expect(humanizeDom(parser.parse('<svg viewBox="0"></svg>', 'TestComp'))).toEqual([
            [html.Element, ':svg:svg', 0],
            [html.Attribute, 'viewBox', '0'],
          ]);
        });

        it('should parse attributes on <ng-template> elements', () => {
          expect(humanizeDom(parser.parse('<template k="v"></template>', 'TestComp'))).toEqual([
            [html.Element, 'template', 0],
            [html.Attribute, 'k', 'v'],
          ]);
          expect(humanizeDom(parser.parse('<ng-template k="v"></ng-template>', 'TestComp')))
              .toEqual([
                [html.Element, 'ng-template', 0],
                [html.Attribute, 'k', 'v'],
              ]);
        });

        it('should support namespace', () => {
          expect(humanizeDom(parser.parse('<svg:use xlink:href="Port" />', 'TestComp'))).toEqual([
            [html.Element, ':svg:use', 0],
            [html.Attribute, ':xlink:href', 'Port'],
          ]);
        });
      });

      describe('comments', () => {
        it('should preserve comments', () => {
          expect(humanizeDom(parser.parse('<!-- comment --><div></div>', 'TestComp'))).toEqual([
            [html.Comment, 'comment', 0],
            [html.Element, 'div', 0],
          ]);
        });
      });

      describe('expansion forms', () => {
        it('should parse out expansion forms', () => {
          const parsed = parser.parse(
              `<div>before{messages.length, plural, =0 {You have <b>no</b> messages} =1 {One {{message}}}}after</div>`,
              'TestComp', true);

          expect(humanizeDom(parsed)).toEqual([
            [html.Element, 'div', 0],
            [html.Text, 'before', 1],
            [html.Expansion, 'messages.length', 'plural', 1],
            [html.ExpansionCase, '=0', 2],
            [html.ExpansionCase, '=1', 2],
            [html.Text, 'after', 1],
          ]);
          const cases = (<any>parsed.rootNodes[0]).children[1].cases;

          expect(humanizeDom(new ParseTreeResult(cases[0].expression, []))).toEqual([
            [html.Text, 'You have ', 0],
            [html.Element, 'b', 0],
            [html.Text, 'no', 1],
            [html.Text, ' messages', 0],
          ]);

          expect(humanizeDom(new ParseTreeResult(cases[1].expression, [
          ]))).toEqual([[html.Text, 'One {{message}}', 0]]);
        });

        it('should parse out expansion forms', () => {
          const parsed =
              parser.parse(`<div><span>{a, plural, =0 {b}}</span></div>`, 'TestComp', true);

          expect(humanizeDom(parsed)).toEqual([
            [html.Element, 'div', 0],
            [html.Element, 'span', 1],
            [html.Expansion, 'a', 'plural', 2],
            [html.ExpansionCase, '=0', 3],
          ]);
        });

        it('should parse out nested expansion forms', () => {
          const parsed = parser.parse(
              `{messages.length, plural, =0 { {p.gender, select, male {m}} }}`, 'TestComp', true);
          expect(humanizeDom(parsed)).toEqual([
            [html.Expansion, 'messages.length', 'plural', 0],
            [html.ExpansionCase, '=0', 1],
          ]);

          const firstCase = (<any>parsed.rootNodes[0]).cases[0];

          expect(humanizeDom(new ParseTreeResult(firstCase.expression, []))).toEqual([
            [html.Expansion, 'p.gender', 'select', 0],
            [html.ExpansionCase, 'male', 1],
            [html.Text, ' ', 0],
          ]);
        });

        it('should error when expansion form is not closed', () => {
          const p = parser.parse(`{messages.length, plural, =0 {one}`, 'TestComp', true);
          expect(humanizeErrors(p.errors)).toEqual([
            [null, 'Invalid ICU message. Missing \'}\'.', '0:34']
          ]);
        });

        it('should error when expansion case is not closed', () => {
          const p = parser.parse(`{messages.length, plural, =0 {one`, 'TestComp', true);
          expect(humanizeErrors(p.errors)).toEqual([
            [null, 'Invalid ICU message. Missing \'}\'.', '0:29']
          ]);
        });

        it('should error when invalid html in the case', () => {
          const p = parser.parse(`{messages.length, plural, =0 {<b/>}`, 'TestComp', true);
          expect(humanizeErrors(p.errors)).toEqual([
            ['b', 'Only void and foreign elements can be self closed "b"', '0:30']
          ]);
        });
      });

      describe('source spans', () => {
        it('should store the location', () => {
          expect(humanizeDomSourceSpans(parser.parse(
                     '<div [prop]="v1" (e)="do()" attr="v2" noValue>\na\n</div>', 'TestComp')))
              .toEqual([
                [html.Element, 'div', 0, '<div [prop]="v1" (e)="do()" attr="v2" noValue>'],
                [html.Attribute, '[prop]', 'v1', '[prop]="v1"'],
                [html.Attribute, '(e)', 'do()', '(e)="do()"'],
                [html.Attribute, 'attr', 'v2', 'attr="v2"'],
                [html.Attribute, 'noValue', '', 'noValue'],
                [html.Text, '\na\n', 1, '\na\n'],
              ]);
        });

        it('should set the start and end source spans', () => {
          const node = <html.Element>parser.parse('<div>a</div>', 'TestComp').rootNodes[0];

          expect(node.startSourceSpan !.start.offset).toEqual(0);
          expect(node.startSourceSpan !.end.offset).toEqual(5);

          expect(node.endSourceSpan !.start.offset).toEqual(6);
          expect(node.endSourceSpan !.end.offset).toEqual(12);
        });

        it('should support expansion form', () => {
          expect(humanizeDomSourceSpans(
                     parser.parse('<div>{count, plural, =0 {msg}}</div>', 'TestComp', true)))
              .toEqual([
                [html.Element, 'div', 0, '<div>'],
                [html.Expansion, 'count', 'plural', 1, '{count, plural, =0 {msg}}'],
                [html.ExpansionCase, '=0', 2, '=0 {msg}'],
              ]);
        });

        it('should not report a value span for an attribute without a value', () => {
          const ast = parser.parse('<div bar></div>', 'TestComp');
          expect((ast.rootNodes[0] as html.Element).attrs[0].valueSpan).toBeUndefined();
        });

        it('should report a value span for an attibute with a value', () => {
          const ast = parser.parse('<div bar="12"></div>', 'TestComp');
          const attr = (ast.rootNodes[0] as html.Element).attrs[0];
          expect(attr.valueSpan !.start.offset).toEqual(9);
          expect(attr.valueSpan !.end.offset).toEqual(13);
        });
      });

      describe('visitor', () => {
        it('should visit text nodes', () => {
          const result = humanizeDom(parser.parse('text', 'TestComp'));
          expect(result).toEqual([[html.Text, 'text', 0]]);
        });

        it('should visit element nodes', () => {
          const result = humanizeDom(parser.parse('<div></div>', 'TestComp'));
          expect(result).toEqual([[html.Element, 'div', 0]]);
        });

        it('should visit attribute nodes', () => {
          const result = humanizeDom(parser.parse('<div id="foo"></div>', 'TestComp'));
          expect(result).toContain([html.Attribute, 'id', 'foo']);
        });

        it('should visit all nodes', () => {
          const result =
              parser.parse('<div id="foo"><span id="bar">a</span><span>b</span></div>', 'TestComp');
          const accumulator: html.Node[] = [];
          const visitor = new class {
            visit(node: html.Node, context: any) { accumulator.push(node); }
            visitElement(element: html.Element, context: any): any {
              html.visitAll(this, element.attrs);
              html.visitAll(this, element.children);
            }
            visitAttribute(attribute: html.Attribute, context: any): any {}
            visitText(text: html.Text, context: any): any {}
            visitComment(comment: html.Comment, context: any): any {}
            visitExpansion(expansion: html.Expansion, context: any): any {
              html.visitAll(this, expansion.cases);
            }
            visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {}
          };

          html.visitAll(visitor, result.rootNodes);
          expect(accumulator.map(n => n.constructor)).toEqual([
            html.Element, html.Attribute, html.Element, html.Attribute, html.Text, html.Element,
            html.Text
          ]);
        });

        it('should skip typed visit if visit() returns a truthy value', () => {
          const visitor = new class {
            visit(node: html.Node, context: any) { return true; }
            visitElement(element: html.Element, context: any): any { throw Error('Unexpected'); }
            visitAttribute(attribute: html.Attribute, context: any): any {
              throw Error('Unexpected');
            }
            visitText(text: html.Text, context: any): any { throw Error('Unexpected'); }
            visitComment(comment: html.Comment, context: any): any { throw Error('Unexpected'); }
            visitExpansion(expansion: html.Expansion, context: any): any {
              throw Error('Unexpected');
            }
            visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {
              throw Error('Unexpected');
            }
          };
          const result = parser.parse('<div id="foo"></div><div id="bar"></div>', 'TestComp');
          const traversal = html.visitAll(visitor, result.rootNodes);
          expect(traversal).toEqual([true, true]);
        });
      });

      describe('errors', () => {
        it('should report unexpected closing tags', () => {
          const errors = parser.parse('<div></p></div>', 'TestComp').errors;
          expect(errors.length).toEqual(1);
          expect(humanizeErrors(errors)).toEqual([[
            'p',
            'Unexpected closing tag "p". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags',
            '0:5'
          ]]);
        });

        it('should report subsequent open tags without proper close tag', () => {
          const errors = parser.parse('<div</div>', 'TestComp').errors;
          expect(errors.length).toEqual(1);
          expect(humanizeErrors(errors)).toEqual([[
            'div',
            'Unexpected closing tag "div". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags',
            '0:4'
          ]]);
        });

        it('should report closing tag for void elements', () => {
          const errors = parser.parse('<input></input>', 'TestComp').errors;
          expect(errors.length).toEqual(1);
          expect(humanizeErrors(errors)).toEqual([
            ['input', 'Void elements do not have end tags "input"', '0:7']
          ]);
        });

        it('should report self closing html element', () => {
          const errors = parser.parse('<p />', 'TestComp').errors;
          expect(errors.length).toEqual(1);
          expect(humanizeErrors(errors)).toEqual([
            ['p', 'Only void and foreign elements can be self closed "p"', '0:0']
          ]);
        });

        it('should report self closing custom element', () => {
          const errors = parser.parse('<my-cmp />', 'TestComp').errors;
          expect(errors.length).toEqual(1);
          expect(humanizeErrors(errors)).toEqual([
            ['my-cmp', 'Only void and foreign elements can be self closed "my-cmp"', '0:0']
          ]);
        });

        it('should also report lexer errors', () => {
          const errors = parser.parse('<!-err--><div></p></div>', 'TestComp').errors;
          expect(errors.length).toEqual(2);
          expect(humanizeErrors(errors)).toEqual([
            [TokenType.COMMENT_START, 'Unexpected character "e"', '0:3'],
            [
              'p',
              'Unexpected closing tag "p". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags',
              '0:14'
            ]
          ]);
        });
      });
    });
  });
}

export function humanizeErrors(errors: ParseError[]): any[] {
  return errors.map(e => {
    if (e instanceof TreeError) {
      // Parser errors
      return [<any>e.elementName, e.msg, humanizeLineColumn(e.span.start)];
    }
    // Tokenizer errors
    return [(<any>e).tokenType, e.msg, humanizeLineColumn(e.span.start)];
  });
}
