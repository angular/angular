import {provide, ReflectiveInjector, ComponentResolver} from 'angular2/core';
import {RouterOutlet} from './directives/router_outlet';
import {Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {RouterUrlParser} from './router_url_parser';
import {recognize} from './recognize';
import {
  equalSegments,
  routeSegmentComponentFactory,
  RouteSegment,
  Tree,
  rootNode,
  TreeNode
} from './segments';
import {hasLifecycleHook} from './lifecycle_reflector';
import {DEFAULT_OUTLET_NAME} from './constants';

export class RouterOutletMap {
  /** @internal */
  _outlets: {[name: string]: RouterOutlet} = {};
  registerOutlet(name: string, outlet: RouterOutlet): void { this._outlets[name] = outlet; }
}

export class Router {
  private prevTree: Tree<RouteSegment>;
  constructor(private _componentType: Type, private _componentResolver: ComponentResolver,
              private _urlParser: RouterUrlParser, private _routerOutletMap: RouterOutletMap) {}

  navigateByUrl(url: string): Promise<void> {
    let urlSegmentTree = this._urlParser.parse(url);
    return recognize(this._componentResolver, this._componentType, urlSegmentTree)
        .then(currTree => {
          let prevRoot = isPresent(this.prevTree) ? rootNode(this.prevTree) : null;
          new _SegmentLoader(currTree, this.prevTree)
              .loadSegments(rootNode(currTree), prevRoot, this._routerOutletMap);
          this.prevTree = currTree;
        });
  }
}

class _SegmentLoader {
  constructor(private currTree: Tree<RouteSegment>, private prevTree: Tree<RouteSegment>) {}

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