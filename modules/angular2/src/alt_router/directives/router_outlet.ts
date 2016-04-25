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
} from 'angular2/core';
import {RouterOutletMap} from '../router';
import {DEFAULT_OUTLET_NAME} from '../constants';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

@Directive({selector: 'router-outlet'})
export class RouterOutlet {
  private _loaded: ComponentRef;
  public outletMap: RouterOutletMap;

  constructor(parentOutletMap: RouterOutletMap, private _location: ViewContainerRef,
              @Attribute('name') name: string) {
    parentOutletMap.registerOutlet(isBlank(name) ? DEFAULT_OUTLET_NAME : name, this);
  }

  unload(): void {
    this._loaded.destroy();
    this._loaded = null;
  }

  load(factory: ComponentFactory, providers: ResolvedReflectiveProvider[],
       outletMap: RouterOutletMap): ComponentRef {
    if (isPresent(this._loaded)) {
      this.unload();
    }
    this.outletMap = outletMap;
    let inj = ReflectiveInjector.fromResolvedProviders(providers, this._location.parentInjector);
    this._loaded = this._location.createComponent(factory, this._location.length, inj, []);
    return this._loaded;
  }
}