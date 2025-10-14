/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { DeferInfo } from '../../../../../../../protocol';
export declare class DeferViewComponent {
    readonly defer: import("@angular/core").InputSignal<DeferInfo>;
    readonly loadingBlockInfo: import("@angular/core").Signal<string | null>;
}
