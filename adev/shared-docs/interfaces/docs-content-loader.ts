/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocContent} from './doc-content';

/** The service responsible for fetching static content for docs pages */
export interface DocsContentLoader {
  getContent(path: string): Promise<DocContent>;
}
