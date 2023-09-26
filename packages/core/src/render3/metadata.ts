/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {noSideEffects} from '../util/closure';

interface TypeWithMetadata extends Type<any> {
  decorators?: any[];
  ctorParameters?: () => any[];
  propDecorators?: {[field: string]: any};
}

/**
 * The name of a field that Angular monkey-patches onto a class
 * to keep track of the Promise that represents dependency loading
 * state.
 */
const ASYNC_COMPONENT_METADATA = '__ngAsyncComponentMetadata__';

/**
 * If a given component has unresolved async metadata - this function returns a reference to
 * a Promise that represents dependency loading. Otherwise - this function returns `null`.
 */
export function getAsyncClassMetadata(type: Type<unknown>): Promise<Array<Type<unknown>>>|null {
  const componentClass = type as any;  // cast to `any`, so that we can monkey-patch it
  return componentClass[ASYNC_COMPONENT_METADATA] ?? null;
}

/**
 * Handles the process of applying metadata info to a component class in case
 * component template had defer blocks (thus some dependencies became deferrable).
 *
 * @param type Component class where metadata should be added
 * @param dependencyLoaderFn Function that loads dependencies
 * @param metadataSetterFn Function that forms a scope in which the `setClassMetadata` is invoked
 */
export function setClassMetadataAsync(
    type: Type<any>, dependencyLoaderFn: () => Array<Promise<Type<unknown>>>,
    metadataSetterFn: (...types: Type<unknown>[]) => void): Promise<Array<Type<unknown>>> {
  const componentClass = type as any;  // cast to `any`, so that we can monkey-patch it
  componentClass[ASYNC_COMPONENT_METADATA] =
      Promise.all(dependencyLoaderFn()).then(dependencies => {
        metadataSetterFn(...dependencies);
        // Metadata is now set, reset field value to indicate that this component
        // can by used/compiled synchronously.
        componentClass[ASYNC_COMPONENT_METADATA] = null;

        return dependencies;
      });

  return componentClass[ASYNC_COMPONENT_METADATA];
}

/**
 * Adds decorator, constructor, and property metadata to a given type via static metadata fields
 * on the type.
 *
 * These metadata fields can later be read with Angular's `ReflectionCapabilities` API.
 *
 * Calls to `setClassMetadata` can be guarded by ngDevMode, resulting in the metadata assignments
 * being tree-shaken away during production builds.
 */
export function setClassMetadata(
    type: Type<any>, decorators: any[]|null, ctorParameters: (() => any[])|null,
    propDecorators: {[field: string]: any}|null): void {
  return noSideEffects(() => {
           const clazz = type as TypeWithMetadata;

           if (decorators !== null) {
             if (clazz.hasOwnProperty('decorators') && clazz.decorators !== undefined) {
               clazz.decorators.push(...decorators);
             } else {
               clazz.decorators = decorators;
             }
           }
           if (ctorParameters !== null) {
             // Rather than merging, clobber the existing parameters. If other projects exist which
             // use tsickle-style annotations and reflect over them in the same way, this could
             // cause issues, but that is vanishingly unlikely.
             clazz.ctorParameters = ctorParameters;
           }
           if (propDecorators !== null) {
             // The property decorator objects are merged as it is possible different fields have
             // different decorator types. Decorators on individual fields are not merged, as it's
             // also incredibly unlikely that a field will be decorated both with an Angular
             // decorator and a non-Angular decorator that's also been downleveled.
             if (clazz.hasOwnProperty('propDecorators') && clazz.propDecorators !== undefined) {
               clazz.propDecorators = {...clazz.propDecorators, ...propDecorators};
             } else {
               clazz.propDecorators = propDecorators;
             }
           }
         }) as never;
}
