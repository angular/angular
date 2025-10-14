/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { SplitComponent } from './split.component';
export declare class SplitAreaDirective implements OnInit, OnDestroy {
    elRef: ElementRef;
    private renderer;
    private split;
    private _order;
    set order(v: number | string | null);
    get order(): number | null;
    private _size;
    set size(v: number | string | null);
    get size(): number | null;
    private _minSize;
    set minSize(v: number | string | null);
    get minSize(): number | null;
    private _maxSize;
    set maxSize(v: number | string | null);
    get maxSize(): number | null;
    private _lockSize;
    set lockSize(v: boolean);
    get lockSize(): boolean;
    private _visible;
    set visible(v: boolean);
    get visible(): boolean;
    private transitionListener;
    private readonly lockListeners;
    constructor(elRef: ElementRef, renderer: Renderer2, split: SplitComponent);
    ngOnInit(): void;
    setStyleOrder(value: number): void;
    setStyleFlex(grow: number, shrink: number, basis: string, isMin: boolean, isMax: boolean): void;
    lockEvents(): void;
    unlockEvents(): void;
    ngOnDestroy(): void;
}
