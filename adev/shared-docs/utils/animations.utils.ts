/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export const shouldReduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
