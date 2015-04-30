import {Directive} from 'angular2/src/core/annotations_impl/annotations';
import {ViewContainerRef} from 'angular2/src/core/compiler/view_container_ref';
import {ProtoViewRef} from 'angular2/src/core/compiler/view_ref';
import {isBlank} from 'angular2/src/facade/lang';

/**
 * Removes or recreates a portion of the DOM tree based on an {expression}.
 *
 * If the expression assigned to `if` evaluates to a false value then the element is removed from the
 * DOM, otherwise a clone of the element is reinserted into the DOM.
 *
 * # Example:
 *
 * ```
 * <div *if="errorCount > 0" class="error">
 *   <!-- Error message displayed when the errorCount property on the current context is greater than 0. -->
 *   {{errorCount}} errors detected
 * </div>
 * ```
 *
 * # Syntax
 *
 * - `<div *if="condition">...</div>`
 * - `<div template="if condition">...</div>`
 * - `<template [if]="condition"><div>...</div></template>`
 *
 * @exportedAs angular2/directives
 */
@Directive({
  selector: '[if]',
  properties: {
    'condition': 'if'
  }
})
export class If {
  viewContainer: ViewContainerRef;
  protoViewRef: ProtoViewRef;
  prevCondition: boolean;

  constructor(viewContainer: ViewContainerRef, protoViewRef:ProtoViewRef) {
    this.viewContainer = viewContainer;
    this.prevCondition = null;
    this.protoViewRef = protoViewRef;
  }

  set condition(newCondition /* boolean */) {
    if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
      this.prevCondition = true;
      this.viewContainer.create(this.protoViewRef);
    } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
      this.prevCondition = false;
      this.viewContainer.clear();
    }
  }
}
