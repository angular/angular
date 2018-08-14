/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';


/**
 * Exposes a stored expression value to its child view.
 *
 * `ngLet` evaluates the expression and, if stored in a variable, provides the result to its child view.
 *
 *
 * @usageNotes
 *
 * ### Storing falsy result in a variable
 *
 * `ngIf` supports the common use case of storing a value in a variable and exposing it to its child view.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfAs'}
 *
 * This works well for most cases. However, if the value stored is falsy (ie. `false`, `0`, `''`, etc)
 * the child view will not be rendered. This can be problematic if the stored value is required to be displayed,
 * or provided as an argument to an output or DOM event.
 *
 * `ngLet` works around this issue by always rendering the child view, regardless of the result of its expression.
 *
 * ### Semantic meaning
 *
 * Even in the cases where `ngIf` works, some semantic meaning is lost. Reading the code doesn't communicate whether
 * the auther intended contitional rendering or simply needed to expose the result of the expression to its child view.
 *
 * `ngLet` explicitly communicates semantic meaning, illustrating that the intent of the author's code was to expose the
 * result of the expression, not conditional rendering.
 *
 * ### Syntax
 *
 * Simple form:
 * - `<div *ngLet="condition as value">{{value}}</div>`
 * - `<ng-template [ngLet]="condition as value"><div>{{value}}</div></ng-template>`
 *
 *
 */
@Directive({ selector: '[ngLet]' })
export class NgLet {
  private _context: NgLetContext = new NgLetContext();

  constructor(
    private _viewContainer: ViewContainerRef,
    private _templateRef: TemplateRef<NgLetContext>,
  ) {}

  @Input()
  set ngLet(condition: any) {
    this._context.$implicit = this._context.ngLet = condition;
    this._viewContainer.clear();
    this._viewContainer.createEmbeddedView(this._templateRef, this._context);
  }
}

export class NgLetContext {
  public $implicit: any = null;
  public ngLet: any = null;
}
