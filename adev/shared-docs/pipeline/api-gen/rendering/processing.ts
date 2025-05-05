/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DocEntry} from './entities';

import {CliCommand} from './cli-entities';
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
import {getCliRenderable} from './transforms/cli-transforms';
import {getConstantRenderable} from './transforms/constant-transforms';
import {getDecoratorRenderable} from './transforms/decorator-transforms';
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
import {addRepo} from './transforms/repo';
import {getTypeAliasRenderable} from './transforms/type-alias-transforms';

export function getRenderable(
  entry: DocEntry | CliCommand,
  moduleName: string,
  repo: string,
): DocEntryRenderable | CliCommandRenderable {
  if (isCliEntry(entry)) {
    return getCliRenderable(entry);
  }

  if (isClassEntry(entry)) {
    return getClassRenderable(entry, moduleName, repo);
  }
  if (isDecoratorEntry(entry)) {
    return getDecoratorRenderable(entry, moduleName, repo);
  }
  if (isConstantEntry(entry)) {
    return getConstantRenderable(entry, moduleName, repo);
  }
  if (isEnumEntry(entry)) {
    return getEnumRenderable(entry, moduleName, repo);
  }
  if (isInterfaceEntry(entry)) {
    return getInterfaceRenderable(entry, moduleName, repo);
  }
  if (isFunctionEntry(entry)) {
    return getFunctionRenderable(entry, moduleName, repo);
  }
  if (isTypeAliasEntry(entry)) {
    return getTypeAliasRenderable(entry, moduleName, repo);
  }
  if (isInitializerApiFunctionEntry(entry)) {
    return getInitializerApiFunctionRenderable(entry, moduleName, repo);
  }

  // Fallback to an uncategorized renderable.
  return setEntryFlags(
    addHtmlAdditionalLinks(
      addHtmlDescription(
        addHtmlUsageNotes(addHtmlJsDocTagComments(addRepo(addModuleName(entry, moduleName), repo))),
      ),
    ),
  );
}
