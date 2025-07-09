/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, Resource, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Field, form, validate, validateAsync, validateTree} from '../../public_api';
import {
  NgValidationError,
  ValidationError,
  ValidationTreeError,
} from '../../src/api/validation_errors';

function validateValue(value: string): ValidationError[] {
  return value === 'INVALID' ? [{kind: 'error'}] : [];
}

function validateValueForChild(
  value: string,
  field: Field<unknown> | undefined,
): ValidationTreeError[] {
  return value === 'INVALID' ? [{kind: 'error', field}] : [];
}

async function waitFor(fn: () => boolean, count = 100): Promise<void> {
  while (!fn()) {
    await new Promise((resolve) => setTimeout(resolve, 1));
    if (--count === 0) {
      throw Error('waitFor timeout');
    }
  }
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

      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f().value.set('INVALID');
      expect(f().syncValid()).toBe(false);
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

      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f().syncValid()).toBe(false);
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

      expect(f.child().syncValid()).toBe(true);
      expect(f.child().valid()).toBe(true);
      expect(f.child().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f.child().syncValid()).toBe(true);
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

      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f().value.set('INVALID');
      expect(f().syncValid()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('should affect validity of targeted field', () => {
      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validateTree(p, ({value, fieldOf}) =>
            validateValueForChild(value().child, fieldOf(p.child)),
          );
        },
        {injector},
      );

      expect(f.child().syncValid()).toBe(true);
      expect(f.child().valid()).toBe(true);
      expect(f.child().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f.child().syncValid()).toBe(false);
      expect(f.child().valid()).toBe(false);
      expect(f.child().invalid()).toBe(true);
    });

    it('validity should flow from child to parent', () => {
      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validateTree(p, ({value, fieldOf}) =>
            validateValueForChild(value().child, fieldOf(p.child)),
          );
        },
        {injector},
      );

      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f().syncValid()).toBe(false);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('should not affect sibling validity', () => {
      const f = form(
        signal({child: 'VALID', sibling: ''}),
        (p) => {
          validateTree(p, ({value, fieldOf}) =>
            validateValueForChild(value().child, fieldOf(p.child)),
          );
        },
        {injector},
      );

      expect(f.sibling().syncValid()).toBe(true);
      expect(f.sibling().valid()).toBe(true);
      expect(f.sibling().invalid()).toBe(false);

      f.child().value.set('INVALID');
      expect(f.sibling().syncValid()).toBe(true);
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
                  new Promise<ValidationTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            errors: (errs) => errs,
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());

      expect(f().pending()).toBe(true);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f().value.set('INVALID');
      await waitFor(() => res?.isLoading());

      expect(f().pending()).toBe(true);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().syncValid()).toBe(true);
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
                  new Promise<ValidationTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            errors: (errs, {fieldOf}) =>
              errs.map((e) => ({
                ...e,
                field: fieldOf(p.child),
              })),
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());

      expect(f.child().pending()).toBe(true);
      expect(f.child().syncValid()).toBe(true);
      expect(f.child().valid()).toBe(false);
      expect(f.child().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.child().pending()).toBe(false);
      expect(f.child().syncValid()).toBe(true);
      expect(f.child().valid()).toBe(true);
      expect(f.child().invalid()).toBe(false);

      f.child().value.set('INVALID');
      await waitFor(() => res?.isLoading());

      expect(f.child().pending()).toBe(true);
      expect(f.child().syncValid()).toBe(true);
      expect(f.child().valid()).toBe(false);
      expect(f.child().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.child().pending()).toBe(false);
      expect(f.child().syncValid()).toBe(true);
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
                  new Promise<ValidationTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            errors: (errs, {fieldOf}) =>
              errs.map((e) => ({
                ...e,
                field: fieldOf(p.child),
              })),
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());

      expect(f().pending()).toBe(true);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(true);
      expect(f().invalid()).toBe(false);

      f.child().value.set('INVALID');
      await waitFor(() => res?.isLoading());

      expect(f().pending()).toBe(true);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f().pending()).toBe(false);
      expect(f().syncValid()).toBe(true);
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
                  new Promise<ValidationTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            errors: (errs, {fieldOf}) =>
              errs.map((e) => ({
                ...e,
                field: fieldOf(p.child),
              })),
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());

      expect(f.sibling().pending()).toBe(true);
      expect(f.sibling().syncValid()).toBe(true);
      expect(f.sibling().valid()).toBe(false);
      expect(f.sibling().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.sibling().pending()).toBe(false);
      expect(f.sibling().syncValid()).toBe(true);
      expect(f.sibling().valid()).toBe(true);
      expect(f.sibling().invalid()).toBe(false);

      f.child().value.set('INVALID');
      await waitFor(() => res?.isLoading());

      expect(f.sibling().pending()).toBe(true);
      expect(f.sibling().syncValid()).toBe(true);
      expect(f.sibling().valid()).toBe(false);
      expect(f.sibling().invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.sibling().pending()).toBe(false);
      expect(f.sibling().syncValid()).toBe(true);
      expect(f.sibling().valid()).toBe(true);
      expect(f.sibling().invalid()).toBe(false);
    });
  });

  describe('multiple validators', () => {
    it('should be invalid status when validators are mix of valid and invalid', () => {
      const f = form(
        signal('MIXED'),
        (p) => {
          validate(p, () => []);
          validate(p, () => [{kind: 'error'}]);
        },
        {injector},
      );

      expect(f().pending()).toBe(false);
      expect(f().syncValid()).toBe(false);
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
                loader: () => new Promise<ValidationTreeError[]>((r) => setTimeout(() => r([]))),
              })),
            errors: (errs) => errs,
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());
      expect(f().pending()).toBe(true);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(false);
    });

    it('should be invalid status when validators are mix of invalid and pending', async () => {
      let res: Resource<unknown>;
      let res2: Resource<unknown>;

      const f = form(
        signal('MIXED'),
        (p) => {
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res = resource({
                params,
                loader: () =>
                  new Promise<ValidationTreeError[]>((r) => setTimeout(() => r([{kind: 'error'}]))),
              })),
            errors: (errs) => errs,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () =>
                  new Promise<ValidationTreeError[]>((r) => setTimeout(() => r([]), 10)),
              })),
            errors: (errs) => errs,
          });
        },
        {injector},
      );

      await waitFor(() => !res?.isLoading() && res2.isLoading());
      expect(f().pending()).toBe(true);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });

    it('should be invalid status when validators are mix of valid, invalid, and pending', async () => {
      let res: Resource<unknown>;
      let res2: Resource<unknown>;

      const f = form(
        signal('MIXED'),
        (p) => {
          validate(p, () => []);
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res = resource({
                params,
                loader: () =>
                  new Promise<ValidationTreeError[]>((r) => setTimeout(() => r([{kind: 'error'}]))),
              })),
            errors: (errs) => errs,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () =>
                  new Promise<ValidationTreeError[]>((r) => setTimeout(() => r([]), 10)),
              })),
            errors: (errs) => errs,
          });
        },
        {injector},
      );

      await waitFor(() => !res?.isLoading() && res2.isLoading());
      expect(f().pending()).toBe(true);
      expect(f().syncValid()).toBe(true);
      expect(f().valid()).toBe(false);
      expect(f().invalid()).toBe(true);
    });
  });

  describe('NgValidationError', () => {
    it('instaceof should check if structure matches a standard error type', () => {
      const e1 = {kind: 'required'};
      expect(e1 instanceof NgValidationError).toBe(true);
      const e2 = {kind: 'min', min: 'two'};
      expect(e2 instanceof NgValidationError).toBe(false);
      const e3 = {kind: 'pattern', pattern: '.*@.*\\.com'};
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
          case 'standardschema':
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
