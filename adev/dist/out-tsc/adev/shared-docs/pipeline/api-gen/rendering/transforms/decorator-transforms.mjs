/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
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
/** Given an unprocessed class entry, get the fully renderable class entry. */
export async function getDecoratorRenderable(decoratorEntry, moduleName, repo) {
  return setEntryFlags(
    await addRenderableCodeToc(
      addHtmlAdditionalLinks(
        addHtmlUsageNotes(
          addHtmlJsDocTagComments(
            addHtmlDescription(addRepo(addModuleName(decoratorEntry, moduleName), repo)),
          ),
        ),
      ),
    ),
  );
}
//# sourceMappingURL=decorator-transforms.mjs.map
