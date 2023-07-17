/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MonoTypeOperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';

import {ActivationEnd, ChildActivationEnd, Event} from '../events';
import {NavigationTransition} from '../navigation_transition';
import {DetachedRouteHandleInternal, RouteReuseStrategy} from '../route_reuse_strategy';
import {ChildrenOutletContexts} from '../router_outlet_context';
import {ActivatedRoute, advanceActivatedRoute, RouterState} from '../router_state';
import {getClosestRouteInjector} from '../utils/config';
import {nodeChildrenAsMap, TreeNode} from '../utils/tree';

let warnedAboutUnsupportedInputBinding = false;

export const activateRoutes =
    (rootContexts: ChildrenOutletContexts, routeReuseStrategy: RouteReuseStrategy,
     forwardEvent: (evt: Event) => void,
     inputBindingEnabled: boolean): MonoTypeOperatorFunction<NavigationTransition> => map(t => {
      new ActivateRoutes(
          routeReuseStrategy, t.targetRouterState!, t.currentRouterState, forwardEvent,
          inputBindingEnabled)
          .activate(rootContexts);
      return t;
    });

export class ActivateRoutes {
  constructor(
      private routeReuseStrategy: RouteReuseStrategy, private futureState: RouterState,
      private currState: RouterState, private forwardEvent: (evt: Event) => void,
      private inputBindingEnabled: boolean) {}

  activate(parentContexts: ChildrenOutletContexts): void {
    const futureRoot = this.futureState._root;
    const currRoot = this.currState ? this.currState._root : null;

    this.deactivateChildRoutes(futureRoot, currRoot, parentContexts);
    advanceActivatedRoute(this.futureState.root);
    this.activateChildRoutes(futureRoot, currRoot, parentContexts);
  }

