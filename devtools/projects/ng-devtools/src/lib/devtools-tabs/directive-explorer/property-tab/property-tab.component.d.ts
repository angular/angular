/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DebugSignalGraphNode, DirectivePosition } from '../../../../../../protocol';
import { IndexedNode } from '../directive-forest/index-forest';
import { FlatNode } from '../property-resolver/element-property-resolver';
export declare class PropertyTabComponent {
    readonly currentSelectedElement: import("@angular/core").InputSignal<IndexedNode | null>;
    readonly viewSource: import("@angular/core").OutputEmitterRef<string>;
    readonly inspect: import("@angular/core").OutputEmitterRef<{
        node: FlatNode;
        directivePosition: DirectivePosition;
    }>;
    readonly showSignalGraph: import("@angular/core").OutputEmitterRef<DebugSignalGraphNode | null>;
    readonly currentDirectives: import("@angular/core").Signal<import("../../../../../../protocol").DirectiveType[] | undefined>;
}
