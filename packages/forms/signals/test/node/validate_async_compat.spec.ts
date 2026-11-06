/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ApplicationRef,
  Injector,
  resource,
  Resource,
  ResourceDependencyError,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout, useAutoTick} from '@angular/private/testing';
import {form, validateAsync} from '../../public_api';

describe('deprecated validateAsync compatibility', () => {
  useAutoTick();

  for (const thrown of [new Error('failure'), undefined, 'bad']) {
    it(`should preserve the dependency error envelope for ${String(thrown)}`, async () => {
      let source!: Resource<string | undefined>;
      const onError = jasmine.createSpy('onError').and.returnValue({kind: 'legacy'});
      const f = form(
        signal('input'),
        (p) =>
          validateAsync(p, {
            params: () => {
              throw thrown;
            },
            debounce: 1,
            factory: (params) => {
              // Capture the dependency through the error, not through private resource state.
              return resource({params, loader: async ({params}) => params});
            },
            onSuccess: () => undefined,
            onError,
          }),
        {injector: TestBed.inject(Injector)},
      );
      await TestBed.inject(ApplicationRef).whenStable();
      expect(f().errors()).toEqual([{kind: 'legacy', fieldTree: f}]);
      const error = onError.calls.mostRecent().args[0] as ResourceDependencyError;
      expect(error).toEqual(jasmine.any(ResourceDependencyError));
      expect(error.name).toBe('ResourceDependencyError');
      expect(error.cause).toBe(thrown);
      source = error.dependency as Resource<string | undefined>;
      expect(source.status()).toBe('error');
      expect<unknown>(source.error()).toBe(thrown);
    });
  }

  it('should keep legacy debounce loading status and direct resource reload behavior', async () => {
    const loader = jasmine.createSpy('loader').and.callFake(async () => 'result');
    let target!: Resource<string | undefined>;
    const f = form(
      signal('A'),
      (p) =>
        validateAsync(p, {
          params: ({value}) => value(),
          debounce: 10,
          factory: (params) => (target = resource({params, loader})),
          onSuccess: () => undefined,
          onError: () => undefined,
        }),
      {injector: TestBed.inject(Injector)},
    );
    const appRef = TestBed.inject(ApplicationRef);
    await appRef.whenStable();
    f().value.set('B');
    await appRef.whenStable();
    expect(target.status()).toBe('loading');
    f().reloadValidation();
    expect(loader).toHaveBeenCalledTimes(1);
    await timeout(10);
    await appRef.whenStable();
    expect(loader).toHaveBeenCalledTimes(2);
    expect(loader.calls.mostRecent().args[0].previous.status).toBe('loading');
    expect(f().valid()).toBeTrue();
  });
});
