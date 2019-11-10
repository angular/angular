/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../interface/type';
import {fillProperties} from '../../util/property';
import {EMPTY_ARRAY, EMPTY_OBJ} from '../empty';
import {ComponentDef, ContentQueriesFunction, DirectiveDef, DirectiveDefFeature, HostBindingsFunction, RenderFlags, ViewQueriesFunction} from '../interfaces/definition';
import {isComponentDef} from '../interfaces/type_checks';

export function getSuperType(type: Type<any>): Type<any>&
    {ɵcmp?: ComponentDef<any>, ɵdir?: DirectiveDef<any>} {
  return Object.getPrototypeOf(type.prototype).constructor;
}

/**
 * Merges the definition from a super class to a sub class.
 * @param definition The definition that is a SubClass of another directive of component
 *
 * @codeGenApi
 */
export function ɵɵInheritDefinitionFeature(definition: DirectiveDef<any>| ComponentDef<any>): void {
  let superType = getSuperType(definition.type);

  while (superType) {
    let superDef: DirectiveDef<any>|ComponentDef<any>|undefined = undefined;
    if (isComponentDef(definition)) {
      // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
      superDef = superType.ɵcmp || superType.ɵdir;
    } else {
      if (superType.ɵcmp) {
        throw new Error('Directives cannot inherit Components');
      }
      // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
      superDef = superType.ɵdir;
    }

    if (superDef) {
      // Some fields in the definition may be empty, if there were no values to put in them that
      // would've justified object creation. Unwrap them if necessary.
      const writeableDef = definition as any;
      writeableDef.inputs = maybeUnwrapEmpty(definition.inputs);
      writeableDef.declaredInputs = maybeUnwrapEmpty(definition.declaredInputs);
      writeableDef.outputs = maybeUnwrapEmpty(definition.outputs);

      // Merge hostBindings
      const superHostBindings = superDef.hostBindings;
      superHostBindings && inheritHostBindings(definition, superHostBindings);

      // Merge queries
      const superViewQuery = superDef.viewQuery;
      const superContentQueries = superDef.contentQueries;
      superViewQuery && inheritViewQuery(definition, superViewQuery);
      superContentQueries && inheritContentQueries(definition, superContentQueries);

      // Merge inputs and outputs
      fillProperties(definition.inputs, superDef.inputs);
      fillProperties(definition.declaredInputs, superDef.declaredInputs);
      fillProperties(definition.outputs, superDef.outputs);

      // Inherit hooks
      // Assume super class inheritance feature has already run.
      definition.afterContentChecked =
          definition.afterContentChecked || superDef.afterContentChecked;
      definition.afterContentInit = definition.afterContentInit || superDef.afterContentInit;
      definition.afterViewChecked = definition.afterViewChecked || superDef.afterViewChecked;
      definition.afterViewInit = definition.afterViewInit || superDef.afterViewInit;
      definition.doCheck = definition.doCheck || superDef.doCheck;
      definition.onDestroy = definition.onDestroy || superDef.onDestroy;
      definition.onInit = definition.onInit || superDef.onInit;

      // Run parent features
      const features = superDef.features;
      if (features) {
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          if (feature && feature.ngInherit) {
            (feature as DirectiveDefFeature)(definition);
          }
        }
      }
    }

    superType = Object.getPrototypeOf(superType);
  }
}

function maybeUnwrapEmpty<T>(value: T[]): T[];
function maybeUnwrapEmpty<T>(value: T): T;
function maybeUnwrapEmpty(value: any): any {
  if (value === EMPTY_OBJ) {
    return {};
  } else if (value === EMPTY_ARRAY) {
    return [];
  } else {
    return value;
  }
}

function inheritViewQuery(
    definition: DirectiveDef<any>| ComponentDef<any>, superViewQuery: ViewQueriesFunction<any>) {
  const prevViewQuery = definition.viewQuery;

  if (prevViewQuery) {
    definition.viewQuery = (rf, ctx) => {
      superViewQuery(rf, ctx);
      prevViewQuery(rf, ctx);
    };
  } else {
    definition.viewQuery = superViewQuery;
  }
}

function inheritContentQueries(
    definition: DirectiveDef<any>| ComponentDef<any>,
    superContentQueries: ContentQueriesFunction<any>) {
  const prevContentQueries = definition.contentQueries;

  if (prevContentQueries) {
    definition.contentQueries = (rf, ctx, directiveIndex) => {
      superContentQueries(rf, ctx, directiveIndex);
      prevContentQueries(rf, ctx, directiveIndex);
    };
  } else {
    definition.contentQueries = superContentQueries;
  }
}

function inheritHostBindings(
    definition: DirectiveDef<any>| ComponentDef<any>,
    superHostBindings: HostBindingsFunction<any>) {
  const prevHostBindings = definition.hostBindings;
  // If the subclass does not have a host bindings function, we set the subclass host binding
  // function to be the superclass's (in this feature). We should check if they're the same here
  // to ensure we don't inherit it twice.
  if (superHostBindings !== prevHostBindings) {
    if (prevHostBindings) {
      definition.hostBindings = (rf: RenderFlags, ctx: any, elementIndex: number) => {
        superHostBindings(rf, ctx, elementIndex);
        prevHostBindings(rf, ctx, elementIndex);
      };
    } else {
      definition.hostBindings = superHostBindings;
    }
  }
}
