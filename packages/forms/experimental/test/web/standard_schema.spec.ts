import {ApplicationRef, Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import * as z from 'zod';
import {form} from '../../public_api';
import {validateStandardSchema} from '../../src/api/standard_schema';

// Note: Must run as a web test, since our node tests down-level `Promise` and zod relies on
// `instanceof Promise` working correclty.

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

    await TestBed.inject(ApplicationRef).whenStable();

    expect(nameForm.first.$state.errors()).toEqual([
      jasmine.objectContaining({
        async: false,
        kind: '~standard',
        issue: jasmine.objectContaining({message: 'String must contain at least 2 character(s)'}),
      }),
    ]);
    expect(nameForm.last.$state.errors()).toEqual([
      jasmine.objectContaining({
        async: false,
        kind: '~standard',
        issue: jasmine.objectContaining({message: 'String must contain at least 3 character(s)'}),
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
      .refine(async () => true);

    const nameForm = form(
      signal({first: '', last: ''}),
      (p) => {
        validateStandardSchema(p, zodNameAsync);
      },
      {injector},
    );

    await TestBed.inject(ApplicationRef).whenStable();

    expect(nameForm.first.$state.errors()).toEqual([
      jasmine.objectContaining({
        async: true,
        kind: '~standard',
        issue: jasmine.objectContaining({message: 'String must contain at least 2 character(s)'}),
      }),
    ]);
    expect(nameForm.last.$state.errors()).toEqual([
      jasmine.objectContaining({
        async: true,
        kind: '~standard',
        issue: jasmine.objectContaining({message: 'String must contain at least 3 character(s)'}),
      }),
    ]);
  });
});
