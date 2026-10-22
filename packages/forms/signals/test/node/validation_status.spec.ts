/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, computed, Injector, Resource, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout, useAutoTick} from '@angular/private/testing';

import {
  form,
  NgValidationError,
  patternError,
  ReadonlyFieldTree,
  requiredError,
  validate,
  validateAsync,
  validatePromise,
  validateTree,
  ValidationError,
} from '../../public_api';

function validateValue(value: string): ValidationError[] {
  return value === 'INVALID' ? [{kind: 'custom'}] : [];
}

function validateValueForChild(
  value: string,
  fieldTree: ReadonlyFieldTree<unknown> | undefined,
): ValidationError.WithOptionalFieldTree[] {
  return value === 'INVALID' ? [{kind: 'custom', fieldTree: fieldTree}] : [];
}

describe('validation status', () => {
  let injector: Injector;
  let appRef: ApplicationRef;

  beforeEach(() => {
    injector = TestBed.inject(Injector);
    appRef = TestBed.inject(ApplicationRef);
  });

  describe('single-field validator', () => {
    it('should affect field validity', () => {
      const f = form(
        signal('VALID'),
        (p) => {
          validate(p, ({value}) => validateValue(value()));
        },
        {injector},
      );

      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f().value.set('INVALID');
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('validity should flow from child to parent', () => {
      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validate(p.child, ({value}) => validateValue(value()));
        },
        {injector},
      );

      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('validity should not flow from parent to child', () => {
      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validate(p, ({value}) => validateValue(value().child));
        },
        {injector},
      );

      expect(f.child().valid()).toBe(true);
      expect(f.child().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f.child().valid()).toBe(true);
      expect(f.child().invalid()).toBe(false);
    });

    it('should not notify dependents if errors are shallowly equal', () => {
      let computeCount = 0;
      const val = signal('VALID');
      const f = form(
        val,
        (p) => {
          validate(p, ({value}) => (value() === 'INVALID' ? [{kind: 'custom'}] : []));
        },
        {injector},
      );

      const errorWatcher = computed(() => {
        computeCount++;
        return f().errors();
      });

      errorWatcher();
      expect(computeCount).toBe(1);

      val.set('STILL_VALID');

      errorWatcher();
      expect(computeCount).toBe(1);
    });
  });

  describe('tree validator', () => {
    it('should affect validity of host field if no target specified', () => {
      const f = form(
        signal('VALID'),
        (p) => {
          validateTree(p, ({value}) => validateValueForChild(value(), undefined));
        },
        {injector},
      );

      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f().value.set('INVALID');
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('should affect validity of targeted field', () => {
      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validateTree(p, ({value, fieldTreeOf}) =>
            validateValueForChild(value().child, fieldTreeOf(p.child)),
          );
        },
        {injector},
      );

      expect(f.child().valid()).toBe(true);
      expect(f.child().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f.child().valid()).toBe(false);
      expect(f.child().invalid()).toBe(true);
    });

    it('validity should flow from child to parent', () => {
      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validateTree(p, ({value, fieldTreeOf}) =>
            validateValueForChild(value().child, fieldTreeOf(p.child)),
          );
        },
        {injector},
      );

      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('should not affect sibling validity', () => {
      const f = form(
        signal({child: 'VALID', sibling: ''}),
        (p) => {
          validateTree(p, ({value, fieldTreeOf}) =>
            validateValueForChild(value().child, fieldTreeOf(p.child)),
          );
        },
        {injector},
      );

      expect(f.sibling().valid()).toBe(true);
      expect(f.sibling().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f.sibling().valid()).toBe(true);
      expect(f.sibling().invalid()).toBe(false);
    });
  });

  describe('async validator', () => {
    useAutoTick();
    it('should affect validity of host field if no target specified', async () => {
      let res: Resource<unknown>;

      const f = form(
        signal('VALID'),
        (p) => {
          validateAsync(p, {
            params: ({value}) => value(),
            factory: (params) =>
              (res = resource({
                params,
                loader: ({params}) =>
                  new Promise<ValidationError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
        },
        {injector},
      );

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f().value.set('INVALID');

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('should affect validity of targeted field', async () => {
      let res: Resource<unknown>;

      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validateAsync(p, {
            params: ({value}) => value().child,
            factory: (params) =>
              (res = resource({
                params,
                loader: ({params}) =>
                  new Promise<ValidationError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            onSuccess: (results, {fieldTreeOf}) =>
              results.map((e) => ({
                ...e,
                fieldTree: fieldTreeOf(p.child),
              })),
            onError: () => null,
          });
        },
        {injector},
      );

      expect(f.child().pending()).toBe(true);
      expect(f.child().valid()).toBe(false);
      expect(f.child().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.child().pending()).toBe(false);
      expect(f.child().valid()).toBe(true);
      expect(f.child().invalid()).toBe(false);

      f.child().value.set('INVALID');

      expect(f.child().pending()).toBe(true);
      expect(f.child().valid()).toBe(false);
      expect(f.child().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.child().pending()).toBe(false);
      expect(f.child().valid()).toBe(false);
      expect(f.child().invalid()).toBe(true);
    });

    it('validity should flow from child to parent', async () => {
      let res: Resource<unknown>;

      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validateAsync(p, {
            params: ({value}) => value().child,
            factory: (params) =>
              (res = resource({
                params,
                loader: ({params}) =>
                  new Promise<ValidationError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            onSuccess: (results, {fieldTreeOf}) =>
              results.map((e) => ({
                ...e,
                field: fieldTreeOf(p.child),
              })),
            onError: () => null,
          });
        },
        {injector},
      );

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f.child().value.set('INVALID');

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('pending should flow from parent to child', async () => {
      // We can't guarantee the parent won't assign a tree error to the sibling field, so the
      // sibling must inherit the pending state from the parent.

      let res: Resource<unknown>;

      const f = form(
        signal({child: 'VALID', sibling: ''}),
        (p) => {
          validateAsync(p, {
            params: ({value}) => value().child,
            factory: (params) =>
              (res = resource({
                params,
                loader: ({params}) =>
                  new Promise<ValidationError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            onSuccess: (results, {fieldTreeOf}) =>
              results.map((e) => ({
                ...e,
                field: fieldTreeOf(p.child),
              })),
            onError: () => null,
          });
        },
        {injector},
      );

      expect(f.sibling().pending()).toBe(true);
      expect(f.sibling().valid()).toBe(false);
      expect(f.sibling().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.sibling().pending()).toBe(false);
      expect(f.sibling().valid()).toBe(true);
      expect(f.sibling().invalid()).toBe(false);

      f.child().value.set('INVALID');

      expect(f.sibling().pending()).toBe(true);
      expect(f.sibling().valid()).toBe(false);
      expect(f.sibling().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.sibling().pending()).toBe(false);
      expect(f.sibling().valid()).toBe(true);
      expect(f.sibling().invalid()).toBe(false);
    });

    it('parent should be pending/invalid while child is pending/invalid', async () => {
      let res: Resource<unknown>;

      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validateAsync(p.child, {
            params: ({value}) => value(),
            factory: (params) =>
              (res = resource({
                params,
                loader: ({params}) =>
                  new Promise<ValidationError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
        },
        {injector},
      );

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f.child().value.set('INVALID');

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('pending should flow from child to grandparent', async () => {
      let res: Resource<unknown>;

      const f = form(
        signal({grandparent: {parent: {child: 'VALID'}}}),
        (p) => {
          validateAsync(p.grandparent.parent.child, {
            params: ({value}) => value(),
            factory: (params) =>
              (res = resource({
                params,
                loader: ({params}) =>
                  new Promise<ValidationError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
        },
        {injector},
      );

      expect(f.grandparent.parent.child().pending()).toBe(true);
      expect(f.grandparent.parent().pending()).toBe(true);
      expect(f.grandparent().pending()).toBe(true);
      expect(f().pending()).toBe(true);

      await appRef.whenStable();

      expect(f.grandparent.parent.child().pending()).toBe(false);
      expect(f.grandparent.parent().pending()).toBe(false);
      expect(f.grandparent().pending()).toBe(false);
      expect(f().pending()).toBe(false);
    });

    it('should produce pending status during debounce period', async () => {
      let res: Resource<unknown>;

      const f = form(
        signal('VALID'),
        (p) => {
          validateAsync(p, {
            params: ({value}) => value(),
            debounce: 100,
            factory: (params) =>
              (res = resource({
                params,
                loader: ({params}) =>
                  new Promise<ValidationError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(f().pending()).toBe(false);

      f().value.set('INVALID');
      await appRef.whenStable();

      expect(f().pending()).withContext('pending during debounce').toBe(true);

      await timeout(150);
      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().invalid()).toBe(true);
    });
  });

  describe('promise validator', () => {
    useAutoTick();

    it('should affect validity of host field', async () => {
      const {promise, resolve} = Promise.withResolvers<ValidationError[]>();

      const f = form(
        signal('VALID'),
        (p) => {
          validatePromise(p, () => promise);
        },
        {injector},
      );

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      resolve([]);
      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      const {promise: nextPromise, resolve: nextResolve} =
        Promise.withResolvers<ValidationError[]>();
      let currentPromise = nextPromise;

      const f2 = form(
        signal('VALID'),
        (p) => {
          validatePromise(p, async (value) => {
            return value === 'VALID' ? null : currentPromise;
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(f2().pending()).toBe(false);

      f2().value.set('INVALID');
      await timeout(0);

      expect(f2().pending()).toBe(true);
      expect(f2().valid()).toBe(false);
      expect(f2().invalid()).toBe(false);

      nextResolve([{kind: 'custom'}]);
      await appRef.whenStable();

      expect(f2().pending()).toBe(false);
      expect(f2().valid()).toBe(false);
      expect(f2().invalid()).toBe(true);
    });

    it('should call the validator with only the field value', async () => {
      const validator = jasmine
        .createSpy('validator')
        .and.callFake(async (value: string) => (value === 'taken' ? [{kind: 'taken'}] : null));
      const f = form(signal('free'), (p) => validatePromise(p, validator), {injector});

      await appRef.whenStable();
      expect(validator).toHaveBeenCalledOnceWith('free');

      f().value.set('taken');
      await appRef.whenStable();

      expect(validator).toHaveBeenCalledTimes(2);
      expect(validator.calls.mostRecent().args).toEqual(['taken']);
      expect(f().invalid()).toBe(true);
    });

    it('should not run the validator when `when` returns false', async () => {
      const validator = jasmine.createSpy('validator').and.resolveTo(null);
      const f = form(
        signal('a'),
        (p) => validatePromise(p, validator, {when: ({value}) => value() !== 'a'}),
        {injector},
      );

      await appRef.whenStable();
      expect(validator).not.toHaveBeenCalled();

      f().value.set('b');
      await appRef.whenStable();
      expect(validator).toHaveBeenCalledOnceWith('b');
    });

    it('should map rejected promises to an async error by default', async () => {
      const f = form(
        signal('a'),
        (p) => validatePromise(p, () => Promise.reject(new Error('boom'))),
        {injector},
      );

      await appRef.whenStable();

      const error = f().errors()[0];
      expect(error).toEqual(jasmine.objectContaining({kind: 'asyncError'}));
      expect(error.message).toBeUndefined();
    });

    it('should map rejected promises using `onError`', async () => {
      const f = form(
        signal('a'),
        (p) =>
          validatePromise(p, () => Promise.reject(new Error('boom')), {
            onError: () => ({kind: 'custom-error'}),
          }),
        {injector},
      );

      await appRef.whenStable();
      expect(f().errors()).toEqual([jasmine.objectContaining({kind: 'custom-error'})]);
    });

    it('should produce pending status during debounce period', async () => {
      const f = form(
        signal('VALID'),
        (p) => {
          validatePromise(p, async (value) => (value === 'VALID' ? null : [{kind: 'custom'}]), {
            debounce: 100,
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(f().pending()).toBe(false);

      f().value.set('INVALID');
      await appRef.whenStable();

      expect(f().pending()).withContext('pending during debounce').toBe(true);

      await timeout(150);
      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('should support debounced promise-based async validators', async () => {
      const f = form(
        signal('VALID'),
        (p) => {
          validatePromise(p, async (value) => (value === 'VALID' ? null : [{kind: 'custom'}]), {
            debounce: 100,
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(f().pending()).toBe(false);

      f().value.set('INVALID');
      await appRef.whenStable();

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await timeout(150);
      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);

      f().value.set('VALID');
      await appRef.whenStable();

      expect(f().pending()).toBe(true);

      await timeout(150);
      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);
    });

    it('should pass the current and previous value to custom debounce functions', async () => {
      const debounceSpy = jasmine
        .createSpy('debounce')
        .and.callFake(() => new Promise<void>((resolve) => setTimeout(resolve, 10)));

      const f = form(
        signal('VALID'),
        (p) => {
          validatePromise(p, async (value) => (value === 'VALID' ? null : [{kind: 'custom'}]), {
            debounce: debounceSpy,
          });
        },
        {injector},
      );

      await appRef.whenStable();
      expect(debounceSpy).not.toHaveBeenCalled();

      f().value.set('INVALID');
      await appRef.whenStable();

      expect(debounceSpy).toHaveBeenCalledTimes(1);
      expect(debounceSpy.calls.mostRecent().args[0]).toBe('INVALID');
      expect(debounceSpy.calls.mostRecent().args[1]).toEqual({status: 'resolved', value: 'VALID'});

      await timeout(20);
      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });
  });

  describe('multiple validators', () => {
    it('should be invalid status when validators are mix of valid and invalid', () => {
      const f = form(
        signal('MIXED'),
        (p) => {
          validate(p, () => []);
          validate(p, () => [{kind: 'custom'}]);
        },
        {injector},
      );

      expect(f().pending()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('should be pending status when validators are mix of valid and pending', async () => {
      let res: Resource<unknown>;

      const f = form(
        signal('MIXED'),
        (p) => {
          validate(p, () => []);
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res = resource({
                params,
                loader: () => new Promise<ValidationError[]>((r) => setTimeout(() => r([]))),
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
        },
        {injector},
      );

      expect(f().pending()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);
    });

    it('should be invalid status when validators are mix of invalid and pending', async () => {
      let res!: Resource<unknown>;
      let res2!: Resource<unknown>;

      const promise = Promise.resolve<ValidationError[]>([{kind: 'custom'}]);
      const promise2 = new Promise<ValidationError[]>(() => {});
      const f = form(
        signal('MIXED'),
        (p) => {
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res = resource({
                params,
                loader: () => promise,
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () => promise2,
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
        },
        {injector},
      );

      await promise;
      // Resource needs 2
      await TestBed.tick();
      await TestBed.tick();

      expect(f().pending()).withContext('pending').toBe(true);
      expect(f().valid()).withContext('valid').toBe(false);
      expect(f().invalid()).withContext('invalid').toBe(true);
    });

    it('should be invalid status when validators are mix of valid, invalid, and pending', async () => {
      let res: Resource<unknown>;
      let res2: Resource<unknown>;

      const invalidPromise = Promise.resolve<ValidationError[]>([{kind: 'custom'}]);
      const validPromise = Promise.resolve<ValidationError[]>([]);
      const pendingPromise = new Promise<ValidationError[]>(() => {});

      const f = form(
        signal('MIXED'),
        (p) => {
          validate(p, () => []);
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res = resource({
                params,
                loader: () => invalidPromise,
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () => validPromise,
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () => pendingPromise,
              })),
            onSuccess: (results) => results,
            onError: () => null,
          });
        },
        {injector},
      );

      await invalidPromise;
      await validPromise;
      // Resource needs 2
      await TestBed.tick();
      await TestBed.tick();

      expect(f().pending()).withContext('pending').toBe(true);
      expect(f().valid()).withContext('valid').toBe(false);
      expect(f().invalid()).withContext('invalid').toBe(true);
    });
  });

  describe('NgValidationError', () => {
    it('instanceof should check if structure matches a standard error type', () => {
      const e1 = requiredError();
      expect(e1 instanceof NgValidationError).toBe(true);
      const e2 = {kind: 'min', min: 'two'};
      expect(e2 instanceof NgValidationError).toBe(false);
      const e3 = patternError(/.*@.*\.com/);
      expect(e3 instanceof NgValidationError).toBe(true);
    });

    it('instanceof should narrow the type to a discriminated union', () => {
      const e: unknown = undefined;
      if (e instanceof NgValidationError) {
        e.message;
        switch (e.kind) {
          case 'min':
            e.min;
            break;
          case 'standardSchema':
            e.issue;
            break;
          // @ts-expect-error
          case 'fakekind':
            break;
        }
      }
      // Just so we have an expectation in the test,
      // the real goal is to test the type narrowing above.
      expect(true).toBe(true);
    });
  });
});
