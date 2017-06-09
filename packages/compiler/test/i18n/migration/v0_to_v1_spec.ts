/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MessageBundle} from '../../../src/i18n/message_bundle';
import {applyMapping, computeConflicts, generateV1ToV0Map, resolveConflicts, resolveConflictsAuto} from '../../../src/i18n/migration/v0_to_v1';
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

    describe('Compute conflicts', () => {
      const v1ToV0Map = {
        'single.v1': {ids: ['single.v0']},
        'mul_ok.v1': {ids: ['mul_ok.1.v0', 'mul_ok.2.v0']},
        'mul_ko.v1': {ids: ['mul_ko.1.v0', 'mul_ko.2.v0', 'mul_ko.3.v0']},
        'no_0.v1': {ids: ['no_0.v0']},
      };

      const EXPECTED_CONFLICTS = {
        'mul_ko.v1': [
          {id: 'mul_ko.1.v0', msg: 'conflict?'},
          {id: 'mul_ko.2.v0', msg: 'yes'},
        ],
      };

      it('should work XTB', () => {
        const TRANS = `
          <translationbundle>
            <translation id="single.v0">single</translation>
            <translation id="mul_ok.1.v0">no conflict</translation>
            <translation id="mul_ok.2.v0">no conflict</translation>
            <translation id="mul_ko.1.v0">conflict?</translation>
            <translation id="mul_ko.2.v0">yes</translation>
            <translation id="mul_ko.3.v0">yes</translation>
          </translationbundle>`;

        expect(computeConflicts(v1ToV0Map, TRANS, 'xtb')).toEqual(EXPECTED_CONFLICTS);
      });

      it('should work XLIFF', () => {
        const TRANS = `<?xml version="1.0" encoding="UTF-8" ?>
          <xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
            <file source-language="en">
              <body>
                <trans-unit id="single.v0"><target>single</target></trans-unit>
                <trans-unit id="mul_ok.1.v0"><target>no conflict</target></trans-unit>
                <trans-unit id="mul_ok.2.v0"><target>no conflict</target></trans-unit>
                <trans-unit id="mul_ko.1.v0"><target>conflict?</target></trans-unit>
                <trans-unit id="mul_ko.2.v0"><target>yes</target></trans-unit>
                <trans-unit id="mul_ko.3.v0"><target>yes</target></trans-unit>
              </body>
            </file>
          </xliff>`;

        expect(computeConflicts(v1ToV0Map, TRANS, 'xliff')).toEqual(EXPECTED_CONFLICTS);
      });

      it('should work XLIFF2', () => {
        const TRANS = `<?xml version="1.0" encoding="UTF-8" ?>;
          <xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0">
            <file original="ng.template" id="ngi18n">
              <unit id="single.v0"><target>single</target></unit>
              <unit id="mul_ok.1.v0"><target>no conflict</target></unit>
              <unit id="mul_ok.2.v0"><target>no conflict</target></unit>
              <unit id="mul_ko.1.v0"><target>conflict?</target></unit>
              <unit id="mul_ko.2.v0"><target>yes</target></unit>
              <unit id="mul_ko.3.v0"><target>yes</target></unit>
            </file>
          </xliff>`;

        expect(computeConflicts(v1ToV0Map, TRANS, 'xliff2')).toEqual(EXPECTED_CONFLICTS);
      });
    });

    describe('Conflicts resolution', () => {
      const v1ToV0 = {
        'new.a': {ids: ['old.a1', 'old.a2', 'old.a3']},
        'new.b': {ids: ['old.b']},
      };

      it('should solve conflicts automatically', () => {
        expect(resolveConflictsAuto(v1ToV0)).toEqual({
          'old.a1': 'new.a',
          'old.a2': null,
          'old.a3': null,
          'old.b': 'new.b',
        });
      });

      it('should solve conflicts using the resolution map', () => {
        expect(resolveConflicts(v1ToV0, {'new.a': 'old.a2'})).toEqual({
          'old.a1': null,
          'old.a2': 'new.a',
          'old.a3': null,
          'old.b': 'new.b',
        });
      });

      it('should throw on missing resolution', () => {
        expect(() => {
          resolveConflicts(v1ToV0, {});
        }).toThrowError('Missing resolution for new id "new.a"');
      });
    });

    // TODO(vicb): add more tests for different formats
    describe('ApplyMapping', () => {
      it('should work with XMB', () => {
        const SRC = `
          <translationbundle>
            <translation id="ignore">a</translation>
            <translation id="remove">b</translation>
            <translation id="old">c</translation>
          </translationbundle>`;

        const DST = `
          <translationbundle>
            <translation id="ignore">a</translation>
            <translation id="new">c</translation>
          </translationbundle>`;

        const mapping = {
          'remove': null,
          'old': 'new',
        };

        expect(applyMapping(mapping, null !, SRC, 'xmb')).toEqual(DST);
      });



    });
  });
}