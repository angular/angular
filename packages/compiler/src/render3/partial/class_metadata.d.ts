/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as o from '../../output/output_ast';
import { R3ClassMetadata } from '../r3_class_metadata_compiler';
import { R3DeferPerComponentDependency } from '../view/api';
export declare function compileDeclareClassMetadata(metadata: R3ClassMetadata): o.Expression;
export declare function compileComponentDeclareClassMetadata(metadata: R3ClassMetadata, dependencies: R3DeferPerComponentDependency[] | null): o.Expression;
