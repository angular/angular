/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Whether we are executing inside Google */
export function isGoogle3() {
  return process.env['GOOGLE3_TSURGE'] === '1';
}

/**
 * By default, Tsurge will always create an Angular compiler program
 * for projects analyzed and migrated. This works perfectly fine in
 * third-party where Tsurge migrations run in Angular CLI projects.
 *
 * In first party, when running against full Google3, creating an Angular
 * program for e.g. plain `ts_library` targets is overly expensive and
 * can result in out of memory issues for large TS targets. In 1P we can
 * reliably distinguish between TS and Angular targets via the `angularCompilerOptions`.
 */
export function google3UsePlainTsProgramIfNoKnownAngularOption() {
  return process.env['GOOGLE3_TSURGE'] === '1';
}
