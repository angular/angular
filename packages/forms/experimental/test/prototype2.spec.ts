import {signal} from '@angular/core';
import {form, logic} from '../src/prototype2/form';
import {FormValidationError, schema} from '../src/prototype2/schema';

const nameSchema = schema<{first: string; last: string}>((root) => {
  logic(root.last, {
    validate: (value) => (!value() ? [new FormValidationError('Last name is required')] : []),
  });
  logic(root, {
    disabled: () => (root.first.$() === '<Anonymous>' ? 'User is anonymous' : null),
  });
});

const profileSchema = schema<{name: {first: string; last: string}}>((root) => {
  logic(root.name, nameSchema);
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
  });
});
