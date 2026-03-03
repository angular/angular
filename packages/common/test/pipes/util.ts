/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export async function timeout(ms?: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function useAutoTick() {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().autoTick();
  });
  afterEach(() => {
    jasmine.clock().uninstall();
  });
}
