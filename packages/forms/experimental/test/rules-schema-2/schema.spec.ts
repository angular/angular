import {signal} from '@angular/core';
import {schema, rule, validate, disable, form, mount, each} from '../../src/rules-schema-2/api';

describe('rules schema', () => {
  describe('disabled', () => {
    it('should accept basic rules', () => {
      interface User {
        name: string;
      }

      const userSchema = schema<User>((f) => {
        rule(f.name, [disable((field) => field.value() !== 'Peter')]);
        // Declare rules.
      });

      const user = signal({name: 'John'});
      const f = form(user, userSchema);

      expect(f.name.$.disabled()).toBe(true);
      f.name.$.value.set('Peter');
      expect(f.name.$.disabled()).toBe(false);
    });

    it('should propagate disabled status', () => {
      interface User {
        name: string;
      }

      const userSchema = schema<User>((f) => {
        rule(f, [disable(() => f.name.$.value() !== 'Peter')]);
        // Declare rules.
      });

      const user = signal({name: 'John'});
      const f = form(user, userSchema);
      expect(f.name.$.disabled()).toBe(true);
    });
  });

  describe('validate', () => {
    it('should propagate validate status', () => {
      interface User {
        name: string;
      }

      const userSchema = schema<User>((f) => {
        rule(f.name, [validate((field) => field.value() !== 'Peter')]);
      });

      const user = signal({name: 'John'});
      const f = form(user, userSchema);
      expect(f.$.valid()).toBe(true);
      expect(f.name.$.valid()).toBe(true);

      user.set({name: 'Peter'});
      expect(f.$.valid()).toBe(false);
      expect(f.name.$.valid()).toBe(false);

      user.set({name: 'Alex'});
      expect(f.$.valid()).toBe(true);
      expect(f.name.$.valid()).toBe(true);
    });
  });

  describe('subforms', () => {
    it('should mount validation logic', () => {
      interface Address {
        street: string;
        city: string;
      }

      interface User {
        address: Address;
      }

      const addrSchema = schema<Address>((f) => {
        rule(f.city, [validate((field) => field.value().length > 0)]);
      });

      const userSchema = schema<User>((f) => {
        mount(f.address, addrSchema);
      });

      const f = form(signal({address: {city: '', street: ''}}), userSchema);

      expect(f.$.valid()).toBe(false);
      expect(f.address.$.valid()).toBe(false);
      f.address.city.$.value.set('New York');
      expect(f.$.valid()).toBe(true);
    });
  });

  describe('arrays', () => {
    xit('should support basic arrays', () => {
      interface Data {
        data: number[];
      }

      const s = schema<Data>((df) => {
        each(df.data, (sf) => {
          rule(sf, [validate((field) => field.value() < 3)]);
        });
      });

      const data = signal({
        data: [1, 2],
      });
      const f = form(data, s);

      expect(f.data[0].$.valid()).toBeTrue();
      expect(f.data[1].$.valid()).toBeTrue();
      expect(f.$.valid()).toBeTrue();

      data.set({
        data: [1, 2, 3],
      });

      // Fails, we don't react to data changing.
      expect(f.$.valid()).toBeFalse();
    });
  });
});
