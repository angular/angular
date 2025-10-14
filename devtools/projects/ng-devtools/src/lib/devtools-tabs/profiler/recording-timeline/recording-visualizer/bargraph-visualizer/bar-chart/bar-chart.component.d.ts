/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { BargraphNode } from '../../../record-formatter/bargraph-formatter/bargraph-formatter';
interface BarData {
    label: string;
    count: number;
    width: number;
    time: number;
    text: string;
}
export declare class BarChartComponent {
    readonly data: import("@angular/core").InputSignal<BargraphNode[]>;
    readonly internalData: import("@angular/core").Signal<BarData[]>;
    readonly barClick: import("@angular/core").OutputEmitterRef<BargraphNode>;
}
export declare function createBarText(bar: BargraphNode): string;
export {};
