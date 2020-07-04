/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, describe, expect, inject, it} from '../../../core/testing/src/testing_internal';
import {Element} from '../../src/ml_parser/ast';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {PreparsedElement, PreparsedElementType, preparseElement} from '../../src/template_parser/template_preparser';

{
  describe('preparseElement', () => {
    let htmlParser: HtmlParser;
    beforeEach(inject([HtmlParser], (_htmlParser: HtmlParser) => {
      htmlParser = _htmlParser;
    }));

    function preparse(html: string): PreparsedElement {
      return preparseElement(htmlParser.parse(html, 'TestComp').rootNodes[0] as Element);
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

    it('should extract ngProjectAs value', () => {
      expect(preparse('<p ngProjectAs="el[attr].class"></p>').projectAs).toEqual('el[attr].class');
    });
  });
}
