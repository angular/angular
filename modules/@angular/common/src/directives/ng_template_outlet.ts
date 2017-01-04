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
  @Input() ngTemplateOutlet: TemplateRef<Object>;
  @Input() ngOutletContext: any;

  private _viewRef: EmbeddedViewRef<any>;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('ngTemplateOutlet' in changes) {
      if (this._viewRef) {
        this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
        this._viewRef = null;
      }

      if (this.ngTemplateOutlet) {
        this._viewRef =
            this._viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, this.ngOutletContext);
      }
    } else if (('ngOutletContext' in changes) && this._viewRef) {
      Object.keys(this.ngOutletContext).forEach((key: string) => {
        this._viewRef.context[key] = this.ngOutletContext[key];
      });
      this._viewRef.context.$implicit = this.ngOutletContext;
    }
  }
}
