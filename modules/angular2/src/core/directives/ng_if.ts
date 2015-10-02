import {Directive} from 'angular2/src/core/metadata';
import {ViewContainerRef, TemplateRef} from 'angular2/src/core/linker';
import {isBlank} from 'angular2/src/core/facade/lang';

/**
 * Removes or recreates a portion of the DOM tree based on an {expression}.
 *
 * If the expression assigned to `ng-if` evaluates to a false value then the element
 * is removed from the DOM, otherwise a clone of the element is reinserted into the DOM.
 *
 * ### Example ([live demo](http://plnkr.co/edit/fe0kgemFBtmQOY31b4tw?p=preview)):
 *
 * ```
 * <div *ng-if="errorCount > 0" class="error">
 *   <!-- Error message displayed when the errorCount property on the current context is greater
 * than 0. -->
 *   {{errorCount}} errors detected
 * </div>
 * ```
 *
 * # Syntax
 *
 * - `<div *ng-if="condition">...</div>`
 * - `<div template="ng-if condition">...</div>`
 * - `<template [ng-if]="condition"><div>...</div></template>`
 */
@Directive({selector: '[ng-if]', inputs: ['ngIf']})
export class NgIf {
  private _prevCondition: boolean = null;

  constructor(private _viewContainer: ViewContainerRef, private _templateRef: TemplateRef) {}

  set ngIf(newCondition /* boolean */) {
    if (newCondition && (isBlank(this._prevCondition) || !this._prevCondition)) {
      this._prevCondition = true;
      this._viewContainer.createEmbeddedView(this._templateRef);
    } else if (!newCondition && (isBlank(this._prevCondition) || this._prevCondition)) {
      this._prevCondition = false;
      this._viewContainer.clear();
    }
  }
}
