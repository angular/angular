"format register";
System.register("angular2/src/router/directives/router_link_transform", ["angular2/compiler", "angular2/src/compiler/expression_parser/ast", "angular2/src/facade/exceptions", "angular2/core", "angular2/src/compiler/expression_parser/parser"], true, function(require, exports, module) {
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
  var compiler_1 = require("angular2/compiler");
  var ast_1 = require("angular2/src/compiler/expression_parser/ast");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var core_1 = require("angular2/core");
  var parser_1 = require("angular2/src/compiler/expression_parser/parser");
  var FixedPart = (function() {
    function FixedPart(value) {
      this.value = value;
    }
    return FixedPart;
  }());
  var AuxiliaryStart = (function() {
    function AuxiliaryStart() {}
    return AuxiliaryStart;
  }());
  var AuxiliaryEnd = (function() {
    function AuxiliaryEnd() {}
    return AuxiliaryEnd;
  }());
  var Params = (function() {
    function Params(ast) {
      this.ast = ast;
    }
    return Params;
  }());
  var RouterLinkLexer = (function() {
    function RouterLinkLexer(parser, exp) {
      this.parser = parser;
      this.exp = exp;
      this.index = 0;
    }
    RouterLinkLexer.prototype.tokenize = function() {
      var tokens = [];
      while (this.index < this.exp.length) {
        tokens.push(this._parseToken());
      }
      return tokens;
    };
    RouterLinkLexer.prototype._parseToken = function() {
      var c = this.exp[this.index];
      if (c == '[') {
        this.index++;
        return new AuxiliaryStart();
      } else if (c == ']') {
        this.index++;
        return new AuxiliaryEnd();
      } else if (c == '(') {
        return this._parseParams();
      } else if (c == '/' && this.index !== 0) {
        this.index++;
        return this._parseFixedPart();
      } else {
        return this._parseFixedPart();
      }
    };
    RouterLinkLexer.prototype._parseParams = function() {
      var start = this.index;
      for (; this.index < this.exp.length; ++this.index) {
        var c = this.exp[this.index];
        if (c == ')') {
          var paramsContent = this.exp.substring(start + 1, this.index);
          this.index++;
          return new Params(this.parser.parseBinding("{" + paramsContent + "}", null).ast);
        }
      }
      throw new exceptions_1.BaseException("Cannot find ')'");
    };
    RouterLinkLexer.prototype._parseFixedPart = function() {
      var start = this.index;
      var sawNonSlash = false;
      for (; this.index < this.exp.length; ++this.index) {
        var c = this.exp[this.index];
        if (c == '(' || c == '[' || c == ']' || (c == '/' && sawNonSlash)) {
          break;
        }
        if (c != '.' && c != '/') {
          sawNonSlash = true;
        }
      }
      var fixed = this.exp.substring(start, this.index);
      if (start === this.index || !sawNonSlash || fixed.startsWith('//')) {
        throw new exceptions_1.BaseException("Invalid router link");
      }
      return new FixedPart(fixed);
    };
    return RouterLinkLexer;
  }());
  var RouterLinkAstGenerator = (function() {
    function RouterLinkAstGenerator(tokens) {
      this.tokens = tokens;
      this.index = 0;
    }
    RouterLinkAstGenerator.prototype.generate = function() {
      return this._genAuxiliary();
    };
    RouterLinkAstGenerator.prototype._genAuxiliary = function() {
      var arr = [];
      for (; this.index < this.tokens.length; this.index++) {
        var r = this.tokens[this.index];
        if (r instanceof FixedPart) {
          arr.push(new ast_1.LiteralPrimitive(r.value));
        } else if (r instanceof Params) {
          arr.push(r.ast);
        } else if (r instanceof AuxiliaryEnd) {
          break;
        } else if (r instanceof AuxiliaryStart) {
          this.index++;
          arr.push(this._genAuxiliary());
        }
      }
      return new ast_1.LiteralArray(arr);
    };
    return RouterLinkAstGenerator;
  }());
  var RouterLinkAstTransformer = (function(_super) {
    __extends(RouterLinkAstTransformer, _super);
    function RouterLinkAstTransformer(parser) {
      _super.call(this);
      this.parser = parser;
    }
    RouterLinkAstTransformer.prototype.visitQuote = function(ast, context) {
      if (ast.prefix == "route") {
        return parseRouterLinkExpression(this.parser, ast.uninterpretedExpression);
      } else {
        return _super.prototype.visitQuote.call(this, ast, context);
      }
    };
    return RouterLinkAstTransformer;
  }(ast_1.AstTransformer));
  function parseRouterLinkExpression(parser, exp) {
    var tokens = new RouterLinkLexer(parser, exp.trim()).tokenize();
    return new RouterLinkAstGenerator(tokens).generate();
  }
  exports.parseRouterLinkExpression = parseRouterLinkExpression;
  var RouterLinkTransform = (function() {
    function RouterLinkTransform(parser) {
      this.astTransformer = new RouterLinkAstTransformer(parser);
    }
    RouterLinkTransform.prototype.visitNgContent = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitEmbeddedTemplate = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitElement = function(ast, context) {
      var _this = this;
      var updatedChildren = ast.children.map(function(c) {
        return c.visit(_this, context);
      });
      var updatedInputs = ast.inputs.map(function(c) {
        return c.visit(_this, context);
      });
      var updatedDirectives = ast.directives.map(function(c) {
        return c.visit(_this, context);
      });
      return new compiler_1.ElementAst(ast.name, ast.attrs, updatedInputs, ast.outputs, ast.references, updatedDirectives, ast.providers, ast.hasViewContainer, updatedChildren, ast.ngContentIndex, ast.sourceSpan);
    };
    RouterLinkTransform.prototype.visitReference = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitVariable = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitEvent = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitElementProperty = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitAttr = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitBoundText = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitText = function(ast, context) {
      return ast;
    };
    RouterLinkTransform.prototype.visitDirective = function(ast, context) {
      var _this = this;
      var updatedInputs = ast.inputs.map(function(c) {
        return c.visit(_this, context);
      });
      return new compiler_1.DirectiveAst(ast.directive, updatedInputs, ast.hostProperties, ast.hostEvents, ast.sourceSpan);
    };
    RouterLinkTransform.prototype.visitDirectiveProperty = function(ast, context) {
      var transformedValue = ast.value.visit(this.astTransformer);
      return new compiler_1.BoundDirectivePropertyAst(ast.directiveName, ast.templateName, transformedValue, ast.sourceSpan);
    };
    RouterLinkTransform = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [parser_1.Parser])], RouterLinkTransform);
    return RouterLinkTransform;
  }());
  exports.RouterLinkTransform = RouterLinkTransform;
  global.define = __define;
  return module.exports;
});

