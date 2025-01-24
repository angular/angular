import {signal} from '@angular/core';
import {z} from 'zod';
import {getTypeErrorTree, mergeTypeErrorTree} from '../../src/rule-schema/type-validator';

describe('type validator', () => {
  it('should not have errors for valid data', () => {
    const validator = z.object({
      a: z.number(),
    });
    const data = signal({a: 0});
    const errors = getTypeErrorTree(validator, data);
    expect(errors?.all()).toEqual([]);
  });

  it('should raise root-level error', () => {
    const validator = z.object({
      a: z.number(),
    });
    const data = signal(null);
    const errors = getTypeErrorTree(validator, data);
    expect(errors?.all().map((e) => e.message)).toEqual(['Expected object, received null']);
    expect(errors?.own().map((e) => e.message)).toEqual(['Expected object, received null']);
  });

  it('should raise error on property', () => {
    const validator = z.object({
      a: z.number(),
    });
    const data = signal({a: 'invalid'});
    const errors = getTypeErrorTree(validator, data);
    expect(errors?.all().map((e) => e.message)).toEqual(['Expected number, received string']);
    expect(errors?.own()).toEqual([]);
    const childErrors = errors?.property('a');
    expect(childErrors?.all().map((e) => e.message)).toEqual(['Expected number, received string']);
    expect(childErrors?.own().map((e) => e.message)).toEqual(['Expected number, received string']);
  });

  // TODO: Broken. Fix it.
  it('should merge errors from multiple validators', () => {
    const validator1 = z.object({
      a: z.number(),
      b: z.number(),
    });
    const validator2 = z.object({
      a: z.number().optional(),
      b: z.number(),
    });
    const data = signal({});
    const errors1 = getTypeErrorTree(validator1, data)!;
    const errors2 = getTypeErrorTree(validator2, data)!;
    const errors = mergeTypeErrorTree(errors1, errors2)!;
    expect(
      errors
        .property('a')
        .own()
        .map((e) => e.message),
    ).toEqual(['Required']);
    expect(
      errors
        .property('b')
        .own()
        .map((e) => e.message),
    ).toEqual(['Required', 'Required']);
  });
});
