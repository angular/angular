/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {getComponentInfo, parseFields} from '@angular/upgrade/src/dynamic/metadata';

export function main() {
  describe('upgrade metadata', () => {
    it('should extract component selector', () => {
      expect(getComponentInfo(ElementNameComponent).selector).toBe('element-name-dashed');
    });


    describe('errors', () => {
      it('should throw on missing selector', () => {
        expect(() => getComponentInfo(NoAnnotationComponent))
            .toThrowError('No Directive annotation found on NoAnnotationComponent');
      });
    });

    describe('parseFields', () => {
      it('should process nulls', () => { expect(parseFields(null)).toEqual([]); });

      it('should process values', () => {
        expect(parseFields([' name ', ' prop :  attr '])).toEqual([
          jasmine.objectContaining({
            prop: 'name',
            attr: 'name',
            bracketAttr: '[name]',
            parenAttr: '(name)',
            bracketParenAttr: '[(name)]',
            onAttr: 'onName',
            bindAttr: 'bindName',
            bindonAttr: 'bindonName'
          }),
          jasmine.objectContaining({
            prop: 'prop',
            attr: 'attr',
            bracketAttr: '[attr]',
            parenAttr: '(attr)',
            bracketParenAttr: '[(attr)]',
            onAttr: 'onAttr',
            bindAttr: 'bindAttr',
            bindonAttr: 'bindonAttr'
          })
        ]);
      });
    });
  });
}

@Component({selector: 'element-name-dashed', template: ``})
class ElementNameComponent {
}

@Component({selector: '[attr-name]', template: ``})
class AttributeNameComponent {
}

class NoAnnotationComponent {}
