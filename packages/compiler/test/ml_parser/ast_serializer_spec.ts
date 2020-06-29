/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {serializeNodes} from './util/util';

{
  describe('Node serializer', () => {
    let parser: HtmlParser;

    beforeEach(() => {
      parser = new HtmlParser();
    });

    it('should support element', () => {
      const html = '<p></p>';
      const ast = parser.parse(html, 'url');
      expect(serializeNodes(ast.rootNodes)).toEqual([html]);
    });

    it('should support attributes', () => {
      const html = '<p k="value"></p>';
      const ast = parser.parse(html, 'url');
      expect(serializeNodes(ast.rootNodes)).toEqual([html]);
    });

    it('should support text', () => {
      const html = 'some text';
      const ast = parser.parse(html, 'url');
      expect(serializeNodes(ast.rootNodes)).toEqual([html]);
    });

    it('should support expansion', () => {
      const html = '{number, plural, =0 {none} =1 {one} other {many}}';
      const ast = parser.parse(html, 'url', {tokenizeExpansionForms: true});
      expect(serializeNodes(ast.rootNodes)).toEqual([html]);
    });

    it('should support comment', () => {
      const html = '<!--comment-->';
      const ast = parser.parse(html, 'url', {tokenizeExpansionForms: true});
      expect(serializeNodes(ast.rootNodes)).toEqual([html]);
    });

    it('should support nesting', () => {
      const html = `<div i18n="meaning|desc">
        <span>{{ interpolation }}</span>
        <!--comment-->
        <p expansion="true">
          {number, plural, =0 {{sex, select, other {<b>?</b>}}}}
        </p>
      </div>`;
      const ast = parser.parse(html, 'url', {tokenizeExpansionForms: true});
      expect(serializeNodes(ast.rootNodes)).toEqual([html]);
    });
  });
}
