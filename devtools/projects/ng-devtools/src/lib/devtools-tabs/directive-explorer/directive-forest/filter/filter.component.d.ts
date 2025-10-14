/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export type FilterMatch = {
    startIdx: number;
    endIdx: number;
};
export type FilterFn = (source: string) => FilterMatch[];
/** Describes the filtering strategy of the `ng-filter` by providing a generator for the `FilterFn`. */
export type FilterFnGenerator = (filter: string) => FilterFn;
export declare class FilterComponent {
    readonly filter: import("@angular/core").OutputEmitterRef<FilterFn>;
    readonly nextMatched: import("@angular/core").OutputEmitterRef<void>;
    readonly prevMatched: import("@angular/core").OutputEmitterRef<void>;
    readonly matchesCount: import("@angular/core").InputSignal<number>;
    readonly currentMatch: import("@angular/core").InputSignal<number>;
    readonly filterFnGenerator: import("@angular/core").InputSignal<FilterFnGenerator>;
    emitFilter(event: Event): void;
    emitNextMatched(): void;
    emitPrevMatched(): void;
}
