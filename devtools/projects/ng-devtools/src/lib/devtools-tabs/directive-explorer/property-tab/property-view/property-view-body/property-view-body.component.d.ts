/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { DebugSignalGraphNode, DirectivePosition } from '../../../../../../../../protocol';
import { DirectivePropertyResolver, DirectiveTreeData } from '../../../property-resolver/directive-property-resolver';
import { FlatNode } from '../../../property-resolver/element-property-resolver';
export declare class PropertyViewBodyComponent {
    readonly controller: import("@angular/core").InputSignal<DirectivePropertyResolver>;
    readonly directiveInputControls: import("@angular/core").InputSignal<DirectiveTreeData>;
    readonly directivePropControls: import("@angular/core").InputSignal<DirectiveTreeData>;
    readonly directiveOutputControls: import("@angular/core").InputSignal<DirectiveTreeData>;
    readonly directiveStateControls: import("@angular/core").InputSignal<DirectiveTreeData>;
    readonly inspect: import("@angular/core").OutputEmitterRef<{
        node: FlatNode;
        directivePosition: DirectivePosition;
    }>;
    readonly showSignalGraph: import("@angular/core").OutputEmitterRef<DebugSignalGraphNode>;
    protected readonly dependencies: import("@angular/core").Signal<import("../../../../../../../../protocol").SerializedInjectedService[] | undefined>;
    protected readonly panels: import("@angular/core").WritableSignal<{
        title: () => string;
        controls: () => DirectiveTreeData;
    }[]>;
    readonly controlsLoaded: import("@angular/core").Signal<boolean>;
    updateValue({ node, newValue }: {
        node: FlatNode;
        newValue: unknown;
    }): void;
    drop(event: CdkDragDrop<any, any>): void;
    handleInspect(node: FlatNode): void;
}
