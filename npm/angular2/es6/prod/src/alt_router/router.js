import { provide, ReflectiveInjector } from 'angular2/core';
import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { EventEmitter, PromiseWrapper, ObservableWrapper } from 'angular2/src/facade/async';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/exceptions';
import { recognize } from './recognize';
import { link } from './link';
import { equalSegments, routeSegmentComponentFactory, RouteSegment, RouteTree, rootNode, TreeNode, UrlSegment } from './segments';
import { hasLifecycleHook } from './lifecycle_reflector';
import { DEFAULT_OUTLET_NAME } from './constants';
export class RouterOutletMap {
    constructor() {
        /** @internal */
        this._outlets = {};
    }
    registerOutlet(name, outlet) { this._outlets[name] = outlet; }
}
export class Router {
    constructor(_rootComponent, _rootComponentType, _componentResolver, _urlSerializer, _routerOutletMap, _location) {
        this._rootComponent = _rootComponent;
        this._rootComponentType = _rootComponentType;
        this._componentResolver = _componentResolver;
        this._urlSerializer = _urlSerializer;
        this._routerOutletMap = _routerOutletMap;
        this._location = _location;
        this._changes = new EventEmitter();
        this._prevTree = this._createInitialTree();
        this._setUpLocationChangeListener();
        this.navigateByUrl(this._location.path());
    }
    get urlTree() { return this._urlTree; }
    navigateByUrl(url) {
        return this._navigate(this._urlSerializer.parse(url));
    }
    navigate(changes, segment) {
        return this._navigate(this.createUrlTree(changes, segment));
    }
    dispose() { ObservableWrapper.dispose(this._locationSubscription); }
    _createInitialTree() {
        let root = new RouteSegment([new UrlSegment("", null, null)], null, DEFAULT_OUTLET_NAME, this._rootComponentType, null);
        return new RouteTree(new TreeNode(root, []));
    }
    _setUpLocationChangeListener() {
        this._locationSubscription = this._location.subscribe((change) => { this._navigate(this._urlSerializer.parse(change['url'])); });
    }
    _navigate(url) {
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
    createUrlTree(changes, segment) {
        if (isPresent(this._prevTree)) {
            let s = isPresent(segment) ? segment : this._prevTree.root;
            return link(s, this._prevTree, this.urlTree, changes);
        }
        else {
            return null;
        }
    }
    serializeUrl(url) { return this._urlSerializer.serialize(url); }
    get changes() { return this._changes; }
    get routeTree() { return this._prevTree; }
}
class _LoadSegments {
    constructor(currTree, prevTree) {
        this.currTree = currTree;
        this.prevTree = prevTree;
        this.deactivations = [];
        this.performMutation = true;
    }
    load(parentOutletMap, rootComponent) {
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
    canDeactivate(currRoot, prevRoot, outletMap, rootComponent) {
        this.performMutation = false;
        this.loadChildSegments(currRoot, prevRoot, outletMap, [rootComponent]);
        let allPaths = PromiseWrapper.all(this.deactivations.map(r => this.checkCanDeactivatePath(r)));
        return allPaths.then((values) => values.filter(v => v).length === values.length);
    }
    checkCanDeactivatePath(path) {
        let curr = PromiseWrapper.resolve(true);
        for (let p of ListWrapper.reversed(path)) {
            curr = curr.then(_ => {
                if (hasLifecycleHook("routerCanDeactivate", p)) {
                    return p.routerCanDeactivate(this.prevTree, this.currTree);
                }
                else {
                    return _;
                }
            });
        }
        return curr;
    }
    loadChildSegments(currNode, prevNode, outletMap, components) {
        let prevChildren = isPresent(prevNode) ?
            prevNode.children.reduce((m, c) => {
                m[c.value.outlet] = c;
                return m;
            }, {}) :
            {};
        currNode.children.forEach(c => {
            this.loadSegments(c, prevChildren[c.value.outlet], outletMap, components);
            StringMapWrapper.delete(prevChildren, c.value.outlet);
        });
        StringMapWrapper.forEach(prevChildren, (v, k) => this.unloadOutlet(outletMap._outlets[k], components));
    }
    loadSegments(currNode, prevNode, parentOutletMap, components) {
        let curr = currNode.value;
        let prev = isPresent(prevNode) ? prevNode.value : null;
        let outlet = this.getOutlet(parentOutletMap, currNode.value);
        if (equalSegments(curr, prev)) {
            this.loadChildSegments(currNode, prevNode, outlet.outletMap, components.concat([outlet.loadedComponent]));
        }
        else {
            this.unloadOutlet(outlet, components);
            if (this.performMutation) {
                let outletMap = new RouterOutletMap();
                let loadedComponent = this.loadNewSegment(outletMap, curr, prev, outlet);
                this.loadChildSegments(currNode, prevNode, outletMap, components.concat([loadedComponent]));
            }
        }
    }
    loadNewSegment(outletMap, curr, prev, outlet) {
        let resolved = ReflectiveInjector.resolve([provide(RouterOutletMap, { useValue: outletMap }), provide(RouteSegment, { useValue: curr })]);
        let ref = outlet.load(routeSegmentComponentFactory(curr), resolved, outletMap);
        if (hasLifecycleHook("routerOnActivate", ref.instance)) {
            ref.instance.routerOnActivate(curr, prev, this.currTree, this.prevTree);
        }
        return ref.instance;
    }
    getOutlet(outletMap, segment) {
        let outlet = outletMap._outlets[segment.outlet];
        if (isBlank(outlet)) {
            if (segment.outlet == DEFAULT_OUTLET_NAME) {
                throw new BaseException(`Cannot find default outlet`);
            }
            else {
                throw new BaseException(`Cannot find the outlet ${segment.outlet}`);
            }
        }
        return outlet;
    }
    unloadOutlet(outlet, components) {
        if (isPresent(outlet) && outlet.isLoaded) {
            StringMapWrapper.forEach(outlet.outletMap._outlets, (v, k) => this.unloadOutlet(v, components));
            if (this.performMutation) {
                outlet.unload();
            }
            else {
                this.deactivations.push(components.concat([outlet.loadedComponent]));
            }
        }
    }
}
