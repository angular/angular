/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extendsDirectlyFromObject} from '../../../src/render3/jit/directive';

describe('extendsDirectlyFromObject', () => {
  it('should correctly behave with instanceof', () => {
    expect(new Child() instanceof Object).toBeTruthy();
    expect(new Child() instanceof Parent).toBeTruthy();
    expect(new Parent() instanceof Child).toBeFalsy();

    expect(new Child5() instanceof Object).toBeTruthy();
    expect(new Child5() instanceof Parent5).toBeTruthy();
    expect(new Parent5() instanceof Child5).toBeFalsy();
  });

  it('should detect direct inheritance form Object', () => {
    expect(extendsDirectlyFromObject(Parent)).toBeTruthy();
    expect(extendsDirectlyFromObject(Child)).toBeFalsy();

    expect(extendsDirectlyFromObject(Parent5)).toBeTruthy();
    expect(extendsDirectlyFromObject(Child5)).toBeFalsy();
  });
});

// Inheritance Example using Classes
class Parent {}
class Child extends Parent {}

// Inheritance Example using Function
const Parent5 = function Parent5() {} as any as{new (): {}};
const Child5 = function Child5() {} as any as{new (): {}};
Child5.prototype = new Parent5;
Child5.prototype.constructor = Child5;
