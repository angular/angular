import {provide, ReflectiveInjector, ComponentResolver} from 'angular2/core';
import {RouterOutlet} from './directives/router_outlet';
import {Type, isBlank, isPresent} from 'angular2/src/facade/lang';
import {RouterUrlParser} from './router_url_parser';
import {recognize} from './recognize';
import {equalSegments, routeSegmentComponentFactory, RouteSegment, Tree} from './segments';
import {hasLifecycleHook} from './lifecycle_reflector';

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
    let urlSegmentTree = this._urlParser.parse(url.substring(1));
    return recognize(this._componentResolver, this._componentType, urlSegmentTree)
        .then(currTree => {
          let prevRoot = isPresent(this.prevTree) ? this.prevTree.root : null;
          _loadSegments(currTree, currTree.root, this.prevTree, prevRoot, this,
                        this._routerOutletMap);
          this.prevTree = currTree;
        });
  }
}

function _loadSegments(currTree: Tree<RouteSegment>, curr: RouteSegment,
                       prevTree: Tree<RouteSegment>, prev: RouteSegment, router: Router,
                       parentOutletMap: RouterOutletMap): void {
  let outlet = parentOutletMap._outlets[curr.outlet];

  let outletMap;
  if (equalSegments(curr, prev)) {
    outletMap = outlet.outletMap;
  } else {
    outletMap = new RouterOutletMap();
    let resolved = ReflectiveInjector.resolve(
        [provide(RouterOutletMap, {useValue: outletMap}), provide(RouteSegment, {useValue: curr})]);
    let ref = outlet.load(routeSegmentComponentFactory(curr), resolved, outletMap);
    if (hasLifecycleHook("routerOnActivate", ref.instance)) {
      ref.instance.routerOnActivate(curr, prev, currTree, prevTree);
    }
  }

  if (isPresent(currTree.firstChild(curr))) {
    let cc = currTree.firstChild(curr);
    let pc = isBlank(prevTree) ? null : prevTree.firstChild(prev);
    _loadSegments(currTree, cc, prevTree, pc, router, outletMap);
  }
}