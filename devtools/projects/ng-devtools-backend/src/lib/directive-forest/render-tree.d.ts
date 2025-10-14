/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ComponentTreeNode } from '../interfaces';
export declare class RTreeStrategy {
    supports(): boolean;
    build(element: Element, rootId?: number): ComponentTreeNode[];
}
