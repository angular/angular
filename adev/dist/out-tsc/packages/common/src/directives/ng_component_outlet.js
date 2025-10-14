/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {createNgModule, Directive, Input, NgModuleRef} from '@angular/core';
/**
 * Instantiates a {@link /api/core/Component Component} type and inserts its Host View into the current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will be destroyed.
 *
 * @usageNotes
 *
 * ### Fine tune control
 *
 * You can control the component creation process by using the following optional attributes:
 *
 * * `ngComponentOutletInputs`: Optional component inputs object, which will be bind to the
 * component.
 *
 * * `ngComponentOutletInjector`: Optional custom {@link Injector} that will be used as parent for
 * the Component. Defaults to the injector of the current view container.
 *
 * * `ngComponentOutletEnvironmentInjector`: Optional custom {@link EnvironmentInjector} which will
 * provide the component's environment.
 *
 * * `ngComponentOutletContent`: Optional list of projectable nodes to insert into the content
 * section of the component, if it exists.
 *
 * * `ngComponentOutletNgModule`: Optional NgModule class reference to allow loading another
 * module dynamically, then loading a component from that module.
 *
 * * `ngComponentOutletNgModuleFactory`: Deprecated config option that allows providing optional
 * NgModule factory to allow loading another module dynamically, then loading a component from that
 * module. Use `ngComponentOutletNgModule` instead.
 *
 * ### Syntax
 *
 * Simple
 * ```html
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
 * ```
 *
 * With inputs
 * ```html
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   inputs: inputsExpression;">
 * </ng-container>
 * ```
 *
 * Customized injector/content
 * ```html
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   injector: injectorExpression;
 *                                   content: contentNodesExpression;">
 * </ng-container>
 * ```
 *
 * Customized NgModule reference
 * ```html
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   ngModule: ngModuleClass;">
 * </ng-container>
 * ```
 *
 * ### A simple example
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='SimpleExample'}
 *
 * A more complete example with additional options:
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='CompleteExample'}
 *
 * @publicApi
 * @ngModule CommonModule
 */
