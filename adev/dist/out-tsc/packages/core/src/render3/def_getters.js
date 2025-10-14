/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../errors';
import {stringify} from '../util/stringify';
import {NG_COMP_DEF, NG_DIR_DEF, NG_MOD_DEF, NG_PIPE_DEF} from './fields';
export function getNgModuleDef(type) {
  return type[NG_MOD_DEF] || null;
}
export function getNgModuleDefOrThrow(type) {
  const ngModuleDef = getNgModuleDef(type);
  if (!ngModuleDef) {
    throw new RuntimeError(
      915 /* RuntimeErrorCode.MISSING_NG_MODULE_DEFINITION */,
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
        `Type ${stringify(type)} does not have 'ɵmod' property.`,
    );
  }
  return ngModuleDef;
}
/**
 * The following getter methods retrieve the definition from the type. Currently the retrieval
 * honors inheritance, but in the future we may change the rule to require that definitions are
 * explicit. This would require some sort of migration strategy.
 */
export function getComponentDef(type) {
  return type[NG_COMP_DEF] || null;
}
export function getDirectiveDefOrThrow(type) {
  const def = getDirectiveDef(type);
  if (!def) {
    throw new RuntimeError(
      916 /* RuntimeErrorCode.MISSING_DIRECTIVE_DEFINITION */,
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
        `Type ${stringify(type)} does not have 'ɵdir' property.`,
    );
  }
  return def;
}
export function getDirectiveDef(type) {
  return type[NG_DIR_DEF] || null;
}
export function getPipeDef(type) {
  return type[NG_PIPE_DEF] || null;
}
/**
 * Checks whether a given Component, Directive or Pipe is marked as standalone.
 * This will return false if passed anything other than a Component, Directive, or Pipe class
 * See [this guide](guide/components/importing) for additional information:
 *
 * @param type A reference to a Component, Directive or Pipe.
 * @publicApi
 */
export function isStandalone(type) {
  const def = getComponentDef(type) || getDirectiveDef(type) || getPipeDef(type);
  return def !== null && def.standalone;
}
//# sourceMappingURL=def_getters.js.map
