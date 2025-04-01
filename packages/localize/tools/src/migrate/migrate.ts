/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Mapping between legacy message IDs and their canonical counterparts. */
export type MigrationMapping = {
  [legacyId: string]: string;
};

/** Migrates the legacy message IDs within a single file. */
export function migrateFile(sourceCode: string, mapping: MigrationMapping) {
  const legacyIds = Object.keys(mapping);

  for (const legacyId of legacyIds) {
    const canonicalId = mapping[legacyId];
    const pattern = new RegExp(escapeRegExp(legacyId), 'g');
    sourceCode = sourceCode.replace(pattern, canonicalId);
  }

  return sourceCode;
}

/** Escapes special regex characters in a string. */
function escapeRegExp(str: string): string {
  return str.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
}
