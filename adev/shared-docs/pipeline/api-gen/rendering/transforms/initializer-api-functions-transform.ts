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

export function getInitializerApiFunctionRenderable(
  entry: InitializerApiFunctionEntry,
  moduleName: string,
): InitializerApiFunctionRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addHtmlJsDocTagComments(
        addHtmlUsageNotes(
          addHtmlDescription(addHtmlAdditionalLinks(addModuleName(entry, moduleName))),
        ),
      ),
    ),
  );
}
