/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Directive, Input} from '@angular/core';
import {getInputBoolean, getInputPositiveNumber} from './utils';
let SplitAreaDirective = class SplitAreaDirective {
  set order(v) {
    this._order = getInputPositiveNumber(v, null);
    this.split.updateArea(this, true, false);
  }
  get order() {
    return this._order;
  }
  set size(v) {
    this._size = getInputPositiveNumber(v, null);
    this.split.updateArea(this, false, true);
  }
  get size() {
    return this._size;
  }
  set minSize(v) {
    this._minSize = getInputPositiveNumber(v, null);
    this.split.updateArea(this, false, true);
  }
  get minSize() {
    return this._minSize;
  }
  set maxSize(v) {
    this._maxSize = getInputPositiveNumber(v, null);
    this.split.updateArea(this, false, true);
  }
  get maxSize() {
    return this._maxSize;
  }
  set lockSize(v) {
    this._lockSize = getInputBoolean(v);
    this.split.updateArea(this, false, true);
  }
  get lockSize() {
    return this._lockSize;
  }
  set visible(v) {
    this._visible = getInputBoolean(v);
    if (this._visible) {
      this.split.showArea(this);
      this.renderer.removeClass(this.elRef.nativeElement, 'as-hidden');
    } else {
      this.split.hideArea(this);
      this.renderer.addClass(this.elRef.nativeElement, 'as-hidden');
    }
  }
  get visible() {
    return this._visible;
  }
  constructor(elRef, renderer, split) {
    this.elRef = elRef;
    this.renderer = renderer;
    this.split = split;
    this._order = null;
    ////
    this._size = null;
    ////
    this._minSize = null;
    ////
    this._maxSize = null;
    ////
    this._lockSize = false;
    ////
    this._visible = true;
    this.lockListeners = [];
    this.renderer.addClass(this.elRef.nativeElement, 'as-split-area');
  }
  ngOnInit() {
    this.split.addArea(this);
    this.transitionListener = this.renderer.listen(
      this.elRef.nativeElement,
      'transitionend',
      (event) => {
        // Limit only flex-basis transition to trigger the event
        if (event.propertyName === 'flex-basis') {
          this.split.notify('transitionEnd', -1);
        }
      },
    );
  }
  setStyleOrder(value) {
    this.renderer.setStyle(this.elRef.nativeElement, 'order', value);
  }
  setStyleFlex(grow, shrink, basis, isMin, isMax) {
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
  lockEvents() {
    this.lockListeners.push(
      this.renderer.listen(this.elRef.nativeElement, 'selectstart', (e) => false),
    );
    this.lockListeners.push(
      this.renderer.listen(this.elRef.nativeElement, 'dragstart', (e) => false),
    );
  }
  unlockEvents() {
    while (this.lockListeners.length > 0) {
      const fct = this.lockListeners.pop();
      if (fct) fct();
    }
  }
  ngOnDestroy() {
    this.unlockEvents();
    if (this.transitionListener) {
      this.transitionListener();
    }
    this.split.removeArea(this);
  }
};
__decorate([Input()], SplitAreaDirective.prototype, 'order', null);
__decorate([Input()], SplitAreaDirective.prototype, 'size', null);
__decorate([Input()], SplitAreaDirective.prototype, 'minSize', null);
__decorate([Input()], SplitAreaDirective.prototype, 'maxSize', null);
__decorate([Input()], SplitAreaDirective.prototype, 'lockSize', null);
__decorate([Input()], SplitAreaDirective.prototype, 'visible', null);
SplitAreaDirective = __decorate(
  [
    Directive({
      selector: 'as-split-area, [as-split-area]',
      exportAs: 'asSplitArea',
    }),
  ],
  SplitAreaDirective,
);
export {SplitAreaDirective};
//# sourceMappingURL=splitArea.directive.js.map
