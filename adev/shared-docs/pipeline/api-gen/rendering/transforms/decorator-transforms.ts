/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DecoratorEntry} from '../entities';
import {DecoratorEntryRenderable} from '../entities/renderables';
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
export function getDecoratorRenderable(
  classEntry: DecoratorEntry,
  moduleName: string,
  repo: string,
): DecoratorEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
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
  ) as DecoratorEntryRenderable;
}
