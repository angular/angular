/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnumEntry} from '../entities';
import {EnumEntryRenderable} from '../entities/renderables';
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

/** Given an unprocessed enum entry, get the fully renderable enum entry. */
export function getEnumRenderable(classEntry: EnumEntry, moduleName: string): EnumEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addRenderableMembers(
        addHtmlAdditionalLinks(
          addHtmlUsageNotes(
            addHtmlJsDocTagComments(addHtmlDescription(addModuleName(classEntry, moduleName))),
          ),
        ),
      ),
    ),
  );
}
