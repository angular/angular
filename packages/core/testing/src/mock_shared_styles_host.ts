/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SharedStylesHost} from '../../src/render3/interfaces/shared_styles_host';

/**
 * Mock implementation of {@link SharedStylesHost} for ensuring usage of the
 * class is correct.
 */
export class MockSharedStylesHost implements SharedStylesHost {
  // Track as an array because the same host might be added multiple times and
  // should be correctly removed as many times.
  private readonly hosts: Node[] = [];

  addStyles(_styles: string[]): void {}
  removeStyles(_styles: string[]): void {}

  addHost(hostNode: Node): void {
    this.hosts.push(hostNode);
  }

  removeHost(hostNode: Node): void {
    const index = this.hosts.indexOf(hostNode);
    if (index > -1) {
      this.hosts.splice(index, 1);
    } else {
      throw new Error('Host not found');
    }
  }

  getActiveHosts(): Node[] {
    // Defensive copy to prevent mutation of internal state.
    return Array.from(this.hosts);
  }
}
