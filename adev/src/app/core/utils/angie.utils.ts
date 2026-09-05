/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ANGIE_ASSETS_PATH, ANGIE_POSES} from '../constants/angie';

/** Drawn once so that every part of the page shows the same Angie. */
let pose: (typeof ANGIE_POSES)[number] | undefined;

function angieSrc(): string {
  pose ??= ANGIE_POSES[Math.floor(Math.random() * ANGIE_POSES.length)];
  return `${ANGIE_ASSETS_PATH}/${pose}.svg`;
}

/** Picks a pose to show while `angie` is among the query params. */
export function angieSrcFromParams(params: Record<string, unknown>): string | null {
  return 'angie' in params ? angieSrc() : null;
}

/** Picks a pose to show while `angie` is in the query string. */
export function angieSrcFromSearch(search: string): string | null {
  return search.includes('angie') ? angieSrc() : null;
}
