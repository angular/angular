/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, Injector, Input, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, NgModuleFactory, NgModuleRef, OnChanges, OnDestroy, SimpleChanges, StaticProvider, Type, ViewContainerRef} from '@angular/core';

/**
 * Instantiates a single {@link Component} type and inserts its Host View into current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will get destroyed.
 *
 * @usageNotes
 *
 * ### Fine tune control
 *
 * You can control the component creation process by using the following optional attributes:
 *
 * * `ngComponentOutletInjector`: Optional custom {@link Injector} that will be used as parent for
 * the Component. Defaults to the injector of the current view container.
 *
 * * `ngComponentOutletContent`: Optional list of projectable nodes to insert into the content
 * section of the component, if exists.
 *
 * * `ngComponentOutletNgModuleFactory`: Optional module factory to allow dynamically loading other
 * module, then load a component from that module.
 *
 * ### Syntax
 *
 * Simple
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
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
 * Customized ngModuleFactory
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   ngModuleFactory: moduleFactory;">
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
@Directive({selector: '[ngComponentOutlet]'})
export class NgComponentOutlet implements OnChanges, OnDestroy {
  // TODO(issue/24571): remove '!'.
  @Input() ngComponentOutlet!: Type<any>;
  // TODO(issue/24571): remove '!'.
  @Input() ngComponentOutletInjector!: Injector;
  // TODO(issue/24571): remove '!'.
  @Input() ngComponentOutletContent!: any[][];
  // TODO(issue/24571): remove '!'.
  @Input() ngComponentOutletNgModuleFactory!: NgModuleFactory<any>;
  @Input() ngComponentOutletInput: {[key: string]: any} = {};
  @Input() ngComponentOutletOutput: {[key: string]: any} = {};

  private _componentRef: ComponentRef<any>|null = null;
  private _moduleRef: NgModuleRef<any>|null = null;
  private _componentFactory: ComponentFactory<any>|null = null;
  private _disposables: (() => void)[] = [];

  constructor(private _viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this._hasOnlyBindingChange(changes)) {
      this._updateBindings(changes);
      return;
    }

    this._updateComponent(changes);
  }

  private _updateComponent(changes: SimpleChanges) {
    this._viewContainerRef.clear();
    this._componentRef = null;

    if (this.ngComponentOutlet) {
      const elInjector = this.ngComponentOutletInjector || this._viewContainerRef.parentInjector;

      if (changes['ngComponentOutletNgModuleFactory']) {
        if (this._moduleRef) this._moduleRef.destroy();

        if (this.ngComponentOutletNgModuleFactory) {
          const parentModule = elInjector.get(NgModuleRef);
          this._moduleRef = this.ngComponentOutletNgModuleFactory.create(parentModule.injector);
        } else {
          this._moduleRef = null;
        }
      }

      const componentFactoryResolver = this._moduleRef ? this._moduleRef.componentFactoryResolver :
                                                         elInjector.get(ComponentFactoryResolver);

      this._componentFactory =
          componentFactoryResolver.resolveComponentFactory(this.ngComponentOutlet);

      this._componentRef = this._viewContainerRef.createComponent(
          this._componentFactory!, this._viewContainerRef.length, elInjector,
          this.ngComponentOutletContent);
      this._updateInputs();
      this._updateOutputs();
    }
  }

  private _hasOnlyBindingChange(changes: SimpleChanges) {
    const bindings = new Set(['ngComponentOutletInput', 'ngComponentOutletOutput']);
    return Object.keys(changes).every(change => bindings.has(change));
  }

  private _updateBindings(changes: SimpleChanges) {
    if (!this.ngComponentOutlet) {
      return;
    }

    if (changes['ngComponentOutletInput']) {
      this._updateInputs();
    }

    if (changes['ngComponentOutletOutput']) {
      this._updateOutputs();
    }
  }

  private _updateInputs() {
    if (!this.ngComponentOutletInput) {
      return;
    }

    this._componentFactory!.inputs.forEach(({propName, templateName}) => {
      const inputValue = this.ngComponentOutletInput[templateName];
      if (inputValue !== undefined) {
        this._componentRef!.instance[propName] = inputValue;
      }
    });
  }

  private _updateOutputs() {
    if (!this.ngComponentOutletOutput) {
      return;
    }

    this._componentFactory!.outputs.forEach(({propName, templateName}, index) => {
      const eventHandler = this.ngComponentOutletOutput[templateName];
      if (eventHandler !== undefined) {
        const subscription = this._componentRef!.instance[propName].subscribe(eventHandler);
        this._disposables[index] = subscription.unsubscribe.bind(subscription);
      }
    });
  }

  ngOnDestroy() {
    if (this._moduleRef) this._moduleRef.destroy();
    if (this._disposables) this._disposables.forEach(disposable => disposable());
  }
}
