/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BundlePrivateEntry} from './bundler';

const INDEX_HEADER = `/**
 * Generated bundle index. Do not edit.
 */
`;

type MapEntry = [string, BundlePrivateEntry[]];

export function privateEntriesToIndex(index: string, privates: BundlePrivateEntry[]): string {
  const results: string[] = [INDEX_HEADER];

  // Export all of the index symbols.
  results.push(`export * from '${index}';`, '');

  // Simplify the exports
  const exports = new Map<string, BundlePrivateEntry[]>();

  for (const entry of privates) {
    let entries = exports.get(entry.module);
    if (!entries) {
      entries = [];
      exports.set(entry.module, entries);
    }
    entries.push(entry);
  }


  const compareEntries = compare((e: BundlePrivateEntry) => e.name);
  const compareModules = compare((e: MapEntry) => e[0]);
  const orderedExports =
      Array.from(exports)
          .map(([module, entries]) => <MapEntry>[module, entries.sort(compareEntries)])
          .sort(compareModules);

  for (const [module, entries] of orderedExports) {
    let symbols = entries.map(e => `${e.name} as ${e.privateName}`);
    results.push(`export {${symbols}} from '${module}';`);
  }

  return results.join('\n');
}

function compare<E, T>(select: (e: E) => T): (a: E, b: E) => number {
  return (a, b) => {
    const ak = select(a);
    const bk = select(b);
    return ak > bk ? 1 : ak < bk ? -1 : 0;
  };
}
