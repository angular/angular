/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {sayHello} from './index.js';

describe('rust', () => {
  it('should generate a hello string', () => {
    const greeting = sayHello('World');
    expect(greeting).toBe('Hello, World!');
  });
});
