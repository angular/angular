/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DeferInfo, DevToolsNode, HydrationStatus } from '../../../../../../../protocol';
import { Observable } from 'rxjs';
import { IndexedNode } from '../index-forest';
/** Flat node with expandable and level information */
export interface FlatNode {
    id: string;
    expandable: boolean;
    name: string;
    directives: string[];
    position: number[];
    level: number;
    original: IndexedNode;
    newItem?: boolean;
    hydration: HydrationStatus;
    defer: DeferInfo | null;
    onPush?: boolean;
    hasNativeElement: boolean;
}
export declare class ComponentDataSource extends DataSource<FlatNode> {
    private _treeControl;
    private _differ;
    private _expandedData;
    private _flattenedData;
    private _nodeToFlat;
    private _treeFlattener;
    constructor(_treeControl: FlatTreeControl<FlatNode>);
    get data(): FlatNode[];
    get expandedDataValues(): FlatNode[];
    getFlatNodeFromIndexedNode(indexedNode: IndexedNode): FlatNode | undefined;
    update(forest: DevToolsNode[], showCommentNodes: boolean): {
        newItems: FlatNode[];
        movedItems: FlatNode[];
        removedItems: FlatNode[];
    };
    connect(collectionViewer: CollectionViewer): Observable<FlatNode[]>;
    disconnect(): void;
}
