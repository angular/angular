/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HasModuleName, HasParams, HasRenderableParams} from '../entities/traits.mjs';
import {addHtmlDescription, getHtmlForJsDocText} from './jsdoc-transforms.mjs';
import {addModuleName} from './module-name.mjs';

export function addRenderableFunctionParams<T extends HasParams & HasModuleName>(
  entry: T,
): T & HasRenderableParams {
  const params = entry.params.map((param) =>
    addHtmlDescription(addModuleName(param, entry.moduleName)),
  );

  return {
    ...entry,
    params,
  };
}

/** Converts `returnDescription` to `htmlReturnDescription` for rendering. */
export function addHtmlReturnDescription<
  T extends {returnDescription?: string; moduleName: string},
>(entry: T): T & {htmlReturnDescription?: string} {
  const htmlReturnDescription = entry.returnDescription
    ? getHtmlForJsDocText(entry.returnDescription)
    : undefined;
  return {...entry, htmlReturnDescription};
}
