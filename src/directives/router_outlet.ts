import {Injector, Directive, ViewContainerRef, Attribute, ComponentRef, ComponentFactory, ResolvedReflectiveProvider, ReflectiveInjector} from '@angular/core';
import {RouterOutletMap} from '../router_outlet_map';
import {PRIMARY_OUTLET} from '../shared';

@Directive({selector: 'router-outlet'})
export class RouterOutlet {
  private activated:ComponentRef<any>|null;
  public outletMap:RouterOutletMap;

  constructor(parentOutletMap:RouterOutletMap, private location:ViewContainerRef,
              @Attribute('name') name:string, public injector: Injector) {
    parentOutletMap.registerOutlet(name ? name : PRIMARY_OUTLET, this);
  }

  get isActivated(): boolean { return !!this.activated; }
  get component(): Object {
    if (!this.activated) throw new Error("Outlet is not activated");
    return this.activated.instance;
  }

  deactivate(): void {
    if (this.activated) {
      this.activated.destroy();
      this.activated = null;
    }
  }

  activate(factory: ComponentFactory<any>, providers: ResolvedReflectiveProvider[],
           outletMap: RouterOutletMap): void {
    this.outletMap = outletMap;
    let inj = ReflectiveInjector.fromResolvedProviders(providers, this.location.parentInjector);
    this.activated = this.location.createComponent(factory, this.location.length, inj, []);
  }
}
