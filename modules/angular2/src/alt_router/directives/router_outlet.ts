import {
  ResolvedReflectiveProvider,
  Directive,
  DynamicComponentLoader,
  ViewContainerRef,
  Input,
  ComponentRef,
  ComponentFactory,
  ReflectiveInjector
} from 'angular2/core';
import {RouterOutletMap} from '../router';
import {isPresent} from 'angular2/src/facade/lang';

@Directive({selector: 'router-outlet'})
export class RouterOutlet {
  private _loaded: ComponentRef;
  public outletMap: RouterOutletMap;
  @Input() name: string = "";

  constructor(parentOutletMap: RouterOutletMap, private _location: ViewContainerRef) {
    parentOutletMap.registerOutlet("", this);
  }

  load(factory: ComponentFactory, providers: ResolvedReflectiveProvider[],
       outletMap: RouterOutletMap): ComponentRef {
    if (isPresent(this._loaded)) {
      this._loaded.destroy();
    }
    this.outletMap = outletMap;
    let inj = ReflectiveInjector.fromResolvedProviders(providers, this._location.parentInjector);
    this._loaded = this._location.createComponent(factory, this._location.length, inj, []);
    return this._loaded;
  }
}