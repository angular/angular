/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface ManifestEntry {
  name: string;
  aliases?: string[];
  type: string;
  category?: string;
  deprecated?: {version?: string};
  developerPreview?: {version?: string};
  experimental?: {version?: string};
  stable?: {version?: string};
}

export type PackageSubEntry = {
  moduleName: string;
  normalizedModuleName: string;
  moduleLabel: string;
  entries: ManifestEntry[];
};

/** Manifest that maps each module name to a list of API symbols. */
export type Manifest = Record<string, PackageSubEntry[]>;
