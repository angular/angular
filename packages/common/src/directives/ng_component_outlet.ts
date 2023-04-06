/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentRef, createNgModule, Directive, DoCheck, Injector, Input, NgModuleFactory, NgModuleRef, OnChanges, OnDestroy, SimpleChanges, Type, ViewContainerRef} from '@angular/core';

/**
 * Represents internal object used to track state of each component input.
 */
interface ComponentInputState {
  /**
   * Track whether the input exists in the current object bound to the component input;
   * inputs that are not present any more can be removed from the internal data structures.
   */
  touched: boolean;
}

/**
 * Instantiates a {@link Component} type and inserts its Host View into the current View.
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
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
 * ```
 *
 * With inputs
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   inputs: inputsExpression;">
 * </ng-container>
 * ```
 *
 * Customized injector/content
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   injector: injectorExpression;
 *                                   content: contentNodesExpression;">
 * </ng-container>
 * ```
 *
 * Customized NgModule reference
 * ```
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
@Directive({
  selector: '[ngComponentOutlet]',
  standalone: true,
})
export class NgComponentOutlet implements OnChanges, DoCheck, OnDestroy {
  @Input() ngComponentOutlet: Type<any>|null = null;

  @Input() ngComponentOutletInputs?: Record<string, unknown>;
  @Input() ngComponentOutletInjector?: Injector;
  @Input() ngComponentOutletContent?: any[][];

  @Input() ngComponentOutletNgModule?: Type<any>;
  /**
   * @deprecated This input is deprecated, use `ngComponentOutletNgModule` instead.
   */
  @Input() ngComponentOutletNgModuleFactory?: NgModuleFactory<any>;

  private _componentRef: ComponentRef<any>|undefined;
  private _moduleRef: NgModuleRef<any>|undefined;

  private inputStateMap = new Map<string, ComponentInputState>();

  constructor(private _viewContainerRef: ViewContainerRef) {}

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges) {
    const {
      ngComponentOutlet: componentTypeChange,
      ngComponentOutletContent: contentChange,
      ngComponentOutletInjector: injectorChange,
      ngComponentOutletNgModule: ngModuleChange,
      ngComponentOutletNgModuleFactory: ngModuleFactoryChange,
    } = changes;

    const {
      _viewContainerRef: viewContainerRef,
      ngComponentOutlet: componentType,
      ngComponentOutletContent: content,
      ngComponentOutletNgModule: ngModule,
      ngComponentOutletNgModuleFactory: ngModuleFactory,
    } = this;

    if (componentTypeChange || contentChange || injectorChange || ngModuleChange ||
        ngModuleFactoryChange) {
      viewContainerRef.clear();
      this._componentRef = undefined;

      if (componentType) {
        const injector = this.ngComponentOutletInjector || viewContainerRef.parentInjector;

        if (ngModuleChange || ngModuleFactoryChange) {
          this._moduleRef?.destroy();

          if (ngModule) {
            this._moduleRef = createNgModule(ngModule, getParentInjector(injector));
          } else if (ngModuleFactory) {
            this._moduleRef = ngModuleFactory.create(getParentInjector(injector));
          } else {
            this._moduleRef = undefined;
          }
        }

        this._componentRef = viewContainerRef.createComponent(componentType, {
          index: viewContainerRef.length,
          injector,
          ngModuleRef: this._moduleRef,
          projectableNodes: content,
        });
      }
    }
  }

  /** @nodoc */
  ngDoCheck() {
    const {
      _componentRef: componentRef,
      ngComponentOutletInputs: inputs,
    } = this;

    if (componentRef) {
      if (inputs) {
        for (const inputName of Object.keys(inputs)) {
          this._updateInputState(inputName);
        }
      }

      this._applyInputStateDiff(componentRef);
    }
  }

  /** @nodoc */
  ngOnDestroy() {
    this._moduleRef?.destroy();
  }

  private _updateInputState(inputName: string) {
    const state = this.inputStateMap.get(inputName);
    if (state) {
      state.touched = true;
    } else {
      this.inputStateMap.set(inputName, {touched: true});
    }
  }

  private _applyInputStateDiff(componentRef: ComponentRef<unknown>) {
    for (const [inputName, state] of this.inputStateMap) {
      if (!state.touched) {
        // The input that was previously active no longer exists and needs to be set to undefined.
        componentRef.setInput(inputName, undefined);
        this.inputStateMap.delete(inputName);
      } else {
        // Since touched is true, it can be asserted that the inputs object is not empty.
        componentRef.setInput(inputName, this.ngComponentOutletInputs![inputName]);
      }

      state.touched = false;
    }
  }
}

// Helper function that returns an Injector instance of a parent NgModule.
function getParentInjector(injector: Injector): Injector {
  const parentNgModule = injector.get(NgModuleRef);
  return parentNgModule.injector;
}
