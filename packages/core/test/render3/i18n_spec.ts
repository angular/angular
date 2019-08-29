/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {noop} from '../../../compiler/src/render3/view/util';
import {getTranslationForTemplate, ɵɵi18nAttributes, ɵɵi18nPostprocess, ɵɵi18nStart} from '../../src/render3/i18n';
import {setDelayProjection, ɵɵelementEnd, ɵɵelementStart} from '../../src/render3/instructions/all';
import {COMMENT_MARKER, ELEMENT_MARKER, I18nMutateOpCode, I18nUpdateOpCode, I18nUpdateOpCodes, TI18n} from '../../src/render3/interfaces/i18n';
import {HEADER_OFFSET, LView, TVIEW} from '../../src/render3/interfaces/view';
import {getNativeByIndex} from '../../src/render3/util/view_utils';
import {TemplateFixture} from './render_util';

describe('Runtime i18n', () => {
  afterEach(() => { setDelayProjection(false); });
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
      const opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV); }, null, nbConsts, index);

      // Check debug
      const debugOps = (opCodes as any).create.debug !.operations;
      expect(debugOps[0].__raw_opCode).toBe('simple text');
      expect(debugOps[0].type).toBe('Create Text Node');
      expect(debugOps[0].nodeIndex).toBe(1);
      expect(debugOps[0].text).toBe('simple text');
      expect(debugOps[1].__raw_opCode).toBe(1);
      expect(debugOps[1].type).toBe('AppendChild');
      expect(debugOps[1].nodeIndex).toBe(0);

      expect(opCodes).toEqual({
        vars: 1,
        create: [
          'simple text', nbConsts,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild
        ],
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
      const elementIndex = 2;
      const elementIndex2 = 3;
      const opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV); }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 5,
        create: [
          'Hello ',
          nbConsts,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          elementIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          'world',
          nbConsts + 1,
          elementIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          elementIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.ElementEnd,
          ' and ',
          nbConsts + 2,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          elementIndex2 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          'universe',
          nbConsts + 3,
          elementIndex2 << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          elementIndex2 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.ElementEnd,
          '!',
          nbConsts + 4,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
        ],
        update: [],
        icus: null
      });
    });

    it('for simple bindings', () => {
      const MSG_DIV = `Hello �0�!`;
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV); }, null, nbConsts, index);

      expect((opCodes as any).update.debug.operations).toEqual([
        {__raw_opCode: 8, checkBit: 1, type: 'Text', nodeIndex: 2, text: 'Hello �0�!'}
      ]);

      expect(opCodes).toEqual({
        vars: 1,
        create:
            ['', nbConsts, index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild],
        update: [
          0b1,  // bindings mask
          4,    // if no update, skip 4
          'Hello ',
          -1,  // binding index
          '!', (index + 1) << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Text
        ],
        icus: null
      });
    });

    it('for multiple bindings', () => {
      const MSG_DIV = `Hello �0� and �1�, again �0�!`;
      const nbConsts = 2;
      const index = 1;
      const opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV); }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 1,
        create:
            ['', nbConsts, index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild],
        update: [
          0b11,  // bindings mask
          8,     // if no update, skip 8
          'Hello ', -1, ' and ', -2, ', again ', -1, '!',
          (index + 1) << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Text
        ],
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
      let opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV); }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 2,
        create: [
          '',
          nbConsts,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          2 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          '!',
          nbConsts + 1,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
        ],
        update: [
          0b1,  //  bindings mask
          3,    // if no update, skip 3
          -1,   // binding index
          ' is rendered as: ', firstTextNode << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Text
        ],
        icus: null
      });


      /**** First sub-template ****/
      // �#1:1�before�*2:2�middle�/*2:2�after�/#1:1�
      nbConsts = 3;
      index = 0;
      const spanElement = 1;
      const bElementSubTemplate = 2;
      opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV, 1); }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 2,
        create: [
          spanElement << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          'before',
          nbConsts,
          spanElement << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          bElementSubTemplate << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select,
          spanElement << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          'after',
          nbConsts + 1,
          spanElement << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          spanElement << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.ElementEnd,
        ],
        update: [],
        icus: null
      });


      /**** Second sub-template ****/
      // middle
      nbConsts = 2;
      index = 0;
      const bElement = 1;
      opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV, 2); }, null, nbConsts, index);

      expect(opCodes).toEqual({
        vars: 1,
        create: [
          bElement << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          'middle',
          nbConsts,
          bElement << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
          bElement << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.ElementEnd,
        ],
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
      const opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV); }, null, nbConsts, index);
      const tIcuIndex = 0;
      const icuCommentNodeIndex = index + 1;
      const firstTextNodeIndex = index + 2;
      const bElementNodeIndex = index + 3;
      const iElementNodeIndex = index + 3;
      const spanElementNodeIndex = index + 3;
      const innerTextNode = index + 4;
      const lastTextNode = index + 5;

      const debugOps = (opCodes as any).update.debug.operations;
      expect(debugOps[0].__raw_opCode).toBe(6);
      expect(debugOps[0].checkBit).toBe(1);
      expect(debugOps[0].type).toBe('IcuSwitch');
      expect(debugOps[0].nodeIndex).toBe(1);
      expect(debugOps[0].tIcuIndex).toBe(0);
      expect(debugOps[0].mainBinding).toBe('�0�');

      expect(debugOps[1].__raw_opCode).toBe(7);
      expect(debugOps[1].checkBit).toBe(3);
      expect(debugOps[1].type).toBe('IcuUpdate');
      expect(debugOps[1].nodeIndex).toBe(1);
      expect(debugOps[1].tIcuIndex).toBe(0);

      const icuDebugOps = (opCodes as any).icus[0].create[0].debug.operations;
      let op: any;
      let i = 0;

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe('no ');
      expect(op.type).toBe('Create Text Node');
      expect(op.nodeIndex).toBe(2);
      expect(op.text).toBe('no ');

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe(131073);
      expect(op.type).toBe('AppendChild');
      expect(op.nodeIndex).toBe(1);

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toEqual({marker: 'element'});
      expect(op.type).toBe('ELEMENT_MARKER');

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe('b');
      expect(op.type).toBe('Create Text Node');
      expect(op.nodeIndex).toBe(3);
      expect(op.text).toBe('b');

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe(131073);
      expect(op.type).toBe('AppendChild');
      expect(op.nodeIndex).toBe(1);

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe(28);
      expect(op.type).toBe('Attr');
      expect(op.nodeIndex).toBe(3);
      expect(op.attrName).toBe('title');
      expect(op.attrValue).toBe('none');

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe('emails');
      expect(op.type).toBe('Create Text Node');
      expect(op.nodeIndex).toBe(4);
      expect(op.text).toBe('emails');

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe(393217);
      expect(op.type).toBe('AppendChild');
      expect(op.nodeIndex).toBe(3);

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe('!');
      expect(op.type).toBe('Create Text Node');
      expect(op.nodeIndex).toBe(5);
      expect(op.text).toBe('!');

      op = icuDebugOps[i++];
      expect(op.__raw_opCode).toBe(131073);
      expect(op.type).toBe('AppendChild');
      expect(op.nodeIndex).toBe(1);

      expect(opCodes).toEqual({
        vars: 5,
        create: [
          COMMENT_MARKER, 'ICU 1', icuCommentNodeIndex,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild
        ],
        update: [
          0b1,  // mask for ICU main binding
          3,    // skip 3 if not changed
          -1,   // icu main binding
          icuCommentNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuSwitch, tIcuIndex,
          0b11,  // mask for all ICU bindings
          2,     // skip 2 if not changed
          icuCommentNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate, tIcuIndex
        ],
        icus: [{
          type: 1,
          vars: [4, 3, 3],
          childIcus: [[], [], []],
          cases: ['0', '1', 'other'],
          create: [
            [
              'no ',
              firstTextNodeIndex,
              icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
              ELEMENT_MARKER,
              'b',
              bElementNodeIndex,
              icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
              bElementNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Attr,
              'title',
              'none',
              'emails',
              innerTextNode,
              bElementNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
              '!',
              lastTextNode,
              icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
            ],
            [
              'one ', firstTextNodeIndex,
              icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
              ELEMENT_MARKER, 'i', iElementNodeIndex,
              icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
              'email', innerTextNode,
              iElementNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild
            ],
            [
              '', firstTextNodeIndex,
              icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
              ELEMENT_MARKER, 'span', spanElementNodeIndex,
              icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
              'emails', innerTextNode,
              spanElementNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild
            ]
          ],
          remove: [
            [
              firstTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
              innerTextNode << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
              bElementNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
              lastTextNode << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
            ],
            [
              firstTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
              innerTextNode << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
              iElementNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
            ],
            [
              firstTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
              innerTextNode << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
              spanElementNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
            ]
          ],
          update: [
            [], [],
            [
              0b1,  // mask for the first binding
              3,    // skip 3 if not changed
              -1,   // binding index
              ' ',  // text string to concatenate to the binding value
              firstTextNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Text,
              0b10,  // mask for the title attribute binding
              4,     // skip 4 if not changed
              -2,    // binding index
              bElementNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Attr,
              'title',  // attribute name
              null      // sanitize function
            ]
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
      const opCodes = getOpCodes(() => { ɵɵi18nStart(index, MSG_DIV); }, null, nbConsts, index);
      const icuCommentNodeIndex = index + 1;
      const firstTextNodeIndex = index + 2;
      const nestedIcuCommentNodeIndex = index + 3;
      const lastTextNodeIndex = index + 4;
      const nestedTextNodeIndex = index + 5;
      const tIcuIndex = 1;
      const nestedTIcuIndex = 0;

      expect(opCodes).toEqual({
        vars: 6,
        create: [
          COMMENT_MARKER, 'ICU 1', icuCommentNodeIndex,
          index << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild
        ],
        update: [
          0b1,  // mask for ICU main binding
          3,    // skip 3 if not changed
          -1,   // icu main binding
          icuCommentNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuSwitch, tIcuIndex,
          0b11,  // mask for all ICU bindings
          2,     // skip 2 if not changed
          icuCommentNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate, tIcuIndex
        ],
        icus: [
          {
            type: 0,
            vars: [1, 1, 1],
            childIcus: [[], [], []],
            cases: ['cat', 'dog', 'other'],
            create: [
              [
                'cats', nestedTextNodeIndex, nestedIcuCommentNodeIndex
                        << I18nMutateOpCode.SHIFT_PARENT |
                    I18nMutateOpCode.AppendChild
              ],
              [
                'dogs', nestedTextNodeIndex, nestedIcuCommentNodeIndex
                        << I18nMutateOpCode.SHIFT_PARENT |
                    I18nMutateOpCode.AppendChild
              ],
              [
                'animals', nestedTextNodeIndex, nestedIcuCommentNodeIndex
                        << I18nMutateOpCode.SHIFT_PARENT |
                    I18nMutateOpCode.AppendChild
              ]
            ],
            remove: [
              [nestedTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove],
              [nestedTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove],
              [nestedTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove]
            ],
            update: [[], [], []]
          },
          {
            type: 1,
            vars: [1, 4],
            childIcus: [[], [0]],
            cases: ['0', 'other'],
            create: [
              [
                'zero', firstTextNodeIndex,
                icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild
              ],
              [
                '', firstTextNodeIndex,
                icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
                COMMENT_MARKER, 'nested ICU 0', nestedIcuCommentNodeIndex,
                icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild,
                '!', lastTextNodeIndex,
                icuCommentNodeIndex << I18nMutateOpCode.SHIFT_PARENT | I18nMutateOpCode.AppendChild
              ]
            ],
            remove: [
              [firstTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove],
              [
                firstTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
                lastTextNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
                0 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.RemoveNestedIcu,
                nestedIcuCommentNodeIndex << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Remove,
              ]
            ],
            update: [
              [],
              [
                0b1,  // mask for ICU main binding
                3,    // skip 3 if not changed
                -1,   // binding index
                ' ',  // text string to concatenate to the binding value
                firstTextNodeIndex << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Text,
                0b10,  // mask for inner ICU main binding
                3,     // skip 3 if not changed
                -2,    // inner ICU main binding
                nestedIcuCommentNodeIndex << I18nUpdateOpCode.SHIFT_REF |
                    I18nUpdateOpCode.IcuSwitch,
                nestedTIcuIndex,
                0b10,  // mask for all inner ICU bindings
                2,     // skip 2 if not changed
                nestedIcuCommentNodeIndex << I18nUpdateOpCode.SHIFT_REF |
                    I18nUpdateOpCode.IcuUpdate,
                nestedTIcuIndex
              ]
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
      const opCodes =
          getOpCodes(() => { ɵɵi18nAttributes(index, MSG_div_attr); }, null, nbConsts, index);

      expect(opCodes).toEqual([
        0b1,  // bindings mask
        6,    // if no update, skip 4
        'Hello ',
        -1,  // binding index
        '!', (index - 1) << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Attr, 'title', null
      ]);
    });

    it('for multiple bindings', () => {
      const MSG_title = `Hello �0� and �1�, again �0�!`;
      const MSG_div_attr = ['title', MSG_title];
      const nbConsts = 2;
      const index = 1;
      const opCodes =
          getOpCodes(() => { ɵɵi18nAttributes(index, MSG_div_attr); }, null, nbConsts, index);

      expect(opCodes).toEqual([
        0b11,  // bindings mask
        10,    // size
        'Hello ', -1, ' and ', -2, ', again ', -1, '!',
        (index - 1) << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Attr, 'title', null
      ]);
    });

    it('for multiple attributes', () => {
      const MSG_title = `Hello �0�!`;
      const MSG_div_attr = ['title', MSG_title, 'aria-label', MSG_title];
      const nbConsts = 2;
      const index = 1;
      const opCodes =
          getOpCodes(() => { ɵɵi18nAttributes(index, MSG_div_attr); }, null, nbConsts, index);

      expect(opCodes).toEqual([
        0b1,  // bindings mask
        6,    // if no update, skip 4
        'Hello ',
        -1,  // binding index
        '!', (index - 1) << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Attr, 'title', null,
        0b1,  // bindings mask
        6,    // if no update, skip 4
        'Hello ',
        -1,  // binding index
        '!', (index - 1) << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Attr, 'aria-label', null
      ]);
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
