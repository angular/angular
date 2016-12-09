/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EmbeddedViewRef, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

export class NgIfContext {
  constructor(public $implicit?: any) {}
}

/**
 * Removes or recreates a portion of the DOM tree based on an {expression}.
 *
 * If the expression assigned to `ngIf` evaluates to a falsy value then the element
 * is removed from the DOM, otherwise a clone of the element is reinserted into the DOM.
 *
 * ### Example ([live demo](http://plnkr.co/edit/fe0kgemFBtmQOY31b4tw?p=preview)):
 *
 * ```
 * <div *ngIf="errorCount > 0" class="error">
 *   <!-- Error message displayed when the errorCount property in the current context is greater
 * than 0. -->
 *   {{errorCount}} errors detected
 * </div>
 * ```
 *
 * ### Syntax
 *
 * - `<div *ngIf="condition">...</div>`
 * - `<div template="ngIf condition">...</div>`
 * - `<template [ngIf]="condition"><div>...</div></template>`
 *
 * @stable
 */
@Directive({selector: '[ngIf]'})
export class NgIf implements OnChanges {
  @Input() ngIf: any;
  @Input() ngIfElse: TemplateRef<NgIfContext>;

  private _ref: EmbeddedViewRef<NgIfContext>;
  private _elseRef: EmbeddedViewRef<NgIfContext>;

  constructor(
      private _viewContainer: ViewContainerRef, private _template: TemplateRef<NgIfContext>) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('ngIf' in changes) {
      // React on ngIf changes only once all inputs have been initialized
      const condition: any = changes['ngIf'].currentValue;
      if (condition) {
        this._onTrue(condition);
      } else {
        this._onFalse();
      }
    }
  }

  private _onTrue(context: any): void {
    if (this._ref) {
      this._ref.context.$implicit = context;
    } else {
      if (this._elseRef) {
        this._elseRef = null;
        this._viewContainer.clear();
      }
      this._ref = this._viewContainer.createEmbeddedView(this._template, new NgIfContext(context));
    }
  }

  private _onFalse(): void {
    if (this._ref) {
      this._ref = null;
      this._viewContainer.clear();
    }

    if (!this._elseRef && this.ngIfElse) {
      this._elseRef = this._viewContainer.createEmbeddedView(this.ngIfElse, new NgIfContext());
    }
  }
}
