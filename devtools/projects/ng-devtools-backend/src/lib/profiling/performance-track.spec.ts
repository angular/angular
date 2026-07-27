/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

describe('performance track', () => {
  const globalWithAngularDebugApi = window as unknown as {ng?: unknown};
  let angularDebugApi: unknown;

  beforeEach(() => {
    angularDebugApi = globalWithAngularDebugApi.ng;
    globalWithAngularDebugApi.ng = {};
  });

  afterEach(() => {
    if (angularDebugApi === undefined) {
      delete globalWithAngularDebugApi.ng;
    } else {
      globalWithAngularDebugApi.ng = angularDebugApi;
    }
  });

  it('does not throw an error when initialized in development mode', async () => {
    const performanceTrack = await import('./performance-track');

    expect(() => performanceTrack.enablePerformanceTrack()).not.toThrow();
  });
});
