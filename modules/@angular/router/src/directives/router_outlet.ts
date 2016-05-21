import {
  ResolvedReflectiveProvider,
  Directive,
  DynamicComponentLoader,
  ViewContainerRef,
  Attribute,
  ComponentRef,
  ComponentFactory,
  ReflectiveInjector,
  OnInit
} from '@angular/core';
import {RouterOutletMap, RouteSegmentContainer} from '../router';
import {RouteSegment} from '../segments';
import {DEFAULT_OUTLET_NAME} from '../constants';
import {isPresent, isBlank} from '../facade/lang';

/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 *
 * Outlets can be named.
 *
 * ```
 * <router-outlet name="right"></router-outlet>
 * ```
 */
@Directive({selector: 'router-outlet'})
export class RouterOutlet implements RouteSegmentContainer {
  public routeSegment: RouteSegment;
  private _activated: ComponentRef<any>;
  public outletMap: RouterOutletMap;

  constructor(parentOutletMap: RouterOutletMap, private _location: ViewContainerRef,
              @Attribute('name') name: string) {
    parentOutletMap.registerOutlet(isBlank(name) ? DEFAULT_OUTLET_NAME : name, this);
  }

  deactivate(): void {
    this._activated.destroy();
    this._activated = null;
    this.routeSegment = null;
  }

  /**
   * Returns the loaded component.
   */
  get component(): any { return isPresent(this._activated) ? this._activated.instance : null; }

  /**
   * Returns true is the outlet is not empty.
   */
  get isActivated(): boolean { return isPresent(this._activated); }

  /**
   * Called by the Router to instantiate a new component.
   */
  activate(factory: ComponentFactory<any>, routeSegment: RouteSegment,
           providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): ComponentRef<any> {
    this.routeSegment = routeSegment;
    this.outletMap = outletMap;
    let inj = ReflectiveInjector.fromResolvedProviders(providers, this._location.parentInjector);
    this._activated = this._location.createComponent(factory, this._location.length, inj, []);
    return this._activated;
  }
}
