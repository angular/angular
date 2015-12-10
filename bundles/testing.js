"format register";
System.register("angular2/src/mock/animation_builder_mock", ["angular2/src/core/di", "angular2/src/animate/animation_builder", "angular2/src/animate/css_animation_builder", "angular2/src/animate/animation", "angular2/src/animate/browser_details"], true, function(require, exports, module) {
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
  })(animation_builder_1.AnimationBuilder);
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
  })(css_animation_builder_1.CssAnimationBuilder);
  var MockBrowserAbstraction = (function(_super) {
    __extends(MockBrowserAbstraction, _super);
    function MockBrowserAbstraction() {
      _super.apply(this, arguments);
    }
    MockBrowserAbstraction.prototype.doesElapsedTimeIncludesDelay = function() {
      this.elapsedTimeIncludesDelay = false;
    };
    return MockBrowserAbstraction;
  })(browser_details_1.BrowserDetails);
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
  })(animation_1.Animation);
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/directive_resolver_mock", ["angular2/src/core/di", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/core/metadata", "angular2/src/core/linker/directive_resolver"], true, function(require, exports, module) {
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
  var directive_resolver_1 = require("angular2/src/core/linker/directive_resolver");
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
        providers = dm.providers.concat(providerOverrides);
      }
      if (dm instanceof metadata_1.ComponentMetadata) {
        var viewProviders = dm.viewProviders;
        if (lang_1.isPresent(viewProviderOverrides)) {
          viewProviders = dm.viewProviders.concat(viewProviderOverrides);
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
        moduleId: dm.moduleId,
        queries: dm.queries
      });
    };
    MockDirectiveResolver.prototype.setBindingsOverride = function(type, bindings) {
      this._providerOverrides.set(type, bindings);
    };
    MockDirectiveResolver.prototype.setViewBindingsOverride = function(type, viewBindings) {
      this.viewProviderOverrides.set(type, viewBindings);
    };
    MockDirectiveResolver.prototype.setProvidersOverride = function(type, bindings) {
      this._providerOverrides.set(type, bindings);
    };
    MockDirectiveResolver.prototype.setViewProvidersOverride = function(type, viewBindings) {
      this.viewProviderOverrides.set(type, viewBindings);
    };
    MockDirectiveResolver = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], MockDirectiveResolver);
    return MockDirectiveResolver;
  })(directive_resolver_1.DirectiveResolver);
  exports.MockDirectiveResolver = MockDirectiveResolver;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/view_resolver_mock", ["angular2/src/core/di", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/core/metadata", "angular2/src/core/linker/view_resolver"], true, function(require, exports, module) {
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
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var metadata_1 = require("angular2/src/core/metadata");
  var view_resolver_1 = require("angular2/src/core/linker/view_resolver");
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
      var directives = view.directives;
      var overrides = this._directiveOverrides.get(component);
      if (lang_1.isPresent(overrides) && lang_1.isPresent(directives)) {
        directives = collection_1.ListWrapper.clone(view.directives);
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
    MockViewResolver = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], MockViewResolver);
    return MockViewResolver;
  })(view_resolver_1.ViewResolver);
  exports.MockViewResolver = MockViewResolver;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/ng_zone_mock", ["angular2/src/core/di", "angular2/src/core/zone/ng_zone", "angular2/src/facade/async"], true, function(require, exports, module) {
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
      this._mockOnEventDone = new async_1.EventEmitter(false);
    }
    Object.defineProperty(MockNgZone.prototype, "onEventDone", {
      get: function() {
        return this._mockOnEventDone;
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
      async_1.ObservableWrapper.callNext(this.onEventDone, null);
    };
    MockNgZone = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], MockNgZone);
    return MockNgZone;
  })(ng_zone_1.NgZone);
  exports.MockNgZone = MockNgZone;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/utils", ["angular2/src/core/di", "angular2/src/facade/collection", "angular2/src/platform/dom/dom_adapter", "angular2/src/facade/lang"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
  var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
  var lang_1 = require("angular2/src/facade/lang");
  var Log = (function() {
    function Log() {
      this._result = [];
    }
    Log.prototype.add = function(value) {
      this._result.push(value);
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
        _this._result.push(value);
      };
    };
    Log.prototype.clear = function() {
      this._result = [];
    };
    Log.prototype.result = function() {
      return this._result.join("; ");
    };
    Log = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [])], Log);
    return Log;
  })();
  exports.Log = Log;
  var BrowserDetection = (function() {
    function BrowserDetection(ua) {
      if (lang_1.isPresent(ua)) {
        this._ua = ua;
      } else {
        this._ua = lang_1.isPresent(dom_adapter_1.DOM) ? dom_adapter_1.DOM.getUserAgent() : '';
      }
    }
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
  })();
  exports.BrowserDetection = BrowserDetection;
  exports.browserDetection = new BrowserDetection(null);
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