System.register("angular2/router/router_link_dsl", ["angular2/compiler", "angular2/src/router/directives/router_link_transform", "angular2/src/router/directives/router_link_transform"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var compiler_1 = require("angular2/compiler");
  var router_link_transform_1 = require("angular2/src/router/directives/router_link_transform");
  var router_link_transform_2 = require("angular2/src/router/directives/router_link_transform");
  exports.RouterLinkTransform = router_link_transform_2.RouterLinkTransform;
  exports.ROUTER_LINK_DSL_PROVIDER = {
    provide: compiler_1.TEMPLATE_TRANSFORMS,
    useClass: router_link_transform_1.RouterLinkTransform,
    multi: true
  };
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

System.register("angular2/src/router/route_config/route_config_impl", [], true, function(require, exports, module) {
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
  var __make_dart_analyzer_happy = null;
  var RouteConfig = (function() {
    function RouteConfig(configs) {
      this.configs = configs;
    }
    return RouteConfig;
  }());
  exports.RouteConfig = RouteConfig;
  var AbstractRoute = (function() {
    function AbstractRoute(_a) {
      var name = _a.name,
          useAsDefault = _a.useAsDefault,
          path = _a.path,
          regex = _a.regex,
          serializer = _a.serializer,
          data = _a.data;
      this.name = name;
      this.useAsDefault = useAsDefault;
      this.path = path;
      this.regex = regex;
      this.serializer = serializer;
      this.data = data;
    }
    return AbstractRoute;
  }());
  exports.AbstractRoute = AbstractRoute;
  var Route = (function(_super) {
    __extends(Route, _super);
    function Route(_a) {
      var name = _a.name,
          useAsDefault = _a.useAsDefault,
          path = _a.path,
          regex = _a.regex,
          serializer = _a.serializer,
          data = _a.data,
          component = _a.component;
      _super.call(this, {
        name: name,
        useAsDefault: useAsDefault,
        path: path,
        regex: regex,
        serializer: serializer,
        data: data
      });
      this.aux = null;
      this.component = component;
    }
    return Route;
  }(AbstractRoute));
  exports.Route = Route;
  var AuxRoute = (function(_super) {
    __extends(AuxRoute, _super);
    function AuxRoute(_a) {
      var name = _a.name,
          useAsDefault = _a.useAsDefault,
          path = _a.path,
          regex = _a.regex,
          serializer = _a.serializer,
          data = _a.data,
          component = _a.component;
      _super.call(this, {
        name: name,
        useAsDefault: useAsDefault,
        path: path,
        regex: regex,
        serializer: serializer,
        data: data
      });
      this.component = component;
    }
    return AuxRoute;
  }(AbstractRoute));
  exports.AuxRoute = AuxRoute;
  var AsyncRoute = (function(_super) {
    __extends(AsyncRoute, _super);
    function AsyncRoute(_a) {
      var name = _a.name,
          useAsDefault = _a.useAsDefault,
          path = _a.path,
          regex = _a.regex,
          serializer = _a.serializer,
          data = _a.data,
          loader = _a.loader;
      _super.call(this, {
        name: name,
        useAsDefault: useAsDefault,
        path: path,
        regex: regex,
        serializer: serializer,
        data: data
      });
      this.aux = null;
      this.loader = loader;
    }
    return AsyncRoute;
  }(AbstractRoute));
  exports.AsyncRoute = AsyncRoute;
  var Redirect = (function(_super) {
    __extends(Redirect, _super);
    function Redirect(_a) {
      var name = _a.name,
          useAsDefault = _a.useAsDefault,
          path = _a.path,
          regex = _a.regex,
          serializer = _a.serializer,
          data = _a.data,
          redirectTo = _a.redirectTo;
      _super.call(this, {
        name: name,
        useAsDefault: useAsDefault,
        path: path,
        regex: regex,
        serializer: serializer,
        data: data
      });
      this.redirectTo = redirectTo;
    }
    return Redirect;
  }(AbstractRoute));
  exports.Redirect = Redirect;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/url_parser", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions"], true, function(require, exports, module) {
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
  var exceptions_1 = require("angular2/src/facade/exceptions");
  function convertUrlParamsToArray(urlParams) {
    var paramsArray = [];
    if (lang_1.isBlank(urlParams)) {
      return [];
    }
    collection_1.StringMapWrapper.forEach(urlParams, function(value, key) {
      paramsArray.push((value === true) ? key : key + '=' + value);
    });
    return paramsArray;
  }
  exports.convertUrlParamsToArray = convertUrlParamsToArray;
  function serializeParams(urlParams, joiner) {
    if (joiner === void 0) {
      joiner = '&';
    }
    return convertUrlParamsToArray(urlParams).join(joiner);
  }
  exports.serializeParams = serializeParams;
  var Url = (function() {
    function Url(path, child, auxiliary, params) {
      if (child === void 0) {
        child = null;
      }
      if (auxiliary === void 0) {
        auxiliary = [];
      }
      if (params === void 0) {
        params = {};
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
      var paramString = serializeParams(this.params, ';');
      if (paramString.length > 0) {
        return ';' + paramString;
      }
      return '';
    };
    Url.prototype._childString = function() {
      return lang_1.isPresent(this.child) ? ('/' + this.child.toString()) : '';
    };
    return Url;
  }());
  exports.Url = Url;
  var RootUrl = (function(_super) {
    __extends(RootUrl, _super);
    function RootUrl(path, child, auxiliary, params) {
      if (child === void 0) {
        child = null;
      }
      if (auxiliary === void 0) {
        auxiliary = [];
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
      return '?' + serializeParams(this.params);
    };
    return RootUrl;
  }(Url));
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
  var QUERY_PARAM_VALUE_RE = lang_1.RegExpWrapper.create('^[^\\(\\)\\?;&#]+');
  function matchUrlQueryParamValue(str) {
    var match = lang_1.RegExpWrapper.firstMatch(QUERY_PARAM_VALUE_RE, str);
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
      this.parseQueryParam(params);
      while (this._remaining.length > 0 && this.peekStartsWith('&')) {
        this.capture('&');
        this.parseQueryParam(params);
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
    UrlParser.prototype.parseQueryParam = function(params) {
      var key = matchUrlSegment(this._remaining);
      if (lang_1.isBlank(key)) {
        return ;
      }
      this.capture(key);
      var value = true;
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
  }());
  exports.UrlParser = UrlParser;
  exports.parser = new UrlParser();
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/instruction", ["angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/async"], true, function(require, exports, module) {
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
  var async_1 = require("angular2/src/facade/async");
  var RouteParams = (function() {
    function RouteParams(params) {
      this.params = params;
    }
    RouteParams.prototype.get = function(param) {
      return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.params, param));
    };
    return RouteParams;
  }());
  exports.RouteParams = RouteParams;
  var RouteData = (function() {
    function RouteData(data) {
      if (data === void 0) {
        data = {};
      }
      this.data = data;
    }
    RouteData.prototype.get = function(key) {
      return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.data, key));
    };
    return RouteData;
  }());
  exports.RouteData = RouteData;
  exports.BLANK_ROUTE_DATA = new RouteData();
  var Instruction = (function() {
    function Instruction(component, child, auxInstruction) {
      this.component = component;
      this.child = child;
      this.auxInstruction = auxInstruction;
    }
    Object.defineProperty(Instruction.prototype, "urlPath", {
      get: function() {
        return lang_1.isPresent(this.component) ? this.component.urlPath : '';
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Instruction.prototype, "urlParams", {
      get: function() {
        return lang_1.isPresent(this.component) ? this.component.urlParams : [];
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Instruction.prototype, "specificity", {
      get: function() {
        var total = '';
        if (lang_1.isPresent(this.component)) {
          total += this.component.specificity;
        }
        if (lang_1.isPresent(this.child)) {
          total += this.child.specificity;
        }
        return total;
      },
      enumerable: true,
      configurable: true
    });
    Instruction.prototype.toRootUrl = function() {
      return this.toUrlPath() + this.toUrlQuery();
    };
    Instruction.prototype._toNonRootUrl = function() {
      return this._stringifyPathMatrixAuxPrefixed() + (lang_1.isPresent(this.child) ? this.child._toNonRootUrl() : '');
    };
    Instruction.prototype.toUrlQuery = function() {
      return this.urlParams.length > 0 ? ('?' + this.urlParams.join('&')) : '';
    };
    Instruction.prototype.replaceChild = function(child) {
      return new ResolvedInstruction(this.component, child, this.auxInstruction);
    };
    Instruction.prototype.toUrlPath = function() {
      return this.urlPath + this._stringifyAux() + (lang_1.isPresent(this.child) ? this.child._toNonRootUrl() : '');
    };
    Instruction.prototype.toLinkUrl = function() {
      return this.urlPath + this._stringifyAux() + (lang_1.isPresent(this.child) ? this.child._toLinkUrl() : '') + this.toUrlQuery();
    };
    Instruction.prototype._toLinkUrl = function() {
      return this._stringifyPathMatrixAuxPrefixed() + (lang_1.isPresent(this.child) ? this.child._toLinkUrl() : '');
    };
    Instruction.prototype._stringifyPathMatrixAuxPrefixed = function() {
      var primary = this._stringifyPathMatrixAux();
      if (primary.length > 0) {
        primary = '/' + primary;
      }
      return primary;
    };
    Instruction.prototype._stringifyMatrixParams = function() {
      return this.urlParams.length > 0 ? (';' + this.urlParams.join(';')) : '';
    };
    Instruction.prototype._stringifyPathMatrixAux = function() {
      if (lang_1.isBlank(this.component)) {
        return '';
      }
      return this.urlPath + this._stringifyMatrixParams() + this._stringifyAux();
    };
    Instruction.prototype._stringifyAux = function() {
      var routes = [];
      collection_1.StringMapWrapper.forEach(this.auxInstruction, function(auxInstruction, _) {
        routes.push(auxInstruction._stringifyPathMatrixAux());
      });
      if (routes.length > 0) {
        return '(' + routes.join('//') + ')';
      }
      return '';
    };
    return Instruction;
  }());
  exports.Instruction = Instruction;
  var ResolvedInstruction = (function(_super) {
    __extends(ResolvedInstruction, _super);
    function ResolvedInstruction(component, child, auxInstruction) {
      _super.call(this, component, child, auxInstruction);
    }
    ResolvedInstruction.prototype.resolveComponent = function() {
      return async_1.PromiseWrapper.resolve(this.component);
    };
    return ResolvedInstruction;
  }(Instruction));
  exports.ResolvedInstruction = ResolvedInstruction;
  var DefaultInstruction = (function(_super) {
    __extends(DefaultInstruction, _super);
    function DefaultInstruction(component, child) {
      _super.call(this, component, child, {});
    }
    DefaultInstruction.prototype.toLinkUrl = function() {
      return '';
    };
    DefaultInstruction.prototype._toLinkUrl = function() {
      return '';
    };
    return DefaultInstruction;
  }(ResolvedInstruction));
  exports.DefaultInstruction = DefaultInstruction;
  var UnresolvedInstruction = (function(_super) {
    __extends(UnresolvedInstruction, _super);
    function UnresolvedInstruction(_resolver, _urlPath, _urlParams) {
      if (_urlPath === void 0) {
        _urlPath = '';
      }
      if (_urlParams === void 0) {
        _urlParams = [];
      }
      _super.call(this, null, null, {});
      this._resolver = _resolver;
      this._urlPath = _urlPath;
      this._urlParams = _urlParams;
    }
    Object.defineProperty(UnresolvedInstruction.prototype, "urlPath", {
      get: function() {
        if (lang_1.isPresent(this.component)) {
          return this.component.urlPath;
        }
        if (lang_1.isPresent(this._urlPath)) {
          return this._urlPath;
        }
        return '';
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(UnresolvedInstruction.prototype, "urlParams", {
      get: function() {
        if (lang_1.isPresent(this.component)) {
          return this.component.urlParams;
        }
        if (lang_1.isPresent(this._urlParams)) {
          return this._urlParams;
        }
        return [];
      },
      enumerable: true,
      configurable: true
    });
    UnresolvedInstruction.prototype.resolveComponent = function() {
      var _this = this;
      if (lang_1.isPresent(this.component)) {
        return async_1.PromiseWrapper.resolve(this.component);
      }
      return this._resolver().then(function(instruction) {
        _this.child = lang_1.isPresent(instruction) ? instruction.child : null;
        return _this.component = lang_1.isPresent(instruction) ? instruction.component : null;
      });
    };
    return UnresolvedInstruction;
  }(Instruction));
  exports.UnresolvedInstruction = UnresolvedInstruction;
  var RedirectInstruction = (function(_super) {
    __extends(RedirectInstruction, _super);
    function RedirectInstruction(component, child, auxInstruction, _specificity) {
      _super.call(this, component, child, auxInstruction);
      this._specificity = _specificity;
    }
    Object.defineProperty(RedirectInstruction.prototype, "specificity", {
      get: function() {
        return this._specificity;
      },
      enumerable: true,
      configurable: true
    });
    return RedirectInstruction;
  }(ResolvedInstruction));
  exports.RedirectInstruction = RedirectInstruction;
  var ComponentInstruction = (function() {
    function ComponentInstruction(urlPath, urlParams, data, componentType, terminal, specificity, params, routeName) {
      if (params === void 0) {
        params = null;
      }
      this.urlPath = urlPath;
      this.urlParams = urlParams;
      this.componentType = componentType;
      this.terminal = terminal;
      this.specificity = specificity;
      this.params = params;
      this.routeName = routeName;
      this.reuse = false;
      this.routeData = lang_1.isPresent(data) ? data : exports.BLANK_ROUTE_DATA;
    }
    return ComponentInstruction;
  }());
  exports.ComponentInstruction = ComponentInstruction;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/rules/route_handlers/async_route_handler", ["angular2/src/facade/lang", "angular2/src/router/instruction"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var instruction_1 = require("angular2/src/router/instruction");
  var AsyncRouteHandler = (function() {
    function AsyncRouteHandler(_loader, data) {
      if (data === void 0) {
        data = null;
      }
      this._loader = _loader;
      this._resolvedComponent = null;
      this.data = lang_1.isPresent(data) ? new instruction_1.RouteData(data) : instruction_1.BLANK_ROUTE_DATA;
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
  }());
  exports.AsyncRouteHandler = AsyncRouteHandler;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/rules/route_handlers/sync_route_handler", ["angular2/src/facade/async", "angular2/src/facade/lang", "angular2/src/router/instruction"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var async_1 = require("angular2/src/facade/async");
  var lang_1 = require("angular2/src/facade/lang");
  var instruction_1 = require("angular2/src/router/instruction");
  var SyncRouteHandler = (function() {
    function SyncRouteHandler(componentType, data) {
      this.componentType = componentType;
      this._resolvedComponent = null;
      this._resolvedComponent = async_1.PromiseWrapper.resolve(componentType);
      this.data = lang_1.isPresent(data) ? new instruction_1.RouteData(data) : instruction_1.BLANK_ROUTE_DATA;
    }
    SyncRouteHandler.prototype.resolveComponentType = function() {
      return this._resolvedComponent;
    };
    return SyncRouteHandler;
  }());
  exports.SyncRouteHandler = SyncRouteHandler;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/utils", ["angular2/src/facade/lang", "angular2/src/facade/collection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var collection_1 = require("angular2/src/facade/collection");
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
      var unused = {};
      var keys = collection_1.StringMapWrapper.keys(this.keys);
      keys.forEach(function(key) {
        return unused[key] = collection_1.StringMapWrapper.get(_this.map, key);
      });
      return unused;
    };
    return TouchMap;
  }());
  exports.TouchMap = TouchMap;
  function normalizeString(obj) {
    if (lang_1.isBlank(obj)) {
      return null;
    } else {
      return obj.toString();
    }
  }
  exports.normalizeString = normalizeString;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/rules/route_paths/route_path", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var MatchedUrl = (function() {
    function MatchedUrl(urlPath, urlParams, allParams, auxiliary, rest) {
      this.urlPath = urlPath;
      this.urlParams = urlParams;
      this.allParams = allParams;
      this.auxiliary = auxiliary;
      this.rest = rest;
    }
    return MatchedUrl;
  }());
  exports.MatchedUrl = MatchedUrl;
  var GeneratedUrl = (function() {
    function GeneratedUrl(urlPath, urlParams) {
      this.urlPath = urlPath;
      this.urlParams = urlParams;
    }
    return GeneratedUrl;
  }());
  exports.GeneratedUrl = GeneratedUrl;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/rules/route_paths/regex_route_path", ["angular2/src/facade/lang", "angular2/src/router/rules/route_paths/route_path"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var route_path_1 = require("angular2/src/router/rules/route_paths/route_path");
  var RegexRoutePath = (function() {
    function RegexRoutePath(_reString, _serializer) {
      this._reString = _reString;
      this._serializer = _serializer;
      this.terminal = true;
      this.specificity = '2';
      this.hash = this._reString;
      this._regex = lang_1.RegExpWrapper.create(this._reString);
    }
    RegexRoutePath.prototype.matchUrl = function(url) {
      var urlPath = url.toString();
      var params = {};
      var matcher = lang_1.RegExpWrapper.matcher(this._regex, urlPath);
      var match = lang_1.RegExpMatcherWrapper.next(matcher);
      if (lang_1.isBlank(match)) {
        return null;
      }
      for (var i = 0; i < match.length; i += 1) {
        params[i.toString()] = match[i];
      }
      return new route_path_1.MatchedUrl(urlPath, [], params, [], null);
    };
    RegexRoutePath.prototype.generateUrl = function(params) {
      return this._serializer(params);
    };
    RegexRoutePath.prototype.toString = function() {
      return this._reString;
    };
    return RegexRoutePath;
  }());
  exports.RegexRoutePath = RegexRoutePath;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_config/route_config_decorator", ["angular2/src/router/route_config/route_config_impl", "angular2/src/core/util/decorators", "angular2/src/router/route_config/route_config_impl"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var route_config_impl_1 = require("angular2/src/router/route_config/route_config_impl");
  var decorators_1 = require("angular2/src/core/util/decorators");
  var route_config_impl_2 = require("angular2/src/router/route_config/route_config_impl");
  exports.Route = route_config_impl_2.Route;
  exports.Redirect = route_config_impl_2.Redirect;
  exports.AuxRoute = route_config_impl_2.AuxRoute;
  exports.AsyncRoute = route_config_impl_2.AsyncRoute;
  exports.RouteConfig = decorators_1.makeDecorator(route_config_impl_1.RouteConfig);
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/lifecycle/lifecycle_annotations_impl", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var RouteLifecycleHook = (function() {
    function RouteLifecycleHook(name) {
      this.name = name;
    }
    return RouteLifecycleHook;
  }());
  exports.RouteLifecycleHook = RouteLifecycleHook;
  var CanActivate = (function() {
    function CanActivate(fn) {
      this.fn = fn;
    }
    return CanActivate;
  }());
  exports.CanActivate = CanActivate;
  exports.routerCanReuse = new RouteLifecycleHook("routerCanReuse");
  exports.routerCanDeactivate = new RouteLifecycleHook("routerCanDeactivate");
  exports.routerOnActivate = new RouteLifecycleHook("routerOnActivate");
  exports.routerOnReuse = new RouteLifecycleHook("routerOnReuse");
  exports.routerOnDeactivate = new RouteLifecycleHook("routerOnDeactivate");
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/lifecycle/lifecycle_annotations", ["angular2/src/core/util/decorators", "angular2/src/router/lifecycle/lifecycle_annotations_impl", "angular2/src/router/lifecycle/lifecycle_annotations_impl"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var decorators_1 = require("angular2/src/core/util/decorators");
  var lifecycle_annotations_impl_1 = require("angular2/src/router/lifecycle/lifecycle_annotations_impl");
  var lifecycle_annotations_impl_2 = require("angular2/src/router/lifecycle/lifecycle_annotations_impl");
  exports.routerCanReuse = lifecycle_annotations_impl_2.routerCanReuse;
  exports.routerCanDeactivate = lifecycle_annotations_impl_2.routerCanDeactivate;
  exports.routerOnActivate = lifecycle_annotations_impl_2.routerOnActivate;
  exports.routerOnReuse = lifecycle_annotations_impl_2.routerOnReuse;
  exports.routerOnDeactivate = lifecycle_annotations_impl_2.routerOnDeactivate;
  exports.CanActivate = decorators_1.makeDecorator(lifecycle_annotations_impl_1.CanActivate);
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/directives/router_link", ["angular2/core", "angular2/platform/common", "angular2/src/facade/lang", "angular2/src/router/router"], true, function(require, exports, module) {
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
  var core_1 = require("angular2/core");
  var common_1 = require("angular2/platform/common");
  var lang_1 = require("angular2/src/facade/lang");
  var router_1 = require("angular2/src/router/router");
  var RouterLink = (function() {
    function RouterLink(_router, _location) {
      var _this = this;
      this._router = _router;
      this._location = _location;
      this._router.subscribe(function(_) {
        return _this._updateLink();
      });
    }
    RouterLink.prototype._updateLink = function() {
      this._navigationInstruction = this._router.generate(this._routeParams);
      var navigationHref = this._navigationInstruction.toLinkUrl();
      this.visibleHref = this._location.prepareExternalUrl(navigationHref);
    };
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
        this._updateLink();
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
    RouterLink = __decorate([core_1.Directive({
      selector: '[routerLink]',
      inputs: ['routeParams: routerLink', 'target: target'],
      host: {
        '(click)': 'onClick()',
        '[attr.href]': 'visibleHref',
        '[class.router-link-active]': 'isRouteActive'
      }
    }), __metadata('design:paramtypes', [router_1.Router, common_1.Location])], RouterLink);
    return RouterLink;
  }());
  exports.RouterLink = RouterLink;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/router_providers_common", ["angular2/platform/common", "angular2/src/router/router", "angular2/src/router/route_registry", "angular2/core", "angular2/src/facade/exceptions"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var common_1 = require("angular2/platform/common");
  var router_1 = require("angular2/src/router/router");
  var route_registry_1 = require("angular2/src/router/route_registry");
  var core_1 = require("angular2/core");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  exports.ROUTER_PROVIDERS_COMMON = [route_registry_1.RouteRegistry, {
    provide: common_1.LocationStrategy,
    useClass: common_1.PathLocationStrategy
  }, common_1.Location, {
    provide: router_1.Router,
    useFactory: routerFactory,
    deps: [route_registry_1.RouteRegistry, common_1.Location, route_registry_1.ROUTER_PRIMARY_COMPONENT, core_1.ApplicationRef]
  }, {
    provide: route_registry_1.ROUTER_PRIMARY_COMPONENT,
    useFactory: routerPrimaryComponentFactory,
    deps: ([core_1.ApplicationRef])
  }];
  function routerFactory(registry, location, primaryComponent, appRef) {
    var rootRouter = new router_1.RootRouter(registry, location, primaryComponent);
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

System.register("angular2/src/router/rules/rules", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/promise", "angular2/src/facade/collection", "angular2/src/router/url_parser", "angular2/src/router/instruction"], true, function(require, exports, module) {
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
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var promise_1 = require("angular2/src/facade/promise");
  var collection_1 = require("angular2/src/facade/collection");
  var url_parser_1 = require("angular2/src/router/url_parser");
  var instruction_1 = require("angular2/src/router/instruction");
  var RouteMatch = (function() {
    function RouteMatch() {}
    return RouteMatch;
  }());
  exports.RouteMatch = RouteMatch;
  var PathMatch = (function(_super) {
    __extends(PathMatch, _super);
    function PathMatch(instruction, remaining, remainingAux) {
      _super.call(this);
      this.instruction = instruction;
      this.remaining = remaining;
      this.remainingAux = remainingAux;
    }
    return PathMatch;
  }(RouteMatch));
  exports.PathMatch = PathMatch;
  var RedirectMatch = (function(_super) {
    __extends(RedirectMatch, _super);
    function RedirectMatch(redirectTo, specificity) {
      _super.call(this);
      this.redirectTo = redirectTo;
      this.specificity = specificity;
    }
    return RedirectMatch;
  }(RouteMatch));
  exports.RedirectMatch = RedirectMatch;
  var RedirectRule = (function() {
    function RedirectRule(_pathRecognizer, redirectTo) {
      this._pathRecognizer = _pathRecognizer;
      this.redirectTo = redirectTo;
      this.hash = this._pathRecognizer.hash;
    }
    Object.defineProperty(RedirectRule.prototype, "path", {
      get: function() {
        return this._pathRecognizer.toString();
      },
      set: function(val) {
        throw new exceptions_1.BaseException('you cannot set the path of a RedirectRule directly');
      },
      enumerable: true,
      configurable: true
    });
    RedirectRule.prototype.recognize = function(beginningSegment) {
      var match = null;
      if (lang_1.isPresent(this._pathRecognizer.matchUrl(beginningSegment))) {
        match = new RedirectMatch(this.redirectTo, this._pathRecognizer.specificity);
      }
      return promise_1.PromiseWrapper.resolve(match);
    };
    RedirectRule.prototype.generate = function(params) {
      throw new exceptions_1.BaseException("Tried to generate a redirect.");
    };
    return RedirectRule;
  }());
  exports.RedirectRule = RedirectRule;
  var RouteRule = (function() {
    function RouteRule(_routePath, handler, _routeName) {
      this._routePath = _routePath;
      this.handler = handler;
      this._routeName = _routeName;
      this._cache = new collection_1.Map();
      this.specificity = this._routePath.specificity;
      this.hash = this._routePath.hash;
      this.terminal = this._routePath.terminal;
    }
    Object.defineProperty(RouteRule.prototype, "path", {
      get: function() {
        return this._routePath.toString();
      },
      set: function(val) {
        throw new exceptions_1.BaseException('you cannot set the path of a RouteRule directly');
      },
      enumerable: true,
      configurable: true
    });
    RouteRule.prototype.recognize = function(beginningSegment) {
      var _this = this;
      var res = this._routePath.matchUrl(beginningSegment);
      if (lang_1.isBlank(res)) {
        return null;
      }
      return this.handler.resolveComponentType().then(function(_) {
        var componentInstruction = _this._getInstruction(res.urlPath, res.urlParams, res.allParams);
        return new PathMatch(componentInstruction, res.rest, res.auxiliary);
      });
    };
    RouteRule.prototype.generate = function(params) {
      var generated = this._routePath.generateUrl(params);
      var urlPath = generated.urlPath;
      var urlParams = generated.urlParams;
      return this._getInstruction(urlPath, url_parser_1.convertUrlParamsToArray(urlParams), params);
    };
    RouteRule.prototype.generateComponentPathValues = function(params) {
      return this._routePath.generateUrl(params);
    };
    RouteRule.prototype._getInstruction = function(urlPath, urlParams, params) {
      if (lang_1.isBlank(this.handler.componentType)) {
        throw new exceptions_1.BaseException("Tried to get instruction before the type was loaded.");
      }
      var hashKey = urlPath + '?' + urlParams.join('&');
      if (this._cache.has(hashKey)) {
        return this._cache.get(hashKey);
      }
      var instruction = new instruction_1.ComponentInstruction(urlPath, urlParams, this.handler.data, this.handler.componentType, this.terminal, this.specificity, params, this._routeName);
      this._cache.set(hashKey, instruction);
      return instruction;
    };
    return RouteRule;
  }());
  exports.RouteRule = RouteRule;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/rules/route_paths/param_route_path", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/collection", "angular2/src/router/utils", "angular2/src/router/url_parser", "angular2/src/router/rules/route_paths/route_path"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var utils_1 = require("angular2/src/router/utils");
  var url_parser_1 = require("angular2/src/router/url_parser");
  var route_path_1 = require("angular2/src/router/rules/route_paths/route_path");
  var ContinuationPathSegment = (function() {
    function ContinuationPathSegment() {
      this.name = '';
      this.specificity = '';
      this.hash = '...';
    }
    ContinuationPathSegment.prototype.generate = function(params) {
      return '';
    };
    ContinuationPathSegment.prototype.match = function(path) {
      return true;
    };
    return ContinuationPathSegment;
  }());
  var StaticPathSegment = (function() {
    function StaticPathSegment(path) {
      this.path = path;
      this.name = '';
      this.specificity = '2';
      this.hash = path;
    }
    StaticPathSegment.prototype.match = function(path) {
      return path == this.path;
    };
    StaticPathSegment.prototype.generate = function(params) {
      return this.path;
    };
    return StaticPathSegment;
  }());
  var DynamicPathSegment = (function() {
    function DynamicPathSegment(name) {
      this.name = name;
      this.specificity = '1';
      this.hash = ':';
    }
    DynamicPathSegment.prototype.match = function(path) {
      return path.length > 0;
    };
    DynamicPathSegment.prototype.generate = function(params) {
      if (!collection_1.StringMapWrapper.contains(params.map, this.name)) {
        throw new exceptions_1.BaseException("Route generator for '" + this.name + "' was not included in parameters passed.");
      }
      return encodeDynamicSegment(utils_1.normalizeString(params.get(this.name)));
    };
    DynamicPathSegment.paramMatcher = /^:([^\/]+)$/g;
    return DynamicPathSegment;
  }());
  var StarPathSegment = (function() {
    function StarPathSegment(name) {
      this.name = name;
      this.specificity = '0';
      this.hash = '*';
    }
    StarPathSegment.prototype.match = function(path) {
      return true;
    };
    StarPathSegment.prototype.generate = function(params) {
      return utils_1.normalizeString(params.get(this.name));
    };
    StarPathSegment.wildcardMatcher = /^\*([^\/]+)$/g;
    return StarPathSegment;
  }());
  var ParamRoutePath = (function() {
    function ParamRoutePath(routePath) {
      this.routePath = routePath;
      this.terminal = true;
      this._assertValidPath(routePath);
      this._parsePathString(routePath);
      this.specificity = this._calculateSpecificity();
      this.hash = this._calculateHash();
      var lastSegment = this._segments[this._segments.length - 1];
      this.terminal = !(lastSegment instanceof ContinuationPathSegment);
    }
    ParamRoutePath.prototype.matchUrl = function(url) {
      var nextUrlSegment = url;
      var currentUrlSegment;
      var positionalParams = {};
      var captured = [];
      for (var i = 0; i < this._segments.length; i += 1) {
        var pathSegment = this._segments[i];
        currentUrlSegment = nextUrlSegment;
        if (pathSegment instanceof ContinuationPathSegment) {
          break;
        }
        if (lang_1.isPresent(currentUrlSegment)) {
          if (pathSegment instanceof StarPathSegment) {
            positionalParams[pathSegment.name] = currentUrlSegment.toString();
            captured.push(currentUrlSegment.toString());
            nextUrlSegment = null;
            break;
          }
          captured.push(currentUrlSegment.path);
          if (pathSegment instanceof DynamicPathSegment) {
            positionalParams[pathSegment.name] = decodeDynamicSegment(currentUrlSegment.path);
          } else if (!pathSegment.match(currentUrlSegment.path)) {
            return null;
          }
          nextUrlSegment = currentUrlSegment.child;
        } else if (!pathSegment.match('')) {
          return null;
        }
      }
      if (this.terminal && lang_1.isPresent(nextUrlSegment)) {
        return null;
      }
      var urlPath = captured.join('/');
      var auxiliary = [];
      var urlParams = [];
      var allParams = positionalParams;
      if (lang_1.isPresent(currentUrlSegment)) {
        var paramsSegment = url instanceof url_parser_1.RootUrl ? url : currentUrlSegment;
        if (lang_1.isPresent(paramsSegment.params)) {
          allParams = collection_1.StringMapWrapper.merge(paramsSegment.params, positionalParams);
          urlParams = url_parser_1.convertUrlParamsToArray(paramsSegment.params);
        } else {
          allParams = positionalParams;
        }
        auxiliary = currentUrlSegment.auxiliary;
      }
      return new route_path_1.MatchedUrl(urlPath, urlParams, allParams, auxiliary, nextUrlSegment);
    };
    ParamRoutePath.prototype.generateUrl = function(params) {
      var paramTokens = new utils_1.TouchMap(params);
      var path = [];
      for (var i = 0; i < this._segments.length; i++) {
        var segment = this._segments[i];
        if (!(segment instanceof ContinuationPathSegment)) {
          path.push(segment.generate(paramTokens));
        }
      }
      var urlPath = path.join('/');
      var nonPositionalParams = paramTokens.getUnused();
      var urlParams = nonPositionalParams;
      return new route_path_1.GeneratedUrl(urlPath, urlParams);
    };
    ParamRoutePath.prototype.toString = function() {
      return this.routePath;
    };
    ParamRoutePath.prototype._parsePathString = function(routePath) {
      if (routePath.startsWith("/")) {
        routePath = routePath.substring(1);
      }
      var segmentStrings = routePath.split('/');
      this._segments = [];
      var limit = segmentStrings.length - 1;
      for (var i = 0; i <= limit; i++) {
        var segment = segmentStrings[i],
            match;
        if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(DynamicPathSegment.paramMatcher, segment))) {
          this._segments.push(new DynamicPathSegment(match[1]));
        } else if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(StarPathSegment.wildcardMatcher, segment))) {
          this._segments.push(new StarPathSegment(match[1]));
        } else if (segment == '...') {
          if (i < limit) {
            throw new exceptions_1.BaseException("Unexpected \"...\" before the end of the path for \"" + routePath + "\".");
          }
          this._segments.push(new ContinuationPathSegment());
        } else {
          this._segments.push(new StaticPathSegment(segment));
        }
      }
    };
    ParamRoutePath.prototype._calculateSpecificity = function() {
      var i,
          length = this._segments.length,
          specificity;
      if (length == 0) {
        specificity += '2';
      } else {
        specificity = '';
        for (i = 0; i < length; i++) {
          specificity += this._segments[i].specificity;
        }
      }
      return specificity;
    };
    ParamRoutePath.prototype._calculateHash = function() {
      var i,
          length = this._segments.length;
      var hashParts = [];
      for (i = 0; i < length; i++) {
        hashParts.push(this._segments[i].hash);
      }
      return hashParts.join('/');
    };
    ParamRoutePath.prototype._assertValidPath = function(path) {
      if (lang_1.StringWrapper.contains(path, '#')) {
        throw new exceptions_1.BaseException("Path \"" + path + "\" should not include \"#\". Use \"HashLocationStrategy\" instead.");
      }
      var illegalCharacter = lang_1.RegExpWrapper.firstMatch(ParamRoutePath.RESERVED_CHARS, path);
      if (lang_1.isPresent(illegalCharacter)) {
        throw new exceptions_1.BaseException("Path \"" + path + "\" contains \"" + illegalCharacter[0] + "\" which is not allowed in a route config.");
      }
    };
    ParamRoutePath.RESERVED_CHARS = lang_1.RegExpWrapper.create('//|\\(|\\)|;|\\?|=');
    return ParamRoutePath;
  }());
  exports.ParamRoutePath = ParamRoutePath;
  var REGEXP_PERCENT = /%/g;
  var REGEXP_SLASH = /\//g;
  var REGEXP_OPEN_PARENT = /\(/g;
  var REGEXP_CLOSE_PARENT = /\)/g;
  var REGEXP_SEMICOLON = /;/g;
  function encodeDynamicSegment(value) {
    if (lang_1.isBlank(value)) {
      return null;
    }
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_PERCENT, '%25');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_SLASH, '%2F');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_OPEN_PARENT, '%28');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_CLOSE_PARENT, '%29');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_SEMICOLON, '%3B');
    return value;
  }
  var REGEXP_ENC_SEMICOLON = /%3B/ig;
  var REGEXP_ENC_CLOSE_PARENT = /%29/ig;
  var REGEXP_ENC_OPEN_PARENT = /%28/ig;
  var REGEXP_ENC_SLASH = /%2F/ig;
  var REGEXP_ENC_PERCENT = /%25/ig;
  function decodeDynamicSegment(value) {
    if (lang_1.isBlank(value)) {
      return null;
    }
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_SEMICOLON, ';');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_CLOSE_PARENT, ')');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_OPEN_PARENT, '(');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_SLASH, '/');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_PERCENT, '%');
    return value;
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_config/route_config_normalizer", ["angular2/src/router/route_config/route_config_decorator", "angular2/src/facade/lang", "angular2/src/facade/exceptions"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var route_config_decorator_1 = require("angular2/src/router/route_config/route_config_decorator");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  function normalizeRouteConfig(config, registry) {
    if (config instanceof route_config_decorator_1.AsyncRoute) {
      var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
      return new route_config_decorator_1.AsyncRoute({
        path: config.path,
        loader: wrappedLoader,
        name: config.name,
        data: config.data,
        useAsDefault: config.useAsDefault
      });
    }
    if (config instanceof route_config_decorator_1.Route || config instanceof route_config_decorator_1.Redirect || config instanceof route_config_decorator_1.AuxRoute) {
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
      var wrappedLoader = wrapLoaderToReconfigureRegistry(config.loader, registry);
      return new route_config_decorator_1.AsyncRoute({
        path: config.path,
        loader: wrappedLoader,
        name: config.name,
        data: config.data,
        useAsDefault: config.useAsDefault
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
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
          });
        } else if (componentDefinitionObject.type == 'loader') {
          return new route_config_decorator_1.AsyncRoute({
            path: config.path,
            loader: componentDefinitionObject.loader,
            name: config.name,
            data: config.data,
            useAsDefault: config.useAsDefault
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
  function wrapLoaderToReconfigureRegistry(loader, registry) {
    return function() {
      return loader().then(function(componentType) {
        registry.configFromComponent(componentType);
        return componentType;
      });
    };
  }
  function assertComponentExists(component, path) {
    if (!lang_1.isType(component)) {
      throw new exceptions_1.BaseException("Component for route \"" + path + "\" is not defined, or is not a class.");
    }
  }
  exports.assertComponentExists = assertComponentExists;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/lifecycle/route_lifecycle_reflector", ["angular2/src/facade/lang", "angular2/src/router/lifecycle/lifecycle_annotations_impl", "angular2/src/core/reflection/reflection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var lifecycle_annotations_impl_1 = require("angular2/src/router/lifecycle/lifecycle_annotations_impl");
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

System.register("angular2/src/router/directives/router_outlet", ["angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/core", "angular2/src/router/router", "angular2/src/router/instruction", "angular2/src/router/lifecycle/lifecycle_annotations", "angular2/src/router/lifecycle/route_lifecycle_reflector"], true, function(require, exports, module) {
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
  var async_1 = require("angular2/src/facade/async");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var core_1 = require("angular2/core");
  var routerMod = require("angular2/src/router/router");
  var instruction_1 = require("angular2/src/router/instruction");
  var hookMod = require("angular2/src/router/lifecycle/lifecycle_annotations");
  var route_lifecycle_reflector_1 = require("angular2/src/router/lifecycle/route_lifecycle_reflector");
  var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
  var RouterOutlet = (function() {
    function RouterOutlet(_viewContainerRef, _loader, _parentRouter, nameAttr) {
      this._viewContainerRef = _viewContainerRef;
      this._loader = _loader;
      this._parentRouter = _parentRouter;
      this.name = null;
      this._componentRef = null;
      this._currentInstruction = null;
      this.activateEvents = new async_1.EventEmitter();
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
      var providers = core_1.ReflectiveInjector.resolve([core_1.provide(instruction_1.RouteData, {useValue: nextInstruction.routeData}), core_1.provide(instruction_1.RouteParams, {useValue: new instruction_1.RouteParams(nextInstruction.params)}), core_1.provide(routerMod.Router, {useValue: childRouter})]);
      this._componentRef = this._loader.loadNextToLocation(componentType, this._viewContainerRef, providers);
      return this._componentRef.then(function(componentRef) {
        _this.activateEvents.emit(componentRef.instance);
        if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnActivate, componentType)) {
          return _this._componentRef.then(function(ref) {
            return ref.instance.routerOnActivate(nextInstruction, previousInstruction);
          });
        } else {
          return componentRef;
        }
      });
    };
    RouterOutlet.prototype.reuse = function(nextInstruction) {
      var previousInstruction = this._currentInstruction;
      this._currentInstruction = nextInstruction;
      if (lang_1.isBlank(this._componentRef)) {
        return this.activate(nextInstruction);
      } else {
        return async_1.PromiseWrapper.resolve(route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnReuse, this._currentInstruction.componentType) ? this._componentRef.then(function(ref) {
          return ref.instance.routerOnReuse(nextInstruction, previousInstruction);
        }) : true);
      }
    };
    RouterOutlet.prototype.deactivate = function(nextInstruction) {
      var _this = this;
      var next = _resolveToTrue;
      if (lang_1.isPresent(this._componentRef) && lang_1.isPresent(this._currentInstruction) && route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerOnDeactivate, this._currentInstruction.componentType)) {
        next = this._componentRef.then(function(ref) {
          return ref.instance.routerOnDeactivate(nextInstruction, _this._currentInstruction);
        });
      }
      return next.then(function(_) {
        if (lang_1.isPresent(_this._componentRef)) {
          var onDispose = _this._componentRef.then(function(ref) {
            return ref.destroy();
          });
          _this._componentRef = null;
          return onDispose;
        }
      });
    };
    RouterOutlet.prototype.routerCanDeactivate = function(nextInstruction) {
      var _this = this;
      if (lang_1.isBlank(this._currentInstruction)) {
        return _resolveToTrue;
      }
      if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerCanDeactivate, this._currentInstruction.componentType)) {
        return this._componentRef.then(function(ref) {
          return ref.instance.routerCanDeactivate(nextInstruction, _this._currentInstruction);
        });
      } else {
        return _resolveToTrue;
      }
    };
    RouterOutlet.prototype.routerCanReuse = function(nextInstruction) {
      var _this = this;
      var result;
      if (lang_1.isBlank(this._currentInstruction) || this._currentInstruction.componentType != nextInstruction.componentType) {
        result = false;
      } else if (route_lifecycle_reflector_1.hasLifecycleHook(hookMod.routerCanReuse, this._currentInstruction.componentType)) {
        result = this._componentRef.then(function(ref) {
          return ref.instance.routerCanReuse(nextInstruction, _this._currentInstruction);
        });
      } else {
        result = nextInstruction == this._currentInstruction || (lang_1.isPresent(nextInstruction.params) && lang_1.isPresent(this._currentInstruction.params) && collection_1.StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
      }
      return async_1.PromiseWrapper.resolve(result);
    };
    RouterOutlet.prototype.ngOnDestroy = function() {
      this._parentRouter.unregisterPrimaryOutlet(this);
    };
    __decorate([core_1.Output('activate'), __metadata('design:type', Object)], RouterOutlet.prototype, "activateEvents", void 0);
    RouterOutlet = __decorate([core_1.Directive({selector: 'router-outlet'}), __param(3, core_1.Attribute('name')), __metadata('design:paramtypes', [core_1.ViewContainerRef, core_1.DynamicComponentLoader, routerMod.Router, String])], RouterOutlet);
    return RouterOutlet;
  }());
  exports.RouterOutlet = RouterOutlet;
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

