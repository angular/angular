import {OnInit, provide, ReflectiveInjector, ComponentResolver} from 'angular2/core';
import {RouterOutlet} from './directives/router_outlet';
import {Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';
import {EventEmitter, Observable, PromiseWrapper} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {RouterUrlSerializer} from './router_url_serializer';
import {CanDeactivate} from './interfaces';
import {recognize} from './recognize';
import {Location} from 'angular2/platform/common';
import {link} from './link';

import {
  equalSegments,
  routeSegmentComponentFactory,
  RouteSegment,
  Tree,
  rootNode,
  TreeNode,
  UrlSegment,
  serializeRouteSegmentTree
} from './segments';
import {hasLifecycleHook} from './lifecycle_reflector';
import {DEFAULT_OUTLET_NAME} from './constants';

export class RouterOutletMap {
  /** @internal */
  _outlets: {[name: string]: RouterOutlet} = {};
  registerOutlet(name: string, outlet: RouterOutlet): void { this._outlets[name] = outlet; }
}

export class Router {
  private _prevTree: Tree<RouteSegment>;
  private _urlTree: Tree<UrlSegment>;

  private _changes: EventEmitter<void> = new EventEmitter<void>();

  constructor(private _rootComponent: Object, private _rootComponentType: Type,
              private _componentResolver: ComponentResolver,
              private _urlSerializer: RouterUrlSerializer,
              private _routerOutletMap: RouterOutletMap, private _location: Location) {
    this.navigateByUrl(this._location.path());
  }

  get urlTree(): Tree<UrlSegment> { return this._urlTree; }

  navigateByUrl(url: string): Promise<void> {
    return this._navigate(this._urlSerializer.parse(url));
  }

  navigate(changes: any[], segment?: RouteSegment): Promise<void> {
    return this._navigate(this.createUrlTree(changes, segment));
  }

  private _navigate(url: Tree<UrlSegment>): Promise<void> {
    this._urlTree = url;
    return recognize(this._componentResolver, this._rootComponentType, url)
        .then(currTree => {
          return new _LoadSegments(currTree, this._prevTree)
              .load(this._routerOutletMap, this._rootComponent)
              .then(updated => {
                if (updated) {
                  this._prevTree = currTree;
                  this._location.go(this._urlSerializer.serialize(this._urlTree));
                  this._changes.emit(null);
                }
              });
        });
  }

  createUrlTree(changes: any[], segment?: RouteSegment): Tree<UrlSegment> {
    if (isPresent(this._prevTree)) {
      let s = isPresent(segment) ? segment : this._prevTree.root;
      return link(s, this._prevTree, this.urlTree, changes);
    } else {
      return null;
    }
  }

  serializeUrl(url: Tree<UrlSegment>): string { return this._urlSerializer.serialize(url); }

  get changes(): Observable<void> { return this._changes; }

  get routeTree(): Tree<RouteSegment> { return this._prevTree; }
}


class _LoadSegments {
  private deactivations: Object[][] = [];
  private performMutation: boolean = true;

  constructor(private currTree: Tree<RouteSegment>, private prevTree: Tree<RouteSegment>) {}

  load(parentOutletMap: RouterOutletMap, rootComponent: Object): Promise<boolean> {
    let prevRoot = isPresent(this.prevTree) ? rootNode(this.prevTree) : null;
    let currRoot = rootNode(this.currTree);

    return this.canDeactivate(currRoot, prevRoot, parentOutletMap, rootComponent)
        .then(res => {
          this.performMutation = true;
          if (res) {
            this.loadChildSegments(currRoot, prevRoot, parentOutletMap, [rootComponent]);
          }
          return res;
        });
  }

  private canDeactivate(currRoot: TreeNode<RouteSegment>, prevRoot: TreeNode<RouteSegment>,
                        outletMap: RouterOutletMap, rootComponent: Object): Promise<boolean> {
    this.performMutation = false;
    this.loadChildSegments(currRoot, prevRoot, outletMap, [rootComponent]);

    let allPaths = PromiseWrapper.all(this.deactivations.map(r => this.checkCanDeactivatePath(r)));
    return allPaths.then((values: boolean[]) => values.filter(v => v).length === values.length);
  }

  private checkCanDeactivatePath(path: Object[]): Promise<boolean> {
    let curr = PromiseWrapper.resolve(true);
    for (let p of ListWrapper.reversed(path)) {
      curr = curr.then(_ => {
        if (hasLifecycleHook("routerCanDeactivate", p)) {
          return (<CanDeactivate>p).routerCanDeactivate(this.prevTree, this.currTree);
        } else {
          return _;
        }
      });
    }
    return curr;
  }

  private loadChildSegments(currNode: TreeNode<RouteSegment>, prevNode: TreeNode<RouteSegment>,
                            outletMap: RouterOutletMap, components: Object[]): void {
    let prevChildren = isPresent(prevNode) ?
                           prevNode.children.reduce(
                               (m, c) => {
                                 m[c.value.outlet] = c;
                                 return m;
                               },
                               {}) :
                           {};

    currNode.children.forEach(c => {
      this.loadSegments(c, prevChildren[c.value.outlet], outletMap, components);
      StringMapWrapper.delete(prevChildren, c.value.outlet);
    });

    StringMapWrapper.forEach(prevChildren,
                             (v, k) => this.unloadOutlet(outletMap._outlets[k], components));
  }

  loadSegments(currNode: TreeNode<RouteSegment>, prevNode: TreeNode<RouteSegment>,
               parentOutletMap: RouterOutletMap, components: Object[]): void {
    let curr = currNode.value;
    let prev = isPresent(prevNode) ? prevNode.value : null;
    let outlet = this.getOutlet(parentOutletMap, currNode.value);

    if (equalSegments(curr, prev)) {
      this.loadChildSegments(currNode, prevNode, outlet.outletMap,
                             components.concat([outlet.loadedComponent]));
    } else {
      this.unloadOutlet(outlet, components);
      if (this.performMutation) {
        let outletMap = new RouterOutletMap();
        let loadedComponent = this.loadNewSegment(outletMap, curr, prev, outlet);
        this.loadChildSegments(currNode, prevNode, outletMap, components.concat([loadedComponent]));
      }
    }
  }

  private loadNewSegment(outletMap: RouterOutletMap, curr: RouteSegment, prev: RouteSegment,
                         outlet: RouterOutlet): Object {
    let resolved = ReflectiveInjector.resolve(
        [provide(RouterOutletMap, {useValue: outletMap}), provide(RouteSegment, {useValue: curr})]);
    let ref = outlet.load(routeSegmentComponentFactory(curr), resolved, outletMap);
    if (hasLifecycleHook("routerOnActivate", ref.instance)) {
      ref.instance.routerOnActivate(curr, prev, this.currTree, this.prevTree);
    }
    return ref.instance;
  }

  private getOutlet(outletMap: RouterOutletMap, segment: RouteSegment): RouterOutlet {
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

  private unloadOutlet(outlet: RouterOutlet, components: Object[]): void {
    if (isPresent(outlet) && outlet.isLoaded) {
      StringMapWrapper.forEach(outlet.outletMap._outlets,
                               (v, k) => this.unloadOutlet(v, components));
      if (this.performMutation) {
        outlet.unload();
      } else {
        this.deactivations.push(components.concat([outlet.loadedComponent]));
      }
    }
  }
}