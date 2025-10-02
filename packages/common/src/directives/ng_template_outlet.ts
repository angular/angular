/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  effect,
  EmbeddedViewRef,
  inject,
  Injector,
  input,
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
export class NgTemplateOutlet<C = unknown> {
  private _viewRef: EmbeddedViewRef<C> | null = null;

  /**
   * A context object to attach to the {@link EmbeddedViewRef}. This should be an
   * object, the object's keys will be available for binding by the local template `let`
   * declarations.
   * Using the key `$implicit` in the context object will set its value as default.
   */
  public ngTemplateOutletContext = input<C | null | undefined>(null);

  /**
   * A string defining the template reference and optionally the context object for the template.
   */
  public ngTemplateOutlet = input<TemplateRef<C> | null | undefined>(null);

  /** Injector to be used within the embedded view. */
  public ngTemplateOutletInjector = input<Injector | null | undefined>(null);

  private readonly _viewContainerRef = inject(ViewContainerRef);

  constructor() {
    // Set up an effect to react to input changes
    effect(() => {
      // Track only the signals that require view recreation
      const outlet = this.ngTemplateOutlet();
      const injector = this.ngTemplateOutletInjector();

      // Reconstruct the view when outlet or injector changes
      if (this._shouldRecreateView(outlet, injector)) {
        const viewContainerRef = this._viewContainerRef;

        if (this._viewRef) {
          viewContainerRef.remove(viewContainerRef.indexOf(this._viewRef));
        }

        // If there is no outlet, clear the destroyed view ref.
        if (!outlet) {
          this._viewRef = null;
          return;
        }

        // Create a context forward `Proxy` that will always bind to the user-specified context,
        // without having to destroy and re-create views whenever the context changes.
        const viewContext = this._createContextForwardProxy();
        this._viewRef = viewContainerRef.createEmbeddedView(outlet, viewContext, {
          injector: injector ?? undefined,
        });
      }
    });
  }

  /**
   * We need to re-create existing embedded view if either is true:
   * - the outlet changed.
   * - the injector changed.
   */
  private _shouldRecreateView(
    outlet: TemplateRef<C> | null | undefined,
    injector: Injector | null | undefined,
  ): boolean {
    // Store previous values to detect changes
    const outletChanged = this._previousOutlet !== outlet;
    const injectorChanged = this._previousInjector !== injector;

    this._previousOutlet = outlet;
    this._previousInjector = injector;

    return outletChanged || injectorChanged;
  }

  private _previousOutlet: TemplateRef<C> | null | undefined = null;
  private _previousInjector: Injector | null | undefined = null;

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
          const context = this.ngTemplateOutletContext();
          if (!context) {
            return false;
          }
          return Reflect.set(context, prop, newValue);
        },
        get: (_target, prop, receiver) => {
          const context = this.ngTemplateOutletContext();
          if (!context) {
            return undefined;
          }
          return Reflect.get(context, prop, receiver);
        },
      },
    );
  }
}
