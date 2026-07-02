/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {DocEntryRenderable} from '../entities/renderables.mjs';
import {HeaderApi} from './header-api';
import {SectionDescription} from './section-description';
import {API_REFERENCE_CONTAINER} from '../styling/css-classes.mjs';

/** Component to render a block or element API reference document. */
export function DocsReference(entry: DocEntryRenderable) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} />
      <SectionDescription entry={entry} />
    </div>
  );
}
