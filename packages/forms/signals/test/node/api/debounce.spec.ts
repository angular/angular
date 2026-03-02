/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {applyWhenValue, debounce, form} from '@angular/forms/signals';
import {timeout} from '@angular/private/testing';

describe('debounce', () => {
  describe('by duration', () => {
    it('should synchronize value immediately if non-positive', () => {
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, 0);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it('should synchronize value after duration', async () => {
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, 1);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      await timeout(0);
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it('should synchronize value immediately on touch', () => {
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, 1);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      street.markAsTouched();
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });
  });

  describe('by function', () => {
    it('should synchronize value immediately by default', () => {
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, () => {});
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it('should synchronize value immediately on touch', () => {
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, forever);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      street.markAsTouched();
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it('should synchronize value after promise resolves', async () => {
      const {promise, resolve} = Promise.withResolvers<void>();
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, () => promise);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      resolve();
      await promise;

      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it('should synchronize value after most recently returned promise resolves', async () => {
      const first = Promise.withResolvers<void>();
      const second = Promise.withResolvers<void>();
      const debounceFn = jasmine
        .createSpy('debounceFn')
        .and.returnValues(first.promise, second.promise);

      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, debounceFn);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      street.controlValue.set('2000 N Shoreline Blvd');
      expect(street.value()).toBe('');

      first.resolve();
      await first.promise;
      expect(street.value()).toBe('');

      second.resolve();
      await second.promise;
      expect(street.value()).toBe('2000 N Shoreline Blvd');
    });

    it('should be ignored if value is directly set before it resolves', async () => {
      const debounceResult = Promise.withResolvers<void>();
      const debounceFn = jasmine.createSpy('debounceFn').and.returnValues(debounceResult.promise);

      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, debounceFn);
        },
        options(),
      );
      const street = addressForm.street();

      // Set `controlValue` which will trigger a debounce update.
      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      // Directly set value during debounce duration.
      street.value.set('2000 N Shoreline Blvd');
      expect(street.value()).toBe('2000 N Shoreline Blvd');
      expect(street.controlValue()).toBe('2000 N Shoreline Blvd');

      // Wait for the debounced update, which should be ignored.
      await debounceResult.resolve;
      expect(street.value()).toBe('2000 N Shoreline Blvd');
    });

    describe('abort signal', () => {
      it('should be aborted if control value is set again', async () => {
        const {promise, resolve} = Promise.withResolvers<void>();
        const abortSpy = jasmine.createSpy('abort');

        const address = signal({street: ''});
        const addressForm = form(
          address,
          (address) => {
            debounce(address.street, (_context, signal) => {
              signal.addEventListener('abort', abortSpy);
              return promise;
            });
          },
          options(),
        );
        const street = addressForm.street();

        street.controlValue.set('1600 Amphitheatre Pkwy');
        expect(abortSpy).not.toHaveBeenCalled();

        street.controlValue.set('2000 N Shoreline Blvd');
        expect(abortSpy).toHaveBeenCalledTimes(1);

        resolve();
        await promise;
        expect(street.value()).toBe('2000 N Shoreline Blvd');
      });

      it('should be aborted on touch', async () => {
        const abortSpy = jasmine.createSpy('abort');
        const address = signal({street: ''});
        const addressForm = form(
          address,
          (address) => {
            debounce(address.street, (_context, signal) => {
              signal.addEventListener('abort', abortSpy);
              return forever();
            });
          },
          options(),
        );
        const street = addressForm.street();

        street.controlValue.set('1600 Amphitheatre Pkwy');
        expect(abortSpy).not.toHaveBeenCalled();

        street.markAsTouched();
        expect(abortSpy).toHaveBeenCalledTimes(1);
        expect(street.value()).toBe('1600 Amphitheatre Pkwy');
      });

      it('should remove abort listener when debounce completes', async () => {
        const addListenerSpy = spyOn(AbortSignal.prototype, 'addEventListener').and.callThrough();
        const removeListenerSpy = spyOn(
          AbortSignal.prototype,
          'removeEventListener',
        ).and.callThrough();

        const address = signal({street: ''});
        const addressForm = form(
          address,
          (address) => {
            debounce(address.street, 1);
          },
          options(),
        );
        const street = addressForm.street();

        street.controlValue.set('1600 Amphitheatre Pkwy');
        expect(addListenerSpy).toHaveBeenCalledOnceWith('abort', jasmine.any(Function), {
          once: true,
        });
        expect(removeListenerSpy).not.toHaveBeenCalled();

        await timeout(10);
        expect(street.value()).toBe('1600 Amphitheatre Pkwy');
        expect(removeListenerSpy).toHaveBeenCalledOnceWith('abort', jasmine.any(Function));
      });
    });
  });

  describe('inheritance', () => {
    it('should inherit debounce from parent', async () => {
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address, 1);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      await timeout(0);
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it('can override inherited debounce', async () => {
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address, 1);
          debounce(address.street, 0);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it(`should not affect parent's debounce`, async () => {
      const address = signal({street: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address, 1);
          debounce(address.street, 0);
        },
        options(),
      );

      addressForm().controlValue.set({street: '1600 Amphitheatre Pkwy'});
      expect(addressForm().controlValue()).toEqual({street: '1600 Amphitheatre Pkwy'});
      expect(addressForm().value()).toEqual({street: ''});

      await timeout(0);
      expect(addressForm().value()).toEqual({street: '1600 Amphitheatre Pkwy'});
    });

    it(`should not affect a sibling's debounce`, async () => {
      const address = signal({street: '', city: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, 1);
        },
        options(),
      );

      addressForm.street().controlValue.set('1600 Amphitheatre Pkwy');
      expect(addressForm().value()).toEqual({street: '', city: ''});

      addressForm.city().controlValue.set('Mountain View');
      expect(addressForm().value()).toEqual({street: '', city: 'Mountain View'});

      await timeout(0);
      expect(addressForm().value()).toEqual({
        street: '1600 Amphitheatre Pkwy',
        city: 'Mountain View',
      });
    });
  });

  describe('aggregation', () => {
    it('should apply the last debounce rule', () => {
      const address = signal({street: '', city: ''});
      const addressForm = form(
        address,
        (address) => {
          debounce(address.street, 1);
          debounce(address.street, 0);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it('should apply the last debounce rule from schemas', async () => {
      const address = signal({street: '', city: ''});
      const schema1 = (address: any) => {
        debounce(address.street, 0);
      };
      const schema2 = (address: any) => {
        debounce(address.street, 1);
      };
      const addressForm = form(
        address,
        (address) => {
          schema1(address);
          schema2(address);
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      await timeout(0);
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');
    });

    it('should apply the last debounce rule from conditional schemas', async () => {
      const address = signal({street: '', city: ''});
      const debounced = signal(false);
      const addressForm = form(
        address,
        (address) => {
          applyWhenValue(
            address,
            () => debounced(),
            (address) => {
              debounce(address.street, 0);
            },
          );
          applyWhenValue(
            address,
            () => debounced(),
            (address) => {
              debounce(address.street, 1);
            },
          );
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');

      debounced.set(true);
      street.controlValue.set('2000 N Shoreline Blvd');
      expect(street.controlValue()).toBe('2000 N Shoreline Blvd');
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');

      await timeout(0);
      expect(street.value()).toBe('2000 N Shoreline Blvd');
    });

    it('should apply debounce rule conditionally', async () => {
      const address = signal({street: '', city: ''});
      const debounced = signal(true);
      const addressForm = form(
        address,
        (address) => {
          applyWhenValue(
            address.street,
            () => debounced(),
            (street) => {
              debounce(street, 1);
            },
          );
        },
        options(),
      );
      const street = addressForm.street();

      street.controlValue.set('1600 Amphitheatre Pkwy');
      expect(street.controlValue()).toBe('1600 Amphitheatre Pkwy');
      expect(street.value()).toBe('');

      await timeout(0);
      expect(street.value()).toBe('1600 Amphitheatre Pkwy');

      debounced.set(false);
      street.controlValue.set('2000 N Shoreline Blvd');
      expect(street.value()).toBe('2000 N Shoreline Blvd');
    });
  });
});

/** Options for testing. */
function options() {
  return {injector: TestBed.inject(Injector)};
}

/** Returns a promise that will never resolve. */
function forever(): Promise<never> {
  return new Promise(() => {});
}
