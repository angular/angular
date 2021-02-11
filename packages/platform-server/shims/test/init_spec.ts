/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {init} from '../src/init';

describe('init()', () => {
  if (isBrowser) return;  // NODE only

  const domino = require('domino');
  const globalClone = {...global};

  afterEach(() => {
    // Un-patch `global`.
    const currentProps = Object.keys(global) as (keyof NodeJS.Global)[];
    for (const prop of currentProps) {
      if (globalClone.hasOwnProperty(prop)) {
        (global as any)[prop] = globalClone[prop];
      } else {
        delete (global as any)[prop];
      }
    }
  });

  it('should load `domino.impl` onto `global`', () => {
    expect(global).not.toEqual(jasmine.objectContaining(domino.impl));

    init();
    expect(global).toEqual(jasmine.objectContaining(domino.impl));
  });

  it('should define `KeyboardEvent` on `global`', () => {
    expect((global as any).KeyboardEvent).not.toBe((domino.impl as any).Event);

    init();
    expect((global as any).KeyboardEvent).toBe((domino.impl as any).Event);
  });
});
