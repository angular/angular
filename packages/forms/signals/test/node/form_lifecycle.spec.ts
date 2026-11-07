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
  ResourceRef,
  signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {FormControl} from '@angular/forms';
import {timeout, useAutoTick} from '@angular/private/testing';
import {compatForm} from '../../compat/public_api';
import {FieldNode} from '../../src/field/node';
import {
  applyEach,
  createManagedMetadataKey,
  form,
  metadata,
  SchemaOrSchemaFn,
  validateAsync,
} from '../../public_api';

describe('form lifecycle', () => {
  useAutoTick();

  const resources: ResourceRef<string | undefined>[] = [];

  afterEach(() => {
    for (const ref of resources) {
      ref.destroy();
    }
    resources.length = 0;
  });

  function cleanupKey(onDestroy: () => void) {
    return createManagedMetadataKey(() => {
      inject(DestroyRef).onDestroy(onDestroy);
      return true;
    });
  }

  function pendingValidation(loads: AbortSignal[]): SchemaOrSchemaFn<{name: string}> {
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

  it('cleans up root and child fields when the form injector is destroyed before its first tick', () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const destroyed = jasmine.createSpy('destroyed');
    const key = cleanupKey(destroyed);
    const f = form(
      signal({name: ''}),
      (p) => {
        metadata(p, key, () => undefined);
        metadata(p.name, key, () => undefined);
      },
      {injector},
    );
    expect(f().metadata(key)).toBeTrue();
    expect(f.name().metadata(key)).toBeTrue();

    injector.destroy();

    expect(destroyed).toHaveBeenCalledTimes(2);
  });

  it('cleans up fields when their owning component is destroyed', () => {
    const destroyed = jasmine.createSpy('destroyed');
    const key = cleanupKey(destroyed);

    @Component({template: ''})
    class Host {
      readonly f = form(signal(''), (p) => metadata(p, key, () => undefined));
    }

    const fixture = TestBed.createComponent(Host);
    expect(fixture.componentInstance.f().metadata(key)).toBeTrue();

    fixture.destroy();

    expect(destroyed).toHaveBeenCalledTimes(1);
  });

  for (const placement of ['root', 'child'] as const) {
    it(`cleans up a compat ${placement} field when the form injector is destroyed`, () => {
      const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
      const destroyed = jasmine.createSpy('destroyed');
      const control = new FormControl('', {nonNullable: true});
      const field =
        placement === 'root'
          ? compatForm(signal(control), {injector})
          : compatForm(signal({name: control}), {injector}).name;
      // Compat fields do not support metadata rules, so register directly with the field injector.
      (field() as unknown as FieldNode).structure.injector.get(DestroyRef).onDestroy(destroyed);

      injector.destroy();

      expect(destroyed).toHaveBeenCalledTimes(1);
    });
  }

  it('does not clean up removed fields again when the form injector is destroyed', async () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const destroyed = jasmine.createSpy('destroyed');
    const key = cleanupKey(destroyed);
    const model = signal(['first', 'second']);
    const f = form(model, (p) => applyEach(p, (item) => metadata(item, key, () => undefined)), {
      injector,
    });
    expect(f[0]().metadata(key)).toBeTrue();
    expect(f[1]().metadata(key)).toBeTrue();
    await timeout();

    model.set(['first']);
    await timeout();
    expect(destroyed).toHaveBeenCalledTimes(1);

    expect(() => injector.destroy()).not.toThrow();
    expect(destroyed).toHaveBeenCalledTimes(2);
  });

  it('aborts pending validation and stops reacting after the form injector is destroyed', async () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const loads: AbortSignal[] = [];
    const model = signal({name: 'first'});
    form(model, pendingValidation(loads), {injector});
    await timeout();
    expect(loads.length).toBe(1);
    expect(loads[0].aborted).toBeFalse();

    injector.destroy();

    expect(loads[0].aborted).toBeTrue();
    model.set({name: 'second'});
    await timeout();
    expect(loads.length).toBe(1);
  });

  it('aborts pending validation when the owning component is destroyed', async () => {
    const loads: AbortSignal[] = [];

    @Component({template: ''})
    class Host {
      readonly f = form(signal({name: 'first'}), pendingValidation(loads));
    }

    const fixture = TestBed.createComponent(Host);
    await timeout();
    expect(loads.length).toBe(1);
    expect(loads[0].aborted).toBeFalse();

    fixture.destroy();

    expect(loads[0].aborted).toBeTrue();
  });

  it('keeps validation alive until an explicitly provided injector is destroyed', async () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const loads: AbortSignal[] = [];

    @Component({template: ''})
    class Host {
      readonly model = signal({name: 'first'});
      readonly f = form(this.model, pendingValidation(loads), {injector});
    }

    const fixture = TestBed.createComponent(Host);
    await timeout();
    expect(loads.length).toBe(1);

    fixture.destroy();

    expect(loads[0].aborted).toBeFalse();
    fixture.componentInstance.model.set({name: 'second'});
    await timeout();
    expect(loads.length).toBe(2);
    expect(loads[1].aborted).toBeFalse();

    injector.destroy();

    expect(loads[1].aborted).toBeTrue();
  });
});
