import {Attribute, ComponentFactory, ComponentRef, Directive, ReflectiveInjector, ResolvedReflectiveProvider, ViewContainerRef} from '@angular/core';
import {RouterOutletMap} from '../router_outlet_map';
import {ActivatedRoute} from '../router_state';
import {PRIMARY_OUTLET} from '../shared';

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
      @Attribute('name') name: string) {
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
      factory: ComponentFactory<any>, activatedRoute: ActivatedRoute,
      providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void {
    this.outletMap = outletMap;
    this._activatedRoute = activatedRoute;
    const inj = ReflectiveInjector.fromResolvedProviders(providers, this.location.parentInjector);
    this.activated = this.location.createComponent(factory, this.location.length, inj, []);
  }
}