  // De-activate the child route that are not re-used for the future state
  private deactivateChildRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>|null,
      contexts: ChildrenOutletContexts): void {
    const children: {[outletName: string]: TreeNode<ActivatedRoute>} = nodeChildrenAsMap(currNode);

    // Recurse on the routes active in the future state to de-activate deeper children
    futureNode.children.forEach(futureChild => {
      const childOutletName = futureChild.value.outlet;
      this.deactivateRoutes(futureChild, children[childOutletName], contexts);
      delete children[childOutletName];
    });

    // De-activate the routes that will not be re-used
    Object.values(children).forEach((v: TreeNode<ActivatedRoute>) => {
      this.deactivateRouteAndItsChildren(v, contexts);
    });
  }

  private deactivateRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
      parentContext: ChildrenOutletContexts): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;

    if (future === curr) {
      // Reusing the node, check to see if the children need to be de-activated
      if (future.component) {
        // If we have a normal route, we need to go through an outlet.
        const context = parentContext.getContext(future.outlet);
        if (context) {
          this.deactivateChildRoutes(futureNode, currNode, context.children);
        }
      } else {
        // if we have a componentless route, we recurse but keep the same outlet map.
        this.deactivateChildRoutes(futureNode, currNode, parentContext);
      }
    } else {
      if (curr) {
        // Deactivate the current route which will not be re-used
        this.deactivateRouteAndItsChildren(currNode, parentContext);
      }
    }
  }

  private deactivateRouteAndItsChildren(
      route: TreeNode<ActivatedRoute>, parentContexts: ChildrenOutletContexts): void {
    // If there is no component, the Route is never attached to an outlet (because there is no
    // component to attach).
    if (route.value.component && this.routeReuseStrategy.shouldDetach(route.value.snapshot)) {
      this.detachAndStoreRouteSubtree(route, parentContexts);
    } else {
      this.deactivateRouteAndOutlet(route, parentContexts);
    }
  }

  private detachAndStoreRouteSubtree(
      route: TreeNode<ActivatedRoute>, parentContexts: ChildrenOutletContexts): void {
    const context = parentContexts.getContext(route.value.outlet);
    const contexts = context && route.value.component ? context.children : parentContexts;
    const children: {[outletName: string]: TreeNode<ActivatedRoute>} = nodeChildrenAsMap(route);

    for (const childOutlet of Object.keys(children)) {
      this.deactivateRouteAndItsChildren(children[childOutlet], contexts);
    }

    if (context && context.outlet) {
      const componentRef = context.outlet.detach();
      const contexts = context.children.onOutletDeactivated();
      this.routeReuseStrategy.store(route.value.snapshot, {componentRef, route, contexts});
    }
  }

  private deactivateRouteAndOutlet(
      route: TreeNode<ActivatedRoute>, parentContexts: ChildrenOutletContexts): void {
    const context = parentContexts.getContext(route.value.outlet);
    // The context could be `null` if we are on a componentless route but there may still be
    // children that need deactivating.
    const contexts = context && route.value.component ? context.children : parentContexts;
    const children: {[outletName: string]: TreeNode<ActivatedRoute>} = nodeChildrenAsMap(route);

    for (const childOutlet of Object.keys(children)) {
      this.deactivateRouteAndItsChildren(children[childOutlet], contexts);
    }

    if (context) {
      if (context.outlet) {
        // Destroy the component
        context.outlet.deactivate();
        // Destroy the contexts for all the outlets that were in the component
        context.children.onOutletDeactivated();
      }
      // Clear the information about the attached component on the context but keep the reference to
      // the outlet. Clear even if outlet was not yet activated to avoid activating later with old
      // info
      context.attachRef = null;
      context.route = null;
    }
  }

  private activateChildRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>|null,
      contexts: ChildrenOutletContexts): void {
    const children: {[outlet: string]: TreeNode<ActivatedRoute>} = nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.activateRoutes(c, children[c.value.outlet], contexts);
      this.forwardEvent(new ActivationEnd(c.value.snapshot));
    });
    if (futureNode.children.length) {
      this.forwardEvent(new ChildActivationEnd(futureNode.value.snapshot));
    }
  }

  private activateRoutes(
      futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
      parentContexts: ChildrenOutletContexts): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;

    advanceActivatedRoute(future);

    // reusing the node
    if (future === curr) {
      if (future.component) {
        // If we have a normal route, we need to go through an outlet.
        const context = parentContexts.getOrCreateContext(future.outlet);
        this.activateChildRoutes(futureNode, currNode, context.children);
      } else {
        // if we have a componentless route, we recurse but keep the same outlet map.
        this.activateChildRoutes(futureNode, currNode, parentContexts);
      }
    } else {
      if (future.component) {
        // if we have a normal route, we need to place the component into the outlet and recurse.
        const context = parentContexts.getOrCreateContext(future.outlet);

        if (this.routeReuseStrategy.shouldAttach(future.snapshot)) {
          const stored =
              (<DetachedRouteHandleInternal>this.routeReuseStrategy.retrieve(future.snapshot));
          this.routeReuseStrategy.store(future.snapshot, null);
          context.children.onOutletReAttached(stored.contexts);
          context.attachRef = stored.componentRef;
          context.route = stored.route.value;
          if (context.outlet) {
            // Attach right away when the outlet has already been instantiated
            // Otherwise attach from `RouterOutlet.ngOnInit` when it is instantiated
            context.outlet.attach(stored.componentRef, stored.route.value);
          }

          advanceActivatedRoute(stored.route.value);
          this.activateChildRoutes(futureNode, null, context.children);
        } else {
          const injector = getClosestRouteInjector(future.snapshot);
          context.attachRef = null;
          context.route = future;
          context.injector = injector;
          if (context.outlet) {
            // Activate the outlet when it has already been instantiated
            // Otherwise it will get activated from its `ngOnInit` when instantiated
            context.outlet.activateWith(future, context.injector);
          }

          this.activateChildRoutes(futureNode, null, context.children);
        }
      } else {
        // if we have a componentless route, we recurse but keep the same outlet map.
        this.activateChildRoutes(futureNode, null, parentContexts);
      }
    }
    if ((typeof ngDevMode === 'undefined' || ngDevMode)) {
      const context = parentContexts.getOrCreateContext(future.outlet);
      const outlet = context.outlet;
      if (outlet && this.inputBindingEnabled && !outlet.supportsBindingToComponentInputs &&
          !warnedAboutUnsupportedInputBinding) {
        console.warn(
            `'withComponentInputBinding' feature is enabled but ` +
            `this application is using an outlet that may not support binding to component inputs.`);
        warnedAboutUnsupportedInputBinding = true;
      }
    }
  }
}
