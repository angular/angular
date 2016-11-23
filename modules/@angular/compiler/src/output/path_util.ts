/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Interface that defines how import statements should be generated.
 */
export abstract class ImportGenerator {
  abstract getImportPath(moduleUrlStr: string, importedUrlStr: string): string;
}
