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
