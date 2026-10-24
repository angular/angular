/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  createEnvironmentInjector,
  DestroyRef,
  EnvironmentInjector,
  inject,
  resource,
  type ResourceRef,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  applyEach,
  createManagedMetadataKey,
  form,
  metadata,
  type SchemaOrSchemaFn,
  validateAsync,
} from '@angular/forms/signals';
import {act} from '@angular/private/testing';

// Specs named `control:` check the harness and pass today. The others fail until destroying the
// form's injector also destroys its fields.
describe('form host teardown', () => {
  const resources: ResourceRef<unknown>[] = [];

  afterEach(() => {
    for (const ref of resources.splice(0)) {
      try {
        ref.destroy();
      } catch {}
    }
  });

  /** A managed key whose `create` registers `destroyed` on the field's `DestroyRef`. */
  function destroyProbe(created: jasmine.Spy, destroyed: jasmine.Spy) {
    return createManagedMetadataKey<void, boolean>(() => {
      created();
      inject(DestroyRef).onDestroy(destroyed);
    });
  }

  /** Async validation whose loader records its `AbortSignal` and never settles. */
  function hangingValidation(loads: AbortSignal[]): SchemaOrSchemaFn<{name: string}> {
    return (p) => {
      validateAsync(p.name, {
        params: ({value}) => value(),
        factory: (params) => {
          const ref = resource({
            params,
            loader: ({abortSignal}) => {
              loads.push(abortSignal);
              return new Promise<string>(() => {});
            },
          });
          resources.push(ref);
          return ref;
        },
        onSuccess: () => undefined,
        onError: () => undefined,
      });
    };
  }

  it('runs root-field DestroyRef callbacks when the form injector is destroyed', () => {
    const env = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const created = jasmine.createSpy('created');
    const destroyed = jasmine.createSpy('destroyed');
    const PROBE = destroyProbe(created, destroyed);

    form(
      signal({name: 'x'}),
      (p) => {
        metadata(p, PROBE, () => true);
      },
      {injector: env},
    );
    expect(created)
      .withContext('precondition: create() ran for the root field')
      .toHaveBeenCalledTimes(1);

    env.destroy();
    expect(destroyed)
      .withContext('root-field DestroyRef callbacks after env.destroy()')
      .toHaveBeenCalledTimes(1);
  });

  it('runs live child-field DestroyRef callbacks when the form injector is destroyed', () => {
    const env = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const created = jasmine.createSpy('created');
    const destroyed = jasmine.createSpy('destroyed');
    const PROBE = destroyProbe(created, destroyed);

    const f = form(
      signal({name: 'x'}),
      (p) => {
        metadata(p.name, PROBE, () => true);
      },
      {injector: env},
    );
    f.name();
    TestBed.tick();
    expect(created)
      .withContext('precondition: create() ran for the child field')
      .toHaveBeenCalledTimes(1);

    env.destroy();
    expect(destroyed)
      .withContext('live child-field DestroyRef callbacks after env.destroy()')
      .toHaveBeenCalledTimes(1);
  });

  it('control: removing an array item runs its DestroyRef callbacks', () => {
    const env = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const created = jasmine.createSpy('created');
    const destroyed = jasmine.createSpy('destroyed');
    const PROBE = destroyProbe(created, destroyed);
    const model = signal(['a', 'b']);

    const f = form(
      model,
      (p) => {
        applyEach(p, (item) => {
          metadata(item, PROBE, () => true);
        });
      },
      {injector: env},
    );
    f[0]();
    TestBed.tick();
    expect(created).withContext('precondition: one create() per item').toHaveBeenCalledTimes(2);

    model.set(['a']);
    TestBed.tick();
    expect(destroyed)
      .withContext('DestroyRef callbacks after removing one item')
      .toHaveBeenCalledTimes(1);
    env.destroy();
  });

  it('aborts an in-flight validateAsync load when the form injector is destroyed', () => {
    const env = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const loads: AbortSignal[] = [];
    const f = form(signal({name: 'x'}), hangingValidation(loads), {injector: env});

    TestBed.tick();
    expect(loads.length).withContext('precondition: one load started').toBe(1);
    expect(f.name().pending()).withContext('precondition: field is pending').toBeTrue();

    env.destroy();
    expect(loads[0].aborted)
      .withContext('loader AbortSignal.aborted after env.destroy()')
      .toBeTrue();
  });

  it('aborts an in-flight validateAsync load when the host component is destroyed', () => {
    const loads: AbortSignal[] = [];

    @Component({template: ''})
    class Host {
      readonly f = form(signal({name: 'x'}), hangingValidation(loads));
    }

    const fixture = act(() => TestBed.createComponent(Host));
    expect(loads.length).withContext('precondition: one load started').toBe(1);
    expect(fixture.componentInstance.f.name().pending())
      .withContext('precondition: field is pending')
      .toBeTrue();

    fixture.destroy();
    expect(loads[0].aborted)
      .withContext('loader AbortSignal.aborted after fixture.destroy()')
      .toBeTrue();
  });

  it('starts no validation loads after the form injector is destroyed', () => {
    const env = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const loads: AbortSignal[] = [];
    const f = form(signal({name: 'x'}), hangingValidation(loads), {injector: env});
    TestBed.tick();
    expect(loads.length).withContext('precondition: one load started').toBe(1);

    env.destroy();
    f.name().value.set('y');
    TestBed.tick();
    expect(loads.length).withContext('loads started, including any after env.destroy()').toBe(1);
  });
});
