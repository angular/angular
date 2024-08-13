/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FunctionEntry, isFunctionEntryWithOverloads} from '../entities';
import {FunctionEntryRenderable} from '../entities/renderables';
import {HasRenderableOverloads} from '../entities/traits';
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
      addRenderableFunctionParams(
        addOverloads(
          moduleName,
          addHtmlAdditionalLinks(
            addHtmlUsageNotes(
              setEntryFlags(
                addHtmlJsDocTagComments(addHtmlDescription(addModuleName(entry, moduleName))),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

function addOverloads<T extends FunctionEntry>(
  moduleName: string,
  entry: T,
): T & HasRenderableOverloads {
  return {
    ...entry,
    overloads:
      isFunctionEntryWithOverloads(entry) && entry.overloads
        ? entry.overloads.map((overload) => getFunctionRenderable(overload, moduleName))
        : null,
  };
}
