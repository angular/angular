/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {forwardRef, InjectionToken, ɵɵdirectiveInject} from '@angular/core';

import {expectProvidersScenario} from './providers_helper';

describe('es2015 providers', () => {
  abstract class Greeter {
    abstract greet: string;
  }

  const GREETER = new InjectionToken<Greeter>('greeter');

  class GreeterClass implements Greeter {
    greet = 'Class';
    hasBeenCleanedUp = false;

    ngOnDestroy() {
      this.hasBeenCleanedUp = true;
    }
  }

  it('ClassProvider wrapped in forwardRef', () => {
    let greeterInstance: GreeterClass|null = null;

    expectProvidersScenario({
      parent: {
        providers: [{provide: GREETER, useClass: forwardRef(() => GreeterClass)}],
        componentAssertion: () => {
          greeterInstance = ɵɵdirectiveInject(GREETER) as GreeterClass;
          expect(greeterInstance.greet).toEqual('Class');
        }
      }
    });

    expect(greeterInstance).not.toBeNull();
    expect(greeterInstance!.hasBeenCleanedUp).toBe(true);
  });
});
