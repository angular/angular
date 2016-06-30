/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, ComponentFactory, ComponentFactoryResolver, ComponentRef, Directive, NoComponentFactoryError, ReflectiveInjector, ResolvedReflectiveProvider, ViewContainerRef} from '@angular/core';

import {RouterOutletMap} from '../router_outlet_map';
import {ActivatedRoute} from '../router_state';
import {PRIMARY_OUTLET} from '../shared';

/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * <router-outlet name="left"></router-outlet>
 * <router-outlet name="right"></router-outlet>
 * ```
 *
 * @stable
 */
@Directive({selector: 'router-outlet'})
export class RouterOutlet {
  private activated: ComponentRef<any>;
  private _activatedRoute: ActivatedRoute;
  public outletMap: RouterOutletMap;

  /**
   * @internal
   */
  constructor(
      parentOutletMap: RouterOutletMap, private location: ViewContainerRef,
      private componentFactoryResolver: ComponentFactoryResolver, @Attribute('name') name: string) {
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
      this.activated.destroy();
      this.activated = null;
    }
  }

  activate(
      activatedRoute: ActivatedRoute, providers: ResolvedReflectiveProvider[],
      outletMap: RouterOutletMap): void {
    this.outletMap = outletMap;
    this._activatedRoute = activatedRoute;

    const snapshot = activatedRoute._futureSnapshot;
    const component: any = <any>snapshot._routeConfig.component;

    let factory: ComponentFactory<any>;
    try {
      factory = typeof component === 'string' ?
          snapshot._resolvedComponentFactory :
          this.componentFactoryResolver.resolveComponentFactory(component);
    } catch (e) {
      if (!(e instanceof NoComponentFactoryError)) throw e;

      // TODO: vsavkin uncomment this once CompoentResolver is deprecated
      // const componentName = component ? component.name : null;
      // console.warn(
      //     `'${componentName}' not found in precompile array.  To ensure all components referred
      //     to by the RouterConfig are compiled, you must add '${componentName}' to the
      //     'precompile' array of your application component. This will be required in a future
      //     release of the router.`);

      factory = snapshot._resolvedComponentFactory;
    }

    const inj = ReflectiveInjector.fromResolvedProviders(providers, this.location.parentInjector);
    this.activated = this.location.createComponent(factory, this.location.length, inj, []);
  }
}
