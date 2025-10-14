/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
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
let NgComponentOutlet = class NgComponentOutlet {
  /**
   * Gets the instance of the currently-rendered component.
   * Will be null if no component has been rendered.
   */
  get componentInstance() {
    return this._componentRef?.instance ?? null;
  }
  constructor(_viewContainerRef) {
    this._viewContainerRef = _viewContainerRef;
    // TODO(crisbeto): this should be `Type<T>`, but doing so broke a few
    // targets in a TGP so we need to do it in a major version.
    /** Component that should be rendered in the outlet. */
    this.ngComponentOutlet = null;
    /**
     * A helper data structure that allows us to track inputs that were part of the
     * ngComponentOutletInputs expression. Tracking inputs is necessary for proper removal of ones
     * that are no longer referenced.
     */
    this._inputsUsed = new Map();
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
__decorate([Input()], NgComponentOutlet.prototype, 'ngComponentOutlet', void 0);
__decorate([Input()], NgComponentOutlet.prototype, 'ngComponentOutletInputs', void 0);
__decorate([Input()], NgComponentOutlet.prototype, 'ngComponentOutletInjector', void 0);
__decorate([Input()], NgComponentOutlet.prototype, 'ngComponentOutletEnvironmentInjector', void 0);
__decorate([Input()], NgComponentOutlet.prototype, 'ngComponentOutletContent', void 0);
__decorate([Input()], NgComponentOutlet.prototype, 'ngComponentOutletNgModule', void 0);
NgComponentOutlet = __decorate(
  [
    Directive({
      selector: '[ngComponentOutlet]',
      exportAs: 'ngComponentOutlet',
    }),
  ],
  NgComponentOutlet,
);
export {NgComponentOutlet};
// Helper function that returns an Injector instance of a parent NgModule.
function getParentInjector(injector) {
  const parentNgModule = injector.get(NgModuleRef);
  return parentNgModule.injector;
}
//# sourceMappingURL=ng_component_outlet.js.map
