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
import {addRenderableFunctionParams} from './params-transforms.mjs';
import {addRepo} from './repo.mjs';
/** Given an unprocessed function entry, get the fully renderable function entry. */
export async function getFunctionRenderable(entry, moduleName, repo) {
  return setEntryFlags(
    await addRenderableCodeToc(
      addHtmlAdditionalLinks(
        addHtmlUsageNotes(
          setEntryFlags(
            addHtmlJsDocTagComments(
              addHtmlDescription(addRepo(addModuleName(entry, moduleName), repo)),
            ),
          ),
        ),
      ),
    ),
  );
}
export function getFunctionMetadataRenderable(entry, moduleName, repo) {
  return addHtmlAdditionalLinks(
    addRenderableFunctionParams(
      addHtmlUsageNotes(
        setEntryFlags(
          addHtmlJsDocTagComments(
            addHtmlDescription(addRepo(addModuleName(entry, moduleName), repo)),
          ),
        ),
      ),
    ),
  );
}
//# sourceMappingURL=function-transforms.mjs.map
