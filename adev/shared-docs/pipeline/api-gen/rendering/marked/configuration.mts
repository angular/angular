/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {marked} from 'marked';
import {renderer} from './renderer.mjs';

/** Globally configures marked for rendering JsDoc content to HTML. */
export function configureMarkedGlobally() {
  marked.use({
    renderer,
  });
}
