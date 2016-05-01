"format register";
System.register("angular2/src/upgrade/metadata", ["angular2/compiler"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var compiler_1 = require("angular2/compiler");
  var COMPONENT_SELECTOR = /^[\w|-]*$/;
  var SKEWER_CASE = /-(\w)/g;
  var directiveResolver = new compiler_1.DirectiveResolver();
  function getComponentInfo(type) {
    var resolvedMetadata = directiveResolver.resolve(type);
    var selector = resolvedMetadata.selector;
    if (!selector.match(COMPONENT_SELECTOR)) {
      throw new Error('Only selectors matching element names are supported, got: ' + selector);
    }
    var selector = selector.replace(SKEWER_CASE, function(all, letter) {
      return letter.toUpperCase();
    });
    return {
      type: type,
      selector: selector,
      inputs: parseFields(resolvedMetadata.inputs),
      outputs: parseFields(resolvedMetadata.outputs)
    };
  }
  exports.getComponentInfo = getComponentInfo;
  function parseFields(names) {
    var attrProps = [];
    if (names) {
      for (var i = 0; i < names.length; i++) {
        var parts = names[i].split(':');
        var prop = parts[0].trim();
        var attr = (parts[1] || parts[0]).trim();
        var capitalAttr = attr.charAt(0).toUpperCase() + attr.substr(1);
        attrProps.push({
          prop: prop,
          attr: attr,
          bracketAttr: "[" + attr + "]",
          parenAttr: "(" + attr + ")",
          bracketParenAttr: "[(" + attr + ")]",
          onAttr: "on" + capitalAttr,
          bindAttr: "bind" + capitalAttr,
          bindonAttr: "bindon" + capitalAttr
        });
      }
    }
    return attrProps;
  }
  exports.parseFields = parseFields;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/upgrade/util", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function stringify(obj) {
    if (typeof obj == 'function')
      return obj.name || obj.toString();
    return '' + obj;
  }
  exports.stringify = stringify;
  function onError(e) {
    console.log(e, e.stack);
    throw e;
  }
  exports.onError = onError;
  function controllerKey(name) {
    return '$' + name + 'Controller';
  }
  exports.controllerKey = controllerKey;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/upgrade/constants", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  exports.NG2_COMPILER = 'ng2.Compiler';
  exports.NG2_INJECTOR = 'ng2.Injector';
  exports.NG2_COMPONENT_FACTORY_REF_MAP = 'ng2.ComponentFactoryRefMap';
  exports.NG2_ZONE = 'ng2.NgZone';
  exports.NG1_CONTROLLER = '$controller';
  exports.NG1_SCOPE = '$scope';
  exports.NG1_ROOT_SCOPE = '$rootScope';
  exports.NG1_COMPILE = '$compile';
  exports.NG1_HTTP_BACKEND = '$httpBackend';
  exports.NG1_INJECTOR = '$injector';
  exports.NG1_PARSE = '$parse';
  exports.NG1_TEMPLATE_CACHE = '$templateCache';
  exports.NG1_TESTABILITY = '$$testability';
  exports.REQUIRE_INJECTOR = '^' + exports.NG2_INJECTOR;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/upgrade/downgrade_ng2_adapter", ["angular2/core", "angular2/src/upgrade/constants"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var constants_1 = require("angular2/src/upgrade/constants");
  var INITIAL_VALUE = {__UNINITIALIZED__: true};
  var DowngradeNg2ComponentAdapter = (function() {
    function DowngradeNg2ComponentAdapter(id, info, element, attrs, scope, parentInjector, parse, componentFactory) {
      this.id = id;
      this.info = info;
      this.element = element;
      this.attrs = attrs;
      this.scope = scope;
      this.parentInjector = parentInjector;
      this.parse = parse;
      this.componentFactory = componentFactory;
      this.component = null;
      this.inputChangeCount = 0;
      this.inputChanges = null;
      this.componentRef = null;
      this.changeDetector = null;
      this.contentInsertionPoint = null;
      this.element[0].id = id;
      this.componentScope = scope.$new();
      this.childNodes = element.contents();
    }
    DowngradeNg2ComponentAdapter.prototype.bootstrapNg2 = function() {
      var childInjector = core_1.ReflectiveInjector.resolveAndCreate([core_1.provide(constants_1.NG1_SCOPE, {useValue: this.componentScope})], this.parentInjector);
      this.contentInsertionPoint = document.createComment('ng1 insertion point');
      this.componentRef = this.componentFactory.create(childInjector, [[this.contentInsertionPoint]], '#' + this.id);
      this.changeDetector = this.componentRef.changeDetectorRef;
      this.component = this.componentRef.instance;
    };
    DowngradeNg2ComponentAdapter.prototype.setupInputs = function() {
      var _this = this;
      var attrs = this.attrs;
      var inputs = this.info.inputs;
      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        var expr = null;
        if (attrs.hasOwnProperty(input.attr)) {
          var observeFn = (function(prop) {
            var prevValue = INITIAL_VALUE;
            return function(value) {
              if (_this.inputChanges !== null) {
                _this.inputChangeCount++;
                _this.inputChanges[prop] = new Ng1Change(value, prevValue === INITIAL_VALUE ? value : prevValue);
                prevValue = value;
              }
              _this.component[prop] = value;
            };
          })(input.prop);
          attrs.$observe(input.attr, observeFn);
        } else if (attrs.hasOwnProperty(input.bindAttr)) {
          expr = attrs[input.bindAttr];
        } else if (attrs.hasOwnProperty(input.bracketAttr)) {
          expr = attrs[input.bracketAttr];
        } else if (attrs.hasOwnProperty(input.bindonAttr)) {
          expr = attrs[input.bindonAttr];
        } else if (attrs.hasOwnProperty(input.bracketParenAttr)) {
          expr = attrs[input.bracketParenAttr];
        }
        if (expr != null) {
          var watchFn = (function(prop) {
            return function(value, prevValue) {
              if (_this.inputChanges != null) {
                _this.inputChangeCount++;
                _this.inputChanges[prop] = new Ng1Change(prevValue, value);
              }
              _this.component[prop] = value;
            };
          })(input.prop);
          this.componentScope.$watch(expr, watchFn);
        }
      }
      var prototype = this.info.type.prototype;
      if (prototype && prototype.ngOnChanges) {
        this.inputChanges = {};
        this.componentScope.$watch(function() {
          return _this.inputChangeCount;
        }, function() {
          var inputChanges = _this.inputChanges;
          _this.inputChanges = {};
          _this.component.ngOnChanges(inputChanges);
        });
      }
      this.componentScope.$watch(function() {
        return _this.changeDetector && _this.changeDetector.detectChanges();
      });
    };
    DowngradeNg2ComponentAdapter.prototype.projectContent = function() {
      var childNodes = this.childNodes;
      var parent = this.contentInsertionPoint.parentNode;
      if (parent) {
        for (var i = 0,
            ii = childNodes.length; i < ii; i++) {
          parent.insertBefore(childNodes[i], this.contentInsertionPoint);
        }
      }
    };
    DowngradeNg2ComponentAdapter.prototype.setupOutputs = function() {
      var _this = this;
      var attrs = this.attrs;
      var outputs = this.info.outputs;
      for (var j = 0; j < outputs.length; j++) {
        var output = outputs[j];
        var expr = null;
        var assignExpr = false;
        var bindonAttr = output.bindonAttr ? output.bindonAttr.substring(0, output.bindonAttr.length - 6) : null;
        var bracketParenAttr = output.bracketParenAttr ? "[(" + output.bracketParenAttr.substring(2, output.bracketParenAttr.length - 8) + ")]" : null;
        if (attrs.hasOwnProperty(output.onAttr)) {
          expr = attrs[output.onAttr];
        } else if (attrs.hasOwnProperty(output.parenAttr)) {
          expr = attrs[output.parenAttr];
        } else if (attrs.hasOwnProperty(bindonAttr)) {
          expr = attrs[bindonAttr];
          assignExpr = true;
        } else if (attrs.hasOwnProperty(bracketParenAttr)) {
          expr = attrs[bracketParenAttr];
          assignExpr = true;
        }
        if (expr != null && assignExpr != null) {
          var getter = this.parse(expr);
          var setter = getter.assign;
          if (assignExpr && !setter) {
            throw new Error("Expression '" + expr + "' is not assignable!");
          }
          var emitter = this.component[output.prop];
          if (emitter) {
            emitter.subscribe({next: assignExpr ? (function(setter) {
                return function(value) {
                  return setter(_this.scope, value);
                };
              })(setter) : (function(getter) {
                return function(value) {
                  return getter(_this.scope, {$event: value});
                };
              })(getter)});
          } else {
            throw new Error("Missing emitter '" + output.prop + "' on component '" + this.info.selector + "'!");
          }
        }
      }
    };
    DowngradeNg2ComponentAdapter.prototype.registerCleanup = function() {
      var _this = this;
      this.element.bind('$destroy', function() {
        _this.componentScope.$destroy();
        _this.componentRef.destroy();
      });
    };
    return DowngradeNg2ComponentAdapter;
  }());
  exports.DowngradeNg2ComponentAdapter = DowngradeNg2ComponentAdapter;
  var Ng1Change = (function() {
    function Ng1Change(previousValue, currentValue) {
      this.previousValue = previousValue;
      this.currentValue = currentValue;
    }
    Ng1Change.prototype.isFirstChange = function() {
      return this.previousValue === this.currentValue;
    };
    return Ng1Change;
  }());
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/upgrade/angular_js", [], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  function noNg() {
    throw new Error('AngularJS v1.x is not loaded!');
  }
  var angular = {
    bootstrap: noNg,
    module: noNg,
    element: noNg,
    version: noNg,
    resumeBootstrap: noNg,
    getTestability: noNg
  };
  try {
    if (window.hasOwnProperty('angular')) {
      angular = window.angular;
    }
  } catch (e) {}
  exports.bootstrap = angular.bootstrap;
  exports.module = angular.module;
  exports.element = angular.element;
  exports.version = angular.version;
  exports.resumeBootstrap = angular.resumeBootstrap;
  exports.getTestability = angular.getTestability;
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/upgrade/upgrade_ng1_adapter", ["angular2/core", "angular2/src/upgrade/constants", "angular2/src/upgrade/util", "angular2/src/upgrade/angular_js"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var constants_1 = require("angular2/src/upgrade/constants");
  var util_1 = require("angular2/src/upgrade/util");
  var angular = require("angular2/src/upgrade/angular_js");
  var CAMEL_CASE = /([A-Z])/g;
  var INITIAL_VALUE = {__UNINITIALIZED__: true};
  var NOT_SUPPORTED = 'NOT_SUPPORTED';
  var UpgradeNg1ComponentAdapterBuilder = (function() {
    function UpgradeNg1ComponentAdapterBuilder(name) {
      this.name = name;
      this.inputs = [];
      this.inputsRename = [];
      this.outputs = [];
      this.outputsRename = [];
      this.propertyOutputs = [];
      this.checkProperties = [];
      this.propertyMap = {};
      this.linkFn = null;
      this.directive = null;
      this.$controller = null;
      var selector = name.replace(CAMEL_CASE, function(all, next) {
        return '-' + next.toLowerCase();
      });
      var self = this;
      this.type = core_1.Directive({
        selector: selector,
        inputs: this.inputsRename,
        outputs: this.outputsRename
      }).Class({
        constructor: [new core_1.Inject(constants_1.NG1_SCOPE), core_1.ElementRef, function(scope, elementRef) {
          return new UpgradeNg1ComponentAdapter(self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
        }],
        ngOnInit: function() {},
        ngOnChanges: function() {},
        ngDoCheck: function() {}
      });
    }
    UpgradeNg1ComponentAdapterBuilder.prototype.extractDirective = function(injector) {
      var directives = injector.get(this.name + 'Directive');
      if (directives.length > 1) {
        throw new Error('Only support single directive definition for: ' + this.name);
      }
      var directive = directives[0];
      if (directive.replace)
        this.notSupported('replace');
      if (directive.terminal)
        this.notSupported('terminal');
      var link = directive.link;
      if (typeof link == 'object') {
        if (link.post)
          this.notSupported('link.post');
      }
      return directive;
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.notSupported = function(feature) {
      throw new Error("Upgraded directive '" + this.name + "' does not support '" + feature + "'.");
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function() {
      var btcIsObject = typeof this.directive.bindToController === 'object';
      if (btcIsObject && Object.keys(this.directive.scope).length) {
        throw new Error("Binding definitions on scope and controller at the same time are not supported.");
      }
      var context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;
      if (typeof context == 'object') {
        for (var name in context) {
          if (context.hasOwnProperty(name)) {
            var localName = context[name];
            var type = localName.charAt(0);
            localName = localName.substr(1) || name;
            var outputName = 'output_' + name;
            var outputNameRename = outputName + ': ' + name;
            var outputNameRenameChange = outputName + ': ' + name + 'Change';
            var inputName = 'input_' + name;
            var inputNameRename = inputName + ': ' + name;
            switch (type) {
              case '=':
                this.propertyOutputs.push(outputName);
                this.checkProperties.push(localName);
                this.outputs.push(outputName);
                this.outputsRename.push(outputNameRenameChange);
                this.propertyMap[outputName] = localName;
              case '@':
              case '<':
                this.inputs.push(inputName);
                this.inputsRename.push(inputNameRename);
                this.propertyMap[inputName] = localName;
                break;
              case '&':
                this.outputs.push(outputName);
                this.outputsRename.push(outputNameRename);
                this.propertyMap[outputName] = localName;
                break;
              default:
                var json = JSON.stringify(context);
                throw new Error("Unexpected mapping '" + type + "' in '" + json + "' in '" + this.name + "' directive.");
            }
          }
        }
      }
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.compileTemplate = function(compile, templateCache, httpBackend) {
      var _this = this;
      if (this.directive.template !== undefined) {
        this.linkFn = compileHtml(this.directive.template);
      } else if (this.directive.templateUrl) {
        var url = this.directive.templateUrl;
        var html = templateCache.get(url);
        if (html !== undefined) {
          this.linkFn = compileHtml(html);
        } else {
          return new Promise(function(resolve, err) {
            httpBackend('GET', url, null, function(status, response) {
              if (status == 200) {
                resolve(_this.linkFn = compileHtml(templateCache.put(url, response)));
              } else {
                err("GET " + url + " returned " + status + ": " + response);
              }
            });
          });
        }
      } else {
        throw new Error("Directive '" + this.name + "' is not a component, it is missing template.");
      }
      return null;
      function compileHtml(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return compile(div.childNodes);
      }
    };
    UpgradeNg1ComponentAdapterBuilder.resolve = function(exportedComponents, injector) {
      var promises = [];
      var compile = injector.get(constants_1.NG1_COMPILE);
      var templateCache = injector.get(constants_1.NG1_TEMPLATE_CACHE);
      var httpBackend = injector.get(constants_1.NG1_HTTP_BACKEND);
      var $controller = injector.get(constants_1.NG1_CONTROLLER);
      for (var name in exportedComponents) {
        if (exportedComponents.hasOwnProperty(name)) {
          var exportedComponent = exportedComponents[name];
          exportedComponent.directive = exportedComponent.extractDirective(injector);
          exportedComponent.$controller = $controller;
          exportedComponent.extractBindings();
          var promise = exportedComponent.compileTemplate(compile, templateCache, httpBackend);
          if (promise)
            promises.push(promise);
        }
      }
      return Promise.all(promises);
    };
    return UpgradeNg1ComponentAdapterBuilder;
  }());
  exports.UpgradeNg1ComponentAdapterBuilder = UpgradeNg1ComponentAdapterBuilder;
  var UpgradeNg1ComponentAdapter = (function() {
    function UpgradeNg1ComponentAdapter(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
      this.linkFn = linkFn;
      this.directive = directive;
      this.inputs = inputs;
      this.outputs = outputs;
      this.propOuts = propOuts;
      this.checkProperties = checkProperties;
      this.propertyMap = propertyMap;
      this.destinationObj = null;
      this.checkLastValues = [];
      this.element = elementRef.nativeElement;
      this.componentScope = scope.$new(!!directive.scope);
      var $element = angular.element(this.element);
      var controllerType = directive.controller;
      var controller = null;
      if (controllerType) {
        var locals = {
          $scope: this.componentScope,
          $element: $element
        };
        controller = $controller(controllerType, locals, null, directive.controllerAs);
        $element.data(util_1.controllerKey(directive.name), controller);
      }
      var link = directive.link;
      if (typeof link == 'object')
        link = link.pre;
      if (link) {
        var attrs = NOT_SUPPORTED;
        var transcludeFn = NOT_SUPPORTED;
        var linkController = this.resolveRequired($element, directive.require);
        directive.link(this.componentScope, $element, attrs, linkController, transcludeFn);
      }
      this.destinationObj = directive.bindToController && controller ? controller : this.componentScope;
      for (var i = 0; i < inputs.length; i++) {
        this[inputs[i]] = null;
      }
      for (var j = 0; j < outputs.length; j++) {
        var emitter = this[outputs[j]] = new core_1.EventEmitter();
        this.setComponentProperty(outputs[j], (function(emitter) {
          return function(value) {
            return emitter.emit(value);
          };
        })(emitter));
      }
      for (var k = 0; k < propOuts.length; k++) {
        this[propOuts[k]] = new core_1.EventEmitter();
        this.checkLastValues.push(INITIAL_VALUE);
      }
    }
    UpgradeNg1ComponentAdapter.prototype.ngOnInit = function() {
      var _this = this;
      var childNodes = [];
      var childNode;
      while (childNode = this.element.firstChild) {
        this.element.removeChild(childNode);
        childNodes.push(childNode);
      }
      this.linkFn(this.componentScope, function(clonedElement, scope) {
        for (var i = 0,
            ii = clonedElement.length; i < ii; i++) {
          _this.element.appendChild(clonedElement[i]);
        }
      }, {parentBoundTranscludeFn: function(scope, cloneAttach) {
          cloneAttach(childNodes);
        }});
      if (this.destinationObj.$onInit) {
        this.destinationObj.$onInit();
      }
    };
    UpgradeNg1ComponentAdapter.prototype.ngOnChanges = function(changes) {
      for (var name in changes) {
        if (changes.hasOwnProperty(name)) {
          var change = changes[name];
          this.setComponentProperty(name, change.currentValue);
        }
      }
    };
    UpgradeNg1ComponentAdapter.prototype.ngDoCheck = function() {
      var count = 0;
      var destinationObj = this.destinationObj;
      var lastValues = this.checkLastValues;
      var checkProperties = this.checkProperties;
      for (var i = 0; i < checkProperties.length; i++) {
        var value = destinationObj[checkProperties[i]];
        var last = lastValues[i];
        if (value !== last) {
          if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {} else {
            var eventEmitter = this[this.propOuts[i]];
            eventEmitter.emit(lastValues[i] = value);
          }
        }
      }
      return count;
    };
    UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function(name, value) {
      this.destinationObj[this.propertyMap[name]] = value;
    };
    UpgradeNg1ComponentAdapter.prototype.resolveRequired = function($element, require) {
      if (!require) {
        return undefined;
      } else if (typeof require == 'string') {
        var name = require;
        var isOptional = false;
        var startParent = false;
        var searchParents = false;
        var ch;
        if (name.charAt(0) == '?') {
          isOptional = true;
          name = name.substr(1);
        }
        if (name.charAt(0) == '^') {
          searchParents = true;
          name = name.substr(1);
        }
        if (name.charAt(0) == '^') {
          startParent = true;
          name = name.substr(1);
        }
        var key = util_1.controllerKey(name);
        if (startParent)
          $element = $element.parent();
        var dep = searchParents ? $element.inheritedData(key) : $element.data(key);
        if (!dep && !isOptional) {
          throw new Error("Can not locate '" + require + "' in '" + this.directive.name + "'.");
        }
        return dep;
      } else if (require instanceof Array) {
        var deps = [];
        for (var i = 0; i < require.length; i++) {
          deps.push(this.resolveRequired($element, require[i]));
        }
        return deps;
      }
      throw new Error("Directive '" + this.directive.name + "' require syntax unrecognized: " + this.directive.require);
    };
    return UpgradeNg1ComponentAdapter;
  }());
  global.define = __define;
  return module.exports;
});

System.register("angular2/src/upgrade/upgrade_adapter", ["angular2/core", "angular2/src/facade/lang", "angular2/src/facade/async", "angular2/platform/browser", "angular2/src/upgrade/metadata", "angular2/src/upgrade/util", "angular2/src/upgrade/constants", "angular2/src/upgrade/downgrade_ng2_adapter", "angular2/src/upgrade/upgrade_ng1_adapter", "angular2/src/upgrade/angular_js"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var core_1 = require("angular2/core");
  var lang_1 = require("angular2/src/facade/lang");
  var async_1 = require("angular2/src/facade/async");
  var browser_1 = require("angular2/platform/browser");
  var metadata_1 = require("angular2/src/upgrade/metadata");
  var util_1 = require("angular2/src/upgrade/util");
  var constants_1 = require("angular2/src/upgrade/constants");
  var downgrade_ng2_adapter_1 = require("angular2/src/upgrade/downgrade_ng2_adapter");
  var upgrade_ng1_adapter_1 = require("angular2/src/upgrade/upgrade_ng1_adapter");
  var angular = require("angular2/src/upgrade/angular_js");
  var upgradeCount = 0;
  var UpgradeAdapter = (function() {
    function UpgradeAdapter() {
      this.idPrefix = "NG2_UPGRADE_" + upgradeCount++ + "_";
      this.upgradedComponents = [];
      this.downgradedComponents = {};
      this.providers = [];
    }
    UpgradeAdapter.prototype.downgradeNg2Component = function(type) {
      this.upgradedComponents.push(type);
      var info = metadata_1.getComponentInfo(type);
      return ng1ComponentDirective(info, "" + this.idPrefix + info.selector + "_c");
    };
    UpgradeAdapter.prototype.upgradeNg1Component = function(name) {
      if (this.downgradedComponents.hasOwnProperty(name)) {
        return this.downgradedComponents[name].type;
      } else {
        return (this.downgradedComponents[name] = new upgrade_ng1_adapter_1.UpgradeNg1ComponentAdapterBuilder(name)).type;
      }
    };
    UpgradeAdapter.prototype.bootstrap = function(element, modules, config) {
      var _this = this;
      var upgrade = new UpgradeAdapterRef();
      var ng1Injector = null;
      var platformRef = browser_1.browserPlatform();
      var applicationRef = core_1.ReflectiveInjector.resolveAndCreate([browser_1.BROWSER_APP_PROVIDERS, core_1.provide(constants_1.NG1_INJECTOR, {useFactory: function() {
          return ng1Injector;
        }}), core_1.provide(constants_1.NG1_COMPILE, {useFactory: function() {
          return ng1Injector.get(constants_1.NG1_COMPILE);
        }}), this.providers], platformRef.injector).get(core_1.ApplicationRef);
      var injector = applicationRef.injector;
      var ngZone = injector.get(core_1.NgZone);
      var compiler = injector.get(core_1.ComponentResolver);
      var delayApplyExps = [];
      var original$applyFn;
      var rootScopePrototype;
      var rootScope;
      var componentFactoryRefMap = {};
      var ng1Module = angular.module(this.idPrefix, modules);
      var ng1BootstrapPromise = null;
      var ng1compilePromise = null;
      ng1Module.value(constants_1.NG2_INJECTOR, injector).value(constants_1.NG2_ZONE, ngZone).value(constants_1.NG2_COMPILER, compiler).value(constants_1.NG2_COMPONENT_FACTORY_REF_MAP, componentFactoryRefMap).config(['$provide', function(provide) {
        provide.decorator(constants_1.NG1_ROOT_SCOPE, ['$delegate', function(rootScopeDelegate) {
          rootScopePrototype = rootScopeDelegate.constructor.prototype;
          if (rootScopePrototype.hasOwnProperty('$apply')) {
            original$applyFn = rootScopePrototype.$apply;
            rootScopePrototype.$apply = function(exp) {
              return delayApplyExps.push(exp);
            };
          } else {
            throw new Error("Failed to find '$apply' on '$rootScope'!");
          }
          return rootScope = rootScopeDelegate;
        }]);
        provide.decorator(constants_1.NG1_TESTABILITY, ['$delegate', function(testabilityDelegate) {
          var _this = this;
          var ng2Testability = injector.get(core_1.Testability);
          var origonalWhenStable = testabilityDelegate.whenStable;
          var newWhenStable = function(callback) {
            var whenStableContext = _this;
            origonalWhenStable.call(_this, function() {
              if (ng2Testability.isStable()) {
                callback.apply(this, arguments);
              } else {
                ng2Testability.whenStable(newWhenStable.bind(whenStableContext, callback));
              }
            });
          };
          testabilityDelegate.whenStable = newWhenStable;
          return testabilityDelegate;
        }]);
      }]);
      ng1compilePromise = new Promise(function(resolve, reject) {
        ng1Module.run(['$injector', '$rootScope', function(injector, rootScope) {
          ng1Injector = injector;
          async_1.ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, function(_) {
            return ngZone.runOutsideAngular(function() {
              return rootScope.$apply();
            });
          });
          upgrade_ng1_adapter_1.UpgradeNg1ComponentAdapterBuilder.resolve(_this.downgradedComponents, injector).then(resolve, reject);
        }]);
      });
      var windowAngular = lang_1.global.angular;
      windowAngular.resumeBootstrap = undefined;
      angular.element(element).data(util_1.controllerKey(constants_1.NG2_INJECTOR), injector);
      ngZone.run(function() {
        angular.bootstrap(element, [_this.idPrefix], config);
      });
      ng1BootstrapPromise = new Promise(function(resolve, reject) {
        if (windowAngular.resumeBootstrap) {
          var originalResumeBootstrap = windowAngular.resumeBootstrap;
          windowAngular.resumeBootstrap = function() {
            windowAngular.resumeBootstrap = originalResumeBootstrap;
            windowAngular.resumeBootstrap.apply(this, arguments);
            resolve();
          };
        } else {
          resolve();
        }
      });
      Promise.all([this.compileNg2Components(compiler, componentFactoryRefMap), ng1BootstrapPromise, ng1compilePromise]).then(function() {
        ngZone.run(function() {
          if (rootScopePrototype) {
            rootScopePrototype.$apply = original$applyFn;
            while (delayApplyExps.length) {
              rootScope.$apply(delayApplyExps.shift());
            }
            upgrade._bootstrapDone(applicationRef, ng1Injector);
            rootScopePrototype = null;
          }
        });
      }, util_1.onError);
      return upgrade;
    };
    UpgradeAdapter.prototype.addProvider = function(provider) {
      this.providers.push(provider);
    };
    UpgradeAdapter.prototype.upgradeNg1Provider = function(name, options) {
      var token = options && options.asToken || name;
      this.providers.push(core_1.provide(token, {
        useFactory: function(ng1Injector) {
          return ng1Injector.get(name);
        },
        deps: [constants_1.NG1_INJECTOR]
      }));
    };
    UpgradeAdapter.prototype.downgradeNg2Provider = function(token) {
      var factory = function(injector) {
        return injector.get(token);
      };
      factory.$inject = [constants_1.NG2_INJECTOR];
      return factory;
    };
    UpgradeAdapter.prototype.compileNg2Components = function(compiler, componentFactoryRefMap) {
      var _this = this;
      var promises = [];
      var types = this.upgradedComponents;
      for (var i = 0; i < types.length; i++) {
        promises.push(compiler.resolveComponent(types[i]));
      }
      return Promise.all(promises).then(function(componentFactories) {
        var types = _this.upgradedComponents;
        for (var i = 0; i < componentFactories.length; i++) {
          componentFactoryRefMap[metadata_1.getComponentInfo(types[i]).selector] = componentFactories[i];
        }
        return componentFactoryRefMap;
      }, util_1.onError);
    };
    return UpgradeAdapter;
  }());
  exports.UpgradeAdapter = UpgradeAdapter;
  function ng1ComponentDirective(info, idPrefix) {
    directiveFactory.$inject = [constants_1.NG2_COMPONENT_FACTORY_REF_MAP, constants_1.NG1_PARSE];
    function directiveFactory(componentFactoryRefMap, parse) {
      var componentFactory = componentFactoryRefMap[info.selector];
      if (!componentFactory)
        throw new Error('Expecting ComponentFactory for: ' + info.selector);
      var idCount = 0;
      return {
        restrict: 'E',
        require: constants_1.REQUIRE_INJECTOR,
        link: {post: function(scope, element, attrs, parentInjector, transclude) {
            var domElement = element[0];
            var facade = new downgrade_ng2_adapter_1.DowngradeNg2ComponentAdapter(idPrefix + (idCount++), info, element, attrs, scope, parentInjector, parse, componentFactory);
            facade.setupInputs();
            facade.bootstrapNg2();
            facade.projectContent();
            facade.setupOutputs();
            facade.registerCleanup();
          }}
      };
    }
    return directiveFactory;
  }
  var UpgradeAdapterRef = (function() {
    function UpgradeAdapterRef() {
      this._readyFn = null;
      this.ng1RootScope = null;
      this.ng1Injector = null;
      this.ng2ApplicationRef = null;
      this.ng2Injector = null;
    }
    UpgradeAdapterRef.prototype._bootstrapDone = function(applicationRef, ng1Injector) {
      this.ng2ApplicationRef = applicationRef;
      this.ng2Injector = applicationRef.injector;
      this.ng1Injector = ng1Injector;
      this.ng1RootScope = ng1Injector.get(constants_1.NG1_ROOT_SCOPE);
      this._readyFn && this._readyFn(this);
    };
    UpgradeAdapterRef.prototype.ready = function(fn) {
      this._readyFn = fn;
    };
    UpgradeAdapterRef.prototype.dispose = function() {
      this.ng1Injector.get(constants_1.NG1_ROOT_SCOPE).$destroy();
      this.ng2ApplicationRef.dispose();
    };
    return UpgradeAdapterRef;
  }());
  exports.UpgradeAdapterRef = UpgradeAdapterRef;
  global.define = __define;
  return module.exports;
});

System.register("angular2/upgrade", ["angular2/src/upgrade/upgrade_adapter"], true, function(require, exports, module) {
  var global = System.global,
      __define = global.define;
  global.define = undefined;
  "use strict";
  var upgrade_adapter_1 = require("angular2/src/upgrade/upgrade_adapter");
  exports.UpgradeAdapter = upgrade_adapter_1.UpgradeAdapter;
  exports.UpgradeAdapterRef = upgrade_adapter_1.UpgradeAdapterRef;
  global.define = __define;
  return module.exports;
});

//# sourceMappingURLDisabled=upgrade.dev.js.map