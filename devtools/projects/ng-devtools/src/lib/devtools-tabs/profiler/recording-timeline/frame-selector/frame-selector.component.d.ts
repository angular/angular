/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ElementRef, Signal } from '@angular/core';
import { GraphNode } from '../record-formatter/record-formatter';
import { ProfilerFrame } from '../../../../../../../protocol';
export declare class FrameSelectorComponent {
    private readonly tabUpdate;
    readonly barContainer: Signal<ElementRef<any>>;
    readonly frames: import("@angular/core").InputSignal<ProfilerFrame[]>;
    readonly selectFrames: import("@angular/core").OutputEmitterRef<{
        indexes: number[];
    }>;
    readonly viewport: Signal<CdkVirtualScrollViewport>;
    readonly startFrameIndex: import("@angular/core").WritableSignal<number>;
    readonly endFrameIndex: import("@angular/core").WritableSignal<number>;
    readonly selectedFrameIndexes: import("@angular/core").WritableSignal<Set<number>>;
    readonly dragScrolling: import("@angular/core").WritableSignal<boolean>;
    readonly frameCount: Signal<number>;
    readonly disableNextFrameButton: Signal<boolean>;
    readonly disablePreviousFrameButton: Signal<boolean>;
    readonly selectionLabel: Signal<string>;
    private _viewportScrollState;
    readonly itemWidth: number;
    private readonly maxFrameDuration;
    private readonly multiplicationFactor;
    protected readonly graphData: Signal<GraphNode[]>;
    constructor();
    private _smartJoinIndexLabels;
    move(value: number): void;
    private _selectFrames;
    handleFrameSelection(idx: number, event: MouseEvent): void;
    private _ensureVisible;
    stopDragScrolling(): void;
    startDragScroll(event: MouseEvent): void;
    dragScroll(event: MouseEvent): void;
    trackByIndex(index: number): number;
    private getBarStyles;
    private getColorByFrameRate;
}
