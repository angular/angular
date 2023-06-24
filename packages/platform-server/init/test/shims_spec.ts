/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import domino from '../../src/bundled-domino';
import {applyShims} from '../src/shims';

describe('applyShims()', () => {
  const globalClone = {...global};

  afterEach(() => {
    // Un-patch `global`.
    const currentProps = Object.keys(global);
    for (const prop of currentProps) {
      if (globalClone.hasOwnProperty(prop)) {
        (global as any)[prop] = (globalClone as any)[prop];
      } else {
        delete (global as any)[prop];
      }
    }
  });

  it('should load `domino.impl` onto `global`', () => {
    expect(global).not.toEqual(jasmine.objectContaining(domino.impl));

    applyShims();
    expect(global).toEqual(jasmine.objectContaining(domino.impl));
  });

  it('should define `KeyboardEvent` on `global`', () => {
    expect((global as any).KeyboardEvent).not.toBe((domino.impl as any).Event);

    applyShims();
    expect((global as any).KeyboardEvent).toBe((domino.impl as any).Event);
  });
});
