import {ApplicationRef, Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import * as z from 'zod';
import {form} from '../public_api';
import {validateStandardSchema} from '../src/api/standard_schema';

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

    const zodName = z.object({
      first: z.string().min(2),
      last: z.string().min(3),
    });

    // I don't know how to get zod to make async standard schema, so whatever.
    const asyncStandardSchemaDef = {...zodName['~standard']};
    const validate = asyncStandardSchemaDef.validate;
    asyncStandardSchemaDef.validate = async (value: unknown) => await validate(value);

    const nameForm = form(
      signal({first: '', last: ''}),
      (p) => {
        validateStandardSchema(p, {['~standard']: asyncStandardSchemaDef});
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
