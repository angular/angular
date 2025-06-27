/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {email, form} from '../../../../public_api';

describe('email validator', () => {
  it('returns requiredTrue error when the value is false', () => {
    const cat = signal({name: 'pirojok-the-cat', email: 'cat@cat.meow'});
    const f = form(
      cat,
      (p) => {
        email(p.email);
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.email().errors()).toEqual([]);
    f.email().value.set('not-real-email');
    expect(f.email().errors()).toEqual([{kind: 'email'}]);
  });

  it('supports custom errors', () => {
    const cat = signal({name: 'pirojok-the-cat', email: ''});
    const f = form(
      cat,
      (p) => {
        email(p.email, {errors: (ctx) => ({kind: 'special-email-' + ctx.valueOf(p.name)})});
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.email().errors()).toEqual([{kind: 'special-email-pirojok-the-cat'}]);
  });
});
