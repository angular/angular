"format register";
System.register("angular2/src/router/instruction", ["angular2/src/facade/collection", "angular2/src/facade/exceptions", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var lang_1 = require("angular2/src/facade/lang");
  var RouteParams = (function() {
    function RouteParams(params) {
      this.params = params;
    }
    RouteParams.prototype.get = function(param) {
      return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.params, param));
    };
    return RouteParams;
  })();
  exports.RouteParams = RouteParams;
  var RouteData = (function() {
    function RouteData(data) {
      if (data === void 0) {
        data = lang_1.CONST_EXPR({});
      }
      this.data = data;
    }
    RouteData.prototype.get = function(key) {
      return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.data, key));
    };
    return RouteData;
  })();
  exports.RouteData = RouteData;
  var BLANK_ROUTE_DATA = new RouteData();
  var Instruction = (function() {
    function Instruction(component, child, auxInstruction) {
      this.component = component;
      this.child = child;
      this.auxInstruction = auxInstruction;
    }
    Instruction.prototype.replaceChild = function(child) {
      return new Instruction(this.component, child, this.auxInstruction);
    };
    return Instruction;
  })();
  exports.Instruction = Instruction;
  var PrimaryInstruction = (function() {
    function PrimaryInstruction(component, child, auxUrls) {
      this.component = component;
      this.child = child;
      this.auxUrls = auxUrls;
    }
    return PrimaryInstruction;
  })();
  exports.PrimaryInstruction = PrimaryInstruction;
  function stringifyInstruction(instruction) {
    return stringifyInstructionPath(instruction) + stringifyInstructionQuery(instruction);
  }
  exports.stringifyInstruction = stringifyInstruction;
  function stringifyInstructionPath(instruction) {
    return instruction.component.urlPath + stringifyAux(instruction) + stringifyPrimaryPrefixed(instruction.child);
  }
  exports.stringifyInstructionPath = stringifyInstructionPath;
  function stringifyInstructionQuery(instruction) {
    return instruction.component.urlParams.length > 0 ? ('?' + instruction.component.urlParams.join('&')) : '';
  }
  exports.stringifyInstructionQuery = stringifyInstructionQuery;
  function stringifyPrimaryPrefixed(instruction) {
    var primary = stringifyPrimary(instruction);
    if (primary.length > 0) {
      primary = '/' + primary;
    }
    return primary;
  }
  function stringifyPrimary(instruction) {
    if (lang_1.isBlank(instruction)) {
      return '';
    }
    var params = instruction.component.urlParams.length > 0 ? (';' + instruction.component.urlParams.join(';')) : '';
    return instruction.component.urlPath + params + stringifyAux(instruction) + stringifyPrimaryPrefixed(instruction.child);
  }
  function stringifyAux(instruction) {
    var routes = [];
    collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function(auxInstruction, _) {
      routes.push(stringifyPrimary(auxInstruction));
    });
    if (routes.length > 0) {
      return '(' + routes.join('//') + ')';
    }
    return '';
  }
  var ComponentInstruction = (function() {
    function ComponentInstruction() {
      this.reuse = false;
    }
    Object.defineProperty(ComponentInstruction.prototype, "componentType", {
      get: function() {
        return exceptions_1.unimplemented();
      },
      enumerable: true,
      configurable: true
    });
    ;
    Object.defineProperty(ComponentInstruction.prototype, "specificity", {
      get: function() {
        return exceptions_1.unimplemented();
      },
      enumerable: true,
      configurable: true
    });
    ;
    Object.defineProperty(ComponentInstruction.prototype, "terminal", {
      get: function() {
        return exceptions_1.unimplemented();
      },
      enumerable: true,
      configurable: true
    });
    ;
    Object.defineProperty(ComponentInstruction.prototype, "routeData", {
      get: function() {
        return exceptions_1.unimplemented();
      },
      enumerable: true,
      configurable: true
    });
    ;
    return ComponentInstruction;
  })();
  exports.ComponentInstruction = ComponentInstruction;
  var ComponentInstruction_ = (function(_super) {
    __extends(ComponentInstruction_, _super);
    function ComponentInstruction_(urlPath, urlParams, _recognizer, params) {
      if (params === void 0) {
        params = null;
      }
      _super.call(this);
      this._recognizer = _recognizer;
      this.urlPath = urlPath;
      this.urlParams = urlParams;
      this.params = params;
      if (lang_1.isPresent(this._recognizer.handler.data)) {
        this._routeData = new RouteData(this._recognizer.handler.data);
      } else {
        this._routeData = BLANK_ROUTE_DATA;
      }
    }
    Object.defineProperty(ComponentInstruction_.prototype, "componentType", {
      get: function() {
        return this._recognizer.handler.componentType;
      },
      enumerable: true,
      configurable: true
    });
    ComponentInstruction_.prototype.resolveComponentType = function() {
      return this._recognizer.handler.resolveComponentType();
    };
    Object.defineProperty(ComponentInstruction_.prototype, "specificity", {
      get: function() {
        return this._recognizer.specificity;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ComponentInstruction_.prototype, "terminal", {
      get: function() {
        return this._recognizer.terminal;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(ComponentInstruction_.prototype, "routeData", {
      get: function() {
        return this._routeData;
      },
      enumerable: true,
      configurable: true
    });
    return ComponentInstruction_;
  })(ComponentInstruction);
  exports.ComponentInstruction_ = ComponentInstruction_;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/lifecycle_annotations_impl", ["angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var lang_1 = require("angular2/src/facade/lang");
  var RouteLifecycleHook = (function() {
    function RouteLifecycleHook(name) {
      this.name = name;
    }
    RouteLifecycleHook = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [String])], RouteLifecycleHook);
    return RouteLifecycleHook;
  })();
  exports.RouteLifecycleHook = RouteLifecycleHook;
  var CanActivate = (function() {
    function CanActivate(fn) {
      this.fn = fn;
    }
    CanActivate = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Function])], CanActivate);
    return CanActivate;
  })();
  exports.CanActivate = CanActivate;
  exports.canReuse = lang_1.CONST_EXPR(new RouteLifecycleHook("canReuse"));
  exports.canDeactivate = lang_1.CONST_EXPR(new RouteLifecycleHook("canDeactivate"));
  exports.onActivate = lang_1.CONST_EXPR(new RouteLifecycleHook("onActivate"));
  exports.onReuse = lang_1.CONST_EXPR(new RouteLifecycleHook("onReuse"));
  exports.onDeactivate = lang_1.CONST_EXPR(new RouteLifecycleHook("onDeactivate"));
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/lifecycle_annotations", ["angular2/src/core/util/decorators", "angular2/src/router/lifecycle_annotations_impl", "angular2/src/router/lifecycle_annotations_impl"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var decorators_1 = require("angular2/src/core/util/decorators");
  var lifecycle_annotations_impl_1 = require("angular2/src/router/lifecycle_annotations_impl");
  var lifecycle_annotations_impl_2 = require("angular2/src/router/lifecycle_annotations_impl");
  exports.canReuse = lifecycle_annotations_impl_2.canReuse;
  exports.canDeactivate = lifecycle_annotations_impl_2.canDeactivate;
  exports.onActivate = lifecycle_annotations_impl_2.onActivate;
  exports.onReuse = lifecycle_annotations_impl_2.onReuse;
  exports.onDeactivate = lifecycle_annotations_impl_2.onDeactivate;
  exports.CanActivate = decorators_1.makeDecorator(lifecycle_annotations_impl_1.CanActivate);
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/location_strategy", ["angular2/src/facade/lang", "angular2/angular2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var angular2_1 = require("angular2/angular2");
  var LocationStrategy = (function() {
    function LocationStrategy() {}
    return LocationStrategy;
  })();
  exports.LocationStrategy = LocationStrategy;
  exports.APP_BASE_HREF = lang_1.CONST_EXPR(new angular2_1.OpaqueToken('appBaseHref'));
  function normalizeQueryParams(params) {
    return (params.length > 0 && params.substring(0, 1) != '?') ? ('?' + params) : params;
  }
  exports.normalizeQueryParams = normalizeQueryParams;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/url_parser", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var Url = (function() {
    function Url(path, child, auxiliary, params) {
      if (child === void 0) {
        child = null;
      }
      if (auxiliary === void 0) {
        auxiliary = lang_1.CONST_EXPR([]);
      }
      if (params === void 0) {
        params = null;
      }
      this.path = path;
      this.child = child;
      this.auxiliary = auxiliary;
      this.params = params;
    }
    Url.prototype.toString = function() {
      return this.path + this._matrixParamsToString() + this._auxToString() + this._childString();
    };
    Url.prototype.segmentToString = function() {
      return this.path + this._matrixParamsToString();
    };
    Url.prototype._auxToString = function() {
      return this.auxiliary.length > 0 ? ('(' + this.auxiliary.map(function(sibling) {
        return sibling.toString();
      }).join('//') + ')') : '';
    };
    Url.prototype._matrixParamsToString = function() {
      if (lang_1.isBlank(this.params)) {
        return '';
      }
      return ';' + serializeParams(this.params).join(';');
    };
    Url.prototype._childString = function() {
      return lang_1.isPresent(this.child) ? ('/' + this.child.toString()) : '';
    };
    return Url;
  })();
  exports.Url = Url;
  var RootUrl = (function(_super) {
    __extends(RootUrl, _super);
    function RootUrl(path, child, auxiliary, params) {
      if (child === void 0) {
        child = null;
      }
      if (auxiliary === void 0) {
        auxiliary = lang_1.CONST_EXPR([]);
      }
      if (params === void 0) {
        params = null;
      }
      _super.call(this, path, child, auxiliary, params);
    }
    RootUrl.prototype.toString = function() {
      return this.path + this._auxToString() + this._childString() + this._queryParamsToString();
    };
    RootUrl.prototype.segmentToString = function() {
      return this.path + this._queryParamsToString();
    };
    RootUrl.prototype._queryParamsToString = function() {
      if (lang_1.isBlank(this.params)) {
        return '';
      }
      return '?' + serializeParams(this.params).join('&');
    };
    return RootUrl;
  })(Url);
  exports.RootUrl = RootUrl;
  function pathSegmentsToUrl(pathSegments) {
    var url = new Url(pathSegments[pathSegments.length - 1]);
    for (var i = pathSegments.length - 2; i >= 0; i -= 1) {
      url = new Url(pathSegments[i], url);
    }
    return url;
  }
  exports.pathSegmentsToUrl = pathSegmentsToUrl;
  var SEGMENT_RE = lang_1.RegExpWrapper.create('^[^\\/\\(\\)\\?;=&#]+');
  function matchUrlSegment(str) {
    var match = lang_1.RegExpWrapper.firstMatch(SEGMENT_RE, str);
    return lang_1.isPresent(match) ? match[0] : '';
  }
  var UrlParser = (function() {
    function UrlParser() {}
    UrlParser.prototype.peekStartsWith = function(str) {
      return this._remaining.startsWith(str);
    };
    UrlParser.prototype.capture = function(str) {
      if (!this._remaining.startsWith(str)) {
        throw new exceptions_1.BaseException("Expected \"" + str + "\".");
      }
      this._remaining = this._remaining.substring(str.length);
    };
    UrlParser.prototype.parse = function(url) {
      this._remaining = url;
      if (url == '' || url == '/') {
        return new Url('');
      }
      return this.parseRoot();
    };
    UrlParser.prototype.parseRoot = function() {
      if (this.peekStartsWith('/')) {
        this.capture('/');
      }
      var path = matchUrlSegment(this._remaining);
      this.capture(path);
      var aux = [];
      if (this.peekStartsWith('(')) {
        aux = this.parseAuxiliaryRoutes();
      }
      if (this.peekStartsWith(';')) {
        this.parseMatrixParams();
      }
      var child = null;
      if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
        this.capture('/');
        child = this.parseSegment();
      }
      var queryParams = null;
      if (this.peekStartsWith('?')) {
        queryParams = this.parseQueryParams();
      }
      return new RootUrl(path, child, aux, queryParams);
    };
    UrlParser.prototype.parseSegment = function() {
      if (this._remaining.length == 0) {
        return null;
      }
      if (this.peekStartsWith('/')) {
        this.capture('/');
      }
      var path = matchUrlSegment(this._remaining);
      this.capture(path);
      var matrixParams = null;
      if (this.peekStartsWith(';')) {
        matrixParams = this.parseMatrixParams();
      }
      var aux = [];
      if (this.peekStartsWith('(')) {
        aux = this.parseAuxiliaryRoutes();
      }
      var child = null;
      if (this.peekStartsWith('/') && !this.peekStartsWith('//')) {
        this.capture('/');
        child = this.parseSegment();
      }
      return new Url(path, child, aux, matrixParams);
    };
    UrlParser.prototype.parseQueryParams = function() {
      var params = {};
      this.capture('?');
      this.parseParam(params);
      while (this._remaining.length > 0 && this.peekStartsWith('&')) {
        this.capture('&');
        this.parseParam(params);
      }
      return params;
    };
    UrlParser.prototype.parseMatrixParams = function() {
      var params = {};
      while (this._remaining.length > 0 && this.peekStartsWith(';')) {
        this.capture(';');
        this.parseParam(params);
      }
      return params;
    };
    UrlParser.prototype.parseParam = function(params) {
      var key = matchUrlSegment(this._remaining);
      if (lang_1.isBlank(key)) {
        return ;
      }
      this.capture(key);
      var value = true;
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
    UrlParser.prototype.parseAuxiliaryRoutes = function() {
      var routes = [];
      this.capture('(');
      while (!this.peekStartsWith(')') && this._remaining.length > 0) {
        routes.push(this.parseSegment());
        if (this.peekStartsWith('//')) {
          this.capture('//');
        }
      }
      this.capture(')');
      return routes;
    };
    return UrlParser;
  })();
  exports.UrlParser = UrlParser;
  exports.parser = new UrlParser();
  function serializeParams(paramMap) {
    var params = [];
    if (lang_1.isPresent(paramMap)) {
      collection_1.StringMapWrapper.forEach(paramMap, function(value, key) {
        if (value == true) {
          params.push(key);
        } else {
          params.push(key + '=' + value);
        }
      });
    }
    return params;
  }
  exports.serializeParams = serializeParams;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_config_impl", ["angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var lang_1 = require("angular2/src/facade/lang");
  var RouteConfig = (function() {
    function RouteConfig(configs) {
      this.configs = configs;
    }
    RouteConfig = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Array])], RouteConfig);
    return RouteConfig;
  })();
  exports.RouteConfig = RouteConfig;
  var Route = (function() {
    function Route(_a) {
      var path = _a.path,
          component = _a.component,
          name = _a.name,
          data = _a.data;
      this.aux = null;
      this.loader = null;
      this.redirectTo = null;
      this.path = path;
      this.component = component;
      this.name = name;
      this.data = data;
    }
    Route = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object])], Route);
    return Route;
  })();
  exports.Route = Route;
  var AuxRoute = (function() {
    function AuxRoute(_a) {
      var path = _a.path,
          component = _a.component,
          name = _a.name;
      this.data = null;
      this.aux = null;
      this.loader = null;
      this.redirectTo = null;
      this.path = path;
      this.component = component;
      this.name = name;
    }
    AuxRoute = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object])], AuxRoute);
    return AuxRoute;
  })();
  exports.AuxRoute = AuxRoute;
  var AsyncRoute = (function() {
    function AsyncRoute(_a) {
      var path = _a.path,
          loader = _a.loader,
          name = _a.name,
          data = _a.data;
      this.aux = null;
      this.path = path;
      this.loader = loader;
      this.name = name;
      this.data = data;
    }
    AsyncRoute = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object])], AsyncRoute);
    return AsyncRoute;
  })();
  exports.AsyncRoute = AsyncRoute;
  var Redirect = (function() {
    function Redirect(_a) {
      var path = _a.path,
          redirectTo = _a.redirectTo;
      this.name = null;
      this.loader = null;
      this.data = null;
      this.aux = null;
      this.path = path;
      this.redirectTo = redirectTo;
    }
    Redirect = __decorate([lang_1.CONST(), __metadata('design:paramtypes', [Object])], Redirect);
    return Redirect;
  })();
  exports.Redirect = Redirect;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/async_route_handler", ["angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var AsyncRouteHandler = (function() {
    function AsyncRouteHandler(_loader, data) {
      this._loader = _loader;
      this.data = data;
      this._resolvedComponent = null;
    }
    AsyncRouteHandler.prototype.resolveComponentType = function() {
      var _this = this;
      if (lang_1.isPresent(this._resolvedComponent)) {
        return this._resolvedComponent;
      }
      return this._resolvedComponent = this._loader().then(function(componentType) {
        _this.componentType = componentType;
        return componentType;
      });
    };
    return AsyncRouteHandler;
  })();
  exports.AsyncRouteHandler = AsyncRouteHandler;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/sync_route_handler", ["angular2/src/facade/async"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var async_1 = require("angular2/src/facade/async");
  var SyncRouteHandler = (function() {
    function SyncRouteHandler(componentType, data) {
      this.componentType = componentType;
      this.data = data;
      this._resolvedComponent = null;
      this._resolvedComponent = async_1.PromiseWrapper.resolve(componentType);
    }
    SyncRouteHandler.prototype.resolveComponentType = function() {
      return this._resolvedComponent;
    };
    return SyncRouteHandler;
  })();
  exports.SyncRouteHandler = SyncRouteHandler;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_config_decorator", ["angular2/src/router/route_config_impl", "angular2/src/core/util/decorators", "angular2/src/router/route_config_impl"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var route_config_impl_1 = require("angular2/src/router/route_config_impl");
  var decorators_1 = require("angular2/src/core/util/decorators");
  var route_config_impl_2 = require("angular2/src/router/route_config_impl");
  exports.Route = route_config_impl_2.Route;
  exports.Redirect = route_config_impl_2.Redirect;
  exports.AuxRoute = route_config_impl_2.AuxRoute;
  exports.AsyncRoute = route_config_impl_2.AsyncRoute;
  exports.RouteConfig = decorators_1.makeDecorator(route_config_impl_1.RouteConfig);
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/hash_location_strategy", ["angular2/src/core/dom/dom_adapter", "angular2/angular2", "angular2/src/router/location_strategy"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var dom_adapter_1 = require("angular2/src/core/dom/dom_adapter");
  var angular2_1 = require("angular2/angular2");
  var location_strategy_1 = require("angular2/src/router/location_strategy");
  var HashLocationStrategy = (function(_super) {
    __extends(HashLocationStrategy, _super);
    function HashLocationStrategy() {
      _super.call(this);
      this._location = dom_adapter_1.DOM.getLocation();
      this._history = dom_adapter_1.DOM.getHistory();
    }
    HashLocationStrategy.prototype.onPopState = function(fn) {
      dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    };
    HashLocationStrategy.prototype.getBaseHref = function() {
      return '';
    };
    HashLocationStrategy.prototype.path = function() {
      var path = this._location.hash;
      return (path.length > 0 ? path.substring(1) : path) + location_strategy_1.normalizeQueryParams(this._location.search);
    };
    HashLocationStrategy.prototype.prepareExternalUrl = function(internal) {
      return internal.length > 0 ? ('#' + internal) : internal;
    };
    HashLocationStrategy.prototype.pushState = function(state, title, path, queryParams) {
      var url = path + location_strategy_1.normalizeQueryParams(queryParams);
      if (url.length == 0) {
        url = this._location.pathname;
      } else {
        url = this.prepareExternalUrl(url);
      }
      this._history.pushState(state, title, url);
    };
    HashLocationStrategy.prototype.forward = function() {
      this._history.forward();
    };
    HashLocationStrategy.prototype.back = function() {
      this._history.back();
    };
    HashLocationStrategy = __decorate([angular2_1.Injectable(), __metadata('design:paramtypes', [])], HashLocationStrategy);
    return HashLocationStrategy;
  })(location_strategy_1.LocationStrategy);
  exports.HashLocationStrategy = HashLocationStrategy;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/path_location_strategy", ["angular2/src/core/dom/dom_adapter", "angular2/angular2", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/router/location_strategy"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
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
  var dom_adapter_1 = require("angular2/src/core/dom/dom_adapter");
  var angular2_1 = require("angular2/angular2");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var location_strategy_1 = require("angular2/src/router/location_strategy");
  var PathLocationStrategy = (function(_super) {
    __extends(PathLocationStrategy, _super);
    function PathLocationStrategy(href) {
      _super.call(this);
      if (lang_1.isBlank(href)) {
        href = dom_adapter_1.DOM.getBaseHref();
      }
      if (lang_1.isBlank(href)) {
        throw new exceptions_1.BaseException("No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.");
      }
      this._location = dom_adapter_1.DOM.getLocation();
      this._history = dom_adapter_1.DOM.getHistory();
      this._baseHref = href;
    }
    PathLocationStrategy.prototype.onPopState = function(fn) {
      dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
      dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('hashchange', fn, false);
    };
    PathLocationStrategy.prototype.getBaseHref = function() {
      return this._baseHref;
    };
    PathLocationStrategy.prototype.prepareExternalUrl = function(internal) {
      if (internal.startsWith('/') && this._baseHref.endsWith('/')) {
        return this._baseHref + internal.substring(1);
      }
      return this._baseHref + internal;
    };
    PathLocationStrategy.prototype.path = function() {
      return this._location.pathname + location_strategy_1.normalizeQueryParams(this._location.search);
    };
    PathLocationStrategy.prototype.pushState = function(state, title, url, queryParams) {
      var externalUrl = this.prepareExternalUrl(url + location_strategy_1.normalizeQueryParams(queryParams));
      this._history.pushState(state, title, externalUrl);
    };
    PathLocationStrategy.prototype.forward = function() {
      this._history.forward();
    };
    PathLocationStrategy.prototype.back = function() {
      this._history.back();
    };
    PathLocationStrategy = __decorate([angular2_1.Injectable(), __param(0, angular2_1.Inject(location_strategy_1.APP_BASE_HREF)), __metadata('design:paramtypes', [String])], PathLocationStrategy);
    return PathLocationStrategy;
  })(location_strategy_1.LocationStrategy);
  exports.PathLocationStrategy = PathLocationStrategy;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_definition", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/location", ["angular2/src/router/location_strategy", "angular2/src/facade/async", "angular2/angular2"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var location_strategy_1 = require("angular2/src/router/location_strategy");
  var async_1 = require("angular2/src/facade/async");
  var angular2_1 = require("angular2/angular2");
  var Location = (function() {
    function Location(platformStrategy) {
      var _this = this;
      this.platformStrategy = platformStrategy;
      this._subject = new async_1.EventEmitter();
      var browserBaseHref = this.platformStrategy.getBaseHref();
      this._baseHref = stripTrailingSlash(stripIndexHtml(browserBaseHref));
      this.platformStrategy.onPopState(function(_) {
        async_1.ObservableWrapper.callNext(_this._subject, {
          'url': _this.path(),
          'pop': true
        });
      });
    }
    Location.prototype.path = function() {
      return this.normalize(this.platformStrategy.path());
    };
    Location.prototype.normalize = function(url) {
      return stripTrailingSlash(_stripBaseHref(this._baseHref, stripIndexHtml(url)));
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
    Location = __decorate([angular2_1.Injectable(), __metadata('design:paramtypes', [location_strategy_1.LocationStrategy])], Location);
    return Location;
  })();
  exports.Location = Location;
  function _stripBaseHref(baseHref, url) {
    if (baseHref.length > 0 && url.startsWith(baseHref)) {
      return url.substring(baseHref.length);
    }
    return url;
  }
  function stripIndexHtml(url) {
    if (/\/index.html$/g.test(url)) {
      return url.substring(0, url.length - 11);
    }
    return url;
  }
  function stripTrailingSlash(url) {
    if (/\/$/g.test(url)) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/path_recognizer", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/collection", "angular2/src/router/url_parser", "angular2/src/router/instruction"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var url_parser_1 = require("angular2/src/router/url_parser");
  var instruction_1 = require("angular2/src/router/instruction");
  var TouchMap = (function() {
    function TouchMap(map) {
      var _this = this;
      this.map = {};
      this.keys = {};
      if (lang_1.isPresent(map)) {
        collection_1.StringMapWrapper.forEach(map, function(value, key) {
          _this.map[key] = lang_1.isPresent(value) ? value.toString() : null;
          _this.keys[key] = true;
        });
      }
    }
    TouchMap.prototype.get = function(key) {
      collection_1.StringMapWrapper.delete(this.keys, key);
      return this.map[key];
    };
    TouchMap.prototype.getUnused = function() {
      var _this = this;
      var unused = collection_1.StringMapWrapper.create();
      var keys = collection_1.StringMapWrapper.keys(this.keys);
      keys.forEach(function(key) {
        return unused[key] = collection_1.StringMapWrapper.get(_this.map, key);
      });
      return unused;
    };
    return TouchMap;
  })();
  function normalizeString(obj) {
    if (lang_1.isBlank(obj)) {
      return null;
    } else {
      return obj.toString();
    }
  }
  var ContinuationSegment = (function() {
    function ContinuationSegment() {
      this.name = '';
    }
    ContinuationSegment.prototype.generate = function(params) {
      return '';
    };
    ContinuationSegment.prototype.match = function(path) {
      return true;
    };
    return ContinuationSegment;
  })();
  var StaticSegment = (function() {
    function StaticSegment(path) {
      this.path = path;
      this.name = '';
    }
    StaticSegment.prototype.match = function(path) {
      return path == this.path;
    };
    StaticSegment.prototype.generate = function(params) {
      return this.path;
    };
    return StaticSegment;
  })();
  var DynamicSegment = (function() {
    function DynamicSegment(name) {
      this.name = name;
    }
    DynamicSegment.prototype.match = function(path) {
      return path.length > 0;
    };
    DynamicSegment.prototype.generate = function(params) {
      if (!collection_1.StringMapWrapper.contains(params.map, this.name)) {
        throw new exceptions_1.BaseException("Route generator for '" + this.name + "' was not included in parameters passed.");
      }
      return normalizeString(params.get(this.name));
    };
    return DynamicSegment;
  })();
  var StarSegment = (function() {
    function StarSegment(name) {
      this.name = name;
    }
    StarSegment.prototype.match = function(path) {
      return true;
    };
    StarSegment.prototype.generate = function(params) {
      return normalizeString(params.get(this.name));
    };
    return StarSegment;
  })();
  var paramMatcher = /^:([^\/]+)$/g;
  var wildcardMatcher = /^\*([^\/]+)$/g;
  function parsePathString(route) {
    if (route.startsWith("/")) {
      route = route.substring(1);
    }
    var segments = splitBySlash(route);
    var results = [];
    var specificity = 0;
    if (segments.length > 98) {
      throw new exceptions_1.BaseException("'" + route + "' has more than the maximum supported number of segments.");
    }
    var limit = segments.length - 1;
    for (var i = 0; i <= limit; i++) {
      var segment = segments[i],
          match;
      if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(paramMatcher, segment))) {
        results.push(new DynamicSegment(match[1]));
        specificity += (100 - i);
      } else if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(wildcardMatcher, segment))) {
        results.push(new StarSegment(match[1]));
      } else if (segment == '...') {
        if (i < limit) {
          throw new exceptions_1.BaseException("Unexpected \"...\" before the end of the path for \"" + route + "\".");
        }
        results.push(new ContinuationSegment());
      } else {
        results.push(new StaticSegment(segment));
        specificity += 100 * (100 - i);
      }
    }
    var result = collection_1.StringMapWrapper.create();
    collection_1.StringMapWrapper.set(result, 'segments', results);
    collection_1.StringMapWrapper.set(result, 'specificity', specificity);
    return result;
  }
  function pathDslHash(segments) {
    return segments.map(function(segment) {
      if (segment instanceof StarSegment) {
        return '*';
      } else if (segment instanceof ContinuationSegment) {
        return '...';
      } else if (segment instanceof DynamicSegment) {
        return ':';
      } else if (segment instanceof StaticSegment) {
        return segment.path;
      }
    }).join('/');
  }
  function splitBySlash(url) {
    return url.split('/');
  }
  var RESERVED_CHARS = lang_1.RegExpWrapper.create('//|\\(|\\)|;|\\?|=');
  function assertPath(path) {
    if (lang_1.StringWrapper.contains(path, '#')) {
      throw new exceptions_1.BaseException("Path \"" + path + "\" should not include \"#\". Use \"HashLocationStrategy\" instead.");
    }
    var illegalCharacter = lang_1.RegExpWrapper.firstMatch(RESERVED_CHARS, path);
    if (lang_1.isPresent(illegalCharacter)) {
      throw new exceptions_1.BaseException("Path \"" + path + "\" contains \"" + illegalCharacter[0] + "\" which is not allowed in a route config.");
    }
  }
  var PathMatch = (function() {
    function PathMatch(instruction, remaining, remainingAux) {
      this.instruction = instruction;
      this.remaining = remaining;
      this.remainingAux = remainingAux;
    }
    return PathMatch;
  })();
  exports.PathMatch = PathMatch;
  var PathRecognizer = (function() {
    function PathRecognizer(path, handler) {
      this.path = path;
      this.handler = handler;
      this.terminal = true;
      this._cache = new collection_1.Map();
      assertPath(path);
      var parsed = parsePathString(path);
      this._segments = parsed['segments'];
      this.specificity = parsed['specificity'];
      this.hash = pathDslHash(this._segments);
      var lastSegment = this._segments[this._segments.length - 1];
      this.terminal = !(lastSegment instanceof ContinuationSegment);
    }
    PathRecognizer.prototype.recognize = function(beginningSegment) {
      var nextSegment = beginningSegment;
      var currentSegment;
      var positionalParams = {};
      var captured = [];
      for (var i = 0; i < this._segments.length; i += 1) {
        var segment = this._segments[i];
        currentSegment = nextSegment;
        if (segment instanceof ContinuationSegment) {
          break;
        }
        if (lang_1.isPresent(currentSegment)) {
          captured.push(currentSegment.path);
          if (segment instanceof StarSegment) {
            positionalParams[segment.name] = currentSegment.toString();
            nextSegment = null;
            break;
          }
          if (segment instanceof DynamicSegment) {
            positionalParams[segment.name] = currentSegment.path;
          } else if (!segment.match(currentSegment.path)) {
            return null;
          }
          nextSegment = currentSegment.child;
        } else if (!segment.match('')) {
          return null;
        }
      }
      if (this.terminal && lang_1.isPresent(nextSegment)) {
        return null;
      }
      var urlPath = captured.join('/');
      var auxiliary;
      var instruction;
      var urlParams;
      var allParams;
      if (lang_1.isPresent(currentSegment)) {
        var paramsSegment = beginningSegment instanceof url_parser_1.RootUrl ? beginningSegment : currentSegment;
        allParams = lang_1.isPresent(paramsSegment.params) ? collection_1.StringMapWrapper.merge(paramsSegment.params, positionalParams) : positionalParams;
        urlParams = url_parser_1.serializeParams(paramsSegment.params);
        auxiliary = currentSegment.auxiliary;
      } else {
        allParams = positionalParams;
        auxiliary = [];
        urlParams = [];
      }
      instruction = this._getInstruction(urlPath, urlParams, this, allParams);
      return new PathMatch(instruction, nextSegment, auxiliary);
    };
    PathRecognizer.prototype.generate = function(params) {
      var paramTokens = new TouchMap(params);
      var path = [];
      for (var i = 0; i < this._segments.length; i++) {
        var segment = this._segments[i];
        if (!(segment instanceof ContinuationSegment)) {
          path.push(segment.generate(paramTokens));
        }
      }
      var urlPath = path.join('/');
      var nonPositionalParams = paramTokens.getUnused();
      var urlParams = url_parser_1.serializeParams(nonPositionalParams);
      return this._getInstruction(urlPath, urlParams, this, params);
    };
    PathRecognizer.prototype._getInstruction = function(urlPath, urlParams, _recognizer, params) {
      var hashKey = urlPath + '?' + urlParams.join('?');
      if (this._cache.has(hashKey)) {
        return this._cache.get(hashKey);
      }
      var instruction = new instruction_1.ComponentInstruction_(urlPath, urlParams, _recognizer, params);
      this._cache.set(hashKey, instruction);
      return instruction;
    };
    return PathRecognizer;
  })();
  exports.PathRecognizer = PathRecognizer;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_config_nomalizer", ["angular2/src/router/route_config_decorator", "angular2/src/facade/lang", "angular2/src/facade/exceptions"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var route_config_decorator_1 = require("angular2/src/router/route_config_decorator");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  function normalizeRouteConfig(config) {
    if (config instanceof route_config_decorator_1.Route || config instanceof route_config_decorator_1.Redirect || config instanceof route_config_decorator_1.AsyncRoute || config instanceof route_config_decorator_1.AuxRoute) {
      return config;
    }
    if ((+!!config.component) + (+!!config.redirectTo) + (+!!config.loader) != 1) {
      throw new exceptions_1.BaseException("Route config should contain exactly one \"component\", \"loader\", or \"redirectTo\" property.");
    }
    if (config.as && config.name) {
      throw new exceptions_1.BaseException("Route config should contain exactly one \"as\" or \"name\" property.");
    }
    if (config.as) {
      config.name = config.as;
    }
    if (config.loader) {
      return new route_config_decorator_1.AsyncRoute({
        path: config.path,
        loader: config.loader,
        name: config.name
      });
    }
    if (config.aux) {
      return new route_config_decorator_1.AuxRoute({
        path: config.aux,
        component: config.component,
        name: config.name
      });
    }
    if (config.component) {
      if (typeof config.component == 'object') {
        var componentDefinitionObject = config.component;
        if (componentDefinitionObject.type == 'constructor') {
          return new route_config_decorator_1.Route({
            path: config.path,
            component: componentDefinitionObject.constructor,
            name: config.name
          });
        } else if (componentDefinitionObject.type == 'loader') {
          return new route_config_decorator_1.AsyncRoute({
            path: config.path,
            loader: componentDefinitionObject.loader,
            name: config.name
          });
        } else {
          throw new exceptions_1.BaseException("Invalid component type \"" + componentDefinitionObject.type + "\". Valid types are \"constructor\" and \"loader\".");
        }
      }
      return new route_config_decorator_1.Route(config);
    }
    if (config.redirectTo) {
      return new route_config_decorator_1.Redirect({
        path: config.path,
        redirectTo: config.redirectTo
      });
    }
    return config;
  }
  exports.normalizeRouteConfig = normalizeRouteConfig;
  function assertComponentExists(component, path) {
    if (!lang_1.isType(component)) {
      throw new exceptions_1.BaseException("Component for route \"" + path + "\" is not defined, or is not a class.");
    }
  }
  exports.assertComponentExists = assertComponentExists;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_lifecycle_reflector", ["angular2/src/facade/lang", "angular2/src/router/lifecycle_annotations_impl", "angular2/src/core/reflection/reflection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var lifecycle_annotations_impl_1 = require("angular2/src/router/lifecycle_annotations_impl");
  var reflection_1 = require("angular2/src/core/reflection/reflection");
  function hasLifecycleHook(e, type) {
    if (!(type instanceof lang_1.Type))
      return false;
    return e.name in type.prototype;
  }
  exports.hasLifecycleHook = hasLifecycleHook;
  function getCanActivateHook(type) {
    var annotations = reflection_1.reflector.annotations(type);
    for (var i = 0; i < annotations.length; i += 1) {
      var annotation = annotations[i];
      if (annotation instanceof lifecycle_annotations_impl_1.CanActivate) {
        return annotation.fn;
      }
    }
    return null;
  }
  exports.getCanActivateHook = getCanActivateHook;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/router_link", ["angular2/angular2", "angular2/src/facade/lang", "angular2/src/router/router", "angular2/src/router/location", "angular2/src/router/instruction"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var angular2_1 = require("angular2/angular2");
  var lang_1 = require("angular2/src/facade/lang");
  var router_1 = require("angular2/src/router/router");
  var location_1 = require("angular2/src/router/location");
  var instruction_1 = require("angular2/src/router/instruction");
  var RouterLink = (function() {
    function RouterLink(_router, _location) {
      this._router = _router;
      this._location = _location;
    }
    Object.defineProperty(RouterLink.prototype, "isRouteActive", {
      get: function() {
        return this._router.isRouteActive(this._navigationInstruction);
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(RouterLink.prototype, "routeParams", {
      set: function(changes) {
        this._routeParams = changes;
        this._navigationInstruction = this._router.generate(this._routeParams);
        var navigationHref = instruction_1.stringifyInstruction(this._navigationInstruction);
        this.visibleHref = this._location.prepareExternalUrl(navigationHref);
      },
      enumerable: true,
      configurable: true
    });
    RouterLink.prototype.onClick = function() {
      if (!lang_1.isString(this.target) || this.target == '_self') {
        this._router.navigateByInstruction(this._navigationInstruction);
        return false;
      }
      return true;
    };
    RouterLink = __decorate([angular2_1.Directive({
      selector: '[router-link]',
      inputs: ['routeParams: routerLink', 'target: target'],
      host: {
        '(click)': 'onClick()',
        '[attr.href]': 'visibleHref',
        '[class.router-link-active]': 'isRouteActive'
      }
    }), __metadata('design:paramtypes', [router_1.Router, location_1.Location])], RouterLink);
    return RouterLink;
  })();
  exports.RouterLink = RouterLink;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_recognizer", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/collection", "angular2/src/router/path_recognizer", "angular2/src/router/route_config_impl", "angular2/src/router/async_route_handler", "angular2/src/router/sync_route_handler", "angular2/src/router/url_parser"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var path_recognizer_1 = require("angular2/src/router/path_recognizer");
  var route_config_impl_1 = require("angular2/src/router/route_config_impl");
  var async_route_handler_1 = require("angular2/src/router/async_route_handler");
  var sync_route_handler_1 = require("angular2/src/router/sync_route_handler");
  var url_parser_1 = require("angular2/src/router/url_parser");
  var RouteRecognizer = (function() {
    function RouteRecognizer() {
      this.names = new collection_1.Map();
      this.auxRoutes = new collection_1.Map();
      this.matchers = [];
      this.redirects = [];
    }
    RouteRecognizer.prototype.config = function(config) {
      var handler;
      if (lang_1.isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
        var suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
        throw new exceptions_1.BaseException("Route \"" + config.path + "\" with name \"" + config.name + "\" does not begin with an uppercase letter. Route names should be CamelCase like \"" + suggestedName + "\".");
      }
      if (config instanceof route_config_impl_1.AuxRoute) {
        handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
        var path = config.path.startsWith('/') ? config.path.substring(1) : config.path;
        var recognizer = new path_recognizer_1.PathRecognizer(config.path, handler);
        this.auxRoutes.set(path, recognizer);
        return recognizer.terminal;
      }
      if (config instanceof route_config_impl_1.Redirect) {
        this.redirects.push(new Redirector(config.path, config.redirectTo));
        return true;
      }
      if (config instanceof route_config_impl_1.Route) {
        handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
      } else if (config instanceof route_config_impl_1.AsyncRoute) {
        handler = new async_route_handler_1.AsyncRouteHandler(config.loader, config.data);
      }
      var recognizer = new path_recognizer_1.PathRecognizer(config.path, handler);
      this.matchers.forEach(function(matcher) {
        if (recognizer.hash == matcher.hash) {
          throw new exceptions_1.BaseException("Configuration '" + config.path + "' conflicts with existing route '" + matcher.path + "'");
        }
      });
      this.matchers.push(recognizer);
      if (lang_1.isPresent(config.name)) {
        this.names.set(config.name, recognizer);
      }
      return recognizer.terminal;
    };
    RouteRecognizer.prototype.recognize = function(urlParse) {
      var solutions = [];
      urlParse = this._redirect(urlParse);
      this.matchers.forEach(function(pathRecognizer) {
        var pathMatch = pathRecognizer.recognize(urlParse);
        if (lang_1.isPresent(pathMatch)) {
          solutions.push(pathMatch);
        }
      });
      return solutions;
    };
    RouteRecognizer.prototype._redirect = function(urlParse) {
      for (var i = 0; i < this.redirects.length; i += 1) {
        var redirector = this.redirects[i];
        var redirectedUrl = redirector.redirect(urlParse);
        if (lang_1.isPresent(redirectedUrl)) {
          return redirectedUrl;
        }
      }
      return urlParse;
    };
    RouteRecognizer.prototype.recognizeAuxiliary = function(urlParse) {
      var pathRecognizer = this.auxRoutes.get(urlParse.path);
      if (lang_1.isBlank(pathRecognizer)) {
        return null;
      }
      return pathRecognizer.recognize(urlParse);
    };
    RouteRecognizer.prototype.hasRoute = function(name) {
      return this.names.has(name);
    };
    RouteRecognizer.prototype.generate = function(name, params) {
      var pathRecognizer = this.names.get(name);
      if (lang_1.isBlank(pathRecognizer)) {
        return null;
      }
      return pathRecognizer.generate(params);
    };
    return RouteRecognizer;
  })();
  exports.RouteRecognizer = RouteRecognizer;
  var Redirector = (function() {
    function Redirector(path, redirectTo) {
      this.segments = [];
      this.toSegments = [];
      if (path.startsWith('/')) {
        path = path.substring(1);
      }
      this.segments = path.split('/');
      if (redirectTo.startsWith('/')) {
        redirectTo = redirectTo.substring(1);
      }
      this.toSegments = redirectTo.split('/');
    }
    Redirector.prototype.redirect = function(urlParse) {
      for (var i = 0; i < this.segments.length; i += 1) {
        if (lang_1.isBlank(urlParse)) {
          return null;
        }
        var segment = this.segments[i];
        if (segment != urlParse.path) {
          return null;
        }
        urlParse = urlParse.child;
      }
      for (var i = this.toSegments.length - 1; i >= 0; i -= 1) {
        var segment = this.toSegments[i];
        urlParse = new url_parser_1.Url(segment, urlParse);
      }
      return urlParse;
    };
    return Redirector;
  })();
  exports.Redirector = Redirector;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_registry", ["angular2/src/router/route_recognizer", "angular2/src/router/instruction", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/router/route_config_impl", "angular2/src/core/reflection/reflection", "angular2/angular2", "angular2/src/router/route_config_nomalizer", "angular2/src/router/url_parser"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
  };
  var __metadata = (this && this.__metadata) || function(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
  var route_recognizer_1 = require("angular2/src/router/route_recognizer");
  var instruction_1 = require("angular2/src/router/instruction");
  var collection_1 = require("angular2/src/facade/collection");
  var async_1 = require("angular2/src/facade/async");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var route_config_impl_1 = require("angular2/src/router/route_config_impl");
  var reflection_1 = require("angular2/src/core/reflection/reflection");
  var angular2_1 = require("angular2/angular2");
  var route_config_nomalizer_1 = require("angular2/src/router/route_config_nomalizer");
  var url_parser_1 = require("angular2/src/router/url_parser");
  var _resolveToNull = async_1.PromiseWrapper.resolve(null);
  var RouteRegistry = (function() {
    function RouteRegistry() {
      this._rules = new collection_1.Map();
    }
    RouteRegistry.prototype.config = function(parentComponent, config) {
      config = route_config_nomalizer_1.normalizeRouteConfig(config);
      if (config instanceof route_config_impl_1.Route) {
        route_config_nomalizer_1.assertComponentExists(config.component, config.path);
      } else if (config instanceof route_config_impl_1.AuxRoute) {
        route_config_nomalizer_1.assertComponentExists(config.component, config.path);
      }
      var recognizer = this._rules.get(parentComponent);
      if (lang_1.isBlank(recognizer)) {
        recognizer = new route_recognizer_1.RouteRecognizer();
        this._rules.set(parentComponent, recognizer);
      }
      var terminal = recognizer.config(config);
      if (config instanceof route_config_impl_1.Route) {
        if (terminal) {
          assertTerminalComponent(config.component, config.path);
        } else {
          this.configFromComponent(config.component);
        }
      }
    };
    RouteRegistry.prototype.configFromComponent = function(component) {
      var _this = this;
      if (!lang_1.isType(component)) {
        return ;
      }
      if (this._rules.has(component)) {
        return ;
      }
      var annotations = reflection_1.reflector.annotations(component);
      if (lang_1.isPresent(annotations)) {
        for (var i = 0; i < annotations.length; i++) {
          var annotation = annotations[i];
          if (annotation instanceof route_config_impl_1.RouteConfig) {
            var routeCfgs = annotation.configs;
            routeCfgs.forEach(function(config) {
              return _this.config(component, config);
            });
          }
        }
      }
    };
    RouteRegistry.prototype.recognize = function(url, parentComponent) {
      var parsedUrl = url_parser_1.parser.parse(url);
      return this._recognize(parsedUrl, parentComponent);
    };
    RouteRegistry.prototype._recognize = function(parsedUrl, parentComponent) {
      var _this = this;
      return this._recognizePrimaryRoute(parsedUrl, parentComponent).then(function(instruction) {
        return _this._completeAuxiliaryRouteMatches(instruction, parentComponent);
      });
    };
    RouteRegistry.prototype._recognizePrimaryRoute = function(parsedUrl, parentComponent) {
      var _this = this;
      var componentRecognizer = this._rules.get(parentComponent);
      if (lang_1.isBlank(componentRecognizer)) {
        return _resolveToNull;
      }
      var possibleMatches = componentRecognizer.recognize(parsedUrl);
      var matchPromises = possibleMatches.map(function(candidate) {
        return _this._completePrimaryRouteMatch(candidate);
      });
      return async_1.PromiseWrapper.all(matchPromises).then(mostSpecific);
    };
    RouteRegistry.prototype._completePrimaryRouteMatch = function(partialMatch) {
      var _this = this;
      var instruction = partialMatch.instruction;
      return instruction.resolveComponentType().then(function(componentType) {
        _this.configFromComponent(componentType);
        if (instruction.terminal) {
          return new instruction_1.PrimaryInstruction(instruction, null, partialMatch.remainingAux);
        }
        return _this._recognizePrimaryRoute(partialMatch.remaining, componentType).then(function(childInstruction) {
          if (lang_1.isBlank(childInstruction)) {
            return null;
          } else {
            return new instruction_1.PrimaryInstruction(instruction, childInstruction, partialMatch.remainingAux);
          }
        });
      });
    };
    RouteRegistry.prototype._completeAuxiliaryRouteMatches = function(instruction, parentComponent) {
      var _this = this;
      if (lang_1.isBlank(instruction)) {
        return _resolveToNull;
      }
      var componentRecognizer = this._rules.get(parentComponent);
      var auxInstructions = {};
      var promises = instruction.auxUrls.map(function(auxSegment) {
        var match = componentRecognizer.recognizeAuxiliary(auxSegment);
        if (lang_1.isBlank(match)) {
          return _resolveToNull;
        }
        return _this._completePrimaryRouteMatch(match).then(function(auxInstruction) {
          if (lang_1.isPresent(auxInstruction)) {
            return _this._completeAuxiliaryRouteMatches(auxInstruction, parentComponent).then(function(finishedAuxRoute) {
              auxInstructions[auxSegment.path] = finishedAuxRoute;
            });
          }
        });
      });
      return async_1.PromiseWrapper.all(promises).then(function(_) {
        if (lang_1.isBlank(instruction.child)) {
          return new instruction_1.Instruction(instruction.component, null, auxInstructions);
        }
        return _this._completeAuxiliaryRouteMatches(instruction.child, instruction.component.componentType).then(function(completeChild) {
          return new instruction_1.Instruction(instruction.component, completeChild, auxInstructions);
        });
      });
    };
    RouteRegistry.prototype.generate = function(linkParams, parentComponent) {
      var segments = [];
      var componentCursor = parentComponent;
      var lastInstructionIsTerminal = false;
      for (var i = 0; i < linkParams.length; i += 1) {
        var segment = linkParams[i];
        if (lang_1.isBlank(componentCursor)) {
          throw new exceptions_1.BaseException("Could not find route named \"" + segment + "\".");
        }
        if (!lang_1.isString(segment)) {
          throw new exceptions_1.BaseException("Unexpected segment \"" + segment + "\" in link DSL. Expected a string.");
        } else if (segment == '' || segment == '.' || segment == '..') {
          throw new exceptions_1.BaseException("\"" + segment + "/\" is only allowed at the beginning of a link DSL.");
        }
        var params = {};
        if (i + 1 < linkParams.length) {
          var nextSegment = linkParams[i + 1];
          if (lang_1.isStringMap(nextSegment)) {
            params = nextSegment;
            i += 1;
          }
        }
        var componentRecognizer = this._rules.get(componentCursor);
        if (lang_1.isBlank(componentRecognizer)) {
          throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(componentCursor) + "\" has no route config.");
        }
        var response = componentRecognizer.generate(segment, params);
        if (lang_1.isBlank(response)) {
          throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(componentCursor) + "\" has no route named \"" + segment + "\".");
        }
        segments.push(response);
        componentCursor = response.componentType;
        lastInstructionIsTerminal = response.terminal;
      }
      var instruction = null;
      if (!lastInstructionIsTerminal) {
        instruction = this._generateRedirects(componentCursor);
        if (lang_1.isPresent(instruction)) {
          var lastInstruction = instruction;
          while (lang_1.isPresent(lastInstruction.child)) {
            lastInstruction = lastInstruction.child;
          }
          lastInstructionIsTerminal = lastInstruction.component.terminal;
        }
        if (lang_1.isPresent(componentCursor) && !lastInstructionIsTerminal) {
          throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" does not resolve to a terminal or async instruction.");
        }
      }
      while (segments.length > 0) {
        instruction = new instruction_1.Instruction(segments.pop(), instruction, {});
      }
      return instruction;
    };
    RouteRegistry.prototype.hasRoute = function(name, parentComponent) {
      var componentRecognizer = this._rules.get(parentComponent);
      if (lang_1.isBlank(componentRecognizer)) {
        return false;
      }
      return componentRecognizer.hasRoute(name);
    };
    RouteRegistry.prototype._generateRedirects = function(componentCursor) {
      if (lang_1.isBlank(componentCursor)) {
        return null;
      }
      var componentRecognizer = this._rules.get(componentCursor);
      if (lang_1.isBlank(componentRecognizer)) {
        return null;
      }
      for (var i = 0; i < componentRecognizer.redirects.length; i += 1) {
        var redirect = componentRecognizer.redirects[i];
        if (redirect.segments.length == 1 && redirect.segments[0] == '') {
          var toSegments = url_parser_1.pathSegmentsToUrl(redirect.toSegments);
          var matches = componentRecognizer.recognize(toSegments);
          var primaryInstruction = collection_1.ListWrapper.maximum(matches, function(match) {
            return match.instruction.specificity;
          });
          if (lang_1.isPresent(primaryInstruction)) {
            var child = this._generateRedirects(primaryInstruction.instruction.componentType);
            return new instruction_1.Instruction(primaryInstruction.instruction, child, {});
          }
          return null;
        }
      }
      return null;
    };
    RouteRegistry = __decorate([angular2_1.Injectable(), __metadata('design:paramtypes', [])], RouteRegistry);
    return RouteRegistry;
  })();
  exports.RouteRegistry = RouteRegistry;
  function mostSpecific(instructions) {
    return collection_1.ListWrapper.maximum(instructions, function(instruction) {
      return instruction.component.specificity;
    });
  }
  function assertTerminalComponent(component, path) {
    if (!lang_1.isType(component)) {
      return ;
    }
    var annotations = reflection_1.reflector.annotations(component);
    if (lang_1.isPresent(annotations)) {
      for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        if (annotation instanceof route_config_impl_1.RouteConfig) {
          throw new exceptions_1.BaseException("Child routes are not allowed for \"" + path + "\". Use \"...\" on the parent's route path.");
        }
      }
    }
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/router", ["angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/router/instruction", "angular2/src/router/route_lifecycle_reflector"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var __extends = (this && this.__extends) || function(d, b) {
    for (var p in b)
      if (b.hasOwnProperty(p))
        d[p] = b[p];
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
  var async_1 = require("angular2/src/facade/async");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var instruction_1 = require("angular2/src/router/instruction");
  var route_lifecycle_reflector_1 = require("angular2/src/router/route_lifecycle_reflector");
  var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
  var _resolveToFalse = async_1.PromiseWrapper.resolve(false);
  var Router = (function() {
    function Router(registry, parent, hostComponent) {
      this.registry = registry;
      this.parent = parent;
      this.hostComponent = hostComponent;
      this.navigating = false;
      this._currentInstruction = null;
      this._currentNavigation = _resolveToTrue;
      this._outlet = null;
      this._auxRouters = new collection_1.Map();
      this._subject = new async_1.EventEmitter();
    }
    Router.prototype.childRouter = function(hostComponent) {
      return this._childRouter = new ChildRouter(this, hostComponent);
    };
    Router.prototype.auxRouter = function(hostComponent) {
      return new ChildRouter(this, hostComponent);
    };
    Router.prototype.registerPrimaryOutlet = function(outlet) {
      if (lang_1.isPresent(outlet.name)) {
        throw new exceptions_1.BaseException("registerPrimaryOutlet expects to be called with an unnamed outlet.");
      }
      this._outlet = outlet;
      if (lang_1.isPresent(this._currentInstruction)) {
        return this.commit(this._currentInstruction, false);
      }
      return _resolveToTrue;
    };
    Router.prototype.registerAuxOutlet = function(outlet) {
      var outletName = outlet.name;
      if (lang_1.isBlank(outletName)) {
        throw new exceptions_1.BaseException("registerAuxOutlet expects to be called with an outlet with a name.");
      }
      var router = this.auxRouter(this.hostComponent);
      this._auxRouters.set(outletName, router);
      router._outlet = outlet;
      var auxInstruction;
      if (lang_1.isPresent(this._currentInstruction) && lang_1.isPresent(auxInstruction = this._currentInstruction.auxInstruction[outletName])) {
        return router.commit(auxInstruction);
      }
      return _resolveToTrue;
    };
    Router.prototype.isRouteActive = function(instruction) {
      var router = this;
      while (lang_1.isPresent(router.parent) && lang_1.isPresent(instruction.child)) {
        router = router.parent;
        instruction = instruction.child;
      }
      return lang_1.isPresent(this._currentInstruction) && this._currentInstruction.component == instruction.component;
    };
    Router.prototype.config = function(definitions) {
      var _this = this;
      definitions.forEach(function(routeDefinition) {
        _this.registry.config(_this.hostComponent, routeDefinition);
      });
      return this.renavigate();
    };
    Router.prototype.navigate = function(linkParams) {
      var instruction = this.generate(linkParams);
      return this.navigateByInstruction(instruction, false);
    };
    Router.prototype.navigateByUrl = function(url, _skipLocationChange) {
      var _this = this;
      if (_skipLocationChange === void 0) {
        _skipLocationChange = false;
      }
      return this._currentNavigation = this._currentNavigation.then(function(_) {
        _this.lastNavigationAttempt = url;
        _this._startNavigating();
        return _this._afterPromiseFinishNavigating(_this.recognize(url).then(function(instruction) {
          if (lang_1.isBlank(instruction)) {
            return false;
          }
          return _this._navigate(instruction, _skipLocationChange);
        }));
      });
    };
    Router.prototype.navigateByInstruction = function(instruction, _skipLocationChange) {
      var _this = this;
      if (_skipLocationChange === void 0) {
        _skipLocationChange = false;
      }
      if (lang_1.isBlank(instruction)) {
        return _resolveToFalse;
      }
      return this._currentNavigation = this._currentNavigation.then(function(_) {
        _this._startNavigating();
        return _this._afterPromiseFinishNavigating(_this._navigate(instruction, _skipLocationChange));
      });
    };
    Router.prototype._navigate = function(instruction, _skipLocationChange) {
      var _this = this;
      return this._settleInstruction(instruction).then(function(_) {
        return _this._canReuse(instruction);
      }).then(function(_) {
        return _this._canActivate(instruction);
      }).then(function(result) {
        if (!result) {
          return false;
        }
        return _this._canDeactivate(instruction).then(function(result) {
          if (result) {
            return _this.commit(instruction, _skipLocationChange).then(function(_) {
              _this._emitNavigationFinish(instruction_1.stringifyInstruction(instruction));
              return true;
            });
          }
        });
      });
    };
    Router.prototype._settleInstruction = function(instruction) {
      var _this = this;
      var unsettledInstructions = [];
      if (lang_1.isBlank(instruction.component.componentType)) {
        unsettledInstructions.push(instruction.component.resolveComponentType().then(function(type) {
          _this.registry.configFromComponent(type);
        }));
      }
      if (lang_1.isPresent(instruction.child)) {
        unsettledInstructions.push(this._settleInstruction(instruction.child));
      }
      collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function(instruction, _) {
        unsettledInstructions.push(_this._settleInstruction(instruction));
      });
      return async_1.PromiseWrapper.all(unsettledInstructions);
    };
    Router.prototype._emitNavigationFinish = function(url) {
      async_1.ObservableWrapper.callNext(this._subject, url);
    };
    Router.prototype._afterPromiseFinishNavigating = function(promise) {
      var _this = this;
      return async_1.PromiseWrapper.catchError(promise.then(function(_) {
        return _this._finishNavigating();
      }), function(err) {
        _this._finishNavigating();
        throw err;
      });
    };
    Router.prototype._canReuse = function(instruction) {
      var _this = this;
      if (lang_1.isBlank(this._outlet)) {
        return _resolveToFalse;
      }
      return this._outlet.canReuse(instruction.component).then(function(result) {
        instruction.component.reuse = result;
        if (result && lang_1.isPresent(_this._childRouter) && lang_1.isPresent(instruction.child)) {
          return _this._childRouter._canReuse(instruction.child);
        }
      });
    };
    Router.prototype._canActivate = function(nextInstruction) {
      return canActivateOne(nextInstruction, this._currentInstruction);
    };
    Router.prototype._canDeactivate = function(instruction) {
      var _this = this;
      if (lang_1.isBlank(this._outlet)) {
        return _resolveToTrue;
      }
      var next;
      var childInstruction = null;
      var reuse = false;
      var componentInstruction = null;
      if (lang_1.isPresent(instruction)) {
        childInstruction = instruction.child;
        componentInstruction = instruction.component;
        reuse = instruction.component.reuse;
      }
      if (reuse) {
        next = _resolveToTrue;
      } else {
        next = this._outlet.canDeactivate(componentInstruction);
      }
      return next.then(function(result) {
        if (result == false) {
          return false;
        }
        if (lang_1.isPresent(_this._childRouter)) {
          return _this._childRouter._canDeactivate(childInstruction);
        }
        return true;
      });
    };
    Router.prototype.commit = function(instruction, _skipLocationChange) {
      var _this = this;
      if (_skipLocationChange === void 0) {
        _skipLocationChange = false;
      }
      this._currentInstruction = instruction;
      var next = _resolveToTrue;
      if (lang_1.isPresent(this._outlet)) {
        var componentInstruction = instruction.component;
        if (componentInstruction.reuse) {
          next = this._outlet.reuse(componentInstruction);
        } else {
          next = this.deactivate(instruction).then(function(_) {
            return _this._outlet.activate(componentInstruction);
          });
        }
        if (lang_1.isPresent(instruction.child)) {
          next = next.then(function(_) {
            if (lang_1.isPresent(_this._childRouter)) {
              return _this._childRouter.commit(instruction.child);
            }
          });
        }
      }
      var promises = [];
      this._auxRouters.forEach(function(router, name) {
        if (lang_1.isPresent(instruction.auxInstruction[name])) {
          promises.push(router.commit(instruction.auxInstruction[name]));
        }
      });
      return next.then(function(_) {
        return async_1.PromiseWrapper.all(promises);
      });
    };
    Router.prototype._startNavigating = function() {
      this.navigating = true;
    };
    Router.prototype._finishNavigating = function() {
      this.navigating = false;
    };
    Router.prototype.subscribe = function(onNext) {
      return async_1.ObservableWrapper.subscribe(this._subject, onNext);
    };
    Router.prototype.deactivate = function(instruction) {
      var _this = this;
      var childInstruction = null;
      var componentInstruction = null;
      if (lang_1.isPresent(instruction)) {
        childInstruction = instruction.child;
        componentInstruction = instruction.component;
      }
      var next = _resolveToTrue;
      if (lang_1.isPresent(this._childRouter)) {
        next = this._childRouter.deactivate(childInstruction);
      }
      if (lang_1.isPresent(this._outlet)) {
        next = next.then(function(_) {
          return _this._outlet.deactivate(componentInstruction);
        });
      }
      return next;
    };
    Router.prototype.recognize = function(url) {
      return this.registry.recognize(url, this.hostComponent);
    };
    Router.prototype.renavigate = function() {
      if (lang_1.isBlank(this.lastNavigationAttempt)) {
        return this._currentNavigation;
      }
      return this.navigateByUrl(this.lastNavigationAttempt);
    };
    Router.prototype.generate = function(linkParams) {
      var normalizedLinkParams = splitAndFlattenLinkParams(linkParams);
      var first = collection_1.ListWrapper.first(normalizedLinkParams);
      var rest = collection_1.ListWrapper.slice(normalizedLinkParams, 1);
      var router = this;
      if (first == '') {
        while (lang_1.isPresent(router.parent)) {
          router = router.parent;
        }
      } else if (first == '..') {
        router = router.parent;
        while (collection_1.ListWrapper.first(rest) == '..') {
          rest = collection_1.ListWrapper.slice(rest, 1);
          router = router.parent;
          if (lang_1.isBlank(router)) {
            throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
          }
        }
      } else if (first != '.') {
        var childRouteExists = this.registry.hasRoute(first, this.hostComponent);
        var parentRouteExists = lang_1.isPresent(this.parent) && this.registry.hasRoute(first, this.parent.hostComponent);
        if (parentRouteExists && childRouteExists) {
          var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.";
          throw new exceptions_1.BaseException(msg);
        }
        if (parentRouteExists) {
          router = this.parent;
        }
        rest = linkParams;
      }
      if (rest[rest.length - 1] == '') {
        rest.pop();
      }
      if (rest.length < 1) {
        var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must include a route name.";
        throw new exceptions_1.BaseException(msg);
      }
      var nextInstruction = this.registry.generate(rest, router.hostComponent);
      var url = [];
      var parent = router.parent;
      while (lang_1.isPresent(parent)) {
        url.unshift(parent._currentInstruction);
        parent = parent.parent;
      }
      while (url.length > 0) {
        nextInstruction = url.pop().replaceChild(nextInstruction);
      }
      return nextInstruction;
    };
    return Router;
  })();
  exports.Router = Router;
  var RootRouter = (function(_super) {
    __extends(RootRouter, _super);
    function RootRouter(registry, location, primaryComponent) {
      var _this = this;
      _super.call(this, registry, null, primaryComponent);
      this._location = location;
      this._locationSub = this._location.subscribe(function(change) {
        return _this.navigateByUrl(change['url'], lang_1.isPresent(change['pop']));
      });
      this.registry.configFromComponent(primaryComponent);
      this.navigateByUrl(location.path());
    }
    RootRouter.prototype.commit = function(instruction, _skipLocationChange) {
      var _this = this;
      if (_skipLocationChange === void 0) {
        _skipLocationChange = false;
      }
      var emitPath = instruction_1.stringifyInstructionPath(instruction);
      var emitQuery = instruction_1.stringifyInstructionQuery(instruction);
      if (emitPath.length > 0) {
        emitPath = '/' + emitPath;
      }
      var promise = _super.prototype.commit.call(this, instruction);
      if (!_skipLocationChange) {
        promise = promise.then(function(_) {
          _this._location.go(emitPath, emitQuery);
        });
      }
      return promise;
    };
    RootRouter.prototype.dispose = function() {
      if (lang_1.isPresent(this._locationSub)) {
        async_1.ObservableWrapper.dispose(this._locationSub);
        this._locationSub = null;
      }
    };
    return RootRouter;
  })(Router);
  exports.RootRouter = RootRouter;
  var ChildRouter = (function(_super) {
    __extends(ChildRouter, _super);
    function ChildRouter(parent, hostComponent) {
      _super.call(this, parent.registry, parent, hostComponent);
      this.parent = parent;
    }
    ChildRouter.prototype.navigateByUrl = function(url, _skipLocationChange) {
      if (_skipLocationChange === void 0) {
        _skipLocationChange = false;
      }
      return this.parent.navigateByUrl(url, _skipLocationChange);
    };
    ChildRouter.prototype.navigateByInstruction = function(instruction, _skipLocationChange) {
      if (_skipLocationChange === void 0) {
        _skipLocationChange = false;
      }
      return this.parent.navigateByInstruction(instruction, _skipLocationChange);
    };
    return ChildRouter;
  })(Router);
  function splitAndFlattenLinkParams(linkParams) {
    return linkParams.reduce(function(accumulation, item) {
      if (lang_1.isString(item)) {
        var strItem = item;
        return accumulation.concat(strItem.split('/'));
      }
      accumulation.push(item);
      return accumulation;
    }, []);
  }
  function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (lang_1.isPresent(nextInstruction.child)) {
      next = canActivateOne(nextInstruction.child, lang_1.isPresent(prevInstruction) ? prevInstruction.child : null);
    }
    return next.then(function(result) {
      if (result == false) {
        return false;
      }
      if (nextInstruction.component.reuse) {
        return true;
      }
      var hook = route_lifecycle_reflector_1.getCanActivateHook(nextInstruction.component.componentType);
      if (lang_1.isPresent(hook)) {
        return hook(nextInstruction.component, lang_1.isPresent(prevInstruction) ? prevInstruction.component : null);
      }
      return true;
    });
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/router_outlet", ["angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/angular2", "angular2/src/router/router", "angular2/src/router/instruction", "angular2/src/router/lifecycle_annotations", "angular2/src/router/route_lifecycle_reflector"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var __decorate = (this && this.__decorate) || function(decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
      case 2:
        return decorators.reduceRight(function(o, d) {
          return (d && d(o)) || o;
        }, target);
      case 3:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key)), void 0;
        }, void 0);
      case 4:
        return decorators.reduceRight(function(o, d) {
          return (d && d(target, key, o)) || o;
        }, desc);
    }
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
  var async_1 = require("angular2/src/facade/async");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var angular2_1 = require("angular2/angular2");
  var routerMod = require("angular2/src/router/router");
  var instruction_1 = require("angular2/src/router/instruction");
  var hookMod = require("angular2/src/router/lifecycle_annotations");
  var route_lifecycle_reflector_1 = require("angular2/src/router/route_lifecycle_reflector");
  var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
  var RouterOutlet = (function() {
    function RouterOutlet(_elementRef, _loader, _parentRouter, nameAttr) {
      this._elementRef = _elementRef;
      this._loader = _loader;
      this._parentRouter = _parentRouter;
      this.name = null;
      this._componentRef = null;
      this._currentInstruction = null;
      if (lang_1.isPresent(nameAttr)) {
        this.name = nameAttr;
        this._parentRouter.registerAuxOutlet(this);
      } else {
        this._parentRouter.registerPrimaryOutlet(this);
      }
    }
    RouterOutlet.prototype.activate = function(nextInstruction) {
      var _this = this;
      var previousInstruction = this._currentInstruction;
      this._currentInstruction = nextInstruction;
      var componentType = nextInstruction.componentType;
      var childRouter = this._parentRouter.childRouter(componentType);
      var providers = angular2_1.Injector.resolve([angular2_1.provide(instruction_1.RouteData, {useValue: nextInstruction.routeData}), angular2_1.provide(instruction_1.RouteParams, {useValue: new instruction_1.RouteParams(nextInstruction.params)}), angular2_1.provide(routerMod.Router, {useValue: childRouter})]);
      return this._loader.loadNextToLocation(componentType, this._elementRef, providers).then(function(componentRef) {
        _this._componentRef = componentRef;
        if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onActivate, componentType)) {
          return _this._componentRef.instance.onActivate(nextInstruction, previousInstruction);
        }
      });
    };
    RouterOutlet.prototype.reuse = function(nextInstruction) {
      var previousInstruction = this._currentInstruction;
      this._currentInstruction = nextInstruction;
      if (lang_1.isBlank(this._componentRef)) {
        throw new exceptions_1.BaseException("Cannot reuse an outlet that does not contain a component.");
      }
      return async_1.PromiseWrapper.resolve(route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onReuse, this._currentInstruction.componentType) ? this._componentRef.instance.onReuse(nextInstruction, previousInstruction) : true);
    };
    RouterOutlet.prototype.deactivate = function(nextInstruction) {
      var _this = this;
      var next = _resolveToTrue;
      if (lang_1.isPresent(this._componentRef) && lang_1.isPresent(this._currentInstruction) && route_lifecycle_reflector_1.hasLifecycleHook(hookMod.onDeactivate, this._currentInstruction.componentType)) {
        next = async_1.PromiseWrapper.resolve(this._componentRef.instance.onDeactivate(nextInstruction, this._currentInstruction));
      }
      return next.then(function(_) {
        if (lang_1.isPresent(_this._componentRef)) {
          _this._componentRef.dispose();
          _this._componentRef = null;
        }
      });
    };
    RouterOutlet.prototype.canDeactivate = function(nextInstruction) {
      if (lang_1.isBlank(this._currentInstruction)) {
        return _resolveToTrue;
      }
      if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.canDeactivate, this._currentInstruction.componentType)) {
        return async_1.PromiseWrapper.resolve(this._componentRef.instance.canDeactivate(nextInstruction, this._currentInstruction));
      }
      return _resolveToTrue;
    };
    RouterOutlet.prototype.canReuse = function(nextInstruction) {
      var result;
      if (lang_1.isBlank(this._currentInstruction) || this._currentInstruction.componentType != nextInstruction.componentType) {
        result = false;
      } else if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.canReuse, this._currentInstruction.componentType)) {
        result = this._componentRef.instance.canReuse(nextInstruction, this._currentInstruction);
      } else {
        result = nextInstruction == this._currentInstruction || (lang_1.isPresent(nextInstruction.params) && lang_1.isPresent(this._currentInstruction.params) && collection_1.StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
      }
      return async_1.PromiseWrapper.resolve(result);
    };
    RouterOutlet = __decorate([angular2_1.Directive({selector: 'router-outlet'}), __param(3, angular2_1.Attribute('name')), __metadata('design:paramtypes', [angular2_1.ElementRef, angular2_1.DynamicComponentLoader, routerMod.Router, String])], RouterOutlet);
    return RouterOutlet;
  })();
  exports.RouterOutlet = RouterOutlet;
  global.define = __define;
  return module.exports;
});

