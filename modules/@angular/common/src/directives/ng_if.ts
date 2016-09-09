/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * Removes or recreates a portion of the DOM tree based on an {expression}.
 *
 * If the expression assigned to `ngIf` evaluates to a false value then the element
 * is removed from the DOM, otherwise a clone of the element is reinserted into the DOM.
 *
 * ### Example ([live demo](http://plnkr.co/edit/fe0kgemFBtmQOY31b4tw?p=preview)):
 *
 * ```
 * <div *ngIf="errorCount > 0" class="error">
 *   <!-- Error message displayed when the errorCount property on the current context is greater
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
export class NgIf {
  private _hasView: boolean = false;

  constructor(private _viewContainer: ViewContainerRef, private _template: TemplateRef<Object>) {}

  @Input()
  set ngIf(condition: any) {
    if (condition && !this._hasView) {
      this._hasView = true;
      this._viewContainer.createEmbeddedView(this._template);
    } else if (!condition && this._hasView) {
      this._hasView = false;
      this._viewContainer.clear();
    }
  }
}
