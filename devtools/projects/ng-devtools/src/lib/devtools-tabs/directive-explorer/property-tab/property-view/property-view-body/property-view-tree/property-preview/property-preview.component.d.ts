/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { FlatNode } from '../../../../../property-resolver/element-property-resolver';
export declare class PropertyPreviewComponent {
    readonly node: import("@angular/core").InputSignal<FlatNode>;
    readonly inspect: import("@angular/core").OutputEmitterRef<void>;
    readonly isClickableProp: import("@angular/core").Signal<boolean>;
}
