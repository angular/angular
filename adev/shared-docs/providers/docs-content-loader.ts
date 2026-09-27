/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken, ResourceRef, inject, resource} from '@angular/core';
import {DocContent, DocsContentLoader} from '../interfaces/index';

export const DOCS_CONTENT_LOADER = new InjectionToken<DocsContentLoader>('DOCS_CONTENT_LOADER');

/**
 * Creates a route resource that loads the doc content for the path returned by `contentPath`.
 * The resource stays idle (with an `undefined` value) while `contentPath` returns `undefined`.
 *
 * Must be called in an injection context, e.g. in a route's `resources` function.
 */
export function contentResource(
  contentPath: () => string | undefined,
): ResourceRef<DocContent | undefined> {
  const contentLoader = inject(DOCS_CONTENT_LOADER);
  return resource({
    params: contentPath,
    loader: ({params}) => contentLoader.getContent(params),
  });
}
