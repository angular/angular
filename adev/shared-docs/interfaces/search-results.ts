/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface SnippetResult {
  value: string;
  matchLevel: 'none' | 'full' | string;
}

/* The interface represents Algolia search result item. */
export interface SearchResult {
  /* The url link to the search result page */
  url: string;
  /* The hierarchy of the item */
  hierarchy: Hierarchy;
  /* The unique id of the search result item */
  objectID: string;
  /**
   * The type of the result. A content result will have
   * matched the content. A result of type 'lvl#' may have i
   * matched a lvl above it. For example, a type 'lvl3' may be
   * included in results because its 'lvl2' header matched the query.
   */
  type: string;
  /** Documentation content (not headers) */
  content: string | null;
  /** Snippets of the matched text */
  _snippetResult: {
    hierarchy?: {
      lvl0?: SnippetResult;
      lvl1?: SnippetResult;
      lvl2?: SnippetResult;
      lvl3?: SnippetResult;
      lvl4?: SnippetResult;
    };
    content?: SnippetResult;
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

/** Parsed & Structured search results */
export interface SearchResultItem {
  type: 'doc' | 'code';
  labelHtml: string | null;
  subLabelHtml: string | null;
  url: string;

  id: string;
  category: string | null;
}
