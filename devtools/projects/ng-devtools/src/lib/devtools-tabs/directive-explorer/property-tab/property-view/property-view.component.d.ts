/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DebugSignalGraphNode, DirectivePosition } from '../../../../../../../protocol';
import { FlatNode } from '../../property-resolver/element-property-resolver';
export declare class PropertyViewComponent {
    readonly directive: import("@angular/core").InputSignal<{
        name: string;
    }>;
    readonly inspect: import("@angular/core").OutputEmitterRef<{
        node: FlatNode;
        directivePosition: DirectivePosition;
    }>;
    readonly viewSource: import("@angular/core").OutputEmitterRef<void>;
    readonly showSignalGraph: import("@angular/core").OutputEmitterRef<DebugSignalGraphNode>;
    private _nestedProps;
    protected readonly controller: import("@angular/core").Signal<import("../../property-resolver/directive-property-resolver").DirectivePropertyResolver | undefined>;
    protected readonly directiveInputControls: import("@angular/core").Signal<import("../../property-resolver/directive-property-resolver").DirectiveTreeData | undefined>;
    protected readonly directivePropControls: import("@angular/core").Signal<import("../../property-resolver/directive-property-resolver").DirectiveTreeData | undefined>;
    protected readonly directiveOutputControls: import("@angular/core").Signal<import("../../property-resolver/directive-property-resolver").DirectiveTreeData | undefined>;
    protected readonly directiveStateControls: import("@angular/core").Signal<import("../../property-resolver/directive-property-resolver").DirectiveTreeData | undefined>;
}
