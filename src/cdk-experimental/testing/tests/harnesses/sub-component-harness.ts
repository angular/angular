/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '../../component-harness';
import {TestElement} from '../../test-element';

export class SubComponentHarness extends ComponentHarness {
  readonly title = this.find('h2');
  readonly getItems = this.findAll('li');

  async getItem(index: number): Promise<TestElement> {
    const items = await this.getItems();
    return items[index];
  }
}
