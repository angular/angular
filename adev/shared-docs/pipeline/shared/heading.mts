/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Extracts the ID from a heading text.
 * Supports custom ID syntax: `## My Heading {#custom-id}`
 */
export function getIdFromHeading(heading: string): string {
  // extract the extended markdown heading id
  // ex:  ## MyHeading {# myId}
  // This is recommended in case we end up having duplicate Ids but we still want the same heading text.
  // We don't want to make Id generation stateful/too complex to handle duplicates automatically.
  const customIdRegex = /{#\s*([\w-]+)\s*}/g;
  const customId = customIdRegex.exec(heading)?.[1];

  if (customId) {
    return customId;
  }

  return heading
    .toLowerCase()
    .replace(/\s|\//g, '-') // replace spaces and slashes with dashes
    .replace(/[^\p{L}\d\-]/gu, ''); // only keep letters, digits & dashes
}
