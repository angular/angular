/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** Represents a documentation page data. */
export interface DocContent {
  /** The unique identifier for this document. */
  id: string;
  /** The HTML to display in the doc viewer. */
  contents: string;
  /** The unique title for this document page. */
  title?: string;
}
