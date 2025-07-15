/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {SettingsStore} from './settings_store';
import {ApplicationOperations} from '../application-operations';
import {AppOperationsMock} from './test-utils/app_operations_mock';
import {ApplicationRef} from '@angular/core';

describe('SettingsStore', () => {
  let settingsStore: SettingsStore;
  let getStoredSettings: () => {[key: string]: unknown};

  beforeEach(() => {
    const appOperationsMock = new AppOperationsMock();

    TestBed.configureTestingModule({
      providers: [
        {provide: ApplicationOperations, useValue: appOperationsMock},
        {
          provide: SettingsStore,
          useFactory: () => new SettingsStore({}),
        },
      ],
    });

    settingsStore = TestBed.inject(SettingsStore);
    getStoredSettings = () => appOperationsMock.getStoredSettings();
  });

  it('should return a settings item with an initial value', async () => {
    const item = settingsStore.create({
      key: 'item',
      category: 'test',
      initialValue: 'foo',
    });
    expect(item()).toEqual('foo');
  });

  it('should set a settings item value', async () => {
    const value = settingsStore.create({
      key: 'item',
      category: 'test',
      initialValue: 'foo',
    });
    expect(value()).toEqual('foo');

    value.set('bar');
    expect(value()).toBe('bar');

    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();

    expect(getStoredSettings()['item@test']).toEqual('bar');
  });

  it('should set multiple values to a single settings item', async () => {
    const value = settingsStore.create({
      key: 'item',
      category: 'test',
      initialValue: 'foo',
    });
    expect(value()).toEqual('foo');

    value.set('bar');
    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();
    expect(getStoredSettings()['item@test']).toEqual('bar');

    value.set('baz');
    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();
    expect(getStoredSettings()['item@test']).toEqual('baz');
  });

  it('should set values to multiple settings items', async () => {
    const first = settingsStore.create({
      key: 'first',
      category: 'test',
      initialValue: 'not_set',
    });
    const second = settingsStore.create({
      key: 'second',
      category: 'test',
      initialValue: 'not_set',
    });
    expect(first()).toEqual('not_set');
    expect(second()).toEqual('not_set');

    first.set('1st');
    second.set('2nd');

    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();

    expect(getStoredSettings()['first@test']).toEqual('1st');
    expect(getStoredSettings()['second@test']).toEqual('2nd');
  });

  it('should keep in sync multiple instances of the same settings item', async () => {
    const foo = settingsStore.create({
      key: 'item',
      category: 'test',
      initialValue: 'foo',
    });
    const bar = settingsStore.create({
      key: 'item',
      category: 'test',
      initialValue: 'bar',
    });
    expect(foo()).toEqual('foo');
    expect(bar()).toEqual('foo');

    bar.set('baz');
    expect(foo()).toEqual('baz');
    expect(bar()).toEqual('baz');

    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();

    expect(getStoredSettings()['item@test']).toEqual('baz');
  });

  it('should keep the latest signal value', async () => {
    const value = settingsStore.create({
      key: 'item',
      category: 'test',
      initialValue: 'foo',
    });
    expect(value()).toEqual('foo');

    value.set('bar');
    value.set('baz');
    expect(value()).toBe('baz');

    await TestBed.inject(ApplicationRef).whenStable();
    TestBed.tick();

    expect(getStoredSettings()['item@test']).toEqual('baz');
  });
});
