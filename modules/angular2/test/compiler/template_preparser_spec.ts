import {
  ddescribe,
  describe,
  xdescribe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach,
  AsyncTestCompleter,
  inject,
  beforeEachBindings
} from 'angular2/test_lib';

import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {
  preparseElement,
  PreparsedElementType,
  PreparsedElement
} from 'angular2/src/compiler/template_preparser';

export function main() {
  describe('preparseElement', () => {
    var htmlParser;
    beforeEach(inject([HtmlParser], (_htmlParser: HtmlParser) => { htmlParser = _htmlParser; }));

    function preparse(html: string): PreparsedElement {
      return preparseElement(htmlParser.parse(html, '')[0]);
    }

    it('should detect script elements', inject([HtmlParser], (htmlParser: HtmlParser) => {
         expect(preparse('<script>').type).toBe(PreparsedElementType.SCRIPT);
       }));

    it('should detect style elements', inject([HtmlParser], (htmlParser: HtmlParser) => {
         expect(preparse('<style>').type).toBe(PreparsedElementType.STYLE);
       }));

    it('should detect stylesheet elements', inject([HtmlParser], (htmlParser: HtmlParser) => {
         expect(preparse('<link rel="stylesheet">').type).toBe(PreparsedElementType.STYLESHEET);
         expect(preparse('<link rel="stylesheet" href="someUrl">').hrefAttr).toEqual('someUrl');
         expect(preparse('<link rel="someRel">').type).toBe(PreparsedElementType.OTHER);
       }));

    it('should detect ng-content elements', inject([HtmlParser], (htmlParser: HtmlParser) => {
         expect(preparse('<ng-content>').type).toBe(PreparsedElementType.NG_CONTENT);
       }));

    it('should normalize ng-content.select attribute',
       inject([HtmlParser], (htmlParser: HtmlParser) => {
         expect(preparse('<ng-content>').selectAttr).toEqual('*');
         expect(preparse('<ng-content select>').selectAttr).toEqual('*');
         expect(preparse('<ng-content select="*">').selectAttr).toEqual('*');
       }));

  });
}