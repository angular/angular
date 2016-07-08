/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, EventEmitter, NoComponentFactoryError, Output, ReflectiveInjector, ResolvedReflectiveProvider, ViewContainerRef} from '@angular/core';

import {RouterOutletMap} from '../router_outlet_map';
import {ActivatedRoute} from '../router_state';
import {PRIMARY_OUTLET} from '../shared';


/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Example
 *
 * ```
 * <router-outlet></router-outlet>
 * <router-outlet name="left"></router-outlet>
 * <router-outlet name="right"></router-outlet>
 * ```
 *
 * A router outlet will emit an activate event any time a new component is being instantiated,
 * and a deactivate event when it is being destroyed.
 *
 * ## Example
 *
 * ```
 * <router-outlet (activate)="onActivate($event)"
 * (deactivate)="onDeactivate($event)"></router-outlet>
 * ```
 *
 * @stable
 */
@Directive({selector: 'router-outlet'})
export class RouterOutlet {
  private activated: ComponentRef<any>;
  private _activatedRoute: ActivatedRoute;
  public outletMap: RouterOutletMap;

  @Output('activate') activateEvents = new EventEmitter<any>();
  @Output('deactivate') deactivateEvents = new EventEmitter<any>();

  constructor(
      parentOutletMap: RouterOutletMap, private location: ViewContainerRef,
      private resolver: ComponentFactoryResolver, @Attribute('name') name: string) {
    parentOutletMap.registerOutlet(name ? name : PRIMARY_OUTLET, this);
  }

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
      activatedRoute: ActivatedRoute, loadedResolver: ComponentFactoryResolver,
      providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void {
    this.outletMap = outletMap;
    this._activatedRoute = activatedRoute;

    const snapshot = activatedRoute._futureSnapshot;
    const component: any = <any>snapshot._routeConfig.component;

    let factory: ComponentFactory<any>;
    try {
      if (typeof component === 'string') {
        factory = snapshot._resolvedComponentFactory;
      } else if (loadedResolver) {
        factory = loadedResolver.resolveComponentFactory(component);
      } else {
        factory = this.resolver.resolveComponentFactory(component);
      }
    } catch (e) {
      if (!(e instanceof NoComponentFactoryError)) throw e;
      const componentName = component ? component.name : null;
      console.warn(
          `'${componentName}' not found in precompile array.  To ensure all components referred
          to by the Routes are compiled, you must add '${componentName}' to the
          'precompile' array of your application component. This will be required in a future
          release of the router.`);
      factory = snapshot._resolvedComponentFactory;
    }

    const inj = ReflectiveInjector.fromResolvedProviders(providers, this.location.parentInjector);
    this.activated = this.location.createComponent(factory, this.location.length, inj, []);
    this.activated.changeDetectorRef.detectChanges();

    this.activateEvents.emit(this.activated.instance);
  }
}
