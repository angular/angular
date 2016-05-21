import {OnInit, provide, ReflectiveInjector, ComponentResolver} from '@angular/core';
import {RouterOutlet} from './directives/router_outlet';
import {Type, isBlank, isPresent} from './facade/lang';
import {ListWrapper} from './facade/collection';
import {EventEmitter, Observable, PromiseWrapper, ObservableWrapper} from './facade/async';
import {StringMapWrapper} from './facade/collection';
import {BaseException} from '@angular/core';
import {RouterUrlSerializer} from './router_url_serializer';
import {CanDeactivate} from './interfaces';
import {recognize} from './recognize';
import {Location} from '@angular/common';
import {link} from './link';

import {
  routeSegmentComponentFactory,
  RouteSegment,
  UrlTree,
  RouteTree,
  rootNode,
  TreeNode,
  UrlSegment,
  serializeRouteSegmentTree,
  createEmptyRouteTree
} from './segments';
import {hasLifecycleHook} from './lifecycle_reflector';
import {DEFAULT_OUTLET_NAME} from './constants';

/**
 * @internal
 */
export class RouterOutletMap {
  /** @internal */
  _outlets: {[name: string]: RouterOutlet} = {};
  registerOutlet(name: string, outlet: RouterOutlet): void { this._outlets[name] = outlet; }
}

export abstract class RouteSegmentContainer { abstract get routeSegment(): RouteSegment; }

/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only fields `router.urlTree`
 * and `router.routeTree`.
 */
export class Router {
  private _routeTree: RouteTree;
  private _urlTree: UrlTree;
  private _locationSubscription: any;
  private _changes: EventEmitter<void> = new EventEmitter<void>();

  /**
   * @internal
   */
  constructor(private _rootComponent: Object, private _rootComponentType: Type,
              private _componentResolver: ComponentResolver,
              private _urlSerializer: RouterUrlSerializer,
              private _routerOutletMap: RouterOutletMap, private _location: Location) {
    this._routeTree = createEmptyRouteTree(this._rootComponentType);
    this._setUpLocationChangeListener();
    this.navigateByUrl(this._location.path());
  }

  /**
   * Returns the current url tree.
   */
  get urlTree(): UrlTree { return this._urlTree; }

  /**
   * Returns the current route tree.
   */
  get routeTree(): RouteTree { return this._routeTree; }

  /**
   * An observable or url changes from the router.
   */
  get changes(): Observable<void> { return this._changes; }

  /**
   * Navigate based on the provided url. This navigation is always absolute.
   *
   * ### Usage
   *
   * ```
   * router.navigateByUrl("/team/33/user/11");
   * ```
   */
  navigateByUrl(url: string): Promise<void> {
    return this._navigate(this._urlSerializer.parse(url));
  }

  /**
   * Navigate based on the provided array of commands and a starting point.
   * If no segment is provided, the navigation is absolute.
   *
   * ### Usage
   *
   * ```
   * router.navigate(['team', 33, 'team', '11], segment);
   * ```
   */
  navigate(commands: any[], segment?: RouteSegment): Promise<void> {
    return this._navigate(this.createUrlTree(commands, segment));
  }

  /**
   * @internal
   */
  dispose(): void { ObservableWrapper.dispose(this._locationSubscription); }

  /**
   * Applies an array of commands to the current url tree and creates
   * a new url tree.
   *
   * When given a segment, applies the given commands starting from the segment.
   * When not given a segment, applies the given command starting from the root.
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
   * // assuming the current url is `/team/33/user/11` and the segment points to `user/11`
   *
   * // navigate to /team/33/user/11/details
   * router.createUrlTree(['details'], segment);
   *
   * // navigate to /team/33/user/22
   * router.createUrlTree(['../22'], segment);
   *
   * // navigate to /team/44/user/22
   * router.createUrlTree(['../../team/44/user/22'], segment);
   * ```
   */
  createUrlTree(commands: any[], segment?: RouteSegment): UrlTree {
    let s = isPresent(segment) ? segment : this._routeTree.root;
    return link(s, this._routeTree, this.urlTree, commands);
  }

  /**
   * Serializes a {@link UrlTree} into a string.
   */
  serializeUrl(url: UrlTree): string { return this._urlSerializer.serialize(url); }

  private _setUpLocationChangeListener(): void {
    this._locationSubscription = this._location.subscribe(
        (change) => { this._navigate(this._urlSerializer.parse(change['url']), change['pop']); });
  }

