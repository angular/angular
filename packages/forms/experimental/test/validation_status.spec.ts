import {ApplicationRef, Injector, Resource, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Field, form, FormError, FormTreeError, validate, validateTree} from '../public_api';
import {validateAsync} from '../src/api/async';

function validateValue(value: string): FormError[] {
  return value === 'INVALID' ? [{kind: 'error'}] : [];
}

function validateValueForChild(value: string, field: Field<unknown> | undefined): FormTreeError[] {
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

      expect(f.$state.status()).toBe('valid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(true);
      expect(f.$state.invalid()).toBe(false);

      f.$state.value.set('INVALID');
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.syncValid()).toBe(false);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
    });

    it('validity should flow from child to parent', () => {
      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validate(p.child, ({value}) => validateValue(value()));
        },
        {injector},
      );

      expect(f.$state.status()).toBe('valid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(true);
      expect(f.$state.invalid()).toBe(false);

      f.child.$state.value.set('INVALID');
      expect(f.$state.syncValid()).toBe(false);
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
    });

    it('validity should not flow from parent to child', () => {
      const f = form(
        signal({child: 'VALID'}),
        (p) => {
          validate(p, ({value}) => validateValue(value().child));
        },
        {injector},
      );

      expect(f.child.$state.status()).toBe('valid');
      expect(f.child.$state.syncValid()).toBe(true);
      expect(f.child.$state.valid()).toBe(true);
      expect(f.child.$state.invalid()).toBe(false);

      f.child.$state.value.set('INVALID');
      expect(f.child.$state.status()).toBe('valid');
      expect(f.child.$state.syncValid()).toBe(true);
      expect(f.child.$state.valid()).toBe(true);
      expect(f.child.$state.invalid()).toBe(false);
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

      expect(f.$state.status()).toBe('valid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(true);
      expect(f.$state.invalid()).toBe(false);

      f.$state.value.set('INVALID');
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.syncValid()).toBe(false);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
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

      expect(f.child.$state.status()).toBe('valid');
      expect(f.child.$state.syncValid()).toBe(true);
      expect(f.child.$state.valid()).toBe(true);
      expect(f.child.$state.invalid()).toBe(false);

      f.child.$state.value.set('INVALID');
      expect(f.child.$state.status()).toBe('invalid');
      expect(f.child.$state.syncValid()).toBe(false);
      expect(f.child.$state.valid()).toBe(false);
      expect(f.child.$state.invalid()).toBe(true);
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

      expect(f.$state.status()).toBe('valid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(true);
      expect(f.$state.invalid()).toBe(false);

      f.child.$state.value.set('INVALID');
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.syncValid()).toBe(false);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
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

      expect(f.sibling.$state.status()).toBe('valid');
      expect(f.sibling.$state.syncValid()).toBe(true);
      expect(f.sibling.$state.valid()).toBe(true);
      expect(f.sibling.$state.invalid()).toBe(false);

      f.child.$state.value.set('INVALID');
      expect(f.sibling.$state.status()).toBe('valid');
      expect(f.sibling.$state.syncValid()).toBe(true);
      expect(f.sibling.$state.valid()).toBe(true);
      expect(f.sibling.$state.invalid()).toBe(false);
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
                  new Promise<FormTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            error: (errs) => errs,
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());

      expect(f.$state.hasPendingValidators()).toBe(true);
      expect(f.$state.status()).toBe('pending');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.$state.hasPendingValidators()).toBe(false);
      expect(f.$state.status()).toBe('valid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(true);
      expect(f.$state.invalid()).toBe(false);

      f.$state.value.set('INVALID');
      await waitFor(() => res?.isLoading());

      expect(f.$state.hasPendingValidators()).toBe(true);
      expect(f.$state.status()).toBe('pending');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.$state.hasPendingValidators()).toBe(false);
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
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
                  new Promise<FormTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            error: (errs, {fieldOf}) => errs.map((e) => ({...e, field: fieldOf(p.child)})),
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());

      expect(f.child.$state.hasPendingValidators()).toBe(true);
      expect(f.child.$state.status()).toBe('pending');
      expect(f.child.$state.syncValid()).toBe(true);
      expect(f.child.$state.valid()).toBe(false);
      expect(f.child.$state.invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.child.$state.hasPendingValidators()).toBe(false);
      expect(f.child.$state.status()).toBe('valid');
      expect(f.child.$state.syncValid()).toBe(true);
      expect(f.child.$state.valid()).toBe(true);
      expect(f.child.$state.invalid()).toBe(false);

      f.child.$state.value.set('INVALID');
      await waitFor(() => res?.isLoading());

      expect(f.child.$state.hasPendingValidators()).toBe(true);
      expect(f.child.$state.status()).toBe('pending');
      expect(f.child.$state.syncValid()).toBe(true);
      expect(f.child.$state.valid()).toBe(false);
      expect(f.child.$state.invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.child.$state.hasPendingValidators()).toBe(false);
      expect(f.child.$state.status()).toBe('invalid');
      expect(f.child.$state.syncValid()).toBe(true);
      expect(f.child.$state.valid()).toBe(false);
      expect(f.child.$state.invalid()).toBe(true);
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
                  new Promise<FormTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            error: (errs, {fieldOf}) => errs.map((e) => ({...e, field: fieldOf(p.child)})),
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());

      expect(f.$state.hasPendingValidators()).toBe(true);
      expect(f.$state.status()).toBe('pending');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.$state.hasPendingValidators()).toBe(false);
      expect(f.$state.status()).toBe('valid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(true);
      expect(f.$state.invalid()).toBe(false);

      f.child.$state.value.set('INVALID');
      await waitFor(() => res?.isLoading());

      expect(f.$state.hasPendingValidators()).toBe(true);
      expect(f.$state.status()).toBe('pending');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.$state.hasPendingValidators()).toBe(false);
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
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
                  new Promise<FormTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            error: (errs, {fieldOf}) => errs.map((e) => ({...e, field: fieldOf(p.child)})),
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());

      expect(f.sibling.$state.hasPendingValidators()).toBe(true);
      expect(f.sibling.$state.status()).toBe('pending');
      expect(f.sibling.$state.syncValid()).toBe(true);
      expect(f.sibling.$state.valid()).toBe(false);
      expect(f.sibling.$state.invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.sibling.$state.hasPendingValidators()).toBe(false);
      expect(f.sibling.$state.status()).toBe('valid');
      expect(f.sibling.$state.syncValid()).toBe(true);
      expect(f.sibling.$state.valid()).toBe(true);
      expect(f.sibling.$state.invalid()).toBe(false);

      f.child.$state.value.set('INVALID');
      await waitFor(() => res?.isLoading());

      expect(f.sibling.$state.hasPendingValidators()).toBe(true);
      expect(f.sibling.$state.status()).toBe('pending');
      expect(f.sibling.$state.syncValid()).toBe(true);
      expect(f.sibling.$state.valid()).toBe(false);
      expect(f.sibling.$state.invalid()).toBe(false);

      await appRef.whenStable();

      expect(f.sibling.$state.hasPendingValidators()).toBe(false);
      expect(f.sibling.$state.status()).toBe('valid');
      expect(f.sibling.$state.syncValid()).toBe(true);
      expect(f.sibling.$state.valid()).toBe(true);
      expect(f.sibling.$state.invalid()).toBe(false);
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

      expect(f.$state.hasPendingValidators()).toBe(false);
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.syncValid()).toBe(false);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
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
                loader: () => new Promise<FormTreeError[]>((r) => setTimeout(() => r([]))),
              })),
            error: (errs) => errs,
          });
        },
        {injector},
      );

      await waitFor(() => res?.isLoading());
      expect(f.$state.hasPendingValidators()).toBe(true);
      expect(f.$state.status()).toBe('pending');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(false);
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
                  new Promise<FormTreeError[]>((r) => setTimeout(() => r([{kind: 'error'}]))),
              })),
            error: (errs) => errs,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () => new Promise<FormTreeError[]>((r) => setTimeout(() => r([]), 10)),
              })),
            error: (errs) => errs,
          });
        },
        {injector},
      );

      await waitFor(() => !res?.isLoading() && res2.isLoading());
      expect(f.$state.hasPendingValidators()).toBe(true);
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
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
                  new Promise<FormTreeError[]>((r) => setTimeout(() => r([{kind: 'error'}]))),
              })),
            error: (errs) => errs,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () => new Promise<FormTreeError[]>((r) => setTimeout(() => r([]), 10)),
              })),
            error: (errs) => errs,
          });
        },
        {injector},
      );

      await waitFor(() => !res?.isLoading() && res2.isLoading());
      expect(f.$state.hasPendingValidators()).toBe(true);
      expect(f.$state.status()).toBe('invalid');
      expect(f.$state.syncValid()).toBe(true);
      expect(f.$state.valid()).toBe(false);
      expect(f.$state.invalid()).toBe(true);
    });
  });
});
