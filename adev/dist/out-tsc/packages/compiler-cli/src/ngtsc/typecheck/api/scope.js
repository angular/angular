/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Which kind of Angular Trait the import targets.
 */
export var PotentialImportKind;
(function (PotentialImportKind) {
  PotentialImportKind[(PotentialImportKind['NgModule'] = 0)] = 'NgModule';
  PotentialImportKind[(PotentialImportKind['Standalone'] = 1)] = 'Standalone';
})(PotentialImportKind || (PotentialImportKind = {}));
/**
 * Possible modes in which to look up a potential import.
 */
export var PotentialImportMode;
(function (PotentialImportMode) {
  /** Whether an import is standalone is inferred based on its metadata. */
  PotentialImportMode[(PotentialImportMode['Normal'] = 0)] = 'Normal';
  /**
   * An import is assumed to be standalone and is imported directly. This is useful for migrations
   * where a declaration wasn't standalone when the program was created, but will become standalone
   * as a part of the migration.
   */
  PotentialImportMode[(PotentialImportMode['ForceDirect'] = 1)] = 'ForceDirect';
})(PotentialImportMode || (PotentialImportMode = {}));
//# sourceMappingURL=scope.js.map
