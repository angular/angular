import { StringMapWrapper, ListWrapper } from 'angular2/src/facade/collection';
import { isBlank, isPresent, stringify } from 'angular2/src/facade/lang';
export class Tree {
    constructor(root) {
        this._root = root;
    }
    get root() { return this._root.value; }
    parent(t) {
        let p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
    }
    children(t) {
        let n = _findNode(t, this._root);
        return isPresent(n) ? n.children.map(t => t.value) : null;
    }
    firstChild(t) {
        let n = _findNode(t, this._root);
        return isPresent(n) && n.children.length > 0 ? n.children[0].value : null;
    }
    pathFromRoot(t) { return _findPath(t, this._root, []).map(s => s.value); }
}
export class UrlTree extends Tree {
    constructor(root) {
        super(root);
    }
}
export class RouteTree extends Tree {
    constructor(root) {
        super(root);
    }
}
export function rootNode(tree) {
    return tree._root;
}
function _findNode(expected, c) {
    // TODO: vsavkin remove it once recognize is fixed
    if (expected instanceof RouteSegment && equalSegments(expected, c.value))
        return c;
    if (expected === c.value)
        return c;
    for (let cc of c.children) {
        let r = _findNode(expected, cc);
        if (isPresent(r))
            return r;
    }
    return null;
}
function _findPath(expected, c, collected) {
    collected.push(c);
    // TODO: vsavkin remove it once recognize is fixed
    if (expected instanceof RouteSegment && equalSegments(expected, c.value))
        return collected;
    if (expected === c.value)
        return collected;
    for (let cc of c.children) {
        let r = _findPath(expected, cc, ListWrapper.clone(collected));
        if (isPresent(r))
            return r;
    }
    return null;
}
export class TreeNode {
    constructor(value, children) {
        this.value = value;
        this.children = children;
    }
}
export class UrlSegment {
    constructor(segment, parameters, outlet) {
        this.segment = segment;
        this.parameters = parameters;
        this.outlet = outlet;
    }
    toString() {
        let outletPrefix = isBlank(this.outlet) ? "" : `${this.outlet}:`;
        let segmentPrefix = isBlank(this.segment) ? "" : this.segment;
        return `${outletPrefix}${segmentPrefix}${_serializeParams(this.parameters)}`;
    }
}
function _serializeParams(params) {
    let res = "";
    if (isPresent(params)) {
        StringMapWrapper.forEach(params, (v, k) => res += `;${k}=${v}`);
    }
    return res;
}
export class RouteSegment {
    constructor(urlSegments, parameters, outlet, type, componentFactory) {
        this.urlSegments = urlSegments;
        this.parameters = parameters;
        this.outlet = outlet;
        this._type = type;
        this._componentFactory = componentFactory;
    }
    getParam(param) {
        return isPresent(this.parameters) ? this.parameters[param] : null;
    }
    get type() { return this._type; }
    get stringifiedUrlSegments() { return this.urlSegments.map(s => s.toString()).join("/"); }
}
export function serializeRouteSegmentTree(tree) {
    return _serializeRouteSegmentTree(tree._root);
}
function _serializeRouteSegmentTree(node) {
    let v = node.value;
    let children = node.children.map(c => _serializeRouteSegmentTree(c)).join(", ");
    return `${v.outlet}:${v.stringifiedUrlSegments}(${stringify(v.type)}) [${children}]`;
}
export function equalSegments(a, b) {
    if (isBlank(a) && !isBlank(b))
        return false;
    if (!isBlank(a) && isBlank(b))
        return false;
    if (a._type !== b._type)
        return false;
    if (isBlank(a.parameters) && !isBlank(b.parameters))
        return false;
    if (!isBlank(a.parameters) && isBlank(b.parameters))
        return false;
    if (isBlank(a.parameters) && isBlank(b.parameters))
        return true;
    return StringMapWrapper.equals(a.parameters, b.parameters);
}
export function routeSegmentComponentFactory(a) {
    return a._componentFactory;
}
