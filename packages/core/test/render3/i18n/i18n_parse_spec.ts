/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵi18nApply, ɵɵi18nExp} from '@angular/core';
import {applyCreateOpCodes} from '@angular/core/src/render3/i18n/i18n_apply';
import {i18nStartFirstCreatePass} from '@angular/core/src/render3/i18n/i18n_parse';
import {getTIcu} from '@angular/core/src/render3/i18n/i18n_util';
import {I18nUpdateOpCodes, IcuType, TI18n} from '@angular/core/src/render3/interfaces/i18n';
import {HEADER_OFFSET} from '@angular/core/src/render3/interfaces/view';
import {expect} from '@angular/core/testing/src/testing_internal';
import {matchTI18n, matchTIcu} from '../matchers';
import {matchDebug} from '../utils';
import {ViewFixture} from '../view_fixture';

describe('i18n_parse', () => {
  let fixture: ViewFixture;
  beforeEach(() => fixture = new ViewFixture({decls: 1, vars: 1}));

  describe('icu', () => {
    it('should parse simple text', () => {
      const tI18n = toT18n('some text');
      expect(tI18n).toEqual(matchTI18n({
        create: matchDebug([
          'lView[22] = document.createText("some text");',
          'parent.appendChild(lView[22]);',
        ]),
        update: [] as unknown as I18nUpdateOpCodes,
      }));

      fixture.apply(() => applyCreateOpCodes(fixture.lView, tI18n.create, fixture.host, null));
      expect(fixture.host.innerHTML).toEqual('some text');
    });

    it('should parse simple ICU', () => {
      //     TData                  | LView
      // ---------------------------+-------------------------------
      //                     ----- DECL -----
      // 20: TI18n                  |
      //                     ----- VARS -----
      // 21: Binding for ICU        |
      //                   ----- EXPANDO -----
      // 22: null                   | #text(before|)
      // 23: TIcu                   | <!-- ICU 20:0 -->
      // 24: null                   | currently selected ICU case
      // 25: null                   | #text(caseA)
      // 26: null                   | #text(otherCase)
      // 27: null                   | #text(|after)
      const tI18n = toT18n(`before|{
          �0�, select,
            A {caseA}
            other {otherCase}
        }|after`);
      expect(tI18n).toEqual(matchTI18n({
        create: matchDebug([
          'lView[22] = document.createText("before|");',
          'parent.appendChild(lView[22]);',
          'lView[23] = document.createComment("ICU 20:0");',
          'parent.appendChild(lView[23]);',
          'lView[27] = document.createText("|after");',
          'parent.appendChild(lView[27]);',
        ]),
        update: matchDebug([
          'if (mask & 0b1) { icuSwitchCase(23, `${lView[i-1]}`); }',
        ])
      }));
      expect(getTIcu(fixture.tView, 23)).toEqual(matchTIcu({
        type: IcuType.select,
        anchorIdx: 23,
        currentCaseLViewIndex: 24,
        cases: ['A', 'other'],
        create: [
          matchDebug([
            'lView[25] = document.createTextNode("caseA")',
            '(lView[0] as Element).appendChild(lView[25])'
          ]),
          matchDebug([
            'lView[26] = document.createTextNode("otherCase")',
            '(lView[0] as Element).appendChild(lView[26])',
          ])
        ],
        update: [
          matchDebug([]),
          matchDebug([]),
        ],
        remove: [
          matchDebug(['remove(lView[25])']),
          matchDebug(['remove(lView[26])']),
        ],
      }));

      fixture.apply(() => {
        applyCreateOpCodes(fixture.lView, tI18n.create, fixture.host, null);
        expect(fixture.host.innerHTML).toEqual('before|<!--ICU 20:0-->|after');
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML).toEqual('before|caseA<!--ICU 20:0-->|after');
      });
      fixture.apply(() => {
        ɵɵi18nExp('x');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML).toEqual('before|otherCase<!--ICU 20:0-->|after');
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML).toEqual('before|caseA<!--ICU 20:0-->|after');
      });
    });

    it('should parse HTML in ICU', () => {
      const tI18n = toT18n(`{
        �0�, select,
          A {Hello <b>world<i>!</i></b>}
          other {<div>{�0�, select, 0 {nested0} other {nestedOther}}</div>}
      }`);
      fixture.apply(() => {
        applyCreateOpCodes(fixture.lView, tI18n.create, fixture.host, null);
        expect(fixture.host.innerHTML).toEqual('<!--ICU 20:0-->');
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML).toEqual('Hello <b>world<i>!</i></b><!--ICU 20:0-->');
      });
      fixture.apply(() => {
        ɵɵi18nExp('x');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML)
            .toEqual('<div>nestedOther<!--nested ICU 0--></div><!--ICU 20:0-->');
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML).toEqual('Hello <b>world<i>!</i></b><!--ICU 20:0-->');
      });
    });


    it('should parse nested ICU', () => {
      fixture = new ViewFixture({decls: 1, vars: 3});
      //     TData                  | LView
      // ---------------------------+-------------------------------
      //                     ----- DECL -----
      // 20: TI18n                  |
      //                     ----- VARS -----
      // 21: Binding for parent ICU |
      // 22: Binding for child ICU  |
      // 23: Binding for child ICU  |
      //                   ----- EXPANDO -----
      // 24: TIcu (parent)          | <!-- ICU 20:0 -->
      // 25: null                   | currently selected ICU case
      // 26: null                   | #text( parentA )
      // 27: TIcu (child)           | <!-- nested ICU 0 -->
      // 28:     null               |     currently selected ICU case
      // 29:     null               |     #text(nested0)
      // 30:     null               |     #text({{�2�}})
      // 31: null                   | #text( )
      // 32: null                   | #text( parentOther )
      const tI18n = toT18n(`{
          �0�, select,
            A {parentA {�1�, select, 0 {nested0} other {�2�}}!}
            other {parentOther}
        }`);
      expect(tI18n).toEqual(matchTI18n({
        create: matchDebug([
          'lView[24] = document.createComment("ICU 20:0");',
          'parent.appendChild(lView[24]);',
        ]),
        update: matchDebug([
          'if (mask & 0b1) { icuSwitchCase(24, `${lView[i-1]}`); }',
          'if (mask & 0b10) { icuSwitchCase(27, `${lView[i-2]}`); }',
          'if (mask & 0b100) { icuUpdateCase(27); }',
        ]),
      }));
      expect(getTIcu(fixture.tView, 24)).toEqual(matchTIcu({
        type: IcuType.select,
        anchorIdx: 24,
        currentCaseLViewIndex: 25,
        cases: ['A', 'other'],
        create: [
          matchDebug([
            'lView[26] = document.createTextNode("parentA ")',
            '(lView[0] as Element).appendChild(lView[26])',
            'lView[27] = document.createComment("nested ICU 0")',
            '(lView[0] as Element).appendChild(lView[27])',
            'lView[31] = document.createTextNode("!")',
            '(lView[0] as Element).appendChild(lView[31])',
          ]),
          matchDebug([
            'lView[32] = document.createTextNode("parentOther")',
            '(lView[0] as Element).appendChild(lView[32])',
          ])
        ],
        update: [
          matchDebug([]),
          matchDebug([]),
        ],
        remove: [
          matchDebug([
            'remove(lView[26])',
            'removeNestedICU(27)',
            'remove(lView[27])',
            'remove(lView[31])',
          ]),
          matchDebug([
            'remove(lView[32])',
          ])
        ],
      }));

      expect(getTIcu(fixture.tView, 27)).toEqual(matchTIcu({
        type: IcuType.select,
        anchorIdx: 27,
        currentCaseLViewIndex: 28,
        cases: ['0', 'other'],
        create: [
          matchDebug([
            'lView[29] = document.createTextNode("nested0")',
            '(lView[0] as Element).appendChild(lView[29])'
          ]),
          matchDebug([
            'lView[30] = document.createTextNode("")',
            '(lView[0] as Element).appendChild(lView[30])',
          ])
        ],
        update: [
          matchDebug([]),
          matchDebug([
            'if (mask & 0b100) { (lView[30] as Text).textContent = `${lView[i-3]}`; }',
          ]),
        ],
        remove: [
          matchDebug(['remove(lView[29])']),
          matchDebug(['remove(lView[30])']),
        ],
      }));

      fixture.apply(() => {
        applyCreateOpCodes(fixture.lView, tI18n.create, fixture.host, null);
        expect(fixture.host.innerHTML).toEqual('<!--ICU 20:0-->');
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nExp('0');
        ɵɵi18nExp('value1');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML)
            .toEqual('parentA nested0<!--nested ICU 0-->!<!--ICU 20:0-->');
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nExp('x');
        ɵɵi18nExp('value1');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML).toEqual('parentA value1<!--nested ICU 0-->!<!--ICU 20:0-->');
      });
      fixture.apply(() => {
        ɵɵi18nExp('x');
        ɵɵi18nExp('x');
        ɵɵi18nExp('value2');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML).toEqual('parentOther<!--ICU 20:0-->');
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nExp('A');
        ɵɵi18nExp('value2');
        ɵɵi18nApply(0);  // index 0 + HEADER_OFFSET = 20;
        expect(fixture.host.innerHTML).toEqual('parentA value2<!--nested ICU 0-->!<!--ICU 20:0-->');
      });
    });
  });

  function toT18n(text: string) {
    const tNodeIndex = HEADER_OFFSET;
    fixture.enterView();
    i18nStartFirstCreatePass(fixture.tView, 0, fixture.lView, tNodeIndex, text, -1);
    fixture.leaveView();
    const tI18n = fixture.tView.data[tNodeIndex] as TI18n;
    expect(tI18n).toEqual(matchTI18n({}));
    return tI18n;
  }
});
