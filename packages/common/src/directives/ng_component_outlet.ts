/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentRef, createNgModule, Directive, Injector, Input, NgModuleFactory, NgModuleRef, OnChanges, OnDestroy, SimpleChanges, Type, ViewContainerRef} from '@angular/core';


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
export class NgComponentOutlet implements OnChanges, OnDestroy {
  @Input() ngComponentOutlet: Type<any>|null = null;

  @Input() ngComponentOutletInjector?: Injector;
  @Input() ngComponentOutletContent?: any[][];

  @Input() ngComponentOutletNgModule?: Type<any>;
  /**
   * @deprecated This input is deprecated, use `ngComponentOutletNgModule` instead.
   */
  @Input() ngComponentOutletNgModuleFactory?: NgModuleFactory<any>;

  private _componentRef: ComponentRef<any>|undefined;
  private _moduleRef: NgModuleRef<any>|undefined;

  constructor(private _viewContainerRef: ViewContainerRef) {}

  /** @nodoc */
  ngOnChanges(changes: SimpleChanges) {
    const {
      _viewContainerRef: viewContainerRef,
      ngComponentOutletNgModule: ngModule,
      ngComponentOutletNgModuleFactory: ngModuleFactory,
    } = this;
    viewContainerRef.clear();
    this._componentRef = undefined;

    if (this.ngComponentOutlet) {
      const injector = this.ngComponentOutletInjector || viewContainerRef.parentInjector;

      if (changes['ngComponentOutletNgModule'] || changes['ngComponentOutletNgModuleFactory']) {
        if (this._moduleRef) this._moduleRef.destroy();

        if (ngModule) {
          this._moduleRef = createNgModule(ngModule, getParentInjector(injector));
        } else if (ngModuleFactory) {
          this._moduleRef = ngModuleFactory.create(getParentInjector(injector));
        } else {
          this._moduleRef = undefined;
        }
      }

      this._componentRef = viewContainerRef.createComponent(this.ngComponentOutlet, {
        index: viewContainerRef.length,
        injector,
        ngModuleRef: this._moduleRef,
        projectableNodes: this.ngComponentOutletContent,
      });
    }
  }

  /** @nodoc */
  ngOnDestroy() {
    if (this._moduleRef) this._moduleRef.destroy();
  }
}

// Helper function that returns an Injector instance of a parent NgModule.
function getParentInjector(injector: Injector): Injector {
  const parentNgModule = injector.get(NgModuleRef);
  return parentNgModule.injector;
}
