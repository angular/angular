/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { RouterTreeNode } from './router-tree-fns';
export type RowType = 'text' | 'chip' | 'flag' | 'list';
export declare class RouteDetailsRowComponent {
    readonly label: import("@angular/core").InputSignal<string>;
    readonly data: import("@angular/core").InputSignal<RouterTreeNode>;
    readonly dataKey: import("@angular/core").InputSignal<string>;
    readonly renderValueAsJson: import("@angular/core").InputSignal<boolean>;
    readonly type: import("@angular/core").InputSignal<RowType>;
    readonly btnClick: import("@angular/core").OutputEmitterRef<string>;
    readonly rowValue: import("@angular/core").Signal<any>;
    readonly dataArray: import("@angular/core").Signal<any>;
}