System.register("angular2/router", ["angular2/src/router/router", "angular2/src/router/router_outlet", "angular2/src/router/router_link", "angular2/src/router/instruction", "angular2/src/router/route_registry", "angular2/src/router/location_strategy", "angular2/src/router/hash_location_strategy", "angular2/src/router/path_location_strategy", "angular2/src/router/location", "angular2/src/router/route_config_decorator", "angular2/src/router/route_definition", "angular2/src/router/lifecycle_annotations", "angular2/src/router/instruction", "angular2/angular2", "angular2/src/router/location_strategy", "angular2/src/router/path_location_strategy", "angular2/src/router/router", "angular2/src/router/router_outlet", "angular2/src/router/router_link", "angular2/src/router/route_registry", "angular2/src/router/location", "angular2/angular2", "angular2/src/facade/lang", "angular2/src/facade/exceptions"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  var router_1 = require("angular2/src/router/router");
  exports.Router = router_1.Router;
  var router_outlet_1 = require("angular2/src/router/router_outlet");
  exports.RouterOutlet = router_outlet_1.RouterOutlet;
  var router_link_1 = require("angular2/src/router/router_link");
  exports.RouterLink = router_link_1.RouterLink;
  var instruction_1 = require("angular2/src/router/instruction");
  exports.RouteParams = instruction_1.RouteParams;
  exports.RouteData = instruction_1.RouteData;
  var route_registry_1 = require("angular2/src/router/route_registry");
  exports.RouteRegistry = route_registry_1.RouteRegistry;
  var location_strategy_1 = require("angular2/src/router/location_strategy");
  exports.LocationStrategy = location_strategy_1.LocationStrategy;
  exports.APP_BASE_HREF = location_strategy_1.APP_BASE_HREF;
  var hash_location_strategy_1 = require("angular2/src/router/hash_location_strategy");
  exports.HashLocationStrategy = hash_location_strategy_1.HashLocationStrategy;
  var path_location_strategy_1 = require("angular2/src/router/path_location_strategy");
  exports.PathLocationStrategy = path_location_strategy_1.PathLocationStrategy;
  var location_1 = require("angular2/src/router/location");
  exports.Location = location_1.Location;
  __export(require("angular2/src/router/route_config_decorator"));
  __export(require("angular2/src/router/route_definition"));
  var lifecycle_annotations_1 = require("angular2/src/router/lifecycle_annotations");
  exports.CanActivate = lifecycle_annotations_1.CanActivate;
  var instruction_2 = require("angular2/src/router/instruction");
  exports.Instruction = instruction_2.Instruction;
  exports.ComponentInstruction = instruction_2.ComponentInstruction;
  var angular2_1 = require("angular2/angular2");
  exports.OpaqueToken = angular2_1.OpaqueToken;
  var location_strategy_2 = require("angular2/src/router/location_strategy");
  var path_location_strategy_2 = require("angular2/src/router/path_location_strategy");
  var router_2 = require("angular2/src/router/router");
  var router_outlet_2 = require("angular2/src/router/router_outlet");
  var router_link_2 = require("angular2/src/router/router_link");
  var route_registry_2 = require("angular2/src/router/route_registry");
  var location_2 = require("angular2/src/router/location");
  var angular2_2 = require("angular2/angular2");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  exports.ROUTER_PRIMARY_COMPONENT = lang_1.CONST_EXPR(new angular2_2.OpaqueToken('RouterPrimaryComponent'));
  exports.ROUTER_DIRECTIVES = lang_1.CONST_EXPR([router_outlet_2.RouterOutlet, router_link_2.RouterLink]);
  exports.ROUTER_PROVIDERS = lang_1.CONST_EXPR([route_registry_2.RouteRegistry, lang_1.CONST_EXPR(new angular2_2.Provider(location_strategy_2.LocationStrategy, {useClass: path_location_strategy_2.PathLocationStrategy})), location_2.Location, lang_1.CONST_EXPR(new angular2_2.Provider(router_2.Router, {
    useFactory: routerFactory,
    deps: lang_1.CONST_EXPR([route_registry_2.RouteRegistry, location_2.Location, exports.ROUTER_PRIMARY_COMPONENT, angular2_2.ApplicationRef])
  })), lang_1.CONST_EXPR(new angular2_2.Provider(exports.ROUTER_PRIMARY_COMPONENT, {
    useFactory: routerPrimaryComponentFactory,
    deps: lang_1.CONST_EXPR([angular2_2.ApplicationRef])
  }))]);
  exports.ROUTER_BINDINGS = exports.ROUTER_PROVIDERS;
  function routerFactory(registry, location, primaryComponent, appRef) {
    var rootRouter = new router_2.RootRouter(registry, location, primaryComponent);
    appRef.registerDisposeListener(function() {
      return rootRouter.dispose();
    });
    return rootRouter;
  }
  function routerPrimaryComponentFactory(app) {
    if (app.componentTypes.length == 0) {
      throw new exceptions_1.BaseException("Bootstrap at least one component before injecting Router.");
    }
    return app.componentTypes[0];
  }
  global.define = __define;
  return module.exports;
});

//# sourceMappingURLDisabled=router.dev.js.map