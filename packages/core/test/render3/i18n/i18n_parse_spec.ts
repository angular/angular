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
import {HEADER_OFFSET, HOST} from '@angular/core/src/render3/interfaces/view';
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
          `lView[${HEADER_OFFSET + 2}] = document.createText("some text");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 2}]);`,
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
          `lView[${HEADER_OFFSET + 2}] = document.createText("before|");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 2}]);`,
          `lView[${HEADER_OFFSET + 3}] = document.createComment("ICU ${HEADER_OFFSET + 0}:0");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 3}]);`,
          `lView[${HEADER_OFFSET + 7}] = document.createText("|after");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 7}]);`,
        ]),
        update: matchDebug([
          `if (mask & 0b1) { icuSwitchCase(${HEADER_OFFSET + 3}, \`\${lView[i-1]}\`); }`,
        ])
      }));
      expect(getTIcu(fixture.tView, HEADER_OFFSET + 3)).toEqual(matchTIcu({
        type: IcuType.select,
        anchorIdx: HEADER_OFFSET + 3,
        currentCaseLViewIndex: HEADER_OFFSET + 4,
        cases: ['A', 'other'],
        create: [
          matchDebug([
            `lView[${HEADER_OFFSET + 5}] = document.createTextNode("caseA")`,
            `(lView[${HOST}] as Element).appendChild(lView[${HEADER_OFFSET + 5}])`
          ]),
          matchDebug([
            `lView[${HEADER_OFFSET + 6}] = document.createTextNode("otherCase")`,
            `(lView[${HOST}] as Element).appendChild(lView[${HEADER_OFFSET + 6}])`,
          ])
        ],
        update: [
          matchDebug([]),
          matchDebug([]),
        ],
        remove: [
          matchDebug([`remove(lView[${HEADER_OFFSET + 5}])`]),
          matchDebug([`remove(lView[${HEADER_OFFSET + 6}])`]),
        ],
      }));

      fixture.apply(() => {
        applyCreateOpCodes(fixture.lView, tI18n.create, fixture.host, null);
        expect(fixture.host.innerHTML).toEqual(`before|<!--ICU ${HEADER_OFFSET + 0}:0-->|after`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`before|caseA<!--ICU ${HEADER_OFFSET + 0}:0-->|after`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('x');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`before|otherCase<!--ICU ${HEADER_OFFSET + 0}:0-->|after`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`before|caseA<!--ICU ${HEADER_OFFSET + 0}:0-->|after`);
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
        expect(fixture.host.innerHTML).toEqual(`<!--ICU ${HEADER_OFFSET + 0}:0-->`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`Hello <b>world<i>!</i></b><!--ICU ${HEADER_OFFSET + 0}:0-->`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('x');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`<div>nestedOther<!--nested ICU 0--></div><!--ICU ${HEADER_OFFSET + 0}:0-->`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`Hello <b>world<i>!</i></b><!--ICU ${HEADER_OFFSET + 0}:0-->`);
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
          `lView[${HEADER_OFFSET + 4}] = document.createComment("ICU ${HEADER_OFFSET + 0}:0");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 4}]);`,
        ]),
        update: matchDebug([
          `if (mask & 0b1) { icuSwitchCase(${HEADER_OFFSET + 4}, \`\${lView[i-1]}\`); }`,
          `if (mask & 0b10) { icuSwitchCase(${HEADER_OFFSET + 7}, \`\${lView[i-2]}\`); }`,
          `if (mask & 0b100) { icuUpdateCase(${HEADER_OFFSET + 7}); }`,
        ]),
      }));
      expect(getTIcu(fixture.tView, HEADER_OFFSET + 4)).toEqual(matchTIcu({
        type: IcuType.select,
        anchorIdx: HEADER_OFFSET + 4,
        currentCaseLViewIndex: HEADER_OFFSET + 5,
        cases: ['A', 'other'],
        create: [
          matchDebug([
            `lView[${HEADER_OFFSET + 6}] = document.createTextNode("parentA ")`,
            `(lView[${HOST}] as Element).appendChild(lView[${HEADER_OFFSET + 6}])`,
            `lView[${HEADER_OFFSET + 7}] = document.createComment("nested ICU 0")`,
            `(lView[${HOST}] as Element).appendChild(lView[${HEADER_OFFSET + 7}])`,
            `lView[${HEADER_OFFSET + 11}] = document.createTextNode("!")`,
            `(lView[${HOST}] as Element).appendChild(lView[${HEADER_OFFSET + 11}])`,
          ]),
          matchDebug([
            `lView[${HEADER_OFFSET + 12}] = document.createTextNode("parentOther")`,
            `(lView[${HOST}] as Element).appendChild(lView[${HEADER_OFFSET + 12}])`,
          ])
        ],
        update: [
          matchDebug([]),
          matchDebug([]),
        ],
        remove: [
          matchDebug([
            `remove(lView[${HEADER_OFFSET + 6}])`,
            `removeNestedICU(${HEADER_OFFSET + 7})`,
            `remove(lView[${HEADER_OFFSET + 7}])`,
            `remove(lView[${HEADER_OFFSET + 11}])`,
          ]),
          matchDebug([
            `remove(lView[${HEADER_OFFSET + 12}])`,
          ])
        ],
      }));

      expect(getTIcu(fixture.tView, HEADER_OFFSET + 7)).toEqual(matchTIcu({
        type: IcuType.select,
        anchorIdx: HEADER_OFFSET + 7,
        currentCaseLViewIndex: HEADER_OFFSET + 8,
        cases: ['0', 'other'],
        create: [
          matchDebug([
            `lView[${HEADER_OFFSET + 9}] = document.createTextNode("nested0")`,
            `(lView[${HOST}] as Element).appendChild(lView[${HEADER_OFFSET + 9}])`
          ]),
          matchDebug([
            `lView[${HEADER_OFFSET + 10}] = document.createTextNode("")`,
            `(lView[${HOST}] as Element).appendChild(lView[${HEADER_OFFSET + 10}])`,
          ])
        ],
        update: [
          matchDebug([]),
          matchDebug([
            `if (mask & 0b100) { (lView[${
                HEADER_OFFSET + 10}] as Text).textContent = \`\${lView[i-3]}\`; }`,
          ]),
        ],
        remove: [
          matchDebug([`remove(lView[${HEADER_OFFSET + 9}])`]),
          matchDebug([`remove(lView[${HEADER_OFFSET + 10}])`]),
        ],
      }));

      fixture.apply(() => {
        applyCreateOpCodes(fixture.lView, tI18n.create, fixture.host, null);
        expect(fixture.host.innerHTML).toEqual(`<!--ICU ${HEADER_OFFSET + 0}:0-->`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nExp('0');
        ɵɵi18nExp('value1');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`parentA nested0<!--nested ICU 0-->!<!--ICU ${HEADER_OFFSET + 0}:0-->`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nExp('x');
        ɵɵi18nExp('value1');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`parentA value1<!--nested ICU 0-->!<!--ICU ${HEADER_OFFSET + 0}:0-->`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('x');
        ɵɵi18nExp('x');
        ɵɵi18nExp('value2');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML).toEqual(`parentOther<!--ICU ${HEADER_OFFSET + 0}:0-->`);
      });
      fixture.apply(() => {
        ɵɵi18nExp('A');
        ɵɵi18nExp('A');
        ɵɵi18nExp('value2');
        ɵɵi18nApply(0);
        expect(fixture.host.innerHTML)
            .toEqual(`parentA value2<!--nested ICU 0-->!<!--ICU ${HEADER_OFFSET + 0}:0-->`);
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
