/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ChangeDetectorRef, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';
import { Direction, IArea, IOutputAreaSizes, IOutputData, Unit } from './interface';
import { SplitAreaDirective } from './splitArea.directive';
/**
 * angular-split
 *
 *
 *  PERCENT MODE ([unit]="'percent'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |       20                 30                 20                 15                 15      | <--
 * [size]="x" |               10px               10px               10px               10px | <--
 * [gutterSize]="10" |calc(20% - 8px)    calc(30% - 12px)   calc(20% - 8px)    calc(15% - 6px)
 * calc(15% - 6px)| <-- CSS flex-basis property (with flex-grow&shrink at 0) |     152px 228px 152px
 * 114px              114px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <--
 * el.getBoundingClientRect().width flex-basis = calc( { area.size }% - { area.size/100 *
 * nbGutter*gutterSize }px );
 *
 *
 *  PIXEL MODE ([unit]="'pixel'")
 *  ___________________________________________________________________________________________
 * |       A       [g1]       B       [g2]       C       [g3]       D       [g4]       E       |
 * |-------------------------------------------------------------------------------------------|
 * |      100                250                 *                 150                100      | <--
 * [size]="y" |               10px               10px               10px               10px | <--
 * [gutterSize]="10" |   0 0 100px          0 0 250px           1 1 auto          0 0 150px 0 0
 * 100px   | <-- CSS flex property (flex-grow/flex-shrink/flex-basis) |     100px              250px
 * 200px              150px              100px     | <-- el.getBoundingClientRect().width
 * |___________________________________________________________________________________________|
 *                                                                                 800px         <--
 * el.getBoundingClientRect().width
 *
 */
export declare class SplitComponent implements OnDestroy {
    private elRef;
    private cdRef;
    private renderer;
    directionInput: import("@angular/core").InputSignal<Direction>;
    direction: import("@angular/core").WritableSignal<Direction>;
    unit: import("@angular/core").InputSignal<Unit>;
    gutterSize: import("@angular/core").InputSignalWithTransform<number, unknown>;
    gutterStep: import("@angular/core").InputSignalWithTransform<number, unknown>;
    restrictMove: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    useTransition: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    dir: import("@angular/core").InputSignal<"ltr" | "rtl">;
    gutterDblClickDuration: import("@angular/core").InputSignalWithTransform<number, unknown>;
    dragStart: import("@angular/core").OutputEmitterRef<IOutputData>;
    dragEnd: import("@angular/core").OutputEmitterRef<IOutputData>;
    gutterClick: import("@angular/core").OutputEmitterRef<IOutputData>;
    gutterDblClick: import("@angular/core").OutputEmitterRef<IOutputData>;
    private transitionEndSubscriber;
    transitionEnd: import("@angular/core").OutputRef<IOutputAreaSizes>;
    private dragProgressSubject;
    dragProgress$: Observable<IOutputData>;
    private isDragging;
    private dragListeners;
    private snapshot;
    private startPoint;
    private endPoint;
    readonly displayedAreas: Array<IArea>;
    private readonly hidedAreas;
    private gutterEls;
    constructor(elRef: ElementRef, cdRef: ChangeDetectorRef, renderer: Renderer2);
    private getNbGutters;
    addArea(component: SplitAreaDirective): void;
    removeArea(component: SplitAreaDirective): void;
    updateArea(component: SplitAreaDirective, resetOrders: boolean, resetSizes: boolean): void;
    showArea(component: SplitAreaDirective): void;
    hideArea(comp: SplitAreaDirective): void;
    getVisibleAreaSizes(): IOutputAreaSizes;
    setVisibleAreaSizes(sizes: IOutputAreaSizes): boolean;
    private build;
    private refreshStyleSizes;
    private clickTimeout;
    clickGutter(event: MouseEvent | TouchEvent, gutterNum: number): void;
    startDragging(event: MouseEvent | TouchEvent, gutterOrder: number, gutterNum: number): void;
    private dragEvent;
    private stopDragging;
    notify(type: 'start' | 'progress' | 'end' | 'click' | 'dblclick' | 'transitionEnd', gutterNum: number): void;
    ngOnDestroy(): void;
}
