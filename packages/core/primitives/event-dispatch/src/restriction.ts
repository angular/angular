/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview Provides a unique symbol used for internal access control to jsaction APIs.
 *
 * This avoids using an `enum` or `const enum` to reduce bundle size and avoid issues
 * with single-file compilation. Using a plain `const` with a `unique symbol` ensures
 * type safety without runtime overhead.
 */
export const RESTRICTION: unique symbol = /* @__PURE__ */ Symbol(
  'core.primitives.event-dispatch.src.restriction.RESTRICTION',
);
