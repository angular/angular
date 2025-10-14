/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { IndexedNode } from '../../directive-forest/index-forest';
export declare class PropertyTabHeaderComponent {
    private readonly settings;
    protected readonly currentSelectedElement: import("@angular/core").InputSignal<IndexedNode>;
    protected readonly showSignalGraph: import("@angular/core").OutputEmitterRef<void>;
    protected readonly expanded: import("@angular/core").WritableSignal<boolean>;
    protected readonly signalGraphEnabled: import("@angular/core").WritableSignal<boolean>;
}
