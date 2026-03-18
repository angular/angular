/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, computed, Injector, linkedSignal, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import * as z from 'zod';
import {form, schema, validateStandardSchema} from '../../../../public_api';

interface Flight {
  id: number;
  from: string;
  to: string;
  date: string;
  delayed: boolean;
  delay: number;
  delayReason: string;
}

interface Trip {
  departure: Flight;
  return: Flight;
}

describe('standard schema integration', () => {
  it('should perform sync validation using a standard schema', async () => {
    const injector = TestBed.inject(Injector);

    const zodName = z.object({
      first: z.string().min(2),
      last: z.string().min(3),
    });

    const nameForm = form(
      signal({first: '', last: ''}),
      (p) => {
        validateStandardSchema(p, zodName);
      },
      {injector},
    );

    expect(nameForm.first().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: 'Too small: expected string to have >=2 characters',
        }),
      }),
    ]);
    expect(nameForm.last().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: 'Too small: expected string to have >=3 characters',
        }),
      }),
    ]);
  });

  it('should perform async validation using a standard schema', async () => {
    const injector = TestBed.inject(Injector);

    const zodNameAsync = z
      .object({
        first: z.string().min(2),
        last: z.string().min(3),
      })
      .refine(() => Promise.resolve());

    const nameForm = form(
      signal({first: '', last: ''}),
      (p) => {
        validateStandardSchema(p, zodNameAsync);
      },
      {injector},
    );

    expect(nameForm.first().errors()).toEqual([]);
    expect(nameForm.last().errors()).toEqual([]);

    await TestBed.inject(ApplicationRef).whenStable();

    expect(nameForm.first().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: 'Too small: expected string to have >=2 characters',
        }),
      }),
    ]);
    expect(nameForm.last().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: 'Too small: expected string to have >=3 characters',
        }),
      }),
    ]);
  });

  it('should support a partial schema', () => {
    const zodFlight = z.object({
      from: z.string().min(3),
      to: z.string().min(3),
    });

    const s = schema<Flight>((p) => {
      validateStandardSchema(p, zodFlight);
    });

    // Just expect schema to be defined, really just interested in testing the typing.
    expect(s).toBeDefined();
  });

  it('should support zod looseObject', () => {
    const zodFlight = z.looseObject({
      from: z.string().min(3),
      to: z.string().min(3),
    });

    const s = schema<Flight>((p) => {
      validateStandardSchema(p, zodFlight);
    });

    // Just expect schema to be defined, really just interested in testing the typing.
    expect(s).toBeDefined();
  });

  it('should support zod looseObject on child', () => {
    const zodFlight = z.looseObject({
      from: z.string().min(3),
      to: z.string().min(3),
    });

    const zodTrip = z.object({
      departure: zodFlight,
      return: zodFlight,
    });

    const s = schema<Trip>((p) => {
      validateStandardSchema(p, zodTrip);
    });

    // Just expect schema to be defined, really just interested in testing the typing.
    expect(s).toBeDefined();
  });

  it('should type error on incompatible zod schema', () => {
    const zodFlight = z.looseObject({
      from: z.string().min(3),
      to: z.string().min(3),
      invalid: z.string(),
    });

    const s = schema<Flight>((p) => {
      // @ts-expect-error
      validateStandardSchema(p, zodFlight);
    });

    // Just expect schema to be defined, really just interested in testing the typing.
    expect(s).toBeDefined();
  });

  it('should not allow unknown path', () => {
    const zodName = z.object({
      first: z.string().min(2),
      last: z.string().min(3),
    });

    const s = schema((p) => {
      //@ts-expect-error
      validateStandardSchema(p, zodName);
    });

    // Just expect schema to be defined, really just interested in testing the typing.
    expect(s).toBeDefined();
  });

  it('should treat empty value as subject to the given standard schema', () => {
    const model = signal('');
    const f = form(
      model,
      (p) => {
        validateStandardSchema(p, z.string().min(10));
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f().errors().length).toBe(1);
  });

  it('should set the error message from the schema issue', () => {
    const model = signal({age: -5});
    const f = form(
      model,
      (p) => {
        validateStandardSchema(p.age, z.number().min(0, {message: 'Age must be non-negative'}));
      },
      {
        injector: TestBed.inject(Injector),
      },
    );

    expect(f.age().errors()[0].message).toBe('Age must be non-negative');
  });

  it('should support reactive schema using computed signal', () => {
    const minLength = signal(2);

    const zodSchema = computed(() =>
      z.object({
        first: z.string().min(minLength()),
        last: z.string().min(3),
      }),
    );

    const nameForm = form(
      signal({first: 'A', last: 'B'}),
      (p) => {
        validateStandardSchema(p, () => zodSchema());
      },
      {injector: TestBed.inject(Injector)},
    );

    // Initially, first name should have error (length 1, min 2)
    expect(nameForm.first().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 2 character/),
        }),
      }),
    ]);

    // Change minLength to 1, should remove error
    minLength.set(1);
    expect(nameForm.first().errors()).toEqual([]);

    // Change minLength to 3, should add error again
    minLength.set(3);
    expect(nameForm.first().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 3 character/),
        }),
      }),
    ]);
  });

  it('should support reactive schema using signal', () => {
    const minLength = signal(2);

    const nameForm = form(
      signal({first: 'A', last: 'B'}),
      (p) => {
        validateStandardSchema(p, () =>
          z.object({
            first: z.string().min(minLength()),
            last: z.string().min(3),
          }),
        );
      },
      {injector: TestBed.inject(Injector)},
    );

    // Initially, first name should have error (length 1, min 2)
    expect(nameForm.first().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 2 character/),
        }),
      }),
    ]);

    // Change minLength to 1, should remove error
    minLength.set(1);
    expect(nameForm.first().errors()).toEqual([]);

    // Change minLength to 5, should add error again
    minLength.set(5);
    expect(nameForm.first().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 5 character/),
        }),
      }),
    ]);
  });

  it('should support reactive schema using linkedSignal', () => {
    const minFirstLength = signal(2);
    const minLastLength = linkedSignal(() => minFirstLength() + 1);

    const nameForm = form(
      signal({first: 'A', last: 'BB'}),
      (p) => {
        validateStandardSchema(p, () =>
          z.object({
            first: z.string().min(minFirstLength()),
            last: z.string().min(minLastLength()),
          }),
        );
      },
      {injector: TestBed.inject(Injector)},
    );

    // Initially, first needs 2 chars, last needs 3 chars (2+1)
    expect(nameForm.first().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 2 character/),
        }),
      }),
    ]);
    expect(nameForm.last().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 3 character/),
        }),
      }),
    ]);

    // Change minFirstLength to 1, linkedSignal auto-updates to 2
    minFirstLength.set(1);
    expect(nameForm.first().errors()).toEqual([]);
    expect(nameForm.last().errors()).toEqual([]);

    // Change minFirstLength to 4, linkedSignal auto-updates to 5
    minFirstLength.set(4);
    expect(nameForm.first().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 4 character/),
        }),
      }),
    ]);
    expect(nameForm.last().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 5 character/),
        }),
      }),
    ]);
  });

  it('should support reactive schema using LogicFn with field context', () => {
    type FormModel = {
      type: 'email' | 'phone';
      value: string;
    };

    const model = signal<FormModel>({type: 'email', value: 'invalid'});
    const nameForm = form(
      model,
      (p) => {
        validateStandardSchema(p, (ctx) => {
          const formValue = ctx.value();
          if (formValue.type === 'email') {
            return z.object({
              type: z.literal('email'),
              value: z.email(),
            });
          } else {
            return z.object({
              type: z.literal('phone'),
              value: z.string().regex(/^\d{3}-\d{3}-\d{4}$/),
            });
          }
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    // Initially type is 'email', value should have email error
    expect(nameForm.value().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Invalid email/),
        }),
      }),
    ]);

    // Change to phone type, should validate as phone number
    model.set({type: 'phone', value: '123-456-7890'});
    expect(nameForm.value().errors()).toEqual([]);

    // Invalid phone number
    model.set({type: 'phone', value: 'invalid-phone'});
    expect(nameForm.value().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Invalid/),
        }),
      }),
    ]);
  });

  it('should support returning undefined to skip validation conditionally', () => {
    type FormModel = {
      validationEnabled: boolean;
      name: string;
    };

    const model = signal<FormModel>({validationEnabled: true, name: 'A'});
    const nameForm = form(
      model,
      (p) => {
        validateStandardSchema(p, (ctx) => {
          const formValue = ctx.value();
          // Skip validation when disabled
          if (!formValue.validationEnabled) {
            return undefined;
          }
          return z.object({
            validationEnabled: z.boolean(),
            name: z.string().min(3),
          });
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    // Initially validation is enabled, name should have error (length 1, min 3)
    expect(nameForm.name().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 3 character/),
        }),
      }),
    ]);

    // Disable validation - should skip validation entirely
    model.set({validationEnabled: false, name: 'A'});
    expect(nameForm.name().errors()).toEqual([]);

    // Re-enable validation - errors should appear again
    model.set({validationEnabled: true, name: 'A'});
    expect(nameForm.name().errors()).toEqual([
      jasmine.objectContaining({
        kind: 'standardSchema',
        issue: jasmine.objectContaining({
          message: jasmine.stringMatching(/Too small|String must contain at least 3 character/),
        }),
      }),
    ]);
  });
});
