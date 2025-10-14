/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ApplicationOperations} from '../../application-operations';
import {SETTINGS_STORE_KEY} from '../settings_store';
export class AppOperationsMock extends ApplicationOperations {
  constructor() {
    super(...arguments);
    this.storage = {};
  }
  /** Helper method – gives access to stored settings */
  getStoredSettings() {
    return this.storage[SETTINGS_STORE_KEY];
  }
  async setStorageItems(items) {
    this.storage = {
      ...this.storage,
      ...items,
    };
  }
  async getStorageItems(items) {
    const obj = {};
    for (const item of items) {
      obj[item] = this.storage[item];
    }
    return obj;
  }
  removeStorageItems(items) {
    throw new Error('Method not implemented.');
  }
  viewSource(position, target, directiveIndex) {
    throw new Error('Method not implemented.');
  }
  selectDomElement(position, target) {
    throw new Error('Method not implemented.');
  }
  inspect(directivePosition, objectPath, target) {
    throw new Error('Method not implemented.');
  }
  inspectSignal(position, target) {
    throw new Error('Method not implemented.');
  }
  viewSourceFromRouter(name, type, target) {
    throw new Error('Method not implemented.');
  }
}
//# sourceMappingURL=app_operations_mock.js.map
