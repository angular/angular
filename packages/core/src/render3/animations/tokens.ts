/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Signifies that a particular style should be pre-computed
 * by the animator at the final frame of its arc so that
 * the transition can properly animate to it (think about
 * dimensional values like width/height and how hard they
 * are in CSS to animate towards).
 *
 * @publicApi
 */
export const AUTO_STYLE = '*';