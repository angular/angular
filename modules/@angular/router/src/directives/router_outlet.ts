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
import {isPresent, isBlank} from '@angular/facade/src/lang';

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

  get loadedComponent(): Object { return isPresent(this._loaded) ? this._loaded.instance : null; }

  get isLoaded(): boolean { return isPresent(this._loaded); }

  load(factory: ComponentFactory<any>, providers: ResolvedReflectiveProvider[],
       outletMap: RouterOutletMap): ComponentRef<any> {
    this.outletMap = outletMap;
    let inj = ReflectiveInjector.fromResolvedProviders(providers, this._location.parentInjector);
    this._loaded = this._location.createComponent(factory, this._location.length, inj, []);
    return this._loaded;
  }
}
