/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, ComponentFactoryResolver, ComponentRef, Directive, EventEmitter, Injector, OnDestroy, Output, ReflectiveInjector, ResolvedReflectiveProvider, ViewContainerRef} from '@angular/core';
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
 * @ngModule RouterModule
 *
 * @stable
 */
@Directive({selector: 'router-outlet'})
export class RouterOutlet implements OnDestroy {
  private activated: ComponentRef<any>;
  private _activatedRoute: ActivatedRoute;
  public outletMap: RouterOutletMap;

  @Output('activate') activateEvents = new EventEmitter<any>();
  @Output('deactivate') deactivateEvents = new EventEmitter<any>();

  constructor(
      private parentOutletMap: RouterOutletMap, private location: ViewContainerRef,
      private resolver: ComponentFactoryResolver, @Attribute('name') private name: string) {
    parentOutletMap.registerOutlet(name ? name : PRIMARY_OUTLET, this);
  }

  ngOnDestroy(): void { this.parentOutletMap.removeOutlet(this.name ? this.name : PRIMARY_OUTLET); }

  /** @deprecated since v4 **/
  get locationInjector(): Injector { return this.location.injector; }
  /** @deprecated since v4 **/
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

  detach(): ComponentRef<any> {
    if (!this.activated) throw new Error('Outlet is not activated');
    this.location.detach();
    const r = this.activated;
    this.activated = null !;
    this._activatedRoute = null !;
    return r;
  }

  attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute) {
    this.activated = ref;
    this._activatedRoute = activatedRoute;
    this.location.insert(ref.hostView);
  }

  deactivate(): void {
    if (this.activated) {
      const c = this.component;
      this.activated.destroy();
      this.activated = null !;
      this._activatedRoute = null !;
      this.deactivateEvents.emit(c);
    }
  }

  /** @deprecated since v4, use {@link #activateWith} */
  activate(
      activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver, injector: Injector,
      providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void {
    if (this.isActivated) {
      throw new Error('Cannot activate an already activated outlet');
    }

    this.outletMap = outletMap;
    this._activatedRoute = activatedRoute;

    const snapshot = activatedRoute._futureSnapshot;
    const component: any = <any>snapshot._routeConfig !.component;
    const factory = resolver.resolveComponentFactory(component) !;

    const inj = ReflectiveInjector.fromResolvedProviders(providers, injector);

    this.activated = this.location.createComponent(factory, this.location.length, inj, []);
    this.activated.changeDetectorRef.detectChanges();

    this.activateEvents.emit(this.activated.instance);
  }

  activateWith(
      activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver|null,
      outletMap: RouterOutletMap) {
    if (this.isActivated) {
      throw new Error('Cannot activate an already activated outlet');
    }

    this.outletMap = outletMap;
    this._activatedRoute = activatedRoute;

    const snapshot = activatedRoute._futureSnapshot;
    const component = <any>snapshot._routeConfig !.component;

    resolver = resolver || this.resolver;
    const factory = resolver.resolveComponentFactory(component) !;

    const injector = new OutletInjector(activatedRoute, outletMap, this.location.injector);

    this.activated = this.location.createComponent(factory, this.location.length, injector, []);
    this.activated.changeDetectorRef.detectChanges();

    this.activateEvents.emit(this.activated.instance);
  }
}

class OutletInjector implements Injector {
  constructor(
      private route: ActivatedRoute, private map: RouterOutletMap, private parent: Injector) {}

  get(token: any, notFoundValue?: any): any {
    if (token === ActivatedRoute) {
      return this.route;
    }

    if (token === RouterOutletMap) {
      return this.map;
    }

    return this.parent.get(token, notFoundValue);
  }
}