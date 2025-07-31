/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {form, hidden, validate, ValidationError} from '@angular/forms/experimental';
import {TestBed} from '@angular/core/testing';

describe('hidden', () => {
  it('should initially be false', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        hidden(p, ({value}) => {
          return value.name === 'hidden-cat';
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().hidden()).toBe(false);
    expect(f.name().hidden()).toBe(false);
  });

  it('returns true when condition is met', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        hidden(p.name, ({value}) => {
          return value() === 'hidden-cat';
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    f.name().value.set('hidden-cat');
    expect(f.name().hidden()).toBe(true);
  });

  it('propagates the value down', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        hidden(p, ({value}) => {
          return value().name === 'hidden-cat';
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    f.name().value.set('hidden-cat');
    expect(f.name().hidden()).toBe(true);
    expect(f().hidden()).toBe(true);
  });

  it('disables validation for the field', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        hidden(p.name, ({value}) => {
          return value() === 'hidden-cat';
        });

        validate(p.name, () => {
          return ValidationError.custom({kind: 'dog'});
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().valid()).withContext('Name is intially invalid').toBeFalse();
    expect(f().valid()).withContext('Form is intially invalid').toBeFalse();

    f.name().value.set('hidden-cat');
    expect(f.name().hidden()).toBeTrue();
    expect(f.name().valid()).toBeTrue();
    expect(f().valid()).toBeTrue();

    f.name().value.set('visible-cat');
    expect(f.name().valid()).toBeFalse();
    expect(f().valid()).toBeFalse();
  });

  xit('disables touch state propagation?', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        hidden(p.name, ({value}) => {
          return value() === 'hidden-cat';
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().touched()).withContext('Name is intially untouched').toBeFalse();
    expect(f().touched()).withContext('Form is intially intouched').toBeFalse();

    f.name().markAsTouched();
    expect(f.name().touched()).toBeTrue();
    expect(f().touched()).toBeTrue();

    f.name().value.set('hidden-cat');

    expect(f.name().touched()).withContext('hidden name is not touched').toBeFalse();
    expect(f().touched())
      .withContext('form with a hidden touched field is not touched')
      .toBeFalse();
  });
});
