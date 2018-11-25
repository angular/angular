/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactoryResolver, ComponentRef} from '@angular/core';

import {RouterOutlet} from './directives/router_outlet';
import {ActivatedRoute} from './router_state';


/**
 * Store contextual information about a `RouterOutlet`
 *
 * @publicApi
 */
export class OutletContext {
  outlet: RouterOutlet|null = null;
  route: ActivatedRoute|null = null;
  resolver: ComponentFactoryResolver|null = null;
  children = new ChildrenOutletContexts();
  attachRef: ComponentRef<any>|null = null;
}

/**
 * Store contextual information about the children (= nested) `RouterOutlet`
 *
 * @publicApi
 */
export class ChildrenOutletContexts {
  // contexts for child outlets, by name.
  private contexts = new Map<string, OutletContext>();

  /** Called when a `RouterOutlet` directive is instantiated */
  onChildOutletCreated(childName: string, outlet: RouterOutlet): void {
    const context = this.getOrCreateContext(childName);
    context.outlet = outlet;
    this.contexts.set(childName, context);
  }

  /**
   * Called when a `RouterOutlet` directive is destroyed.
   * We need to keep the context as the outlet could be destroyed inside a NgIf and might be
   * re-created later.
   */
  onChildOutletDestroyed(childName: string): void {
    const context = this.getContext(childName);
    if (context) {
      context.outlet = null;
    }
  }

  /**
   * Called when the corresponding route is deactivated during navigation.
   * Because the component get destroyed, all children outlet are destroyed.
   */
  onOutletDeactivated(): Map<string, OutletContext> {
    const contexts = this.contexts;
    this.contexts = new Map();
    return contexts;
  }

  onOutletReAttached(contexts: Map<string, OutletContext>) { this.contexts = contexts; }

  getOrCreateContext(childName: string): OutletContext {
    let context = this.getContext(childName);

    if (!context) {
      context = new OutletContext();
      this.contexts.set(childName, context);
    }

    return context;
  }

  getContext(childName: string): OutletContext|null 
  {
    /*
      This method will recursively follow the "primary" RouterOutlet looking for an outlet named "childName".
      It returns the first matching outlet found (ie: the closest to the root).
      
      Original behaviour was to only look at the first level (direct content of "this.contexts"). Because of that named router-outlets would
      only work if they're introduced through the bootstraped component (AppComponent?).
    */

    const direct = this.contexts.get(childName);
    if (direct) {
      return direct;
    } else {
      const primary = this.contexts.get('primary');
      if (primary) {
        return primary.children.getContext(childName) || null;
      } else {
        return null;
      }
    }
  }
}
