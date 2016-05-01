import { isPresent } from 'angular2/src/facade/lang';
import { ListWrapper, MapWrapper } from 'angular2/src/facade/collection';
export class EventListener {
    constructor(name, callback) {
        this.name = name;
        this.callback = callback;
    }
    ;
}
export class DebugNode {
    constructor(nativeNode, parent, _debugInfo) {
        this._debugInfo = _debugInfo;
        this.nativeNode = nativeNode;
        if (isPresent(parent) && parent instanceof DebugElement) {
            parent.addChild(this);
        }
        else {
            this.parent = null;
        }
        this.listeners = [];
    }
    get injector() { return isPresent(this._debugInfo) ? this._debugInfo.injector : null; }
    get componentInstance() {
        return isPresent(this._debugInfo) ? this._debugInfo.component : null;
    }
    get context() { return isPresent(this._debugInfo) ? this._debugInfo.context : null; }
    get references() {
        return isPresent(this._debugInfo) ? this._debugInfo.references : null;
    }
    get providerTokens() {
        return isPresent(this._debugInfo) ? this._debugInfo.providerTokens : null;
    }
    get source() { return isPresent(this._debugInfo) ? this._debugInfo.source : null; }
    /**
     * Use injector.get(token) instead.
     *
     * @deprecated
     */
    inject(token) { return this.injector.get(token); }
}
export class DebugElement extends DebugNode {
    constructor(nativeNode, parent, _debugInfo) {
        super(nativeNode, parent, _debugInfo);
        this.properties = {};
        this.attributes = {};
        this.childNodes = [];
        this.nativeElement = nativeNode;
    }
    addChild(child) {
        if (isPresent(child)) {
            this.childNodes.push(child);
            child.parent = this;
        }
    }
    removeChild(child) {
        var childIndex = this.childNodes.indexOf(child);
        if (childIndex !== -1) {
            child.parent = null;
            this.childNodes.splice(childIndex, 1);
        }
    }
    insertChildrenAfter(child, newChildren) {
        var siblingIndex = this.childNodes.indexOf(child);
        if (siblingIndex !== -1) {
            var previousChildren = this.childNodes.slice(0, siblingIndex + 1);
            var nextChildren = this.childNodes.slice(siblingIndex + 1);
            this.childNodes =
                ListWrapper.concat(ListWrapper.concat(previousChildren, newChildren), nextChildren);
            for (var i = 0; i < newChildren.length; ++i) {
                var newChild = newChildren[i];
                if (isPresent(newChild.parent)) {
                    newChild.parent.removeChild(newChild);
                }
                newChild.parent = this;
            }
        }
    }
    query(predicate) {
        var results = this.queryAll(predicate);
        return results.length > 0 ? results[0] : null;
    }
    queryAll(predicate) {
        var matches = [];
        _queryElementChildren(this, predicate, matches);
        return matches;
    }
    queryAllNodes(predicate) {
        var matches = [];
        _queryNodeChildren(this, predicate, matches);
        return matches;
    }
    get children() {
        var children = [];
        this.childNodes.forEach((node) => {
            if (node instanceof DebugElement) {
                children.push(node);
            }
        });
        return children;
    }
    triggerEventHandler(eventName, eventObj) {
        this.listeners.forEach((listener) => {
            if (listener.name == eventName) {
                listener.callback(eventObj);
            }
        });
    }
}
export function asNativeElements(debugEls) {
    return debugEls.map((el) => el.nativeElement);
}
function _queryElementChildren(element, predicate, matches) {
    element.childNodes.forEach(node => {
        if (node instanceof DebugElement) {
            if (predicate(node)) {
                matches.push(node);
            }
            _queryElementChildren(node, predicate, matches);
        }
    });
}
function _queryNodeChildren(parentNode, predicate, matches) {
    if (parentNode instanceof DebugElement) {
        parentNode.childNodes.forEach(node => {
            if (predicate(node)) {
                matches.push(node);
            }
            if (node instanceof DebugElement) {
                _queryNodeChildren(node, predicate, matches);
            }
        });
    }
}
// Need to keep the nodes in a global Map so that multiple angular apps are supported.
var _nativeNodeToDebugNode = new Map();
export function getDebugNode(nativeNode) {
    return _nativeNodeToDebugNode.get(nativeNode);
}
export function getAllDebugNodes() {
    return MapWrapper.values(_nativeNodeToDebugNode);
}
export function indexDebugNode(node) {
    _nativeNodeToDebugNode.set(node.nativeNode, node);
}
export function removeDebugNodeFromIndex(node) {
    _nativeNodeToDebugNode.delete(node.nativeNode);
}
