/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables';
import {HeaderApi} from './header-api';
import {TabDescription} from './tab-description';

/** Component to render a block or element API reference document. */
export function DocsReference(entry: DocEntryRenderable) {
  return (
    <div class="api">
      <HeaderApi entry={entry} />
      <TabDescription entry={entry} />
    </div>
  );
}
