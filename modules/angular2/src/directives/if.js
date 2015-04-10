import {Viewport} from 'angular2/src/core/annotations/annotations';
import {ViewContainer} from 'angular2/src/core/compiler/view_container';
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
@Viewport({
  selector: '[if]',
  properties: {
    'condition': 'if'
  }
})
export class If {
  viewContainer: ViewContainer;
  prevCondition: boolean;

  constructor(viewContainer: ViewContainer) {
    this.viewContainer = viewContainer;
    this.prevCondition = null;
  }

  set condition(newCondition) {
    if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
      this.prevCondition = true;
      this.viewContainer.create();
    } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
      this.prevCondition = false;
      this.viewContainer.clear();
    }
  }
}
