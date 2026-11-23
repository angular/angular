/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, readonly, required, validate} from '@angular/forms/signals';

describe('readonly', () => {
  it('should initially be false', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        readonly(p, {
          when: ({value}) => {
            return value().name === 'readonly-cat';
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().readonly()).toBe(false);
    expect(f.name().readonly()).toBe(false);
  });

  it('returns true when condition is met', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        readonly(p.name, {
          when: ({value}) => {
            return value() === 'readonly-cat';
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().readonly()).toBe(false);
    f.name().value.set('readonly-cat');
    expect(f.name().readonly()).toBe(true);
  });

  it('returns true when config is empty object', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        readonly(p.name, {});
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().readonly()).toBe(true);
  });

  it('returns true when configOrLogic is omitted', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        readonly(p.name);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().readonly()).withContext('Name is permanently readonly').toBeTrue();

    f.name().value.set('some-other-cat');
    expect(f.name().readonly()).toBeTrue();
  });

  it('propagates the value down', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        readonly(p, {
          when: ({value}) => {
            return value().name === 'readonly-cat';
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    f.name().value.set('readonly-cat');
    expect(f.name().readonly()).toBe(true);
    expect(f().readonly()).toBe(true);
  });

  it('disables validation for the field', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        readonly(p.name, {
          when: ({value}) => {
            return value() === 'readonly-cat';
          },
        });

        validate(p.name, () => {
          return {kind: 'dog'};
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().valid()).withContext('Name is initially invalid').toBeFalse();
    expect(f().valid()).withContext('Form is initially invalid').toBeFalse();

    f.name().value.set('readonly-cat');
    expect(f.name().readonly()).toBeTrue();
    expect(f.name().valid()).toBeTrue();
    expect(f().valid()).toBeTrue();

    f.name().value.set('interactive-cat');
    expect(f.name().valid()).toBeFalse();
    expect(f().valid()).toBeFalse();
  });

  it('disables touch state propagation', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        readonly(p.name, {
          when: ({value}) => {
            return value() === 'readonly-cat';
          },
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.name().touched()).withContext('Name is initially untouched').toBeFalse();
    expect(f().touched()).withContext('Form is initially untouched').toBeFalse();

    f.name().markAsTouched();
    expect(f.name().touched()).toBeTrue();
    expect(f().touched()).toBeTrue();

    f.name().value.set('readonly-cat');

    expect(f.name().touched()).withContext('readonly name is not touched').toBeFalse();
    expect(f().touched())
      .withContext('form with a readonly touched field is not touched')
      .toBeFalse();
  });

  it('supports deprecated function syntax', () => {
    const cat = signal({name: 'Pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        readonly(p.name, ((ctx: any) => ctx.value() === 'readonly-cat') as any);
      },
      {injector: TestBed.inject(Injector)},
    );

    f.name().value.set('readonly-cat');
    expect(f.name().readonly()).toBe(true);
  });
});
