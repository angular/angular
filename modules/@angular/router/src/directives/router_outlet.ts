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
import {RouterOutletMap} from '../router';
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
export class RouterOutlet {
  private _loaded: ComponentRef<any>;
  public outletMap: RouterOutletMap;

  constructor(parentOutletMap: RouterOutletMap, private _location: ViewContainerRef,
              @Attribute('name') name: string) {
    parentOutletMap.registerOutlet(isBlank(name) ? DEFAULT_OUTLET_NAME : name, this);
  }

  unload(): void {
    this._loaded.destroy();
    this._loaded = null;
  }

  /**
   * Returns the loaded component.
   */
  get loadedComponent(): Object { return isPresent(this._loaded) ? this._loaded.instance : null; }

  /**
   * Returns true is the outlet is not empty.
   */
  get isLoaded(): boolean { return isPresent(this._loaded); }

  /**
   * Called by the Router to instantiate a new component.
   */
  load(factory: ComponentFactory<any>, providers: ResolvedReflectiveProvider[],
       outletMap: RouterOutletMap): ComponentRef<any> {
    this.outletMap = outletMap;
    let inj = ReflectiveInjector.fromResolvedProviders(providers, this._location.parentInjector);
    this._loaded = this._location.createComponent(factory, this._location.length, inj, []);
    return this._loaded;
  }
}
