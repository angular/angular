/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/* The interface represents Algolia search result item. */
export interface SearchResult {
  /* The url link to the search result page */
  url: string;
  /* The hierarchy of the item */
  hierarchy: Hierarchy;
  /* The unique id of the search result item */
  objectID: string;
  /** Where the match ocurred. ie lvl0, lvl1, content, etc */
  type: string;
  /** Documentation content (not headers) */
  content: string | null;
  /** Snippets of the matched text */
  _snippetResult: {
    hierarchy?: {
      lvl0?: {value: string};
      lvl1?: {value: string};
      lvl2?: {value: string};
      lvl3?: {value: string};
      lvl4?: {value: string};
    };
    content?: {value: string};
  };
}

/* The hierarchy of the item */
export interface Hierarchy {
  /* It's kind of the page i.e `Docs`, `Tutorials`, `Reference` etc. */
  lvl0: string | null;
  /* Typicaly it's the content of H1 of the page */
  lvl1: string | null;
  /* Typicaly it's the content of H2 of the page */
  lvl2: string | null;
  lvl3: string | null;
  lvl4: string | null;
  lvl5: string | null;
  lvl6: string | null;
}
