/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactoryResolver, ComponentRef, Directive, EventEmitter, Injector, Input, OnDestroy, OnInit, Output, ReflectiveInjector, ResolvedReflectiveProvider, ViewContainerRef} from '@angular/core';

import {RouterOutletMap} from '../router_outlet_map';
import {ActivatedRoute} from '../router_state';
import {PRIMARY_OUTLET} from '../shared';

/**
 * @whatItDoes Acts as a placeholder that Angular dynamically fills based on the current router
 * state.
 *
 * @howToUse
 *
 * ```
 * <router-outlet></router-outlet>
 * <router-outlet name='left'></router-outlet>
 * <router-outlet name='right'></router-outlet>
 * ```
 *
 * A router outlet will emit an activate event any time a new component is being instantiated,
 * and a deactivate event when it is being destroyed.
 *
 * ```
 * <router-outlet
 *   (activate)='onActivate($event)'
 *   (deactivate)='onDeactivate($event)'></router-outlet>
 * ```
 * @selector 'a[routerLink]'
 * @ngModule RouterModule
 *
 * @stable
 */
@Directive({selector: 'router-outlet'})
export class RouterOutlet implements OnInit, OnDestroy {
  private activated: ComponentRef<any>;
  private _activatedRoute: ActivatedRoute;
  public outletMap: RouterOutletMap;
  private _name: string;

  @Output('activate') activateEvents = new EventEmitter<any>();
  @Output('deactivate') deactivateEvents = new EventEmitter<any>();

  @Input()
  set name(value: string) { this.registerOutlet(value); }

  get name() { return this._name; }

  constructor(
      private parentOutletMap: RouterOutletMap, private location: ViewContainerRef,
      private resolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
    if (!this._name) {
      this.registerOutlet(PRIMARY_OUTLET);
    }
  }

  ngOnDestroy(): void { this.parentOutletMap.removeOutlet(this.name ? this.name : PRIMARY_OUTLET); }

  get locationInjector(): Injector { return this.location.injector; }
  get locationFactoryResolver(): ComponentFactoryResolver { return this.resolver; }

  get isActivated(): boolean { return !!this.activated; }
  get component(): Object {
    if (!this.activated) throw new Error('Outlet is not activated');
    return this.activated.instance;
  }
  get activatedRoute(): ActivatedRoute {
    if (!this.activated) throw new Error('Outlet is not activated');
    return this._activatedRoute;
  }

  deactivate(): void {
    if (this.activated) {
      const c = this.component;
      this.activated.destroy();
      this.activated = null;
      this.deactivateEvents.emit(c);
    }
  }

  activate(
      activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver, injector: Injector,
      providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void {
    if (this.isActivated) {
      throw new Error('Cannot activate an already activated outlet');
    }

    this.outletMap = outletMap;
    this._activatedRoute = activatedRoute;

    const snapshot = activatedRoute._futureSnapshot;
    const component: any = <any>snapshot._routeConfig.component;
    const factory = resolver.resolveComponentFactory(component);

    const inj = ReflectiveInjector.fromResolvedProviders(providers, injector);
    this.activated = this.location.createComponent(factory, this.location.length, inj, []);
    this.activated.changeDetectorRef.detectChanges();

    this.activateEvents.emit(this.activated.instance);
  }

  private registerOutlet(name: string): void {
    if (this._name && this.parentOutletMap._outlets[this._name] === this) {
      this.parentOutletMap.removeOutlet(this._name);
    }
    this._name = name ? name : PRIMARY_OUTLET;
    this.parentOutletMap.registerOutlet(this._name, this);
  }
}
