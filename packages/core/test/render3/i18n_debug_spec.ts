/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {i18nCreateOpCodesToString, i18nRemoveOpCodesToString, i18nUpdateOpCodesToString, icuCreateOpCodesToString} from '@angular/core/src/render3/i18n/i18n_debug';
import {ELEMENT_MARKER, I18nCreateOpCode, I18nCreateOpCodes, I18nRemoveOpCodes, I18nUpdateOpCode, I18nUpdateOpCodes, ICU_MARKER, IcuCreateOpCode} from '@angular/core/src/render3/interfaces/i18n';

describe('i18n debug', () => {
  describe('i18nUpdateOpCodesToString', () => {
    it('should print nothing', () => {
      expect(i18nUpdateOpCodesToString([] as unknown as I18nUpdateOpCodes)).toEqual([]);
    });

    it('should print text opCode', () => {
      expect(i18nUpdateOpCodesToString([
        0b11,
        4,
        'pre ',
        -4,
        ' post',
        1 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.Text,
      ] as unknown as I18nUpdateOpCodes))
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
        'title', (v: any) => v,
      ] as unknown as I18nUpdateOpCodes))
          .toEqual([
            'if (mask & 0b1) { (lView[1] as Element).setAttribute(\'title\', `pre ${lView[i-4]} in ${lView[i-3]} post`); }',
            'if (mask & 0b10) { (lView[1] as Element).setAttribute(\'title\', (function (v) { return v; })(`pre ${lView[i-4]} in ${lView[i-3]} post`)); }'
          ]);
    });

    it('should print icuSwitch opCode', () => {
      expect(i18nUpdateOpCodesToString(
                 [0b100, 2, -5, 12 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuSwitch] as
                 unknown as I18nUpdateOpCodes))
          .toEqual(['if (mask & 0b100) { icuSwitchCase(12, `${lView[i-5]}`); }']);
    });

    it('should print icuUpdate opCode', () => {
      expect(i18nUpdateOpCodesToString(
                 [0b1000, 1, 13 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate] as
                 unknown as I18nUpdateOpCodes))
          .toEqual(['if (mask & 0b1000) { icuUpdateCase(13); }']);
    });
  });

  describe('i18nMutateOpCodesToString', () => {
    it('should print nothing', () => {
      expect(icuCreateOpCodesToString([] as unknown as I18nCreateOpCodes)).toEqual([]);
    });

    it('should print text AppendChild', () => {
      expect(icuCreateOpCodesToString([
        'xyz', 0,
        1 << IcuCreateOpCode.SHIFT_PARENT | 0 << IcuCreateOpCode.SHIFT_REF |
            IcuCreateOpCode.AppendChild
      ] as unknown as I18nCreateOpCodes))
          .toEqual([
            'lView[0] = document.createTextNode("xyz")',
            '(lView[1] as Element).appendChild(lView[0])'
          ]);
    });


    it('should print element AppendChild', () => {
      expect(icuCreateOpCodesToString([
        ELEMENT_MARKER, 'xyz', 0,
        1 << IcuCreateOpCode.SHIFT_PARENT | 0 << IcuCreateOpCode.SHIFT_REF |
            IcuCreateOpCode.AppendChild
      ] as unknown as I18nCreateOpCodes))
          .toEqual([
            'lView[0] = document.createElement("xyz")',
            '(lView[1] as Element).appendChild(lView[0])'
          ]);
    });

    it('should print comment AppendChild', () => {
      expect(icuCreateOpCodesToString([
        ICU_MARKER, 'xyz', 0,
        1 << IcuCreateOpCode.SHIFT_PARENT | 0 << IcuCreateOpCode.SHIFT_REF |
            IcuCreateOpCode.AppendChild
      ] as unknown as I18nCreateOpCodes))
          .toEqual([
            'lView[0] = document.createComment("xyz")',
            '(lView[1] as Element).appendChild(lView[0])'
          ]);
    });

    it('should print Remove', () => {
      expect(i18nRemoveOpCodesToString([123] as unknown as I18nRemoveOpCodes)).toEqual([
        'remove(lView[123])'
      ]);
    });

    it('should print Attr', () => {
      expect(icuCreateOpCodesToString(
                 [1 << IcuCreateOpCode.SHIFT_REF | IcuCreateOpCode.Attr, 'attr', 'value'] as
                 unknown as I18nCreateOpCodes))
          .toEqual(['(lView[1] as Element).setAttribute("attr", "value")']);
    });

    it('should print RemoveNestedIcu', () => {
      expect(i18nRemoveOpCodesToString([~123] as unknown as I18nRemoveOpCodes)).toEqual([
        'removeNestedICU(123)'
      ]);
    });
  });

  describe('i18nCreateOpCodesToString', () => {
    it('should print nothing', () => {
      expect(i18nCreateOpCodesToString([] as unknown as I18nCreateOpCodes)).toEqual([]);
    });

    it('should print text/comment creation', () => {
      expect(i18nCreateOpCodesToString([
        10 << I18nCreateOpCode.SHIFT, 'text at 10',                                            //
        11 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.APPEND_EAGERLY, 'text at 11, append',  //
        12 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.COMMENT, 'comment at 12',              //
        13 << I18nCreateOpCode.SHIFT | I18nCreateOpCode.COMMENT | I18nCreateOpCode.APPEND_EAGERLY,
        'comment at 13, append',  //
      ] as unknown as I18nCreateOpCodes))
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
