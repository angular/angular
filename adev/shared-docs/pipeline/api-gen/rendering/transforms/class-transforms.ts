/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ClassEntry} from '../entities';
import {ClassEntryRenderable} from '../entities/renderables';
import {addRenderableCodeToc} from './code-transforms';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms';
import {addRenderableMembers} from './member-transforms';
import {addModuleName} from './module-name';
import {addRepo} from './repo';

/** Given an unprocessed class entry, get the fully renderable class entry. */
export async function getClassRenderable(
  classEntry: ClassEntry,
  moduleName: string,
  repo: string,
): Promise<ClassEntryRenderable> {
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
