/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview This exposes constants to those who can control access to certain jsaction APIs.
 * We're not using enum `Restriction` because it produces more code overhead;
 * thus, using plain `const` eliminates extra bytes. We can't use `const enum` due
 * to single-file compilation restrictions.
 */

export const RESTRICTION_I_AM_THE_JSACTION_FRAMEWORK = 0;
