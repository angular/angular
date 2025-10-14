/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
import { R3CompiledExpression, R3Reference } from './util';
export interface R3InjectorMetadata {
    name: string;
    type: R3Reference;
    providers: o.Expression | null;
    imports: o.Expression[];
}
export declare function compileInjector(meta: R3InjectorMetadata): R3CompiledExpression;
export declare function createInjectorType(meta: R3InjectorMetadata): o.Type;
