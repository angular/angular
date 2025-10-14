/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../output/output_ast';
import { R3DependencyMetadata } from './r3_factory';
import { R3CompiledExpression, R3Reference } from './util';
export interface R3PipeMetadata {
    /**
     * Name of the pipe type.
     */
    name: string;
    /**
     * An expression representing a reference to the pipe itself.
     */
    type: R3Reference;
    /**
     * Number of generic type parameters of the type itself.
     */
    typeArgumentCount: number;
    /**
     * Name of the pipe.
     */
    pipeName: string | null;
    /**
     * Dependencies of the pipe's constructor.
     */
    deps: R3DependencyMetadata[] | null;
    /**
     * Whether the pipe is marked as pure.
     */
    pure: boolean;
    /**
     * Whether the pipe is standalone.
     */
    isStandalone: boolean;
}
export declare function compilePipeFromMetadata(metadata: R3PipeMetadata): R3CompiledExpression;
export declare function createPipeType(metadata: R3PipeMetadata): o.Type;
