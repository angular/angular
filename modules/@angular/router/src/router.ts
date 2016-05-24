import { ComponentResolver, ReflectiveInjector } from '@angular/core';
import { Location } from '@angular/common';
import { UrlSerializer } from './url_serializer';
import { RouterOutletMap } from './router_outlet_map';
import { recognize } from './recognize';
import { rootNode, TreeNode } from './utils/tree';
import { UrlTree } from './url_tree';
import { createEmptyState, RouterState, ActivatedRoute, PRIMARY_OUTLET } from './router_state';
import { RouterConfig } from './config';
import { RouterOutlet } from './directives/router_outlet';
import { forEach } from './utils/collection';
import { Subscription } from 'rxjs/Subscription';

/**
 * The `Router` is responsible for mapping URLs to components.
 */
export class Router {
  private currentState: RouterState;
  private config: RouterConfig;
  private locationSubscription: Subscription;

  /**
   * @internal
   */
  constructor(private rootComponent:Object, private resolver: ComponentResolver, private urlSerializer: UrlSerializer, private outletMap: RouterOutletMap, private location: Location) {
    this.currentState = createEmptyState(<any>rootComponent.constructor);
    this.setUpLocationChangeListener();
    this.navigateByUrl(this.location.path());
  }

  /**
   * Returns the current route state.
   */
  get routerState(): RouterState {
    return this.currentState;
  }

  /**
   * Navigate based on the provided url. This navigation is always absolute.
   *
   * ### Usage
   *
   * ```
   * router.navigateByUrl("/team/33/user/11");
   * ```
   */
  navigateByUrl(url: string): void {
    const urlTree = this.urlSerializer.parse(url);
    this.navigate(urlTree, false);
  }

  /**
   * Resets the configuration used for navigation and generating links.
   *
   * ### Usage
   *
   * ```
   * router.resetConfig([
   *  { name: 'team', path: 'team/:id', component: TeamCmp, children: [
   *    { name: 'simple', path: 'simple', component: SimpleCmp },
   *    { name: 'user', path: 'user/:name', component: UserCmp }
   *  ] }
   * ]);
   * ```
   */
  resetConfig(config: RouterConfig): void {
    this.config = config;
  }
  
  /**
   * @internal
   */
  dispose(): void { this.locationSubscription.unsubscribe(); }

  private setUpLocationChangeListener(): void {
    this.locationSubscription = <any>this.location.subscribe((change) => {
      this.navigate(this.urlSerializer.parse(change['url']), change['pop'])
    });
  }

  private navigate(url: UrlTree, pop?: boolean): Promise<void> {
    return recognize(this.resolver, this.config, url, this.currentState).then(newState => {
      new ActivateRoutes(newState, this.currentState).activate(this.outletMap);
      this.currentState = newState;
      if (!pop) {
        this.location.go(this.urlSerializer.serialize(url));
      }
    }).catch(e => console.log("error", e.message));
  }
}

class ActivateRoutes {
  constructor(private futureState: RouterState, private currState: RouterState) {}

  activate(parentOutletMap: RouterOutletMap): void {
    const currRoot = this.currState ? rootNode(this.currState) : null;
    const futureRoot = rootNode(this.futureState);
    this.activateChildRoutes(futureRoot, currRoot, parentOutletMap);
  }

  private activateChildRoutes(futureNode: TreeNode<ActivatedRoute>,
                              currNode: TreeNode<ActivatedRoute> | null,
                              outletMap: RouterOutletMap): void {
    const prevChildren = nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.activateRoutes(c, prevChildren[c.value.outlet], outletMap);
      delete prevChildren[c.value.outlet];
    });
    forEach(prevChildren, (v, k) => this.deactivateOutletAndItChildren(outletMap._outlets[k]));
  }

  activateRoutes(futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
                 parentOutletMap: RouterOutletMap): void {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;
    const outlet = getOutlet(parentOutletMap, futureNode.value);

    if (future === curr) {
      this.activateChildRoutes(futureNode, currNode, outlet.outletMap);
    } else {
      this.deactivateOutletAndItChildren(outlet);
      const outletMap = new RouterOutletMap();
      this.activateNewRoutes(outletMap, future, outlet);
      this.activateChildRoutes(futureNode, currNode, outletMap);
    }
  }

  private activateNewRoutes(outletMap: RouterOutletMap, future: ActivatedRoute, outlet: RouterOutlet): void {
    const resolved = ReflectiveInjector.resolve([
      {provide: ActivatedRoute, useValue: future},
      {provide: RouterOutletMap, useValue: outletMap}
    ]);
    outlet.activate(future.factory, resolved, outletMap);
  }

  private deactivateOutletAndItChildren(outlet: RouterOutlet): void {
    if (outlet && outlet.isActivated) {
      forEach(outlet.outletMap._outlets, (v, k) => this.deactivateOutletAndItChildren(v));
      outlet.deactivate();
    }
  }
}

function nodeChildrenAsMap(node: TreeNode<ActivatedRoute>|null) {
  return node ?
    node.children.reduce(
      (m, c) => {
        m[c.value.outlet] = c;
        return m;
      },
      {}) :
  {};
}

function getOutlet(outletMap: RouterOutletMap, route: ActivatedRoute): RouterOutlet {
  let outlet = outletMap._outlets[route.outlet];
  if (!outlet) {
    if (route.outlet === PRIMARY_OUTLET) {
      throw new Error(`Cannot find primary outlet`);
    } else {
      throw new Error(`Cannot find the outlet ${route.outlet}`);
    }
  }
  return outlet;
}
