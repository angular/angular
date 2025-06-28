/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {render} from 'preact-render-to-string';

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
} from './entities/categorization.mjs';
import {
  ClassEntryRenderable,
  CliCommandRenderable,
  DocEntryRenderable,
} from './entities/renderables.mjs';
import {ClassReference} from './templates/class-reference';
import {CliCommandReference} from './templates/cli-reference';
import {ConstantReference} from './templates/constant-reference';
import {DocsReference} from './templates/docs-reference';
import {EnumReference} from './templates/enum-reference';
import {FunctionReference} from './templates/function-reference';
import {InitializerApiFunction} from './templates/initializer-api-function';
import {TypeAliasReference} from './templates/type-alias-reference';
import {DecoratorReference} from './templates/decorator-reference';
import {setCurrentSymbol} from './symbol-context.mjs';

/** Given a doc entry, get the transformed version of the entry for rendering. */
export function renderEntry(renderable: DocEntryRenderable | CliCommandRenderable): string {
  setCurrentSymbol(renderable.name);
  if (isCliEntry(renderable)) {
    return render(CliCommandReference(renderable));
  }

  if (isClassEntry(renderable) || isInterfaceEntry(renderable)) {
    return render(ClassReference(renderable as ClassEntryRenderable));
  }
  if (isDecoratorEntry(renderable)) {
    return render(DecoratorReference(renderable));
  }
  if (isConstantEntry(renderable)) {
    return render(ConstantReference(renderable));
  }
  if (isEnumEntry(renderable)) {
    return render(EnumReference(renderable));
  }
  if (isFunctionEntry(renderable)) {
    return render(FunctionReference(renderable));
  }
  if (isTypeAliasEntry(renderable)) {
    return render(TypeAliasReference(renderable));
  }
  if (isInitializerApiFunctionEntry(renderable)) {
    return render(InitializerApiFunction(renderable));
  }

  // Fall back rendering nothing while in development.
  return render(DocsReference(renderable));
}
