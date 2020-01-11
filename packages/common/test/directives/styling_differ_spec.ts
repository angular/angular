/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {StylingDiffer, StylingDifferOptions} from '@angular/common/src/directives/styling_differ';

describe('StylingDiffer', () => {
  it('should create a key/value object of values from a string', () => {
    const d = new StylingDiffer(
        'ngClass', StylingDifferOptions.ForceAsMap | StylingDifferOptions.AllowStringValue);
    expect(d.value).toEqual(null);

    d.setInput('one two');
    expect(d.value).toEqual({one: true, two: true});

    d.setInput('three');
    expect(d.value).toEqual({three: true});
  });


  describe('setInput', () => {

    it('should not emit that a value has changed if a new non-collection value was not set', () => {
      const d = new StylingDiffer(
          'ngClass', StylingDifferOptions.ForceAsMap | StylingDifferOptions.AllowStringValue);
      expect(d.value).toEqual(null);

      d.setInput('one two');
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({one: true, two: true});
      expect(d.updateValue()).toBeFalsy();
      expect(d.value).toEqual({one: true, two: true});

      d.setInput('three');
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({three: true});
      expect(d.updateValue()).toBeFalsy();
      expect(d.value).toEqual({three: true});

      d.setInput(null);
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual(null);
      expect(d.updateValue()).toBeFalsy();
      expect(d.value).toEqual(null);
    });
  });


  describe('updateValue', () => {

    it('should update the differ value if the contents of a input StringMap change', () => {
      const d = new StylingDiffer('ngClass', StylingDifferOptions.ForceAsMap);

      const myMap: {[key: string]: true} = {};
      myMap['abc'] = true;

      d.setInput(myMap);
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({abc: true});
      expect(d.updateValue()).toBeFalsy();

      myMap['def'] = true;
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({abc: true, def: true});
      expect(d.updateValue()).toBeFalsy();

      delete myMap['abc'];
      delete myMap['def'];
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({});
      expect(d.updateValue()).toBeFalsy();
    });


    it('should update the differ value if the contents of an input Array change', () => {
      const d = new StylingDiffer('ngClass', StylingDifferOptions.ForceAsMap);

      const myArray: string[] = [];
      myArray.push('abc');

      d.setInput(myArray);
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({abc: true});
      expect(d.updateValue()).toBeFalsy();

      myArray.push('def');
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({abc: true, def: true});
      expect(d.updateValue()).toBeFalsy();

      myArray.length = 0;
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({});
      expect(d.updateValue()).toBeFalsy();
    });


    it('should update the differ value if the contents of an input Set change', () => {
      const d = new StylingDiffer('ngClass', StylingDifferOptions.ForceAsMap);

      const mySet = new Set<string>();
      mySet.add('abc');

      d.setInput(mySet);
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({abc: true});
      expect(d.updateValue()).toBeFalsy();

      mySet.add('def');
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({abc: true, def: true});
      expect(d.updateValue()).toBeFalsy();

      mySet.clear();
      expect(d.updateValue()).toBeTruthy();
      expect(d.value).toEqual({});
      expect(d.updateValue()).toBeFalsy();
    });
  });
});
