/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject} from '@angular/core';
import {ApplicationOperations} from '../projects/ng-devtools';
import {LOCAL_STORAGE} from './local-storage';
const STORAGE_KEY = 'ng-dt-storage-sim';
export class DemoApplicationOperations extends ApplicationOperations {
  constructor() {
    super(...arguments);
    this.localStorage = inject(LOCAL_STORAGE);
  }
  viewSource(position) {
    console.warn('viewSource() is not implemented because the demo app runs in an Iframe');
    throw new Error('Not implemented in demo app.');
  }
  selectDomElement(position) {
    console.warn('selectDomElement() is not implemented because the demo app runs in an Iframe');
    throw new Error('Not implemented in demo app.');
  }
  inspect(directivePosition, keyPath) {
    console.warn('inspect() is not implemented because the demo app runs in an Iframe');
    return;
  }
  inspectSignal(position) {
    console.warn('inspectSignal() is not implemented because the demo app runs in an Iframe');
    return;
  }
  viewSourceFromRouter(name, type) {
    console.warn(
      'viewSourceFromRouter() is not implemented because the demo app runs in an Iframe',
    );
    throw new Error('Not implemented in demo app.');
  }
  async setStorageItems(items) {
    const currItems = this.getLsItems();
    this.setLsItems({...currItems, ...items});
  }
  async getStorageItems(items) {
    const currItems = this.getLsItems();
    const redundant = Object.keys(currItems).filter((prop) => !items.includes(prop));
    for (const item of redundant) {
      delete currItems[item];
    }
    return currItems;
  }
  async removeStorageItems(items) {
    const currItems = this.getLsItems();
    for (const item of items) {
      delete currItems[item];
    }
    this.setLsItems(currItems);
  }
  getLsItems() {
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
  setLsItems(items) {
    try {
      this.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      console.error('Unable to set item in the simulated storage.');
    }
  }
}
//# sourceMappingURL=demo-application-operations.js.map
