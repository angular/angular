/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../../type';
import {fillProperties} from '../../util/property';
import {EMPTY, EMPTY_ARRAY} from '../definition';
import {ComponentDef, ComponentTemplate, DirectiveDef, DirectiveDefFeature, RenderFlags} from '../interfaces/definition';



/**
 * Determines if a definition is a {@link ComponentDef} or a {@link DirectiveDef}
 * @param definition The definition to examine
 */
function isComponentDef<T>(definition: ComponentDef<T>| DirectiveDef<T>):
    definition is ComponentDef<T> {
  const def = definition as ComponentDef<T>;
  return typeof def.template === 'function';
}

function getSuperType(type: Type<any>): Type<any>&
    {ngComponentDef?: ComponentDef<any>, ngDirectiveDef?: DirectiveDef<any>} {
  return Object.getPrototypeOf(type.prototype).constructor;
}

/**
 * Merges the definition from a super class to a sub class.
 * @param definition The definition that is a SubClass of another directive of component
 */
export function InheritDefinitionFeature(definition: DirectiveDef<any>| ComponentDef<any>): void {
  let superType = getSuperType(definition.type);

  while (superType) {
    let superDef: DirectiveDef<any>|ComponentDef<any>|undefined = undefined;
    if (isComponentDef(definition)) {
      // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
      superDef = superType.ngComponentDef || superType.ngDirectiveDef;
    } else {
      if (superType.ngComponentDef) {
        throw new Error('Directives cannot inherit Components');
      }
      // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
      superDef = superType.ngDirectiveDef;
    }

    const baseDef = (superType as any).ngBaseDef;

    // Some fields in the definition may be empty, if there were no values to put in them that
    // would've justified object creation. Unwrap them if necessary.
    if (baseDef || superDef) {
      const writeableDef = definition as any;
      writeableDef.inputs = maybeUnwrapEmpty(definition.inputs);
      writeableDef.declaredInputs = maybeUnwrapEmpty(definition.declaredInputs);
      writeableDef.outputs = maybeUnwrapEmpty(definition.outputs);
    }

    if (baseDef) {
      // Merge inputs and outputs
      fillProperties(definition.inputs, baseDef.inputs);
      fillProperties(definition.declaredInputs, baseDef.declaredInputs);
      fillProperties(definition.outputs, baseDef.outputs);
    }

    if (superDef) {
      // Merge hostBindings
      const prevHostBindings = definition.hostBindings;
      const superHostBindings = superDef.hostBindings;
      if (superHostBindings) {
        if (prevHostBindings) {
          definition.hostBindings = (directiveIndex: number, elementIndex: number) => {
            superHostBindings(directiveIndex, elementIndex);
            prevHostBindings(directiveIndex, elementIndex);
          };
          (definition as any).hostVars += superDef.hostVars;
        } else {
          definition.hostBindings = superHostBindings;
        }
      }

      // Merge View Queries
      if (isComponentDef(definition) && isComponentDef(superDef)) {
        const prevViewQuery = definition.viewQuery;
        const superViewQuery = superDef.viewQuery;
        if (superViewQuery) {
          if (prevViewQuery) {
            definition.viewQuery = <T>(rf: RenderFlags, ctx: T): void => {
              superViewQuery(rf, ctx);
              prevViewQuery(rf, ctx);
            };
          } else {
            definition.viewQuery = superViewQuery;
          }
        }
      }

      // Merge Content Queries
      const prevContentQueries = definition.contentQueries;
      const superContentQueries = superDef.contentQueries;
      if (superContentQueries) {
        if (prevContentQueries) {
          definition.contentQueries = (dirIndex: number) => {
            superContentQueries(dirIndex);
            prevContentQueries(dirIndex);
          };
        } else {
          definition.contentQueries = superContentQueries;
        }
      }

      // Merge Content Queries Refresh
      const prevContentQueriesRefresh = definition.contentQueriesRefresh;
      const superContentQueriesRefresh = superDef.contentQueriesRefresh;
      if (superContentQueriesRefresh) {
        if (prevContentQueriesRefresh) {
          definition.contentQueriesRefresh = (directiveIndex: number, queryIndex: number) => {
            superContentQueriesRefresh(directiveIndex, queryIndex);
            prevContentQueriesRefresh(directiveIndex, queryIndex);
          };
        } else {
          definition.contentQueriesRefresh = superContentQueriesRefresh;
        }
      }


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
        for (const feature of features) {
          if (feature && feature.ngInherit) {
            (feature as DirectiveDefFeature)(definition);
          }
        }
      }

      break;
    } else {
      // Even if we don't have a definition, check the type for the hooks and use those if need be
      const superPrototype = superType.prototype;

      if (superPrototype) {
        definition.afterContentChecked =
            definition.afterContentChecked || superPrototype.afterContentChecked;
        definition.afterContentInit =
            definition.afterContentInit || superPrototype.afterContentInit;
        definition.afterViewChecked =
            definition.afterViewChecked || superPrototype.afterViewChecked;
        definition.afterViewInit = definition.afterViewInit || superPrototype.afterViewInit;
        definition.doCheck = definition.doCheck || superPrototype.doCheck;
        definition.onDestroy = definition.onDestroy || superPrototype.onDestroy;
        definition.onInit = definition.onInit || superPrototype.onInit;
      }
    }

    superType = Object.getPrototypeOf(superType);
  }
}

function maybeUnwrapEmpty<T>(value: T[]): T[];
function maybeUnwrapEmpty<T>(value: T): T;
function maybeUnwrapEmpty(value: any): any {
  if (value === EMPTY) {
    return {};
  } else if (value === EMPTY_ARRAY) {
    return [];
  } else {
    return value;
  }
}
