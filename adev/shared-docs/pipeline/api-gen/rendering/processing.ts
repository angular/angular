/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from './entities';

import {
  isClassEntry,
  isCliEntry,
  isConstantEntry,
  isDecoratorEntry,
  isEnumEntry,
  isFunctionEntry,
  isInitializerApiFunctionEntry,
  isInterfaceEntry,
  isTypeAliasEntry,
} from './entities/categorization';
import {CliCommandRenderable, DocEntryRenderable} from './entities/renderables';
import {getClassRenderable} from './transforms/class-transforms';
import {getDecoratorRenderable} from './transforms/decorator-transforms';
import {getCliRenderable} from './transforms/cli-transforms';
import {getConstantRenderable} from './transforms/constant-transforms';
import {getEnumRenderable} from './transforms/enum-transforms';
import {getFunctionRenderable} from './transforms/function-transforms';
import {getInitializerApiFunctionRenderable} from './transforms/initializer-api-functions-transform';
import {getInterfaceRenderable} from './transforms/interface-transforms';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './transforms/jsdoc-transforms';
import {addModuleName} from './transforms/module-name';
import {getTypeAliasRenderable} from './transforms/type-alias-transforms';

export function getRenderable(
  entry: DocEntry,
  moduleName: string,
): DocEntryRenderable | CliCommandRenderable {
  if (isClassEntry(entry)) {
    return getClassRenderable(entry, moduleName);
  }
  if (isDecoratorEntry(entry)) {
    return getDecoratorRenderable(entry, moduleName);
  }
  if (isConstantEntry(entry)) {
    return getConstantRenderable(entry, moduleName);
  }
  if (isEnumEntry(entry)) {
    return getEnumRenderable(entry, moduleName);
  }
  if (isInterfaceEntry(entry)) {
    return getInterfaceRenderable(entry, moduleName);
  }
  if (isFunctionEntry(entry)) {
    return getFunctionRenderable(entry, moduleName);
  }
  if (isTypeAliasEntry(entry)) {
    return getTypeAliasRenderable(entry, moduleName);
  }
  if (isInitializerApiFunctionEntry(entry)) {
    return getInitializerApiFunctionRenderable(entry, moduleName);
  }
  if (isCliEntry(entry)) {
    return getCliRenderable(entry);
  }

  // Fallback to an uncategorized renderable.
  return setEntryFlags(
    addHtmlAdditionalLinks(
      addHtmlDescription(
        addHtmlUsageNotes(addHtmlJsDocTagComments(addModuleName(entry, moduleName))),
      ),
    ),
  );
}
