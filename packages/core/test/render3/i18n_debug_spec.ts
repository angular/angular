/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {i18nMutateOpCodesToString, i18nUpdateOpCodesToString} from '@angular/core/src/render3/i18n_debug';
import {COMMENT_MARKER, ELEMENT_MARKER, I18nMutateOpCode, I18nUpdateOpCode} from '@angular/core/src/render3/interfaces/i18n';

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
              ['if (mask & 0b11) { (lView[1] as Text).textContent = `pre ${lView[4]} post`; }']);
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
            'if (mask & 0b1) { (lView[1] as Element).setAttribute(\'title\', `pre ${lView[4]} in ${lView[3]} post`); }',
            'if (mask & 0b10) { (lView[1] as Element).setAttribute(\'title\', (function (v) { return v; })(`pre ${lView[4]} in ${lView[3]} post`)); }'
          ]);
    });

    it('should print icuSwitch opCode', () => {
      expect(i18nUpdateOpCodesToString([
        0b100, 2, -5, 12 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuSwitch,
        2  // FIXME(misko): Should be part of IcuSwitch
      ])).toEqual(['if (mask & 0b100) { icuSwitchCase(lView[12] as Comment, 2, `${lView[5]}`); }']);
    });

    it('should print icuUpdate opCode', () => {
      expect(i18nUpdateOpCodesToString([
        0b1000, 2, 13 << I18nUpdateOpCode.SHIFT_REF | I18nUpdateOpCode.IcuUpdate,
        3  // FIXME(misko): should be part of IcuUpdate
      ])).toEqual(['if (mask & 0b1000) { icuUpdateCase(lView[13] as Comment, 3); }']);
    });
  });

  describe('i18nMutateOpCodesToString', () => {
    it('should print nothing', () => {
      expect(i18nMutateOpCodesToString([])).toEqual([]);
    });

    it('should print Move', () => {
      expect(i18nMutateOpCodesToString([
        1 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.Select,
        2 << I18nMutateOpCode.SHIFT_PARENT | 0 << I18nMutateOpCode.SHIFT_REF |
            I18nMutateOpCode.AppendChild,
      ])).toEqual(['(lView[2] as Element).appendChild(lView[1])']);
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
        COMMENT_MARKER, 'xyz', 0,
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

    it('should print ElementEnd', () => {
      expect(i18nMutateOpCodesToString([
        1 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.ElementEnd,
      ])).toEqual(['setPreviousOrParentTNode(tView.data[1] as TNode)']);
    });

    it('should print RemoveNestedIcu', () => {
      expect(i18nMutateOpCodesToString([
        1 << I18nMutateOpCode.SHIFT_REF | I18nMutateOpCode.RemoveNestedIcu,
      ])).toEqual(['removeNestedICU(1)']);
    });
  });
});
