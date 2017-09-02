/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MessageBundle} from '@angular/compiler/src/i18n/message_bundle';
import {IdToRefMapping} from '@angular/compiler/src/i18n/serializers/idref_mapping';
import {Xmb} from '@angular/compiler/src/i18n/serializers/xmb';
import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler/src/ml_parser/interpolation_config';

export function main(): void {
  describe('IdToRefMapping', () => {

    it('should generate an id to ref mapping', () => {
      const HTML = `
<p i18n="##ref_only">1</p>
<p i18n="@@i##ref_and_id">2</p>
<p i18n="m|d##ref_and_md">3</p>
<p i18n="m|d@@i2##ref_and_md_and_id">4</p>
<p i18n="m|d@@i3">5</p>`;

      const bundle = new MessageBundle(new HtmlParser, [], {}, 'en');
      bundle.updateFromTemplate(HTML, 'url', DEFAULT_INTERPOLATION_CONFIG);
      const refMapping = new IdToRefMapping(new Xmb());

      expect(JSON.parse(bundle.write(refMapping))).toEqual({
        '4863371103643861248': 'ref_only',
        'i': 'ref_and_id',
        '693235761972813932': 'ref_and_md',
        'i2': 'ref_and_md_and_id',
      });

    });
  });
}
