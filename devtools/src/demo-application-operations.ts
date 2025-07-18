/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject} from '@angular/core';
import {ApplicationOperations} from '../projects/ng-devtools';
import {DirectivePosition, ElementPosition, SignalNodePosition} from '../projects/protocol';
import {LOCAL_STORAGE} from './local-storage';

const STORAGE_KEY = 'ng-dt-storage-sim';

export class DemoApplicationOperations extends ApplicationOperations {
  private readonly localStorage = inject(LOCAL_STORAGE);

  override viewSource(position: ElementPosition): void {
    console.warn('viewSource() is not implemented because the demo app runs in an Iframe');
    throw new Error('Not implemented in demo app.');
  }

  override selectDomElement(position: ElementPosition): void {
    console.warn('selectDomElement() is not implemented because the demo app runs in an Iframe');
    throw new Error('Not implemented in demo app.');
  }

  override inspect(directivePosition: DirectivePosition, keyPath: string[]): void {
    console.warn('inspect() is not implemented because the demo app runs in an Iframe');
    return;
  }

  override inspectSignal(position: SignalNodePosition): void {
    console.warn('inspectSignal() is not implemented because the demo app runs in an Iframe');
    return;
  }

  override viewSourceFromRouter(name: string, type: string): void {
    console.warn(
      'viewSourceFromRouter() is not implemented because the demo app runs in an Iframe',
    );
    throw new Error('Not implemented in demo app.');
  }

  override async setStorageItems(items: {[key: string]: unknown}): Promise<void> {
    const currItems = this.getLsItems();
    this.setLsItems({...currItems, ...items});
  }

  override async getStorageItems(items: string[]): Promise<{[key: string]: unknown}> {
    const currItems = this.getLsItems();
    const redundant = Object.keys(currItems).filter((prop) => !items.includes(prop));

    for (const item of redundant) {
      delete currItems[item];
    }

    return currItems;
  }

  override async removeStorageItems(items: string[]): Promise<void> {
    const currItems = this.getLsItems();

    for (const item of items) {
      delete currItems[item];
    }
    this.setLsItems(currItems);
  }

  private getLsItems(): {[key: string]: unknown} {
    const storage = this.localStorage.getItem(STORAGE_KEY);

    try {
      return JSON.parse(storage ?? '{}');
    } catch {
      this.localStorage.removeItem(STORAGE_KEY);
      console.error(
        'Unable to parse the data from the simulated storage. Cleaning the item and returning a default object',
      );
      return {};
    }
  }

  private setLsItems(items: object) {
    try {
      this.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      console.error('Unable to set item in the simulated storage.');
    }
  }
}
