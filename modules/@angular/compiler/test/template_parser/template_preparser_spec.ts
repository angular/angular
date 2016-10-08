/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {beforeEach, describe, expect, inject, it} from '../../../core/testing/testing_internal';
import {Element} from '../../src/ml_parser/ast';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {PreparsedElement, PreparsedElementType, preparseElement} from '../../src/template_parser/template_preparser';

// see https://html.spec.whatwg.org/multipage/scripting.html#javascript-mime-type
const JS_MIME_TYPES = [
  'application/ecmascript',
  'application/javascript',
  'application/x-ecmascript',
  'application/x-javascript',
  'text/ecmascript',
  'text/javascript',
  'text/javascript1.0',
  'text/javascript1.1',
  'text/javascript1.2',
  'text/javascript1.3',
  'text/javascript1.4',
  'text/javascript1.5',
  'text/jscript',
  'text/livescript',
  'text/x-ecmascript',
  'text/x-javascript',
];

export function main() {
  describe('preparseElement', () => {
    let htmlParser: HtmlParser;

    beforeEach(inject([HtmlParser], (_htmlParser: HtmlParser) => { htmlParser = _htmlParser; }));

    function preparse(html: string): PreparsedElement {
      return preparseElement(htmlParser.parse(html, 'TestComp').rootNodes[0] as Element);
    }

    it('should detect javascript elements', () => {
      expect(preparse('<script>').type).toBe(PreparsedElementType.JAVASCRIPT);
      JS_MIME_TYPES.forEach(type => {
        expect(preparse(`<script type="${type}">`).type).toBe(PreparsedElementType.JAVASCRIPT);
      });
      expect(preparse('<script type="application/ld+json">').type).toBe(PreparsedElementType.OTHER);
    });

    it('should detect style elements',
       () => { expect(preparse('<style>').type).toBe(PreparsedElementType.STYLE); });

    it('should detect stylesheet elements', () => {
      expect(preparse('<link rel="stylesheet">').type).toBe(PreparsedElementType.STYLESHEET);
      expect(preparse('<link rel="stylesheet" href="someUrl">').hrefAttr).toEqual('someUrl');
      expect(preparse('<link rel="someRel">').type).toBe(PreparsedElementType.OTHER);
    });

    it('should detect ng-content elements',
       () => { expect(preparse('<ng-content>').type).toBe(PreparsedElementType.NG_CONTENT); });

    it('should normalize ng-content.select attribute', () => {
      expect(preparse('<ng-content>').selectAttr).toEqual('*');
      expect(preparse('<ng-content select>').selectAttr).toEqual('*');
      expect(preparse('<ng-content select="*">').selectAttr).toEqual('*');
    });

    it('should extract ngProjectAs value', () => {
      expect(preparse('<p ngProjectAs="el[attr].class"></p>').projectAs).toEqual('el[attr].class');
    });
  });
}
