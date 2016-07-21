/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Catalog} from '@angular/compiler/src/i18n/catalog';
import {XmbSerializer} from '@angular/compiler/src/i18n/serializers/xmb';
import {beforeEach, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';

import {HtmlParser} from '../../../src/html_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/html_parser/interpolation_config';


export function main(): void {
  ddescribe('XMB serializer', () => {
    const HTML = `
<p>not translatable</p>
<p i18n>translatable element <b>with placeholders</b> {{ interpolation}}</p>
<!-- i18n -->{ count, plural, =0 {<p>test</p>}}<!-- /i18n -->
<p i18n="m|d">foo</p>
<p i18n>{ count, plural, =0 { { sex, gender, other {<p>deeply nested</p>}} }}</p>`;

    const XMB = `<? xml version="1.0" encoding="UTF-8" ?>
<messagebundle>
  <msg id="834fa53b">translatable element <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>with placeholders<ph name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> <ph name="INTERPOLATION"/></msg>
  <msg id="7a2843db">{ count, plural, =0 {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>test<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>}}</msg>
  <msg id="b45e58a5" desc="d" meaning="m">foo</msg>
  <msg id="18ea85bc">{ count, plural, =0 {{ sex, gender, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>}} }}</msg>
</messagebundle>`;

    it('should write a valid xmb file', () => { expect(toXmb(HTML)).toEqual(XMB); });

    it('should throw when trying to load an xmb file', () => {
      expect(() => {
        const serializer = new XmbSerializer();
        serializer.load(XMB);
      }).toThrow();
    });
  });
}

function toXmb(html: string): string {
  let catalog = new Catalog(new HtmlParser, [], {});
  const serializer = new XmbSerializer();

  catalog.updateFromTemplate(html, '', DEFAULT_INTERPOLATION_CONFIG);

  return catalog.write(serializer);
}

// <? xml version="1.0" encoding="UTF-8" ?><messagebundle><message id="834fa53b">translatable
// element <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>with placeholders<ph
// name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> <ph name="INTERPOLATION"/></message><message
// id="7a2843db">{ count, plural, =0 {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>test<ph
// name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>}}</message><message id="b45e58a5" description="d"
// meaning="m">foo</message><message id="18ea85bc">{ count, plural, =0 {{ sex, gender, other {<ph
// name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply nested<ph
// name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>}} }}</message></messagebundle>
// <? xml version="1.0" encoding="UTF-8" ?><messagebundle><message id="834fa53b">translatable
// element <ph name="START_BOLD_TEXT"><ex>&lt;b&gt;</ex></ph>with placeholders<ph
// name="CLOSE_BOLD_TEXT"><ex>&lt;/b&gt;</ex></ph> <ph name="INTERPOLATION"/></message><message
// id="7a2843db">{ count, plural, =0 {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>test<ph
// name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>}}</message><message id="18ea85bc">{ count,
// plural, =0 {{ sex, gender, other {<ph name="START_PARAGRAPH"><ex>&lt;p&gt;</ex></ph>deeply
// nested<ph name="CLOSE_PARAGRAPH"><ex>&lt;/p&gt;</ex></ph>}} }}</message><message id="b45e58a5"
// description="d" meaning="m">foo</message></messagebundle>