/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Splits an element name into its namespace and local name.
 *
 * @param elementName The element name to split, in the format ":namespace:name".
 * @param fatal If true, throws an error if the element name is not in the correct format.
 * @returns A tuple containing the namespace and local name.
 */
export function splitNsName(elementName: string, fatal: boolean = true): [string | null, string] {
  if (elementName[0] != ':') {
    return [null, elementName];
  }

  const colonIndex = elementName.indexOf(':', 1);

  if (colonIndex === -1) {
    if (fatal) {
      throw new Error(`Unsupported format "${elementName}" expecting ":namespace:name"`);
    } else {
      return [null, elementName];
    }
  }

  return [elementName.slice(1, colonIndex), elementName.slice(colonIndex + 1)];
}
