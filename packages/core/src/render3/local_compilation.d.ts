/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentType, DependencyTypeList, RawScopeInfoFromDecorator } from './interfaces/definition';
export declare function ɵɵgetComponentDepsFactory(type: ComponentType<any>, rawImports?: RawScopeInfoFromDecorator[]): () => DependencyTypeList;
