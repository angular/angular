/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FlatTreeControl } from '@angular/cdk/tree';
import { FlatNode } from '../../../../property-resolver/element-property-resolver';
import { PropertyDataSource } from '../../../../property-resolver/property-data-source';
import { DebugSignalGraphNode } from '../../../../../../../../../protocol';
export declare class PropertyViewTreeComponent {
    protected readonly supportedApis: import("../../../../../../application-providers/supported_apis").SupportedApisSignal;
    private readonly signalGraph;
    private readonly settings;
    readonly dataSource: import("@angular/core").InputSignal<PropertyDataSource>;
    readonly treeControl: import("@angular/core").InputSignal<FlatTreeControl<FlatNode, FlatNode>>;
    readonly updateValue: import("@angular/core").OutputEmitterRef<any>;
    readonly inspect: import("@angular/core").OutputEmitterRef<any>;
    readonly showSignalGraph: import("@angular/core").OutputEmitterRef<DebugSignalGraphNode>;
    protected readonly signalGraphEnabled: import("@angular/core").WritableSignal<boolean>;
    hasChild: (_: number, node: FlatNode) => boolean;
    toggle(node: FlatNode): void;
    expand(node: FlatNode): void;
    handleUpdate(node: FlatNode, newValue: unknown): void;
    getSignalNode(node: FlatNode): DebugSignalGraphNode | null;
    showGraph(event: Event, node: DebugSignalGraphNode): void;
}
