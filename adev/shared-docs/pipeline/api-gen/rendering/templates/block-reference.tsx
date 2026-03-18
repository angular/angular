/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {h} from 'preact';
import {BlockEntryRenderable} from '../entities/renderables.mjs';
import {HeaderApi} from './header-api';
import {RawHtml} from './raw-html';
import {API_REFERENCE_CONTAINER} from '../styling/css-classes.mjs';

/** Component to render a block API reference document. */
export function BlockReference(entry: BlockEntryRenderable) {
  return (
    <div className={API_REFERENCE_CONTAINER}>
      <HeaderApi entry={entry} hideDescription={true} />
      <RawHtml value={entry.htmlDescription} />
    </div>
  );
}
