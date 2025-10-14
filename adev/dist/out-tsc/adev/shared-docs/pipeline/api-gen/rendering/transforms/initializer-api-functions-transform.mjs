/**
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
export async function getInitializerApiFunctionRenderable(entry, moduleName, repo) {
  return setEntryFlags(
    await addRenderableCodeToc(
      addHtmlJsDocTagComments(
        addHtmlUsageNotes(
          addHtmlDescription(
            addHtmlAdditionalLinks(addRepo(addModuleName(entry, moduleName), repo)),
          ),
        ),
      ),
    ),
  );
}
//# sourceMappingURL=initializer-api-functions-transform.mjs.map
