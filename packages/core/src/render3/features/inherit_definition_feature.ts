/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {Type, Writable} from '../../interface/type';
import {EMPTY_ARRAY, EMPTY_OBJ} from '../../util/empty';
import {fillProperties} from '../../util/property';
import {ComponentDef, ContentQueriesFunction, DirectiveDef, DirectiveDefFeature, HostBindingsFunction, RenderFlags, ViewQueriesFunction} from '../interfaces/definition';
import {TAttributes} from '../interfaces/node';
import {isComponentDef} from '../interfaces/type_checks';
import {mergeHostAttrs} from '../util/attrs_utils';
import {stringifyForError} from '../util/stringify_utils';

export function getSuperType(type: Type<any>): Type<any>&
    {ɵcmp?: ComponentDef<any>, ɵdir?: DirectiveDef<any>} {
  return Object.getPrototypeOf(type.prototype).constructor;
}

type WritableDef = Writable<DirectiveDef<any>|ComponentDef<any>>;

/**
 * Merges the definition from a super class to a sub class.
 * @param definition The definition that is a SubClass of another directive of component
 *
 * @codeGenApi
 */
export function ɵɵInheritDefinitionFeature(definition: DirectiveDef<any>|ComponentDef<any>): void {
  let superType = getSuperType(definition.type);
  let shouldInheritFields = true;
  const inheritanceChain: WritableDef[] = [definition];

  while (superType) {
    let superDef: DirectiveDef<any>|ComponentDef<any>|undefined = undefined;
    if (isComponentDef(definition)) {
      // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
      superDef = superType.ɵcmp || superType.ɵdir;
    } else {
      if (superType.ɵcmp) {
        throw new RuntimeError(
            RuntimeErrorCode.INVALID_INHERITANCE,
            ngDevMode &&
                `Directives cannot inherit Components. Directive ${
                    stringifyForError(definition.type)} is attempting to extend component ${
                    stringifyForError(superType)}`);
      }
      // Don't use getComponentDef/getDirectiveDef. This logic relies on inheritance.
      superDef = superType.ɵdir;
    }

    if (superDef) {
      if (shouldInheritFields) {
        inheritanceChain.push(superDef);
        // Some fields in the definition may be empty, if there were no values to put in them that
        // would've justified object creation. Unwrap them if necessary.
        const writeableDef = definition as WritableDef;
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

        // Merge animations metadata.
        // If `superDef` is a Component, the `data` field is present (defaults to an empty object).
        if (isComponentDef(superDef) && superDef.data.animation) {
          // If super def is a Component, the `definition` is also a Component, since Directives can
          // not inherit Components (we throw an error above and cannot reach this code).
          const defData = (definition as ComponentDef<any>).data;
          defData.animation = (defData.animation || []).concat(superDef.data.animation);
        }
      }

      // Run parent features
      const features = superDef.features;
      if (features) {
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          if (feature && feature.ngInherit) {
            (feature as DirectiveDefFeature)(definition);
          }
          // If `InheritDefinitionFeature` is a part of the current `superDef`, it means that this
          // def already has all the necessary information inherited from its super class(es), so we
          // can stop merging fields from super classes. However we need to iterate through the
          // prototype chain to look for classes that might contain other "features" (like
          // NgOnChanges), which we should invoke for the original `definition`. We set the
          // `shouldInheritFields` flag to indicate that, essentially skipping fields inheritance
          // logic and only invoking functions from the "features" list.
          if (feature === ɵɵInheritDefinitionFeature) {
            shouldInheritFields = false;
          }
        }
      }
    }

    superType = Object.getPrototypeOf(superType);
  }
  mergeHostAttrsAcrossInheritance(inheritanceChain);
}

/**
 * Merge the `hostAttrs` and `hostVars` from the inherited parent to the base class.
 *
 * @param inheritanceChain A list of `WritableDefs` starting at the top most type and listing
 * sub-types in order. For each type take the `hostAttrs` and `hostVars` and merge it with the child
 * type.
 */
function mergeHostAttrsAcrossInheritance(inheritanceChain: WritableDef[]) {
  let hostVars: number = 0;
  let hostAttrs: TAttributes|null = null;
  // We process the inheritance order from the base to the leaves here.
  for (let i = inheritanceChain.length - 1; i >= 0; i--) {
    const def = inheritanceChain[i];
    // For each `hostVars`, we need to add the superclass amount.
    def.hostVars = (hostVars += def.hostVars);
    // for each `hostAttrs` we need to merge it with superclass.
    def.hostAttrs =
        mergeHostAttrs(def.hostAttrs, hostAttrs = mergeHostAttrs(hostAttrs, def.hostAttrs));
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

function inheritViewQuery(definition: WritableDef, superViewQuery: ViewQueriesFunction<any>) {
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
    definition: WritableDef, superContentQueries: ContentQueriesFunction<any>) {
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
    definition: WritableDef, superHostBindings: HostBindingsFunction<any>) {
  const prevHostBindings = definition.hostBindings;
  if (prevHostBindings) {
    definition.hostBindings = (rf: RenderFlags, ctx: any) => {
      superHostBindings(rf, ctx);
      prevHostBindings(rf, ctx);
    };
  } else {
    definition.hostBindings = superHostBindings;
  }
}
