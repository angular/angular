/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

describe('defineProperty', function() {
  it('should not throw when defining length on an array', function() {
    const someArray: any[] = [];
    expect(() => Object.defineProperty(someArray, 'length', {value: 2, writable: false}))
        .not.toThrow();
  });

  it('should not be able to change a frozen desc', function() {
    const obj = {};
    const desc = Object.freeze({value: null, writable: true});
    Object.defineProperty(obj, 'prop', desc);
    let objDesc: any = Object.getOwnPropertyDescriptor(obj, 'prop');
    expect(objDesc.writable).toBeTruthy();
    try {
      Object.defineProperty(obj, 'prop', {configurable: true, writable: true, value: 'test'});
    } catch (err) {
    }
    objDesc = Object.getOwnPropertyDescriptor(obj, 'prop');
    expect(objDesc.configurable).toBeFalsy();
  });

  it('should not throw error when try to defineProperty with a frozen obj', function() {
    const obj = {};
    Object.freeze(obj);
    try {
      Object.defineProperty(obj, 'prop', {configurable: true, writable: true, value: 'value'});
    } catch (err) {
    }
    expect((obj as any).prop).toBeFalsy();
  });
});

describe('defineProperties', () => {
  it('should set string props', () => {
    const obj: any = {};
    Object.defineProperties(obj, {
      'property1': {value: true, writable: true, enumerable: true},
      'property2': {value: 'Hello', writable: false, enumerable: true},
      'property3': {
        enumerable: true,
        get: () => {
          return obj.p3
        },
        set: (val: string) => obj.p3 = val
      },
      'property4': {enumerable: false, writable: true, value: 'hidden'}
    });
    expect(Object.keys(obj).sort()).toEqual(['property1', 'property2', 'property3']);
    expect(obj.property1).toBeTrue();
    expect(obj.property2).toEqual('Hello');
    expect(obj.property3).toBeUndefined();
    expect(obj.property4).toEqual('hidden');
    obj.property1 = false;
    expect(obj.property1).toBeFalse();
    expect(() => obj.property2 = 'new Hello').toThrow();
    obj.property3 = 'property3';
    expect(obj.property3).toEqual('property3');
    obj.property4 = 'property4';
    expect(obj.property4).toEqual('property4');
  });
  it('should set symbol props', () => {
    let a = Symbol();
    let b = Symbol();
    const obj: any = {};
    Object.defineProperties(obj, {
      [a]: {value: true, writable: true},
      [b]: {get: () => obj.b1, set: (val: string) => obj.b1 = val}
    });
    expect(Object.keys(obj)).toEqual([]);
    expect(obj[a]).toBeTrue();
    expect(obj[b]).toBeUndefined();
    obj[a] = false;
    expect(obj[a]).toBeFalse();
    obj[b] = 'b1';
    expect(obj[b]).toEqual('b1');
  });
  it('should set string and symbol props', () => {
    let a = Symbol();
    const obj: any = {};
    Object.defineProperties(obj, {
      [a]: {value: true, writable: true},
      'property1': {value: true, writable: true, enumerable: true},
    });
    expect(Object.keys(obj)).toEqual(['property1']);
    expect(obj.property1).toBeTrue();
    expect(obj[a]).toBeTrue();
    obj.property1 = false;
    expect(obj.property1).toBeFalse();
    obj[a] = false;
    expect(obj[a]).toBeFalse();
  });
});
