/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { OnDestroy } from '@angular/core';
import { SignalsGraphVisualizer } from './signals-visualizer';
import { DebugSignalGraphNode } from '../../../../../../protocol';
import { FlatNode } from './signals-details/signals-value-tree/signals-value-tree.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DataSource } from '@angular/cdk/collections';
export declare class SignalsTabComponent implements OnDestroy {
    private readonly signalGraph;
    private svgComponent;
    signalsVisualizer?: SignalsGraphVisualizer;
    protected readonly preselectedNodeId: import("@angular/core").InputSignal<string | null>;
    private selected;
    private onResize;
    private observer;
    private readonly messageBus;
    private readonly appOperations;
    private readonly frameManager;
    readonly close: import("@angular/core").OutputEmitterRef<void>;
    protected selectedNode: import("@angular/core").Signal<DebugSignalGraphNode | undefined>;
    protected dataSource: import("@angular/core").Signal<DataSource<FlatNode> | null>;
    protected readonly detailsVisible: import("@angular/core").WritableSignal<boolean>;
    protected treeControl: import("@angular/core").Signal<FlatTreeControl<FlatNode, FlatNode>>;
    protected empty: import("@angular/core").Signal<boolean>;
    constructor();
    setUpSignalsVisualizer(): void;
    ngOnDestroy(): void;
    gotoSource(node: DebugSignalGraphNode): void;
}
