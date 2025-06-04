/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {form} from '../../../src/api/structure';
import {requiredTrue} from '../../../src/api/validators';
import {TestBed} from '@angular/core/testing';

describe('requiredTrue validator', () => {
  it('returns requiredTrue error when the value is false', () => {
    const cat = signal({name: 'pirojok-the-cat', isNice: false});
    const f = form(cat, (p) => {
      requiredTrue(p.isNice);
    }, {
      injector: TestBed.inject(Injector),
    });

    expect(f.isNice.$state.errors()).toEqual([{kind: 'requiredTrue'}]);
    // 😻
    f.isNice.$state.value.set(true);
    expect(f.isNice.$state.errors()).toEqual([]);
  });

  it('returns requiredTrue error when the value is false', () => {
    const cat = signal({name: 'pirojok-the-cat', isNice: false});
    const f = form(cat, (p) => {
      requiredTrue(p.isNice, {
        errors: ({valueOf}) => {
          return {kind: 'mustBeNice', message: valueOf(p.name)};
        }
      });
    }, {
      injector: TestBed.inject(Injector),
    });

    expect(f.isNice.$state.errors()).toEqual([{
      kind: 'mustBeNice',
      message: 'pirojok-the-cat'
    }]);
  });
});
