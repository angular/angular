/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactoryResolver, ComponentRef, Directive, EventEmitter, Injector, Input, OnChanges, Output, Provider, ReflectiveInjector, SimpleChange, SimpleChanges, TemplateRef, Type, ViewContainerRef} from '@angular/core';

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
 * * `ngOutletProjectableNodes`: Optional list of projectable nodes to insert into the content
 * section
 * of the component, if exists. ({@link NgContent}).
 *
 * ### Events
 * The `ngOutletCreated` event stream fires with a {@link ComponentRef} when a new component
 * instantiates.
 * The event is fired before the first change detection pass, i.e: before `ngOnInit`. Using the
 * {@link ComponentRef}
 * you can access the instance and set values on the instance, this can come in handy when the
 * component
 * retrieves data from attributes on the host.
 *
 * ### Syntax
 *
 * Simple
 * ```
 * <template [ngComponentOutlet]="componentTypeExpression"></template>
 * ```
 *
 * Customized
 * ```
 * <template [ngComponentOutlet]="componentTypeExpression"
 *           [ngOutletInjector]="injectorExpression"
 *           [ngOutletProviders]="providersExpression"
 *           [ngOutletProjectableNodes]="projectableNodesExpression">
 * </template>
 * ```
 *
 * @experimental
 */
@Directive({selector: 'template[ngComponentOutlet]'})
export class NgComponentOutlet implements OnChanges {
  @Input() ngComponentOutlet: Type<any>;
  @Input() ngOutletInjector: Injector;
  @Input() ngOutletProviders: Provider[];
  @Input() ngOutletProjectableNodes: any[][];

  @Output()
  ngOutletCreated = new EventEmitter<ComponentRef<any>>(false);

  constructor(
      private _cmpFactoryResolver: ComponentFactoryResolver,
      private _viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('ngComponentOutlet')) {
      this._viewContainerRef.clear();

      if (this.ngComponentOutlet) {
        let injector = this.ngOutletInjector || this._viewContainerRef.parentInjector;

        if (Array.isArray(this.ngOutletProviders) && this.ngOutletProviders.length > 0) {
          injector = ReflectiveInjector.resolveAndCreate(this.ngOutletProviders, injector);
        }

        const cmpRef = this._viewContainerRef.createComponent(
            this._cmpFactoryResolver.resolveComponentFactory(this.ngComponentOutlet),
            this._viewContainerRef.length, injector, this.ngOutletProjectableNodes);

        this.ngOutletCreated.emit(cmpRef);
      }
    }
  }
}
