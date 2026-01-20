/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FunctionEntry, FunctionSignatureMetadata} from '../entities.mjs';
import {
  FunctionEntryRenderable,
  FunctionSignatureMetadataRenderable,
} from '../entities/renderables.mjs';
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
export async function getFunctionRenderable(
  entry: FunctionEntry,
  moduleName: string,
  repo: string,
): Promise<FunctionEntryRenderable> {
  const a = setEntryFlags(
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
  if (entry.name === 'withExperimentalPlatformNavigation') {
    console.warn('**************', a);
  }

  return a;
}

export function getFunctionMetadataRenderable(
  entry: FunctionSignatureMetadata,
  moduleName: string,
  repo: string,
): FunctionSignatureMetadataRenderable {
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
