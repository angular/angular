/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ConstantEntry} from '../entities.mjs';
import {ConstantEntryRenderable} from '../entities/renderables.mjs';
import {addRenderableCodeToc} from './code-transforms.mjs';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.mjs';
import {addModuleName} from './module-name.mjs';
import {addRepo} from './repo.mjs';

/** Given an unprocessed constant entry, get the fully renderable constant entry. */
export async function getConstantRenderable(
  classEntry: ConstantEntry,
  moduleName: string,
  repo: string,
): Promise<ConstantEntryRenderable> {
  return setEntryFlags(
    await addRenderableCodeToc(
      addHtmlAdditionalLinks(
        addHtmlUsageNotes(
          addHtmlJsDocTagComments(
            addHtmlDescription(addRepo(addModuleName(classEntry, moduleName), repo)),
          ),
        ),
      ),
    ),
  );
}
