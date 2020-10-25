/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵi18nAttributes, ɵɵi18nPostprocess, ɵɵi18nStart} from '@angular/core';
import {ɵɵi18n} from '@angular/core/src/core';
import {getTranslationForTemplate, i18nStartFirstCreatePass} from '@angular/core/src/render3/i18n/i18n_parse';
import {getTIcu} from '@angular/core/src/render3/i18n/i18n_util';
import {TElementNode, TNodeType} from '@angular/core/src/render3/interfaces/node';
import {getCurrentTNode} from '@angular/core/src/render3/state';
import {ɵɵelementEnd, ɵɵelementStart} from '../../../src/render3/instructions/all';
import {I18nCreateOpCode, I18nUpdateOpCodes, TI18n, TIcu} from '../../../src/render3/interfaces/i18n';
import {HEADER_OFFSET, LView, TVIEW, TView} from '../../../src/render3/interfaces/view';
import {getNativeByIndex} from '../../../src/render3/util/view_utils';
import {matchTNode} from '../matchers';
import {TemplateFixture} from '../render_util';
import {matchDebug} from '../utils';
import {ViewFixture} from '../view_fixture';



describe('Runtime i18n', () => {
  describe('getTranslationForTemplate', () => {
    it('should crop messages for the selected template', () => {
      let message = `simple text`;
      expect(getTranslationForTemplate(message, -1)).toEqual(message);

      message = `Hello �0�!`;
      expect(getTranslationForTemplate(message, -1)).toEqual(message);

      message = `Hello �#2��0��/#2�!`;
      expect(getTranslationForTemplate(message, -1)).toEqual(message);

      // Embedded sub-templates
      message = `�0� is rendered as: �*2:1�before�*1:2�middle�/*1:2�after�/*2:1�!`;
      expect(getTranslationForTemplate(message, -1)).toEqual('�0� is rendered as: �*2:1��/*2:1�!');
      expect(getTranslationForTemplate(message, 1)).toEqual('before�*1:2��/*1:2�after');
      expect(getTranslationForTemplate(message, 2)).toEqual('middle');

      // Embedded & sibling sub-templates
      message =
          `�0� is rendered as: �*2:1�before�*1:2�middle�/*1:2�after�/*2:1� and also �*4:3�before�*1:4�middle�/*1:4�after�/*4:3�!`;
      expect(getTranslationForTemplate(message, -1))
          .toEqual('�0� is rendered as: �*2:1��/*2:1� and also �*4:3��/*4:3�!');
      expect(getTranslationForTemplate(message, 1)).toEqual('before�*1:2��/*1:2�after');
      expect(getTranslationForTemplate(message, 2)).toEqual('middle');
      expect(getTranslationForTemplate(message, 3)).toEqual('before�*1:4��/*1:4�after');
      expect(getTranslationForTemplate(message, 4)).toEqual('middle');
    });

    it('should throw if the template is malformed', () => {
      const message = `�*2:1�message!`;
      expect(() => getTranslationForTemplate(message, -1)).toThrowError(/Tag mismatch/);
    });
  });

  let tView: TView;

  function getOpCodes(
      messageOrAtrs: string|string[], createTemplate: () => void,
      updateTemplate: (() => void)|undefined, nbDecls: number, index: number): TI18n|
      I18nUpdateOpCodes {
    const fixture = new TemplateFixture(
        {create: createTemplate, update: updateTemplate, decls: nbDecls, consts: [messageOrAtrs]});
    tView = fixture.hostView[TVIEW];
    return tView.data[index] as TI18n | I18nUpdateOpCodes;
  }

  describe('i18nStart', () => {
    it('for text', () => {
      const message = 'simple text';
      const nbConsts = 1;
      const index = 1;
      const opCodes = getOpCodes(message, () => {
                        ɵɵelementStart(0, 'div');
                        ɵɵi18nStart(index, 0);
                        ɵɵelementEnd();
                      }, undefined, nbConsts, HEADER_OFFSET + index) as TI18n;

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 1}] = document.createText("simple text");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 1}]);`,
        ]),
        update: [] as unknown as I18nUpdateOpCodes,
      });
    });

    it('for elements', () => {
      const message = `Hello �#2�world�/#2� and �#3�universe�/#3�!`;
      // Template: `<div>Hello <div>world</div> and <span>universe</span>!`
      // 3 consts for the 2 divs and 1 span + 1 const for `i18nStart` = 4 consts
      const nbConsts = 4;
      const index = 1;
      const opCodes = getOpCodes(message, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nStart(index, 0);
        ɵɵelementEnd();
      }, undefined, nbConsts, HEADER_OFFSET + index);

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 4}] = document.createText("Hello ");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 4}]);`,
          `lView[${HEADER_OFFSET + 5}] = document.createText("world");`,
          `lView[${HEADER_OFFSET + 6}] = document.createText(" and ");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 6}]);`,
          `lView[${HEADER_OFFSET + 7}] = document.createText("universe");`,
          `lView[${HEADER_OFFSET + 8}] = document.createText("!");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 8}]);`,
        ]),
        update: [] as unknown as I18nUpdateOpCodes,
      });
    });

    it('for simple bindings', () => {
      const message = `Hello �0�!`;
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(message, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nStart(index, 0);
        ɵɵelementEnd();
      }, undefined, nbConsts, HEADER_OFFSET + index);

      expect((opCodes as any).update.debug).toEqual([
        'if (mask & 0b1) { (lView[22] as Text).textContent = `Hello ${lView[i-1]}!`; }'
      ]);

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 2}] = document.createText("");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 2}]);`,
        ]),
        update: matchDebug([
          'if (mask & 0b1) { (lView[22] as Text).textContent = `Hello ${lView[i-1]}!`; }',
        ]),
      });
    });

    it('for multiple bindings', () => {
      const message = `Hello �0� and �1�, again �0�!`;
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(message, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nStart(index, 0);
        ɵɵelementEnd();
      }, undefined, nbConsts, HEADER_OFFSET + index);

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 2}] = document.createText("");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 2}]);`,
        ]),
        update: matchDebug([
          'if (mask & 0b11) { (lView[22] as Text).textContent = `Hello ${lView[i-1]} and ${lView[i-2]}, again ${lView[i-1]}!`; }',
        ]),
      });
    });

    it('for sub-templates', () => {
      // Template:
      // <div>
      //   {{value}} is rendered as:
      //   <span *ngIf>
      //     before <b *ngIf>middle</b> after
      //   </span>
      //   !
      // </div>
      const message =
          `�0� is rendered as: �*2:1��#1:1�before�*2:2��#1:2�middle�/#1:2��/*2:2�after�/#1:1��/*2:1�!`;

      /**** Root template ****/
      // �0� is rendered as: �*2:1��/*2:1�!
      let nbConsts = 3;
      let index = 1;
      let opCodes = getOpCodes(message, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nStart(index, 0);
        ɵɵelementEnd();
      }, undefined, nbConsts, HEADER_OFFSET + index);

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 3}] = document.createText("");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 3}]);`,
          `lView[${HEADER_OFFSET + 4}] = document.createText("!");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 4}]);`,
        ]),
        update: matchDebug([
          'if (mask & 0b1) { (lView[23] as Text).textContent = `${lView[i-1]} is rendered as: `; }',
        ]),
      });


      /**** First sub-template ****/
      // �#1:1�before�*2:2�middle�/*2:2�after�/#1:1�
      nbConsts = 3;
      index = 1;
      opCodes = getOpCodes(message, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nStart(index, 0, 1);
      }, undefined, nbConsts, index + HEADER_OFFSET);

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 3}] = document.createText("before");`,
          `lView[${HEADER_OFFSET + 4}] = document.createText("after");`,
        ]),
        update: [] as unknown as I18nUpdateOpCodes,
      });


      /**** Second sub-template ****/
      // middle
      nbConsts = 2;
      index = 1;
      opCodes = getOpCodes(message, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nStart(index, 0, 2);
      }, undefined, nbConsts, index + HEADER_OFFSET);

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 2}] = document.createText("middle");`,
        ]),
        update: [] as unknown as I18nUpdateOpCodes,
      });
    });

    it('for ICU expressions', () => {
      const message = `{�0�, plural,
        =0 {no <b title="none">emails</b>!}
        =1 {one <i>email</i>}
        other {�0� <span title="�1�">emails</span>}
      }`;
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(message, () => {
                        ɵɵelementStart(0, 'div');
                        ɵɵi18nStart(index, 0);
                        ɵɵelementEnd();
                      }, undefined, nbConsts, HEADER_OFFSET + index) as TI18n;

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 2}] = document.createComment("ICU 21:0");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 2}]);`,
        ]),
        update: matchDebug([
          'if (mask & 0b1) { icuSwitchCase(22, `${lView[i-1]}`); }',
          'if (mask & 0b1) { icuUpdateCase(22); }',
        ]),
      });
      expect(getTIcu(tView, 22)).toEqual(<TIcu>{
        type: 1,
        currentCaseLViewIndex: 23,
        anchorIdx: 22,
        cases: ['0', '1', 'other'],
        create: [
          matchDebug([
            `lView[${HEADER_OFFSET + 4}] = document.createTextNode("no ")`,
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 4}])`,
            'lView[25] = document.createElement("b")',
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 5}])`,
            '(lView[25] as Element).setAttribute("title", "none")',
            `lView[${HEADER_OFFSET + 6}] = document.createTextNode("emails")`,
            `(lView[${HEADER_OFFSET + 5}] as Element).appendChild(lView[${HEADER_OFFSET + 6}])`,
            `lView[${HEADER_OFFSET + 7}] = document.createTextNode("!")`,
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 7}])`,
          ]),
          matchDebug([
            `lView[${HEADER_OFFSET + 8}] = document.createTextNode("one ")`,
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 8}])`,
            'lView[29] = document.createElement("i")',
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 9}])`,
            'lView[30] = document.createTextNode("email")',
            '(lView[29] as Element).appendChild(lView[30])',
          ]),
          matchDebug([
            'lView[31] = document.createTextNode("")',
            '(lView[20] as Element).appendChild(lView[31])',
            'lView[32] = document.createElement("span")',
            '(lView[20] as Element).appendChild(lView[32])',
            'lView[33] = document.createTextNode("emails")',
            '(lView[32] as Element).appendChild(lView[33])',
          ]),
        ],
        remove: [
          matchDebug([
            'remove(lView[24])',
            'remove(lView[25])',
            'remove(lView[27])',
          ]),
          matchDebug([
            'remove(lView[28])',
            'remove(lView[29])',
          ]),
          matchDebug([
            'remove(lView[31])',
            'remove(lView[32])',
          ]),
        ],
        update: [
          matchDebug([]),
          matchDebug([]),
          matchDebug([
            'if (mask & 0b1) { (lView[31] as Text).textContent = `${lView[i-1]} `; }',
            'if (mask & 0b10) { (lView[32] as Element).setAttribute(\'title\', `${lView[i-2]}`); }',
          ]),
        ]
      });
    });

    it('for nested ICU expressions', () => {
      const message = `{�0�, plural,
        =0 {zero}
        other {�0� {�1�, select,
                       cat {cats}
                       dog {dogs}
                       other {animals}
                     }!}
      }`;
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(message, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18n(index, 0);
        ɵɵelementEnd();
      }, undefined, nbConsts, HEADER_OFFSET + index);

      expect(opCodes).toEqual({
        create: matchDebug([
          `lView[${HEADER_OFFSET + 2}] = document.createComment("ICU 21:0");`,
          `parent.appendChild(lView[${HEADER_OFFSET + 2}]);`,
        ]),
        update: matchDebug([
          'if (mask & 0b1) { icuSwitchCase(22, `${lView[i-1]}`); }',
          'if (mask & 0b10) { icuSwitchCase(26, `${lView[i-2]}`); }',
          'if (mask & 0b1) { icuUpdateCase(22); }',
        ]),
      });
      expect(getTIcu(tView, 22)).toEqual({
        type: 1,
        anchorIdx: 22,
        currentCaseLViewIndex: 23,
        cases: ['0', 'other'],
        create: [
          matchDebug([
            `lView[${HEADER_OFFSET + 4}] = document.createTextNode("zero")`,
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 4}])`,
          ]),
          matchDebug([
            `lView[${HEADER_OFFSET + 5}] = document.createTextNode("")`,
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 5}])`,
            'lView[26] = document.createComment("nested ICU 0")',
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 6}])`,
            'lView[31] = document.createTextNode("!")',
            '(lView[20] as Element).appendChild(lView[31])',
          ]),
        ],
        update: [
          matchDebug([]),
          matchDebug([
            'if (mask & 0b1) { (lView[25] as Text).textContent = `${lView[i-1]} `; }',
          ]),
        ],
        remove: [
          matchDebug([
            'remove(lView[24])',
          ]),
          matchDebug([
            'remove(lView[25])',
            'removeNestedICU(26)',
            'remove(lView[26])',
            'remove(lView[31])',
          ]),
        ],
      });
      expect(tView.data[26]).toEqual({
        type: 0,
        anchorIdx: 26,
        currentCaseLViewIndex: 27,
        cases: ['cat', 'dog', 'other'],
        create: [
          matchDebug([
            `lView[${HEADER_OFFSET + 8}] = document.createTextNode("cats")`,
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 8}])`,
          ]),
          matchDebug([
            `lView[${HEADER_OFFSET + 9}] = document.createTextNode("dogs")`,
            `(lView[${HEADER_OFFSET + 0}] as Element).appendChild(lView[${HEADER_OFFSET + 9}])`,
          ]),
          matchDebug([
            'lView[30] = document.createTextNode("animals")',
            '(lView[20] as Element).appendChild(lView[30])',
          ]),
        ],
        update: [
          matchDebug([]),
          matchDebug([]),
          matchDebug([]),
        ],
        remove: [
          matchDebug(['remove(lView[28])']),
          matchDebug(['remove(lView[29])']),
          matchDebug(['remove(lView[30])']),
        ],
      });
    });
  });

  describe(`i18nAttribute`, () => {
    it('for simple bindings', () => {
      const message = `Hello �0�!`;
      const attrs = ['title', message];
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(attrs, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nAttributes(index, 0);
        ɵɵelementEnd();
      }, undefined, nbConsts, HEADER_OFFSET + index);

      expect(opCodes).toEqual(matchDebug([
        'if (mask & 0b1) { (lView[20] as Element).setAttribute(\'title\', `Hello ${lView[i-1]}!`); }',
      ]));
    });

    it('for multiple bindings', () => {
      const message = `Hello �0� and �1�, again �0�!`;
      const attrs = ['title', message];
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(attrs, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nAttributes(index, 0);
        ɵɵelementEnd();
      }, undefined, nbConsts, HEADER_OFFSET + index);

      expect(opCodes).toEqual(matchDebug([
        'if (mask & 0b11) { (lView[20] as Element).setAttribute(\'title\', `Hello ${lView[i-1]} and ${lView[i-2]}, again ${lView[i-1]}!`); }',
      ]));
    });

    it('for multiple attributes', () => {
      const message = `Hello �0�!`;
      const attrs = ['title', message, 'aria-label', message];
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(attrs, () => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nAttributes(index, 0);
        ɵɵelementEnd();
      }, undefined, nbConsts, HEADER_OFFSET + index);

      expect(opCodes).toEqual(matchDebug([
        'if (mask & 0b1) { (lView[20] as Element).setAttribute(\'title\', `Hello ${lView[i-1]}!`); }',
        'if (mask & 0b1) { (lView[20] as Element).setAttribute(\'aria-label\', `Hello ${lView[i-1]}!`); }',
      ]));
    });
  });

  describe('i18nPostprocess', () => {
    it('should handle valid cases', () => {
      const arr = ['�*1:1��#2:1�', '�#4:1�', '�6:1�', '�/#2:1��/*1:1�'];
      const str = `[${arr.join('|')}]`;

      const cases = [
        // empty string
        ['', {}, ''],

        // string without any special cases
        ['Foo [1,2,3] Bar - no ICU here', {}, 'Foo [1,2,3] Bar - no ICU here'],

        // multi-value cases
        [
          `Start: ${str}, ${str} and ${str}, ${str} end.`, {},
          `Start: ${arr[0]}, ${arr[1]} and ${arr[2]}, ${arr[3]} end.`
        ],

        // replace VAR_SELECT
        [
          'My ICU: {VAR_SELECT, select, =1 {one} other {other}}', {VAR_SELECT: '�1:2�'},
          'My ICU: {�1:2�, select, =1 {one} other {other}}'
        ],

        [
          'My ICU: {\n\n\tVAR_SELECT_1 \n\n, select, =1 {one} other {other}}',
          {VAR_SELECT_1: '�1:2�'}, 'My ICU: {\n\n\t�1:2� \n\n, select, =1 {one} other {other}}'
        ],

        // replace VAR_PLURAL
        [
          'My ICU: {VAR_PLURAL, plural, one {1} other {other}}', {VAR_PLURAL: '�1:2�'},
          'My ICU: {�1:2�, plural, one {1} other {other}}'
        ],

        [
          'My ICU: {\n\n\tVAR_PLURAL_1 \n\n, select, =1 {one} other {other}}',
          {VAR_PLURAL_1: '�1:2�'}, 'My ICU: {\n\n\t�1:2� \n\n, select, =1 {one} other {other}}'
        ],

        // do not replace VAR_* anywhere else in a string (only in ICU)
        [
          'My ICU: {VAR_PLURAL, plural, one {1} other {other}} VAR_PLURAL and VAR_SELECT',
          {VAR_PLURAL: '�1:2�'},
          'My ICU: {�1:2�, plural, one {1} other {other}} VAR_PLURAL and VAR_SELECT'
        ],

        // replace VAR_*'s in nested ICUs
        [
          'My ICU: {VAR_PLURAL, plural, one {1 - {VAR_SELECT, age, 50 {fifty} other {other}}} other {other}}',
          {VAR_PLURAL: '�1:2�', VAR_SELECT: '�5�'},
          'My ICU: {�1:2�, plural, one {1 - {�5�, age, 50 {fifty} other {other}}} other {other}}'
        ],

        [
          'My ICU: {VAR_PLURAL, plural, one {1 - {VAR_PLURAL_1, age, 50 {fifty} other {other}}} other {other}}',
          {VAR_PLURAL: '�1:2�', VAR_PLURAL_1: '�5�'},
          'My ICU: {�1:2�, plural, one {1 - {�5�, age, 50 {fifty} other {other}}} other {other}}'
        ],

        // ICU replacement
        [
          'My ICU #1: �I18N_EXP_ICU�, My ICU #2: �I18N_EXP_ICU�',
          {ICU: ['ICU_VALUE_1', 'ICU_VALUE_2']}, 'My ICU #1: ICU_VALUE_1, My ICU #2: ICU_VALUE_2'
        ],

        // mixed case
        [
          `Start: ${str}, ${str}. ICU: {VAR_SELECT, count, 10 {ten} other {other}}.
          Another ICU: �I18N_EXP_ICU� and ${str}, ${str} and one more ICU: �I18N_EXP_ICU� and end.`,
          {VAR_SELECT: '�1:2�', ICU: ['ICU_VALUE_1', 'ICU_VALUE_2']},
          `Start: ${arr[0]}, ${arr[1]}. ICU: {�1:2�, count, 10 {ten} other {other}}.
          Another ICU: ICU_VALUE_1 and ${arr[2]}, ${arr[3]} and one more ICU: ICU_VALUE_2 and end.`,
        ],
      ];
      cases.forEach(([input, replacements, output]) => {
        expect(ɵɵi18nPostprocess(input as string, replacements as any)).toEqual(output as string);
      });
    });

    it('should handle nested template represented by multi-value placeholders', () => {
      /**
       * <div i18n>
       *   <span>
       *     Hello - 1
       *   </span>
       *   <span *ngIf="visible">
       *     Hello - 2
       *     <span *ngIf="visible">
       *       Hello - 3
       *       <span *ngIf="visible">
       *         Hello - 4
       *       </span>
       *     </span>
       *   </span>
       *   <span>
       *     Hello - 5
       *   </span>
       * </div>
       */
      const generated = `
        [�#2�|�#4�] Bonjour - 1 [�/#2�|�/#1:3��/*2:3�|�/#1:2��/*2:2�|�/#1:1��/*3:1�|�/#4�]
        [�*3:1��#1:1�|�*2:2��#1:2�|�*2:3��#1:3�]
          Bonjour - 2
          [�*3:1��#1:1�|�*2:2��#1:2�|�*2:3��#1:3�]
            Bonjour - 3
            [�*3:1��#1:1�|�*2:2��#1:2�|�*2:3��#1:3�] Bonjour - 4 [�/#2�|�/#1:3��/*2:3�|�/#1:2��/*2:2�|�/#1:1��/*3:1�|�/#4�]
          [�/#2�|�/#1:3��/*2:3�|�/#1:2��/*2:2�|�/#1:1��/*3:1�|�/#4�]
        [�/#2�|�/#1:3��/*2:3�|�/#1:2��/*2:2�|�/#1:1��/*3:1�|�/#4�]
        [�#2�|�#4�] Bonjour - 5 [�/#2�|�/#1:3��/*2:3�|�/#1:2��/*2:2�|�/#1:1��/*3:1�|�/#4�]
      `;
      const final = `
        �#2� Bonjour - 1 �/#2�
        �*3:1�
          �#1:1�
            Bonjour - 2
            �*2:2�
              �#1:2�
                Bonjour - 3
                �*2:3�
                  �#1:3� Bonjour - 4 �/#1:3�
                �/*2:3�
              �/#1:2�
            �/*2:2�
          �/#1:1�
        �/*3:1�
        �#4� Bonjour - 5 �/#4�
      `;
      expect(ɵɵi18nPostprocess(generated.replace(/\s+/g, ''))).toEqual(final.replace(/\s+/g, ''));
    });

    it('should throw in case we have invalid string', () => {
      expect(
          () => ɵɵi18nPostprocess(
              'My ICU #1: �I18N_EXP_ICU�, My ICU #2: �I18N_EXP_ICU�', {ICU: ['ICU_VALUE_1']}))
          .toThrowError();
    });
  });

  describe('i18nStartFirstCreatePass', () => {
    let fixture: ViewFixture;
    const DECLS = 20;
    const VARS = 10;
    beforeEach(() => {
      fixture = new ViewFixture({decls: DECLS, vars: VARS});
      fixture.enterView();
      ɵɵelementStart(0, 'div');
    });

    afterEach(ViewFixture.cleanUp);

    function i18nRangeOffset(offset: number): number {
      return HEADER_OFFSET + DECLS + VARS + offset;
    }

    function i18nRangeOffsetOpcode(
        offset: number,
        {appendLater, comment}: {appendLater?: boolean, comment?: boolean} = {}): number {
      let index = i18nRangeOffset(offset) << I18nCreateOpCode.SHIFT;
      if (!appendLater) {
        index |= I18nCreateOpCode.APPEND_EAGERLY;
      }
      if (comment) {
        index |= I18nCreateOpCode.COMMENT;
      }
      return index;
    }

    it('should process text node with no siblings and no children', () => {
      i18nStartFirstCreatePass(
          fixture.tView, 0, fixture.lView, HEADER_OFFSET + 1, 'Hello World!', -1);
      const ti18n = fixture.tView.data[HEADER_OFFSET + 1] as TI18n;
      // Expect that we only create the `Hello World!` text node and nothing else.
      expect(ti18n.create).toEqual([
        i18nRangeOffsetOpcode(0), 'Hello World!',  //
      ]);
      const lViewDebug = fixture.lView.debug!;
      expect(lViewDebug.template).toEqual('<div>Hello World!</div>');
    });

    it('should process text with a child node', () => {
      i18nStartFirstCreatePass(
          fixture.tView, 0, fixture.lView, HEADER_OFFSET + 1, 'Hello �#2��/#2�!', -1);
      const ti18n = fixture.tView.data[HEADER_OFFSET + 1] as TI18n;
      expect(ti18n.create).toEqual([
        i18nRangeOffsetOpcode(0), 'Hello ',  //
        i18nRangeOffsetOpcode(1), '!',       //
      ]);
      // Leave behind `Placeholder` to be picked up by `TNode` creation.
      expect(fixture.tView.data[HEADER_OFFSET + 2]).toEqual(matchTNode({
        type: TNodeType.Placeholder,
        // It should insert itself in front of "!"
        insertBeforeIndex: i18nRangeOffset(1),
      }));
      const lViewDebug = fixture.lView.debug!;
      expect(lViewDebug.template).toEqual('<div>Hello <Placeholder></Placeholder>!</div>');
    });

    it('should process text with a child node that has text', () => {
      i18nStartFirstCreatePass(
          fixture.tView, 0, fixture.lView, HEADER_OFFSET + 1, 'Hello �#2�World�/#2�!', -1);
      const ti18n = fixture.tView.data[HEADER_OFFSET + 1] as TI18n;
      expect(ti18n.create).toEqual([
        i18nRangeOffsetOpcode(0), 'Hello ',                      //
        i18nRangeOffsetOpcode(1, {appendLater: true}), 'World',  //
        i18nRangeOffsetOpcode(2), '!',                           //
      ]);
      // Leave behind `Placeholder` to be picked up by `TNode` creation.
      expect(fixture.tView.data[HEADER_OFFSET + 2]).toEqual(matchTNode({
        type: TNodeType.Placeholder,
        insertBeforeIndex: [
          i18nRangeOffset(2),  // It should insert itself in front of "!"
          i18nRangeOffset(1),  // It should append "World"
        ]
      }));
    });

    it('should process text with a child node that has text and with bindings', () => {
      i18nStartFirstCreatePass(
          fixture.tView, 0, fixture.lView, HEADER_OFFSET + 1,
          '�0� �#2��1��/#2�!' /* {{salutation}} <b>{{name}}</b>! */, -1);
      const ti18n = fixture.tView.data[HEADER_OFFSET + 1] as TI18n;
      expect(ti18n.create).toEqual([
        i18nRangeOffsetOpcode(0), '',                       // 1 is saved for binding
        i18nRangeOffsetOpcode(1, {appendLater: true}), '',  // 3 is saved for binding
        i18nRangeOffsetOpcode(2), '!',                      //
      ]);
      // Leave behind `insertBeforeIndex` to be picked up by `TNode` creation.
      expect(fixture.tView.data[HEADER_OFFSET + 2]).toEqual(matchTNode({
        type: TNodeType.Placeholder,
        insertBeforeIndex: [
          i18nRangeOffset(2),  // It should insert itself in front of "!"
          i18nRangeOffset(1),  // It should append child text node "{{name}}"
        ],
      }));
      expect(ti18n.update).toEqual(matchDebug([
        'if (mask & 0b1) { (lView[50] as Text).textContent = `${lView[i-1]} `; }',
        'if (mask & 0b10) { (lView[51] as Text).textContent = `${lView[i-2]}`; }'
      ]));
      const lViewDebug = fixture.lView.debug!;
      expect(lViewDebug.template).toEqual('<div>{{?}}<Placeholder>{{?}}</Placeholder>!</div>');
    });

    it('should process text with a child template', () => {
      i18nStartFirstCreatePass(
          fixture.tView, 0, fixture.lView, HEADER_OFFSET + 1, 'Hello �*2:1�World�/*2:1�!', -1);
      const ti18n = fixture.tView.data[HEADER_OFFSET + 1] as TI18n;
      expect(ti18n.create.debug).toEqual([
        'lView[50] = document.createText("Hello ");',
        'parent.appendChild(lView[50]);',
        'lView[51] = document.createText("!");',
        'parent.appendChild(lView[51]);',
      ]);
      // Leave behind `Placeholder` to be picked up by `TNode` creation.
      // It should insert itself in front of "!"
      expect(fixture.tView.data[HEADER_OFFSET + 2]).toEqual(matchTNode({
        type: TNodeType.Placeholder,
        insertBeforeIndex: 51,
      }));
    });
  });
});
