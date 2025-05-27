/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {max, min} from '../../src/api/built_in_validators';
import {form} from '../../src/api/structure';
import {MAX, MIN} from '../../src/api/metadata';

describe('build-in validators', () => {
  describe('min', () => {
    it('returns min error when the value is smaller', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 4});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
    });

    it('is inclusive', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 4});
      const f = form(
        cat,
        (p) => {
          min(p.age, 4);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([]);
    });


    it('returns no errors when the value is larger', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 10});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([]);
    });

    it('returns custom errors when provided', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 3});
      const f = form(
        cat,
        (p) => {
          min(p.age, 5, {
            errors: ({value}) => {
              return {kind: 'special-min', message: value().toString()};
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([
        {
          kind: 'special-min',
          message: '3',
        },
      ]);
    });


    describe('metadata', () => {
      it('stores the metadata on min', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 3});
        const f = form(
          cat,
          (p) => {
            min(p.age, 5, {
              errors: ({value}) => {
                return {kind: 'special-min', message: value().toString()};
              },
            });
          },
          {injector: TestBed.inject(Injector)},
        );

        expect(f.age.$state.metadata(MIN)()).toBe(5);
      });

      it('merges two mins preferring the larger option', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 3});
        const f = form(
          cat,
          (p) => {
            min(p.age, 5);
            min(p.age, 10);
          },
          {injector: TestBed.inject(Injector)},
        );

        f.age.$state.value.set(3);
        expect(f.age.$state.errors()).toEqual([{kind: 'min'}, {kind: 'min'}]);
        f.age.$state.value.set(7);
        expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
        f.age.$state.value.set(15);
        expect(f.age.$state.errors()).toEqual([]);

        expect(f.age.$state.metadata(MIN)()).toBe(10);
      });

      it('merges two mins _dynamically_ preferring the larger option', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 3});
        const minSignal = signal(5);
        const f = form(
          cat,
          (p) => {
            min(p.age, minSignal);
            min(p.age, 10);
          },
          {injector: TestBed.inject(Injector)},
        );

        f.age.$state.value.set(3);
        expect(f.age.$state.errors()).toEqual([{kind: 'min'}, {kind: 'min'}]);
        f.age.$state.value.set(7);
        expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
        f.age.$state.value.set(15);
        expect(f.age.$state.errors()).toEqual([]);
        minSignal.set(30);
        expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
        expect(f.age.$state.metadata(MIN)()).toBe(30);
      });
    });

    describe('dynamic values', () => {
      it('handles dynamic value', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 4});
        const minValue = signal(5);
        const f = form(
          cat,
          (p) => {
            min(p.age, minValue);
          },
          {injector: TestBed.inject(Injector)},
        );

        expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
        minValue.set(2);
        expect(f.age.$state.errors()).toEqual([]);
      });

      it('handles dynamic value based on other field', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 4});

        const f = form(
          cat,
          (p) => {
            min(p.age, ({valueOf}) => {
              return valueOf(p.name) === 'pirojok-the-cat' ? 5 : 0;
            });
          },
          {injector: TestBed.inject(Injector)},
        );

        expect(f.age.$state.errors()).toEqual([{kind: 'min'}]);
        f.name.$state.value.set('other cat');
        expect(f.age.$state.errors()).toEqual([]);
      });
    });
  });


  describe('max', () => {
    it('returns max error when the value is larger', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 6});
      const f = form(
        cat,
        (p) => {
          max(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([{kind: 'max'}]);
    });

    it('is inclusive', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 5});
      const f = form(
        cat,
        (p) => {
          max(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([]);
    });

    it('returns no errors when the value is smaller', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 4});
      const f = form(
        cat,
        (p) => {
          max(p.age, 5);
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([]);
    });

    it('returns custom errors when provided', () => {
      const cat = signal({name: 'pirojok-the-cat', age: 6});
      const f = form(
        cat,
        (p) => {
          max(p.age, 5, {
            errors: ({value}) => {
              return {kind: 'special-max', message: value().toString()};
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.age.$state.errors()).toEqual([
        {
          kind: 'special-max',
          message: '6',
        },
      ]);
    });

    describe('metadata', () => {
      it('stores the metadata on max', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 6});
        const f = form(
          cat,
          (p) => {
            max(p.age, 5, {
              errors: ({value}) => {
                return {kind: 'special-max', message: value().toString()};
              },
            });
          },
          {injector: TestBed.inject(Injector)},
        );

        expect(f.age.$state.metadata(MAX)()).toBe(5);
      });

      it('merges two maxes preferring the smaller option', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 12});
        const f = form(
          cat,
          (p) => {
            max(p.age, 10);
            max(p.age, 5);
          },
          {injector: TestBed.inject(Injector)},
        );

        f.age.$state.value.set(12);
        expect(f.age.$state.errors()).toEqual([{kind: 'max'}, {kind: 'max'}]);
        f.age.$state.value.set(7);
        expect(f.age.$state.errors()).toEqual([{kind: 'max'}]);
        f.age.$state.value.set(3);
        expect(f.age.$state.errors()).toEqual([]);

        expect(f.age.$state.metadata(MAX)()).toBe(5);
      });

      it('merges two maxes _dynamically_ preferring the smaller option', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 12});
        const maxSignal = signal(10);
        const f = form(
          cat,
          (p) => {
            max(p.age, maxSignal);
            max(p.age, 5);
          },
          {injector: TestBed.inject(Injector)},
        );

        f.age.$state.value.set(12); // > 10 and > 5
        expect(f.age.$state.errors()).toEqual([{kind: 'max'}, {kind: 'max'}]);
        f.age.$state.value.set(7); // < 10 but > 5
        expect(f.age.$state.errors()).toEqual([{kind: 'max'}]);
        f.age.$state.value.set(3); // < 10 and < 5
        expect(f.age.$state.errors()).toEqual([]);

        expect(f.age.$state.metadata(MAX)()).toBe(5); // Initially 5 is smaller

        maxSignal.set(2); // Now maxSignal (2) is smaller than 5
        f.age.$state.value.set(3); // 3 is > 2 (new max) but < 5 (other max)
        expect(f.age.$state.errors()).toEqual([{kind: 'max'}]); // Error due to maxSignal
        expect(f.age.$state.metadata(MAX)()).toBe(2); // Metadata should reflect the new effective max
      });
    });

    describe('dynamic values', () => {
      it('handles dynamic value', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 6});
        const maxValue = signal(5);
        const f = form(
          cat,
          (p) => {
            max(p.age, maxValue);
          },
          {injector: TestBed.inject(Injector)},
        );

        expect(f.age.$state.errors()).toEqual([{kind: 'max'}]);
        maxValue.set(7);
        expect(f.age.$state.errors()).toEqual([]);
      });

      it('handles dynamic value based on other field', () => {
        const cat = signal({name: 'pirojok-the-cat', age: 6}); // Initial age is 6

        const f = form(
          cat,
          (p) => {
            // If cat's name is 'pirojok-the-cat', max age is 5.
            // Otherwise, max age is 10.
            max(p.age, ({valueOf}) => {
              return valueOf(p.name) === 'pirojok-the-cat' ? 5 : 10;
            });
          },
          {injector: TestBed.inject(Injector)},
        );

        // Initially, name is 'pirojok-the-cat', so max age is 5.
        // Current age (6) > max age (5), so there should be a 'max' error.
        expect(f.age.$state.errors()).toEqual([{kind: 'max'}]);

        // Change the cat's name to 'other cat'
        f.name.$state.value.set('other cat');

        // Now, name is 'other cat', so max age is 10.
        // Current age (6) < max age (10), so there should be no errors.
        expect(f.age.$state.errors()).toEqual([]);
      });
    });
  });
});
