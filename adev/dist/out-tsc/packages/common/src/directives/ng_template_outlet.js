/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, Input} from '@angular/core';
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
let NgTemplateOutlet = (() => {
  let _classDecorators = [
    Directive({
      selector: '[ngTemplateOutlet]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _ngTemplateOutletContext_decorators;
  let _ngTemplateOutletContext_initializers = [];
  let _ngTemplateOutletContext_extraInitializers = [];
  let _ngTemplateOutlet_decorators;
  let _ngTemplateOutlet_initializers = [];
  let _ngTemplateOutlet_extraInitializers = [];
  let _ngTemplateOutletInjector_decorators;
  let _ngTemplateOutletInjector_initializers = [];
  let _ngTemplateOutletInjector_extraInitializers = [];
  var NgTemplateOutlet = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _ngTemplateOutletContext_decorators = [Input()];
      _ngTemplateOutlet_decorators = [Input()];
      _ngTemplateOutletInjector_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _ngTemplateOutletContext_decorators,
        {
          kind: 'field',
          name: 'ngTemplateOutletContext',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngTemplateOutletContext' in obj,
            get: (obj) => obj.ngTemplateOutletContext,
            set: (obj, value) => {
              obj.ngTemplateOutletContext = value;
            },
          },
          metadata: _metadata,
        },
        _ngTemplateOutletContext_initializers,
        _ngTemplateOutletContext_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngTemplateOutlet_decorators,
        {
          kind: 'field',
          name: 'ngTemplateOutlet',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngTemplateOutlet' in obj,
            get: (obj) => obj.ngTemplateOutlet,
            set: (obj, value) => {
              obj.ngTemplateOutlet = value;
            },
          },
          metadata: _metadata,
        },
        _ngTemplateOutlet_initializers,
        _ngTemplateOutlet_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngTemplateOutletInjector_decorators,
        {
          kind: 'field',
          name: 'ngTemplateOutletInjector',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngTemplateOutletInjector' in obj,
            get: (obj) => obj.ngTemplateOutletInjector,
            set: (obj, value) => {
              obj.ngTemplateOutletInjector = value;
            },
          },
          metadata: _metadata,
        },
        _ngTemplateOutletInjector_initializers,
        _ngTemplateOutletInjector_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NgTemplateOutlet = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _viewContainerRef;
    _viewRef = null;
    /**
     * A context object to attach to the {@link EmbeddedViewRef}. This should be an
     * object, the object's keys will be available for binding by the local template `let`
     * declarations.
     * Using the key `$implicit` in the context object will set its value as default.
     */
    ngTemplateOutletContext = __runInitializers(this, _ngTemplateOutletContext_initializers, null);
    /**
     * A string defining the template reference and optionally the context object for the template.
     */
    ngTemplateOutlet =
      (__runInitializers(this, _ngTemplateOutletContext_extraInitializers),
      __runInitializers(this, _ngTemplateOutlet_initializers, null));
    /** Injector to be used within the embedded view. */
    ngTemplateOutletInjector =
      (__runInitializers(this, _ngTemplateOutlet_extraInitializers),
      __runInitializers(this, _ngTemplateOutletInjector_initializers, null));
    constructor(_viewContainerRef) {
      __runInitializers(this, _ngTemplateOutletInjector_extraInitializers);
      this._viewContainerRef = _viewContainerRef;
    }
    ngOnChanges(changes) {
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
    _shouldRecreateView(changes) {
      return !!changes['ngTemplateOutlet'] || !!changes['ngTemplateOutletInjector'];
    }
    /**
     * For a given outlet instance, we create a proxy object that delegates
     * to the user-specified context. This allows changing, or swapping out
     * the context object completely without having to destroy/re-create the view.
     */
    _createContextForwardProxy() {
      return new Proxy(
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
  };
  return (NgTemplateOutlet = _classThis);
})();
export {NgTemplateOutlet};
//# sourceMappingURL=ng_template_outlet.js.map
