/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Stores the data needed to make a single update to a file. */
export interface Update {
  /** The start index of the location of the update. */
  offset: number;

  /** A function to be used to update the file content. */
  updateFn: (html: string) => string;
}

/** Applies the updates to the given file content in reverse offset order. */
export function writeUpdates(content: string, updates: Update[]): string {
  updates.sort((a, b) => b.offset - a.offset);
  updates.forEach(update => (content = update.updateFn(content)));
  return content;
}
