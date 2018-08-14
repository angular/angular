/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * This is a directive to store data in a local variable
 * I developped it from angular's ngIf directive.
 * https://github.com/angular/angular/blob/6.1.1/packages/common/src/directives/ng_if.ts
 *
 * ## Storing result in a variable
 *
 * A common pattern is that we need to show a set of properties from the same object. If the
 * object is undefined, then we have to use the safe-traversal-operator `?.` to guard against
 * dereferencing a `null` value. This is especially the case when waiting on async data such as
 * when using the `async` pipe as shown in following example:
 *
 * ```
 * Hello {{ (userStream|async)?.last }}, {{ (userStream|async)?.first }}!
 * ```
 * There are several inefficiencies in the above example:
 *  - We create multiple subscriptions on `userStream`. One for each `async` pipe, or two in the
 *    example above.
 *  - We have to use the safe-traversal-operator `?.` to access properties, which is cumbersome.
 *  - We have to place the `async` pipe in parenthesis.
 *
 * A better way to do this is to use `ngIf` and store the result of the condition in a local
 */

@Directive({selector: '[ngLet]'})
export class NgLet {
  private _context: NgLetContext = new NgLetContext();
  private _thenTemplateRef: TemplateRef<NgLetContext>|null = null;
  private _thenViewRef: EmbeddedViewRef<NgLetContext>|null = null;

  constructor(private _viewContainer: ViewContainerRef, templateRef: TemplateRef<NgLetContext>) {
    this._thenTemplateRef = templateRef;
  }

  @Input()
  set ngLet(condition: any) {
    this._context.$implicit = this._context.ngLet = condition;
    this._updateView();
  }

  private _updateView() {
    if (!this._thenViewRef) {
      this._viewContainer.clear();
      if (this._thenTemplateRef) {
        this._thenViewRef =
            this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
      }
    }
  }
}

export class NgLetContext {
  public $implicit: any = null;
  public ngLet: any = null;
}
