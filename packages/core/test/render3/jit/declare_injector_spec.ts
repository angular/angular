/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, ɵɵInjectorDef, ɵɵngDeclareInjector} from '@angular/core';

describe('Injector declaration jit compilation', () => {
  it('should compile a minimal Injector declaration', () => {
    const def = ɵɵngDeclareInjector({type: TestClass}) as ɵɵInjectorDef<TestClass>;

    expect(def.providers).toEqual([]);
    expect(def.imports).toEqual([]);
  });

  it('should compile an Injector declaration with providers', () => {
    class OtherClass {}
    const TestToken = new InjectionToken('TestToken');
    const testTokenValue = {};
    const def = ɵɵngDeclareInjector({
                  type: TestClass,
                  providers: [OtherClass, {provide: TestToken, useValue: testTokenValue}]
                }) as ɵɵInjectorDef<TestClass>;

    expect(def.providers).toEqual([OtherClass, {provide: TestToken, useValue: testTokenValue}]);
    expect(def.imports).toEqual([]);
  });

  it('should compile an Injector declaration with imports', () => {
    const OtherInjector: any = {};
    const def = ɵɵngDeclareInjector({type: TestClass, imports: [OtherInjector]}) as
        ɵɵInjectorDef<TestClass>;

    expect(def.providers).toEqual([]);
    expect(def.imports).toEqual([OtherInjector]);
  });
});

class TestClass {}
