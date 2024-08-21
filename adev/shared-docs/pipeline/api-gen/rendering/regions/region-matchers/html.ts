/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// These kind of comments are used in HTML

export const regionStartMatcher = /^\s*<!--\s*#docregion\s*(.*?)\s*(?:-->)?\s*$/;
export const regionEndMatcher = /^\s*<!--\s*#enddocregion\s*(.*?)\s*-->\s*$/;
export const plasterMatcher = /^\s*<!--\s*#docplaster\s*(.*?)\s*-->\s*$/;
export const createPlasterComment = (plaster: string) => `<!-- ${plaster} -->`;
