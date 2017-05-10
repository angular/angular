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
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * @description
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * Note: using the key `$implicit` in the context object will set it's value as default.
 *
 * ## Example
 *
 * {@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * @experimental
 */
@Directive({selector: '[ngTemplateOutlet]'})
export class NgTemplateOutlet implements OnChanges {
  private _viewRef: EmbeddedViewRef<any>;

  @Input() public ngTemplateOutletContext: Object;

  @Input() public ngTemplateOutlet: TemplateRef<any>;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  /**
   * @deprecated v4.0.0 - Renamed to ngTemplateOutletContext.
   */
  @Input()
  set ngOutletContext(context: Object) { this.ngTemplateOutletContext = context; }

  ngOnChanges(changes: SimpleChanges) {
    if (this._viewRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
    }

    if (this.ngTemplateOutlet) {
      this._viewRef = this._viewContainerRef.createEmbeddedView(
          this.ngTemplateOutlet, this.ngTemplateOutletContext);
    }
  }
}
