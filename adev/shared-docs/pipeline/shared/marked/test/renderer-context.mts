/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initHighlighter} from '../../shiki.mjs';
import {RendererContext} from '../renderer.mjs';

/**
 * Shared renderer context that can be used in tests.
 * By default we don't set a highlighter because it is async to initialize.
 *
 * Use the separate async function `setHighlighter` to initialize the highlighter
 */
export const rendererContext: RendererContext = {
  markdownFilePath: '',
  highlighter: null!,
  apiEntries: {
    CommonModule: {moduleName: 'angular/common'},
    bootstrapApplication: {moduleName: 'angular/platform-browser'},
    ApplicationRef: {moduleName: 'angular/core'},
    Router: {moduleName: 'angular/router'},
  },
  headerIds: new Map<string, number>(),
};

export async function setHighlighter() {
  rendererContext.highlighter = await initHighlighter();
}
