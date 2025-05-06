/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnumEntry} from '../entities.mjs';
import {EnumEntryRenderable} from '../entities/renderables.mjs';
import {addRenderableCodeToc} from './code-transforms.mjs';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.mjs';
import {addRenderableMembers} from './member-transforms.mjs';
import {addModuleName} from './module-name.mjs';
import {addRepo} from './repo.mjs';

/** Given an unprocessed enum entry, get the fully renderable enum entry. */
export async function getEnumRenderable(
  classEntry: EnumEntry,
  moduleName: string,
  repo: string,
): Promise<EnumEntryRenderable> {
  return setEntryFlags(
    await addRenderableCodeToc(
      addRenderableMembers(
        addHtmlAdditionalLinks(
          addHtmlUsageNotes(
            addHtmlJsDocTagComments(
              addHtmlDescription(addRepo(addModuleName(classEntry, moduleName), repo)),
            ),
          ),
        ),
      ),
    ),
  );
}
