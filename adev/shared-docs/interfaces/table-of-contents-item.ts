/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export enum TableOfContentsLevel {
  H2 = 'h2',
  H3 = 'h3',
}

/** Represents a table of content item. */
export interface TableOfContentsItem {
  /** The url fragment of specific section */
  id: string;
  /** The level of the item. */
  level: TableOfContentsLevel;
  /** The unique title for this document page. */
  title: string;
}
