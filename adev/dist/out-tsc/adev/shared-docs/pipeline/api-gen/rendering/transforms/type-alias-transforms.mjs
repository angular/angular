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
/** Given an unprocessed type alias entry, get the fully renderable type alias entry. */
export async function getTypeAliasRenderable(typeAliasEntry, moduleName, repo) {
  return setEntryFlags(
    await addRenderableCodeToc(
      addHtmlAdditionalLinks(
        addHtmlUsageNotes(
          addHtmlJsDocTagComments(
            addHtmlDescription(addRepo(addModuleName(typeAliasEntry, moduleName), repo)),
          ),
        ),
      ),
    ),
  );
}
//# sourceMappingURL=type-alias-transforms.mjs.map
