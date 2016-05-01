"format register";
System.register("angular2/src/alt_router/segments", ["angular2/src/facade/collection", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var Tree = (function() {
    function Tree(root) {
      this._root = root;
    }
    Object.defineProperty(Tree.prototype, "root", {
      get: function() {
        return this._root.value;
      },
      enumerable: true,
      configurable: true
    });
    Tree.prototype.parent = function(t) {
      var p = this.pathFromRoot(t);
      return p.length > 1 ? p[p.length - 2] : null;
    };
    Tree.prototype.children = function(t) {
      var n = _findNode(t, this._root);
      return lang_1.isPresent(n) ? n.children.map(function(t) {
        return t.value;
      }) : null;
    };
    Tree.prototype.firstChild = function(t) {
      var n = _findNode(t, this._root);
      return lang_1.isPresent(n) && n.children.length > 0 ? n.children[0].value : null;
    };
    Tree.prototype.pathFromRoot = function(t) {
      return _findPath(t, this._root, []).map(function(s) {
        return s.value;
      });
    };
    return Tree;
  }());
  exports.Tree = Tree;
  var UrlTree = (function(_super) {
    __extends(UrlTree, _super);
    function UrlTree(root) {
      _super.call(this, root);
    }
    return UrlTree;
  }(Tree));
  exports.UrlTree = UrlTree;
  var RouteTree = (function(_super) {
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
    if (expected instanceof RouteSegment && equalSegments(expected, c.value))
      return c;
    if (expected === c.value)
      return c;
    for (var _i = 0,
        _a = c.children; _i < _a.length; _i++) {
      var cc = _a[_i];
      var r = _findNode(expected, cc);
      if (lang_1.isPresent(r))
        return r;
    }
    return null;
  }
  function _findPath(expected, c, collected) {
    collected.push(c);
    if (expected instanceof RouteSegment && equalSegments(expected, c.value))
      return collected;
    if (expected === c.value)
      return collected;
    for (var _i = 0,
        _a = c.children; _i < _a.length; _i++) {
      var cc = _a[_i];
      var r = _findPath(expected, cc, collection_1.ListWrapper.clone(collected));
      if (lang_1.isPresent(r))
        return r;
    }
    return null;
  }
  var TreeNode = (function() {
    function TreeNode(value, children) {
      this.value = value;
      this.children = children;
    }
    return TreeNode;
  }());
  exports.TreeNode = TreeNode;
  var UrlSegment = (function() {
    function UrlSegment(segment, parameters, outlet) {
      this.segment = segment;
      this.parameters = parameters;
      this.outlet = outlet;
    }
    UrlSegment.prototype.toString = function() {
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
      collection_1.StringMapWrapper.forEach(params, function(v, k) {
        return res += ";" + k + "=" + v;
      });
    }
    return res;
  }
  var RouteSegment = (function() {
    function RouteSegment(urlSegments, parameters, outlet, type, componentFactory) {
      this.urlSegments = urlSegments;
      this.parameters = parameters;
      this.outlet = outlet;
      this._type = type;
      this._componentFactory = componentFactory;
    }
    RouteSegment.prototype.getParam = function(param) {
      return lang_1.isPresent(this.parameters) ? this.parameters[param] : null;
    };
    Object.defineProperty(RouteSegment.prototype, "type", {
      get: function() {
        return this._type;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(RouteSegment.prototype, "stringifiedUrlSegments", {
      get: function() {
        return this.urlSegments.map(function(s) {
          return s.toString();
        }).join("/");
      },
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
    var children = node.children.map(function(c) {
      return _serializeRouteSegmentTree(c);
    }).join(", ");
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
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/metadata/metadata", ["angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var RouteMetadata = (function() {
    function RouteMetadata() {}
    Object.defineProperty(RouteMetadata.prototype, "path", {
      get: function() {},
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(RouteMetadata.prototype, "component", {
      get: function() {},
      enumerable: true,
      configurable: true
    });
    return RouteMetadata;
  }());
  exports.RouteMetadata = RouteMetadata;
  var Route = (function() {
    function Route(_a) {
      var _b = _a === void 0 ? {} : _a,
          path = _b.path,
          component = _b.component;
      this.path = path;
      this.component = component;
    }
    Route.prototype.toString = function() {
      return "@Route(" + this.path + ", " + lang_1.stringify(this.component) + ")";
    };
    return Route;
  }());
  exports.Route = Route;
  var RoutesMetadata = (function() {
    function RoutesMetadata(routes) {
      this.routes = routes;
    }
    RoutesMetadata.prototype.toString = function() {
      return "@Routes(" + this.routes + ")";
    };
    return RoutesMetadata;
  }());
  exports.RoutesMetadata = RoutesMetadata;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/constants", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.DEFAULT_OUTLET_NAME = "__DEFAULT";
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/link", ["angular2/src/alt_router/segments", "angular2/src/facade/lang", "angular2/src/facade/collection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var segments_1 = require("angular2/src/alt_router/segments");
  var lang_1 = require("angular2/src/facade/lang");
  var collection_1 = require("angular2/src/facade/collection");
  function link(segment, routeTree, urlTree, change) {
    if (change.length === 0)
      return urlTree;
    var startingNode;
    var normalizedChange;
    if (lang_1.isString(change[0]) && change[0].startsWith("./")) {
      normalizedChange = ["/", change[0].substring(2)].concat(change.slice(1));
      startingNode = _findStartingNode(_findUrlSegment(segment, routeTree), segments_1.rootNode(urlTree));
    } else if (lang_1.isString(change[0]) && change.length === 1 && change[0] == "/") {
      normalizedChange = change;
      startingNode = segments_1.rootNode(urlTree);
    } else if (lang_1.isString(change[0]) && !change[0].startsWith("/")) {
      normalizedChange = ["/"].concat(change);
      startingNode = _findStartingNode(_findUrlSegment(segment, routeTree), segments_1.rootNode(urlTree));
    } else {
      normalizedChange = ["/"].concat(change);
      startingNode = segments_1.rootNode(urlTree);
    }
    var updated = _update(startingNode, normalizedChange);
    var newRoot = _constructNewTree(segments_1.rootNode(urlTree), startingNode, updated);
    return new segments_1.UrlTree(newRoot);
  }
  exports.link = link;
  function _findUrlSegment(segment, routeTree) {
    var s = segment;
    var res = null;
    while (lang_1.isBlank(res)) {
      res = collection_1.ListWrapper.last(s.urlSegments);
      s = routeTree.parent(s);
    }
    return res;
  }
  function _findStartingNode(segment, node) {
    if (node.value === segment)
      return node;
    for (var _i = 0,
        _a = node.children; _i < _a.length; _i++) {
      var c = _a[_i];
      var r = _findStartingNode(segment, c);
      if (lang_1.isPresent(r))
        return r;
    }
    return null;
  }
  function _constructNewTree(node, original, updated) {
    if (node === original) {
      return new segments_1.TreeNode(node.value, updated.children);
    } else {
      return new segments_1.TreeNode(node.value, node.children.map(function(c) {
        return _constructNewTree(c, original, updated);
      }));
    }
  }
  function _update(node, changes) {
    var rest = changes.slice(1);
    var outlet = _outlet(changes);
    var segment = _segment(changes);
    if (lang_1.isString(segment) && segment[0] == "/")
      segment = segment.substring(1);
    if (lang_1.isBlank(node)) {
      var urlSegment = new segments_1.UrlSegment(segment, null, outlet);
      var children = rest.length === 0 ? [] : [_update(null, rest)];
      return new segments_1.TreeNode(urlSegment, children);
    } else if (outlet != node.value.outlet) {
      return node;
    } else {
      var urlSegment = lang_1.isStringMap(segment) ? new segments_1.UrlSegment(null, segment, null) : new segments_1.UrlSegment(segment, null, outlet);
      if (rest.length === 0) {
        return new segments_1.TreeNode(urlSegment, []);
      }
      return new segments_1.TreeNode(urlSegment, _updateMany(collection_1.ListWrapper.clone(node.children), rest));
    }
  }
  function _updateMany(nodes, changes) {
    var outlet = _outlet(changes);
    var nodesInRightOutlet = nodes.filter(function(c) {
      return c.value.outlet == outlet;
    });
    if (nodesInRightOutlet.length > 0) {
      var nodeRightOutlet = nodesInRightOutlet[0];
      nodes[nodes.indexOf(nodeRightOutlet)] = _update(nodeRightOutlet, changes);
    } else {
      nodes.push(_update(null, changes));
    }
    return nodes;
  }
  function _segment(changes) {
    if (!lang_1.isString(changes[0]))
      return changes[0];
    var parts = changes[0].toString().split(":");
    return parts.length > 1 ? parts[1] : changes[0];
  }
  function _outlet(changes) {
    if (!lang_1.isString(changes[0]))
      return null;
    var parts = changes[0].toString().split(":");
    return parts.length > 1 ? parts[0] : null;
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/lifecycle_reflector", ["angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  function hasLifecycleHook(name, obj) {
    if (lang_1.isBlank(obj))
      return false;
    var type = obj.constructor;
    if (!(type instanceof lang_1.Type))
      return false;
    return name in type.prototype;
  }
  exports.hasLifecycleHook = hasLifecycleHook;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/metadata/decorators", ["angular2/src/alt_router/metadata/metadata", "angular2/src/core/util/decorators"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var metadata_1 = require("angular2/src/alt_router/metadata/metadata");
  var decorators_1 = require("angular2/src/core/util/decorators");
  exports.Routes = decorators_1.makeDecorator(metadata_1.RoutesMetadata);
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/router_url_serializer", ["angular2/src/alt_router/segments", "angular2/src/facade/exceptions", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var segments_1 = require("angular2/src/alt_router/segments");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var lang_1 = require("angular2/src/facade/lang");
  var RouterUrlSerializer = (function() {
    function RouterUrlSerializer() {}
    return RouterUrlSerializer;
  }());
  exports.RouterUrlSerializer = RouterUrlSerializer;
  var DefaultRouterUrlSerializer = (function(_super) {
    __extends(DefaultRouterUrlSerializer, _super);
    function DefaultRouterUrlSerializer() {
      _super.apply(this, arguments);
    }
    DefaultRouterUrlSerializer.prototype.parse = function(url) {
      var root = new _UrlParser().parse(url);
      return new segments_1.UrlTree(root);
    };
    DefaultRouterUrlSerializer.prototype.serialize = function(tree) {
      return _serializeUrlTreeNode(segments_1.rootNode(tree));
    };
    return DefaultRouterUrlSerializer;
  }(RouterUrlSerializer));
  exports.DefaultRouterUrlSerializer = DefaultRouterUrlSerializer;
  function _serializeUrlTreeNode(node) {
    return "" + node.value + _serializeChildren(node);
  }
  function _serializeUrlTreeNodes(nodes) {
    var main = nodes[0].value.toString();
    var auxNodes = nodes.slice(1);
    var aux = auxNodes.length > 0 ? "(" + auxNodes.map(_serializeUrlTreeNode).join("//") + ")" : "";
    var children = _serializeChildren(nodes[0]);
    return "" + main + aux + children;
  }
  function _serializeChildren(node) {
    if (node.children.length > 0) {
      var slash = lang_1.isBlank(node.children[0].value.segment) ? "" : "/";
      return "" + slash + _serializeUrlTreeNodes(node.children);
    } else {
      return "";
    }
  }
  var SEGMENT_RE = lang_1.RegExpWrapper.create('^[^\\/\\(\\)\\?;=&#]+');
  function matchUrlSegment(str) {
    var match = lang_1.RegExpWrapper.firstMatch(SEGMENT_RE, str);
    return lang_1.isPresent(match) ? match[0] : '';
  }
  var QUERY_PARAM_VALUE_RE = lang_1.RegExpWrapper.create('^[^\\(\\)\\?;&#]+');
  function matchUrlQueryParamValue(str) {
    var match = lang_1.RegExpWrapper.firstMatch(QUERY_PARAM_VALUE_RE, str);
    return lang_1.isPresent(match) ? match[0] : '';
  }
  var _UrlParser = (function() {
    function _UrlParser() {}
    _UrlParser.prototype.peekStartsWith = function(str) {
      return this._remaining.startsWith(str);
    };
    _UrlParser.prototype.capture = function(str) {
      if (!this._remaining.startsWith(str)) {
        throw new exceptions_1.BaseException("Expected \"" + str + "\".");
      }
      this._remaining = this._remaining.substring(str.length);
    };
    _UrlParser.prototype.parse = function(url) {
      this._remaining = url;
      if (url == '' || url == '/') {
        return new segments_1.TreeNode(new segments_1.UrlSegment('', null, null), []);
      } else {
        return this.parseRoot();
      }
    };
    _UrlParser.prototype.parseRoot = function() {
      var segments = this.parseSegments();
      var queryParams = this.peekStartsWith('?') ? this.parseQueryParams() : null;
      return new segments_1.TreeNode(new segments_1.UrlSegment('', queryParams, null), segments);
    };
    _UrlParser.prototype.parseSegments = function(outletName) {
      if (outletName === void 0) {
        outletName = null;
      }
      if (this._remaining.length == 0) {
        return [];
      }
      if (this.peekStartsWith('/')) {
        this.capture('/');
      }
      var path = matchUrlSegment(this._remaining);
      this.capture(path);
      if (path.indexOf(":") > -1) {
        var parts = path.split(":");
        outletName = parts[0];
        path = parts[1];
      }
      var matrixParams = null;
      if (this.peekStartsWith(';')) {
        matrixParams = this.parseMatrixParams();
      }
      var aux = [];
      if (this.peekStartsWith('(')) {
        aux = this.parseAuxiliaryRoutes();
      }
      var children = [];
      if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
        this.capture('/');
        children = this.parseSegments();
      }
      if (lang_1.isPresent(matrixParams)) {
        var matrixParamsSegment = new segments_1.UrlSegment(null, matrixParams, null);
        var matrixParamsNode = new segments_1.TreeNode(matrixParamsSegment, children);
        var segment = new segments_1.UrlSegment(path, null, outletName);
        return [new segments_1.TreeNode(segment, [matrixParamsNode].concat(aux))];
      } else {
        var segment = new segments_1.UrlSegment(path, null, outletName);
        var node = new segments_1.TreeNode(segment, children);
        return [node].concat(aux);
      }
    };
    _UrlParser.prototype.parseQueryParams = function() {
      var params = {};
      this.capture('?');
      this.parseQueryParam(params);
      while (this._remaining.length > 0 && this.peekStartsWith('&')) {
        this.capture('&');
        this.parseQueryParam(params);
      }
      return params;
    };
    _UrlParser.prototype.parseMatrixParams = function() {
      var params = {};
      while (this._remaining.length > 0 && this.peekStartsWith(';')) {
        this.capture(';');
        this.parseParam(params);
      }
      return params;
    };
    _UrlParser.prototype.parseParam = function(params) {
      var key = matchUrlSegment(this._remaining);
      if (lang_1.isBlank(key)) {
        return ;
      }
      this.capture(key);
      var value = "true";
      if (this.peekStartsWith('=')) {
        this.capture('=');
        var valueMatch = matchUrlSegment(this._remaining);
        if (lang_1.isPresent(valueMatch)) {
          value = valueMatch;
          this.capture(value);
        }
      }
      params[key] = value;
    };
    _UrlParser.prototype.parseQueryParam = function(params) {
      var key = matchUrlSegment(this._remaining);
      if (lang_1.isBlank(key)) {
        return ;
      }
      this.capture(key);
      var value = "true";
      if (this.peekStartsWith('=')) {
        this.capture('=');
        var valueMatch = matchUrlQueryParamValue(this._remaining);
        if (lang_1.isPresent(valueMatch)) {
          value = valueMatch;
          this.capture(value);
        }
      }
      params[key] = value;
    };
    _UrlParser.prototype.parseAuxiliaryRoutes = function() {
      var segments = [];
      this.capture('(');
      while (!this.peekStartsWith(')') && this._remaining.length > 0) {
        segments = segments.concat(this.parseSegments("aux"));
        if (this.peekStartsWith('//')) {
          this.capture('//');
        }
      }
      this.capture(')');
      return segments;
    };
    return _UrlParser;
  }());
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/platform/browser/location/platform_location", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var PlatformLocation = (function() {
    function PlatformLocation() {}
    Object.defineProperty(PlatformLocation.prototype, "pathname", {
      get: function() {
        return null;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(PlatformLocation.prototype, "search", {
      get: function() {
        return null;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(PlatformLocation.prototype, "hash", {
      get: function() {
        return null;
      },
      enumerable: true,
      configurable: true
    });
    return PlatformLocation;
  }());
  exports.PlatformLocation = PlatformLocation;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/platform/browser/location/location_strategy", ["angular2/core"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var LocationStrategy = (function() {
    function LocationStrategy() {}
    return LocationStrategy;
  }());
  exports.LocationStrategy = LocationStrategy;
  exports.APP_BASE_HREF = new core_1.OpaqueToken('appBaseHref');
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/platform/browser/location/location", ["angular2/src/facade/async", "angular2/core", "angular2/src/platform/browser/location/location_strategy"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var async_1 = require("angular2/src/facade/async");
  var core_1 = require("angular2/core");
  var location_strategy_1 = require("angular2/src/platform/browser/location/location_strategy");
  var Location = (function() {
    function Location(platformStrategy) {
      var _this = this;
      this.platformStrategy = platformStrategy;
      this._subject = new async_1.EventEmitter();
      var browserBaseHref = this.platformStrategy.getBaseHref();
      this._baseHref = Location.stripTrailingSlash(_stripIndexHtml(browserBaseHref));
      this.platformStrategy.onPopState(function(ev) {
        async_1.ObservableWrapper.callEmit(_this._subject, {
          'url': _this.path(),
          'pop': true,
          'type': ev.type
        });
      });
    }
    Location.prototype.path = function() {
      return this.normalize(this.platformStrategy.path());
    };
    Location.prototype.normalize = function(url) {
      return Location.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
    };
    Location.prototype.prepareExternalUrl = function(url) {
      if (url.length > 0 && !url.startsWith('/')) {
        url = '/' + url;
      }
      return this.platformStrategy.prepareExternalUrl(url);
    };
    Location.prototype.go = function(path, query) {
      if (query === void 0) {
        query = '';
      }
      this.platformStrategy.pushState(null, '', path, query);
    };
    Location.prototype.replaceState = function(path, query) {
      if (query === void 0) {
        query = '';
      }
      this.platformStrategy.replaceState(null, '', path, query);
    };
    Location.prototype.forward = function() {
      this.platformStrategy.forward();
    };
    Location.prototype.back = function() {
      this.platformStrategy.back();
    };
    Location.prototype.subscribe = function(onNext, onThrow, onReturn) {
      if (onThrow === void 0) {
        onThrow = null;
      }
      if (onReturn === void 0) {
        onReturn = null;
      }
      return async_1.ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    };
    Location.normalizeQueryParams = function(params) {
      return (params.length > 0 && params.substring(0, 1) != '?') ? ('?' + params) : params;
    };
    Location.joinWithSlash = function(start, end) {
      if (start.length == 0) {
        return end;
      }
      if (end.length == 0) {
        return start;
      }
      var slashes = 0;
      if (start.endsWith('/')) {
        slashes++;
      }
      if (end.startsWith('/')) {
        slashes++;
      }
      if (slashes == 2) {
        return start + end.substring(1);
      }
      if (slashes == 1) {
        return start + end;
      }
      return start + '/' + end;
    };
    Location.stripTrailingSlash = function(url) {
      if (/\/$/g.test(url)) {
        url = url.substring(0, url.length - 1);
      }
      return url;
    };
    Location = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [location_strategy_1.LocationStrategy])], Location);
    return Location;
  }());
  exports.Location = Location;
  function _stripBaseHref(baseHref, url) {
    if (baseHref.length > 0 && url.startsWith(baseHref)) {
      return url.substring(baseHref.length);
    }
    return url;
  }
  function _stripIndexHtml(url) {
    if (/\/index.html$/g.test(url)) {
      return url.substring(0, url.length - 11);
    }
    return url;
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/platform/browser/location/path_location_strategy", ["angular2/core", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/platform/browser/location/platform_location", "angular2/src/platform/browser/location/location_strategy", "angular2/src/platform/browser/location/location"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var __param = (this && this.__param) || function(paramIndex, decorator) {
    return function(target, key) {
      decorator(target, key, paramIndex);
    };
  };
  var core_1 = require("angular2/core");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var platform_location_1 = require("angular2/src/platform/browser/location/platform_location");
  var location_strategy_1 = require("angular2/src/platform/browser/location/location_strategy");
  var location_1 = require("angular2/src/platform/browser/location/location");
  var PathLocationStrategy = (function(_super) {
    __extends(PathLocationStrategy, _super);
    function PathLocationStrategy(_platformLocation, href) {
      _super.call(this);
      this._platformLocation = _platformLocation;
      if (lang_1.isBlank(href)) {
        href = this._platformLocation.getBaseHrefFromDOM();
      }
      if (lang_1.isBlank(href)) {
        throw new exceptions_1.BaseException("No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.");
      }
      this._baseHref = href;
    }
    PathLocationStrategy.prototype.onPopState = function(fn) {
      this._platformLocation.onPopState(fn);
      this._platformLocation.onHashChange(fn);
    };
    PathLocationStrategy.prototype.getBaseHref = function() {
      return this._baseHref;
    };
    PathLocationStrategy.prototype.prepareExternalUrl = function(internal) {
      return location_1.Location.joinWithSlash(this._baseHref, internal);
    };
    PathLocationStrategy.prototype.path = function() {
      return this._platformLocation.pathname + location_1.Location.normalizeQueryParams(this._platformLocation.search);
    };
    PathLocationStrategy.prototype.pushState = function(state, title, url, queryParams) {
      var externalUrl = this.prepareExternalUrl(url + location_1.Location.normalizeQueryParams(queryParams));
      this._platformLocation.pushState(state, title, externalUrl);
    };
    PathLocationStrategy.prototype.replaceState = function(state, title, url, queryParams) {
      var externalUrl = this.prepareExternalUrl(url + location_1.Location.normalizeQueryParams(queryParams));
      this._platformLocation.replaceState(state, title, externalUrl);
    };
    PathLocationStrategy.prototype.forward = function() {
      this._platformLocation.forward();
    };
    PathLocationStrategy.prototype.back = function() {
      this._platformLocation.back();
    };
    PathLocationStrategy = __decorate([core_1.Injectable(), __param(1, core_1.Optional()), __param(1, core_1.Inject(location_strategy_1.APP_BASE_HREF)), __metadata('design:paramtypes', [platform_location_1.PlatformLocation, String])], PathLocationStrategy);
    return PathLocationStrategy;
  }(location_strategy_1.LocationStrategy));
  exports.PathLocationStrategy = PathLocationStrategy;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/directives/router_outlet", ["angular2/core", "angular2/src/alt_router/router", "angular2/src/alt_router/constants", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var __param = (this && this.__param) || function(paramIndex, decorator) {
    return function(target, key) {
      decorator(target, key, paramIndex);
    };
  };
  var core_1 = require("angular2/core");
  var router_1 = require("angular2/src/alt_router/router");
  var constants_1 = require("angular2/src/alt_router/constants");
  var lang_1 = require("angular2/src/facade/lang");
  var RouterOutlet = (function() {
    function RouterOutlet(parentOutletMap, _location, name) {
      this._location = _location;
      parentOutletMap.registerOutlet(lang_1.isBlank(name) ? constants_1.DEFAULT_OUTLET_NAME : name, this);
    }
    RouterOutlet.prototype.unload = function() {
      this._loaded.destroy();
      this._loaded = null;
    };
    Object.defineProperty(RouterOutlet.prototype, "loadedComponent", {
      get: function() {
        return lang_1.isPresent(this._loaded) ? this._loaded.instance : null;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(RouterOutlet.prototype, "isLoaded", {
      get: function() {
        return lang_1.isPresent(this._loaded);
      },
      enumerable: true,
      configurable: true
    });
    RouterOutlet.prototype.load = function(factory, providers, outletMap) {
      this.outletMap = outletMap;
      var inj = core_1.ReflectiveInjector.fromResolvedProviders(providers, this._location.parentInjector);
      this._loaded = this._location.createComponent(factory, this._location.length, inj, []);
      return this._loaded;
    };
    RouterOutlet = __decorate([core_1.Directive({selector: 'router-outlet'}), __param(2, core_1.Attribute('name')), __metadata('design:paramtypes', [router_1.RouterOutletMap, core_1.ViewContainerRef, String])], RouterOutlet);
    return RouterOutlet;
  }());
  exports.RouterOutlet = RouterOutlet;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/directives/router_link", ["angular2/core", "angular2/src/alt_router/router", "angular2/src/alt_router/segments", "angular2/src/facade/lang", "angular2/src/facade/async"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var __param = (this && this.__param) || function(paramIndex, decorator) {
    return function(target, key) {
      decorator(target, key, paramIndex);
    };
  };
  var core_1 = require("angular2/core");
  var router_1 = require("angular2/src/alt_router/router");
  var segments_1 = require("angular2/src/alt_router/segments");
  var lang_1 = require("angular2/src/facade/lang");
  var async_1 = require("angular2/src/facade/async");
  var RouterLink = (function() {
    function RouterLink(_routeSegment, _router) {
      var _this = this;
      this._routeSegment = _routeSegment;
      this._router = _router;
      this._changes = [];
      this._subscription = async_1.ObservableWrapper.subscribe(_router.changes, function(_) {
        _this._updateTargetUrlAndHref();
      });
    }
    RouterLink.prototype.ngOnDestroy = function() {
      async_1.ObservableWrapper.dispose(this._subscription);
    };
    Object.defineProperty(RouterLink.prototype, "routerLink", {
      set: function(data) {
        this._changes = data;
        this._updateTargetUrlAndHref();
      },
      enumerable: true,
      configurable: true
    });
    RouterLink.prototype.onClick = function() {
      if (!lang_1.isString(this.target) || this.target == '_self') {
        this._router.navigate(this._changes, this._routeSegment);
        return false;
      }
      return true;
    };
    RouterLink.prototype._updateTargetUrlAndHref = function() {
      var tree = this._router.createUrlTree(this._changes, this._routeSegment);
      if (lang_1.isPresent(tree)) {
        this.href = this._router.serializeUrl(tree);
      }
    };
    __decorate([core_1.Input(), __metadata('design:type', String)], RouterLink.prototype, "target", void 0);
    __decorate([core_1.HostBinding(), __metadata('design:type', String)], RouterLink.prototype, "href", void 0);
    __decorate([core_1.Input(), __metadata('design:type', Array), __metadata('design:paramtypes', [Array])], RouterLink.prototype, "routerLink", null);
    __decorate([core_1.HostListener("click"), __metadata('design:type', Function), __metadata('design:paramtypes', []), __metadata('design:returntype', Boolean)], RouterLink.prototype, "onClick", null);
    RouterLink = __decorate([core_1.Directive({selector: '[routerLink]'}), __param(0, core_1.Optional()), __metadata('design:paramtypes', [segments_1.RouteSegment, router_1.Router])], RouterLink);
    return RouterLink;
  }());
  exports.RouterLink = RouterLink;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/recognize", ["angular2/src/alt_router/segments", "angular2/src/alt_router/metadata/metadata", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/facade/promise", "angular2/src/facade/exceptions", "angular2/src/alt_router/constants", "angular2/src/core/reflection/reflection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var segments_1 = require("angular2/src/alt_router/segments");
  var metadata_1 = require("angular2/src/alt_router/metadata/metadata");
  var lang_1 = require("angular2/src/facade/lang");
  var collection_1 = require("angular2/src/facade/collection");
  var promise_1 = require("angular2/src/facade/promise");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var constants_1 = require("angular2/src/alt_router/constants");
  var reflection_1 = require("angular2/src/core/reflection/reflection");
  function recognize(componentResolver, type, url) {
    var matched = new _MatchResult(type, [url.root], null, segments_1.rootNode(url).children, []);
    return _constructSegment(componentResolver, matched).then(function(roots) {
      return new segments_1.RouteTree(roots[0]);
    });
  }
  exports.recognize = recognize;
  function _recognize(componentResolver, parentType, url) {
    var metadata = _readMetadata(parentType);
    if (lang_1.isBlank(metadata)) {
      throw new exceptions_1.BaseException("Component '" + lang_1.stringify(parentType) + "' does not have route configuration");
    }
    var match;
    try {
      match = _match(metadata, url);
    } catch (e) {
      return promise_1.PromiseWrapper.reject(e, null);
    }
    var main = _constructSegment(componentResolver, match);
    var aux = _recognizeMany(componentResolver, parentType, match.aux).then(_checkOutletNameUniqueness);
    return promise_1.PromiseWrapper.all([main, aux]).then(collection_1.ListWrapper.flatten);
  }
  function _recognizeMany(componentResolver, parentType, urls) {
    var recognized = urls.map(function(u) {
      return _recognize(componentResolver, parentType, u);
    });
    return promise_1.PromiseWrapper.all(recognized).then(collection_1.ListWrapper.flatten);
  }
  function _constructSegment(componentResolver, matched) {
    return componentResolver.resolveComponent(matched.component).then(function(factory) {
      var urlOutlet = matched.consumedUrlSegments.length === 0 || lang_1.isBlank(matched.consumedUrlSegments[0].outlet) ? constants_1.DEFAULT_OUTLET_NAME : matched.consumedUrlSegments[0].outlet;
      var segment = new segments_1.RouteSegment(matched.consumedUrlSegments, matched.parameters, urlOutlet, matched.component, factory);
      if (matched.leftOverUrl.length > 0) {
        return _recognizeMany(componentResolver, matched.component, matched.leftOverUrl).then(function(children) {
          return [new segments_1.TreeNode(segment, children)];
        });
      } else {
        return _recognizeLeftOvers(componentResolver, matched.component).then(function(children) {
          return [new segments_1.TreeNode(segment, children)];
        });
      }
    });
  }
  function _recognizeLeftOvers(componentResolver, parentType) {
    return componentResolver.resolveComponent(parentType).then(function(factory) {
      var metadata = _readMetadata(parentType);
      if (lang_1.isBlank(metadata)) {
        return [];
      }
      var r = metadata.routes.filter(function(r) {
        return r.path == "" || r.path == "/";
      });
      if (r.length === 0) {
        return promise_1.PromiseWrapper.resolve([]);
      } else {
        return _recognizeLeftOvers(componentResolver, r[0].component).then(function(children) {
          return componentResolver.resolveComponent(r[0].component).then(function(factory) {
            var segment = new segments_1.RouteSegment([], null, constants_1.DEFAULT_OUTLET_NAME, r[0].component, factory);
            return [new segments_1.TreeNode(segment, children)];
          });
        });
      }
    });
  }
  function _match(metadata, url) {
    for (var _i = 0,
        _a = metadata.routes; _i < _a.length; _i++) {
      var r = _a[_i];
      var matchingResult = _matchWithParts(r, url);
      if (lang_1.isPresent(matchingResult)) {
        return matchingResult;
      }
    }
    var availableRoutes = metadata.routes.map(function(r) {
      return ("'" + r.path + "'");
    }).join(", ");
    throw new exceptions_1.BaseException("Cannot match any routes. Current segment: '" + url.value + "'. Available routes: [" + availableRoutes + "].");
  }
  function _matchWithParts(route, url) {
    var path = route.path.startsWith("/") ? route.path.substring(1) : route.path;
    if (path == "*") {
      return new _MatchResult(route.component, [], null, [], []);
    }
    var parts = path.split("/");
    var positionalParams = {};
    var consumedUrlSegments = [];
    var lastParent = null;
    var lastSegment = null;
    var current = url;
    for (var i = 0; i < parts.length; ++i) {
      if (lang_1.isBlank(current))
        return null;
      var p_1 = parts[i];
      var isLastSegment = i === parts.length - 1;
      var isLastParent = i === parts.length - 2;
      var isPosParam = p_1.startsWith(":");
      if (!isPosParam && p_1 != current.value.segment)
        return null;
      if (isLastSegment) {
        lastSegment = current;
      }
      if (isLastParent) {
        lastParent = current;
      }
      if (isPosParam) {
        positionalParams[p_1.substring(1)] = current.value.segment;
      }
      consumedUrlSegments.push(current.value);
      current = collection_1.ListWrapper.first(current.children);
    }
    if (lang_1.isPresent(current) && lang_1.isBlank(current.value.segment)) {
      lastParent = lastSegment;
      lastSegment = current;
    }
    var p = lastSegment.value.parameters;
    var parameters = collection_1.StringMapWrapper.merge(lang_1.isBlank(p) ? {} : p, positionalParams);
    var axuUrlSubtrees = lang_1.isPresent(lastParent) ? lastParent.children.slice(1) : [];
    return new _MatchResult(route.component, consumedUrlSegments, parameters, lastSegment.children, axuUrlSubtrees);
  }
  function _checkOutletNameUniqueness(nodes) {
    var names = {};
    nodes.forEach(function(n) {
      var segmentWithSameOutletName = names[n.value.outlet];
      if (lang_1.isPresent(segmentWithSameOutletName)) {
        var p = segmentWithSameOutletName.stringifiedUrlSegments;
        var c = n.value.stringifiedUrlSegments;
        throw new exceptions_1.BaseException("Two segments cannot have the same outlet name: '" + p + "' and '" + c + "'.");
      }
      names[n.value.outlet] = n.value;
    });
    return nodes;
  }
  var _MatchResult = (function() {
    function _MatchResult(component, consumedUrlSegments, parameters, leftOverUrl, aux) {
      this.component = component;
      this.consumedUrlSegments = consumedUrlSegments;
      this.parameters = parameters;
      this.leftOverUrl = leftOverUrl;
      this.aux = aux;
    }
    return _MatchResult;
  }());
  function _readMetadata(componentType) {
    var metadata = reflection_1.reflector.annotations(componentType).filter(function(f) {
      return f instanceof metadata_1.RoutesMetadata;
    });
    return collection_1.ListWrapper.first(metadata);
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/platform/browser/location/hash_location_strategy", ["angular2/core", "angular2/src/platform/browser/location/location_strategy", "angular2/src/platform/browser/location/location", "angular2/src/platform/browser/location/platform_location", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var __param = (this && this.__param) || function(paramIndex, decorator) {
    return function(target, key) {
      decorator(target, key, paramIndex);
    };
  };
  var core_1 = require("angular2/core");
  var location_strategy_1 = require("angular2/src/platform/browser/location/location_strategy");
  var location_1 = require("angular2/src/platform/browser/location/location");
  var platform_location_1 = require("angular2/src/platform/browser/location/platform_location");
  var lang_1 = require("angular2/src/facade/lang");
  var HashLocationStrategy = (function(_super) {
    __extends(HashLocationStrategy, _super);
    function HashLocationStrategy(_platformLocation, _baseHref) {
      _super.call(this);
      this._platformLocation = _platformLocation;
      this._baseHref = '';
      if (lang_1.isPresent(_baseHref)) {
        this._baseHref = _baseHref;
      }
    }
    HashLocationStrategy.prototype.onPopState = function(fn) {
      this._platformLocation.onPopState(fn);
      this._platformLocation.onHashChange(fn);
    };
    HashLocationStrategy.prototype.getBaseHref = function() {
      return this._baseHref;
    };
    HashLocationStrategy.prototype.path = function() {
      var path = this._platformLocation.hash;
      if (!lang_1.isPresent(path))
        path = '#';
      return (path.length > 0 ? path.substring(1) : path);
    };
    HashLocationStrategy.prototype.prepareExternalUrl = function(internal) {
      var url = location_1.Location.joinWithSlash(this._baseHref, internal);
      return url.length > 0 ? ('#' + url) : url;
    };
    HashLocationStrategy.prototype.pushState = function(state, title, path, queryParams) {
      var url = this.prepareExternalUrl(path + location_1.Location.normalizeQueryParams(queryParams));
      if (url.length == 0) {
        url = this._platformLocation.pathname;
      }
      this._platformLocation.pushState(state, title, url);
    };
    HashLocationStrategy.prototype.replaceState = function(state, title, path, queryParams) {
      var url = this.prepareExternalUrl(path + location_1.Location.normalizeQueryParams(queryParams));
      if (url.length == 0) {
        url = this._platformLocation.pathname;
      }
      this._platformLocation.replaceState(state, title, url);
    };
    HashLocationStrategy.prototype.forward = function() {
      this._platformLocation.forward();
    };
    HashLocationStrategy.prototype.back = function() {
      this._platformLocation.back();
    };
    HashLocationStrategy = __decorate([core_1.Injectable(), __param(1, core_1.Optional()), __param(1, core_1.Inject(location_strategy_1.APP_BASE_HREF)), __metadata('design:paramtypes', [platform_location_1.PlatformLocation, String])], HashLocationStrategy);
    return HashLocationStrategy;
  }(location_strategy_1.LocationStrategy));
  exports.HashLocationStrategy = HashLocationStrategy;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/platform/browser/location/browser_platform_location", ["angular2/src/core/di/decorators", "angular2/src/platform/browser/location/platform_location", "angular2/src/platform/dom/dom_adapter"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
        d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if (d = decorators[i])
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var decorators_1 = require("angular2/src/core/di/decorators");
  var platform_location_1 = require("angular2/src/platform/browser/location/platform_location");
  var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
  var BrowserPlatformLocation = (function(_super) {
    __extends(BrowserPlatformLocation, _super);
    function BrowserPlatformLocation() {
      _super.call(this);
      this._init();
    }
    BrowserPlatformLocation.prototype._init = function() {
      this._location = dom_adapter_1.DOM.getLocation();
      this._history = dom_adapter_1.DOM.getHistory();
    };
    Object.defineProperty(BrowserPlatformLocation.prototype, "location", {
      get: function() {
        return this._location;
      },
      enumerable: true,
      configurable: true
    });
    BrowserPlatformLocation.prototype.getBaseHrefFromDOM = function() {
      return dom_adapter_1.DOM.getBaseHref();
    };
    BrowserPlatformLocation.prototype.onPopState = function(fn) {
      dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    };
    BrowserPlatformLocation.prototype.onHashChange = function(fn) {
      dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('hashchange', fn, false);
    };
    Object.defineProperty(BrowserPlatformLocation.prototype, "pathname", {
      get: function() {
        return this._location.pathname;
      },
      set: function(newPath) {
        this._location.pathname = newPath;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserPlatformLocation.prototype, "search", {
      get: function() {
        return this._location.search;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserPlatformLocation.prototype, "hash", {
      get: function() {
        return this._location.hash;
      },
      enumerable: true,
      configurable: true
    });
    BrowserPlatformLocation.prototype.pushState = function(state, title, url) {
      this._history.pushState(state, title, url);
    };
    BrowserPlatformLocation.prototype.replaceState = function(state, title, url) {
      this._history.replaceState(state, title, url);
    };
    BrowserPlatformLocation.prototype.forward = function() {
      this._history.forward();
    };
    BrowserPlatformLocation.prototype.back = function() {
      this._history.back();
    };
    BrowserPlatformLocation = __decorate([decorators_1.Injectable(), __metadata('design:paramtypes', [])], BrowserPlatformLocation);
    return BrowserPlatformLocation;
  }(platform_location_1.PlatformLocation));
  exports.BrowserPlatformLocation = BrowserPlatformLocation;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/platform/location", ["angular2/src/platform/browser/location/platform_location", "angular2/src/platform/browser/location/location_strategy", "angular2/src/platform/browser/location/hash_location_strategy", "angular2/src/platform/browser/location/path_location_strategy", "angular2/src/platform/browser/location/location"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  __export(require("angular2/src/platform/browser/location/platform_location"));
  __export(require("angular2/src/platform/browser/location/location_strategy"));
  __export(require("angular2/src/platform/browser/location/hash_location_strategy"));
  __export(require("angular2/src/platform/browser/location/path_location_strategy"));
  __export(require("angular2/src/platform/browser/location/location"));
  global.define = __define;
  return module.exports;
});

System.register("angular2/platform/common", ["angular2/src/platform/location"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  __export(require("angular2/src/platform/location"));
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/router_providers_common", ["angular2/core", "angular2/platform/common", "angular2/src/alt_router/router", "angular2/src/alt_router/router_url_serializer", "angular2/core", "angular2/src/facade/exceptions"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var common_1 = require("angular2/platform/common");
  var router_1 = require("angular2/src/alt_router/router");
  var router_url_serializer_1 = require("angular2/src/alt_router/router_url_serializer");
  var core_2 = require("angular2/core");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  exports.ROUTER_PROVIDERS_COMMON = [router_1.RouterOutletMap, {
    provide: router_url_serializer_1.RouterUrlSerializer,
    useClass: router_url_serializer_1.DefaultRouterUrlSerializer
  }, {
    provide: common_1.LocationStrategy,
    useClass: common_1.PathLocationStrategy
  }, common_1.Location, {
    provide: router_1.Router,
    useFactory: routerFactory,
    deps: [core_2.ApplicationRef, core_1.ComponentResolver, router_url_serializer_1.RouterUrlSerializer, router_1.RouterOutletMap, common_1.Location]
  }];
  function routerFactory(app, componentResolver, urlSerializer, routerOutletMap, location) {
    if (app.componentTypes.length == 0) {
      throw new exceptions_1.BaseException("Bootstrap at least one component before injecting Router.");
    }
    var router = new router_1.Router(null, app.componentTypes[0], componentResolver, urlSerializer, routerOutletMap, location);
    app.registerDisposeListener(function() {
      return router.dispose();
    });
    return router;
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/router_providers", ["angular2/src/alt_router/router_providers_common", "angular2/src/platform/browser/location/browser_platform_location", "angular2/platform/common"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var router_providers_common_1 = require("angular2/src/alt_router/router_providers_common");
  var browser_platform_location_1 = require("angular2/src/platform/browser/location/browser_platform_location");
  var common_1 = require("angular2/platform/common");
  exports.ROUTER_PROVIDERS = [router_providers_common_1.ROUTER_PROVIDERS_COMMON, {
    provide: common_1.PlatformLocation,
    useClass: browser_platform_location_1.BrowserPlatformLocation
  }];
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/alt_router/router", ["angular2/core", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/facade/exceptions", "angular2/src/alt_router/recognize", "angular2/src/alt_router/link", "angular2/src/alt_router/segments", "angular2/src/alt_router/lifecycle_reflector", "angular2/src/alt_router/constants"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var lang_1 = require("angular2/src/facade/lang");
  var collection_1 = require("angular2/src/facade/collection");
  var async_1 = require("angular2/src/facade/async");
  var collection_2 = require("angular2/src/facade/collection");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var recognize_1 = require("angular2/src/alt_router/recognize");
  var link_1 = require("angular2/src/alt_router/link");
  var segments_1 = require("angular2/src/alt_router/segments");
  var lifecycle_reflector_1 = require("angular2/src/alt_router/lifecycle_reflector");
  var constants_1 = require("angular2/src/alt_router/constants");
  var RouterOutletMap = (function() {
    function RouterOutletMap() {
      this._outlets = {};
    }
    RouterOutletMap.prototype.registerOutlet = function(name, outlet) {
      this._outlets[name] = outlet;
    };
    return RouterOutletMap;
  }());
  exports.RouterOutletMap = RouterOutletMap;
  var Router = (function() {
    function Router(_rootComponent, _rootComponentType, _componentResolver, _urlSerializer, _routerOutletMap, _location) {
      this._rootComponent = _rootComponent;
      this._rootComponentType = _rootComponentType;
      this._componentResolver = _componentResolver;
      this._urlSerializer = _urlSerializer;
      this._routerOutletMap = _routerOutletMap;
      this._location = _location;
      this._changes = new async_1.EventEmitter();
      this._prevTree = this._createInitialTree();
      this._setUpLocationChangeListener();
      this.navigateByUrl(this._location.path());
    }
    Object.defineProperty(Router.prototype, "urlTree", {
      get: function() {
        return this._urlTree;
      },
      enumerable: true,
      configurable: true
    });
    Router.prototype.navigateByUrl = function(url) {
      return this._navigate(this._urlSerializer.parse(url));
    };
    Router.prototype.navigate = function(changes, segment) {
      return this._navigate(this.createUrlTree(changes, segment));
    };
    Router.prototype.dispose = function() {
      async_1.ObservableWrapper.dispose(this._locationSubscription);
    };
    Router.prototype._createInitialTree = function() {
      var root = new segments_1.RouteSegment([new segments_1.UrlSegment("", null, null)], null, constants_1.DEFAULT_OUTLET_NAME, this._rootComponentType, null);
      return new segments_1.RouteTree(new segments_1.TreeNode(root, []));
    };
    Router.prototype._setUpLocationChangeListener = function() {
      var _this = this;
      this._locationSubscription = this._location.subscribe(function(change) {
        _this._navigate(_this._urlSerializer.parse(change['url']));
      });
    };
    Router.prototype._navigate = function(url) {
      var _this = this;
      this._urlTree = url;
      return recognize_1.recognize(this._componentResolver, this._rootComponentType, url).then(function(currTree) {
        return new _LoadSegments(currTree, _this._prevTree).load(_this._routerOutletMap, _this._rootComponent).then(function(updated) {
          if (updated) {
            _this._prevTree = currTree;
            _this._location.go(_this._urlSerializer.serialize(_this._urlTree));
            _this._changes.emit(null);
          }
        });
      });
    };
    Router.prototype.createUrlTree = function(changes, segment) {
      if (lang_1.isPresent(this._prevTree)) {
        var s = lang_1.isPresent(segment) ? segment : this._prevTree.root;
        return link_1.link(s, this._prevTree, this.urlTree, changes);
      } else {
        return null;
      }
    };
    Router.prototype.serializeUrl = function(url) {
      return this._urlSerializer.serialize(url);
    };
    Object.defineProperty(Router.prototype, "changes", {
      get: function() {
        return this._changes;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Router.prototype, "routeTree", {
      get: function() {
        return this._prevTree;
      },
      enumerable: true,
      configurable: true
    });
    return Router;
  }());
  exports.Router = Router;
  var _LoadSegments = (function() {
    function _LoadSegments(currTree, prevTree) {
      this.currTree = currTree;
      this.prevTree = prevTree;
      this.deactivations = [];
      this.performMutation = true;
    }
    _LoadSegments.prototype.load = function(parentOutletMap, rootComponent) {
      var _this = this;
      var prevRoot = lang_1.isPresent(this.prevTree) ? segments_1.rootNode(this.prevTree) : null;
      var currRoot = segments_1.rootNode(this.currTree);
      return this.canDeactivate(currRoot, prevRoot, parentOutletMap, rootComponent).then(function(res) {
        _this.performMutation = true;
        if (res) {
          _this.loadChildSegments(currRoot, prevRoot, parentOutletMap, [rootComponent]);
        }
        return res;
      });
    };
    _LoadSegments.prototype.canDeactivate = function(currRoot, prevRoot, outletMap, rootComponent) {
      var _this = this;
      this.performMutation = false;
      this.loadChildSegments(currRoot, prevRoot, outletMap, [rootComponent]);
      var allPaths = async_1.PromiseWrapper.all(this.deactivations.map(function(r) {
        return _this.checkCanDeactivatePath(r);
      }));
      return allPaths.then(function(values) {
        return values.filter(function(v) {
          return v;
        }).length === values.length;
      });
    };
    _LoadSegments.prototype.checkCanDeactivatePath = function(path) {
      var _this = this;
      var curr = async_1.PromiseWrapper.resolve(true);
      var _loop_1 = function(p) {
        curr = curr.then(function(_) {
          if (lifecycle_reflector_1.hasLifecycleHook("routerCanDeactivate", p)) {
            return p.routerCanDeactivate(_this.prevTree, _this.currTree);
          } else {
            return _;
          }
        });
      };
      for (var _i = 0,
          _a = collection_1.ListWrapper.reversed(path); _i < _a.length; _i++) {
        var p = _a[_i];
        _loop_1(p);
      }
      return curr;
    };
    _LoadSegments.prototype.loadChildSegments = function(currNode, prevNode, outletMap, components) {
      var _this = this;
      var prevChildren = lang_1.isPresent(prevNode) ? prevNode.children.reduce(function(m, c) {
        m[c.value.outlet] = c;
        return m;
      }, {}) : {};
      currNode.children.forEach(function(c) {
        _this.loadSegments(c, prevChildren[c.value.outlet], outletMap, components);
        collection_2.StringMapWrapper.delete(prevChildren, c.value.outlet);
      });
      collection_2.StringMapWrapper.forEach(prevChildren, function(v, k) {
        return _this.unloadOutlet(outletMap._outlets[k], components);
      });
    };
    _LoadSegments.prototype.loadSegments = function(currNode, prevNode, parentOutletMap, components) {
      var curr = currNode.value;
      var prev = lang_1.isPresent(prevNode) ? prevNode.value : null;
      var outlet = this.getOutlet(parentOutletMap, currNode.value);
      if (segments_1.equalSegments(curr, prev)) {
        this.loadChildSegments(currNode, prevNode, outlet.outletMap, components.concat([outlet.loadedComponent]));
      } else {
        this.unloadOutlet(outlet, components);
        if (this.performMutation) {
          var outletMap = new RouterOutletMap();
          var loadedComponent = this.loadNewSegment(outletMap, curr, prev, outlet);
          this.loadChildSegments(currNode, prevNode, outletMap, components.concat([loadedComponent]));
        }
      }
    };
    _LoadSegments.prototype.loadNewSegment = function(outletMap, curr, prev, outlet) {
      var resolved = core_1.ReflectiveInjector.resolve([core_1.provide(RouterOutletMap, {useValue: outletMap}), core_1.provide(segments_1.RouteSegment, {useValue: curr})]);
      var ref = outlet.load(segments_1.routeSegmentComponentFactory(curr), resolved, outletMap);
      if (lifecycle_reflector_1.hasLifecycleHook("routerOnActivate", ref.instance)) {
        ref.instance.routerOnActivate(curr, prev, this.currTree, this.prevTree);
      }
      return ref.instance;
    };
    _LoadSegments.prototype.getOutlet = function(outletMap, segment) {
      var outlet = outletMap._outlets[segment.outlet];
      if (lang_1.isBlank(outlet)) {
        if (segment.outlet == constants_1.DEFAULT_OUTLET_NAME) {
          throw new exceptions_1.BaseException("Cannot find default outlet");
        } else {
          throw new exceptions_1.BaseException("Cannot find the outlet " + segment.outlet);
        }
      }
      return outlet;
    };
    _LoadSegments.prototype.unloadOutlet = function(outlet, components) {
      var _this = this;
      if (lang_1.isPresent(outlet) && outlet.isLoaded) {
        collection_2.StringMapWrapper.forEach(outlet.outletMap._outlets, function(v, k) {
          return _this.unloadOutlet(v, components);
        });
        if (this.performMutation) {
          outlet.unload();
        } else {
          this.deactivations.push(components.concat([outlet.loadedComponent]));
        }
      }
    };
    return _LoadSegments;
  }());
  global.define = __define;
  return module.exports;
});

System.register("angular2/alt_router", ["angular2/src/alt_router/router", "angular2/src/alt_router/segments", "angular2/src/alt_router/metadata/decorators", "angular2/src/alt_router/metadata/metadata", "angular2/src/alt_router/router_url_serializer", "angular2/src/alt_router/router_providers", "angular2/src/alt_router/directives/router_outlet", "angular2/src/alt_router/directives/router_link"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var router_1 = require("angular2/src/alt_router/router");
  exports.Router = router_1.Router;
  exports.RouterOutletMap = router_1.RouterOutletMap;
  var segments_1 = require("angular2/src/alt_router/segments");
  exports.RouteSegment = segments_1.RouteSegment;
  exports.UrlSegment = segments_1.UrlSegment;
  exports.Tree = segments_1.Tree;
  exports.UrlTree = segments_1.UrlTree;
  exports.RouteTree = segments_1.RouteTree;
  var decorators_1 = require("angular2/src/alt_router/metadata/decorators");
  exports.Routes = decorators_1.Routes;
  var metadata_1 = require("angular2/src/alt_router/metadata/metadata");
  exports.Route = metadata_1.Route;
  var router_url_serializer_1 = require("angular2/src/alt_router/router_url_serializer");
  exports.RouterUrlSerializer = router_url_serializer_1.RouterUrlSerializer;
  exports.DefaultRouterUrlSerializer = router_url_serializer_1.DefaultRouterUrlSerializer;
  var router_providers_1 = require("angular2/src/alt_router/router_providers");
  exports.ROUTER_PROVIDERS = router_providers_1.ROUTER_PROVIDERS;
  var router_outlet_1 = require("angular2/src/alt_router/directives/router_outlet");
  var router_link_1 = require("angular2/src/alt_router/directives/router_link");
  exports.ROUTER_DIRECTIVES = [router_outlet_1.RouterOutlet, router_link_1.RouterLink];
  global.define = __define;
  return module.exports;
});

//# sourceMappingURLDisabled=alt_router.js.map