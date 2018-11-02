/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EmbeddedViewRef, Input, OnChanges, SimpleChange, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Inserts an embedded view from a prepared `TemplateRef`.
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * @usageNotes
 * ```
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * Using the key `$implicit` in the context object will set its value as default.
 *
 * ### Example
 *
 * {@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * @publicApi
 */
@Directive({selector: '[ngTemplateOutlet]'})
export class NgTemplateOutlet implements OnChanges {
  // TODO(issue/24571): remove '!'.
  private _viewRef !: EmbeddedViewRef<any>;

  // TODO(issue/24571): remove '!'.
  @Input() public ngTemplateOutletContext !: Object;

  // TODO(issue/24571): remove '!'.
  @Input() public ngTemplateOutlet !: TemplateRef<any>;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    const recreateView = this._shouldRecreateView(changes);

    if (recreateView) {
      if (this._viewRef) {
        this._viewContainerRef.remove(this._viewContainerRef.indexOf(this._viewRef));
      }

      if (this.ngTemplateOutlet) {
        this._viewRef = this._viewContainerRef.createEmbeddedView(
            this.ngTemplateOutlet, this.ngTemplateOutletContext);
      }
    } else {
      if (this._viewRef && this.ngTemplateOutletContext) {
        this._updateExistingContext(this.ngTemplateOutletContext);
      }
    }
  }

  /**
   * We need to re-create existing embedded view if:
   * - templateRef has changed
   * - context has changes
   *
   * We mark context object as changed when the corresponding object
   * shape changes (new properties are added or existing properties are removed).
   * In other words we consider context with the same properties as "the same" even
   * if object reference changes (see https://github.com/angular/angular/issues/13407).
   */
  private _shouldRecreateView(changes: SimpleChanges): boolean {
    const ctxChange = changes['ngTemplateOutletContext'];
    return !!changes['ngTemplateOutlet'] || (ctxChange && this._hasContextShapeChanged(ctxChange));
  }

  private _hasContextShapeChanged(ctxChange: SimpleChange): boolean {
    const prevCtxKeys = Object.keys(ctxChange.previousValue || {});
    const currCtxKeys = Object.keys(ctxChange.currentValue || {});

    if (prevCtxKeys.length === currCtxKeys.length) {
      for (let propName of currCtxKeys) {
        if (prevCtxKeys.indexOf(propName) === -1) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }

  private _updateExistingContext(ctx: Object): void {
    for (let propName of Object.keys(ctx)) {
      (<any>this._viewRef.context)[propName] = (<any>this.ngTemplateOutletContext)[propName];
    }
  }
}
