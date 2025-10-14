/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isForwardRef, resolveForwardRef} from '../../di/forward_ref';
import {getComponentDef, getDirectiveDef, getPipeDef, getNgModuleDef} from '../def_getters';
import {stringifyForError} from '../util/stringify_utils';
export function isModuleWithProviders(value) {
  return value.ngModule !== undefined;
}
export function isNgModule(value) {
  return !!getNgModuleDef(value);
}
export function isPipe(value) {
  return !!getPipeDef(value);
}
export function isDirective(value) {
  return !!getDirectiveDef(value);
}
export function isComponent(value) {
  return !!getComponentDef(value);
}
function getDependencyTypeForError(type) {
  if (getComponentDef(type)) return 'component';
  if (getDirectiveDef(type)) return 'directive';
  if (getPipeDef(type)) return 'pipe';
  return 'type';
}
export function verifyStandaloneImport(depType, importingType) {
  if (isForwardRef(depType)) {
    depType = resolveForwardRef(depType);
    if (!depType) {
      throw new Error(
        `Expected forwardRef function, imported from "${stringifyForError(importingType)}", to return a standalone entity or NgModule but got "${stringifyForError(depType) || depType}".`,
      );
    }
  }
  if (getNgModuleDef(depType) == null) {
    const def = getComponentDef(depType) || getDirectiveDef(depType) || getPipeDef(depType);
    if (def != null) {
      // if a component, directive or pipe is imported make sure that it is standalone
      if (!def.standalone) {
        const type = getDependencyTypeForError(depType);
        throw new Error(
          `The "${stringifyForError(depType)}" ${type}, imported from "${stringifyForError(importingType)}", is not standalone. Does the ${type} have the standalone: false flag?`,
        );
      }
    } else {
      // it can be either a module with provider or an unknown (not annotated) type
      if (isModuleWithProviders(depType)) {
        throw new Error(
          `A module with providers was imported from "${stringifyForError(importingType)}". Modules with providers are not supported in standalone components imports.`,
        );
      } else {
        throw new Error(
          `The "${stringifyForError(depType)}" type, imported from "${stringifyForError(importingType)}", must be a standalone component / directive / pipe or an NgModule. Did you forget to add the required @Component / @Directive / @Pipe or @NgModule annotation?`,
        );
      }
    }
  }
}
//# sourceMappingURL=util.js.map
