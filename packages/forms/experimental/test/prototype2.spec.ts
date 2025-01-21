import {signal} from '@angular/core';
import {z} from 'zod';
import {form} from '../src/prototype2/form';
import {FormValidationError} from '../src/prototype2/logic';
import {each, rule, schema} from '../src/prototype2/schema';
import {getTypeErrorTree, mergeTypeErrorTree} from '../src/prototype2/type-validator';

const nameSchema = schema<{first: string; last: string}>((root) => {
  rule(root.last, {
    validate: (value) => (!value() ? [new FormValidationError('Last name is required')] : []),
  });
  rule(root, {
    disabled: () => (root.first.$() === '<Anonymous>' ? 'User is anonymous' : null),
  });
});

const profileSchema = schema<{name: {first: string; last: string}}>((root) => {
  rule(root.name, nameSchema);
});

describe('form', () => {
  describe('no schema', () => {
    it('should read data', () => {
      const f = form(signal({name: {first: 'John', last: 'Doe'}}));
      expect(f.$()).toEqual({name: {first: 'John', last: 'Doe'}});
      expect(f.name.$()).toEqual({first: 'John', last: 'Doe'});
      expect(f.name.first.$()).toBe('John');
      expect(f.name.last.$()).toBe('Doe');
    });

    it('should write data', () => {
      const f = form(signal({name: {first: 'John', last: 'Doe'}}));
      f.name.first.$.set('Jane');
      expect(f.$()).toEqual({name: {first: 'Jane', last: 'Doe'}});
    });
  });

  describe('with schema', () => {
    it('should raise errors', () => {
      const f = form(signal({name: {first: 'John', last: 'Doe'}}), profileSchema);
      expect(f.$.errors()).toEqual([]);
      expect(f.name.$.errors()).toEqual([]);
      expect(f.name.first.$.errors()).toEqual([]);
      expect(f.name.last.$.errors()).toEqual([]);
      f.name.last.$.set('');
      expect(f.$.errors()).toEqual([]);
      expect(f.name.$.errors()).toEqual([]);
      expect(f.name.first.$.errors()).toEqual([]);
      expect(f.name.last.$.errors()).toEqual([new FormValidationError('Last name is required')]);
    });

    it('should validate', () => {
      const f = form(signal({name: {first: 'John', last: 'Doe'}}), profileSchema);
      expect(f.$.valid()).toBe(true);
      expect(f.name.$.valid()).toBe(true);
      expect(f.name.first.$.valid()).toBe(true);
      expect(f.name.last.$.valid()).toBe(true);
      f.name.last.$.set('');
      expect(f.$.valid()).toBe(false);
      expect(f.name.$.valid()).toBe(false);
      expect(f.name.first.$.valid()).toBe(true);
      expect(f.name.last.$.valid()).toBe(false);
    });

    it('should disable', () => {
      const f = form(signal({name: {first: 'John', last: 'Doe'}}), profileSchema);
      expect(f.$.disabled()).toBe(false);
      expect(f.name.$.disabled()).toBe(false);
      expect(f.name.first.$.disabled()).toBe(false);
      expect(f.name.last.$.disabled()).toBe(false);
      f.name.first.$.set('<Anonymous>');
      expect(f.$.disabled()).toBe(false);
      expect(f.name.$.disabled()).toEqual({reason: 'User is anonymous'});
      expect(f.name.first.$.disabled()).toEqual({reason: 'User is anonymous'});
      expect(f.name.last.$.disabled()).toEqual({reason: 'User is anonymous'});
    });

    describe('should support logic on each property', () => {
      it('of an object', () => {
        const data = signal({x: 0, y: 0, z: 0});
        const f = form(
          data,
          schema((axes) => {
            each(axes, {
              validate: (value) => (value() < 0 ? 'value must be positive' : null),
            });
          }),
        );
        expect(f.$.valid()).toBe(true);
        data.set({x: 0, y: -1, z: 0});
        expect(f.x.$.valid()).toBe(true);
        expect(f.y.$.valid()).toBe(false);
        expect(f.z.$.valid()).toBe(true);
      });

      it('of a record', () => {
        const data = signal<{[k: string]: unknown}>({});
        const f = form(
          data,
          schema((properties) => {
            each(properties, (property) => ({
              validate: () => (property === 'type' ? '"type" is a reserved property' : null),
            }));
          }),
        );
        expect(f.$.valid()).toBe(true);
        data.set({wdith: 100, height: 100});
        expect(f.$.valid()).toBe(true);
        data.set({type: 'rectangle'});
        expect(f.$.valid()).toBe(false);
      });

      it('of an array', () => {
        const data = signal<number[]>([]);
        const f = form(
          data,
          schema((numbers) => {
            each(numbers, (idx) => ({
              validate: (num) =>
                idx > 0 && num() < numbers.$()[idx - 1] ? 'Must be monotonically increasing' : null,
            }));
          }),
        );
        expect(f.$.valid()).toBe(true);
        data.set([1, 2, 3, 0]);
        expect(f[0].$.valid()).toBe(true);
        expect(f[1].$.valid()).toBe(true);
        expect(f[2].$.valid()).toBe(true);
        expect(f[3].$.valid()).toBe(false);
        data.set([1]);
        expect(f[0].$.valid()).toBe(true);
      });

      it('of a tuple', () => {
        const data = signal([0, 0, 0]);
        const f = form(
          data,
          schema((dimensions) => {
            each(dimensions, {
              validate: (dim) => (dim() < 0 ? 'Must have a positive value' : null),
            });
          }),
        );
        expect(f.$.valid()).toBe(true);
        f[1].$.set(-1);
        expect(f[0].$.valid()).toBe(true);
        expect(f[1].$.valid()).toBe(false);
        expect(f[2].$.valid()).toBe(true);
      });
    });

    it('should correctly order rule and each', () => {
      const s = schema<{x: number; y: number}>((coord) => {
        rule(coord.x, {disabled: () => true});
        each(coord, {disabled: () => false});
        rule(coord.y, {disabled: () => true});
      });
      const f = form(signal({x: 0, y: 0}), s);
      expect(f.x.$.disabled()).toBe(false);
      expect(f.y.$.disabled()).toBe(true);
    });

    it('schema should be extensible', () => {
      const dateSchema = schema<{year: number; month: number; day: number}>((date) => {
        rule(date.month, {
          validate: (month) => (month() < 1 || month() > 12 ? 'Must be between 1-12' : null),
        });
        rule(date.day, {
          validate: (day) => (day() < 1 || day() > 31 ? 'Must be between 1-31' : null),
        });
      });

      const birthdaySchema = dateSchema.extend((date) => {
        rule(date.year, {
          validate: (year) =>
            year() > new Date().getFullYear() - 18 ? 'Must be 18 or older' : null,
        });
      });

      const f = form(signal({year: 2020, month: 13, day: -2}), birthdaySchema);
      expect(f.year.$.errors()).toEqual([new FormValidationError('Must be 18 or older')]);
      expect(f.month.$.errors()).toEqual([new FormValidationError('Must be between 1-12')]);
      expect(f.day.$.errors()).toEqual([new FormValidationError('Must be between 1-31')]);
    });

    it(`should throw when calling rule and each outside schema`, () => {
      const f = form(signal({}));
      expect(() => rule(f, {})).toThrowError('`rule` can only be called inside `schema`');
      expect(() => each(f, {})).toThrowError('`each` can only be called inside `schema`');
    });

    it('should support runtime type validation with zod', () => {
      const s = schema(z.object({x: z.number().min(1), y: z.number()}), (f) => {
        rule(f.y, {
          validate: (y) => (y() <= f.x.$() ? 'y must be greater than x' : null),
        });
      });
      const f = form(signal({x: 0, y: 0}), s);
      expect(f.x.$.errors().map((e) => e.message)).toEqual([
        'Number must be greater than or equal to 1',
      ]);
      expect(f.y.$.errors().map((e) => e.message)).toEqual(['y must be greater than x']);
    });
  });
});

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
