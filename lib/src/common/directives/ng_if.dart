library angular2.src.common.directives.ng_if;

import "package:angular2/src/core/metadata.dart" show Directive;
import "package:angular2/src/core/linker.dart"
    show ViewContainerRef, TemplateRef;
import "package:angular2/src/facade/lang.dart" show isBlank;

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
 *##Syntax
 *
 * - `<div *ng-if="condition">...</div>`
 * - `<div template="ng-if condition">...</div>`
 * - `<template [ng-if]="condition"><div>...</div></template>`
 */
@Directive(selector: "[ng-if]", inputs: const ["ngIf"])
class NgIf {
  ViewContainerRef _viewContainer;
  TemplateRef _templateRef;
  bool _prevCondition = null;
  NgIf(this._viewContainer, this._templateRef) {}
  set ngIf(newCondition) {
    if (newCondition &&
        (isBlank(this._prevCondition) || !this._prevCondition)) {
      this._prevCondition = true;
      this._viewContainer.createEmbeddedView(this._templateRef);
    } else if (!newCondition &&
        (isBlank(this._prevCondition) || this._prevCondition)) {
      this._prevCondition = false;
      this._viewContainer.clear();
    }
  }
}
