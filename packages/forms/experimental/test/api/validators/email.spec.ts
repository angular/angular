/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {form} from '../../../src/api/structure';
import {email} from '../../../src/api/validators';
import {TestBed} from '@angular/core/testing';

describe('email validator', () => {
  it('returns requiredTrue error when the value is false', () => {
    const cat = signal({name: 'pirojok-the-cat', email: 'cat@cat.meow'});
    const f = form(cat, (p) => {
      email(p.email);
    }, {
      injector: TestBed.inject(Injector),
    });

    expect(f.email.$state.errors()).toEqual([]);
    f.email.$state.value.set('not-real-email');
    expect(f.email.$state.errors()).toEqual([{kind: 'email'}]);
  });

  it('supports custom errors', () => {
    const cat = signal({name: 'pirojok-the-cat', email: ''});
    const f = form(cat, (p) => {
      email(p.email, {errors: ctx => ({kind: 'special-email-' + ctx.valueOf(p.name)})});
    }, {
      injector: TestBed.inject(Injector),
    });


    expect(f.email.$state.errors()).toEqual([{kind: 'special-email-pirojok-the-cat'}]);
  });
});
