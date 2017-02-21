/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EmbeddedViewRef, Input, OnChanges, Optional, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

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
 * ```
 * <ng-container *ngTemplateOutlet="let item; context: itemContext">
 *     {{item.name}}
 * </ng-container>
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
 * # Example
 *
 * {@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * @experimental
 */
@Directive({selector: '[ngTemplateOutlet]'})
export class NgTemplateOutlet implements OnChanges {
  private _viewRef: EmbeddedViewRef<any>;
  private _injectedTemplateRef: TemplateRef<any>;

  @Input() public ngTemplateOutletContext: Object;

  @Input()
  public set ngTemplateOutlet(value: TemplateRef<any>) {
    if (value) {
      this._templateRef = value;
    } else {
      this._templateRef = this._injectedTemplateRef;
    }
  }

  constructor(
      private _viewContainerRef: ViewContainerRef,
      @Optional() private _templateRef: TemplateRef<any>) {
    this._injectedTemplateRef = _templateRef;
  }

  /**
   * @deprecated v4.0.0 - Renamed to ngTemplateOutletContext.
   */
  @Input()
  set ngOutletContext(context: Object) { this.ngTemplateOutletContext = context; }

  ngOnChanges(changes: SimpleChanges) {
    if (this._viewRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
    }

    if (this._templateRef) {
      this._viewRef = this._viewContainerRef.createEmbeddedView(
          this._templateRef, this.ngTemplateOutletContext);
    }
  }
}