System.register("angular2/src/router/rules/rule_set", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/router/rules/rules", "angular2/src/router/route_config/route_config_impl", "angular2/src/router/rules/route_handlers/async_route_handler", "angular2/src/router/rules/route_handlers/sync_route_handler", "angular2/src/router/rules/route_paths/param_route_path", "angular2/src/router/rules/route_paths/regex_route_path"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var async_1 = require("angular2/src/facade/async");
  var rules_1 = require("angular2/src/router/rules/rules");
  var route_config_impl_1 = require("angular2/src/router/route_config/route_config_impl");
  var async_route_handler_1 = require("angular2/src/router/rules/route_handlers/async_route_handler");
  var sync_route_handler_1 = require("angular2/src/router/rules/route_handlers/sync_route_handler");
  var param_route_path_1 = require("angular2/src/router/rules/route_paths/param_route_path");
  var regex_route_path_1 = require("angular2/src/router/rules/route_paths/regex_route_path");
  var RuleSet = (function() {
    function RuleSet() {
      this.rulesByName = new collection_1.Map();
      this.auxRulesByName = new collection_1.Map();
      this.auxRulesByPath = new collection_1.Map();
      this.rules = [];
      this.defaultRule = null;
    }
    RuleSet.prototype.config = function(config) {
      var handler;
      if (lang_1.isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
        var suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
        throw new exceptions_1.BaseException("Route \"" + config.path + "\" with name \"" + config.name + "\" does not begin with an uppercase letter. Route names should be CamelCase like \"" + suggestedName + "\".");
      }
      if (config instanceof route_config_impl_1.AuxRoute) {
        handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
        var routePath_1 = this._getRoutePath(config);
        var auxRule = new rules_1.RouteRule(routePath_1, handler, config.name);
        this.auxRulesByPath.set(routePath_1.toString(), auxRule);
        if (lang_1.isPresent(config.name)) {
          this.auxRulesByName.set(config.name, auxRule);
        }
        return auxRule.terminal;
      }
      var useAsDefault = false;
      if (config instanceof route_config_impl_1.Redirect) {
        var routePath_2 = this._getRoutePath(config);
        var redirector = new rules_1.RedirectRule(routePath_2, config.redirectTo);
        this._assertNoHashCollision(redirector.hash, config.path);
        this.rules.push(redirector);
        return true;
      }
      if (config instanceof route_config_impl_1.Route) {
        handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
        useAsDefault = lang_1.isPresent(config.useAsDefault) && config.useAsDefault;
      } else if (config instanceof route_config_impl_1.AsyncRoute) {
        handler = new async_route_handler_1.AsyncRouteHandler(config.loader, config.data);
        useAsDefault = lang_1.isPresent(config.useAsDefault) && config.useAsDefault;
      }
      var routePath = this._getRoutePath(config);
      var newRule = new rules_1.RouteRule(routePath, handler, config.name);
      this._assertNoHashCollision(newRule.hash, config.path);
      if (useAsDefault) {
        if (lang_1.isPresent(this.defaultRule)) {
          throw new exceptions_1.BaseException("Only one route can be default");
        }
        this.defaultRule = newRule;
      }
      this.rules.push(newRule);
      if (lang_1.isPresent(config.name)) {
        this.rulesByName.set(config.name, newRule);
      }
      return newRule.terminal;
    };
    RuleSet.prototype.recognize = function(urlParse) {
      var solutions = [];
      this.rules.forEach(function(routeRecognizer) {
        var pathMatch = routeRecognizer.recognize(urlParse);
        if (lang_1.isPresent(pathMatch)) {
          solutions.push(pathMatch);
        }
      });
      if (solutions.length == 0 && lang_1.isPresent(urlParse) && urlParse.auxiliary.length > 0) {
        return [async_1.PromiseWrapper.resolve(new rules_1.PathMatch(null, null, urlParse.auxiliary))];
      }
      return solutions;
    };
    RuleSet.prototype.recognizeAuxiliary = function(urlParse) {
      var routeRecognizer = this.auxRulesByPath.get(urlParse.path);
      if (lang_1.isPresent(routeRecognizer)) {
        return [routeRecognizer.recognize(urlParse)];
      }
      return [async_1.PromiseWrapper.resolve(null)];
    };
    RuleSet.prototype.hasRoute = function(name) {
      return this.rulesByName.has(name);
    };
    RuleSet.prototype.componentLoaded = function(name) {
      return this.hasRoute(name) && lang_1.isPresent(this.rulesByName.get(name).handler.componentType);
    };
    RuleSet.prototype.loadComponent = function(name) {
      return this.rulesByName.get(name).handler.resolveComponentType();
    };
    RuleSet.prototype.generate = function(name, params) {
      var rule = this.rulesByName.get(name);
      if (lang_1.isBlank(rule)) {
        return null;
      }
      return rule.generate(params);
    };
    RuleSet.prototype.generateAuxiliary = function(name, params) {
      var rule = this.auxRulesByName.get(name);
      if (lang_1.isBlank(rule)) {
        return null;
      }
      return rule.generate(params);
    };
    RuleSet.prototype._assertNoHashCollision = function(hash, path) {
      this.rules.forEach(function(rule) {
        if (hash == rule.hash) {
          throw new exceptions_1.BaseException("Configuration '" + path + "' conflicts with existing route '" + rule.path + "'");
        }
      });
    };
    RuleSet.prototype._getRoutePath = function(config) {
      if (lang_1.isPresent(config.regex)) {
        if (lang_1.isFunction(config.serializer)) {
          return new regex_route_path_1.RegexRoutePath(config.regex, config.serializer);
        } else {
          throw new exceptions_1.BaseException("Route provides a regex property, '" + config.regex + "', but no serializer property");
        }
      }
      if (lang_1.isPresent(config.path)) {
        var path = (config instanceof route_config_impl_1.AuxRoute && config.path.startsWith('/')) ? config.path.substring(1) : config.path;
        return new param_route_path_1.ParamRoutePath(path);
      }
      throw new exceptions_1.BaseException('Route must provide either a path or regex property');
    };
    return RuleSet;
  }());
  exports.RuleSet = RuleSet;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/router_providers", ["angular2/src/router/router_providers_common", "angular2/src/platform/browser/location/browser_platform_location", "angular2/platform/common"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var router_providers_common_1 = require("angular2/src/router/router_providers_common");
  var browser_platform_location_1 = require("angular2/src/platform/browser/location/browser_platform_location");
  var common_1 = require("angular2/platform/common");
  exports.ROUTER_PROVIDERS = [router_providers_common_1.ROUTER_PROVIDERS_COMMON, ({
    provide: common_1.PlatformLocation,
    useClass: browser_platform_location_1.BrowserPlatformLocation
  })];
  exports.ROUTER_BINDINGS = exports.ROUTER_PROVIDERS;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/route_registry", ["angular2/src/facade/collection", "angular2/src/facade/async", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/core/reflection/reflection", "angular2/core", "angular2/src/router/route_config/route_config_impl", "angular2/src/router/rules/rules", "angular2/src/router/rules/rule_set", "angular2/src/router/instruction", "angular2/src/router/route_config/route_config_normalizer", "angular2/src/router/url_parser"], true, function(require, exports, module) {
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
  var collection_1 = require("angular2/src/facade/collection");
  var async_1 = require("angular2/src/facade/async");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var reflection_1 = require("angular2/src/core/reflection/reflection");
  var core_1 = require("angular2/core");
  var route_config_impl_1 = require("angular2/src/router/route_config/route_config_impl");
  var rules_1 = require("angular2/src/router/rules/rules");
  var rule_set_1 = require("angular2/src/router/rules/rule_set");
  var instruction_1 = require("angular2/src/router/instruction");
  var route_config_normalizer_1 = require("angular2/src/router/route_config/route_config_normalizer");
  var url_parser_1 = require("angular2/src/router/url_parser");
  var _resolveToNull = async_1.PromiseWrapper.resolve(null);
  exports.ROUTER_PRIMARY_COMPONENT = new core_1.OpaqueToken('RouterPrimaryComponent');
  var RouteRegistry = (function() {
    function RouteRegistry(_rootComponent) {
      this._rootComponent = _rootComponent;
      this._rules = new collection_1.Map();
    }
    RouteRegistry.prototype.config = function(parentComponent, config) {
      config = route_config_normalizer_1.normalizeRouteConfig(config, this);
      if (config instanceof route_config_impl_1.Route) {
        route_config_normalizer_1.assertComponentExists(config.component, config.path);
      } else if (config instanceof route_config_impl_1.AuxRoute) {
        route_config_normalizer_1.assertComponentExists(config.component, config.path);
      }
      var rules = this._rules.get(parentComponent);
      if (lang_1.isBlank(rules)) {
        rules = new rule_set_1.RuleSet();
        this._rules.set(parentComponent, rules);
      }
      var terminal = rules.config(config);
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
    RouteRegistry.prototype.recognize = function(url, ancestorInstructions) {
      var parsedUrl = url_parser_1.parser.parse(url);
      return this._recognize(parsedUrl, []);
    };
    RouteRegistry.prototype._recognize = function(parsedUrl, ancestorInstructions, _aux) {
      var _this = this;
      if (_aux === void 0) {
        _aux = false;
      }
      var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
      var parentComponent = lang_1.isPresent(parentInstruction) ? parentInstruction.component.componentType : this._rootComponent;
      var rules = this._rules.get(parentComponent);
      if (lang_1.isBlank(rules)) {
        return _resolveToNull;
      }
      var possibleMatches = _aux ? rules.recognizeAuxiliary(parsedUrl) : rules.recognize(parsedUrl);
      var matchPromises = possibleMatches.map(function(candidate) {
        return candidate.then(function(candidate) {
          if (candidate instanceof rules_1.PathMatch) {
            var auxParentInstructions = ancestorInstructions.length > 0 ? [collection_1.ListWrapper.last(ancestorInstructions)] : [];
            var auxInstructions = _this._auxRoutesToUnresolved(candidate.remainingAux, auxParentInstructions);
            var instruction = new instruction_1.ResolvedInstruction(candidate.instruction, null, auxInstructions);
            if (lang_1.isBlank(candidate.instruction) || candidate.instruction.terminal) {
              return instruction;
            }
            var newAncestorInstructions = ancestorInstructions.concat([instruction]);
            return _this._recognize(candidate.remaining, newAncestorInstructions).then(function(childInstruction) {
              if (lang_1.isBlank(childInstruction)) {
                return null;
              }
              if (childInstruction instanceof instruction_1.RedirectInstruction) {
                return childInstruction;
              }
              instruction.child = childInstruction;
              return instruction;
            });
          }
          if (candidate instanceof rules_1.RedirectMatch) {
            var instruction = _this.generate(candidate.redirectTo, ancestorInstructions.concat([null]));
            return new instruction_1.RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction, candidate.specificity);
          }
        });
      });
      if ((lang_1.isBlank(parsedUrl) || parsedUrl.path == '') && possibleMatches.length == 0) {
        return async_1.PromiseWrapper.resolve(this.generateDefault(parentComponent));
      }
      return async_1.PromiseWrapper.all(matchPromises).then(mostSpecific);
    };
    RouteRegistry.prototype._auxRoutesToUnresolved = function(auxRoutes, parentInstructions) {
      var _this = this;
      var unresolvedAuxInstructions = {};
      auxRoutes.forEach(function(auxUrl) {
        unresolvedAuxInstructions[auxUrl.path] = new instruction_1.UnresolvedInstruction(function() {
          return _this._recognize(auxUrl, parentInstructions, true);
        });
      });
      return unresolvedAuxInstructions;
    };
    RouteRegistry.prototype.generate = function(linkParams, ancestorInstructions, _aux) {
      if (_aux === void 0) {
        _aux = false;
      }
      var params = splitAndFlattenLinkParams(linkParams);
      var prevInstruction;
      if (collection_1.ListWrapper.first(params) == '') {
        params.shift();
        prevInstruction = collection_1.ListWrapper.first(ancestorInstructions);
        ancestorInstructions = [];
      } else {
        prevInstruction = ancestorInstructions.length > 0 ? ancestorInstructions.pop() : null;
        if (collection_1.ListWrapper.first(params) == '.') {
          params.shift();
        } else if (collection_1.ListWrapper.first(params) == '..') {
          while (collection_1.ListWrapper.first(params) == '..') {
            if (ancestorInstructions.length <= 0) {
              throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
            }
            prevInstruction = ancestorInstructions.pop();
            params = collection_1.ListWrapper.slice(params, 1);
          }
        } else {
          var routeName = collection_1.ListWrapper.first(params);
          var parentComponentType = this._rootComponent;
          var grandparentComponentType = null;
          if (ancestorInstructions.length > 1) {
            var parentComponentInstruction = ancestorInstructions[ancestorInstructions.length - 1];
            var grandComponentInstruction = ancestorInstructions[ancestorInstructions.length - 2];
            parentComponentType = parentComponentInstruction.component.componentType;
            grandparentComponentType = grandComponentInstruction.component.componentType;
          } else if (ancestorInstructions.length == 1) {
            parentComponentType = ancestorInstructions[0].component.componentType;
            grandparentComponentType = this._rootComponent;
          }
          var childRouteExists = this.hasRoute(routeName, parentComponentType);
          var parentRouteExists = lang_1.isPresent(grandparentComponentType) && this.hasRoute(routeName, grandparentComponentType);
          if (parentRouteExists && childRouteExists) {
            var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.";
            throw new exceptions_1.BaseException(msg);
          }
          if (parentRouteExists) {
            prevInstruction = ancestorInstructions.pop();
          }
        }
      }
      if (params[params.length - 1] == '') {
        params.pop();
      }
      if (params.length > 0 && params[0] == '') {
        params.shift();
      }
      if (params.length < 1) {
        var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must include a route name.";
        throw new exceptions_1.BaseException(msg);
      }
      var generatedInstruction = this._generate(params, ancestorInstructions, prevInstruction, _aux, linkParams);
      for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
        var ancestorInstruction = ancestorInstructions[i];
        if (lang_1.isBlank(ancestorInstruction)) {
          break;
        }
        generatedInstruction = ancestorInstruction.replaceChild(generatedInstruction);
      }
      return generatedInstruction;
    };
    RouteRegistry.prototype._generate = function(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink) {
      var _this = this;
      if (_aux === void 0) {
        _aux = false;
      }
      var parentComponentType = this._rootComponent;
      var componentInstruction = null;
      var auxInstructions = {};
      var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
      if (lang_1.isPresent(parentInstruction) && lang_1.isPresent(parentInstruction.component)) {
        parentComponentType = parentInstruction.component.componentType;
      }
      if (linkParams.length == 0) {
        var defaultInstruction = this.generateDefault(parentComponentType);
        if (lang_1.isBlank(defaultInstruction)) {
          throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(_originalLink) + "\" does not resolve to a terminal instruction.");
        }
        return defaultInstruction;
      }
      if (lang_1.isPresent(prevInstruction) && !_aux) {
        auxInstructions = collection_1.StringMapWrapper.merge(prevInstruction.auxInstruction, auxInstructions);
        componentInstruction = prevInstruction.component;
      }
      var rules = this._rules.get(parentComponentType);
      if (lang_1.isBlank(rules)) {
        throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponentType) + "\" has no route config.");
      }
      var linkParamIndex = 0;
      var routeParams = {};
      if (linkParamIndex < linkParams.length && lang_1.isString(linkParams[linkParamIndex])) {
        var routeName = linkParams[linkParamIndex];
        if (routeName == '' || routeName == '.' || routeName == '..') {
          throw new exceptions_1.BaseException("\"" + routeName + "/\" is only allowed at the beginning of a link DSL.");
        }
        linkParamIndex += 1;
        if (linkParamIndex < linkParams.length) {
          var linkParam = linkParams[linkParamIndex];
          if (lang_1.isStringMap(linkParam) && !lang_1.isArray(linkParam)) {
            routeParams = linkParam;
            linkParamIndex += 1;
          }
        }
        var routeRecognizer = (_aux ? rules.auxRulesByName : rules.rulesByName).get(routeName);
        if (lang_1.isBlank(routeRecognizer)) {
          throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponentType) + "\" has no route named \"" + routeName + "\".");
        }
        if (lang_1.isBlank(routeRecognizer.handler.componentType)) {
          var generatedUrl = routeRecognizer.generateComponentPathValues(routeParams);
          return new instruction_1.UnresolvedInstruction(function() {
            return routeRecognizer.handler.resolveComponentType().then(function(_) {
              return _this._generate(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink);
            });
          }, generatedUrl.urlPath, url_parser_1.convertUrlParamsToArray(generatedUrl.urlParams));
        }
        componentInstruction = _aux ? rules.generateAuxiliary(routeName, routeParams) : rules.generate(routeName, routeParams);
      }
      while (linkParamIndex < linkParams.length && lang_1.isArray(linkParams[linkParamIndex])) {
        var auxParentInstruction = [parentInstruction];
        var auxInstruction = this._generate(linkParams[linkParamIndex], auxParentInstruction, null, true, _originalLink);
        auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
        linkParamIndex += 1;
      }
      var instruction = new instruction_1.ResolvedInstruction(componentInstruction, null, auxInstructions);
      if (lang_1.isPresent(componentInstruction) && lang_1.isPresent(componentInstruction.componentType)) {
        var childInstruction = null;
        if (componentInstruction.terminal) {
          if (linkParamIndex >= linkParams.length) {}
        } else {
          var childAncestorComponents = ancestorInstructions.concat([instruction]);
          var remainingLinkParams = linkParams.slice(linkParamIndex);
          childInstruction = this._generate(remainingLinkParams, childAncestorComponents, null, false, _originalLink);
        }
        instruction.child = childInstruction;
      }
      return instruction;
    };
    RouteRegistry.prototype.hasRoute = function(name, parentComponent) {
      var rules = this._rules.get(parentComponent);
      if (lang_1.isBlank(rules)) {
        return false;
      }
      return rules.hasRoute(name);
    };
    RouteRegistry.prototype.generateDefault = function(componentCursor) {
      var _this = this;
      if (lang_1.isBlank(componentCursor)) {
        return null;
      }
      var rules = this._rules.get(componentCursor);
      if (lang_1.isBlank(rules) || lang_1.isBlank(rules.defaultRule)) {
        return null;
      }
      var defaultChild = null;
      if (lang_1.isPresent(rules.defaultRule.handler.componentType)) {
        var componentInstruction = rules.defaultRule.generate({});
        if (!rules.defaultRule.terminal) {
          defaultChild = this.generateDefault(rules.defaultRule.handler.componentType);
        }
        return new instruction_1.DefaultInstruction(componentInstruction, defaultChild);
      }
      return new instruction_1.UnresolvedInstruction(function() {
        return rules.defaultRule.handler.resolveComponentType().then(function(_) {
          return _this.generateDefault(componentCursor);
        });
      });
    };
    RouteRegistry = __decorate([core_1.Injectable(), __param(0, core_1.Inject(exports.ROUTER_PRIMARY_COMPONENT)), __metadata('design:paramtypes', [lang_1.Type])], RouteRegistry);
    return RouteRegistry;
  }());
  exports.RouteRegistry = RouteRegistry;
  function splitAndFlattenLinkParams(linkParams) {
    var accumulation = [];
    linkParams.forEach(function(item) {
      if (lang_1.isString(item)) {
        var strItem = item;
        accumulation = accumulation.concat(strItem.split('/'));
      } else {
        accumulation.push(item);
      }
    });
    return accumulation;
  }
  function mostSpecific(instructions) {
    instructions = instructions.filter(function(instruction) {
      return lang_1.isPresent(instruction);
    });
    if (instructions.length == 0) {
      return null;
    }
    if (instructions.length == 1) {
      return instructions[0];
    }
    var first = instructions[0];
    var rest = instructions.slice(1);
    return rest.reduce(function(instruction, contender) {
      if (compareSpecificityStrings(contender.specificity, instruction.specificity) == -1) {
        return contender;
      }
      return instruction;
    }, first);
  }
  function compareSpecificityStrings(a, b) {
    var l = lang_1.Math.min(a.length, b.length);
    for (var i = 0; i < l; i += 1) {
      var ai = lang_1.StringWrapper.charCodeAt(a, i);
      var bi = lang_1.StringWrapper.charCodeAt(b, i);
      var difference = bi - ai;
      if (difference != 0) {
        return difference;
      }
    }
    return a.length - b.length;
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

System.register("angular2/src/router/router", ["angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/platform/common", "angular2/core", "angular2/src/router/route_registry", "angular2/src/router/lifecycle/route_lifecycle_reflector"], true, function(require, exports, module) {
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
  var async_1 = require("angular2/src/facade/async");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var common_1 = require("angular2/platform/common");
  var core_1 = require("angular2/core");
  var route_registry_1 = require("angular2/src/router/route_registry");
  var route_lifecycle_reflector_1 = require("angular2/src/router/lifecycle/route_lifecycle_reflector");
  var _resolveToTrue = async_1.PromiseWrapper.resolve(true);
  var _resolveToFalse = async_1.PromiseWrapper.resolve(false);
  var Router = (function() {
    function Router(registry, parent, hostComponent, root) {
      this.registry = registry;
      this.parent = parent;
      this.hostComponent = hostComponent;
      this.root = root;
      this.navigating = false;
      this.currentInstruction = null;
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
      if (lang_1.isPresent(this._outlet)) {
        throw new exceptions_1.BaseException("Primary outlet is already registered.");
      }
      this._outlet = outlet;
      if (lang_1.isPresent(this.currentInstruction)) {
        return this.commit(this.currentInstruction, false);
      }
      return _resolveToTrue;
    };
    Router.prototype.unregisterPrimaryOutlet = function(outlet) {
      if (lang_1.isPresent(outlet.name)) {
        throw new exceptions_1.BaseException("registerPrimaryOutlet expects to be called with an unnamed outlet.");
      }
      this._outlet = null;
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
      if (lang_1.isPresent(this.currentInstruction) && lang_1.isPresent(auxInstruction = this.currentInstruction.auxInstruction[outletName])) {
        return router.commit(auxInstruction);
      }
      return _resolveToTrue;
    };
    Router.prototype.isRouteActive = function(instruction) {
      var _this = this;
      var router = this;
      if (lang_1.isBlank(this.currentInstruction)) {
        return false;
      }
      while (lang_1.isPresent(router.parent) && lang_1.isPresent(instruction.child)) {
        router = router.parent;
        instruction = instruction.child;
      }
      if (lang_1.isBlank(instruction.component) || lang_1.isBlank(this.currentInstruction.component) || this.currentInstruction.component.routeName != instruction.component.routeName) {
        return false;
      }
      var paramEquals = true;
      if (lang_1.isPresent(this.currentInstruction.component.params)) {
        collection_1.StringMapWrapper.forEach(instruction.component.params, function(value, key) {
          if (_this.currentInstruction.component.params[key] !== value) {
            paramEquals = false;
          }
        });
      }
      return paramEquals;
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
    Router.prototype._settleInstruction = function(instruction) {
      var _this = this;
      return instruction.resolveComponent().then(function(_) {
        var unsettledInstructions = [];
        if (lang_1.isPresent(instruction.component)) {
          instruction.component.reuse = false;
        }
        if (lang_1.isPresent(instruction.child)) {
          unsettledInstructions.push(_this._settleInstruction(instruction.child));
        }
        collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function(instruction, _) {
          unsettledInstructions.push(_this._settleInstruction(instruction));
        });
        return async_1.PromiseWrapper.all(unsettledInstructions);
      });
    };
    Router.prototype._navigate = function(instruction, _skipLocationChange) {
      var _this = this;
      return this._settleInstruction(instruction).then(function(_) {
        return _this._routerCanReuse(instruction);
      }).then(function(_) {
        return _this._canActivate(instruction);
      }).then(function(result) {
        if (!result) {
          return false;
        }
        return _this._routerCanDeactivate(instruction).then(function(result) {
          if (result) {
            return _this.commit(instruction, _skipLocationChange).then(function(_) {
              _this._emitNavigationFinish(instruction.toRootUrl());
              return true;
            });
          }
        });
      });
    };
    Router.prototype._emitNavigationFinish = function(url) {
      async_1.ObservableWrapper.callEmit(this._subject, url);
    };
    Router.prototype._emitNavigationFail = function(url) {
      async_1.ObservableWrapper.callError(this._subject, url);
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
    Router.prototype._routerCanReuse = function(instruction) {
      var _this = this;
      if (lang_1.isBlank(this._outlet)) {
        return _resolveToFalse;
      }
      if (lang_1.isBlank(instruction.component)) {
        return _resolveToTrue;
      }
      return this._outlet.routerCanReuse(instruction.component).then(function(result) {
        instruction.component.reuse = result;
        if (result && lang_1.isPresent(_this._childRouter) && lang_1.isPresent(instruction.child)) {
          return _this._childRouter._routerCanReuse(instruction.child);
        }
      });
    };
    Router.prototype._canActivate = function(nextInstruction) {
      return canActivateOne(nextInstruction, this.currentInstruction);
    };
    Router.prototype._routerCanDeactivate = function(instruction) {
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
        reuse = lang_1.isBlank(instruction.component) || instruction.component.reuse;
      }
      if (reuse) {
        next = _resolveToTrue;
      } else {
        next = this._outlet.routerCanDeactivate(componentInstruction);
      }
      return next.then(function(result) {
        if (result == false) {
          return false;
        }
        if (lang_1.isPresent(_this._childRouter)) {
          return _this._childRouter._routerCanDeactivate(childInstruction);
        }
        return true;
      });
    };
    Router.prototype.commit = function(instruction, _skipLocationChange) {
      var _this = this;
      if (_skipLocationChange === void 0) {
        _skipLocationChange = false;
      }
      this.currentInstruction = instruction;
      var next = _resolveToTrue;
      if (lang_1.isPresent(this._outlet) && lang_1.isPresent(instruction.component)) {
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
    Router.prototype.subscribe = function(onNext, onError) {
      return async_1.ObservableWrapper.subscribe(this._subject, onNext, onError);
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
      var ancestorComponents = this._getAncestorInstructions();
      return this.registry.recognize(url, ancestorComponents);
    };
    Router.prototype._getAncestorInstructions = function() {
      var ancestorInstructions = [this.currentInstruction];
      var ancestorRouter = this;
      while (lang_1.isPresent(ancestorRouter = ancestorRouter.parent)) {
        ancestorInstructions.unshift(ancestorRouter.currentInstruction);
      }
      return ancestorInstructions;
    };
    Router.prototype.renavigate = function() {
      if (lang_1.isBlank(this.lastNavigationAttempt)) {
        return this._currentNavigation;
      }
      return this.navigateByUrl(this.lastNavigationAttempt);
    };
    Router.prototype.generate = function(linkParams) {
      var ancestorInstructions = this._getAncestorInstructions();
      return this.registry.generate(linkParams, ancestorInstructions);
    };
    Router = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [route_registry_1.RouteRegistry, Router, Object, Router])], Router);
    return Router;
  }());
  exports.Router = Router;
  var RootRouter = (function(_super) {
    __extends(RootRouter, _super);
    function RootRouter(registry, location, primaryComponent) {
      var _this = this;
      _super.call(this, registry, null, primaryComponent);
      this.root = this;
      this._location = location;
      this._locationSub = this._location.subscribe(function(change) {
        _this.recognize(change['url']).then(function(instruction) {
          if (lang_1.isPresent(instruction)) {
            _this.navigateByInstruction(instruction, lang_1.isPresent(change['pop'])).then(function(_) {
              if (lang_1.isPresent(change['pop']) && change['type'] != 'hashchange') {
                return ;
              }
              var emitPath = instruction.toUrlPath();
              var emitQuery = instruction.toUrlQuery();
              if (emitPath.length > 0 && emitPath[0] != '/') {
                emitPath = '/' + emitPath;
              }
              if (change['type'] == 'hashchange') {
                if (instruction.toRootUrl() != _this._location.path()) {
                  _this._location.replaceState(emitPath, emitQuery);
                }
              } else {
                _this._location.go(emitPath, emitQuery);
              }
            });
          } else {
            _this._emitNavigationFail(change['url']);
          }
        });
      });
      this.registry.configFromComponent(primaryComponent);
      this.navigateByUrl(location.path());
    }
    RootRouter.prototype.commit = function(instruction, _skipLocationChange) {
      var _this = this;
      if (_skipLocationChange === void 0) {
        _skipLocationChange = false;
      }
      var emitPath = instruction.toUrlPath();
      var emitQuery = instruction.toUrlQuery();
      if (emitPath.length > 0 && emitPath[0] != '/') {
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
    RootRouter = __decorate([core_1.Injectable(), __param(2, core_1.Inject(route_registry_1.ROUTER_PRIMARY_COMPONENT)), __metadata('design:paramtypes', [route_registry_1.RouteRegistry, common_1.Location, lang_1.Type])], RootRouter);
    return RootRouter;
  }(Router));
  exports.RootRouter = RootRouter;
  var ChildRouter = (function(_super) {
    __extends(ChildRouter, _super);
    function ChildRouter(parent, hostComponent) {
      _super.call(this, parent.registry, parent, hostComponent, parent.root);
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
  }(Router));
  function canActivateOne(nextInstruction, prevInstruction) {
    var next = _resolveToTrue;
    if (lang_1.isBlank(nextInstruction.component)) {
      return next;
    }
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

System.register("angular2/router", ["angular2/src/router/router", "angular2/src/router/directives/router_outlet", "angular2/src/router/directives/router_link", "angular2/src/router/instruction", "angular2/src/router/route_registry", "angular2/src/router/route_config/route_config_decorator", "angular2/src/router/lifecycle/lifecycle_annotations", "angular2/src/router/instruction", "angular2/core", "angular2/src/router/router_providers_common", "angular2/src/router/router_providers", "angular2/src/router/directives/router_outlet", "angular2/src/router/directives/router_link"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  var router_1 = require("angular2/src/router/router");
  exports.Router = router_1.Router;
  var router_outlet_1 = require("angular2/src/router/directives/router_outlet");
  exports.RouterOutlet = router_outlet_1.RouterOutlet;
  var router_link_1 = require("angular2/src/router/directives/router_link");
  exports.RouterLink = router_link_1.RouterLink;
  var instruction_1 = require("angular2/src/router/instruction");
  exports.RouteParams = instruction_1.RouteParams;
  exports.RouteData = instruction_1.RouteData;
  var route_registry_1 = require("angular2/src/router/route_registry");
  exports.RouteRegistry = route_registry_1.RouteRegistry;
  exports.ROUTER_PRIMARY_COMPONENT = route_registry_1.ROUTER_PRIMARY_COMPONENT;
  __export(require("angular2/src/router/route_config/route_config_decorator"));
  var lifecycle_annotations_1 = require("angular2/src/router/lifecycle/lifecycle_annotations");
  exports.CanActivate = lifecycle_annotations_1.CanActivate;
  var instruction_2 = require("angular2/src/router/instruction");
  exports.Instruction = instruction_2.Instruction;
  exports.ComponentInstruction = instruction_2.ComponentInstruction;
  var core_1 = require("angular2/core");
  exports.OpaqueToken = core_1.OpaqueToken;
  var router_providers_common_1 = require("angular2/src/router/router_providers_common");
  exports.ROUTER_PROVIDERS_COMMON = router_providers_common_1.ROUTER_PROVIDERS_COMMON;
  var router_providers_1 = require("angular2/src/router/router_providers");
  exports.ROUTER_PROVIDERS = router_providers_1.ROUTER_PROVIDERS;
  exports.ROUTER_BINDINGS = router_providers_1.ROUTER_BINDINGS;
  var router_outlet_2 = require("angular2/src/router/directives/router_outlet");
  var router_link_2 = require("angular2/src/router/directives/router_link");
  exports.ROUTER_DIRECTIVES = [router_outlet_2.RouterOutlet, router_link_2.RouterLink];
  global.define = __define;
  return module.exports;
});

//# sourceMappingURLDisabled=router.dev.js.map