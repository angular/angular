/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, Resource, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  FieldTree,
  form,
  NgValidationError,
  patternError,
  requiredError,
  validate,
  validateAsync,
  validateTree,
  ValidationError,
} from '../../public_api';

function validateValue(value: string): ValidationError[] {
  return value === 'INVALID' ? [{kind: 'custom'}] : [];
}

function validateValueForChild(
  value: string,
  fieldTree: FieldTree<unknown> | undefined,
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
