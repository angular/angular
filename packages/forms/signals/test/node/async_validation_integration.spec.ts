/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ApplicationRef, Injector, resource, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout, useAutoTick, waitFor} from '@angular/private/testing';
import {
  applyEach,
  AsyncLoaderValidatorOptions,
  disabled,
  form,
  hidden,
  PathKind,
  readonly as readOnly,
  SchemaPath,
  SchemaPathRules,
  submit,
  validate,
  validateAsyncLoader,
  validateResource,
} from '../../public_api';

for (const kind of ['loader', 'resource'] as const) {
  describe(`${kind} async validation integration`, () => {
    useAutoTick();
    let injector: Injector;
    let appRef: ApplicationRef;
    beforeEach(() => {
      injector = TestBed.inject(Injector);
      appRef = TestBed.inject(ApplicationRef);
    });

    function register<TValue, TParams, TResult, TPathKind extends PathKind = PathKind.Root>(
      path: SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>,
      opts: AsyncLoaderValidatorOptions<TValue, TParams, TResult, TPathKind>,
    ) {
      if (kind === 'loader') validateAsyncLoader(path, opts);
      else
        validateResource(path, {
          ...opts,
          factory: (params) =>
            resource<TResult, TParams | undefined>({
              params: ({chain}) => chain(params),
              loader: opts.loader,
            }),
        });
    }

    for (const debounce of [undefined, 1]) {
      it(`should propagate fatal resource creation errors ${debounce === undefined ? 'without' : 'with'} debounce`, async () => {
        const invalid = signal(true);
        const dependency = resource({
          params: () => (invalid() ? resource({loader: async () => true, injector}) : undefined),
          loader: async () => true,
          injector,
        });
        const onError = jasmine.createSpy('onError');
        const f = form(
          signal('A'),
          (path) =>
            register(path, {
              params: () => dependency.status(),
              debounce,
              loader: async () => true,
              onSuccess: () => undefined,
              onError,
            }),
          {injector},
        );

        try {
          expect(() => f().errors()).toThrowError(/NG0992/);
          expect(onError).not.toHaveBeenCalled();
        } finally {
          // Make the dependency safe before releasing its scheduled resource work.
          invalid.set(false);
          dependency.destroy();
          await appRef.whenStable();
        }
      });
    }

    for (const gate of ['sync invalid', 'when', 'disabled', 'hidden', 'readonly'] as const) {
      it(`should skip an initially ${gate} field and resume when allowed`, async () => {
        const enabled = signal(false);
        const loader = jasmine.createSpy('loader').and.callFake(async () => 'valid');
        const f = form(
          signal('A'),
          (p) => {
            validate(p, () => (gate === 'sync invalid' && !enabled() ? {kind: 'sync'} : undefined));
            disabled(p, {when: () => gate === 'disabled' && !enabled()});
            hidden(p, {when: () => gate === 'hidden' && !enabled()});
            readOnly(p, {when: () => gate === 'readonly' && !enabled()});
            register(p, {
              params: ({value}) => value(),
              when: () => gate !== 'when' || enabled(),
              loader,
              onSuccess: () => undefined,
              onError: () => undefined,
            });
          },
          {injector},
        );
        await appRef.whenStable();
        expect(loader).not.toHaveBeenCalled();
        enabled.set(true);
        await appRef.whenStable();
        expect(loader).toHaveBeenCalledTimes(1);
        expect(f().valid()).toBeTrue();
      });

      it(`should discard a completion after becoming ${gate} during debounce and recover`, async () => {
        const enabled = signal(true);
        let debounce: ReturnType<typeof Promise.withResolvers<void>>;
        const settle = () => {
          debounce.resolve();
          return debounce.promise;
        };
        const request = Promise.withResolvers<string>();
        const loader = jasmine.createSpy('loader').and.returnValue(request.promise);
        const success = jasmine.createSpy('success');
        const f = form(
          signal('A'),
          (p) => {
            validate(p, () => (gate === 'sync invalid' && !enabled() ? {kind: 'sync'} : undefined));
            disabled(p, {when: () => gate === 'disabled' && !enabled()});
            hidden(p, {when: () => gate === 'hidden' && !enabled()});
            readOnly(p, {when: () => gate === 'readonly' && !enabled()});
            register(p, {
              params: ({value}) => value(),
              debounce: () => (debounce = Promise.withResolvers<void>()).promise,
              when: () => gate !== 'when' || enabled(),
              loader,
              onSuccess: (value) => {
                success(value);
              },
              onError: () => undefined,
            });
          },
          {injector},
        );
        await waitFor(() => throwUnless(loader).toHaveBeenCalledTimes(1));
        enabled.set(false);
        await timeout(0);
        request.resolve('stale');
        await appRef.whenStable();
        f().errors();
        expect(success).not.toHaveBeenCalled();
        await settle();
        await appRef.whenStable();
        loader.and.returnValue(Promise.resolve('fresh'));
        enabled.set(true);
        await appRef.whenStable();
        await settle();
        await appRef.whenStable();
        expect(f().valid()).toBeTrue();
        expect(success).toHaveBeenCalledOnceWith('fresh');
      });
    }

    it('should target child errors and propagate pending and validity through ancestors', async () => {
      const request = Promise.withResolvers<boolean>();
      const loader = jasmine.createSpy('loader').and.returnValue(request.promise);
      const f = form(
        signal({parent: {child: 'A'}, other: 'B'}),
        (p) => {
          register(p.parent, {
            params: ({value}) => value().child,
            loader,
            onSuccess: (_result, {fieldTreeOf}) => ({
              kind: 'remote',
              fieldTree: fieldTreeOf(p.parent.child),
            }),
            onError: () => undefined,
          });
        },
        {injector},
      );
      expect(f().pending()).toBeTrue();
      expect(f.parent().pending()).toBeTrue();
      expect(f.parent.child().pending()).toBeTrue();
      expect(f.other().pending()).toBeFalse();
      request.resolve(false);
      await appRef.whenStable();
      expect(f.parent.child().errors()).toEqual([{kind: 'remote', fieldTree: f.parent.child}]);
      expect(f().invalid()).toBeTrue();
      expect(f.parent().invalid()).toBeTrue();
      expect(f.other().valid()).toBeTrue();
      f().reloadValidation();
      await appRef.whenStable();
      expect(loader).toHaveBeenCalledTimes(2);
    });

    it('should combine independent validators without hiding invalid results behind pending', async () => {
      const request = Promise.withResolvers<boolean>();
      const f = form(
        signal('A'),
        (p) => {
          register(p, {
            params: ({value}) => value(),
            loader: async () => false,
            onSuccess: () => ({kind: 'invalid'}),
            onError: () => undefined,
          });
          register(p, {
            params: ({value}) => value(),
            loader: () => request.promise,
            onSuccess: () => undefined,
            onError: () => undefined,
          });
        },
        {injector},
      );
      await timeout(0);
      expect(f().invalid()).toBeTrue();
      expect(f().pending()).toBeTrue();
      request.resolve(true);
      await appRef.whenStable();
      expect(f().pending()).toBeFalse();
      expect(f().invalid()).toBeTrue();
    });

    it('should preserve the submission policy for pending validation', async () => {
      const request = Promise.withResolvers<boolean>();
      const f = form(
        signal('A'),
        (p) =>
          register(p, {
            params: ({value}) => value(),
            loader: () => request.promise,
            onSuccess: () => undefined,
            onError: () => undefined,
          }),
        {injector},
      );
      expect(f().pending()).toBeTrue();
      const action = jasmine.createSpy('action').and.callFake(async () => undefined);
      expect(await submit(f, {action, ignoreValidators: 'none'})).toBeFalse();
      expect(action).not.toHaveBeenCalled();
      // Pending validation is ignored by default; it is not implicitly awaited.
      expect(await submit(f, {action})).toBeTrue();
      request.resolve(true);
      await appRef.whenStable();
      expect(f().valid()).toBeTrue();
      expect(await submit(f, {action, ignoreValidators: 'none'})).toBeTrue();
    });

    it('should release pending work when an array item is removed', async () => {
      const model = signal([{name: 'A'}]);
      const request = Promise.withResolvers<string>();
      let aborted = false;
      const success = jasmine.createSpy('success');
      const f = form(
        model,
        (p) =>
          applyEach(p, (item) =>
            register(item.name, {
              params: ({value}) => value(),
              loader: ({abortSignal}) => {
                abortSignal.addEventListener('abort', () => {
                  aborted = true;
                  request.resolve('aborted');
                });
                return request.promise;
              },
              onSuccess: (value) => {
                success(value);
              },
              onError: () => undefined,
            }),
          ),
        {injector},
      );
      await waitFor(() => throwUnless(f[0].name().pending()).toBeTrue());
      await timeout(0);
      model.set([]);
      await appRef.whenStable();
      expect(aborted).toBeTrue();
      expect(f().pending()).toBeFalse();
      expect(success).not.toHaveBeenCalled();
    });

    it('should create parent and lazy child validators without resource creation cycles', async () => {
      const f = form(
        signal({child: 'A'}),
        (p) => {
          register(p, {
            params: ({stateOf}) => stateOf(p.child).value(),
            loader: async ({params}) => params,
            onSuccess: () => undefined,
            onError: () => undefined,
          });
          register(p.child, {
            params: ({value}) => value(),
            loader: async ({params}) => params,
            onSuccess: () => undefined,
            onError: () => undefined,
          });
        },
        {injector},
      );
      await appRef.whenStable();
      expect(f().valid()).toBeTrue();
    });
  });
}
