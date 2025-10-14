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
import { Descriptor, DirectivePosition, Events, MessageBus } from '../../../../../../protocol';
import { Observable } from 'rxjs';
import { FlatNode, Property } from './element-property-resolver';
export declare class PropertyDataSource extends DataSource<FlatNode> {
    private _treeFlattener;
    private _treeControl;
    private _entityPosition;
    private _messageBus;
    private _data;
    private _subscriptions;
    private _expandedData;
    private _differ;
    constructor(props: {
        [prop: string]: Descriptor;
    }, _treeFlattener: MatTreeFlattener<Property, FlatNode>, _treeControl: FlatTreeControl<FlatNode>, _entityPosition: DirectivePosition, _messageBus: MessageBus<Events>);
    get data(): FlatNode[];
    get treeControl(): FlatTreeControl<FlatNode>;
    update(props: {
        [prop: string]: Descriptor;
    }): void;
    connect(collectionViewer: CollectionViewer): Observable<FlatNode[]>;
    disconnect(): void;
    private _toggleNode;
}
