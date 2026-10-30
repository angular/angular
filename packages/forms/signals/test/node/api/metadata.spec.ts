/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  assertNotInReactiveContext,
  DestroyRef,
  inject,
  InjectionToken,
  Injector,
  signal,
  type Signal,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  applyEach,
  createManagedMetadataKey,
  createMetadataKey,
  debounce,
  form,
  metadata,
  MetadataReducer,
  min,
  required,
} from '../../../public_api';

describe('metadata', () => {
  it('should not create field injectors for plain metadata and built-in rules', () => {
    const injector = TestBed.inject(Injector);
    const createInjector = spyOn(Injector, 'create').and.callThrough();
    const KEY = createMetadataKey<string>();
    const model = signal({name: '', quantity: 0, label: 'initial'});
    const f = form(
      model,
      (p) => {
        required(p.name);
        debounce(p.name, 0);
        min(p.quantity, 1);
        metadata(p.label, KEY, ({value}) => value());
      },
      {injector},
    );

    expect(f.name().invalid()).toBe(true);
    expect(f.quantity().invalid()).toBe(true);
    expect(f.label().metadata(KEY)!()).toBe('initial');

    model.set({name: 'updated', quantity: 1, label: 'updated'});

    expect(f.name().valid()).toBe(true);
    expect(f.quantity().valid()).toBe(true);
    expect(f.label().metadata(KEY)!()).toBe('updated');
    expect(createInjector).not.toHaveBeenCalled();
  });

  it('should not create field injectors just to destroy removed fields', async () => {
    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);
    const model = signal([{value: 'initial'}]);
    const f = form(model, {injector});
    expect(f[0].value().value()).toBe('initial');
    await appRef.whenStable();

    const createInjector = spyOn(Injector, 'create').and.callThrough();
    model.set([]);
    await appRef.whenStable();

    expect(createInjector).not.toHaveBeenCalled();
  });

  it('should share a field injector between managed keys and clean them up on removal', async () => {
    const TOKEN = new InjectionToken<string>('metadata dependency');
    TestBed.configureTestingModule({providers: [{provide: TOKEN, useValue: 'provided'}]});
    const injector = TestBed.inject(Injector);
    const appRef = TestBed.inject(ApplicationRef);
    const contexts: Injector[] = [];
    const created: string[] = [];
    const destroyed: string[] = [];
    const makeKey = (name: string) =>
      createManagedMetadataKey((_state, params: Signal<string | undefined>) => {
        assertNotInReactiveContext(makeKey);
        expect(inject(TOKEN)).toBe('provided');
        contexts.push(inject(Injector));
        created.push(name);
        inject(DestroyRef).onDestroy(() => destroyed.push(name));
        return params;
      });
    const FIRST = makeKey('first');
    const SECOND = makeKey('second');
    const model = signal([{value: 'a'}, {value: 'b'}]);
    const f = form(
      model,
      (p) => {
        applyEach(p, (item) => {
          required(item.value);
          metadata(item.value, FIRST, ({value}) => value());
          metadata(item.value, SECOND, ({value}) => value());
        });
      },
      {injector},
    );

    // Managed keys are created eagerly, before their values are requested.
    f[0].value();
    f[1].value();
    expect(created).toEqual(['first', 'second', 'first', 'second']);
    expect(contexts[0]).toBe(contexts[1]);
    expect(contexts[2]).toBe(contexts[3]);
    expect(contexts[0]).not.toBe(contexts[2]);
    expect(contexts[0]).not.toBe(injector);
    expect(f[0].value().metadata(FIRST)!()).toBe('a');
    expect(f[0].value().metadata(SECOND)!()).toBe('a');
    await appRef.whenStable();

    model.set([model()[1]]);
    await appRef.whenStable();
    expect(destroyed).toEqual(['first', 'second']);
    expect(f[0].value().metadata(FIRST)!()).toBe('b');

    model.set([]);
    await appRef.whenStable();
    expect(destroyed).toEqual(['first', 'second', 'first', 'second']);
    expect(created.length).toBe(4);
  });

  it('should reduce values with MetadataReducer.and', () => {
    const KEY = createMetadataKey(MetadataReducer.and());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => true);

        metadata(p.y, KEY, () => true);
        metadata(p.y, KEY, () => false);
        metadata(p.y, KEY, () => true);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(true);
    expect(f.y().metadata(KEY)?.()).toBe(false);
  });

  it('should reduce values with MetadataReducer.or', () => {
    const KEY = createMetadataKey(MetadataReducer.or());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => false);

        metadata(p.y, KEY, () => false);
        metadata(p.y, KEY, () => true);
        metadata(p.y, KEY, () => false);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(false);
    expect(f.y().metadata(KEY)?.()).toBe(true);
  });

  it('should reduce values with MetadataReducer.list', () => {
    const KEY = createMetadataKey(MetadataReducer.list<string>());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => 'a');

        metadata(p.y, KEY, () => 'b');
        metadata(p.y, KEY, () => 'c');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toEqual(['a']);
    expect(f.y().metadata(KEY)?.()).toEqual(['b', 'c']);
  });

  it('should reduce values with MetadataReducer.max', () => {
    const KEY = createMetadataKey(MetadataReducer.max());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => 10);

        metadata(p.y, KEY, () => 10);
        metadata(p.y, KEY, () => 50);
        metadata(p.y, KEY, () => 20);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(10);
    expect(f.y().metadata(KEY)?.()).toBe(50);
  });

  it('should reduce values with MetadataReducer.min', () => {
    const KEY = createMetadataKey(MetadataReducer.min());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => 10);

        metadata(p.y, KEY, () => 10);
        metadata(p.y, KEY, () => 5);
        metadata(p.y, KEY, () => 20);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(10);
    expect(f.y().metadata(KEY)?.()).toBe(5);
  });

  it('should reduce values with MetadataReducer.override', () => {
    const KEY = createMetadataKey(MetadataReducer.override<number>());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => 10);

        metadata(p.y, KEY, () => 10);
        metadata(p.y, KEY, () => 5);
        metadata(p.y, KEY, () => 20);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(10);
    expect(f.y().metadata(KEY)?.()).toBe(20);
  });
});
