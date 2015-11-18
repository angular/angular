'use strict';var angular2_1 = require('angular2/angular2');
var constants_1 = require('./constants');
var util_1 = require('./util');
var angular = require('./angular_js');
var CAMEL_CASE = /([A-Z])/g;
var INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
var NOT_SUPPORTED = 'NOT_SUPPORTED';
var UpgradeNg1ComponentAdapterBuilder = (function () {
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
        var selector = name.replace(CAMEL_CASE, function (all, next) { return '-' + next.toLowerCase(); });
        var self = this;
        this.type =
            angular2_1.Directive({ selector: selector, inputs: this.inputsRename, outputs: this.outputsRename })
                .Class({
                constructor: [
                    new angular2_1.Inject(constants_1.NG1_SCOPE),
                    angular2_1.ElementRef,
                    function (scope, elementRef) {
                        return new UpgradeNg1ComponentAdapter(self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                    }
                ],
                onChanges: function () { },
                doCheck: function () { }
            });
    }
    UpgradeNg1ComponentAdapterBuilder.prototype.extractDirective = function (injector) {
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
    UpgradeNg1ComponentAdapterBuilder.prototype.notSupported = function (feature) {
        throw new Error("Upgraded directive '" + this.name + "' does not support '" + feature + "'.");
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.extractBindings = function () {
        var scope = this.directive.scope;
        if (typeof scope == 'object') {
            for (var name in scope) {
                if (scope.hasOwnProperty(name)) {
                    var localName = scope[name];
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
                        // don't break; let it fall through to '@'
                        case '@':
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
                            var json = JSON.stringify(scope);
                            throw new Error("Unexpected mapping '" + type + "' in '" + json + "' in '" + this.name + "' directive.");
                    }
                }
            }
        }
    };
    UpgradeNg1ComponentAdapterBuilder.prototype.compileTemplate = function (compile, templateCache, httpBackend) {
        var _this = this;
        if (this.directive.template) {
            this.linkFn = compileHtml(this.directive.template);
        }
        else if (this.directive.templateUrl) {
            var url = this.directive.templateUrl;
            var html = templateCache.get(url);
            if (html !== undefined) {
                this.linkFn = compileHtml(html);
            }
            else {
                return new Promise(function (resolve, err) {
                    httpBackend('GET', url, null, function (status, response) {
                        if (status == 200) {
                            resolve(_this.linkFn = compileHtml(templateCache.put(url, response)));
                        }
                        else {
                            err("GET " + url + " returned " + status + ": " + response);
                        }
                    });
                });
            }
        }
        else {
            throw new Error("Directive '" + this.name + "' is not a component, it is missing template.");
        }
        return null;
        function compileHtml(html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            return compile(div.childNodes);
        }
    };
    UpgradeNg1ComponentAdapterBuilder.resolve = function (exportedComponents, injector) {
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
})();
exports.UpgradeNg1ComponentAdapterBuilder = UpgradeNg1ComponentAdapterBuilder;
var UpgradeNg1ComponentAdapter = (function () {
    function UpgradeNg1ComponentAdapter(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
        this.directive = directive;
        this.inputs = inputs;
        this.outputs = outputs;
        this.propOuts = propOuts;
        this.checkProperties = checkProperties;
        this.propertyMap = propertyMap;
        this.destinationObj = null;
        this.checkLastValues = [];
        var element = elementRef.nativeElement;
        var childNodes = [];
        var childNode;
        while (childNode = element.firstChild) {
            element.removeChild(childNode);
            childNodes.push(childNode);
        }
        var componentScope = scope.$new(!!directive.scope);
        var $element = angular.element(element);
        var controllerType = directive.controller;
        var controller = null;
        if (controllerType) {
            var locals = { $scope: componentScope, $element: $element };
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
            directive.link(componentScope, $element, attrs, linkController, transcludeFn);
        }
        this.destinationObj = directive.bindToController && controller ? controller : componentScope;
        linkFn(componentScope, function (clonedElement, scope) {
            for (var i = 0, ii = clonedElement.length; i < ii; i++) {
                element.appendChild(clonedElement[i]);
            }
        }, { parentBoundTranscludeFn: function (scope, cloneAttach) { cloneAttach(childNodes); } });
        for (var i = 0; i < inputs.length; i++) {
            this[inputs[i]] = null;
        }
        for (var j = 0; j < outputs.length; j++) {
            var emitter = this[outputs[j]] = new angular2_1.EventEmitter();
            this.setComponentProperty(outputs[j], (function (emitter) { return function (value) { return emitter.next(value); }; })(emitter));
        }
        for (var k = 0; k < propOuts.length; k++) {
            this[propOuts[k]] = new angular2_1.EventEmitter();
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    UpgradeNg1ComponentAdapter.prototype.onChanges = function (changes) {
        for (var name in changes) {
            if (changes.hasOwnProperty(name)) {
                var change = changes[name];
                this.setComponentProperty(name, change.currentValue);
            }
        }
    };
    UpgradeNg1ComponentAdapter.prototype.doCheck = function () {
        var count = 0;
        var destinationObj = this.destinationObj;
        var lastValues = this.checkLastValues;
        var checkProperties = this.checkProperties;
        for (var i = 0; i < checkProperties.length; i++) {
            var value = destinationObj[checkProperties[i]];
            var last = lastValues[i];
            if (value !== last) {
                if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
                }
                else {
                    var eventEmitter = this[this.propOuts[i]];
                    eventEmitter.next(lastValues[i] = value);
                }
            }
        }
        return count;
    };
    UpgradeNg1ComponentAdapter.prototype.setComponentProperty = function (name, value) {
        this.destinationObj[this.propertyMap[name]] = value;
    };
    UpgradeNg1ComponentAdapter.prototype.resolveRequired = function ($element, require) {
        if (!require) {
            return undefined;
        }
        else if (typeof require == 'string') {
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
        }
        else if (require instanceof Array) {
            var deps = [];
            for (var i = 0; i < require.length; i++) {
                deps.push(this.resolveRequired($element, require[i]));
            }
            return deps;
        }
        throw new Error("Directive '" + this.directive.name + "' require syntax unrecognized: " + this.directive.require);
    };
    return UpgradeNg1ComponentAdapter;
})();
//# sourceMappingURL=upgrade_ng1_adapter.js.map