/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatNode } from './component-data-source/index';
export declare const isChildOf: (childPosition: number[], parentPosition: number[]) => boolean;
export declare const parentCollapsed: (nodeIdx: number, all: FlatNode[], treeControl: FlatTreeControl<FlatNode>) => boolean;
/** Returns the `FlatNode`'s directive array string. */
export declare const getDirectivesArrayString: (node: FlatNode) => string;
/** Returns the full node name string as rendered by the tree-node component. */
export declare const getFullNodeNameString: (node: FlatNode) => string;