  private _navigate(url: UrlTree, pop?: boolean): Promise<void> {
    this._urlTree = url;
    return recognize(this._componentResolver, this._rootComponentType, url, this._routeTree)
      .then(currTree => {
        return new _ActivateSegments(currTree, this._routeTree)
          .activate(this._routerOutletMap, this._rootComponent)
          .then(updated => {
            if (updated) {
              this._routeTree = currTree;
              if (isBlank(pop) || !pop) {
                this._location.go(this._urlSerializer.serialize(this._urlTree));
              }
              this._changes.emit(null);
            }
          });
      });
  }
}


class _ActivateSegments {
  private deactivations: Object[][] = [];
  private performMutation: boolean = true;

  constructor(private futureTree: RouteTree, private currTree: RouteTree) {}

  activate(parentOutletMap: RouterOutletMap, rootComponent: Object): Promise<boolean> {
    let currRoot = isPresent(this.currTree) ? rootNode(this.currTree) : null;
    let futureRoot = rootNode(this.futureTree);

    let l = new _LifecycleCollector(this.futureTree, this.currTree);
    return l.canDeactivate(futureRoot, currRoot, parentOutletMap, rootComponent)
        .then(res => {
          this.performMutation = true;
          if (res) {
            this.activateChildSegments(futureRoot, currRoot, parentOutletMap);
          }
          return res;
        });
  }

  private activateChildSegments(futureNode: TreeNode<RouteSegment>,
                                currNode: TreeNode<RouteSegment>,
                                outletMap: RouterOutletMap): void {
    var prevChildren = _nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.activateSegments(c, prevChildren[c.value.outlet], outletMap);
      StringMapWrapper.delete(prevChildren, c.value.outlet);
    });
    StringMapWrapper.forEach(prevChildren,
                             (v, k) => this.deactivateOutletAndItChildren(outletMap._outlets[k]));
  }

  activateSegments(futureNode: TreeNode<RouteSegment>, currNode: TreeNode<RouteSegment>,
                   parentOutletMap: RouterOutletMap): void {
    let future = futureNode.value;
    let curr = isPresent(currNode) ? currNode.value : null;
    let outlet = _getOutlet(parentOutletMap, futureNode.value);

    if (future === curr) {
      this.activateChildSegments(futureNode, currNode, outlet.outletMap);
    } else {
      if (this.routerCanReuse(outlet, future, curr)) {
        this.invokeOnDeactivateIfNeeded(outlet);
        this.invokeOnActivateIfNeeded(outlet, future, curr);
        this.activateChildSegments(futureNode, currNode, outlet.outletMap);

      } else {
        this.deactivateOutletAndItChildren(outlet);
        let outletMap = new RouterOutletMap();
        let component = this.activateNewSegments(outletMap, future, curr, outlet);
        this.activateChildSegments(futureNode, currNode, outletMap);
      }
    }
  }

  private activateNewSegments(outletMap: RouterOutletMap, future: RouteSegment, curr: RouteSegment,
                              outlet: RouterOutlet): Object {
    let resolved = ReflectiveInjector.resolve([
      provide(RouterOutletMap, {useValue: outletMap}),
      provide(RouteSegmentContainer, {useValue: outlet})
    ]);
    let ref = outlet.activate(routeSegmentComponentFactory(future), future, resolved, outletMap);
    this.invokeOnActivateIfNeeded(outlet, future, curr);
    return ref.instance;
  }

  private deactivateOutletAndItChildren(outlet: RouterOutlet): void {
    if (isPresent(outlet) && outlet.isActivated) {
      StringMapWrapper.forEach(outlet.outletMap._outlets,
                               (v, k) => this.deactivateOutletAndItChildren(v));
      this.invokeOnDeactivateIfNeeded(outlet);
      outlet.deactivate();
    }
  }

  private invokeOnActivateIfNeeded(outlet: RouterOutlet, future: RouteSegment,
                                   curr: RouteSegment): void {
    if (hasLifecycleHook("routerOnActivate", outlet.component)) {
      outlet.component.routerOnActivate(future, curr, this.futureTree, this.currTree);
    }
  }

  private invokeOnDeactivateIfNeeded(outlet: RouterOutlet): void {
    if (hasLifecycleHook("routerOnDeactivate", outlet.component)) {
      outlet.component.routerOnDeactivate(outlet.routeSegment, this.currTree, this.futureTree);
    }
  }

  private routerCanReuse(outlet: RouterOutlet, future: RouteSegment, curr: RouteSegment): boolean {
    return isPresent(curr) && future.type === curr.type && outlet.isActivated &&
           hasLifecycleHook("routerCanReuse", outlet.component) &&
           outlet.component.routerCanReuse(future, curr, this.futureTree, this.currTree);
  }
}

