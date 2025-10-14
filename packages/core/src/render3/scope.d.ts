/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Type } from '../interface/type';
import { ComponentType, NgModuleScopeInfoFromDecorator } from './interfaces/definition';
/**
 * Generated next to NgModules to monkey-patch directive and pipe references onto a component's
 * definition, when generating a direct reference in the component file would otherwise create an
 * import cycle.
 *
 * See [this explanation](https://hackmd.io/Odw80D0pR6yfsOjg_7XCJg?view) for more details.
 *
 * @codeGenApi
 */
export declare function ɵɵsetComponentScope(type: ComponentType<any>, directives: Type<any>[] | (() => Type<any>[]), pipes: Type<any>[] | (() => Type<any>[])): void;
/**
 * Adds the module metadata that is necessary to compute the module's transitive scope to an
 * existing module definition.
 *
 * Scope metadata of modules is not used in production builds, so calls to this function can be
 * marked pure to tree-shake it from the bundle, allowing for all referenced declarations
 * to become eligible for tree-shaking as well.
 *
 * @codeGenApi
 */
export declare function ɵɵsetNgModuleScope(type: any, scope: NgModuleScopeInfoFromDecorator): unknown;
