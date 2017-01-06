/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EmbeddedViewRef, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * @ngModule CommonModule
 *
 * @whatItDoes Inserts an embedded view from a prepared `TemplateRef`
 *
 * @howToUse
 * ```
 * <template [ngTemplateOutlet]="templateRefExpression"
 *           [ngOutletContext]="objectExpression">
 * </template>
 * ```
 *
 * @description
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngOutletContext]`.
 * `[ngOutletContext]` should be an object, the object's keys will be the local template variables
 * available within the `TemplateRef`.
 *
 * Note: using the key `$implicit` in the context object will set it's value as default.
 *
 * @experimental
 */
@Directive({selector: '[ngTemplateOutlet]'})
export class NgTemplateOutlet implements OnChanges {
  private _viewRef: EmbeddedViewRef<any>;
  private _context: Object;
  private _templateRef: TemplateRef<any>;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  @Input()
  set ngOutletContext(context: Object) { this._context = context; }

  @Input()
  set ngTemplateOutlet(templateRef: TemplateRef<Object>) { this._templateRef = templateRef; }

  ngOnChanges(changes: SimpleChanges) {
    if (this._viewRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
    }

    if (this._templateRef) {
      this._viewRef = this._viewContainerRef.createEmbeddedView(this._templateRef, this._context);
    }
  }
}
