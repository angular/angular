import {OnInit, provide, ReflectiveInjector, ComponentResolver} from 'angular2/core';
import {RouterOutlet} from './directives/router_outlet';
import {Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {EventEmitter, Observable} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {RouterUrlSerializer} from './router_url_serializer';
import {recognize} from './recognize';
import {Location} from 'angular2/platform/common';
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

  constructor(private _componentType: Type, private _componentResolver: ComponentResolver,
              private _urlSerializer: RouterUrlSerializer,
              private _routerOutletMap: RouterOutletMap, private _location: Location) {
    this.navigateByUrl(this._location.path());
  }

  get urlTree(): Tree<UrlSegment> { return this._urlTree; }

  navigate(url: Tree<UrlSegment>): Promise<void> {
    this._urlTree = url;
    return recognize(this._componentResolver, this._componentType, url)
        .then(currTree => {
          new _LoadSegments(currTree, this._prevTree).load(this._routerOutletMap);
          this._prevTree = currTree;
          this._location.go(this._urlSerializer.serialize(this._urlTree));
          this._changes.emit(null);
        });
  }

  serializeUrl(url: Tree<UrlSegment>): string { return this._urlSerializer.serialize(url); }

  navigateByUrl(url: string): Promise<void> {
    return this.navigate(this._urlSerializer.parse(url));
  }

  get changes(): Observable<void> { return this._changes; }
}

class _LoadSegments {
  constructor(private currTree: Tree<RouteSegment>, private prevTree: Tree<RouteSegment>) {}

  load(parentOutletMap: RouterOutletMap): void {
    let prevRoot = isPresent(this.prevTree) ? rootNode(this.prevTree) : null;
    let currRoot = rootNode(this.currTree);
    this.loadChildSegments(currRoot, prevRoot, parentOutletMap);
  }

  loadSegments(currNode: TreeNode<RouteSegment>, prevNode: TreeNode<RouteSegment>,
               parentOutletMap: RouterOutletMap): void {
    let curr = currNode.value;
    let prev = isPresent(prevNode) ? prevNode.value : null;
    let outlet = this.getOutlet(parentOutletMap, currNode.value);

    if (equalSegments(curr, prev)) {
      this.loadChildSegments(currNode, prevNode, outlet.outletMap);
    } else {
      let outletMap = new RouterOutletMap();
      this.loadNewSegment(outletMap, curr, prev, outlet);
      this.loadChildSegments(currNode, prevNode, outletMap);
    }
  }

  private loadNewSegment(outletMap: RouterOutletMap, curr: RouteSegment, prev: RouteSegment,
                         outlet: RouterOutlet): void {
    let resolved = ReflectiveInjector.resolve(
        [provide(RouterOutletMap, {useValue: outletMap}), provide(RouteSegment, {useValue: curr})]);
    let ref = outlet.load(routeSegmentComponentFactory(curr), resolved, outletMap);
    if (hasLifecycleHook("routerOnActivate", ref.instance)) {
      ref.instance.routerOnActivate(curr, prev, this.currTree, this.prevTree);
    }
  }

  private loadChildSegments(currNode: TreeNode<RouteSegment>, prevNode: TreeNode<RouteSegment>,
                            outletMap: RouterOutletMap): void {
    let prevChildren = isPresent(prevNode) ?
                           prevNode.children.reduce(
                               (m, c) => {
                                 m[c.value.outlet] = c;
                                 return m;
                               },
                               {}) :
                           {};

    currNode.children.forEach(c => {
      this.loadSegments(c, prevChildren[c.value.outlet], outletMap);
      StringMapWrapper.delete(prevChildren, c.value.outlet);
    });

    StringMapWrapper.forEach(prevChildren, (v, k) => this.unloadOutlet(outletMap._outlets[k]));
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

  private unloadOutlet(outlet: RouterOutlet): void {
    StringMapWrapper.forEach(outlet.outletMap._outlets, (v, k) => { this.unloadOutlet(v); });
    outlet.unload();
  }
}