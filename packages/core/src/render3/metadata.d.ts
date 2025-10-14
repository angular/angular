/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
/**
 * If a given component has unresolved async metadata - returns a reference
 * to a function that applies component metadata after resolving defer-loadable
 * dependencies. Otherwise - this function returns `null`.
 */
export declare function getAsyncClassMetadataFn(type: Type<unknown>): (() => Promise<Array<Type<unknown>>>) | null;
/**
 * Handles the process of applying metadata info to a component class in case
 * component template has defer blocks (thus some dependencies became deferrable).
 *
 * @param type Component class where metadata should be added
 * @param dependencyLoaderFn Function that loads dependencies
 * @param metadataSetterFn Function that forms a scope in which the `setClassMetadata` is invoked
 */
export declare function setClassMetadataAsync(type: Type<any>, dependencyLoaderFn: () => Array<Promise<Type<unknown>>>, metadataSetterFn: (...types: Type<unknown>[]) => void): () => Promise<Array<Type<unknown>>>;
/**
 * Adds decorator, constructor, and property metadata to a given type via static metadata fields
 * on the type.
 *
 * These metadata fields can later be read with Angular's `ReflectionCapabilities` API.
 *
 * Calls to `setClassMetadata` can be guarded by ngDevMode, resulting in the metadata assignments
 * being tree-shaken away during production builds.
 */
export declare function setClassMetadata(type: Type<any>, decorators: any[] | null, ctorParameters: (() => any[]) | null, propDecorators: {
    [field: string]: any;
} | null): void;
