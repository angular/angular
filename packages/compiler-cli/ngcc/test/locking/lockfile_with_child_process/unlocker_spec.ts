/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

describe('unlocker', () => {
  it('should attach a handler to the `disconnect` event', async () => {
    spyOn(process, 'on');
    await import('../../../src/locking/lock_file_with_child_process/ngcc_lock_unlocker');
    // TODO: @JiaLiPassion, need to wait for @types/jasmine to handle the override case
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/42455
    expect(process.on).toHaveBeenCalledWith('disconnect' as any, jasmine.any(Function));
  });
});
