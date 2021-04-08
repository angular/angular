/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Input, Type, ɵɵngDeclareClassMetadata} from '@angular/core';

interface Decorator {
  type: any;
  args?: any[];
}

interface HasMetadata extends Type<any> {
  decorators?: Decorator[];
  ctorParameters?: () => CtorParameter[];
  propDecorators?: {[field: string]: Decorator[]};
}

interface CtorParameter {
  type: any;
  decorators?: Decorator[];
}

function metadataOf(value: Type<any>): HasMetadata {
  return value as HasMetadata;
}

describe('class metadata declaration jit compilation', () => {
  it('should attach class decorators', () => {
    const TestClass = metadataOf(class TestClass {});
    ɵɵngDeclareClassMetadata({
      type: TestClass,
      decorators: [{
        type: Injectable,
        args: [],
      }],
    });

    expect(TestClass.decorators!.length).toBe(1);
    expect(TestClass.decorators![0].type).toBe(Injectable);
    expect(TestClass.propDecorators).toBeUndefined();
    expect(TestClass.ctorParameters).toBeUndefined();
  });

  it('should attach property decorators', () => {
    const TestClass = metadataOf(class TestClass {});
    ɵɵngDeclareClassMetadata({
      type: TestClass,
      decorators: [{
        type: Injectable,
        args: [],
      }],
      propDecorators: {
        test: [{type: Input, args: []}],
      },
    });

    expect(TestClass.decorators!.length).toBe(1);
    expect(TestClass.decorators![0].type).toBe(Injectable);
    expect(TestClass.propDecorators).toEqual({
      test: [{type: Input, args: []}],
    });
    expect(TestClass.ctorParameters).toBeUndefined();
  });

  it('should attach constructor parameters', () => {
    const TestClass = metadataOf(class TestClass {});
    ɵɵngDeclareClassMetadata({
      type: TestClass,
      decorators: [{
        type: Injectable,
        args: [],
      }],
      ctorParameters: () => [{type: String}],
    });

    expect(TestClass.decorators!.length).toBe(1);
    expect(TestClass.decorators![0].type).toBe(Injectable);
    expect(TestClass.propDecorators).toBeUndefined();
    expect(TestClass.ctorParameters!()).toEqual([{type: String}]);
  });
});
