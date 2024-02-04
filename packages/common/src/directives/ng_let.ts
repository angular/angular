/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * The `*ngLet` directive it's a structural directive for
 * sharing data as local variable into html component template.
 *
 * @usageNotes
 *
 * ### As syntax
 *
 * Example with "as" syntax
 *
 * ```
 * <ng-container *ngLet="(num1 + num2) as total">
 *    <div>
 *       1: {{ total }}
 *    </div>
 *    <div>
 *       2: {{ total }}
 *    </div>
 * </ng-container>
 *
 * ### Implicit syntax
 *
 * Example with "implicit" syntax
 *
 * ```
 * <ng-container *ngLet="(num1 + num2); let total">
 *    <div>
 *       1: {{ total }}
 *    </div>
 *    <div>
 *       2: {{ total }}
 *    </div>
 * </ng-container>
 * ```
 * @ngModule CommonModule
 * @publicApi
 */
@Directive({
  selector: '[ngLet]',
  standalone: true,
})
export class NgLet<T = unknown> {
  private _context: NgLetContext<T> = new NgLetContext<T>();
  private _templateRef: TemplateRef<NgLetContext<T>> | null = null;
  private _hasView = false;

  constructor(
    private _viewContainer: ViewContainerRef,
    templateRef: TemplateRef<NgLetContext<T>>,
  ) {
    this._templateRef = templateRef;
  }

  /**
   * The value to share into the template.
   */
  @Input()
  set ngLet(value: T) {
    this._context.$implicit = this._context.ngLet = value;
    if (!this._hasView && this._templateRef) {
      this._hasView = true;
      this._viewContainer.createEmbeddedView(this._templateRef, this._context);
    }
  }

  /** @internal */
  public static ngLetUseIfTypeGuard: void;

  /**
   * Assert the correct type of the expression bound to the `NgLet` input within the template.
   *
   * The presence of this static field is a signal to the Ivy template type check compiler that
   * when the `NgLet` structural directive renders its template, the type of the expression bound
   * to `NgLet` should be narrowed in some way. For `NgLet`, the binding expression itself is used to
   * narrow its type, which allows the strictNullChecks feature of TypeScript to work with `NgLet`.
   */
  static ngTemplateGuard_ngLet: 'binding';

  /**
   * Asserts the correct type of the context for the template that `NgLet` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgLet` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(dir: NgLet<T>, ctx: any): ctx is NgLetContext<T> {
    return true;
  }
}

/**
 * @publicApi
 */
export class NgLetContext<T = unknown> {
  public $implicit: T = null!;
  public ngLet: T = null!;
}
