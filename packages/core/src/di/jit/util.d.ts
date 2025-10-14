/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { R3DependencyMetadataFacade } from '../../compiler/compiler_facade';
import { Type } from '../../interface/type';
import { ReflectionCapabilities } from '../../reflection/reflection_capabilities';
export declare function getReflect(): ReflectionCapabilities;
export declare function reflectDependencies(type: Type<any>): R3DependencyMetadataFacade[];
export declare function convertDependencies(deps: any[]): R3DependencyMetadataFacade[];
