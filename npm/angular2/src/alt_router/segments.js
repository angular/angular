'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var Tree = (function () {
    function Tree(root) {
        this._root = root;
    }
    Object.defineProperty(Tree.prototype, "root", {
        get: function () { return this._root.value; },
        enumerable: true,
        configurable: true
    });
    Tree.prototype.parent = function (t) {
        var p = this.pathFromRoot(t);
        return p.length > 1 ? p[p.length - 2] : null;
    };
    Tree.prototype.children = function (t) {
        var n = _findNode(t, this._root);
        return lang_1.isPresent(n) ? n.children.map(function (t) { return t.value; }) : null;
    };
    Tree.prototype.firstChild = function (t) {
        var n = _findNode(t, this._root);
        return lang_1.isPresent(n) && n.children.length > 0 ? n.children[0].value : null;
    };
    Tree.prototype.pathFromRoot = function (t) { return _findPath(t, this._root, []).map(function (s) { return s.value; }); };
    return Tree;
}());
exports.Tree = Tree;
var UrlTree = (function (_super) {
    __extends(UrlTree, _super);
    function UrlTree(root) {
        _super.call(this, root);
    }
    return UrlTree;
}(Tree));
exports.UrlTree = UrlTree;
var RouteTree = (function (_super) {
    __extends(RouteTree, _super);
    function RouteTree(root) {
        _super.call(this, root);
    }
    return RouteTree;
}(Tree));
exports.RouteTree = RouteTree;
function rootNode(tree) {
    return tree._root;
}
exports.rootNode = rootNode;
function _findNode(expected, c) {
    // TODO: vsavkin remove it once recognize is fixed
    if (expected instanceof RouteSegment && equalSegments(expected, c.value))
        return c;
    if (expected === c.value)
        return c;
    for (var _i = 0, _a = c.children; _i < _a.length; _i++) {
        var cc = _a[_i];
        var r = _findNode(expected, cc);
        if (lang_1.isPresent(r))
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
    for (var _i = 0, _a = c.children; _i < _a.length; _i++) {
        var cc = _a[_i];
        var r = _findPath(expected, cc, collection_1.ListWrapper.clone(collected));
        if (lang_1.isPresent(r))
            return r;
    }
    return null;
}
var TreeNode = (function () {
    function TreeNode(value, children) {
        this.value = value;
        this.children = children;
    }
    return TreeNode;
}());
exports.TreeNode = TreeNode;
var UrlSegment = (function () {
    function UrlSegment(segment, parameters, outlet) {
        this.segment = segment;
        this.parameters = parameters;
        this.outlet = outlet;
    }
    UrlSegment.prototype.toString = function () {
        var outletPrefix = lang_1.isBlank(this.outlet) ? "" : this.outlet + ":";
        var segmentPrefix = lang_1.isBlank(this.segment) ? "" : this.segment;
        return "" + outletPrefix + segmentPrefix + _serializeParams(this.parameters);
    };
    return UrlSegment;
}());
exports.UrlSegment = UrlSegment;
function _serializeParams(params) {
    var res = "";
    if (lang_1.isPresent(params)) {
        collection_1.StringMapWrapper.forEach(params, function (v, k) { return res += ";" + k + "=" + v; });
    }
    return res;
}
var RouteSegment = (function () {
    function RouteSegment(urlSegments, parameters, outlet, type, componentFactory) {
        this.urlSegments = urlSegments;
        this.parameters = parameters;
        this.outlet = outlet;
        this._type = type;
        this._componentFactory = componentFactory;
    }
    RouteSegment.prototype.getParam = function (param) {
        return lang_1.isPresent(this.parameters) ? this.parameters[param] : null;
    };
    Object.defineProperty(RouteSegment.prototype, "type", {
        get: function () { return this._type; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouteSegment.prototype, "stringifiedUrlSegments", {
        get: function () { return this.urlSegments.map(function (s) { return s.toString(); }).join("/"); },
        enumerable: true,
        configurable: true
    });
    return RouteSegment;
}());
exports.RouteSegment = RouteSegment;
function serializeRouteSegmentTree(tree) {
    return _serializeRouteSegmentTree(tree._root);
}
exports.serializeRouteSegmentTree = serializeRouteSegmentTree;
function _serializeRouteSegmentTree(node) {
    var v = node.value;
    var children = node.children.map(function (c) { return _serializeRouteSegmentTree(c); }).join(", ");
    return v.outlet + ":" + v.stringifiedUrlSegments + "(" + lang_1.stringify(v.type) + ") [" + children + "]";
}
function equalSegments(a, b) {
    if (lang_1.isBlank(a) && !lang_1.isBlank(b))
        return false;
    if (!lang_1.isBlank(a) && lang_1.isBlank(b))
        return false;
    if (a._type !== b._type)
        return false;
    if (lang_1.isBlank(a.parameters) && !lang_1.isBlank(b.parameters))
        return false;
    if (!lang_1.isBlank(a.parameters) && lang_1.isBlank(b.parameters))
        return false;
    if (lang_1.isBlank(a.parameters) && lang_1.isBlank(b.parameters))
        return true;
    return collection_1.StringMapWrapper.equals(a.parameters, b.parameters);
}
exports.equalSegments = equalSegments;
function routeSegmentComponentFactory(a) {
    return a._componentFactory;
}
exports.routeSegmentComponentFactory = routeSegmentComponentFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9zZWdtZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RSxxQkFBa0QsMEJBQTBCLENBQUMsQ0FBQTtBQUU3RTtJQUlFLGNBQVksSUFBaUI7UUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUFDLENBQUM7SUFFckQsc0JBQUksc0JBQUk7YUFBUixjQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUUxQyxxQkFBTSxHQUFOLFVBQU8sQ0FBSTtRQUNULElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUMvQyxDQUFDO0lBRUQsdUJBQVEsR0FBUixVQUFTLENBQUk7UUFDWCxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqQyxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxLQUFLLEVBQVAsQ0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQzVELENBQUM7SUFFRCx5QkFBVSxHQUFWLFVBQVcsQ0FBSTtRQUNiLElBQUksQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtB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QUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFSZSxxQkFBYSxnQkFRNUIsQ0FBQTtBQUVELHNDQUE2QyxDQUFlO0lBQzFELE1BQU0sQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUM7QUFDN0IsQ0FBQztBQUZlLG9DQUE0QiwrQkFFM0MsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtUeXBlLCBpc0JsYW5rLCBpc1ByZXNlbnQsIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuZXhwb3J0IGNsYXNzIFRyZWU8VD4ge1xuICAvKiogQGludGVybmFsICovXG4gIF9yb290OiBUcmVlTm9kZTxUPjtcblxuICBjb25zdHJ1Y3Rvcihyb290OiBUcmVlTm9kZTxUPikgeyB0aGlzLl9yb290ID0gcm9vdDsgfVxuXG4gIGdldCByb290KCk6IFQgeyByZXR1cm4gdGhpcy5fcm9vdC52YWx1ZTsgfVxuXG4gIHBhcmVudCh0OiBUKTogVCB7XG4gICAgbGV0IHAgPSB0aGlzLnBhdGhGcm9tUm9vdCh0KTtcbiAgICByZXR1cm4gcC5sZW5ndGggPiAxID8gcFtwLmxlbmd0aCAtIDJdIDogbnVsbDtcbiAgfVxuXG4gIGNoaWxkcmVuKHQ6IFQpOiBUW10ge1xuICAgIGxldCBuID0gX2ZpbmROb2RlKHQsIHRoaXMuX3Jvb3QpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobikgPyBuLmNoaWxkcmVuLm1hcCh0ID0+IHQudmFsdWUpIDogbnVsbDtcbiAgfVxuXG4gIGZpcnN0Q2hpbGQodDogVCk6IFQge1xuICAgIGxldCBuID0gX2ZpbmROb2RlKHQsIHRoaXMuX3Jvb3QpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobikgJiYgbi5jaGlsZHJlbi5sZW5ndGggPiAwID8gbi5jaGlsZHJlblswXS52YWx1ZSA6IG51bGw7XG4gIH1cblxuICBwYXRoRnJvbVJvb3QodDogVCk6IFRbXSB7IHJldHVybiBfZmluZFBhdGgodCwgdGhpcy5fcm9vdCwgW10pLm1hcChzID0+IHMudmFsdWUpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBVcmxUcmVlIGV4dGVuZHMgVHJlZTxVcmxTZWdtZW50PiB7XG4gIGNvbnN0cnVjdG9yKHJvb3Q6IFRyZWVOb2RlPFVybFNlZ21lbnQ+KSB7IHN1cGVyKHJvb3QpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBSb3V0ZVRyZWUgZXh0ZW5kcyBUcmVlPFJvdXRlU2VnbWVudD4ge1xuICBjb25zdHJ1Y3Rvcihyb290OiBUcmVlTm9kZTxSb3V0ZVNlZ21lbnQ+KSB7IHN1cGVyKHJvb3QpOyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb290Tm9kZTxUPih0cmVlOiBUcmVlPFQ+KTogVHJlZU5vZGU8VD4ge1xuICByZXR1cm4gdHJlZS5fcm9vdDtcbn1cblxuZnVuY3Rpb24gX2ZpbmROb2RlPFQ+KGV4cGVjdGVkOiBULCBjOiBUcmVlTm9kZTxUPik6IFRyZWVOb2RlPFQ+IHtcbiAgLy8gVE9ETzogdnNhdmtpbiByZW1vdmUgaXQgb25jZSByZWNvZ25pemUgaXMgZml4ZWRcbiAgaWYgKGV4cGVjdGVkIGluc3RhbmNlb2YgUm91dGVTZWdtZW50ICYmIGVxdWFsU2VnbWVudHMoPGFueT5leHBlY3RlZCwgPGFueT5jLnZhbHVlKSkgcmV0dXJuIGM7XG4gIGlmIChleHBlY3RlZCA9PT0gYy52YWx1ZSkgcmV0dXJuIGM7XG4gIGZvciAobGV0IGNjIG9mIGMuY2hpbGRyZW4pIHtcbiAgICBsZXQgciA9IF9maW5kTm9kZShleHBlY3RlZCwgY2MpO1xuICAgIGlmIChpc1ByZXNlbnQocikpIHJldHVybiByO1xuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG5mdW5jdGlvbiBfZmluZFBhdGg8VD4oZXhwZWN0ZWQ6IFQsIGM6IFRyZWVOb2RlPFQ+LCBjb2xsZWN0ZWQ6IFRyZWVOb2RlPFQ+W10pOiBUcmVlTm9kZTxUPltdIHtcbiAgY29sbGVjdGVkLnB1c2goYyk7XG5cbiAgLy8gVE9ETzogdnNhdmtpbiByZW1vdmUgaXQgb25jZSByZWNvZ25pemUgaXMgZml4ZWRcbiAgaWYgKGV4cGVjdGVkIGluc3RhbmNlb2YgUm91dGVTZWdtZW50ICYmIGVxdWFsU2VnbWVudHMoPGFueT5leHBlY3RlZCwgPGFueT5jLnZhbHVlKSlcbiAgICByZXR1cm4gY29sbGVjdGVkO1xuICBpZiAoZXhwZWN0ZWQgPT09IGMudmFsdWUpIHJldHVybiBjb2xsZWN0ZWQ7XG4gIGZvciAobGV0IGNjIG9mIGMuY2hpbGRyZW4pIHtcbiAgICBsZXQgciA9IF9maW5kUGF0aChleHBlY3RlZCwgY2MsIExpc3RXcmFwcGVyLmNsb25lKGNvbGxlY3RlZCkpO1xuICAgIGlmIChpc1ByZXNlbnQocikpIHJldHVybiByO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBjbGFzcyBUcmVlTm9kZTxUPiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWx1ZTogVCwgcHVibGljIGNoaWxkcmVuOiBUcmVlTm9kZTxUPltdKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgVXJsU2VnbWVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWdtZW50OiBhbnksIHB1YmxpYyBwYXJhbWV0ZXJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgcHVibGljIG91dGxldDogc3RyaW5nKSB7fVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgbGV0IG91dGxldFByZWZpeCA9IGlzQmxhbmsodGhpcy5vdXRsZXQpID8gXCJcIiA6IGAke3RoaXMub3V0bGV0fTpgO1xuICAgIGxldCBzZWdtZW50UHJlZml4ID0gaXNCbGFuayh0aGlzLnNlZ21lbnQpID8gXCJcIiA6IHRoaXMuc2VnbWVudDtcbiAgICByZXR1cm4gYCR7b3V0bGV0UHJlZml4fSR7c2VnbWVudFByZWZpeH0ke19zZXJpYWxpemVQYXJhbXModGhpcy5wYXJhbWV0ZXJzKX1gO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9zZXJpYWxpemVQYXJhbXMocGFyYW1zOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHN0cmluZyB7XG4gIGxldCByZXMgPSBcIlwiO1xuICBpZiAoaXNQcmVzZW50KHBhcmFtcykpIHtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gocGFyYW1zLCAodiwgaykgPT4gcmVzICs9IGA7JHtrfT0ke3Z9YCk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0IGNsYXNzIFJvdXRlU2VnbWVudCB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3R5cGU6IFR5cGU7XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+O1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB1cmxTZWdtZW50czogVXJsU2VnbWVudFtdLCBwdWJsaWMgcGFyYW1ldGVyczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgICAgICAgICAgIHB1YmxpYyBvdXRsZXQ6IHN0cmluZywgdHlwZTogVHlwZSwgY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+KSB7XG4gICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gICAgdGhpcy5fY29tcG9uZW50RmFjdG9yeSA9IGNvbXBvbmVudEZhY3Rvcnk7XG4gIH1cblxuICBnZXRQYXJhbShwYXJhbTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMucGFyYW1ldGVycykgPyB0aGlzLnBhcmFtZXRlcnNbcGFyYW1dIDogbnVsbDtcbiAgfVxuXG4gIGdldCB0eXBlKCk6IFR5cGUgeyByZXR1cm4gdGhpcy5fdHlwZTsgfVxuXG4gIGdldCBzdHJpbmdpZmllZFVybFNlZ21lbnRzKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnVybFNlZ21lbnRzLm1hcChzID0+IHMudG9TdHJpbmcoKSkuam9pbihcIi9cIik7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZVJvdXRlU2VnbWVudFRyZWUodHJlZTogUm91dGVUcmVlKTogc3RyaW5nIHtcbiAgcmV0dXJuIF9zZXJpYWxpemVSb3V0ZVNlZ21lbnRUcmVlKHRyZWUuX3Jvb3QpO1xufVxuXG5mdW5jdGlvbiBfc2VyaWFsaXplUm91dGVTZWdtZW50VHJlZShub2RlOiBUcmVlTm9kZTxSb3V0ZVNlZ21lbnQ+KTogc3RyaW5nIHtcbiAgbGV0IHYgPSBub2RlLnZhbHVlO1xuICBsZXQgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLm1hcChjID0+IF9zZXJpYWxpemVSb3V0ZVNlZ21lbnRUcmVlKGMpKS5qb2luKFwiLCBcIik7XG4gIHJldHVybiBgJHt2Lm91dGxldH06JHt2LnN0cmluZ2lmaWVkVXJsU2VnbWVudHN9KCR7c3RyaW5naWZ5KHYudHlwZSl9KSBbJHtjaGlsZHJlbn1dYDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFsU2VnbWVudHMoYTogUm91dGVTZWdtZW50LCBiOiBSb3V0ZVNlZ21lbnQpOiBib29sZWFuIHtcbiAgaWYgKGlzQmxhbmsoYSkgJiYgIWlzQmxhbmsoYikpIHJldHVybiBmYWxzZTtcbiAgaWYgKCFpc0JsYW5rKGEpICYmIGlzQmxhbmsoYikpIHJldHVybiBmYWxzZTtcbiAgaWYgKGEuX3R5cGUgIT09IGIuX3R5cGUpIHJldHVybiBmYWxzZTtcbiAgaWYgKGlzQmxhbmsoYS5wYXJhbWV0ZXJzKSAmJiAhaXNCbGFuayhiLnBhcmFtZXRlcnMpKSByZXR1cm4gZmFsc2U7XG4gIGlmICghaXNCbGFuayhhLnBhcmFtZXRlcnMpICYmIGlzQmxhbmsoYi5wYXJhbWV0ZXJzKSkgcmV0dXJuIGZhbHNlO1xuICBpZiAoaXNCbGFuayhhLnBhcmFtZXRlcnMpICYmIGlzQmxhbmsoYi5wYXJhbWV0ZXJzKSkgcmV0dXJuIHRydWU7XG4gIHJldHVybiBTdHJpbmdNYXBXcmFwcGVyLmVxdWFscyhhLnBhcmFtZXRlcnMsIGIucGFyYW1ldGVycyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3V0ZVNlZ21lbnRDb21wb25lbnRGYWN0b3J5KGE6IFJvdXRlU2VnbWVudCk6IENvbXBvbmVudEZhY3Rvcnk8YW55PiB7XG4gIHJldHVybiBhLl9jb21wb25lbnRGYWN0b3J5O1xufSJdfQ==