System.register("angular2/src/web_workers/shared/api", ["angular2/src/facade/lang", "angular2/src/core/di"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var di_1 = require("angular2/src/core/di");
  exports.ON_WEB_WORKER = lang_1.CONST_EXPR(new di_1.OpaqueToken('WebWorker.onWebWorker'));
  var WebWorkerElementRef = (function() {
    function WebWorkerElementRef(renderView, boundElementIndex) {
      this.renderView = renderView;
      this.boundElementIndex = boundElementIndex;
    }
    return WebWorkerElementRef;
  })();
  exports.WebWorkerElementRef = WebWorkerElementRef;
  var WebWorkerTemplateCmd = (function() {
    function WebWorkerTemplateCmd() {}
    WebWorkerTemplateCmd.prototype.visit = function(visitor, context) {
      return null;
    };
    return WebWorkerTemplateCmd;
  })();
  exports.WebWorkerTemplateCmd = WebWorkerTemplateCmd;
  var WebWorkerTextCmd = (function() {
    function WebWorkerTextCmd(isBound, ngContentIndex, value) {
      this.isBound = isBound;
      this.ngContentIndex = ngContentIndex;
      this.value = value;
    }
    WebWorkerTextCmd.prototype.visit = function(visitor, context) {
      return visitor.visitText(this, context);
    };
    return WebWorkerTextCmd;
  })();
  exports.WebWorkerTextCmd = WebWorkerTextCmd;
  var WebWorkerNgContentCmd = (function() {
    function WebWorkerNgContentCmd(index, ngContentIndex) {
      this.index = index;
      this.ngContentIndex = ngContentIndex;
    }
    WebWorkerNgContentCmd.prototype.visit = function(visitor, context) {
      return visitor.visitNgContent(this, context);
    };
    return WebWorkerNgContentCmd;
  })();
  exports.WebWorkerNgContentCmd = WebWorkerNgContentCmd;
  var WebWorkerBeginElementCmd = (function() {
    function WebWorkerBeginElementCmd(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames) {
      this.isBound = isBound;
      this.ngContentIndex = ngContentIndex;
      this.name = name;
      this.attrNameAndValues = attrNameAndValues;
      this.eventTargetAndNames = eventTargetAndNames;
    }
    WebWorkerBeginElementCmd.prototype.visit = function(visitor, context) {
      return visitor.visitBeginElement(this, context);
    };
    return WebWorkerBeginElementCmd;
  })();
  exports.WebWorkerBeginElementCmd = WebWorkerBeginElementCmd;
  var WebWorkerEndElementCmd = (function() {
    function WebWorkerEndElementCmd() {}
    WebWorkerEndElementCmd.prototype.visit = function(visitor, context) {
      return visitor.visitEndElement(context);
    };
    return WebWorkerEndElementCmd;
  })();
  exports.WebWorkerEndElementCmd = WebWorkerEndElementCmd;
  var WebWorkerBeginComponentCmd = (function() {
    function WebWorkerBeginComponentCmd(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames, templateId) {
      this.isBound = isBound;
      this.ngContentIndex = ngContentIndex;
      this.name = name;
      this.attrNameAndValues = attrNameAndValues;
      this.eventTargetAndNames = eventTargetAndNames;
      this.templateId = templateId;
    }
    WebWorkerBeginComponentCmd.prototype.visit = function(visitor, context) {
      return visitor.visitBeginComponent(this, context);
    };
    return WebWorkerBeginComponentCmd;
  })();
  exports.WebWorkerBeginComponentCmd = WebWorkerBeginComponentCmd;
  var WebWorkerEndComponentCmd = (function() {
    function WebWorkerEndComponentCmd() {}
    WebWorkerEndComponentCmd.prototype.visit = function(visitor, context) {
      return visitor.visitEndComponent(context);
    };
    return WebWorkerEndComponentCmd;
  })();
  exports.WebWorkerEndComponentCmd = WebWorkerEndComponentCmd;
  var WebWorkerEmbeddedTemplateCmd = (function() {
    function WebWorkerEmbeddedTemplateCmd(isBound, ngContentIndex, name, attrNameAndValues, eventTargetAndNames, isMerged, children) {
      this.isBound = isBound;
      this.ngContentIndex = ngContentIndex;
      this.name = name;
      this.attrNameAndValues = attrNameAndValues;
      this.eventTargetAndNames = eventTargetAndNames;
      this.isMerged = isMerged;
      this.children = children;
    }
    WebWorkerEmbeddedTemplateCmd.prototype.visit = function(visitor, context) {
      return visitor.visitEmbeddedTemplate(this, context);
    };
    return WebWorkerEmbeddedTemplateCmd;
  })();
  exports.WebWorkerEmbeddedTemplateCmd = WebWorkerEmbeddedTemplateCmd;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/web_workers/shared/render_proto_view_ref_store", ["angular2/src/core/di", "angular2/src/core/render/api", "angular2/src/web_workers/shared/api"], true, function(require, exports, module) {
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
  var di_1 = require("angular2/src/core/di");
  var api_1 = require("angular2/src/core/render/api");
  var api_2 = require("angular2/src/web_workers/shared/api");
  var RenderProtoViewRefStore = (function() {
    function RenderProtoViewRefStore(onWebworker) {
      this._lookupByIndex = new Map();
      this._lookupByProtoView = new Map();
      this._nextIndex = 0;
      this._onWebworker = onWebworker;
    }
    RenderProtoViewRefStore.prototype.allocate = function() {
      var index = this._nextIndex++;
      var result = new WebWorkerRenderProtoViewRef(index);
      this.store(result, index);
      return result;
    };
    RenderProtoViewRefStore.prototype.store = function(ref, index) {
      this._lookupByProtoView.set(ref, index);
      this._lookupByIndex.set(index, ref);
    };
    RenderProtoViewRefStore.prototype.deserialize = function(index) {
      if (index == null) {
        return null;
      }
      return this._lookupByIndex.get(index);
    };
    RenderProtoViewRefStore.prototype.serialize = function(ref) {
      if (ref == null) {
        return null;
      }
      if (this._onWebworker) {
        return ref.refNumber;
      } else {
        return this._lookupByProtoView.get(ref);
      }
    };
    RenderProtoViewRefStore = __decorate([di_1.Injectable(), __param(0, di_1.Inject(api_2.ON_WEB_WORKER)), __metadata('design:paramtypes', [Object])], RenderProtoViewRefStore);
    return RenderProtoViewRefStore;
  })();
  exports.RenderProtoViewRefStore = RenderProtoViewRefStore;
  var WebWorkerRenderProtoViewRef = (function(_super) {
    __extends(WebWorkerRenderProtoViewRef, _super);
    function WebWorkerRenderProtoViewRef(refNumber) {
      _super.call(this);
      this.refNumber = refNumber;
    }
    return WebWorkerRenderProtoViewRef;
  })(api_1.RenderProtoViewRef);
  exports.WebWorkerRenderProtoViewRef = WebWorkerRenderProtoViewRef;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/web_workers/shared/render_view_with_fragments_store", ["angular2/src/core/di", "angular2/src/core/render/api", "angular2/src/web_workers/shared/api", "angular2/src/facade/collection"], true, function(require, exports, module) {
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
  var di_1 = require("angular2/src/core/di");
  var api_1 = require("angular2/src/core/render/api");
  var api_2 = require("angular2/src/web_workers/shared/api");
  var collection_1 = require("angular2/src/facade/collection");
  var RenderViewWithFragmentsStore = (function() {
    function RenderViewWithFragmentsStore(onWebWorker) {
      this._nextIndex = 0;
      this._onWebWorker = onWebWorker;
      this._lookupByIndex = new Map();
      this._lookupByView = new Map();
      this._viewFragments = new Map();
    }
    RenderViewWithFragmentsStore.prototype.allocate = function(fragmentCount) {
      var initialIndex = this._nextIndex;
      var viewRef = new WebWorkerRenderViewRef(this._nextIndex++);
      var fragmentRefs = collection_1.ListWrapper.createGrowableSize(fragmentCount);
      for (var i = 0; i < fragmentCount; i++) {
        fragmentRefs[i] = new WebWorkerRenderFragmentRef(this._nextIndex++);
      }
      var renderViewWithFragments = new api_1.RenderViewWithFragments(viewRef, fragmentRefs);
      this.store(renderViewWithFragments, initialIndex);
      return renderViewWithFragments;
    };
    RenderViewWithFragmentsStore.prototype.store = function(view, startIndex) {
      var _this = this;
      this._lookupByIndex.set(startIndex, view.viewRef);
      this._lookupByView.set(view.viewRef, startIndex);
      startIndex++;
      view.fragmentRefs.forEach(function(ref) {
        _this._lookupByIndex.set(startIndex, ref);
        _this._lookupByView.set(ref, startIndex);
        startIndex++;
      });
      this._viewFragments.set(view.viewRef, view.fragmentRefs);
    };
    RenderViewWithFragmentsStore.prototype.remove = function(view) {
      var _this = this;
      this._removeRef(view);
      var fragments = this._viewFragments.get(view);
      fragments.forEach(function(fragment) {
        _this._removeRef(fragment);
      });
      this._viewFragments.delete(view);
    };
    RenderViewWithFragmentsStore.prototype._removeRef = function(ref) {
      var index = this._lookupByView.get(ref);
      this._lookupByView.delete(ref);
      this._lookupByIndex.delete(index);
    };
    RenderViewWithFragmentsStore.prototype.serializeRenderViewRef = function(viewRef) {
      return this._serializeRenderFragmentOrViewRef(viewRef);
    };
    RenderViewWithFragmentsStore.prototype.serializeRenderFragmentRef = function(fragmentRef) {
      return this._serializeRenderFragmentOrViewRef(fragmentRef);
    };
    RenderViewWithFragmentsStore.prototype.deserializeRenderViewRef = function(ref) {
      if (ref == null) {
        return null;
      }
      return this._retrieve(ref);
    };
    RenderViewWithFragmentsStore.prototype.deserializeRenderFragmentRef = function(ref) {
      if (ref == null) {
        return null;
      }
      return this._retrieve(ref);
    };
    RenderViewWithFragmentsStore.prototype._retrieve = function(ref) {
      if (ref == null) {
        return null;
      }
      if (!this._lookupByIndex.has(ref)) {
        return null;
      }
      return this._lookupByIndex.get(ref);
    };
    RenderViewWithFragmentsStore.prototype._serializeRenderFragmentOrViewRef = function(ref) {
      if (ref == null) {
        return null;
      }
      if (this._onWebWorker) {
        return ref.serialize();
      } else {
        return this._lookupByView.get(ref);
      }
    };
    RenderViewWithFragmentsStore.prototype.serializeViewWithFragments = function(view) {
      var _this = this;
      if (view == null) {
        return null;
      }
      if (this._onWebWorker) {
        return {
          'viewRef': view.viewRef.serialize(),
          'fragmentRefs': view.fragmentRefs.map(function(val) {
            return val.serialize();
          })
        };
      } else {
        return {
          'viewRef': this._lookupByView.get(view.viewRef),
          'fragmentRefs': view.fragmentRefs.map(function(val) {
            return _this._lookupByView.get(val);
          })
        };
      }
    };
    RenderViewWithFragmentsStore.prototype.deserializeViewWithFragments = function(obj) {
      var _this = this;
      if (obj == null) {
        return null;
      }
      var viewRef = this.deserializeRenderViewRef(obj['viewRef']);
      var fragments = obj['fragmentRefs'].map(function(val) {
        return _this.deserializeRenderFragmentRef(val);
      });
      return new api_1.RenderViewWithFragments(viewRef, fragments);
    };
    RenderViewWithFragmentsStore = __decorate([di_1.Injectable(), __param(0, di_1.Inject(api_2.ON_WEB_WORKER)), __metadata('design:paramtypes', [Object])], RenderViewWithFragmentsStore);
    return RenderViewWithFragmentsStore;
  })();
  exports.RenderViewWithFragmentsStore = RenderViewWithFragmentsStore;
  var WebWorkerRenderViewRef = (function(_super) {
    __extends(WebWorkerRenderViewRef, _super);
    function WebWorkerRenderViewRef(refNumber) {
      _super.call(this);
      this.refNumber = refNumber;
    }
    WebWorkerRenderViewRef.prototype.serialize = function() {
      return this.refNumber;
    };
    WebWorkerRenderViewRef.deserialize = function(ref) {
      return new WebWorkerRenderViewRef(ref);
    };
    return WebWorkerRenderViewRef;
  })(api_1.RenderViewRef);
  exports.WebWorkerRenderViewRef = WebWorkerRenderViewRef;
  var WebWorkerRenderFragmentRef = (function(_super) {
    __extends(WebWorkerRenderFragmentRef, _super);
    function WebWorkerRenderFragmentRef(refNumber) {
      _super.call(this);
      this.refNumber = refNumber;
    }
    WebWorkerRenderFragmentRef.prototype.serialize = function() {
      return this.refNumber;
    };
    WebWorkerRenderFragmentRef.deserialize = function(ref) {
      return new WebWorkerRenderFragmentRef(ref);
    };
    return WebWorkerRenderFragmentRef;
  })(api_1.RenderFragmentRef);
  exports.WebWorkerRenderFragmentRef = WebWorkerRenderFragmentRef;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/matchers", ["angular2/src/platform/dom/dom_adapter", "angular2/src/facade/lang", "angular2/src/facade/collection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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

System.register("angular2/src/testing/fake_async", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/collection"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var _scheduler;
  var _microtasks = [];
  var _pendingPeriodicTimers = [];
  var _pendingTimers = [];
  function fakeAsync(fn) {
    if (lang_1.global.zone._inFakeAsyncZone) {
      throw new Error('fakeAsync() calls can not be nested');
    }
    var fakeAsyncZone = lang_1.global.zone.fork({
      setTimeout: _setTimeout,
      clearTimeout: _clearTimeout,
      setInterval: _setInterval,
      clearInterval: _clearInterval,
      scheduleMicrotask: _scheduleMicrotask,
      _inFakeAsyncZone: true
    });
    return function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
      }
      _scheduler = new jasmine.DelayedFunctionScheduler();
      clearPendingTimers();
      var res = fakeAsyncZone.run(function() {
        var res = fn.apply(void 0, args);
        flushMicrotasks();
        return res;
      });
      if (_pendingPeriodicTimers.length > 0) {
        throw new exceptions_1.BaseException(_pendingPeriodicTimers.length + " periodic timer(s) still in the queue.");
      }
      if (_pendingTimers.length > 0) {
        throw new exceptions_1.BaseException(_pendingTimers.length + " timer(s) still in the queue.");
      }
      _scheduler = null;
      collection_1.ListWrapper.clear(_microtasks);
      return res;
    };
  }
  exports.fakeAsync = fakeAsync;
  function clearPendingTimers() {
    collection_1.ListWrapper.clear(_microtasks);
    collection_1.ListWrapper.clear(_pendingPeriodicTimers);
    collection_1.ListWrapper.clear(_pendingTimers);
  }
  exports.clearPendingTimers = clearPendingTimers;
  function tick(millis) {
    if (millis === void 0) {
      millis = 0;
    }
    _assertInFakeAsyncZone();
    flushMicrotasks();
    _scheduler.tick(millis);
  }
  exports.tick = tick;
  function flushMicrotasks() {
    _assertInFakeAsyncZone();
    while (_microtasks.length > 0) {
      var microtask = collection_1.ListWrapper.removeAt(_microtasks, 0);
      microtask();
    }
  }
  exports.flushMicrotasks = flushMicrotasks;
  function _setTimeout(fn, delay) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var cb = _fnAndFlush(fn);
    var id = _scheduler.scheduleFunction(cb, delay, args);
    _pendingTimers.push(id);
    _scheduler.scheduleFunction(_dequeueTimer(id), delay);
    return id;
  }
  function _clearTimeout(id) {
    _dequeueTimer(id);
    return _scheduler.removeFunctionWithId(id);
  }
  function _setInterval(fn, interval) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var cb = _fnAndFlush(fn);
    var id = _scheduler.scheduleFunction(cb, interval, args, true);
    _pendingPeriodicTimers.push(id);
    return id;
  }
  function _clearInterval(id) {
    collection_1.ListWrapper.remove(_pendingPeriodicTimers, id);
    return _scheduler.removeFunctionWithId(id);
  }
  function _fnAndFlush(fn) {
    return function() {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
      }
      fn.apply(lang_1.global, args);
      flushMicrotasks();
    };
  }
  function _scheduleMicrotask(microtask) {
    _microtasks.push(microtask);
  }
  function _dequeueTimer(id) {
    return function() {
      collection_1.ListWrapper.remove(_pendingTimers, id);
    };
  }
  function _assertInFakeAsyncZone() {
    if (!lang_1.global.zone || !lang_1.global.zone._inFakeAsyncZone) {
      throw new Error('The code should be running in the fakeAsync zone to call this function');
    }
  }
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/compiler/xhr_mock", ["angular2/src/compiler/xhr", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/async"], true, function(require, exports, module) {
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
  })(xhr_1.XHR);
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
  })();
  var _Expectation = (function() {
    function _Expectation(url, response) {
      this.url = url;
      this.response = response;
    }
    return _Expectation;
  })();
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/mock_application_ref", ["angular2/src/core/application_ref", "angular2/src/core/di"], true, function(require, exports, module) {
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
    MockApplicationRef.prototype.bootstrap = function(componentType, bindings) {
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
  })(application_ref_1.ApplicationRef);
  exports.MockApplicationRef = MockApplicationRef;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/test_component_builder", ["angular2/src/core/di", "angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/core/linker/directive_resolver", "angular2/src/core/linker/view_resolver", "angular2/src/core/linker/view_ref", "angular2/src/core/linker/dynamic_component_loader", "angular2/src/testing/utils", "angular2/src/platform/dom/dom_tokens", "angular2/src/platform/dom/dom_adapter", "angular2/src/core/debug/debug_element"], true, function(require, exports, module) {
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
  var lang_1 = require("angular2/src/facade/lang");
  var collection_1 = require("angular2/src/facade/collection");
  var directive_resolver_1 = require("angular2/src/core/linker/directive_resolver");
  var view_resolver_1 = require("angular2/src/core/linker/view_resolver");
  var view_ref_1 = require("angular2/src/core/linker/view_ref");
  var dynamic_component_loader_1 = require("angular2/src/core/linker/dynamic_component_loader");
  var utils_1 = require("angular2/src/testing/utils");
  var dom_tokens_1 = require("angular2/src/platform/dom/dom_tokens");
  var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
  var debug_element_1 = require("angular2/src/core/debug/debug_element");
  var ComponentFixture = (function() {
    function ComponentFixture() {}
    return ComponentFixture;
  })();
  exports.ComponentFixture = ComponentFixture;
  var ComponentFixture_ = (function(_super) {
    __extends(ComponentFixture_, _super);
    function ComponentFixture_(componentRef) {
      _super.call(this);
      this.debugElement = new debug_element_1.DebugElement_(view_ref_1.internalView(componentRef.hostView), 0);
      this.componentInstance = this.debugElement.componentInstance;
      this.nativeElement = this.debugElement.nativeElement;
      this._componentParentView = view_ref_1.internalView(componentRef.hostView);
      this._componentRef = componentRef;
    }
    ComponentFixture_.prototype.detectChanges = function() {
      this._componentParentView.changeDetector.detectChanges();
      this._componentParentView.changeDetector.checkNoChanges();
    };
    ComponentFixture_.prototype.destroy = function() {
      this._componentRef.dispose();
    };
    return ComponentFixture_;
  })(ComponentFixture);
  exports.ComponentFixture_ = ComponentFixture_;
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
    TestComponentBuilder.prototype.createAsync = function(rootComponentType) {
      var mockDirectiveResolver = this._injector.get(directive_resolver_1.DirectiveResolver);
      var mockViewResolver = this._injector.get(view_resolver_1.ViewResolver);
      this._viewOverrides.forEach(function(view, type) {
        return mockViewResolver.setView(type, view);
      });
      this._templateOverrides.forEach(function(template, type) {
        return mockViewResolver.setInlineTemplate(type, template);
      });
      this._directiveOverrides.forEach(function(overrides, component) {
        overrides.forEach(function(to, from) {
          mockViewResolver.overrideViewDirective(component, from, to);
        });
      });
      this._bindingsOverrides.forEach(function(bindings, type) {
        return mockDirectiveResolver.setBindingsOverride(type, bindings);
      });
      this._viewBindingsOverrides.forEach(function(bindings, type) {
        return mockDirectiveResolver.setViewBindingsOverride(type, bindings);
      });
      var rootElId = "root" + _nextRootElementId++;
      var rootEl = utils_1.el("<div id=\"" + rootElId + "\"></div>");
      var doc = this._injector.get(dom_tokens_1.DOCUMENT);
      var oldRoots = dom_adapter_1.DOM.querySelectorAll(doc, '[id^=root]');
      for (var i = 0; i < oldRoots.length; i++) {
        dom_adapter_1.DOM.remove(oldRoots[i]);
      }
      dom_adapter_1.DOM.appendChild(doc.body, rootEl);
      return this._injector.get(dynamic_component_loader_1.DynamicComponentLoader).loadAsRoot(rootComponentType, "#" + rootElId, this._injector).then(function(componentRef) {
        return new ComponentFixture_(componentRef);
      });
    };
    TestComponentBuilder = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [di_1.Injector])], TestComponentBuilder);
    return TestComponentBuilder;
  })();
  exports.TestComponentBuilder = TestComponentBuilder;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/web_workers/shared/serializer", ["angular2/src/facade/lang", "angular2/src/facade/exceptions", "angular2/src/facade/collection", "angular2/src/core/render/api", "angular2/src/web_workers/shared/api", "angular2/src/core/di", "angular2/src/web_workers/shared/render_proto_view_ref_store", "angular2/src/web_workers/shared/render_view_with_fragments_store", "angular2/src/core/metadata/view"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
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
  var lang_1 = require("angular2/src/facade/lang");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var collection_1 = require("angular2/src/facade/collection");
  var api_1 = require("angular2/src/core/render/api");
  var api_2 = require("angular2/src/web_workers/shared/api");
  var di_1 = require("angular2/src/core/di");
  var render_proto_view_ref_store_1 = require("angular2/src/web_workers/shared/render_proto_view_ref_store");
  var render_view_with_fragments_store_1 = require("angular2/src/web_workers/shared/render_view_with_fragments_store");
  var view_1 = require("angular2/src/core/metadata/view");
  exports.PRIMITIVE = String;
  var Serializer = (function() {
    function Serializer(_protoViewStore, _renderViewStore) {
      this._protoViewStore = _protoViewStore;
      this._renderViewStore = _renderViewStore;
    }
    Serializer.prototype.serialize = function(obj, type) {
      var _this = this;
      if (!lang_1.isPresent(obj)) {
        return null;
      }
      if (lang_1.isArray(obj)) {
        return obj.map(function(v) {
          return _this.serialize(v, type);
        });
      }
      if (type == exports.PRIMITIVE) {
        return obj;
      }
      if (type == api_1.RenderProtoViewRef) {
        return this._protoViewStore.serialize(obj);
      } else if (type == api_1.RenderViewRef) {
        return this._renderViewStore.serializeRenderViewRef(obj);
      } else if (type == api_1.RenderFragmentRef) {
        return this._renderViewStore.serializeRenderFragmentRef(obj);
      } else if (type == api_2.WebWorkerElementRef) {
        return this._serializeWorkerElementRef(obj);
      } else if (type == api_2.WebWorkerTemplateCmd) {
        return serializeTemplateCmd(obj);
      } else if (type === api_1.RenderComponentTemplate) {
        return this._serializeRenderTemplate(obj);
      } else if (type === view_1.ViewEncapsulation) {
        return lang_1.serializeEnum(obj);
      } else {
        throw new exceptions_1.BaseException("No serializer for " + type.toString());
      }
    };
    Serializer.prototype.deserialize = function(map, type, data) {
      var _this = this;
      if (!lang_1.isPresent(map)) {
        return null;
      }
      if (lang_1.isArray(map)) {
        var obj = [];
        map.forEach(function(val) {
          return obj.push(_this.deserialize(val, type, data));
        });
        return obj;
      }
      if (type == exports.PRIMITIVE) {
        return map;
      }
      if (type == api_1.RenderProtoViewRef) {
        return this._protoViewStore.deserialize(map);
      } else if (type == api_1.RenderViewRef) {
        return this._renderViewStore.deserializeRenderViewRef(map);
      } else if (type == api_1.RenderFragmentRef) {
        return this._renderViewStore.deserializeRenderFragmentRef(map);
      } else if (type == api_2.WebWorkerElementRef) {
        return this._deserializeWorkerElementRef(map);
      } else if (type == api_2.WebWorkerTemplateCmd) {
        return deserializeTemplateCmd(map);
      } else if (type === api_1.RenderComponentTemplate) {
        return this._deserializeRenderTemplate(map);
      } else if (type === view_1.ViewEncapsulation) {
        return view_1.VIEW_ENCAPSULATION_VALUES[map];
      } else {
        throw new exceptions_1.BaseException("No deserializer for " + type.toString());
      }
    };
    Serializer.prototype.mapToObject = function(map, type) {
      var _this = this;
      var object = {};
      var serialize = lang_1.isPresent(type);
      map.forEach(function(value, key) {
        if (serialize) {
          object[key] = _this.serialize(value, type);
        } else {
          object[key] = value;
        }
      });
      return object;
    };
    Serializer.prototype.objectToMap = function(obj, type, data) {
      var _this = this;
      if (lang_1.isPresent(type)) {
        var map = new collection_1.Map();
        collection_1.StringMapWrapper.forEach(obj, function(val, key) {
          map.set(key, _this.deserialize(val, type, data));
        });
        return map;
      } else {
        return collection_1.MapWrapper.createFromStringMap(obj);
      }
    };
    Serializer.prototype.allocateRenderViews = function(fragmentCount) {
      this._renderViewStore.allocate(fragmentCount);
    };
    Serializer.prototype._serializeWorkerElementRef = function(elementRef) {
      return {
        'renderView': this.serialize(elementRef.renderView, api_1.RenderViewRef),
        'boundElementIndex': elementRef.boundElementIndex
      };
    };
    Serializer.prototype._deserializeWorkerElementRef = function(map) {
      return new api_2.WebWorkerElementRef(this.deserialize(map['renderView'], api_1.RenderViewRef), map['boundElementIndex']);
    };
    Serializer.prototype._serializeRenderTemplate = function(obj) {
      return {
        'id': obj.id,
        'shortId': obj.shortId,
        'encapsulation': this.serialize(obj.encapsulation, view_1.ViewEncapsulation),
        'commands': this.serialize(obj.commands, api_2.WebWorkerTemplateCmd),
        'styles': this.serialize(obj.styles, exports.PRIMITIVE)
      };
    };
    Serializer.prototype._deserializeRenderTemplate = function(map) {
      return new api_1.RenderComponentTemplate(map['id'], map['shortId'], this.deserialize(map['encapsulation'], view_1.ViewEncapsulation), this.deserialize(map['commands'], api_2.WebWorkerTemplateCmd), this.deserialize(map['styles'], exports.PRIMITIVE));
    };
    Serializer = __decorate([di_1.Injectable(), __metadata('design:paramtypes', [render_proto_view_ref_store_1.RenderProtoViewRefStore, render_view_with_fragments_store_1.RenderViewWithFragmentsStore])], Serializer);
    return Serializer;
  })();
  exports.Serializer = Serializer;
  function serializeTemplateCmd(cmd) {
    return cmd.visit(RENDER_TEMPLATE_CMD_SERIALIZER, null);
  }
  function deserializeTemplateCmd(data) {
    return RENDER_TEMPLATE_CMD_DESERIALIZERS[data['deserializerIndex']](data);
  }
  var RenderTemplateCmdSerializer = (function() {
    function RenderTemplateCmdSerializer() {}
    RenderTemplateCmdSerializer.prototype.visitText = function(cmd, context) {
      return {
        'deserializerIndex': 0,
        'isBound': cmd.isBound,
        'ngContentIndex': cmd.ngContentIndex,
        'value': cmd.value
      };
    };
    RenderTemplateCmdSerializer.prototype.visitNgContent = function(cmd, context) {
      return {
        'deserializerIndex': 1,
        'index': cmd.index,
        'ngContentIndex': cmd.ngContentIndex
      };
    };
    RenderTemplateCmdSerializer.prototype.visitBeginElement = function(cmd, context) {
      return {
        'deserializerIndex': 2,
        'isBound': cmd.isBound,
        'ngContentIndex': cmd.ngContentIndex,
        'name': cmd.name,
        'attrNameAndValues': cmd.attrNameAndValues,
        'eventTargetAndNames': cmd.eventTargetAndNames
      };
    };
    RenderTemplateCmdSerializer.prototype.visitEndElement = function(context) {
      return {'deserializerIndex': 3};
    };
    RenderTemplateCmdSerializer.prototype.visitBeginComponent = function(cmd, context) {
      return {
        'deserializerIndex': 4,
        'isBound': cmd.isBound,
        'ngContentIndex': cmd.ngContentIndex,
        'name': cmd.name,
        'attrNameAndValues': cmd.attrNameAndValues,
        'eventTargetAndNames': cmd.eventTargetAndNames,
        'templateId': cmd.templateId
      };
    };
    RenderTemplateCmdSerializer.prototype.visitEndComponent = function(context) {
      return {'deserializerIndex': 5};
    };
    RenderTemplateCmdSerializer.prototype.visitEmbeddedTemplate = function(cmd, context) {
      var _this = this;
      var children = cmd.children.map(function(child) {
        return child.visit(_this, null);
      });
      return {
        'deserializerIndex': 6,
        'isBound': cmd.isBound,
        'ngContentIndex': cmd.ngContentIndex,
        'name': cmd.name,
        'attrNameAndValues': cmd.attrNameAndValues,
        'eventTargetAndNames': cmd.eventTargetAndNames,
        'isMerged': cmd.isMerged,
        'children': children
      };
    };
    return RenderTemplateCmdSerializer;
  })();
  var RENDER_TEMPLATE_CMD_SERIALIZER = new RenderTemplateCmdSerializer();
  var RENDER_TEMPLATE_CMD_DESERIALIZERS = [function(data) {
    return new api_2.WebWorkerTextCmd(data['isBound'], data['ngContentIndex'], data['value']);
  }, function(data) {
    return new api_2.WebWorkerNgContentCmd(data['index'], data['ngContentIndex']);
  }, function(data) {
    return new api_2.WebWorkerBeginElementCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames']);
  }, function(data) {
    return new api_2.WebWorkerEndElementCmd();
  }, function(data) {
    return new api_2.WebWorkerBeginComponentCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames'], data['templateId']);
  }, function(data) {
    return new api_2.WebWorkerEndComponentCmd();
  }, function(data) {
    return new api_2.WebWorkerEmbeddedTemplateCmd(data['isBound'], data['ngContentIndex'], data['name'], data['attrNameAndValues'], data['eventTargetAndNames'], data['isMerged'], data['children'].map(function(childData) {
      return deserializeTemplateCmd(childData);
    }));
  }];
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/router/location_strategy", ["angular2/src/facade/lang", "angular2/core"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var core_1 = require("angular2/core");
  var LocationStrategy = (function() {
    function LocationStrategy() {}
    return LocationStrategy;
  })();
  exports.LocationStrategy = LocationStrategy;
  exports.APP_BASE_HREF = lang_1.CONST_EXPR(new core_1.OpaqueToken('appBaseHref'));
  function normalizeQueryParams(params) {
    return (params.length > 0 && params.substring(0, 1) != '?') ? ('?' + params) : params;
  }
  exports.normalizeQueryParams = normalizeQueryParams;
  function joinWithSlash(start, end) {
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
  }
  exports.joinWithSlash = joinWithSlash;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/mock/mock_location_strategy", ["angular2/src/core/di", "angular2/src/facade/async", "angular2/src/router/location_strategy"], true, function(require, exports, module) {
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
  var location_strategy_1 = require("angular2/src/router/location_strategy");
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
      async_1.ObservableWrapper.callEmit(this._subject, new MockPopStateEvent(this.path()));
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
  })(location_strategy_1.LocationStrategy);
  exports.MockLocationStrategy = MockLocationStrategy;
  var MockPopStateEvent = (function() {
    function MockPopStateEvent(newUrl) {
      this.newUrl = newUrl;
      this.pop = true;
      this.type = 'popstate';
    }
    return MockPopStateEvent;
  })();
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/test_injector", ["angular2/src/core/di", "angular2/src/animate/animation_builder", "angular2/src/mock/animation_builder_mock", "angular2/src/core/linker/proto_view_factory", "angular2/src/core/reflection/reflection", "angular2/src/core/change_detection/change_detection", "angular2/src/facade/exceptions", "angular2/src/core/linker/view_resolver", "angular2/src/core/linker/directive_resolver", "angular2/src/core/linker/pipe_resolver", "angular2/src/core/linker/dynamic_component_loader", "angular2/src/compiler/xhr", "angular2/src/core/zone/ng_zone", "angular2/src/platform/dom/dom_adapter", "angular2/src/mock/directive_resolver_mock", "angular2/src/mock/view_resolver_mock", "angular2/src/mock/mock_location_strategy", "angular2/src/router/location_strategy", "angular2/src/mock/ng_zone_mock", "angular2/src/testing/test_component_builder", "angular2/src/core/di", "angular2/platform/common_dom", "angular2/src/facade/collection", "angular2/src/facade/lang", "angular2/src/core/linker/view_pool", "angular2/src/core/linker/view_manager", "angular2/src/core/linker/view_manager_utils", "angular2/src/core/render/api", "angular2/src/platform/dom/dom_tokens", "angular2/src/platform/dom/dom_renderer", "angular2/src/platform/dom/shared_styles_host", "angular2/src/platform/dom/shared_styles_host", "angular2/src/platform/dom/events/dom_events", "angular2/src/core/application_tokens", "angular2/src/web_workers/shared/serializer", "angular2/src/testing/utils", "angular2/src/compiler/compiler", "angular2/src/platform/dom/dom_renderer", "angular2/src/core/linker/dynamic_component_loader", "angular2/src/core/linker/view_manager", "angular2/src/core/application_common_providers"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var di_1 = require("angular2/src/core/di");
  var animation_builder_1 = require("angular2/src/animate/animation_builder");
  var animation_builder_mock_1 = require("angular2/src/mock/animation_builder_mock");
  var proto_view_factory_1 = require("angular2/src/core/linker/proto_view_factory");
  var reflection_1 = require("angular2/src/core/reflection/reflection");
  var change_detection_1 = require("angular2/src/core/change_detection/change_detection");
  var exceptions_1 = require("angular2/src/facade/exceptions");
  var view_resolver_1 = require("angular2/src/core/linker/view_resolver");
  var directive_resolver_1 = require("angular2/src/core/linker/directive_resolver");
  var pipe_resolver_1 = require("angular2/src/core/linker/pipe_resolver");
  var dynamic_component_loader_1 = require("angular2/src/core/linker/dynamic_component_loader");
  var xhr_1 = require("angular2/src/compiler/xhr");
  var ng_zone_1 = require("angular2/src/core/zone/ng_zone");
  var dom_adapter_1 = require("angular2/src/platform/dom/dom_adapter");
  var directive_resolver_mock_1 = require("angular2/src/mock/directive_resolver_mock");
  var view_resolver_mock_1 = require("angular2/src/mock/view_resolver_mock");
  var mock_location_strategy_1 = require("angular2/src/mock/mock_location_strategy");
  var location_strategy_1 = require("angular2/src/router/location_strategy");
  var ng_zone_mock_1 = require("angular2/src/mock/ng_zone_mock");
  var test_component_builder_1 = require("angular2/src/testing/test_component_builder");
  var di_2 = require("angular2/src/core/di");
  var common_dom_1 = require("angular2/platform/common_dom");
  var collection_1 = require("angular2/src/facade/collection");
  var lang_1 = require("angular2/src/facade/lang");
  var view_pool_1 = require("angular2/src/core/linker/view_pool");
  var view_manager_1 = require("angular2/src/core/linker/view_manager");
  var view_manager_utils_1 = require("angular2/src/core/linker/view_manager_utils");
  var api_1 = require("angular2/src/core/render/api");
  var dom_tokens_1 = require("angular2/src/platform/dom/dom_tokens");
  var dom_renderer_1 = require("angular2/src/platform/dom/dom_renderer");
  var shared_styles_host_1 = require("angular2/src/platform/dom/shared_styles_host");
  var shared_styles_host_2 = require("angular2/src/platform/dom/shared_styles_host");
  var dom_events_1 = require("angular2/src/platform/dom/events/dom_events");
  var application_tokens_1 = require("angular2/src/core/application_tokens");
  var serializer_1 = require("angular2/src/web_workers/shared/serializer");
  var utils_1 = require("angular2/src/testing/utils");
  var compiler_1 = require("angular2/src/compiler/compiler");
  var dom_renderer_2 = require("angular2/src/platform/dom/dom_renderer");
  var dynamic_component_loader_2 = require("angular2/src/core/linker/dynamic_component_loader");
  var view_manager_2 = require("angular2/src/core/linker/view_manager");
  var application_common_providers_1 = require("angular2/src/core/application_common_providers");
  function _getRootProviders() {
    return [di_1.provide(reflection_1.Reflector, {useValue: reflection_1.reflector})];
  }
  function _getAppBindings() {
    var appDoc;
    try {
      appDoc = dom_adapter_1.DOM.defaultDoc();
    } catch (e) {
      appDoc = null;
    }
    return [application_common_providers_1.APPLICATION_COMMON_PROVIDERS, di_1.provide(change_detection_1.ChangeDetectorGenConfig, {useValue: new change_detection_1.ChangeDetectorGenConfig(true, false, true)}), di_1.provide(dom_tokens_1.DOCUMENT, {useValue: appDoc}), di_1.provide(dom_renderer_1.DomRenderer, {useClass: dom_renderer_2.DomRenderer_}), di_1.provide(api_1.Renderer, {useExisting: dom_renderer_1.DomRenderer}), di_1.provide(application_tokens_1.APP_ID, {useValue: 'a'}), shared_styles_host_1.DomSharedStylesHost, di_1.provide(shared_styles_host_2.SharedStylesHost, {useExisting: shared_styles_host_1.DomSharedStylesHost}), view_pool_1.AppViewPool, di_1.provide(view_manager_1.AppViewManager, {useClass: view_manager_2.AppViewManager_}), view_manager_utils_1.AppViewManagerUtils, serializer_1.Serializer, common_dom_1.ELEMENT_PROBE_PROVIDERS, di_1.provide(view_pool_1.APP_VIEW_POOL_CAPACITY, {useValue: 500}), proto_view_factory_1.ProtoViewFactory, di_1.provide(directive_resolver_1.DirectiveResolver, {useClass: directive_resolver_mock_1.MockDirectiveResolver}), di_1.provide(view_resolver_1.ViewResolver, {useClass: view_resolver_mock_1.MockViewResolver}), di_1.provide(change_detection_1.IterableDiffers, {useValue: change_detection_1.defaultIterableDiffers}), di_1.provide(change_detection_1.KeyValueDiffers, {useValue: change_detection_1.defaultKeyValueDiffers}), utils_1.Log, di_1.provide(dynamic_component_loader_1.DynamicComponentLoader, {useClass: dynamic_component_loader_2.DynamicComponentLoader_}), pipe_resolver_1.PipeResolver, di_1.provide(exceptions_1.ExceptionHandler, {useValue: new exceptions_1.ExceptionHandler(dom_adapter_1.DOM)}), di_1.provide(location_strategy_1.LocationStrategy, {useClass: mock_location_strategy_1.MockLocationStrategy}), di_1.provide(xhr_1.XHR, {useClass: dom_adapter_1.DOM.getXHR()}), test_component_builder_1.TestComponentBuilder, di_1.provide(ng_zone_1.NgZone, {useClass: ng_zone_mock_1.MockNgZone}), di_1.provide(animation_builder_1.AnimationBuilder, {useClass: animation_builder_mock_1.MockAnimationBuilder}), common_dom_1.EventManager, new di_1.Provider(common_dom_1.EVENT_MANAGER_PLUGINS, {
      useClass: dom_events_1.DomEventsPlugin,
      multi: true
    })];
  }
  function _runtimeCompilerBindings() {
    return [di_1.provide(xhr_1.XHR, {useClass: dom_adapter_1.DOM.getXHR()}), compiler_1.COMPILER_PROVIDERS];
  }
  function createTestInjector(providers) {
    var rootInjector = di_2.Injector.resolveAndCreate(_getRootProviders());
    return rootInjector.resolveAndCreateChild(collection_1.ListWrapper.concat(_getAppBindings(), providers));
  }
  exports.createTestInjector = createTestInjector;
  function createTestInjectorWithRuntimeCompiler(providers) {
    return createTestInjector(collection_1.ListWrapper.concat(_runtimeCompilerBindings(), providers));
  }
  exports.createTestInjectorWithRuntimeCompiler = createTestInjectorWithRuntimeCompiler;
  function inject(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, false);
  }
  exports.inject = inject;
  function injectAsync(tokens, fn) {
    return new FunctionWithParamTokens(tokens, fn, true);
  }
  exports.injectAsync = injectAsync;
  var FunctionWithParamTokens = (function() {
    function FunctionWithParamTokens(_tokens, _fn, isAsync) {
      this._tokens = _tokens;
      this._fn = _fn;
      this.isAsync = isAsync;
    }
    FunctionWithParamTokens.prototype.execute = function(injector) {
      var params = this._tokens.map(function(t) {
        return injector.get(t);
      });
      return lang_1.FunctionWrapper.apply(this._fn, params);
    };
    FunctionWithParamTokens.prototype.hasToken = function(token) {
      return this._tokens.indexOf(token) > -1;
    };
    return FunctionWithParamTokens;
  })();
  exports.FunctionWithParamTokens = FunctionWithParamTokens;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/testing/testing", ["angular2/src/facade/lang", "angular2/src/facade/collection", "angular2/src/testing/test_injector", "angular2/src/testing/test_injector", "angular2/src/testing/matchers"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  var lang_1 = require("angular2/src/facade/lang");
  var collection_1 = require("angular2/src/facade/collection");
  var test_injector_1 = require("angular2/src/testing/test_injector");
  var test_injector_2 = require("angular2/src/testing/test_injector");
  exports.inject = test_injector_2.inject;
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
  var testProviders;
  var injector;
  jsmBeforeEach(function() {
    testProviders = [];
    injector = null;
  });
  function beforeEachProviders(fn) {
    jsmBeforeEach(function() {
      var providers = fn();
      if (!providers)
        return ;
      testProviders = testProviders.concat(providers);
      if (injector !== null) {
        throw new Error('beforeEachProviders was called after the injector had ' + 'been used in a beforeEach or it block. This invalidates the ' + 'test injector');
      }
    });
  }
  exports.beforeEachProviders = beforeEachProviders;
  function _isPromiseLike(input) {
    return input && !!(input.then);
  }
  function runInTestZone(fnToExecute, finishCallback, failCallback) {
    var pendingMicrotasks = 0;
    var pendingTimeouts = [];
    var ngTestZone = lang_1.global.zone.fork({
      onError: function(e) {
        failCallback(e);
      },
      '$run': function(parentRun) {
        return function() {
          try {
            return parentRun.apply(this, arguments);
          } finally {
            if (pendingMicrotasks == 0 && pendingTimeouts.length == 0) {
              finishCallback();
            }
          }
        };
      },
      '$scheduleMicrotask': function(parentScheduleMicrotask) {
        return function(fn) {
          pendingMicrotasks++;
          var microtask = function() {
            try {
              fn();
            } finally {
              pendingMicrotasks--;
            }
          };
          parentScheduleMicrotask.call(this, microtask);
        };
      },
      '$setTimeout': function(parentSetTimeout) {
        return function(fn, delay) {
          var args = [];
          for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
          }
          var id;
          var cb = function() {
            fn();
            collection_1.ListWrapper.remove(pendingTimeouts, id);
          };
          id = parentSetTimeout(cb, delay, args);
          pendingTimeouts.push(id);
          return id;
        };
      },
      '$clearTimeout': function(parentClearTimeout) {
        return function(id) {
          parentClearTimeout(id);
          collection_1.ListWrapper.remove(pendingTimeouts, id);
        };
      }
    });
    return ngTestZone.run(fnToExecute);
  }
  function _it(jsmFn, name, testFn, testTimeOut) {
    var timeOut = testTimeOut;
    if (testFn instanceof test_injector_1.FunctionWithParamTokens) {
      jsmFn(name, function(done) {
        if (!injector) {
          injector = test_injector_1.createTestInjectorWithRuntimeCompiler(testProviders);
        }
        var returnedTestValue = runInTestZone(function() {
          return testFn.execute(injector);
        }, done, done.fail);
        if (_isPromiseLike(returnedTestValue)) {
          returnedTestValue.then(null, function(err) {
            done.fail(err);
          });
        }
      }, timeOut);
    } else {
      jsmFn(name, testFn, timeOut);
    }
  }
  function beforeEach(fn) {
    if (fn instanceof test_injector_1.FunctionWithParamTokens) {
      jsmBeforeEach(function(done) {
        if (!injector) {
          injector = test_injector_1.createTestInjectorWithRuntimeCompiler(testProviders);
        }
        runInTestZone(function() {
          return fn.execute(injector);
        }, done, done.fail);
      });
    } else {
      if (fn.length === 0) {
        jsmBeforeEach(function() {
          fn();
        });
      } else {
        jsmBeforeEach(function(done) {
          fn(done);
        });
      }
    }
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
  function __export(m) {
    for (var p in m)
      if (!exports.hasOwnProperty(p))
        exports[p] = m[p];
  }
  __export(require("angular2/src/testing/testing"));
  var test_component_builder_1 = require("angular2/src/testing/test_component_builder");
  exports.ComponentFixture = test_component_builder_1.ComponentFixture;
  exports.TestComponentBuilder = test_component_builder_1.TestComponentBuilder;
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

//# sourceMappingURL=testing.js.map