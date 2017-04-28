/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentRef, ComponentFactoryResolver} from '@angular/core';
import {RouterOutlet} from './directives/router_outlet';
import {ActivatedRoute} from './router_state';


/**
 * @whatItDoes Contains all the router outlets created in a component.
 *
 * @stable
 */
export class RouterOutletMap {
  /** @internal */
  _outlets: {[name: string]: ProxyRouterOutlet} = {};

  /**
   * Adds an outlet to this map.
   */
  registerOutlet(name: string, outlet: RouterOutlet): void {
    let proxyOutlet = this._outlets[name];
    if (proxyOutlet) {
      proxyOutlet.setOutlet(outlet);
    } else {
      this._outlets[name] = new ProxyRouterOutlet(name, this, outlet);
    }
  }

  /**
   * Removes an outlet from this map.
   */
  removeOutlet(name: string): void { this._outlets[name] = undefined !; }

  /** @internal */
  _getOutlet(name: string): IRouterOutlet {
    let outlet = this._outlets[name];
    if (!outlet) {
      outlet = this._outlets[name] = new ProxyRouterOutlet(name, this, null);
    }
    return outlet;
  }
}

export interface IRouterOutlet {
  readonly isActivated: boolean;
  readonly component: any;
  readonly outletMap: RouterOutletMap;

  activateWith(
    activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver|null,
    outletMap: RouterOutletMap): void;
  deactivate(): void;
  attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute): void;
  detach(): ComponentRef<any>;
}

export class ProxyRouterOutlet implements IRouterOutlet {
  delayApplys: Array<(delegate: IRouterOutlet) => void> = [];

  get isActivated(): boolean {
    return this.delegate!.isActivated;
  };
  get component(): any {
    return this.delegate!.component;
  }

  constructor(public name: string, public outletMap: RouterOutletMap, private delegate: IRouterOutlet|null) {
  }

  setOutlet(delegate: IRouterOutlet): void {
    this.delegate = delegate;
    this.delayApplys.forEach((fn) => fn(delegate));
  }

  apply(applyFn: (delegate: IRouterOutlet) => void) {
    this.delegate ? applyFn(this.delegate) : this.delayApplys.push(applyFn);
  }

  activateWith(
    activatedRoute: ActivatedRoute, resolver: ComponentFactoryResolver|null,
    outletMap: RouterOutletMap): void {
    this.apply((delegate: IRouterOutlet) => delegate.activateWith(activatedRoute, resolver, outletMap));
  }

  deactivate(): void {
    this.apply((delegate: IRouterOutlet) => delegate.deactivate());
  }

  attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute): void {
    return this.delegate!.attach(ref, activatedRoute);
  }

  detach(): ComponentRef<any> {
    return this.delegate!.detach();
  }

}
