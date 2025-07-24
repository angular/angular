/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  EmbeddedViewRef,
  Injector,
  Input,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

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
 * ```html
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
})
export class NgTemplateOutlet<C = unknown> implements OnChanges {
  private _viewRef: EmbeddedViewRef<C> | null = null;

  /**
   * A context object to attach to the {@link EmbeddedViewRef}. This should be an
   * object, the object's keys will be available for binding by the local template `let`
   * declarations.
   * Using the key `$implicit` in the context object will set its value as default.
   */
  @Input() public ngTemplateOutletContext: C | null | undefined = null;

  /**
   * A string defining the template reference and optionally the context object for the template.
   */
  @Input() public ngTemplateOutlet: TemplateRef<C> | null | undefined = null;

  /** Injector to be used within the embedded view. */
  @Input() public ngTemplateOutletInjector: Injector | null | undefined = null;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this._shouldRecreateView(changes)) {
      const viewContainerRef = this._viewContainerRef;

      if (this._viewRef) {
        viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
      }

      // If there is no outlet, clear the destroyed view ref.
      if (!this.ngTemplateOutlet) {
        this._viewRef = null;
        return;
      }

      // Create a context forward `Proxy` that will always bind to the user-specified context,
      // without having to destroy and re-create views whenever the context changes.
      const viewContext = this._createContextForwardProxy();
      this._viewRef = viewContainerRef.createEmbeddedView(this.ngTemplateOutlet, viewContext, {
        injector: this.ngTemplateOutletInjector ?? undefined,
      });
    }
  }

  /**
   * We need to re-create existing embedded view if either is true:
   * - the outlet changed.
   * - the injector changed.
   */
  private _shouldRecreateView(changes: SimpleChanges): boolean {
    return !!changes['ngTemplateOutlet'] || !!changes['ngTemplateOutletInjector'];
  }

  /**
   * For a given outlet instance, we create a proxy object that delegates
   * to the user-specified context. This allows changing, or swapping out
   * the context object completely without having to destroy/re-create the view.
   */
  private _createContextForwardProxy(): C {
    return <C>new Proxy(
      {},
      {
        set: (_target, prop, newValue) => {
          if (!this.ngTemplateOutletContext) {
            return false;
          }
          return Reflect.set(this.ngTemplateOutletContext, prop, newValue);
        },
        get: (_target, prop, receiver) => {
          if (!this.ngTemplateOutletContext) {
            return undefined;
          }
          return Reflect.get(this.ngTemplateOutletContext, prop, receiver);
        },
      },
    );
  }
}
