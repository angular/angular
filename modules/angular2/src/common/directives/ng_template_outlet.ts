import {Directive, Input, ViewContainerRef, ViewRef, TemplateRef} from 'angular2/core';
import {isPresent} from 'angular2/src/facade/lang';

/**
 * Creates and inserts an embedded view based on a prepared `TemplateRef`.
 *
 * ### Syntax
 * - `<template [ngTemplateOutlet]="templateRefExpression"></template>`
 */
@Directive({selector: '[ngTemplateOutlet]'})
export class NgTemplateOutlet {
  private _insertedViewRef: ViewRef;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  @Input()
  set ngTemplateOutlet(templateRef: TemplateRef) {
    if (isPresent(this._insertedViewRef)) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._insertedViewRef));
    }

    if (isPresent(templateRef)) {
      this._insertedViewRef = this._viewContainerRef.createEmbeddedView(templateRef);
    }
  }
}
