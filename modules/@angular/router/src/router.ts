import { ComponentResolver, ReflectiveInjector } from '@angular/core';
import { Location } from '@angular/common';
import { UrlSerializer } from './url_serializer';
import { RouterOutletMap } from './router_outlet_map';
import { recognize } from './recognize';
import { rootNode, TreeNode } from './utils/tree';
import { UrlTree, createEmptyUrlTree } from './url_tree';
import { PRIMARY_OUTLET, Params } from './shared';
import { createEmptyState, RouterState, ActivatedRoute} from './router_state';
import { RouterConfig } from './config';
import { RouterOutlet } from './directives/router_outlet';
import { createUrlTree } from './create_url_tree';
import { forEach } from './utils/collection';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';
import {fromPromise} from 'rxjs/observable/fromPromise';
import {forkJoin} from 'rxjs/observable/forkJoin';

export interface NavigationExtras { relativeTo?: ActivatedRoute; queryParameters?: Params; fragment?: string; }

/**
 * The `Router` is responsible for mapping URLs to components.
 */
export class Router {
  private currentUrlTree: UrlTree;
  private currentRouterState: RouterState;
  private config: RouterConfig;
  private locationSubscription: Subscription;

  /**
   * @internal
   */
  constructor(private rootComponent:Object, private resolver: ComponentResolver, private urlSerializer: UrlSerializer, private outletMap: RouterOutletMap, private location: Location) {
    this.currentUrlTree = createEmptyUrlTree();
    this.currentRouterState = createEmptyState(<any>rootComponent.constructor);
    this.setUpLocationChangeListener();
    this.navigateByUrl(this.location.path());
  }

  /**
   * Returns the current route state.
   */
  get routerState(): RouterState {
    return this.currentRouterState;
  }

  /**
   * Returns the current url tree.
   */
  get urlTree(): UrlTree {
    return this.currentUrlTree;
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
  navigateByUrl(url: string): Observable<void> {
    const urlTree = this.urlSerializer.parse(url);
    return this.runNavigate(urlTree, false);
  }

  /**
   * Resets the configuration used for navigation and generating links.
   *
   * ### Usage
   *
   * ```
   * router.resetConfig([
   *  { path: 'team/:id', component: TeamCmp, children: [
   *    { path: 'simple', component: SimpleCmp },
   *    { path: 'user/:name', component: UserCmp }
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

  /**
   * Applies an array of commands to the current url tree and creates
   * a new url tree.
   *
   * When given an activate route, applies the given commands starting from the route.
   * When not given a route, applies the given command starting from the root.
   *
   * ### Usage
   *
   * ```
   * // create /team/33/user/11
   * router.createUrlTree(['/team', 33, 'user', 11]);
   *
   * // create /team/33;expand=true/user/11
   * router.createUrlTree(['/team', 33, {expand: true}, 'user', 11]);
   *
   * // you can collapse static fragments like this
   * router.createUrlTree(['/team/33/user', userId]);
   *
   * // assuming the current url is `/team/33/user/11` and the route points to `user/11`
   *
   * // navigate to /team/33/user/11/details
   * router.createUrlTree(['details'], {relativeTo: route});
   *
   * // navigate to /team/33/user/22
   * router.createUrlTree(['../22'], {relativeTo: route});
   *
   * // navigate to /team/44/user/22
   * router.createUrlTree(['../../team/44/user/22'], {relativeTo: route});
   * ```
   */
  createUrlTree(commands: any[], {relativeTo, queryParameters, fragment}: NavigationExtras = {}): UrlTree {
    const a = relativeTo ? relativeTo : this.routerState.root;
    return createUrlTree(a, this.currentUrlTree, commands, queryParameters, fragment);
  }


  /**
   * Navigate based on the provided array of commands and a starting point.
   * If no starting route is provided, the navigation is absolute.
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'team', '11], {relativeTo: route});
   * ```
   */
  navigate(commands: any[], extras: NavigationExtras = {}): Observable<void> {
    return this.runNavigate(this.createUrlTree(commands, extras));
  }

  /**
   * Serializes a {@link UrlTree} into a string.
   */
  serializeUrl(url: UrlTree): string { return this.urlSerializer.serialize(url); }

  /**
   * Parse a string into a {@link UrlTree}.
   */
  parseUrl(url: string): UrlTree { return this.urlSerializer.parse(url); }

  private setUpLocationChangeListener(): void {
    this.locationSubscription = <any>this.location.subscribe((change) => {
      this.runNavigate(this.urlSerializer.parse(change['url']), change['pop'])
    });
  }

  private runNavigate(url:UrlTree, pop?:boolean):Observable<void> {
    const r = recognize(this.config, url, this.currentRouterState).mergeMap((newState:RouterState) => {
      return new ActivateRoutes(this.resolver, newState, this.currentRouterState).activate(this.outletMap).map(() => {
        this.currentUrlTree = url;
        this.currentRouterState = newState;
        if (!pop) {
          this.location.go(this.urlSerializer.serialize(url));
        }
      });
    });
    r.subscribe((a) => {}, (e) => {}, () => {}); // force execution
    return r;
  }
}

class ActivateRoutes {
  constructor(private resolver: ComponentResolver, private futureState: RouterState, private currState: RouterState) {}

  activate(parentOutletMap: RouterOutletMap): Observable<void> {
    const currRoot = this.currState ? rootNode(this.currState) : null;
    const futureRoot = rootNode(this.futureState);
    return this.activateChildRoutes(futureRoot, currRoot, parentOutletMap);
  }

  private activateChildRoutes(futureNode: TreeNode<ActivatedRoute>,
                              currNode: TreeNode<ActivatedRoute> | null,
                              outletMap: RouterOutletMap): Observable<any> {
    const prevChildren = nodeChildrenAsMap(currNode);
    const observables = [];
    futureNode.children.forEach(c => {
      observables.push(this.activateRoutes(c, prevChildren[c.value.outlet], outletMap).toPromise());
      delete prevChildren[c.value.outlet];
    });
    forEach(prevChildren, (v, k) => this.deactivateOutletAndItChildren(outletMap._outlets[k]));
    return forkJoin(observables);
  }


  activateRoutes(futureNode: TreeNode<ActivatedRoute>, currNode: TreeNode<ActivatedRoute>,
                 parentOutletMap: RouterOutletMap): Observable<void> {
    const future = futureNode.value;
    const curr = currNode ? currNode.value : null;
    const outlet = getOutlet(parentOutletMap, futureNode.value);

    if (future === curr) {
      return this.activateChildRoutes(futureNode, currNode, outlet.outletMap);
    } else {
      this.deactivateOutletAndItChildren(outlet);
      const outletMap = new RouterOutletMap();
      return this.activateNewRoutes(outletMap, future, outlet).mergeMap(() =>
        this.activateChildRoutes(futureNode, currNode, outletMap));
    }
  }

  private activateNewRoutes(outletMap: RouterOutletMap, future: ActivatedRoute, outlet: RouterOutlet): Observable<void> {
    const resolved = ReflectiveInjector.resolve([
      {provide: ActivatedRoute, useValue: future},
      {provide: RouterOutletMap, useValue: outletMap}
    ]);
    return fromPromise(this.resolver.resolveComponent(<any>future.component)).
      map(factory => outlet.activate(factory, resolved, outletMap));
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
