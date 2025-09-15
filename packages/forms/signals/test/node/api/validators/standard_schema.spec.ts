/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import * as z from 'zod';
import {form, schema} from '../../../../public_api';
import {validateStandardSchema} from '../../../../src/api/standard_schema/standard_schema';

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
});
