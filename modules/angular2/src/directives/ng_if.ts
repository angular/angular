import {Directive} from 'angular2/annotations';
import {ViewContainerRef, ProtoViewRef} from 'angular2/core';
import {isBlank} from 'angular2/src/facade/lang';

/**
 * Removes or recreates a portion of the DOM tree based on an {expression}.
 *
 * If the expression assigned to `ng-if` evaluates to a false value then the element
 * is removed from the DOM, otherwise a clone of the element is reinserted into the DOM.
 *
 * # Example:
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
 *
 * @exportedAs angular2/directives
 */
@Directive({selector: '[ng-if]', properties: ['ngIf']})
export class NgIf {
  viewContainer: ViewContainerRef;
  protoViewRef: ProtoViewRef;
  prevCondition: boolean;

  constructor(viewContainer: ViewContainerRef, protoViewRef: ProtoViewRef) {
    this.viewContainer = viewContainer;
    this.prevCondition = null;
    this.protoViewRef = protoViewRef;
  }

  set ngIf(newCondition /* boolean */) {
    if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
      this.prevCondition = true;
      this.viewContainer.create(this.protoViewRef);
    } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
      this.prevCondition = false;
      this.viewContainer.clear();
    }
  }
}
