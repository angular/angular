/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TNode, TNodeType } from './interfaces/node';
export declare function assertTNodeType(tNode: TNode | null, expectedTypes: TNodeType, message?: string): void;
export declare function assertPureTNodeType(type: TNodeType): void;
