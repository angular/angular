/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {form} from '../../../src/api/structure';
import {required, requiredTrue} from '../../../src/api/validators';
import {TestBed} from '@angular/core/testing';

describe('required validator', () => {
  it('returns required Error when the value is not present', () => {
    const cat = signal({name: ''});
    const f = form(cat, (p) => {
      required(p.name);
    }, {
      injector: TestBed.inject(Injector),
    });

    expect(f.name.$state.errors()).toEqual([{kind: 'required'}]);
    f.name.$state.value.set('pirojok-the-cat');
    expect(f.name.$state.errors()).toEqual([]);
  });

  it('supports custom errors', () => {
    const cat = signal({name: '', age: 5});
    const f = form(cat, (p) => {
      required(p.name, {
        errors: ctx => ({kind: 'required-' + ctx.valueOf(p.age)})
      });
    }, {
      injector: TestBed.inject(Injector),
    });

    expect(f.name.$state.errors()).toEqual([{kind: 'required-5'}]);
    f.name.$state.value.set('pirojok-the-cat');
    expect(f.name.$state.errors()).toEqual([]);
  });

  it('supports custom emptyPredicate', () => {
    const cat = signal({name: ''});
    const f = form(cat, (p) => {
      required(p.name, {
        emptyPredicate(value) {
          return value === 'empty';
        }
      });
    }, {
      injector: TestBed.inject(Injector),
    });

    expect(f.name.$state.errors()).toEqual([]);
    f.name.$state.value.set('empty');
    expect(f.name.$state.errors()).toEqual([{kind: 'required'}]);
  });


  it('supports custom condition', () => {
    const cat = signal({name: '', age: 5});
    const f = form(cat, (p) => {
      required(p.name, {
        when({valueOf}) {
          return valueOf(p.age) > 10;
        }
      });
    }, {
      injector: TestBed.inject(Injector),
    });

    expect(f.name.$state.errors()).toEqual([]);
    f.age.$state.value.set(15);
    expect(f.name.$state.errors()).toEqual([{kind: 'required'}]);
  });


});
