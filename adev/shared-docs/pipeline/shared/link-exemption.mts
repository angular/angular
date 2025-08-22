/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// In some case we know that we don't want to link a symbol
// Example when there is a conflict between API entries and compiler features.
// eg: "animate" is both an Animation API entry and an template instruction "animation.enter"

// TODO: We should have more shared logic for linking between API references & Guides

const LINK_EXEMPT = new Set(['animate', 'animate.enter', 'animate.leave']);

export function shouldLinkSymbol(symbol: string): boolean {
  return !LINK_EXEMPT.has(symbol);
}
