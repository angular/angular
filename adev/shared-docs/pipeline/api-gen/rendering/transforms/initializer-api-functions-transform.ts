/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InitializerApiFunctionEntry} from '../entities';

import {InitializerApiFunctionRenderable} from '../entities/renderables';

import {addRenderableCodeToc} from './code-transforms';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms';
import {addModuleName} from './module-name';
import {addRepo} from './repo';

export function getInitializerApiFunctionRenderable(
  entry: InitializerApiFunctionEntry,
  moduleName: string,
  repo: string,
): InitializerApiFunctionRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
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
