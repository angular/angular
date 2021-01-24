/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const domino = require('domino');
import {init} from '../src/init';

describe('init()', () => {
  afterEach(() => {
    // Un-patch `global`.
    for (const prop of Object.keys(domino.impl)) {
      delete (global as any)[prop];
    }
    delete (global as any).KeyboardEvent;
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
