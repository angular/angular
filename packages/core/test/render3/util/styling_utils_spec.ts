/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNode} from '@angular/core/src/render3/interfaces/node';
import {hasInitialClass, hasInitialStyle, splitOnWhitespace} from '@angular/core/src/render3/util/styling_utils';

describe('styling_utils', () => {
  describe('splitOnWhitespace', () => {
    it('should treat empty strings as null', () => {
      expect(splitOnWhitespace('')).toEqual(null);
      expect(splitOnWhitespace('  ')).toEqual(null);
      expect(splitOnWhitespace(' \n\r\t ')).toEqual(null);
    });

    it('should split strings into parts', () => {
      expect(splitOnWhitespace('a\nb\rc')).toEqual(['a', 'b', 'c']);
      expect(splitOnWhitespace('\ta-long\nb-long\rc-long ')).toEqual([
        'a-long', 'b-long', 'c-long'
      ]);
    });
  });

  describe('hasInitialClass', () => {
    it('should detect whether a class is defined on tNode.classes', () => {
      const tNode = { classes: null } as any as TNode;
      expect(hasInitialClass(tNode, 'one')).toBeFalsy();
      expect(hasInitialClass(tNode, 'two')).toBeFalsy();
      expect(hasInitialClass(tNode, 'three')).toBeFalsy();

      tNode.classes = 'one';
      expect(hasInitialClass(tNode, 'one')).toBeTruthy();
      expect(hasInitialClass(tNode, 'two')).toBeFalsy();
      expect(hasInitialClass(tNode, 'three')).toBeFalsy();

      tNode.classes = 'one two';
      expect(hasInitialClass(tNode, 'one')).toBeTruthy();
      expect(hasInitialClass(tNode, 'two')).toBeTruthy();
      expect(hasInitialClass(tNode, 'three')).toBeFalsy();

      tNode.classes = 'one two three';
      expect(hasInitialClass(tNode, 'one')).toBeTruthy();
      expect(hasInitialClass(tNode, 'two')).toBeTruthy();
      expect(hasInitialClass(tNode, 'three')).toBeTruthy();
    });
  });

  describe('hasInitialStyle', () => {
    it('should detect whether a style is defined on tNode.initialStyleNames', () => {
      const tNode = { initialStyleNames: null } as any as TNode;
      expect(hasInitialStyle(tNode, 'width')).toBeFalsy();
      expect(hasInitialStyle(tNode, 'height')).toBeFalsy();
      expect(hasInitialStyle(tNode, 'color')).toBeFalsy();

      tNode.initialStyleNames = ['width'];
      expect(hasInitialStyle(tNode, 'width')).toBeTruthy();
      expect(hasInitialStyle(tNode, 'height')).toBeFalsy();
      expect(hasInitialStyle(tNode, 'color')).toBeFalsy();

      tNode.initialStyleNames = ['width', 'height'];
      expect(hasInitialStyle(tNode, 'width')).toBeTruthy();
      expect(hasInitialStyle(tNode, 'height')).toBeTruthy();
      expect(hasInitialStyle(tNode, 'color')).toBeFalsy();

      tNode.initialStyleNames = ['width', 'height', 'color'];
      expect(hasInitialStyle(tNode, 'width')).toBeTruthy();
      expect(hasInitialStyle(tNode, 'height')).toBeTruthy();
      expect(hasInitialStyle(tNode, 'color')).toBeTruthy();
    });
  });
});