class _ComponentSegmentPair {
  constructor(public component: any, public segment: RouteSegment) {}
}

class _LifecycleCollector {
  private deactivations: _ComponentSegmentPair[][] = [];

  constructor(private futureTree: RouteTree, private currTree: RouteTree) {}

  canDeactivate(futureRoot: TreeNode<RouteSegment>, currRoot: TreeNode<RouteSegment>,
                outletMap: RouterOutletMap, rootComponent: Object): Promise<boolean> {
    this.walkChildSegments(futureRoot, currRoot, outletMap,
                           [new _ComponentSegmentPair(rootComponent, currRoot.value)]);

    return this.deactivations.reduce(
        (promise, path) => promise.then(_ => _ ? this.checkCanDeactivatePath(path) : _),
        PromiseWrapper.resolve(true));
  }

  private checkCanDeactivatePath(path: _ComponentSegmentPair[]): Promise<boolean> {
    let curr = PromiseWrapper.resolve(true);
    let last = ListWrapper.last(path);

    for (let p of ListWrapper.reversed(path)) {
      curr = curr.then(_ => {
        let component = p.component;
        let segment = p.segment;

        if (p === last) {
          if (hasLifecycleHook("routerCanDeactivate", component)) {
            return component.routerCanDeactivate(segment, this.currTree, this.futureTree);
          } else {
            return _;
          }

        } else {
          if (hasLifecycleHook("routerCanDeactivateChild", component)) {
            return component.routerCanDeactivateChild(last.segment, last.component, segment,
                                                      this.currTree, this.futureTree);
          } else {
            return _;
          }
        }
      });
    }
    return curr;
  }

  private walkChildSegments(futureNode: TreeNode<RouteSegment>, currNode: TreeNode<RouteSegment>,
                            outletMap: RouterOutletMap, path: _ComponentSegmentPair[]): void {
    var prevChildren = _nodeChildrenAsMap(currNode);
    futureNode.children.forEach(c => {
      this.walkSegment(c, prevChildren[c.value.outlet], outletMap, path);
      StringMapWrapper.delete(prevChildren, c.value.outlet);
    });

    StringMapWrapper.forEach(prevChildren,
                             (v, k) => this.walkDeactivation(outletMap._outlets[k], path, v));
  }

  walkSegment(futureNode: TreeNode<RouteSegment>, currNode: TreeNode<RouteSegment>,
              parentOutletMap: RouterOutletMap, path: _ComponentSegmentPair[]): void {
    let future = futureNode.value;
    let curr = isPresent(currNode) ? currNode.value : null;
    let outlet = _getOutlet(parentOutletMap, futureNode.value);
    if (future === curr) {
      this.walkChildSegments(futureNode, currNode, outlet.outletMap,
                             path.concat([new _ComponentSegmentPair(outlet.component, curr)]));
    } else {
      this.walkDeactivation(outlet, path, curr);
    }
  }

  private walkDeactivation(outlet: RouterOutlet, path: _ComponentSegmentPair[],
                           segment: RouteSegment): void {
    if (isPresent(outlet) && outlet.isActivated) {
      let newPath = path.concat([new _ComponentSegmentPair(outlet.component, segment)]);
      StringMapWrapper.forEach(outlet.outletMap._outlets,
                               (v, k) => this.walkDeactivation(v, newPath, v.routeSegment));
      this.deactivations.push(newPath);
    }
  }
}

function _nodeChildrenAsMap(node: TreeNode<RouteSegment>) {
  return isPresent(node) ?
             node.children.reduce(
                 (m, c) => {
                   m[c.value.outlet] = c;
                   return m;
                 },
                 {}) :
             {};
};

function _getOutlet(outletMap: RouterOutletMap, segment: RouteSegment): RouterOutlet {
  let outlet = outletMap._outlets[segment.outlet];
  if (isBlank(outlet)) {
    if (segment.outlet == DEFAULT_OUTLET_NAME) {
      throw new BaseException(`Cannot find default outlet`);
    } else {
      throw new BaseException(`Cannot find the outlet ${segment.outlet}`);
    }
  }
  return outlet;
}
