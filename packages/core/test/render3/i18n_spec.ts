/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵi18nAttributes, ɵɵi18nPostprocess, ɵɵi18nStart} from '@angular/core';
import {getTranslationForTemplate} from '@angular/core/src/render3/i18n/i18n_parse';

import {noop} from '../../../compiler/src/render3/view/util';
import {setDelayProjection, ɵɵelementEnd, ɵɵelementStart} from '../../src/render3/instructions/all';
import {I18nUpdateOpCodes, TI18n, TIcu} from '../../src/render3/interfaces/i18n';
import {HEADER_OFFSET, LView, TVIEW} from '../../src/render3/interfaces/view';
import {getNativeByIndex} from '../../src/render3/util/view_utils';

import {TemplateFixture} from './render_util';
import {debugMatch} from './utils';

describe('Runtime i18n', () => {
  afterEach(() => {
    setDelayProjection(false);
  });
  describe('getTranslationForTemplate', () => {
    it('should crop messages for the selected template', () => {
      let message = `simple text`;
      expect(getTranslationForTemplate(message)).toEqual(message);

      message = `Hello �0�!`;
      expect(getTranslationForTemplate(message)).toEqual(message);

      message = `Hello �#2��0��/#2�!`;
      expect(getTranslationForTemplate(message)).toEqual(message);

      // Embedded sub-templates
      message = `�0� is rendered as: �*2:1�before�*1:2�middle�/*1:2�after�/*2:1�!`;
      expect(getTranslationForTemplate(message)).toEqual('�0� is rendered as: �*2:1��/*2:1�!');
      expect(getTranslationForTemplate(message, 1)).toEqual('before�*1:2��/*1:2�after');
      expect(getTranslationForTemplate(message, 2)).toEqual('middle');

      // Embedded & sibling sub-templates
      message =
          `�0� is rendered as: �*2:1�before�*1:2�middle�/*1:2�after�/*2:1� and also �*4:3�before�*1:4�middle�/*1:4�after�/*4:3�!`;
      expect(getTranslationForTemplate(message))
          .toEqual('�0� is rendered as: �*2:1��/*2:1� and also �*4:3��/*4:3�!');
      expect(getTranslationForTemplate(message, 1)).toEqual('before�*1:2��/*1:2�after');
      expect(getTranslationForTemplate(message, 2)).toEqual('middle');
      expect(getTranslationForTemplate(message, 3)).toEqual('before�*1:4��/*1:4�after');
      expect(getTranslationForTemplate(message, 4)).toEqual('middle');
    });

    it('should throw if the template is malformed', () => {
      const message = `�*2:1�message!`;
      expect(() => getTranslationForTemplate(message)).toThrowError(/Tag mismatch/);
    });
  });

  function prepareFixture(
      createTemplate: () => void, updateTemplate: (() => void)|null, nbConsts = 0,
      nbVars = 0): TemplateFixture {
    return new TemplateFixture(createTemplate, updateTemplate || noop, nbConsts, nbVars);
  }

  function getOpCodes(
      createTemplate: () => void, updateTemplate: (() => void)|null, nbConsts: number,
      index: number): TI18n|I18nUpdateOpCodes {
    const fixture = prepareFixture(createTemplate, updateTemplate, nbConsts);
    const tView = fixture.hostView[TVIEW];
    return tView.data[index + HEADER_OFFSET] as TI18n;
  }

  describe('i18nStart', () => {
    it('for text', () => {
      const MSG_DIV = `simple text`;
      const nbConsts = 1;
      const index = 0;
      const opCodes = getOpCodes(() => {
                        ɵɵi18nStart(index, MSG_DIV);
                      }, null, nbConsts, index) as TI18n;

      expect(opCodes).toEqual({
        vars: 1,
        create: debugMatch([
          'lView[1] = document.createTextNode("simple text")',
          '(lView[0] as Element).appendChild(lView[1])'
        ]),
        update: [],
        icus: null
      });
    });

    it('for elements', () => {
      const MSG_DIV = `Hello �#2�world�/#2� and �#3�universe�/#3�!`;
      // Template: `<div>Hello <div>world</div> and <span>universe</span>!`
      // 3 consts for the 2 divs and 1 span + 1 const for `i18nStart` = 4 consts
      const nbConsts = 4;
      const index = 1;
      const opCodes = getOpCodes(() => {
        ɵɵi18nStart(index, MSG_DIV);
      }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 5,
        create: debugMatch([
          'lView[4] = document.createTextNode("Hello ")',
          '(lView[1] as Element).appendChild(lView[4])',
          '(lView[1] as Element).appendChild(lView[2])',
          'lView[5] = document.createTextNode("world")',
          '(lView[2] as Element).appendChild(lView[5])',
          'setPreviousOrParentTNode(tView.data[2] as TNode)',
          'lView[6] = document.createTextNode(" and ")',
          '(lView[1] as Element).appendChild(lView[6])',
          '(lView[1] as Element).appendChild(lView[3])',
          'lView[7] = document.createTextNode("universe")',
          '(lView[3] as Element).appendChild(lView[7])',
          'setPreviousOrParentTNode(tView.data[3] as TNode)',
          'lView[8] = document.createTextNode("!")',
          '(lView[1] as Element).appendChild(lView[8])',
        ]),
        update: [],
        icus: null
      });
    });

    it('for simple bindings', () => {
      const MSG_DIV = `Hello �0�!`;
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(() => {
        ɵɵi18nStart(index, MSG_DIV);
      }, null, nbConsts, index);

      expect((opCodes as any).update.debug).toEqual([
        'if (mask & 0b1) { (lView[2] as Text).textContent = `Hello ${lView[1]}!`; }'
      ]);

      expect(opCodes).toEqual({
        vars: 1,
        create: debugMatch([
          'lView[2] = document.createTextNode("")',
          '(lView[1] as Element).appendChild(lView[2])',
        ]),
        update: debugMatch(
            ['if (mask & 0b1) { (lView[2] as Text).textContent = `Hello ${lView[1]}!`; }']),
        icus: null
      });
    });

    it('for multiple bindings', () => {
      const MSG_DIV = `Hello �0� and �1�, again �0�!`;
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(() => {
        ɵɵi18nStart(index, MSG_DIV);
      }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 1,
        create: debugMatch([
          'lView[2] = document.createTextNode("")', '(lView[1] as Element).appendChild(lView[2])'
        ]),
        update: debugMatch([
          'if (mask & 0b11) { (lView[2] as Text).textContent = `Hello ${lView[1]} and ${lView[2]}, again ${lView[1]}!`; }'
        ]),
        icus: null
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
      const MSG_DIV =
          `�0� is rendered as: �*2:1��#1:1�before�*2:2��#1:2�middle�/#1:2��/*2:2�after�/#1:1��/*2:1�!`;

      /**** Root template ****/
      // �0� is rendered as: �*2:1��/*2:1�!
      let nbConsts = 3;
      let index = 1;
      const firstTextNode = 3;
      const rootTemplate = 2;
      let opCodes = getOpCodes(() => {
        ɵɵi18nStart(index, MSG_DIV);
      }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 2,
        create: debugMatch([
          'lView[3] = document.createTextNode("")', '(lView[1] as Element).appendChild(lView[3])',
          '(lView[1] as Element).appendChild(lView[16381])',
          'lView[4] = document.createTextNode("!")', '(lView[1] as Element).appendChild(lView[4])'
        ]),
        update: debugMatch([
          'if (mask & 0b1) { (lView[3] as Text).textContent = `${lView[1]} is rendered as: `; }'
        ]),
        icus: null
      });


      /**** First sub-template ****/
      // �#1:1�before�*2:2�middle�/*2:2�after�/#1:1�
      nbConsts = 3;
      index = 0;
      const spanElement = 1;
      const bElementSubTemplate = 2;
      opCodes = getOpCodes(() => {
        ɵɵi18nStart(index, MSG_DIV, 1);
      }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 2,
        create: debugMatch([
          '(lView[0] as Element).appendChild(lView[1])',
          'lView[3] = document.createTextNode("before")',
          '(lView[1] as Element).appendChild(lView[3])',
          '(lView[1] as Element).appendChild(lView[16381])',
          'lView[4] = document.createTextNode("after")',
          '(lView[1] as Element).appendChild(lView[4])',
          'setPreviousOrParentTNode(tView.data[1] as TNode)'
        ]),
        update: [],
        icus: null
      });


      /**** Second sub-template ****/
      // middle
      nbConsts = 2;
      index = 0;
      const bElement = 1;
      opCodes = getOpCodes(() => {
        ɵɵi18nStart(index, MSG_DIV, 2);
      }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 1,
        create: debugMatch([
          '(lView[0] as Element).appendChild(lView[1])',
          'lView[2] = document.createTextNode("middle")',
          '(lView[1] as Element).appendChild(lView[2])',
          'setPreviousOrParentTNode(tView.data[1] as TNode)'
        ]),
        update: [],
        icus: null
      });
    });

    it('for ICU expressions', () => {
      const MSG_DIV = `{�0�, plural,
        =0 {no <b title="none">emails</b>!}
        =1 {one <i>email</i>}
        other {�0� <span title="�1�">emails</span>}
      }`;
      const nbConsts = 1;
      const index = 0;
      const opCodes = getOpCodes(() => {
                        ɵɵi18nStart(index, MSG_DIV);
                      }, null, nbConsts, index) as TI18n;

      expect(opCodes).toEqual({
        vars: 6,
        update: debugMatch([
          'if (mask & 0b1) { icuSwitchCase(lView[1] as Comment, 0, `${lView[1]}`); }',
          'if (mask & 0b11) { icuUpdateCase(lView[1] as Comment, 0); }',
        ]),
        create: debugMatch([
          'lView[1] = document.createComment("ICU 1")',
          '(lView[0] as Element).appendChild(lView[1])',
        ]),
        icus: [<TIcu>{
          type: 1,
          currentCaseLViewIndex: 22,
          vars: [5, 4, 4],
          childIcus: [[], [], []],
          cases: ['0', '1', 'other'],
          create: [
            debugMatch([
              'lView[3] = document.createTextNode("no ")',
              '(lView[1] as Element).appendChild(lView[3])',
              'lView[4] = document.createElement("b")',
              '(lView[1] as Element).appendChild(lView[4])',
              '(lView[4] as Element).setAttribute("title", "none")',
              'lView[5] = document.createTextNode("emails")',
              '(lView[4] as Element).appendChild(lView[5])',
              'lView[6] = document.createTextNode("!")',
              '(lView[1] as Element).appendChild(lView[6])',
            ]),
            debugMatch([
              'lView[3] = document.createTextNode("one ")',
              '(lView[1] as Element).appendChild(lView[3])',
              'lView[4] = document.createElement("i")',
              '(lView[1] as Element).appendChild(lView[4])',
              'lView[5] = document.createTextNode("email")',
              '(lView[4] as Element).appendChild(lView[5])',
            ]),
            debugMatch([
              'lView[3] = document.createTextNode("")',
              '(lView[1] as Element).appendChild(lView[3])',
              'lView[4] = document.createElement("span")',
              '(lView[1] as Element).appendChild(lView[4])',
              'lView[5] = document.createTextNode("emails")',
              '(lView[4] as Element).appendChild(lView[5])',
            ])
          ],
          remove: [
            debugMatch([
              '(lView[0] as Element).remove(lView[3])',
              '(lView[0] as Element).remove(lView[5])',
              '(lView[0] as Element).remove(lView[4])',
              '(lView[0] as Element).remove(lView[6])',
            ]),
            debugMatch([
              '(lView[0] as Element).remove(lView[3])',
              '(lView[0] as Element).remove(lView[5])',
              '(lView[0] as Element).remove(lView[4])',
            ]),
            debugMatch([
              '(lView[0] as Element).remove(lView[3])',
              '(lView[0] as Element).remove(lView[5])',
              '(lView[0] as Element).remove(lView[4])',
            ])
          ],
          update: [
            debugMatch([]), debugMatch([]), debugMatch([
              'if (mask & 0b1) { (lView[3] as Text).textContent = `${lView[1]} `; }',
              'if (mask & 0b10) { (lView[4] as Element).setAttribute(\'title\', `${lView[2]}`); }'
            ])
          ]
        }]
      });
    });

    it('for nested ICU expressions', () => {
      const MSG_DIV = `{�0�, plural,
        =0 {zero}
        other {�0� {�1�, select,
                       cat {cats}
                       dog {dogs}
                       other {animals}
                     }!}
      }`;
      const nbConsts = 1;
      const index = 0;
      const opCodes = getOpCodes(() => {
        ɵɵi18nStart(index, MSG_DIV);
      }, null, nbConsts, index);
      const icuCommentNodeIndex = index + 1;
      const firstTextNodeIndex = index + 2;
      const nestedIcuCommentNodeIndex = index + 3;
      const lastTextNodeIndex = index + 4;
      const nestedTextNodeIndex = index + 5;
      const tIcuIndex = 1;
      const nestedTIcuIndex = 0;

      expect(opCodes).toEqual({
        vars: 9,
        create: debugMatch([
          'lView[1] = document.createComment("ICU 1")',
          '(lView[0] as Element).appendChild(lView[1])'
        ]),
        update: debugMatch([
          'if (mask & 0b1) { icuSwitchCase(lView[1] as Comment, 1, `${lView[1]}`); }',
          'if (mask & 0b11) { icuUpdateCase(lView[1] as Comment, 1); }'
        ]),
        icus: [
          {
            type: 0,
            vars: [2, 2, 2],
            currentCaseLViewIndex: 26,
            childIcus: [[], [], []],
            cases: ['cat', 'dog', 'other'],
            create: [
              debugMatch([
                'lView[7] = document.createTextNode("cats")',
                '(lView[4] as Element).appendChild(lView[7])'
              ]),
              debugMatch([
                'lView[7] = document.createTextNode("dogs")',
                '(lView[4] as Element).appendChild(lView[7])'
              ]),
              debugMatch([
                'lView[7] = document.createTextNode("animals")',
                '(lView[4] as Element).appendChild(lView[7])'
              ]),
            ],
            remove: [
              debugMatch(['(lView[0] as Element).remove(lView[7])']),
              debugMatch(['(lView[0] as Element).remove(lView[7])']),
              debugMatch(['(lView[0] as Element).remove(lView[7])'])
            ],
            update: [
              debugMatch([]),
              debugMatch([]),
              debugMatch([]),
            ]
          },
          {
            type: 1,
            vars: [2, 6],
            childIcus: [[], [0]],
            currentCaseLViewIndex: 22,
            cases: ['0', 'other'],
            create: [
              debugMatch([
                'lView[3] = document.createTextNode("zero")',
                '(lView[1] as Element).appendChild(lView[3])'
              ]),
              debugMatch([
                'lView[3] = document.createTextNode("")',
                '(lView[1] as Element).appendChild(lView[3])',
                'lView[4] = document.createComment("nested ICU 0")',
                '(lView[1] as Element).appendChild(lView[4])',
                'lView[5] = document.createTextNode("!")',
                '(lView[1] as Element).appendChild(lView[5])'
              ]),
            ],
            remove: [
              debugMatch(['(lView[0] as Element).remove(lView[3])']),
              debugMatch([
                '(lView[0] as Element).remove(lView[3])', '(lView[0] as Element).remove(lView[5])',
                'removeNestedICU(0)', '(lView[0] as Element).remove(lView[4])'
              ]),
            ],
            update: [
              debugMatch([]),
              debugMatch([
                'if (mask & 0b1) { (lView[3] as Text).textContent = `${lView[1]} `; }',
                'if (mask & 0b10) { icuSwitchCase(lView[4] as Comment, 0, `${lView[2]}`); }',
                'if (mask & 0b10) { icuUpdateCase(lView[4] as Comment, 0); }'
              ]),
            ]
          }
        ]
      });
    });
  });

  describe(`i18nAttribute`, () => {
    it('for text', () => {
      const MSG_title = `Hello world!`;
      const MSG_div_attr = ['title', MSG_title];
      const nbConsts = 2;
      const index = 1;
      const fixture = prepareFixture(() => {
        ɵɵelementStart(0, 'div');
        ɵɵi18nAttributes(index, MSG_div_attr);
        ɵɵelementEnd();
      }, null, nbConsts, index);
      const tView = fixture.hostView[TVIEW];
      const opCodes = tView.data[index + HEADER_OFFSET] as I18nUpdateOpCodes;

      expect(opCodes).toEqual([]);
      expect(
          (getNativeByIndex(0, fixture.hostView as LView) as any as Element).getAttribute('title'))
          .toEqual(MSG_title);
    });

    it('for simple bindings', () => {
      const MSG_title = `Hello �0�!`;
      const MSG_div_attr = ['title', MSG_title];
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(() => {
        ɵɵi18nAttributes(index, MSG_div_attr);
      }, null, nbConsts, index);

      expect(opCodes).toEqual(debugMatch([
        'if (mask & 0b1) { (lView[0] as Element).setAttribute(\'title\', `Hello ${lView[1]}!`); }'
      ]));
    });

    it('for multiple bindings', () => {
      const MSG_title = `Hello �0� and �1�, again �0�!`;
      const MSG_div_attr = ['title', MSG_title];
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(() => {
        ɵɵi18nAttributes(index, MSG_div_attr);
      }, null, nbConsts, index);

      expect(opCodes).toEqual(debugMatch([
        'if (mask & 0b11) { (lView[0] as Element).setAttribute(\'title\', `Hello ${lView[1]} and ${lView[2]}, again ${lView[1]}!`); }'
      ]));
    });

    it('for multiple attributes', () => {
      const MSG_title = `Hello �0�!`;
      const MSG_div_attr = ['title', MSG_title, 'aria-label', MSG_title];
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(() => {
        ɵɵi18nAttributes(index, MSG_div_attr);
      }, null, nbConsts, index);

      expect(opCodes).toEqual(debugMatch([
        'if (mask & 0b1) { (lView[0] as Element).setAttribute(\'title\', `Hello ${lView[1]}!`); }',
        'if (mask & 0b1) { (lView[0] as Element).setAttribute(\'aria-label\', `Hello ${lView[1]}!`); }'
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
});
