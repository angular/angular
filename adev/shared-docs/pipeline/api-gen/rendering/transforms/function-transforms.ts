/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FunctionEntry, FunctionSignatureMetadata} from '../entities';
import {
  FunctionEntryRenderable,
  FunctionSignatureMetadataRenderable,
} from '../entities/renderables';
import {addRenderableCodeToc} from './code-transforms';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms';
import {addModuleName} from './module-name';
import {addRenderableFunctionParams} from './params-transforms';

/** Given an unprocessed function entry, get the fully renderable function entry. */
export function getFunctionRenderable(
  entry: FunctionEntry,
  moduleName: string,
): FunctionEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addHtmlAdditionalLinks(
        addHtmlUsageNotes(
          setEntryFlags(
            addHtmlJsDocTagComments(addHtmlDescription(addModuleName(entry, moduleName))),
          ),
        ),
      ),
    ),
  );
}

export function getFunctionMetadataRenderable(
  entry: FunctionSignatureMetadata,
  moduleName: string = '',
): FunctionSignatureMetadataRenderable {
  return addHtmlAdditionalLinks(
    addRenderableFunctionParams(
      addHtmlUsageNotes(
        setEntryFlags(
          addHtmlJsDocTagComments(addHtmlDescription(addModuleName(entry, moduleName))),
        ),
      ),
    ),
  );
}
