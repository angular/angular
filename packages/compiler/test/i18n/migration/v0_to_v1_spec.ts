/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MessageBundle} from '../../../src/i18n/message_bundle';
import {generateV1ToV0Map} from '../../../src/i18n/migration/v0_to_v1';
import {HtmlParser} from '../../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/interpolation_config';


export function main(): void {
  describe('V0 to V1 migration', () => {
    describe('Generate mapping', () => {
      it('should generate a mapping from v1 id to v0', () => {
        const HTML = `
<p i18n>text</p>
<p i18n>foo {{bar}}</p>
<p i18n>foo {{baz}}</p>
<p i18n="@@fixed_id">foo {{buz}}</p>
        `;
        const bundle = new MessageBundle(new HtmlParser, [], {});
        bundle.updateFromTemplate(HTML, '/path/to/html', DEFAULT_INTERPOLATION_CONFIG);
        const v1toV0 = generateV1ToV0Map(bundle, 'xmb');

        // `foo {{bar}}` and `foo {{baz}}` generate different v0 ids but a single v1 id
        expect(v1toV0).toEqual({
          '3667842621564887364': {
            ids: ['3667842621564887364'],
            sources: [
              {filePath: '/path/to/html', startLine: 2, startCol: 9, endLine: 2, endCol: 9},
            ],
          },
          '7312636350219285759': {
            ids: ['7291167978964532459', '2231161507516844600'],
            sources: [
              {filePath: '/path/to/html', startLine: 3, startCol: 9, endLine: 3, endCol: 9},
              {filePath: '/path/to/html', startLine: 4, startCol: 9, endLine: 4, endCol: 9},
            ],
          },
          'fixed_id': {
            ids: ['fixed_id'],
            sources: [
              {filePath: '/path/to/html', startLine: 5, startCol: 22, endLine: 5, endCol: 22},
            ],
          },
        });
      });

    });
  });
}