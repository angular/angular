/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from './output/output_ast';
import { R3DependencyMetadata } from './render3/r3_factory';
import { MaybeForwardRefExpression, R3CompiledExpression, R3Reference } from './render3/util';
export interface R3InjectableMetadata {
    name: string;
    type: R3Reference;
    typeArgumentCount: number;
    providedIn: MaybeForwardRefExpression;
    useClass?: MaybeForwardRefExpression;
    useFactory?: o.Expression;
    useExisting?: MaybeForwardRefExpression;
    useValue?: MaybeForwardRefExpression;
    deps?: R3DependencyMetadata[];
}
export declare function compileInjectable(meta: R3InjectableMetadata, resolveForwardRefs: boolean): R3CompiledExpression;
export declare function createInjectableType(meta: R3InjectableMetadata): o.ExpressionType;
