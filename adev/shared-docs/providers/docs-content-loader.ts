/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, inject} from '@angular/core';
import {ResolveFn} from '@angular/router';
import {DocContent, DocsContentLoader} from '../interfaces/index';

export const DOCS_CONTENT_LOADER = new InjectionToken<DocsContentLoader>('DOCS_CONTENT_LOADER');

export function contentResolver(contentPath: string): ResolveFn<DocContent | undefined> {
  return () => inject(DOCS_CONTENT_LOADER).getContent(contentPath);
}
