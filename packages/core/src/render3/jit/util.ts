/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isForwardRef, resolveForwardRef} from '../../di/forward_ref';
import {ModuleWithProviders} from '../../di/interface/provider';
import {Type} from '../../interface/type';
import {NgModuleDef} from '../../metadata/ng_module_def';
import {getComponentDef, getDirectiveDef, getPipeDef, getNgModuleDef} from '../def_getters';
import type {ComponentType, DirectiveType, PipeType} from '../interfaces/definition';
import {stringifyForError} from '../util/stringify_utils';

export function isModuleWithProviders(value: any): value is ModuleWithProviders<{}> {
  return (value as {ngModule?: any}).ngModule !== undefined;
}

export function isNgModule<T>(value: Type<T>): value is Type<T> & {ɵmod: NgModuleDef<T>} {
  return !!getNgModuleDef(value);
}

export function isPipe<T>(value: Type<T>): value is PipeType<T> {
  return !!getPipeDef(value);
}

export function isDirective<T>(value: Type<T>): value is DirectiveType<T> {
  return !!getDirectiveDef(value);
}

export function isComponent<T>(value: Type<T>): value is ComponentType<T> {
  return !!getComponentDef(value);
}

function getDependencyTypeForError(type: Type<any>) {
  if (getComponentDef(type)) return 'component';
  if (getDirectiveDef(type)) return 'directive';
  if (getPipeDef(type)) return 'pipe';
  return 'type';
}

export function verifyStandaloneImport(depType: Type<unknown>, importingType: Type<unknown>) {
  if (isForwardRef(depType)) {
    depType = resolveForwardRef(depType);
    if (!depType) {
      throw new Error(
        `Expected forwardRef function, imported from "${stringifyForError(
          importingType,
        )}", to return a standalone entity or NgModule but got "${
          stringifyForError(depType) || depType
        }".`,
      );
    }
  }

  if (getNgModuleDef(depType) == null) {
    const def = getComponentDef(depType) || getDirectiveDef(depType) || getPipeDef(depType);
    if (def != null) {
      // if a component, directive or pipe is imported make sure that it is standalone
      if (!def.standalone) {
        throw new Error(
          `The "${stringifyForError(depType)}" ${getDependencyTypeForError(
            depType,
          )}, imported from "${stringifyForError(
            importingType,
          )}", is not standalone. Did you forget to add the standalone: true flag?`,
        );
      }
    } else {
      // it can be either a module with provider or an unknown (not annotated) type
      if (isModuleWithProviders(depType)) {
        throw new Error(
          `A module with providers was imported from "${stringifyForError(
            importingType,
          )}". Modules with providers are not supported in standalone components imports.`,
        );
      } else {
        throw new Error(
          `The "${stringifyForError(depType)}" type, imported from "${stringifyForError(
            importingType,
          )}", must be a standalone component / directive / pipe or an NgModule. Did you forget to add the required @Component / @Directive / @Pipe or @NgModule annotation?`,
        );
      }
    }
  }
}
