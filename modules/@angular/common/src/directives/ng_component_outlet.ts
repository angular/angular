/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactoryResolver, ComponentRef, Directive, Injector, Input, OnChanges, Provider, SimpleChanges, Type, ViewContainerRef} from '@angular/core';


/**
 * Instantiates a single {@link Component} type and inserts its Host View into current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will get destroyed.
 *
 * ### Fine tune control
 *
 * You can control the component creation process by using the following optional attributes:
 *
 * * `ngOutletInjector`: Optional custom {@link Injector} that will be used as parent for the
 * Component.
 * Defaults to the injector of the current view container.
 *
 * * `ngOutletProviders`: Optional injectable objects ({@link Provider}) that are visible to the
 * component.
 *
 * * `ngOutletContent`: Optional list of projectable nodes to insert into the content
 * section of the component, if exists. ({@link NgContent}).
 *
 *
 * ### Syntax
 *
 * Simple
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
 * ```
 *
 * Customized
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   injector: injectorExpression;
 *                                   content: contentNodesExpression">
 * </ng-container>
 * ```
 *
 * # Example
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='SimpleExample'}
 *
 * A more complete example with additional options:
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='CompleteExample'}
 *
 * @experimental
 */
@Directive({selector: '[ngComponentOutlet]'})
export class NgComponentOutlet implements OnChanges {
  @Input() ngComponentOutlet: Type<any>;
  @Input() ngComponentOutletInjector: Injector;
  @Input() ngComponentOutletContent: any[][];

  componentRef: ComponentRef<any>;

  constructor(
      private _cmpFactoryResolver: ComponentFactoryResolver,
      private _viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.componentRef) {
      this._viewContainerRef.remove(this._viewContainerRef.indexOf(this.componentRef.hostView));
    }
    this._viewContainerRef.clear();
    this.componentRef = null;

    if (this.ngComponentOutlet) {
      let injector = this.ngComponentOutletInjector || this._viewContainerRef.parentInjector;

      this.componentRef = this._viewContainerRef.createComponent(
          this._cmpFactoryResolver.resolveComponentFactory(this.ngComponentOutlet),
          this._viewContainerRef.length, injector, this.ngComponentOutletContent);
    }
  }
}
