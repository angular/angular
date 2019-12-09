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

    d.setValue('one two');
    expect(d.value).toEqual({one: true, two: true});

    d.setValue('three');
    expect(d.value).toEqual({three: true});
  });

  it('should not emit that a value has changed if a new non-collection value was not set', () => {
    const d = new StylingDiffer(
        'ngClass', StylingDifferOptions.ForceAsMap | StylingDifferOptions.AllowStringValue);
    expect(d.value).toEqual(null);

    d.setValue('one two');
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({one: true, two: true});
    expect(d.hasValueChanged()).toBeFalsy();
    expect(d.value).toEqual({one: true, two: true});

    d.setValue('three');
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({three: true});
    expect(d.hasValueChanged()).toBeFalsy();
    expect(d.value).toEqual({three: true});

    d.setValue(null);
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual(null);
    expect(d.hasValueChanged()).toBeFalsy();
    expect(d.value).toEqual(null);
  });

  it('should watch the contents of a StringMap value and emit new values if they change', () => {
    const d = new StylingDiffer('ngClass', StylingDifferOptions.ForceAsMap);

    const myMap: {[key: string]: any} = {};
    myMap['abc'] = true;

    d.setValue(myMap);
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({abc: true});
    expect(d.hasValueChanged()).toBeFalsy();

    myMap['def'] = true;
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({abc: true, def: true});
    expect(d.hasValueChanged()).toBeFalsy();

    delete myMap['abc'];
    delete myMap['def'];
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({});
    expect(d.hasValueChanged()).toBeFalsy();
  });

  it('should watch the contents of an Array value and emit new values if they change', () => {
    const d = new StylingDiffer('ngClass', StylingDifferOptions.ForceAsMap);

    const myArray: string[] = [];
    myArray.push('abc');

    d.setValue(myArray);
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({abc: true});
    expect(d.hasValueChanged()).toBeFalsy();

    myArray.push('def');
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({abc: true, def: true});
    expect(d.hasValueChanged()).toBeFalsy();

    myArray.length = 0;
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({});
    expect(d.hasValueChanged()).toBeFalsy();
  });

  it('should watch the contents of a Set value and emit new values if they change', () => {
    const d = new StylingDiffer('ngClass', StylingDifferOptions.ForceAsMap);

    const mySet = new Set<string>();
    mySet.add('abc');

    d.setValue(mySet);
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({abc: true});
    expect(d.hasValueChanged()).toBeFalsy();

    mySet.add('def');
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({abc: true, def: true});
    expect(d.hasValueChanged()).toBeFalsy();

    mySet.clear();
    expect(d.hasValueChanged()).toBeTruthy();
    expect(d.value).toEqual({});
    expect(d.hasValueChanged()).toBeFalsy();
  });
});
