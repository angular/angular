/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {addHtmlDescription} from './jsdoc-transforms.mjs';
import {addModuleName} from './module-name.mjs';
export function addRenderableFunctionParams(entry) {
  const params = entry.params.map((param) =>
    addHtmlDescription(addModuleName(param, entry.moduleName)),
  );
  return {
    ...entry,
    params,
  };
}
//# sourceMappingURL=params-transforms.mjs.map