let NgComponentOutlet = (() => {
  let _classDecorators = [
    Directive({
      selector: '[ngComponentOutlet]',
      exportAs: 'ngComponentOutlet',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _ngComponentOutlet_decorators;
  let _ngComponentOutlet_initializers = [];
  let _ngComponentOutlet_extraInitializers = [];
  let _ngComponentOutletInputs_decorators;
  let _ngComponentOutletInputs_initializers = [];
  let _ngComponentOutletInputs_extraInitializers = [];
  let _ngComponentOutletInjector_decorators;
  let _ngComponentOutletInjector_initializers = [];
  let _ngComponentOutletInjector_extraInitializers = [];
  let _ngComponentOutletEnvironmentInjector_decorators;
  let _ngComponentOutletEnvironmentInjector_initializers = [];
  let _ngComponentOutletEnvironmentInjector_extraInitializers = [];
  let _ngComponentOutletContent_decorators;
  let _ngComponentOutletContent_initializers = [];
  let _ngComponentOutletContent_extraInitializers = [];
  let _ngComponentOutletNgModule_decorators;
  let _ngComponentOutletNgModule_initializers = [];
  let _ngComponentOutletNgModule_extraInitializers = [];
  var NgComponentOutlet = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _ngComponentOutlet_decorators = [Input()];
      _ngComponentOutletInputs_decorators = [Input()];
      _ngComponentOutletInjector_decorators = [Input()];
      _ngComponentOutletEnvironmentInjector_decorators = [Input()];
      _ngComponentOutletContent_decorators = [Input()];
      _ngComponentOutletNgModule_decorators = [Input()];
      __esDecorate(
        null,
        null,
        _ngComponentOutlet_decorators,
        {
          kind: 'field',
          name: 'ngComponentOutlet',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngComponentOutlet' in obj,
            get: (obj) => obj.ngComponentOutlet,
            set: (obj, value) => {
              obj.ngComponentOutlet = value;
            },
          },
          metadata: _metadata,
        },
        _ngComponentOutlet_initializers,
        _ngComponentOutlet_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngComponentOutletInputs_decorators,
        {
          kind: 'field',
          name: 'ngComponentOutletInputs',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngComponentOutletInputs' in obj,
            get: (obj) => obj.ngComponentOutletInputs,
            set: (obj, value) => {
              obj.ngComponentOutletInputs = value;
            },
          },
          metadata: _metadata,
        },
        _ngComponentOutletInputs_initializers,
        _ngComponentOutletInputs_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngComponentOutletInjector_decorators,
        {
          kind: 'field',
          name: 'ngComponentOutletInjector',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngComponentOutletInjector' in obj,
            get: (obj) => obj.ngComponentOutletInjector,
            set: (obj, value) => {
              obj.ngComponentOutletInjector = value;
            },
          },
          metadata: _metadata,
        },
        _ngComponentOutletInjector_initializers,
        _ngComponentOutletInjector_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngComponentOutletEnvironmentInjector_decorators,
        {
          kind: 'field',
          name: 'ngComponentOutletEnvironmentInjector',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngComponentOutletEnvironmentInjector' in obj,
            get: (obj) => obj.ngComponentOutletEnvironmentInjector,
            set: (obj, value) => {
              obj.ngComponentOutletEnvironmentInjector = value;
            },
          },
          metadata: _metadata,
        },
        _ngComponentOutletEnvironmentInjector_initializers,
        _ngComponentOutletEnvironmentInjector_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngComponentOutletContent_decorators,
        {
          kind: 'field',
          name: 'ngComponentOutletContent',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngComponentOutletContent' in obj,
            get: (obj) => obj.ngComponentOutletContent,
            set: (obj, value) => {
              obj.ngComponentOutletContent = value;
            },
          },
          metadata: _metadata,
        },
        _ngComponentOutletContent_initializers,
        _ngComponentOutletContent_extraInitializers,
      );
      __esDecorate(
        null,
        null,
        _ngComponentOutletNgModule_decorators,
        {
          kind: 'field',
          name: 'ngComponentOutletNgModule',
          static: false,
          private: false,
          access: {
            has: (obj) => 'ngComponentOutletNgModule' in obj,
            get: (obj) => obj.ngComponentOutletNgModule,
            set: (obj, value) => {
              obj.ngComponentOutletNgModule = value;
            },
          },
          metadata: _metadata,
        },
        _ngComponentOutletNgModule_initializers,
        _ngComponentOutletNgModule_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      NgComponentOutlet = _classThis = _classDescriptor.value;
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
    // TODO(crisbeto): this should be `Type<T>`, but doing so broke a few
    // targets in a TGP so we need to do it in a major version.
    /** Component that should be rendered in the outlet. */
    ngComponentOutlet = __runInitializers(this, _ngComponentOutlet_initializers, null);
    ngComponentOutletInputs =
      (__runInitializers(this, _ngComponentOutlet_extraInitializers),
      __runInitializers(this, _ngComponentOutletInputs_initializers, void 0));
    ngComponentOutletInjector =
      (__runInitializers(this, _ngComponentOutletInputs_extraInitializers),
      __runInitializers(this, _ngComponentOutletInjector_initializers, void 0));
    ngComponentOutletEnvironmentInjector =
      (__runInitializers(this, _ngComponentOutletInjector_extraInitializers),
      __runInitializers(this, _ngComponentOutletEnvironmentInjector_initializers, void 0));
    ngComponentOutletContent =
      (__runInitializers(this, _ngComponentOutletEnvironmentInjector_extraInitializers),
      __runInitializers(this, _ngComponentOutletContent_initializers, void 0));
    ngComponentOutletNgModule =
      (__runInitializers(this, _ngComponentOutletContent_extraInitializers),
      __runInitializers(this, _ngComponentOutletNgModule_initializers, void 0));
    _componentRef = __runInitializers(this, _ngComponentOutletNgModule_extraInitializers);
    _moduleRef;
    /**
     * A helper data structure that allows us to track inputs that were part of the
     * ngComponentOutletInputs expression. Tracking inputs is necessary for proper removal of ones
     * that are no longer referenced.
     */
    _inputsUsed = new Map();
    /**
     * Gets the instance of the currently-rendered component.
     * Will be null if no component has been rendered.
     */
    get componentInstance() {
      return this._componentRef?.instance ?? null;
    }
    constructor(_viewContainerRef) {
      this._viewContainerRef = _viewContainerRef;
    }
    _needToReCreateNgModuleInstance(changes) {
      // Note: square brackets property accessor is safe for Closure compiler optimizations (the
      // `changes` argument of the `ngOnChanges` lifecycle hook retains the names of the fields that
      // were changed).
      return (
        changes['ngComponentOutletNgModule'] !== undefined ||
        changes['ngComponentOutletNgModuleFactory'] !== undefined
      );
    }
    _needToReCreateComponentInstance(changes) {
      // Note: square brackets property accessor is safe for Closure compiler optimizations (the
      // `changes` argument of the `ngOnChanges` lifecycle hook retains the names of the fields that
      // were changed).
      return (
        changes['ngComponentOutlet'] !== undefined ||
        changes['ngComponentOutletContent'] !== undefined ||
        changes['ngComponentOutletInjector'] !== undefined ||
        changes['ngComponentOutletEnvironmentInjector'] !== undefined ||
        this._needToReCreateNgModuleInstance(changes)
      );
    }
    /** @docs-private */
    ngOnChanges(changes) {
      if (this._needToReCreateComponentInstance(changes)) {
        this._viewContainerRef.clear();
        this._inputsUsed.clear();
        this._componentRef = undefined;
        if (this.ngComponentOutlet) {
          const injector = this.ngComponentOutletInjector || this._viewContainerRef.parentInjector;
          if (this._needToReCreateNgModuleInstance(changes)) {
            this._moduleRef?.destroy();
            if (this.ngComponentOutletNgModule) {
              this._moduleRef = createNgModule(
                this.ngComponentOutletNgModule,
                getParentInjector(injector),
              );
            } else {
              this._moduleRef = undefined;
            }
          }
          this._componentRef = this._viewContainerRef.createComponent(this.ngComponentOutlet, {
            injector,
            ngModuleRef: this._moduleRef,
            projectableNodes: this.ngComponentOutletContent,
            environmentInjector: this.ngComponentOutletEnvironmentInjector,
          });
        }
      }
    }
    /** @docs-private */
    ngDoCheck() {
      if (this._componentRef) {
        if (this.ngComponentOutletInputs) {
          for (const inputName of Object.keys(this.ngComponentOutletInputs)) {
            this._inputsUsed.set(inputName, true);
          }
        }
        this._applyInputStateDiff(this._componentRef);
      }
    }
    /** @docs-private */
    ngOnDestroy() {
      this._moduleRef?.destroy();
    }
    _applyInputStateDiff(componentRef) {
      for (const [inputName, touched] of this._inputsUsed) {
        if (!touched) {
          // The input that was previously active no longer exists and needs to be set to undefined.
          componentRef.setInput(inputName, undefined);
          this._inputsUsed.delete(inputName);
        } else {
          // Since touched is true, it can be asserted that the inputs object is not empty.
          componentRef.setInput(inputName, this.ngComponentOutletInputs[inputName]);
          this._inputsUsed.set(inputName, false);
        }
      }
    }
  };
  return (NgComponentOutlet = _classThis);
})();
export {NgComponentOutlet};
// Helper function that returns an Injector instance of a parent NgModule.
function getParentInjector(injector) {
  const parentNgModule = injector.get(NgModuleRef);
  return parentNgModule.injector;
}
//# sourceMappingURL=ng_component_outlet.js.map
