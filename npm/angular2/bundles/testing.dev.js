"format register";
System.register("angular2/src/mock/animation_builder_mock", ["angular2/src/core/di", "angular2/src/animate/animation_builder", "angular2/src/animate/css_animation_builder", "angular2/src/animate/animation", "angular2/src/animate/browser_details"], true, function(require, exports, module) {
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
  var di_1 = require("angular2/src/core/di");
  var animation_builder_1 = require("angular2/src/animate/animation_builder");
  var css_animation_builder_1 = require("angular2/src/animate/css_animation_builder");
  var animation_1 = require("angular2/src/animate/animation");
  var browser_details_1 = require("angular2/src/animate/browser_details");
  var MockAnimationBuilder = (function(_super) {
    __extends(MockAnimationBuilder, _super);
    function MockAnimationBuilder() {
      _super.call(this, null);
    }
    MockAnimationBuilder.prototype.css = function() {
      return new MockCssAnimationBuilder();
    };
    MockAnimationBuilder = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], MockAnimationBuilder);
    return MockAnimationBuilder;
  }(animation_builder_1.AnimationBuilder));
  exports.MockAnimationBuilder = MockAnimationBuilder;
  var MockCssAnimationBuilder = (function(_super) {
    __extends(MockCssAnimationBuilder, _super);
    function MockCssAnimationBuilder() {
      _super.call(this, null);
    }
    MockCssAnimationBuilder.prototype.start = function(element) {
      return new MockAnimation(element, this.data);
    };
    return MockCssAnimationBuilder;
  }(css_animation_builder_1.CssAnimationBuilder));
  var MockBrowserAbstraction = (function(_super) {
    __extends(MockBrowserAbstraction, _super);
    function MockBrowserAbstraction() {
      _super.apply(this, arguments);
    }
    MockBrowserAbstraction.prototype.doesElapsedTimeIncludesDelay = function() {
      this.elapsedTimeIncludesDelay = false;
    };
    return MockBrowserAbstraction;
  }(browser_details_1.BrowserDetails));
  var MockAnimation = (function(_super) {
    __extends(MockAnimation, _super);
    function MockAnimation(element, data) {
      _super.call(this, element, data, new MockBrowserAbstraction());
    }
    MockAnimation.prototype.wait = function(callback) {
      this._callback = callback;
    };
    MockAnimation.prototype.flush = function() {
      this._callback(0);
      this._callback = null;
    };
    return MockAnimation;
  }(animation_1.Animation));
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/directive_resolver_mock", ["angular2/src/core/di", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/core/metadata", "angular2/src/compiler/directive_resolver"], true, function(require, exports, module) {
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
  var di_1 = require("angular2/src/core/di");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var metadata_1 = require("angular2/src/core/metadata");
  var directive_resolver_1 = require("angular2/src/compiler/directive_resolver");
  var MockDirectiveResolver = (function(_super) {
    __extends(MockDirectiveResolver, _super);
    function MockDirectiveResolver() {
      _super.apply(this, arguments);
      this._providerOverrides = new collection_1.Map();
      this.viewProviderOverrides = new collection_1.Map();
    }
    MockDirectiveResolver.prototype.resolve = function(type) {
      var dm = _super.prototype.resolve.call(this, type);
      var providerOverrides = this._providerOverrides.get(type);
      var viewProviderOverrides = this.viewProviderOverrides.get(type);
      var providers = dm.providers;
      if (lang_1.isPresent(providerOverrides)) {
        var originalViewProviders = lang_1.isPresent(dm.providers) ? dm.providers : [];
        providers = originalViewProviders.concat(providerOverrides);
      }
      if (dm instanceof metadata_1.ComponentMetadata) {
        var viewProviders = dm.viewProviders;
        if (lang_1.isPresent(viewProviderOverrides)) {
          var originalViewProviders = lang_1.isPresent(dm.viewProviders) ? dm.viewProviders : [];
          viewProviders = originalViewProviders.concat(viewProviderOverrides);
        }
        return new metadata_1.ComponentMetadata({
          selector: dm.selector,
          inputs: dm.inputs,
          outputs: dm.outputs,
          host: dm.host,
          exportAs: dm.exportAs,
          moduleId: dm.moduleId,
          queries: dm.queries,
          changeDetection: dm.changeDetection,
          providers: providers,
          viewProviders: viewProviders
        });
      }
      return new metadata_1.DirectiveMetadata({
        selector: dm.selector,
        inputs: dm.inputs,
        outputs: dm.outputs,
        host: dm.host,
        providers: providers,
        exportAs: dm.exportAs,
        queries: dm.queries
      });
    };
    MockDirectiveResolver.prototype.setBindingsOverride = function(type, bindings) {
      this._providerOverrides.set(type, bindings);
    };
    MockDirectiveResolver.prototype.setViewBindingsOverride = function(type, viewBindings) {
      this.viewProviderOverrides.set(type, viewBindings);
    };
    MockDirectiveResolver.prototype.setProvidersOverride = function(type, providers) {
      this._providerOverrides.set(type, providers);
    };
    MockDirectiveResolver.prototype.setViewProvidersOverride = function(type, viewProviders) {
      this.viewProviderOverrides.set(type, viewProviders);
    };
    MockDirectiveResolver = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], MockDirectiveResolver);
    return MockDirectiveResolver;
  }(directive_resolver_1.DirectiveResolver));
  exports.MockDirectiveResolver = MockDirectiveResolver;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/view_resolver_mock", ["angular2/src/core/di", "angular2/src/core/di", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/core/metadata", "angular2/src/compiler/view_resolver"], true, function(require, exports, module) {
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
  var di_1 = require("angular2/src/core/di");
  var di_2 = require("angular2/src/core/di");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var metadata_1 = require("angular2/src/core/metadata");
  var view_resolver_1 = require("angular2/src/compiler/view_resolver");
  var MockViewResolver = (function(_super) {
    __extends(MockViewResolver, _super);
    function MockViewResolver() {
      _super.call(this);
      this._views = new collection_1.Map();
      this._inlineTemplates = new collection_1.Map();
      this._viewCache = new collection_1.Map();
      this._directiveOverrides = new collection_1.Map();
    }
    MockViewResolver.prototype.setView = function(component, view) {
      this._checkOverrideable(component);
      this._views.set(component, view);
    };
    MockViewResolver.prototype.setInlineTemplate = function(component, template) {
      this._checkOverrideable(component);
      this._inlineTemplates.set(component, template);
    };
    MockViewResolver.prototype.overrideViewDirective = function(component, from, to) {
      this._checkOverrideable(component);
      var overrides = this._directiveOverrides.get(component);
      if (lang_1.isBlank(overrides)) {
        overrides = new collection_1.Map();
        this._directiveOverrides.set(component, overrides);
      }
      overrides.set(from, to);
    };
    MockViewResolver.prototype.resolve = function(component) {
      var view = this._viewCache.get(component);
      if (lang_1.isPresent(view))
        return view;
      view = this._views.get(component);
      if (lang_1.isBlank(view)) {
        view = _super.prototype.resolve.call(this, component);
      }
      var directives = [];
      var overrides = this._directiveOverrides.get(component);
      if (lang_1.isPresent(overrides) && lang_1.isPresent(view.directives)) {
        flattenArray(view.directives, directives);
        overrides.forEach(function(to, from) {
          var srcIndex = directives.indexOf(from);
          if (srcIndex == -1) {
            throw new exceptions_1.BaseException("Overriden directive " + lang_1.stringify(from) + " not found in the template of " + lang_1.stringify(component));
          }
          directives[srcIndex] = to;
        });
        view = new metadata_1.ViewMetadata({
          template: view.template,
          templateUrl: view.templateUrl,
          directives: directives
        });
      }
      var inlineTemplate = this._inlineTemplates.get(component);
      if (lang_1.isPresent(inlineTemplate)) {
        view = new metadata_1.ViewMetadata({
          template: inlineTemplate,
          templateUrl: null,
          directives: view.directives
        });
      }
      this._viewCache.set(component, view);
      return view;
    };
    MockViewResolver.prototype._checkOverrideable = function(component) {
      var cached = this._viewCache.get(component);
      if (lang_1.isPresent(cached)) {
        throw new exceptions_1.BaseException("The component " + lang_1.stringify(component) + " has already been compiled, its configuration can not be changed");
      }
    };
    MockViewResolver = __decorate([di_2.Injectable(), __metadata('design:paramtypes', [])], MockViewResolver);
    return MockViewResolver;
  }(view_resolver_1.ViewResolver));
  exports.MockViewResolver = MockViewResolver;
  function flattenArray(tree, out) {
    for (var i = 0; i < tree.length; i++) {
      var item = di_1.resolveForwardRef(tree[i]);
      if (lang_1.isArray(item)) {
        flattenArray(item, out);
      } else {
        out.push(item);
      }
    }
  }
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

System.register("angular2/src/mock/ng_zone_mock", ["angular2/src/core/di", "angular2/src/core/zone/ng_zone", "angular2/src/facade/async"], true, function(require, exports, module) {
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
  var di_1 = require("angular2/src/core/di");
  var ng_zone_1 = require("angular2/src/core/zone/ng_zone");
  var async_1 = require("angular2/src/facade/async");
  var MockNgZone = (function(_super) {
    __extends(MockNgZone, _super);
    function MockNgZone() {
      _super.call(this, {enableLongStackTrace: false});
      this._mockOnStable = new async_1.EventEmitter(false);
    }
    Object.defineProperty(MockNgZone.prototype, "onStable", {
      get: function() {
        return this._mockOnStable;
      },
      enumerable: true,
      configurable: true
    });
    MockNgZone.prototype.run = function(fn) {
      return fn();
    };
    MockNgZone.prototype.runOutsideAngular = function(fn) {
      return fn();
    };
    MockNgZone.prototype.simulateZoneExit = function() {
      async_1.ObservableWrapper.callNext(this.onStable, null);
    };
    MockNgZone = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], MockNgZone);
    return MockNgZone;
  }(ng_zone_1.NgZone));
  exports.MockNgZone = MockNgZone;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/utils", ["angular2/core", "angular2/src/facade/collection", "angular2/src/platform/dom/dom_adapter", "angular2/src/facade/lang"], true, function(require, exports, module) {
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
  var collection_1 = require("angular2/src/facade/collection");
  var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
  var lang_1 = require("angular2/src/facade/lang");
  var Log = (function() {
    function Log() {
      this.logItems = [];
    }
    Log.prototype.add = function(value) {
      this.logItems.push(value);
    };
    Log.prototype.fn = function(value) {
      var _this = this;
      return function(a1, a2, a3, a4, a5) {
        if (a1 === void 0) {
          a1 = null;
        }
        if (a2 === void 0) {
          a2 = null;
        }
        if (a3 === void 0) {
          a3 = null;
        }
        if (a4 === void 0) {
          a4 = null;
        }
        if (a5 === void 0) {
          a5 = null;
        }
        _this.logItems.push(value);
      };
    };
    Log.prototype.clear = function() {
      this.logItems = [];
    };
    Log.prototype.result = function() {
      return this.logItems.join("; ");
    };
    Log = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [])], Log);
    return Log;
  }());
  exports.Log = Log;
  exports.browserDetection = null;
  var BrowserDetection = (function() {
    function BrowserDetection(ua) {
      if (lang_1.isPresent(ua)) {
        this._ua = ua;
      } else {
        this._ua = lang_1.isPresent(dom_adapter_1.DOM) ? dom_adapter_1.DOM.getUserAgent() : '';
      }
    }
    BrowserDetection.setup = function() {
      exports.browserDetection = new BrowserDetection(null);
    };
    Object.defineProperty(BrowserDetection.prototype, "isFirefox", {
      get: function() {
        return this._ua.indexOf('Firefox') > -1;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserDetection.prototype, "isAndroid", {
      get: function() {
        return this._ua.indexOf('Mozilla/5.0') > -1 && this._ua.indexOf('Android') > -1 && this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Chrome') == -1;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserDetection.prototype, "isEdge", {
      get: function() {
        return this._ua.indexOf('Edge') > -1;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserDetection.prototype, "isIE", {
      get: function() {
        return this._ua.indexOf('Trident') > -1;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserDetection.prototype, "isWebkit", {
      get: function() {
        return this._ua.indexOf('AppleWebKit') > -1 && this._ua.indexOf('Edge') == -1;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserDetection.prototype, "isIOS7", {
      get: function() {
        return this._ua.indexOf('iPhone OS 7') > -1 || this._ua.indexOf('iPad OS 7') > -1;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserDetection.prototype, "isSlow", {
      get: function() {
        return this.isAndroid || this.isIE || this.isIOS7;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(BrowserDetection.prototype, "supportsIntlApi", {
      get: function() {
        return this._ua.indexOf('Chrome/4') > -1 && this._ua.indexOf('Edge') == -1;
      },
      enumerable: true,
      configurable: true
    });
    return BrowserDetection;
  }());
  exports.BrowserDetection = BrowserDetection;
  function dispatchEvent(element, eventType) {
    dom_adapter_1.DOM.dispatchEvent(element, dom_adapter_1.DOM.createEvent(eventType));
  }
  exports.dispatchEvent = dispatchEvent;
  function el(html) {
    return dom_adapter_1.DOM.firstChild(dom_adapter_1.DOM.content(dom_adapter_1.DOM.createTemplate(html)));
  }
  exports.el = el;
  var _RE_SPECIAL_CHARS = ['-', '[', ']', '/', '{', '}', '\\', '(', ')', '*', '+', '?', '.', '^', '$', '|'];
  var _ESCAPE_RE = lang_1.RegExpWrapper.create("[\\" + _RE_SPECIAL_CHARS.join('\\') + "]");
  function containsRegexp(input) {
    return lang_1.RegExpWrapper.create(lang_1.StringWrapper.replaceAllMapped(input, _ESCAPE_RE, function(match) {
      return ("\\" + match[0]);
    }));
  }
  exports.containsRegexp = containsRegexp;
  function normalizeCSS(css) {
    css = lang_1.StringWrapper.replaceAll(css, /\s+/g, ' ');
    css = lang_1.StringWrapper.replaceAll(css, /:\s/g, ':');
    css = lang_1.StringWrapper.replaceAll(css, /'/g, '"');
    css = lang_1.StringWrapper.replaceAll(css, / }/g, '}');
    css = lang_1.StringWrapper.replaceAllMapped(css, /url\((\"|\s)(.+)(\"|\s)\)(\s*)/g, function(match) {
      return ("url(\"" + match[2] + "\")");
    });
    css = lang_1.StringWrapper.replaceAllMapped(css, /\[(.+)=([^"\]]+)\]/g, function(match) {
      return ("[" + match[1] + "=\"" + match[2] + "\"]");
    });
    return css;
  }
  exports.normalizeCSS = normalizeCSS;
  var _singleTagWhitelist = ['br', 'hr', 'input'];
  function stringifyElement(el) {
    var result = '';
    if (dom_adapter_1.DOM.isElementNode(el)) {
      var tagName = dom_adapter_1.DOM.tagName(el).toLowerCase();
      result += "<" + tagName;
      var attributeMap = dom_adapter_1.DOM.attributeMap(el);
      var keys = [];
      attributeMap.forEach(function(v, k) {
        return keys.push(k);
      });
      collection_1.ListWrapper.sort(keys);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var attValue = attributeMap.get(key);
        if (!lang_1.isString(attValue)) {
          result += " " + key;
        } else {
          result += " " + key + "=\"" + attValue + "\"";
        }
      }
      result += '>';
      var childrenRoot = dom_adapter_1.DOM.templateAwareRoot(el);
      var children = lang_1.isPresent(childrenRoot) ? dom_adapter_1.DOM.childNodes(childrenRoot) : [];
      for (var j = 0; j < children.length; j++) {
        result += stringifyElement(children[j]);
      }
      if (!collection_1.ListWrapper.contains(_singleTagWhitelist, tagName)) {
        result += "</" + tagName + ">";
      }
    } else if (dom_adapter_1.DOM.isCommentNode(el)) {
      result += "<!--" + dom_adapter_1.DOM.nodeValue(el) + "-->";
    } else {
      result += dom_adapter_1.DOM.getText(el);
    }
    return result;
  }
  exports.stringifyElement = stringifyElement;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/fake_async", ["angular2/src/facade/exceptions"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var _FakeAsyncTestZoneSpecType = Zone['FakeAsyncTestZoneSpec'];
  function fakeAsync(fn) {
    if (Zone.current.get('FakeAsyncTestZoneSpec') != null) {
      throw new exceptions_1.BaseException('fakeAsync() calls can not be nested');
    }
    var fakeAsyncTestZoneSpec = new _FakeAsyncTestZoneSpecType();
    var fakeAsyncZone = Zone.current.fork(fakeAsyncTestZoneSpec);
    return function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
      }
      var res = fakeAsyncZone.run(function() {
        var res = fn.apply(void 0, args);
        flushMicrotasks();
        return res;
      });
      if (fakeAsyncTestZoneSpec.pendingPeriodicTimers.length > 0) {
        throw new exceptions_1.BaseException((fakeAsyncTestZoneSpec.pendingPeriodicTimers.length + " ") + "periodic timer(s) still in the queue.");
      }
      if (fakeAsyncTestZoneSpec.pendingTimers.length > 0) {
        throw new exceptions_1.BaseException(fakeAsyncTestZoneSpec.pendingTimers.length + " timer(s) still in the queue.");
      }
      return res;
    };
  }
  exports.fakeAsync = fakeAsync;
  function _getFakeAsyncZoneSpec() {
    var zoneSpec = Zone.current.get('FakeAsyncTestZoneSpec');
    if (zoneSpec == null) {
      throw new Error('The code should be running in the fakeAsync zone to call this function');
    }
    return zoneSpec;
  }
  function clearPendingTimers() {}
  exports.clearPendingTimers = clearPendingTimers;
  function tick(millis) {
    if (millis === void 0) {
      millis = 0;
    }
    _getFakeAsyncZoneSpec().tick(millis);
  }
  exports.tick = tick;
  function flushMicrotasks() {
    _getFakeAsyncZoneSpec().flushMicrotasks();
  }
  exports.flushMicrotasks = flushMicrotasks;
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

System.register("angular2/src/testing/test_component_builder", ["angular2/core", "angular2/compiler", "angular2/src/facade/exceptions", "angular2/src/facade/lang", "angular2/src/facade/async", "angular2/src/facade/collection", "angular2/src/testing/utils", "angular2/src/platform/dom/dom_tokens", "angular2/src/platform/dom/dom_adapter", "angular2/src/core/debug/debug_node", "angular2/src/testing/fake_async"], true, function(require, exports, module) {
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
  var compiler_1 = require("angular2/compiler");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var lang_1 = require("angular2/src/facade/lang");
  var async_1 = require("angular2/src/facade/async");
  var collection_1 = require("angular2/src/facade/collection");
  var utils_1 = require("angular2/src/testing/utils");
  var dom_tokens_1 = require("angular2/src/platform/dom/dom_tokens");
  var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
  var debug_node_1 = require("angular2/src/core/debug/debug_node");
  var fake_async_1 = require("angular2/src/testing/fake_async");
  exports.ComponentFixtureAutoDetect = new core_1.OpaqueToken("ComponentFixtureAutoDetect");
  exports.ComponentFixtureNoNgZone = new core_1.OpaqueToken("ComponentFixtureNoNgZone");
  var ComponentFixture = (function() {
    function ComponentFixture(componentRef, ngZone, autoDetect) {
      var _this = this;
      this._isStable = true;
      this._completer = null;
      this._onUnstableSubscription = null;
      this._onStableSubscription = null;
      this._onMicrotaskEmptySubscription = null;
      this._onErrorSubscription = null;
      this.changeDetectorRef = componentRef.changeDetectorRef;
      this.elementRef = componentRef.location;
      this.debugElement = debug_node_1.getDebugNode(this.elementRef.nativeElement);
      this.componentInstance = componentRef.instance;
      this.nativeElement = this.elementRef.nativeElement;
      this.componentRef = componentRef;
      this.ngZone = ngZone;
      this._autoDetect = autoDetect;
      if (ngZone != null) {
        this._onUnstableSubscription = async_1.ObservableWrapper.subscribe(ngZone.onUnstable, function(_) {
          _this._isStable = false;
        });
        this._onMicrotaskEmptySubscription = async_1.ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, function(_) {
          if (_this._autoDetect) {
            _this.detectChanges(true);
          }
        });
        this._onStableSubscription = async_1.ObservableWrapper.subscribe(ngZone.onStable, function(_) {
          _this._isStable = true;
          if (_this._completer != null) {
            _this._completer.resolve(true);
            _this._completer = null;
          }
        });
        this._onErrorSubscription = async_1.ObservableWrapper.subscribe(ngZone.onError, function(error) {
          throw error.error;
        });
      }
    }
    ComponentFixture.prototype._tick = function(checkNoChanges) {
      this.changeDetectorRef.detectChanges();
      if (checkNoChanges) {
        this.checkNoChanges();
      }
    };
    ComponentFixture.prototype.detectChanges = function(checkNoChanges) {
      var _this = this;
      if (checkNoChanges === void 0) {
        checkNoChanges = true;
      }
      if (this.ngZone != null) {
        this.ngZone.run(function() {
          _this._tick(checkNoChanges);
        });
      } else {
        this._tick(checkNoChanges);
      }
    };
    ComponentFixture.prototype.checkNoChanges = function() {
      this.changeDetectorRef.checkNoChanges();
    };
    ComponentFixture.prototype.autoDetectChanges = function(autoDetect) {
      if (autoDetect === void 0) {
        autoDetect = true;
      }
      if (this.ngZone == null) {
        throw new exceptions_1.BaseException('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
      }
      this._autoDetect = autoDetect;
      this.detectChanges();
    };
    ComponentFixture.prototype.isStable = function() {
      return this._isStable;
    };
    ComponentFixture.prototype.whenStable = function() {
      if (this._isStable) {
        return async_1.PromiseWrapper.resolve(false);
      } else {
        this._completer = new async_1.PromiseCompleter();
        return this._completer.promise;
      }
    };
    ComponentFixture.prototype.destroy = function() {
      this.componentRef.destroy();
      if (this._onUnstableSubscription != null) {
        async_1.ObservableWrapper.dispose(this._onUnstableSubscription);
        this._onUnstableSubscription = null;
      }
      if (this._onStableSubscription != null) {
        async_1.ObservableWrapper.dispose(this._onStableSubscription);
        this._onStableSubscription = null;
      }
      if (this._onMicrotaskEmptySubscription != null) {
        async_1.ObservableWrapper.dispose(this._onMicrotaskEmptySubscription);
        this._onMicrotaskEmptySubscription = null;
      }
      if (this._onErrorSubscription != null) {
        async_1.ObservableWrapper.dispose(this._onErrorSubscription);
        this._onErrorSubscription = null;
      }
    };
    return ComponentFixture;
  }());
  exports.ComponentFixture = ComponentFixture;
  var _nextRootElementId = 0;
  var TestComponentBuilder = (function() {
    function TestComponentBuilder(_injector) {
      this._injector = _injector;
      this._bindingsOverrides = new Map();
      this._directiveOverrides = new Map();
      this._templateOverrides = new Map();
      this._viewBindingsOverrides = new Map();
      this._viewOverrides = new Map();
    }
    TestComponentBuilder.prototype._clone = function() {
      var clone = new TestComponentBuilder(this._injector);
      clone._viewOverrides = collection_1.MapWrapper.clone(this._viewOverrides);
      clone._directiveOverrides = collection_1.MapWrapper.clone(this._directiveOverrides);
      clone._templateOverrides = collection_1.MapWrapper.clone(this._templateOverrides);
      clone._bindingsOverrides = collection_1.MapWrapper.clone(this._bindingsOverrides);
      clone._viewBindingsOverrides = collection_1.MapWrapper.clone(this._viewBindingsOverrides);
      return clone;
    };
    TestComponentBuilder.prototype.overrideTemplate = function(componentType, template) {
      var clone = this._clone();
      clone._templateOverrides.set(componentType, template);
      return clone;
    };
    TestComponentBuilder.prototype.overrideView = function(componentType, view) {
      var clone = this._clone();
      clone._viewOverrides.set(componentType, view);
      return clone;
    };
    TestComponentBuilder.prototype.overrideDirective = function(componentType, from, to) {
      var clone = this._clone();
      var overridesForComponent = clone._directiveOverrides.get(componentType);
      if (!lang_1.isPresent(overridesForComponent)) {
        clone._directiveOverrides.set(componentType, new Map());
        overridesForComponent = clone._directiveOverrides.get(componentType);
      }
      overridesForComponent.set(from, to);
      return clone;
    };
    TestComponentBuilder.prototype.overrideProviders = function(type, providers) {
      var clone = this._clone();
      clone._bindingsOverrides.set(type, providers);
      return clone;
    };
    TestComponentBuilder.prototype.overrideBindings = function(type, providers) {
      return this.overrideProviders(type, providers);
    };
    TestComponentBuilder.prototype.overrideViewProviders = function(type, providers) {
      var clone = this._clone();
      clone._viewBindingsOverrides.set(type, providers);
      return clone;
    };
    TestComponentBuilder.prototype.overrideViewBindings = function(type, providers) {
      return this.overrideViewProviders(type, providers);
    };
    TestComponentBuilder.prototype._create = function(ngZone, componentFactory) {
      var rootElId = "root" + _nextRootElementId++;
      var rootEl = utils_1.el("<div id=\"" + rootElId + "\"></div>");
      var doc = this._injector.get(dom_tokens_1.DOCUMENT);
      var oldRoots = dom_adapter_1.DOM.querySelectorAll(doc, '[id^=root]');
      for (var i = 0; i < oldRoots.length; i++) {
        dom_adapter_1.DOM.remove(oldRoots[i]);
      }
      dom_adapter_1.DOM.appendChild(doc.body, rootEl);
      var componentRef = componentFactory.create(this._injector, [], "#" + rootElId);
      var autoDetect = this._injector.get(exports.ComponentFixtureAutoDetect, false);
      return new ComponentFixture(componentRef, ngZone, autoDetect);
    };
    TestComponentBuilder.prototype.createAsync = function(rootComponentType) {
      var _this = this;
      var noNgZone = lang_1.IS_DART || this._injector.get(exports.ComponentFixtureNoNgZone, false);
      var ngZone = noNgZone ? null : this._injector.get(core_1.NgZone, null);
      var initComponent = function() {
        var mockDirectiveResolver = _this._injector.get(compiler_1.DirectiveResolver);
        var mockViewResolver = _this._injector.get(compiler_1.ViewResolver);
        _this._viewOverrides.forEach(function(view, type) {
          return mockViewResolver.setView(type, view);
        });
        _this._templateOverrides.forEach(function(template, type) {
          return mockViewResolver.setInlineTemplate(type, template);
        });
        _this._directiveOverrides.forEach(function(overrides, component) {
          overrides.forEach(function(to, from) {
            mockViewResolver.overrideViewDirective(component, from, to);
          });
        });
        _this._bindingsOverrides.forEach(function(bindings, type) {
          return mockDirectiveResolver.setBindingsOverride(type, bindings);
        });
        _this._viewBindingsOverrides.forEach(function(bindings, type) {
          return mockDirectiveResolver.setViewBindingsOverride(type, bindings);
        });
        var promise = _this._injector.get(core_1.ComponentResolver).resolveComponent(rootComponentType);
        return promise.then(function(componentFactory) {
          return _this._create(ngZone, componentFactory);
        });
      };
      return ngZone == null ? initComponent() : ngZone.run(initComponent);
    };
    TestComponentBuilder.prototype.createFakeAsync = function(rootComponentType) {
      var result;
      var error;
      async_1.PromiseWrapper.then(this.createAsync(rootComponentType), function(_result) {
        result = _result;
      }, function(_error) {
        error = _error;
      });
      fake_async_1.tick();
      if (lang_1.isPresent(error)) {
        throw error;
      }
      return result;
    };
    TestComponentBuilder.prototype.createSync = function(componentFactory) {
      var _this = this;
      var noNgZone = lang_1.IS_DART || this._injector.get(exports.ComponentFixtureNoNgZone, false);
      var ngZone = noNgZone ? null : this._injector.get(core_1.NgZone, null);
      var initComponent = function() {
        return _this._create(ngZone, componentFactory);
      };
      return ngZone == null ? initComponent() : ngZone.run(initComponent);
    };
    TestComponentBuilder = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [core_1.Injector])], TestComponentBuilder);
    return TestComponentBuilder;
  }());
  exports.TestComponentBuilder = TestComponentBuilder;
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

System.register("angular2/src/mock/mock_location_strategy", ["angular2/src/core/di", "angular2/src/facade/async", "angular2/platform/common"], true, function(require, exports, module) {
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
  var di_1 = require("angular2/src/core/di");
  var async_1 = require("angular2/src/facade/async");
  var common_1 = require("angular2/platform/common");
  var MockLocationStrategy = (function(_super) {
    __extends(MockLocationStrategy, _super);
    function MockLocationStrategy() {
      _super.call(this);
      this.internalBaseHref = '/';
      this.internalPath = '/';
      this.internalTitle = '';
      this.urlChanges = [];
      this._subject = new async_1.EventEmitter();
    }
    MockLocationStrategy.prototype.simulatePopState = function(url) {
      this.internalPath = url;
      async_1.ObservableWrapper.callEmit(this._subject, new _MockPopStateEvent(this.path()));
    };
    MockLocationStrategy.prototype.path = function() {
      return this.internalPath;
    };
    MockLocationStrategy.prototype.prepareExternalUrl = function(internal) {
      if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
        return this.internalBaseHref + internal.substring(1);
      }
      return this.internalBaseHref + internal;
    };
    MockLocationStrategy.prototype.pushState = function(ctx, title, path, query) {
      this.internalTitle = title;
      var url = path + (query.length > 0 ? ('?' + query) : '');
      this.internalPath = url;
      var externalUrl = this.prepareExternalUrl(url);
      this.urlChanges.push(externalUrl);
    };
    MockLocationStrategy.prototype.replaceState = function(ctx, title, path, query) {
      this.internalTitle = title;
      var url = path + (query.length > 0 ? ('?' + query) : '');
      this.internalPath = url;
      var externalUrl = this.prepareExternalUrl(url);
      this.urlChanges.push('replace: ' + externalUrl);
    };
    MockLocationStrategy.prototype.onPopState = function(fn) {
      async_1.ObservableWrapper.subscribe(this._subject, fn);
    };
    MockLocationStrategy.prototype.getBaseHref = function() {
      return this.internalBaseHref;
    };
    MockLocationStrategy.prototype.back = function() {
      if (this.urlChanges.length > 0) {
        this.urlChanges.pop();
        var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
        this.simulatePopState(nextUrl);
      }
    };
    MockLocationStrategy.prototype.forward = function() {
      throw 'not implemented';
    };
    MockLocationStrategy = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], MockLocationStrategy);
    return MockLocationStrategy;
  }(common_1.LocationStrategy));
  exports.MockLocationStrategy = MockLocationStrategy;
  var _MockPopStateEvent = (function() {
    function _MockPopStateEvent(newUrl) {
      this.newUrl = newUrl;
      this.pop = true;
      this.type = 'popstate';
    }
    return _MockPopStateEvent;
  }());
  global.define = __define;
  return module.exports;
});

System.register("angular2/platform/testing/browser_static", ["angular2/core", "angular2/compiler", "angular2/src/platform/browser_common", "angular2/src/platform/browser/browser_adapter", "angular2/src/animate/animation_builder", "angular2/src/mock/animation_builder_mock", "angular2/src/mock/directive_resolver_mock", "angular2/src/mock/view_resolver_mock", "angular2/src/mock/mock_location_strategy", "angular2/platform/common", "angular2/src/mock/ng_zone_mock", "angular2/src/platform/browser/xhr_impl", "angular2/compiler", "angular2/src/testing/test_component_builder", "angular2/src/testing/utils", "angular2/platform/common_dom", "angular2/src/facade/lang", "angular2/src/testing/utils"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var compiler_1 = require("angular2/compiler");
  var browser_common_1 = require("angular2/src/platform/browser_common");
  var browser_adapter_1 = require("angular2/src/platform/browser/browser_adapter");
  var animation_builder_1 = require("angular2/src/animate/animation_builder");
  var animation_builder_mock_1 = require("angular2/src/mock/animation_builder_mock");
  var directive_resolver_mock_1 = require("angular2/src/mock/directive_resolver_mock");
  var view_resolver_mock_1 = require("angular2/src/mock/view_resolver_mock");
  var mock_location_strategy_1 = require("angular2/src/mock/mock_location_strategy");
  var common_1 = require("angular2/platform/common");
  var ng_zone_mock_1 = require("angular2/src/mock/ng_zone_mock");
  var xhr_impl_1 = require("angular2/src/platform/browser/xhr_impl");
  var compiler_2 = require("angular2/compiler");
  var test_component_builder_1 = require("angular2/src/testing/test_component_builder");
  var utils_1 = require("angular2/src/testing/utils");
  var common_dom_1 = require("angular2/platform/common_dom");
  var lang_1 = require("angular2/src/facade/lang");
  var utils_2 = require("angular2/src/testing/utils");
  function initBrowserTests() {
    browser_adapter_1.BrowserDomAdapter.makeCurrent();
    utils_1.BrowserDetection.setup();
  }
  function createNgZone() {
    return lang_1.IS_DART ? new ng_zone_mock_1.MockNgZone() : new core_1.NgZone({enableLongStackTrace: true});
  }
  exports.TEST_BROWSER_STATIC_PLATFORM_PROVIDERS = [core_1.PLATFORM_COMMON_PROVIDERS, {
    provide: core_1.PLATFORM_INITIALIZER,
    useValue: initBrowserTests,
    multi: true
  }];
  exports.ADDITIONAL_TEST_BROWSER_PROVIDERS = [{
    provide: core_1.APP_ID,
    useValue: 'a'
  }, common_dom_1.ELEMENT_PROBE_PROVIDERS, {
    provide: compiler_1.DirectiveResolver,
    useClass: directive_resolver_mock_1.MockDirectiveResolver
  }, {
    provide: compiler_1.ViewResolver,
    useClass: view_resolver_mock_1.MockViewResolver
  }, utils_2.Log, test_component_builder_1.TestComponentBuilder, {
    provide: core_1.NgZone,
    useFactory: createNgZone
  }, {
    provide: common_1.LocationStrategy,
    useClass: mock_location_strategy_1.MockLocationStrategy
  }, {
    provide: animation_builder_1.AnimationBuilder,
    useClass: animation_builder_mock_1.MockAnimationBuilder
  }];
  exports.TEST_BROWSER_STATIC_APPLICATION_PROVIDERS = [browser_common_1.BROWSER_APP_COMMON_PROVIDERS, {
    provide: compiler_2.XHR,
    useClass: xhr_impl_1.XHRImpl
  }, exports.ADDITIONAL_TEST_BROWSER_PROVIDERS];
  global.define = __define;
  return module.exports;
});

System.register("angular2/platform/testing/browser", ["angular2/platform/testing/browser_static", "angular2/platform/browser", "angular2/platform/browser"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var browser_static_1 = require("angular2/platform/testing/browser_static");
  var browser_1 = require("angular2/platform/browser");
  var browser_2 = require("angular2/platform/browser");
  exports.CACHED_TEMPLATE_PROVIDER = browser_2.CACHED_TEMPLATE_PROVIDER;
  exports.TEST_BROWSER_PLATFORM_PROVIDERS = [browser_static_1.TEST_BROWSER_STATIC_PLATFORM_PROVIDERS];
  exports.TEST_BROWSER_APPLICATION_PROVIDERS = [browser_1.BROWSER_APP_PROVIDERS, browser_static_1.ADDITIONAL_TEST_BROWSER_PROVIDERS];
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/location_mock", ["angular2/src/core/di", "angular2/src/facade/async"], true, function(require, exports, module) {
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
  var di_1 = require("angular2/src/core/di");
  var async_1 = require("angular2/src/facade/async");
  var SpyLocation = (function() {
    function SpyLocation() {
      this.urlChanges = [];
      this._path = '';
      this._query = '';
      this._subject = new async_1.EventEmitter();
      this._baseHref = '';
      this.platformStrategy = null;
    }
    SpyLocation.prototype.setInitialPath = function(url) {
      this._path = url;
    };
    SpyLocation.prototype.setBaseHref = function(url) {
      this._baseHref = url;
    };
    SpyLocation.prototype.path = function() {
      return this._path;
    };
    SpyLocation.prototype.simulateUrlPop = function(pathname) {
      async_1.ObservableWrapper.callEmit(this._subject, {
        'url': pathname,
        'pop': true
      });
    };
    SpyLocation.prototype.simulateHashChange = function(pathname) {
      this.setInitialPath(pathname);
      this.urlChanges.push('hash: ' + pathname);
      async_1.ObservableWrapper.callEmit(this._subject, {
        'url': pathname,
        'pop': true,
        'type': 'hashchange'
      });
    };
    SpyLocation.prototype.prepareExternalUrl = function(url) {
      if (url.length > 0 && !url.startsWith('/')) {
        url = '/' + url;
      }
      return this._baseHref + url;
    };
    SpyLocation.prototype.go = function(path, query) {
      if (query === void 0) {
        query = '';
      }
      path = this.prepareExternalUrl(path);
      if (this._path == path && this._query == query) {
        return ;
      }
      this._path = path;
      this._query = query;
      var url = path + (query.length > 0 ? ('?' + query) : '');
      this.urlChanges.push(url);
    };
    SpyLocation.prototype.replaceState = function(path, query) {
      if (query === void 0) {
        query = '';
      }
      path = this.prepareExternalUrl(path);
      this._path = path;
      this._query = query;
      var url = path + (query.length > 0 ? ('?' + query) : '');
      this.urlChanges.push('replace: ' + url);
    };
    SpyLocation.prototype.forward = function() {};
    SpyLocation.prototype.back = function() {};
    SpyLocation.prototype.subscribe = function(onNext, onThrow, onReturn) {
      if (onThrow === void 0) {
        onThrow = null;
      }
      if (onReturn === void 0) {
        onReturn = null;
      }
      return async_1.ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    };
    SpyLocation.prototype.normalize = function(url) {
      return null;
    };
    SpyLocation = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], SpyLocation);
    return SpyLocation;
  }());
  exports.SpyLocation = SpyLocation;
  global.define = __define;
  return module.exports;
});

System.register("angular2/router/testing", ["angular2/src/mock/mock_location_strategy", "angular2/src/mock/location_mock"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  __export(require("angular2/src/mock/mock_location_strategy"));
  __export(require("angular2/src/mock/location_mock"));
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/headers", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/collection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var Headers = (function() {
    function Headers(headers) {
      var _this = this;
      if (headers instanceof Headers) {
        this._headersMap = headers._headersMap;
        return ;
      }
      this._headersMap = new collection_1.Map();
      if (lang_1.isBlank(headers)) {
        return ;
      }
      collection_1.StringMapWrapper.forEach(headers, function(v, k) {
        _this._headersMap.set(k, collection_1.isListLikeIterable(v) ? v : [v]);
      });
    }
    Headers.fromResponseHeaderString = function(headersString) {
      return headersString.trim().split('\n').map(function(val) {
        return val.split(':');
      }).map(function(_a) {
        var key = _a[0],
            parts = _a.slice(1);
        return ([key.trim(), parts.join(':').trim()]);
      }).reduce(function(headers, _a) {
        var key = _a[0],
            value = _a[1];
        return !headers.set(key, value) && headers;
      }, new Headers());
    };
    Headers.prototype.append = function(name, value) {
      var mapName = this._headersMap.get(name);
      var list = collection_1.isListLikeIterable(mapName) ? mapName : [];
      list.push(value);
      this._headersMap.set(name, list);
    };
    Headers.prototype.delete = function(name) {
      this._headersMap.delete(name);
    };
    Headers.prototype.forEach = function(fn) {
      this._headersMap.forEach(fn);
    };
    Headers.prototype.get = function(header) {
      return collection_1.ListWrapper.first(this._headersMap.get(header));
    };
    Headers.prototype.has = function(header) {
      return this._headersMap.has(header);
    };
    Headers.prototype.keys = function() {
      return collection_1.MapWrapper.keys(this._headersMap);
    };
    Headers.prototype.set = function(header, value) {
      var list = [];
      if (collection_1.isListLikeIterable(value)) {
        var pushValue = value.join(',');
        list.push(pushValue);
      } else {
        list.push(value);
      }
      this._headersMap.set(header, list);
    };
    Headers.prototype.values = function() {
      return collection_1.MapWrapper.values(this._headersMap);
    };
    Headers.prototype.toJSON = function() {
      var serializableHeaders = {};
      this._headersMap.forEach(function(values, name) {
        var list = [];
        collection_1.iterateListLike(values, function(val) {
          return list = collection_1.ListWrapper.concat(list, val.split(','));
        });
        serializableHeaders[name] = list;
      });
      return serializableHeaders;
    };
    Headers.prototype.getAll = function(header) {
      var headers = this._headersMap.get(header);
      return collection_1.isListLikeIterable(headers) ? headers : [];
    };
    Headers.prototype.entries = function() {
      throw new exceptions_1.BaseException('"entries" method is not implemented on Headers class');
    };
    return Headers;
  }());
  exports.Headers = Headers;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/enums", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  (function(RequestMethod) {
    RequestMethod[RequestMethod["Get"] = 0] = "Get";
    RequestMethod[RequestMethod["Post"] = 1] = "Post";
    RequestMethod[RequestMethod["Put"] = 2] = "Put";
    RequestMethod[RequestMethod["Delete"] = 3] = "Delete";
    RequestMethod[RequestMethod["Options"] = 4] = "Options";
    RequestMethod[RequestMethod["Head"] = 5] = "Head";
    RequestMethod[RequestMethod["Patch"] = 6] = "Patch";
  })(exports.RequestMethod || (exports.RequestMethod = {}));
  var RequestMethod = exports.RequestMethod;
  (function(ReadyState) {
    ReadyState[ReadyState["Unsent"] = 0] = "Unsent";
    ReadyState[ReadyState["Open"] = 1] = "Open";
    ReadyState[ReadyState["HeadersReceived"] = 2] = "HeadersReceived";
    ReadyState[ReadyState["Loading"] = 3] = "Loading";
    ReadyState[ReadyState["Done"] = 4] = "Done";
    ReadyState[ReadyState["Cancelled"] = 5] = "Cancelled";
  })(exports.ReadyState || (exports.ReadyState = {}));
  var ReadyState = exports.ReadyState;
  (function(ResponseType) {
    ResponseType[ResponseType["Basic"] = 0] = "Basic";
    ResponseType[ResponseType["Cors"] = 1] = "Cors";
    ResponseType[ResponseType["Default"] = 2] = "Default";
    ResponseType[ResponseType["Error"] = 3] = "Error";
    ResponseType[ResponseType["Opaque"] = 4] = "Opaque";
  })(exports.ResponseType || (exports.ResponseType = {}));
  var ResponseType = exports.ResponseType;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/http_utils", ["angular2/src/facade/lang", "angular2/src/http/enums", "angular2/src/facade/exceptions", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var enums_1 = require("angular2/src/http/enums");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  function normalizeMethodName(method) {
    if (lang_1.isString(method)) {
      var originalMethod = method;
      method = method.replace(/(\w)(\w*)/g, function(g0, g1, g2) {
        return g1.toUpperCase() + g2.toLowerCase();
      });
      method = enums_1.RequestMethod[method];
      if (typeof method !== 'number')
        throw exceptions_1.makeTypeError("Invalid request method. The method \"" + originalMethod + "\" is not supported.");
    }
    return method;
  }
  exports.normalizeMethodName = normalizeMethodName;
  exports.isSuccess = function(status) {
    return (status >= 200 && status < 300);
  };
  function getResponseURL(xhr) {
    if ('responseURL' in xhr) {
      return xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
      return xhr.getResponseHeader('X-Request-URL');
    }
    return ;
  }
  exports.getResponseURL = getResponseURL;
  var lang_2 = require("angular2/src/facade/lang");
  exports.isJsObject = lang_2.isJsObject;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/static_request", ["angular2/src/http/headers", "angular2/src/http/http_utils", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var headers_1 = require("angular2/src/http/headers");
  var http_utils_1 = require("angular2/src/http/http_utils");
  var lang_1 = require("angular2/src/facade/lang");
  var Request = (function() {
    function Request(requestOptions) {
      var url = requestOptions.url;
      this.url = requestOptions.url;
      if (lang_1.isPresent(requestOptions.search)) {
        var search = requestOptions.search.toString();
        if (search.length > 0) {
          var prefix = '?';
          if (lang_1.StringWrapper.contains(this.url, '?')) {
            prefix = (this.url[this.url.length - 1] == '&') ? '' : '&';
          }
          this.url = url + prefix + search;
        }
      }
      this._body = requestOptions.body;
      this.method = http_utils_1.normalizeMethodName(requestOptions.method);
      this.headers = new headers_1.Headers(requestOptions.headers);
    }
    Request.prototype.text = function() {
      return lang_1.isPresent(this._body) ? this._body.toString() : '';
    };
    return Request;
  }());
  exports.Request = Request;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/http/backends/mock_backend", ["angular2/core", "angular2/src/http/static_request", "angular2/src/http/enums", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "rxjs/Subject", "rxjs/ReplaySubject", "rxjs/operator/take"], true, function(require, exports, module) {
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
  var static_request_1 = require("angular2/src/http/static_request");
  var enums_1 = require("angular2/src/http/enums");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var Subject_1 = require("rxjs/Subject");
  var ReplaySubject_1 = require("rxjs/ReplaySubject");
  var take_1 = require("rxjs/operator/take");
  var MockConnection = (function() {
    function MockConnection(req) {
      this.response = take_1.take.call(new ReplaySubject_1.ReplaySubject(1), 1);
      this.readyState = enums_1.ReadyState.Open;
      this.request = req;
    }
    MockConnection.prototype.mockRespond = function(res) {
      if (this.readyState === enums_1.ReadyState.Done || this.readyState === enums_1.ReadyState.Cancelled) {
        throw new exceptions_1.BaseException('Connection has already been resolved');
      }
      this.readyState = enums_1.ReadyState.Done;
      this.response.next(res);
      this.response.complete();
    };
    MockConnection.prototype.mockDownload = function(res) {};
    MockConnection.prototype.mockError = function(err) {
      this.readyState = enums_1.ReadyState.Done;
      this.response.error(err);
    };
    return MockConnection;
  }());
  exports.MockConnection = MockConnection;
  var MockBackend = (function() {
    function MockBackend() {
      var _this = this;
      this.connectionsArray = [];
      this.connections = new Subject_1.Subject();
      this.connections.subscribe(function(connection) {
        return _this.connectionsArray.push(connection);
      });
      this.pendingConnections = new Subject_1.Subject();
    }
    MockBackend.prototype.verifyNoPendingRequests = function() {
      var pending = 0;
      this.pendingConnections.subscribe(function(c) {
        return pending++;
      });
      if (pending > 0)
        throw new exceptions_1.BaseException(pending + " pending connections to be resolved");
    };
    MockBackend.prototype.resolveAllConnections = function() {
      this.connections.subscribe(function(c) {
        return c.readyState = 4;
      });
    };
    MockBackend.prototype.createConnection = function(req) {
      if (!lang_1.isPresent(req) || !(req instanceof static_request_1.Request)) {
        throw new exceptions_1.BaseException("createConnection requires an instance of Request, got " + req);
      }
      var connection = new MockConnection(req);
      this.connections.next(connection);
      return connection;
    };
    MockBackend = __decorate([core_1.Injectable(), __metadata('design:paramtypes', [])], MockBackend);
    return MockBackend;
  }());
  exports.MockBackend = MockBackend;
  global.define = __define;
  return module.exports;
});

System.register("angular2/http/testing", ["angular2/src/http/backends/mock_backend"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  __export(require("angular2/src/http/backends/mock_backend"));
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/async", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function async(fn) {
    return function() {
      return new Promise(function(finishCallback, failCallback) {
        var AsyncTestZoneSpec = Zone['AsyncTestZoneSpec'];
        var testZoneSpec = new AsyncTestZoneSpec(finishCallback, failCallback, 'test');
        var testZone = Zone.current.fork(testZoneSpec);
        return testZone.run(fn);
      });
    };
  }
  exports.async = async;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/async_test_completer", ["angular2/src/facade/promise"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var promise_1 = require("angular2/src/facade/promise");
  var AsyncTestCompleter = (function() {
    function AsyncTestCompleter() {
      this._completer = new promise_1.PromiseCompleter();
    }
    AsyncTestCompleter.prototype.done = function(value) {
      this._completer.resolve(value);
    };
    AsyncTestCompleter.prototype.fail = function(error, stackTrace) {
      this._completer.reject(error, stackTrace);
    };
    Object.defineProperty(AsyncTestCompleter.prototype, "promise", {
      get: function() {
        return this._completer.promise;
      },
      enumerable: true,
      configurable: true
    });
    return AsyncTestCompleter;
  }());
  exports.AsyncTestCompleter = AsyncTestCompleter;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/compiler/xhr_mock", ["angular2/src/compiler/xhr", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/async"], true, function(require, exports, module) {
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
  var xhr_1 = require("angular2/src/compiler/xhr");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var async_1 = require("angular2/src/facade/async");
  var MockXHR = (function(_super) {
    __extends(MockXHR, _super);
    function MockXHR() {
      _super.apply(this, arguments);
      this._expectations = [];
      this._definitions = new collection_1.Map();
      this._requests = [];
    }
    MockXHR.prototype.get = function(url) {
      var request = new _PendingRequest(url);
      this._requests.push(request);
      return request.getPromise();
    };
    MockXHR.prototype.expect = function(url, response) {
      var expectation = new _Expectation(url, response);
      this._expectations.push(expectation);
    };
    MockXHR.prototype.when = function(url, response) {
      this._definitions.set(url, response);
    };
    MockXHR.prototype.flush = function() {
      if (this._requests.length === 0) {
        throw new exceptions_1.BaseException('No pending requests to flush');
      }
      do {
        this._processRequest(this._requests.shift());
      } while (this._requests.length > 0);
      this.verifyNoOutstandingExpectations();
    };
    MockXHR.prototype.verifyNoOutstandingExpectations = function() {
      if (this._expectations.length === 0)
        return ;
      var urls = [];
      for (var i = 0; i < this._expectations.length; i++) {
        var expectation = this._expectations[i];
        urls.push(expectation.url);
      }
      throw new exceptions_1.BaseException("Unsatisfied requests: " + urls.join(', '));
    };
    MockXHR.prototype._processRequest = function(request) {
      var url = request.url;
      if (this._expectations.length > 0) {
        var expectation = this._expectations[0];
        if (expectation.url == url) {
          collection_1.ListWrapper.remove(this._expectations, expectation);
          request.complete(expectation.response);
          return ;
        }
      }
      if (this._definitions.has(url)) {
        var response = this._definitions.get(url);
        request.complete(lang_1.normalizeBlank(response));
        return ;
      }
      throw new exceptions_1.BaseException("Unexpected request " + url);
    };
    return MockXHR;
  }(xhr_1.XHR));
  exports.MockXHR = MockXHR;
  var _PendingRequest = (function() {
    function _PendingRequest(url) {
      this.url = url;
      this.completer = async_1.PromiseWrapper.completer();
    }
    _PendingRequest.prototype.complete = function(response) {
      if (lang_1.isBlank(response)) {
        this.completer.reject("Failed to load " + this.url, null);
      } else {
        this.completer.resolve(response);
      }
    };
    _PendingRequest.prototype.getPromise = function() {
      return this.completer.promise;
    };
    return _PendingRequest;
  }());
  var _Expectation = (function() {
    function _Expectation(url, response) {
      this.url = url;
      this.response = response;
    }
    return _Expectation;
  }());
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/mock_application_ref", ["angular2/src/core/application_ref", "angular2/src/core/di"], true, function(require, exports, module) {
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
  var application_ref_1 = require("angular2/src/core/application_ref");
  var di_1 = require("angular2/src/core/di");
  var MockApplicationRef = (function(_super) {
    __extends(MockApplicationRef, _super);
    function MockApplicationRef() {
      _super.apply(this, arguments);
    }
    MockApplicationRef.prototype.registerBootstrapListener = function(listener) {};
    MockApplicationRef.prototype.registerDisposeListener = function(dispose) {};
    MockApplicationRef.prototype.bootstrap = function(componentFactory) {
      return null;
    };
    Object.defineProperty(MockApplicationRef.prototype, "injector", {
      get: function() {
        return null;
      },
      enumerable: true,
      configurable: true
    });
    ;
    Object.defineProperty(MockApplicationRef.prototype, "zone", {
      get: function() {
        return null;
      },
      enumerable: true,
      configurable: true
    });
    ;
    MockApplicationRef.prototype.run = function(callback) {
      return null;
    };
    MockApplicationRef.prototype.waitForAsyncInitializers = function() {
      return null;
    };
    MockApplicationRef.prototype.dispose = function() {};
    MockApplicationRef.prototype.tick = function() {};
    Object.defineProperty(MockApplicationRef.prototype, "componentTypes", {
      get: function() {
        return null;
      },
      enumerable: true,
      configurable: true
    });
    ;
    MockApplicationRef = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], MockApplicationRef);
    return MockApplicationRef;
  }(application_ref_1.ApplicationRef));
  exports.MockApplicationRef = MockApplicationRef;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/matchers", ["angular2/src/platform/dom/dom_adapter", "angular2/src/facade/lang", "angular2/src/facade/collection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
  var lang_1 = require("angular2/src/facade/lang");
  var collection_1 = require("angular2/src/facade/collection");
  var _global = (typeof window === 'undefined' ? lang_1.global : window);
  exports.expect = _global.expect;
  Map.prototype['jasmineToString'] = function() {
    var m = this;
    if (!m) {
      return '' + m;
    }
    var res = [];
    m.forEach(function(v, k) {
      res.push(k + ":" + v);
    });
    return "{ " + res.join(',') + " }";
  };
  _global.beforeEach(function() {
    jasmine.addMatchers({
      toEqual: function(util, customEqualityTesters) {
        return {compare: function(actual, expected) {
            return {pass: util.equals(actual, expected, [compareMap])};
          }};
        function compareMap(actual, expected) {
          if (actual instanceof Map) {
            var pass = actual.size === expected.size;
            if (pass) {
              actual.forEach(function(v, k) {
                pass = pass && util.equals(v, expected.get(k));
              });
            }
            return pass;
          } else {
            return undefined;
          }
        }
      },
      toBePromise: function() {
        return {compare: function(actual, expectedClass) {
            var pass = typeof actual === 'object' && typeof actual.then === 'function';
            return {
              pass: pass,
              get message() {
                return 'Expected ' + actual + ' to be a promise';
              }
            };
          }};
      },
      toBeAnInstanceOf: function() {
        return {compare: function(actual, expectedClass) {
            var pass = typeof actual === 'object' && actual instanceof expectedClass;
            return {
              pass: pass,
              get message() {
                return 'Expected ' + actual + ' to be an instance of ' + expectedClass;
              }
            };
          }};
      },
      toHaveText: function() {
        return {compare: function(actual, expectedText) {
            var actualText = elementText(actual);
            return {
              pass: actualText == expectedText,
              get message() {
                return 'Expected ' + actualText + ' to be equal to ' + expectedText;
              }
            };
          }};
      },
      toHaveCssClass: function() {
        return {
          compare: buildError(false),
          negativeCompare: buildError(true)
        };
        function buildError(isNot) {
          return function(actual, className) {
            return {
              pass: dom_adapter_1.DOM.hasClass(actual, className) == !isNot,
              get message() {
                return "Expected " + actual.outerHTML + " " + (isNot ? 'not ' : '') + "to contain the CSS class \"" + className + "\"";
              }
            };
          };
        }
      },
      toHaveCssStyle: function() {
        return {compare: function(actual, styles) {
            var allPassed;
            if (lang_1.isString(styles)) {
              allPassed = dom_adapter_1.DOM.hasStyle(actual, styles);
            } else {
              allPassed = !collection_1.StringMapWrapper.isEmpty(styles);
              collection_1.StringMapWrapper.forEach(styles, function(style, prop) {
                allPassed = allPassed && dom_adapter_1.DOM.hasStyle(actual, prop, style);
              });
            }
            return {
              pass: allPassed,
              get message() {
                var expectedValueStr = lang_1.isString(styles) ? styles : JSON.stringify(styles);
                return "Expected " + actual.outerHTML + " " + (!allPassed ? ' ' : 'not ') + "to contain the\n                      CSS " + (lang_1.isString(styles) ? 'property' : 'styles') + " \"" + expectedValueStr + "\"";
              }
            };
          }};
      },
      toContainError: function() {
        return {compare: function(actual, expectedText) {
            var errorMessage = actual.toString();
            return {
              pass: errorMessage.indexOf(expectedText) > -1,
              get message() {
                return 'Expected ' + errorMessage + ' to contain ' + expectedText;
              }
            };
          }};
      },
      toThrowErrorWith: function() {
        return {compare: function(actual, expectedText) {
            try {
              actual();
              return {
                pass: false,
                get message() {
                  return "Was expected to throw, but did not throw";
                }
              };
            } catch (e) {
              var errorMessage = e.toString();
              return {
                pass: errorMessage.indexOf(expectedText) > -1,
                get message() {
                  return 'Expected ' + errorMessage + ' to contain ' + expectedText;
                }
              };
            }
          }};
      },
      toMatchPattern: function() {
        return {
          compare: buildError(false),
          negativeCompare: buildError(true)
        };
        function buildError(isNot) {
          return function(actual, regex) {
            return {
              pass: regex.test(actual) == !isNot,
              get message() {
                return "Expected " + actual + " " + (isNot ? 'not ' : '') + "to match " + regex.toString();
              }
            };
          };
        }
      },
      toImplement: function() {
        return {compare: function(actualObject, expectedInterface) {
            var objProps = Object.keys(actualObject.constructor.prototype);
            var intProps = Object.keys(expectedInterface.prototype);
            var missedMethods = [];
            intProps.forEach(function(k) {
              if (!actualObject.constructor.prototype[k])
                missedMethods.push(k);
            });
            return {
              pass: missedMethods.length == 0,
              get message() {
                return 'Expected ' + actualObject + ' to have the following methods: ' + missedMethods.join(", ");
              }
            };
          }};
      }
    });
  });
  function elementText(n) {
    var hasNodes = function(n) {
      var children = dom_adapter_1.DOM.childNodes(n);
      return children && children.length > 0;
    };
    if (n instanceof Array) {
      return n.map(elementText).join("");
    }
    if (dom_adapter_1.DOM.isCommentNode(n)) {
      return '';
    }
    if (dom_adapter_1.DOM.isElementNode(n) && dom_adapter_1.DOM.tagName(n) == 'CONTENT') {
      return elementText(Array.prototype.slice.apply(dom_adapter_1.DOM.getDistributedNodes(n)));
    }
    if (dom_adapter_1.DOM.hasShadowRoot(n)) {
      return elementText(dom_adapter_1.DOM.childNodesAsList(dom_adapter_1.DOM.getShadowRoot(n)));
    }
    if (hasNodes(n)) {
      return elementText(dom_adapter_1.DOM.childNodesAsList(n));
    }
    return dom_adapter_1.DOM.getText(n);
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/test_injector", ["angular2/core", "angular2/src/facade/exceptions", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/testing/async", "angular2/src/testing/async_test_completer", "angular2/src/testing/async"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var async_1 = require("angular2/src/testing/async");
  var async_test_completer_1 = require("angular2/src/testing/async_test_completer");
  var async_2 = require("angular2/src/testing/async");
  exports.async = async_2.async;
  var TestInjector = (function() {
    function TestInjector() {
      this._instantiated = false;
      this._injector = null;
      this._providers = [];
      this.platformProviders = [];
      this.applicationProviders = [];
    }
    TestInjector.prototype.reset = function() {
      this._injector = null;
      this._providers = [];
      this._instantiated = false;
    };
    TestInjector.prototype.addProviders = function(providers) {
      if (this._instantiated) {
        throw new exceptions_1.BaseException('Cannot add providers after test injector is instantiated');
      }
      this._providers = collection_1.ListWrapper.concat(this._providers, providers);
    };
    TestInjector.prototype.createInjector = function() {
      var rootInjector = core_1.ReflectiveInjector.resolveAndCreate(this.platformProviders);
      this._injector = rootInjector.resolveAndCreateChild(collection_1.ListWrapper.concat(this.applicationProviders, this._providers));
      this._instantiated = true;
      return this._injector;
    };
    TestInjector.prototype.get = function(token) {
      if (!this._instantiated) {
        this.createInjector();
      }
      return this._injector.get(token);
    };
    TestInjector.prototype.execute = function(tokens, fn) {
      var _this = this;
      if (!this._instantiated) {
        this.createInjector();
      }
      var params = tokens.map(function(t) {
        return _this._injector.get(t);
      });
      return lang_1.FunctionWrapper.apply(fn, params);
    };
    return TestInjector;
  }());
  exports.TestInjector = TestInjector;
  var _testInjector = null;
  function getTestInjector() {
    if (_testInjector == null) {
      _testInjector = new TestInjector();
    }
    return _testInjector;
  }
  exports.getTestInjector = getTestInjector;
  function setBaseTestProviders(platformProviders, applicationProviders) {
    var testInjector = getTestInjector();
    if (testInjector.platformProviders.length > 0 || testInjector.applicationProviders.length > 0) {
      throw new exceptions_1.BaseException('Cannot set base providers because it has already been called');
    }
    testInjector.platformProviders = platformProviders;
    testInjector.applicationProviders = applicationProviders;
    var injector = testInjector.createInjector();
    var inits = injector.get(core_1.PLATFORM_INITIALIZER, null);
    if (lang_1.isPresent(inits)) {
      inits.forEach(function(init) {
        return init();
      });
    }
    testInjector.reset();
  }
  exports.setBaseTestProviders = setBaseTestProviders;
  function resetBaseTestProviders() {
    var testInjector = getTestInjector();
    testInjector.platformProviders = [];
    testInjector.applicationProviders = [];
    testInjector.reset();
  }
  exports.resetBaseTestProviders = resetBaseTestProviders;
  function inject(tokens, fn) {
    var testInjector = getTestInjector();
    if (tokens.indexOf(async_test_completer_1.AsyncTestCompleter) >= 0) {
      return function() {
        var completer = testInjector.get(async_test_completer_1.AsyncTestCompleter);
        testInjector.execute(tokens, fn);
        return completer.promise;
      };
    } else {
      return function() {
        return getTestInjector().execute(tokens, fn);
      };
    }
  }
  exports.inject = inject;
  var InjectSetupWrapper = (function() {
    function InjectSetupWrapper(_providers) {
      this._providers = _providers;
    }
    InjectSetupWrapper.prototype._addProviders = function() {
      var additionalProviders = this._providers();
      if (additionalProviders.length > 0) {
        getTestInjector().addProviders(additionalProviders);
      }
    };
    InjectSetupWrapper.prototype.inject = function(tokens, fn) {
      var _this = this;
      return function() {
        _this._addProviders();
        return inject_impl(tokens, fn)();
      };
    };
    InjectSetupWrapper.prototype.injectAsync = function(tokens, fn) {
      var _this = this;
      return function() {
        _this._addProviders();
        return injectAsync_impl(tokens, fn)();
      };
    };
    return InjectSetupWrapper;
  }());
  exports.InjectSetupWrapper = InjectSetupWrapper;
  function withProviders(providers) {
    return new InjectSetupWrapper(providers);
  }
  exports.withProviders = withProviders;
  function injectAsync(tokens, fn) {
    return async_1.async(inject(tokens, fn));
  }
  exports.injectAsync = injectAsync;
  var inject_impl = inject;
  var injectAsync_impl = injectAsync;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/testing", ["angular2/src/facade/lang", "angular2/src/testing/test_injector", "angular2/src/testing/test_injector", "angular2/src/testing/matchers"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var lang_1 = require("angular2/src/facade/lang");
  var test_injector_1 = require("angular2/src/testing/test_injector");
  var test_injector_2 = require("angular2/src/testing/test_injector");
  exports.inject = test_injector_2.inject;
  exports.async = test_injector_2.async;
  exports.injectAsync = test_injector_2.injectAsync;
  var matchers_1 = require("angular2/src/testing/matchers");
  exports.expect = matchers_1.expect;
  var _global = (typeof window === 'undefined' ? lang_1.global : window);
  exports.afterEach = _global.afterEach;
  exports.describe = _global.describe;
  exports.ddescribe = _global.fdescribe;
  exports.fdescribe = _global.fdescribe;
  exports.xdescribe = _global.xdescribe;
  var jsmBeforeEach = _global.beforeEach;
  var jsmIt = _global.it;
  var jsmIIt = _global.fit;
  var jsmXIt = _global.xit;
  var testInjector = test_injector_1.getTestInjector();
  jsmBeforeEach(function() {
    testInjector.reset();
  });
  function beforeEachProviders(fn) {
    jsmBeforeEach(function() {
      var providers = fn();
      if (!providers)
        return ;
      try {
        testInjector.addProviders(providers);
      } catch (e) {
        throw new Error('beforeEachProviders was called after the injector had ' + 'been used in a beforeEach or it block. This invalidates the ' + 'test injector');
      }
    });
  }
  exports.beforeEachProviders = beforeEachProviders;
  function _wrapTestFn(fn) {
    return function(done) {
      if (fn.length === 0) {
        var retVal = fn();
        if (lang_1.isPromise(retVal)) {
          retVal.then(done, done.fail);
        } else {
          done();
        }
      } else {
        fn(done);
      }
    };
  }
  function _it(jsmFn, name, testFn, testTimeOut) {
    jsmFn(name, _wrapTestFn(testFn), testTimeOut);
  }
  function beforeEach(fn) {
    jsmBeforeEach(_wrapTestFn(fn));
  }
  exports.beforeEach = beforeEach;
  function it(name, fn, timeOut) {
    if (timeOut === void 0) {
      timeOut = null;
    }
    return _it(jsmIt, name, fn, timeOut);
  }
  exports.it = it;
  function xit(name, fn, timeOut) {
    if (timeOut === void 0) {
      timeOut = null;
    }
    return _it(jsmXIt, name, fn, timeOut);
  }
  exports.xit = xit;
  function iit(name, fn, timeOut) {
    if (timeOut === void 0) {
      timeOut = null;
    }
    return _it(jsmIIt, name, fn, timeOut);
  }
  exports.iit = iit;
  function fit(name, fn, timeOut) {
    if (timeOut === void 0) {
      timeOut = null;
    }
    return _it(jsmIIt, name, fn, timeOut);
  }
  exports.fit = fit;
  global.define = __define;
  return module.exports;
});

System.register("angular2/testing", ["angular2/src/testing/testing", "angular2/src/testing/test_component_builder", "angular2/src/testing/test_injector", "angular2/src/testing/fake_async", "angular2/src/mock/view_resolver_mock", "angular2/src/compiler/xhr_mock", "angular2/src/mock/ng_zone_mock", "angular2/src/mock/mock_application_ref", "angular2/src/mock/directive_resolver_mock"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  __export(require("angular2/src/testing/testing"));
  var test_component_builder_1 = require("angular2/src/testing/test_component_builder");
  exports.ComponentFixture = test_component_builder_1.ComponentFixture;
  exports.TestComponentBuilder = test_component_builder_1.TestComponentBuilder;
  exports.ComponentFixtureAutoDetect = test_component_builder_1.ComponentFixtureAutoDetect;
  exports.ComponentFixtureNoNgZone = test_component_builder_1.ComponentFixtureNoNgZone;
  __export(require("angular2/src/testing/test_injector"));
  __export(require("angular2/src/testing/fake_async"));
  var view_resolver_mock_1 = require("angular2/src/mock/view_resolver_mock");
  exports.MockViewResolver = view_resolver_mock_1.MockViewResolver;
  var xhr_mock_1 = require("angular2/src/compiler/xhr_mock");
  exports.MockXHR = xhr_mock_1.MockXHR;
  var ng_zone_mock_1 = require("angular2/src/mock/ng_zone_mock");
  exports.MockNgZone = ng_zone_mock_1.MockNgZone;
  var mock_application_ref_1 = require("angular2/src/mock/mock_application_ref");
  exports.MockApplicationRef = mock_application_ref_1.MockApplicationRef;
  var directive_resolver_mock_1 = require("angular2/src/mock/directive_resolver_mock");
  exports.MockDirectiveResolver = directive_resolver_mock_1.MockDirectiveResolver;
  global.define = __define;
  return module.exports;
});

//# sourceMappingURL=testing.dev.js.map