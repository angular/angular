/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// These type of comments are used in hash comment based languages such as bash and Yaml
export const regionStartMatcher = /^\s*#\s*#docregion\s*(.*)\s*$/;
export const regionEndMatcher = /^\s*#\s*#enddocregion\s*(.*)\s*$/;
export const plasterMatcher = /^\s*#\s*#docplaster\s*(.*)\s*$/;
export const createPlasterComment = (plaster: string) => `# ${plaster}`;
