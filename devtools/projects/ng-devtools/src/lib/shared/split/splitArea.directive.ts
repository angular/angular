/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {SplitComponent} from './split.component';
import {getInputBoolean, getInputPositiveNumber} from './utils';

@Directive({
  selector: 'as-split-area, [as-split-area]',
  exportAs: 'asSplitArea',
})
export class SplitAreaDirective implements OnInit, OnDestroy {
  private _order: number | null = null;

  @Input()
  set order(v: number | string | null) {
    this._order = getInputPositiveNumber(v, null);

    this.split.updateArea(this, true, false);
  }

  get order(): number | null {
    return this._order;
  }

  ////

  private _size: number | null = null;

  @Input()
  set size(v: number | string | null) {
    this._size = getInputPositiveNumber(v, null);

    this.split.updateArea(this, false, true);
  }

  get size(): number | null {
    return this._size;
  }

  ////

  private _minSize: number | null = null;

  @Input()
  set minSize(v: number | string | null) {
    this._minSize = getInputPositiveNumber(v, null);

    this.split.updateArea(this, false, true);
  }

  get minSize(): number | null {
    return this._minSize;
  }

  ////

  private _maxSize: number | null = null;

  @Input()
  set maxSize(v: number | string | null) {
    this._maxSize = getInputPositiveNumber(v, null);

    this.split.updateArea(this, false, true);
  }

  get maxSize(): number | null {
    return this._maxSize;
  }

  ////

  private _lockSize: boolean = false;

  @Input()
  set lockSize(v: boolean) {
    this._lockSize = getInputBoolean(v);

    this.split.updateArea(this, false, true);
  }

  get lockSize(): boolean {
    return this._lockSize;
  }

  ////

  private _visible: boolean = true;

  @Input()
  set visible(v: boolean) {
    this._visible = getInputBoolean(v);

    if (this._visible) {
      this.split.showArea(this);
      this.renderer.removeClass(this.elRef.nativeElement, 'as-hidden');
    } else {
      this.split.hideArea(this);
      this.renderer.addClass(this.elRef.nativeElement, 'as-hidden');
    }
  }

  get visible(): boolean {
    return this._visible;
  }

  ////

  private transitionListener!: Function;
  private readonly lockListeners: Array<Function> = [];

  constructor(
    public elRef: ElementRef,
    private renderer: Renderer2,
    private split: SplitComponent,
  ) {
    this.renderer.addClass(this.elRef.nativeElement, 'as-split-area');
  }

  public ngOnInit(): void {
    this.split.addArea(this);

    this.transitionListener = this.renderer.listen(
      this.elRef.nativeElement,
      'transitionend',
      (event: TransitionEvent) => {
        // Limit only flex-basis transition to trigger the event
        if (event.propertyName === 'flex-basis') {
          this.split.notify('transitionEnd', -1);
        }
      },
    );
  }

  public setStyleOrder(value: number): void {
    this.renderer.setStyle(this.elRef.nativeElement, 'order', value);
  }

  public setStyleFlex(
    grow: number,
    shrink: number,
    basis: string,
    isMin: boolean,
    isMax: boolean,
  ): void {
    // Need 3 separated properties to work on IE11
    // (https://github.com/angular/flex-layout/issues/323)
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-grow', grow);
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-shrink', shrink);
    this.renderer.setStyle(this.elRef.nativeElement, 'flex-basis', basis);

    if (isMin === true) this.renderer.addClass(this.elRef.nativeElement, 'as-min');
    else this.renderer.removeClass(this.elRef.nativeElement, 'as-min');

    if (isMax === true) this.renderer.addClass(this.elRef.nativeElement, 'as-max');
    else this.renderer.removeClass(this.elRef.nativeElement, 'as-max');
  }

  public lockEvents(): void {
    this.lockListeners.push(
      this.renderer.listen(this.elRef.nativeElement, 'selectstart', (e: Event) => false),
    );
    this.lockListeners.push(
      this.renderer.listen(this.elRef.nativeElement, 'dragstart', (e: Event) => false),
    );
  }

  public unlockEvents(): void {
    while (this.lockListeners.length > 0) {
      const fct = this.lockListeners.pop();
      if (fct) fct();
    }
  }

  public ngOnDestroy(): void {
    this.unlockEvents();

    if (this.transitionListener) {
      this.transitionListener();
    }

    this.split.removeArea(this);
  }
}
