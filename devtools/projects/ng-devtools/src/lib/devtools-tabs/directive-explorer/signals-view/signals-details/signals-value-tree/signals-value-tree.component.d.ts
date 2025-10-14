/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FlatTreeControl } from '@angular/cdk/tree';
import { Descriptor } from '../../../../../../../../protocol';
import { DataSource } from '@angular/cdk/collections';
export interface FlatNode {
    expandable: boolean;
    prop: Property;
    level: number;
}
export interface Property {
    name: string;
    descriptor: Descriptor;
    parent: Property | null;
}
export declare class SignalsValueTreeComponent {
    readonly treeControl: import("@angular/core").InputSignal<FlatTreeControl<FlatNode, FlatNode>>;
    readonly dataSource: import("@angular/core").InputSignal<DataSource<FlatNode>>;
    toggle(node: FlatNode): void;
    hasChild: (_: number, node: FlatNode) => boolean;
}
