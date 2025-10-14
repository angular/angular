/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DataSource } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { DebugSignalGraphNode } from '../../../../../../../protocol';
import { FlatNode } from './signals-value-tree/signals-value-tree.component';
export declare class SignalsDetailsComponent {
    protected readonly node: import("@angular/core").InputSignal<DebugSignalGraphNode>;
    protected readonly dataSource: import("@angular/core").InputSignal<DataSource<FlatNode>>;
    protected readonly treeControl: import("@angular/core").InputSignal<FlatTreeControl<FlatNode, FlatNode>>;
    protected readonly gotoSource: import("@angular/core").OutputEmitterRef<DebugSignalGraphNode>;
    protected readonly close: import("@angular/core").OutputEmitterRef<void>;
    protected readonly TYPE_CLASS_MAP: {
        [key: string]: string;
    };
}
