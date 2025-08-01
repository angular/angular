/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DirectivePosition, ElementPosition, SignalNodePosition} from '../../../../../protocol';
import {Frame} from '../../application-environment';
import {ApplicationOperations} from '../../application-operations';
import {SETTINGS_STORE_KEY} from '../settings_store';

export class AppOperationsMock extends ApplicationOperations {
  private storage: {[key: string]: unknown} = {};

  /** Helper method – gives access to stored settings */
  getStoredSettings() {
    return this.storage[SETTINGS_STORE_KEY] as {[key: string]: unknown};
  }

  override async setStorageItems(items: {[key: string]: unknown}): Promise<void> {
    this.storage = {
      ...this.storage,
      ...items,
    };
  }

  override async getStorageItems(items: string[]): Promise<{[key: string]: unknown}> {
    const obj: {[key: string]: unknown} = {};
    for (const item of items) {
      obj[item] = this.storage[item];
    }
    return obj;
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
