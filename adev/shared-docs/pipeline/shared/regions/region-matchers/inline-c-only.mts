/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// These kind of comments are used in languages that do not support block comments, such as Jade
export const regionStartMatcher = /^\s*\/\/\s*#docregion\s*(.*)\s*$/;
export const regionEndMatcher = /^\s*\/\/\s*#enddocregion\s*(.*)\s*$/;
export const plasterMatcher = /^\s*\/\/\s*#docplaster\s*(.*)\s*$/;
export const createPlasterComment = (plaster: string) => `// ${plaster}`;
