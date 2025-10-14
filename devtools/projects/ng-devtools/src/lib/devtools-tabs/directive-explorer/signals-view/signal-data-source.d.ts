/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener } from '@angular/material/tree';
import { Descriptor, Events, MessageBus, SignalNodePosition } from '../../../../../../protocol';
import { Observable } from 'rxjs';
import { FlatNode, Property } from './signals-details/signals-value-tree/signals-value-tree.component';
export declare const arrayifyProps: (props: {
    [prop: string]: Descriptor;
} | Descriptor[], parent?: Property | null) => Property[];
export declare class SignalDataSource extends DataSource<FlatNode> {
    private treeFlattener;
    private treeControl;
    private entityPosition;
    private messageBus;
    private data;
    private expandedData;
    private readonly destroy;
    constructor(props: Descriptor, treeFlattener: MatTreeFlattener<Property, FlatNode>, treeControl: FlatTreeControl<FlatNode>, entityPosition: SignalNodePosition, messageBus: MessageBus<Events>);
    connect(collectionViewer: CollectionViewer): Observable<FlatNode[]>;
    disconnect(): void;
    private toggleNode;
}
