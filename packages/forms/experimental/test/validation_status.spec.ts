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
                  new Promise<FormTreeError[]>((r) =>
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
                  new Promise<FormTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            errors: (errs, {fieldOf}) => errs.map((e) => ({...e, field: fieldOf(p.child)})),
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
                  new Promise<FormTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            errors: (errs, {fieldOf}) => errs.map((e) => ({...e, field: fieldOf(p.child)})),
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
                  new Promise<FormTreeError[]>((r) =>
                    setTimeout(() => r(validateValueForChild(params, undefined))),
                  ),
              })),
            errors: (errs, {fieldOf}) => errs.map((e) => ({...e, field: fieldOf(p.child)})),
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
                loader: () => new Promise<FormTreeError[]>((r) => setTimeout(() => r([]))),
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
                  new Promise<FormTreeError[]>((r) => setTimeout(() => r([{kind: 'error'}]))),
              })),
            errors: (errs) => errs,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () => new Promise<FormTreeError[]>((r) => setTimeout(() => r([]), 10)),
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
                  new Promise<FormTreeError[]>((r) => setTimeout(() => r([{kind: 'error'}]))),
              })),
            errors: (errs) => errs,
          });
          validateAsync(p, {
            params: () => [],
            factory: (params) =>
              (res2 = resource({
                params,
                loader: () => new Promise<FormTreeError[]>((r) => setTimeout(() => r([]), 10)),
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
});
