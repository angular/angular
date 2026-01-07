/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import type {DocEntry, EntryCollection, FunctionEntry, JsDocTagEntry} from '@angular/compiler-cli';
import {Manifest, ManifestEntry, PackageSubEntry} from './interface';

/**
 * @returns the JsDocTagEntry for the given tag name
 */
function getTag(entry: DocEntry | FunctionEntry, tag: string, every = false) {
  const hasTagName = (t: JsDocTagEntry) => t.name === tag;

  if (every && 'signatures' in entry && entry.signatures.length > 1) {
    // For overloads we need to check all signatures.
    return entry.signatures.every((s) => s.jsdocTags.some(hasTagName))
      ? entry.signatures[0].jsdocTags.find(hasTagName)
      : undefined;
  }

  const jsdocTags = [
    ...entry.jsdocTags,
    ...((entry as FunctionEntry).signatures?.flatMap((s) => s.jsdocTags) ?? []),
    ...((entry as FunctionEntry).implementation?.jsdocTags ?? []),
  ];

  return jsdocTags.find(hasTagName);
}

/** Gets whether the given entry is hidden. */
export function isHiddenEntry<T extends DocEntry | FunctionEntry>(entry: T): boolean {
  return getTag(entry, 'docs-private', /* every */ true) ? true : false;
}

function getTagSinceVersion(
  entry: DocEntry,
  tagName: string,
  every = false,
): {version: string | undefined} | undefined {
  const tag = getTag(entry, tagName, every);
  if (!tag) {
    return undefined;
  }

  // In case of deprecated tag we need to separate the version from the deprecation message.
  const version = tag.comment.match(/\d+(\.\d+)?/)?.[0];

  return {version};
}

/**
 * Generates an API manifest for a set of API collections extracted by
 * extract_api_to_json.
 */
export function generateManifest(apiCollections: EntryCollection[]): Manifest {
  const packageSubEntries: PackageSubEntry[] = [];
  for (const collection of apiCollections) {
    const entries = collection.entries
      .filter((entry) => !isHiddenEntry(entry))
      .map(
        (entry: DocEntry): ManifestEntry => ({
          name: entry.name,
          ...(entry.aliases && {aliases: entry.aliases}),
          type: entry.entryType,
          deprecated: getTagSinceVersion(entry, 'deprecated', true),
          developerPreview: getTagSinceVersion(entry, 'developerPreview'),
          experimental: getTagSinceVersion(entry, 'experimental'),
          stable: getTagSinceVersion(entry, 'publicApi'),
          category: getTag(entry, 'category')?.comment.trim(),
        }),
      );

    const existingEntry = packageSubEntries.find(
      (entry) => entry.moduleName === collection.moduleName,
    );
    if (existingEntry) {
      existingEntry.entries.push(...entries);
    } else {
      packageSubEntries.push({
        moduleName: collection.moduleName,
        normalizedModuleName: collection.normalizedModuleName,
        moduleLabel: collection.moduleLabel ?? collection.moduleName,
        entries,
      });
    }
  }

  // We sort the API entries alphabetically by name to ensure a stable order in the manifest.
  packageSubEntries.forEach((entry) => {
    entry.entries.sort((entry1, entry2) => entry1.name.localeCompare(entry2.name));
  });

  packageSubEntries.sort((entry1, entry2) => {
    // Ensure that labels that start with a `code` tag like `window.ng` are last
    if (entry1.moduleLabel.startsWith('<')) {
      return 1;
    } else if (entry2.moduleLabel.startsWith('<')) {
      return -1;
    }

    return entry1.moduleLabel.localeCompare(entry2.moduleLabel);
  });

  const manifest: Manifest = {};
  for (const entry of packageSubEntries) {
    const packageName = getRootPackageName(entry.moduleName);
    if (!manifest[packageName]) {
      manifest[packageName] = [];
    }
    manifest[packageName].push(entry);
  }

  return manifest;
}

function getRootPackageName(moduleName: string): string {
  return moduleName.match(/(@angular\/[\w-]+)/)?.[1] ?? moduleName;
}
