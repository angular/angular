/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from '../entities.mjs';
import {BlockEntryRenderable} from '../entities/renderables.mjs';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.mjs';
import {addModuleName} from './module-name.mjs';
import {addRepo} from './repo.mjs';

/** Given an unprocessed block entry, get the fully renderable block entry. */
export function getBlockRenderable(
  blockEntry: DocEntry,
  moduleName: string,
  repo: string,
): BlockEntryRenderable {
  return setEntryFlags(
    addHtmlAdditionalLinks(
      addHtmlDescription(
        addHtmlUsageNotes(
          addHtmlJsDocTagComments(addRepo(addModuleName(blockEntry, moduleName), repo)),
        ),
      ),
    ),
  );
}
