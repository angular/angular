/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import type {DocEntry, EntryCollection, JsDocTagEntry, FunctionEntry} from '@angular/compiler-cli';

export interface ManifestEntry {
  name: string;
  type: string;
  isDeprecated: boolean;
  isDeveloperPreview: boolean;
  isExperimental: boolean;
}

/** Manifest that maps each module name to a list of API symbols. */
export type Manifest = {
  moduleName: string;
  normalizedModuleName: string;
  moduleLabel: string;
  entries: ManifestEntry[];
}[];

/** Gets whether the given entry has a given JsDoc tag. */
function hasTag(entry: DocEntry | FunctionEntry, tag: string, every = false) {
  const hasTagName = (t: JsDocTagEntry) => t.name === tag;

  if (every && 'signatures' in entry && entry.signatures.length > 1) {
    // For overloads we need to check all signatures.
    return entry.signatures.every((s) => s.jsdocTags.some(hasTagName));
  }

  const jsdocTags = [
    ...entry.jsdocTags,
    ...((entry as FunctionEntry).signatures?.flatMap((s) => s.jsdocTags) ?? []),
    ...((entry as FunctionEntry).implementation?.jsdocTags ?? []),
  ];

  return jsdocTags.some(hasTagName);
}

/** Gets whether the given entry is deprecated in the manifest. */
function isDeprecated(entry: DocEntry): boolean {
  return hasTag(entry, 'deprecated', /* every */ true);
}

/** Gets whether the given entry is hasDeveloperPreviewTag in the manifest. */
function isDeveloperPreview(entry: DocEntry): boolean {
  return hasTag(entry, 'developerPreview');
}

/** Gets whether the given entry is hasExperimentalTag in the manifest. */
function isExperimental(entry: DocEntry): boolean {
  return hasTag(entry, 'experimental');
}

/**
 * Generates an API manifest for a set of API collections extracted by
 * extract_api_to_json.
 */
export function generateManifest(apiCollections: EntryCollection[]): Manifest {
  const manifest: Manifest = [];
  for (const collection of apiCollections) {
    const entries = collection.entries.map((entry: DocEntry) => ({
      name: entry.name,
      type: entry.entryType,
      isDeprecated: isDeprecated(entry),
      isDeveloperPreview: isDeveloperPreview(entry),
      isExperimental: isExperimental(entry),
    }));

    const existingEntry = manifest.find((entry) => entry.moduleName === collection.moduleName);
    if (existingEntry) {
      existingEntry.entries.push(...entries);
    } else {
      manifest.push({
        moduleName: collection.moduleName,
        normalizedModuleName: collection.normalizedModuleName,
        moduleLabel: collection.moduleLabel ?? collection.moduleName,
        entries,
      });
    }
  }

  // We sort the API entries alphabetically by name to ensure a stable order in the manifest.
  manifest.forEach((entry) => {
    entry.entries.sort((entry1, entry2) => entry1.name.localeCompare(entry2.name));
  });

  manifest.sort((entry1, entry2) => {
    // Ensure that labels that start with a `code` tag like `window.ng` are last
    if (entry1.moduleLabel.startsWith('<')) {
      return 1;
    } else if (entry2.moduleLabel.startsWith('<')) {
      return -1;
    }

    return entry1.moduleLabel.localeCompare(entry2.moduleLabel);
  });

  return manifest;
}
