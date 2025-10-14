/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { R3InjectableMetadata } from '../../injectable_compiler_2';
import { R3CompiledExpression } from '../util';
import { DefinitionMap } from '../view/util';
import { R3DeclareInjectableMetadata } from './api';
/**
 * Compile a Injectable declaration defined by the `R3InjectableMetadata`.
 */
export declare function compileDeclareInjectableFromMetadata(meta: R3InjectableMetadata): R3CompiledExpression;
/**
 * Gathers the declaration fields for a Injectable into a `DefinitionMap`.
 */
export declare function createInjectableDefinitionMap(meta: R3InjectableMetadata): DefinitionMap<R3DeclareInjectableMetadata>;
