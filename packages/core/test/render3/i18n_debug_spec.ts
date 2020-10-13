/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {i18nCreateOpCodesToString, i18nMutateOpCodesToString, i18nUpdateOpCodesToString} from '@angular/core/src/render3/i18n/i18n_debug';
import {ELEMENT_MARKER, I18nCreateOpCode, I18nMutateOpCode, I18nUpdateOpCode, ICU_MARKER} from '@angular/core/src/render3/interfaces/i18n';

describe('i18n debug', () => {
  describe('i18nUpdateOpCodesToString', () => {
    it('should print nothing', () => {
      expect(i18nUpdateOpCodesToString([])).toEqual([]);
    });

    it('should print text opCode', () => {
      expect(i18nUpdateOpCodesToString([
        0b11,
        4,
        'pre ',
        -4,
        ' post',
        1 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Text,
      ]))
          .toEqual(
              ['if (mask & 0b11) { (lView[1] as Text).textContent = `pre ${lView[i-4]} post`; }']);
    });

    it('should print Attribute opCode', () => {
      expect(i18nUpdateOpCodesToString([
        0b01,    8,
        'pre ',  -4,
        ' in ',  -3,
        ' post', 1 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Attr,
        'title', null,
        0b10,    8,
        'pre ',  -4,
        ' in ',  -3,
        ' post', 1 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Attr,
        'title', (v) => v,
      ]))
          .toEqual([
            'if (mask & 0b1) { (lView[1] as Element).setAttribute(\'title\', `pre ${lView[i-4]} in ${lView[i-3]} post`); }',
            'if (mask & 0b10) { (lView[1] as Element).setAttribute(\'title\', (function (v) { return v; })(`pre ${lView[i-4]} in ${lView[i-3]} post`)); }'
          ]);
    });

    it('should print icuSwitch opCode', () => {
      expect(i18nUpdateOpCodesToString([
        0b100, 2, -5, 12 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuSwitch
      ])).toEqual(['if (mask & 0b100) { icuSwitchCase(12, `${lView[i-5]}`); }']);
    });

    it('should print icuUpdate opCode', () => {
      expect(i18nUpdateOpCodesToString([
        0b1000, 1, 13 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate
      ])).toEqual(['if (mask & 0b1000) { icuUpdateCase(13); }']);
    });
  });

  describe('i18nMutateOpCodesToString', () => {
    it('should print nothing', () => {
      expect(i18nMutateOpCodesToString([])).toEqual([]);
    });

    it('should print text AppendChild', () => {
      expect(i18nMutateOpCodesToString([
        'xyz', 0,
        1 << I18nMutateOpCode.SHIFT_PARENT | 0 << I18nMutateOpCode.SHIFT_REF |
            I18nMutateOpCode.AppendChild
      ]))
          .toEqual([
            'lView[0] = document.createTextNode("xyz")',
            '(lView[1] as Element).appendChild(lView[0])'
          ]);
    });


    it('should print element AppendChild', () => {
      expect(i18nMutateOpCodesToString([
        ELEMENT_MARKER, 'xyz', 0,
        1 << I18nMutateOpCode.SHIFT_PARENT | 0 << I18nMutateOpCode.SHIFT_REF |
            I18nMutateOpCode.AppendChild
      ]))
          .toEqual([
            'lView[0] = document.createElement("xyz")',
            '(lView[1] as Element).appendChild(lView[0])'
          ]);
    });

    it('should print comment AppendChild', () => {
      expect(i18nMutateOpCodesToString([
        ICU_MARKER, 'xyz', 0,
        1 << I18nMutateOpCode.SHIFT_PARENT | 0 << I18nMutateOpCode.SHIFT_REF |
            I18nMutateOpCode.AppendChild
      ]))
          .toEqual([
            'lView[0] = document.createComment("xyz")',
            '(lView[1] as Element).appendChild(lView[0])'
          ]);
    });

    it('should print Remove', () => {
      expect(i18nMutateOpCodesToString([
        2 << I18nMutateOpCode.SHIFT_PARENT | 0 << I18nMutateOpCode.SHIFT_REF |
        I18nMutateOpCode.Remove
      ])).toEqual(['(lView[2] as Element).remove(lView[0])']);
    });

    it('should print Attr', () => {
      expect(i18nMutateOpCodesToString([
        1 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Attr, 'attr', 'value'
      ])).toEqual(['(lView[1] as Element).setAttribute("attr", "value")']);
    });

    it('should print RemoveNestedIcu', () => {
      expect(i18nMutateOpCodesToString([
        1 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.RemoveNestedIcu,
      ])).toEqual(['removeNestedICU(1)']);
    });
  });

  describe('i18nCreateOpCodesToString', () => {
    it('should print nothing', () => {
      expect(i18nCreateOpCodesToString([])).toEqual([]);
    });

    it('should print text/comment creation', () => {
      expect(i18nCreateOpCodesToString([
        10 << I18nCreateOpCode.SHIFT, 'text at 10',                                            //
        11 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.APPEND_EAGERLY, 'text at 11, append',  //
        12 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.COMMENT, 'comment at 12',              //
        13 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.COMMENT | I18nCreateOpCode.APPEND_EAGERLY,
        'comment at 13, append',  //
      ]))
          .toEqual([
            'lView[10] = document.createText("text at 10");',
            'lView[11] = document.createText("text at 11, append");',
            'parent.appendChild(lView[11]);',
            'lView[12] = document.createComment("comment at 12");',
            'lView[13] = document.createComment("comment at 13, append");',
            'parent.appendChild(lView[13]);',
          ]);
    });
  });
});
