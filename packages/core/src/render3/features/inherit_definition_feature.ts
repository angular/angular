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
import {adjustActiveDirectiveSuperClassDepthPosition} from '../state';

import {ɵɵNgOnChangesFeature} from './ng_onchanges_feature';

function getSuperType(type: Type<any>): Type<any>&
    {ngComponentDef?: ComponentDef<any>, ngDirectiveDef?: DirectiveDef<any>} {
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
      const baseViewQuery = baseDef.viewQuery;
      const baseContentQueries = baseDef.contentQueries;
      const baseHostBindings = baseDef.hostBindings;
      baseHostBindings && inheritHostBindings(definition, baseHostBindings);
      baseViewQuery && inheritViewQuery(definition, baseViewQuery);
      baseContentQueries && inheritContentQueries(definition, baseContentQueries);
      fillProperties(definition.inputs, baseDef.inputs);
      fillProperties(definition.declaredInputs, baseDef.declaredInputs);
      fillProperties(definition.outputs, baseDef.outputs);
    }

    if (superDef) {
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
        for (const feature of features) {
          if (feature && feature.ngInherit) {
            (feature as DirectiveDefFeature)(definition);
          }
        }
      }
    } else {
      // Even if we don't have a definition, check the type for the hooks and use those if need be
      const superPrototype = superType.prototype;
      if (superPrototype) {
        definition.afterContentChecked =
            definition.afterContentChecked || superPrototype.ngAfterContentChecked;
        definition.afterContentInit =
            definition.afterContentInit || superPrototype.ngAfterContentInit;
        definition.afterViewChecked =
            definition.afterViewChecked || superPrototype.ngAfterViewChecked;
        definition.afterViewInit = definition.afterViewInit || superPrototype.ngAfterViewInit;
        definition.doCheck = definition.doCheck || superPrototype.ngDoCheck;
        definition.onDestroy = definition.onDestroy || superPrototype.ngOnDestroy;
        definition.onInit = definition.onInit || superPrototype.ngOnInit;

        if (superPrototype.ngOnChanges) {
          ɵɵNgOnChangesFeature()(definition);
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
      // because inheritance is unknown during compile time, the runtime code
      // needs to be informed of the super-class depth so that instruction code
      // can distinguish one host bindings function from another. The reason why
      // relying on the directive uniqueId exclusively is not enough is because the
      // uniqueId value and the directive instance stay the same between hostBindings
      // calls throughout the directive inheritance chain. This means that without
      // a super-class depth value, there is no way to know whether a parent or
      // sub-class host bindings function is currently being executed.
      definition.hostBindings = (rf: RenderFlags, ctx: any, elementIndex: number) => {
        // The reason why we increment first and then decrement is so that parent
        // hostBindings calls have a higher id value compared to sub-class hostBindings
        // calls (this way the leaf directive is always at a super-class depth of 0).
        adjustActiveDirectiveSuperClassDepthPosition(1);
        try {
          superHostBindings(rf, ctx, elementIndex);
        } finally {
          adjustActiveDirectiveSuperClassDepthPosition(-1);
        }
        prevHostBindings(rf, ctx, elementIndex);
      };
    } else {
      definition.hostBindings = superHostBindings;
    }
  }
}
