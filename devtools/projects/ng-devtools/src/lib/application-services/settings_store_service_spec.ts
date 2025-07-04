/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {fakeAsync, TestBed} from '@angular/core/testing';
import {SettingsStoreService} from './settings_store_service';
import {ApplicationOperations} from '../application-operations';
import {DirectivePosition, ElementPosition, SignalNodePosition} from '../../../../protocol';
import {Frame} from '../application-environment';

describe('SettingsStoreService', () => {
  let settingsStore: SettingsStoreService;
  let storage: {[key: string]: unknown};

  beforeEach(() => {
    const appOperationsMock = new AppOperationsMock();

    TestBed.configureTestingModule({
      providers: [
        SettingsStoreService,
        {provide: ApplicationOperations, useValue: appOperationsMock},
      ],
      teardown: {destroyAfterEach: false},
    });

    settingsStore = TestBed.inject(SettingsStoreService);
    storage = appOperationsMock.storage;
  });

  it('should return a settings value with initial value', () => {
    const value = settingsStore.get('item@test', 'foo');
    expect(value()).toEqual('foo');
  });

  // it('should set a value', fakeAsync(() => {
  //   const value = settingsStore.get('item@test', 'foo');
  //   expect(value()).toEqual('foo');

  //   value.set('bar');
  //   TestBed.tick();

  //   expect(storage['item@test']).toEqual('bar');
  // }));
});

class AppOperationsMock extends ApplicationOperations {
  public storage: {[key: string]: unknown} = {};

  override setStorageItems(items: {[key: string]: unknown}): Promise<void> {
    this.storage = {
      ...this.storage,
      ...items,
    };
    return Promise.resolve();
  }

  override getStorageItems(items: string[]): Promise<{[key: string]: unknown}> {
    const obj: {[key: string]: unknown} = {};
    for (const item of items) {
      obj[item] = this.storage[item];
    }
    return Promise.resolve(obj);
  }

  override removeStorageItems(items: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }

  override viewSource(position: ElementPosition, target: Frame, directiveIndex?: number): void {
    throw new Error('Method not implemented.');
  }

  override selectDomElement(position: ElementPosition, target: Frame): void {
    throw new Error('Method not implemented.');
  }

  override inspect(
    directivePosition: DirectivePosition,
    objectPath: string[],
    target: Frame,
  ): void {
    throw new Error('Method not implemented.');
  }

  override inspectSignal(position: SignalNodePosition, target: Frame): void {
    throw new Error('Method not implemented.');
  }

  override viewSourceFromRouter(name: string, type: string, target: Frame): void {
    throw new Error('Method not implemented.');
  }
}
