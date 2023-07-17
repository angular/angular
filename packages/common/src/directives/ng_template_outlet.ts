/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EmbeddedViewRef, Injector, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

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
@Directive({
  selector: '[ngTemplateOutlet]',
  standalone: true,
})
export class NgTemplateOutlet<C = unknown> implements OnChanges {
  private _viewRef: EmbeddedViewRef<C>|null = null;

  /**
   * A context object to attach to the {@link EmbeddedViewRef}. This should be an
   * object, the object's keys will be available for binding by the local template `let`
   * declarations.
   * Using the key `$implicit` in the context object will set its value as default.
   */
  @Input() public ngTemplateOutletContext: C|null = null;

  /**
   * A string defining the template reference and optionally the context object for the template.
   */
  @Input() public ngTemplateOutlet: TemplateRef<C>|null = null;

  /** Injector to be used within the embedded view. */
  @Input() public ngTemplateOutletInjector: Injector|null = null;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['ngTemplateOutlet'] || changes['ngTemplateOutletInjector']) {
      const viewContainerRef = this._viewContainerRef;

      if (this._viewRef) {
        viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
      }

      if (this.ngTemplateOutlet) {
        const {
          ngTemplateOutlet: template,
          ngTemplateOutletContext: context,
          ngTemplateOutletInjector: injector,
        } = this;
        this._viewRef =
            viewContainerRef.createEmbeddedView(
                template, context, injector ? {injector} : undefined) as EmbeddedViewRef<C>;
      } else {
        this._viewRef = null;
      }
    } else if (
        this._viewRef && changes['ngTemplateOutletContext'] && this.ngTemplateOutletContext) {
      this._viewRef.context = this.ngTemplateOutletContext;
    }
  }
}
