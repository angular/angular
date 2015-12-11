import { Directive, ElementRef, EventEmitter, Inject } from 'angular2/core';
import { NG1_COMPILE, NG1_SCOPE, NG1_HTTP_BACKEND, NG1_TEMPLATE_CACHE, NG1_CONTROLLER } from './constants';
import { controllerKey } from './util';
import * as angular from './angular_js';
const CAMEL_CASE = /([A-Z])/g;
const INITIAL_VALUE = {
    __UNINITIALIZED__: true
};
const NOT_SUPPORTED = 'NOT_SUPPORTED';
export class UpgradeNg1ComponentAdapterBuilder {
    constructor(name) {
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
        var selector = name.replace(CAMEL_CASE, (all, next) => '-' + next.toLowerCase());
        var self = this;
        this.type =
            Directive({ selector: selector, inputs: this.inputsRename, outputs: this.outputsRename })
                .Class({
                constructor: [
                    new Inject(NG1_SCOPE),
                    ElementRef,
                    function (scope, elementRef) {
                        return new UpgradeNg1ComponentAdapter(self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs, self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                    }
                ],
                ngOnChanges: function () { },
                ngDoCheck: function () { }
            });
    }
    extractDirective(injector) {
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
    }
    notSupported(feature) {
        throw new Error(`Upgraded directive '${this.name}' does not support '${feature}'.`);
    }
    extractBindings() {
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
                            throw new Error(`Unexpected mapping '${type}' in '${json}' in '${this.name}' directive.`);
                    }
                }
            }
        }
    }
    compileTemplate(compile, templateCache, httpBackend) {
        if (this.directive.template !== undefined) {
            this.linkFn = compileHtml(this.directive.template);
        }
        else if (this.directive.templateUrl) {
            var url = this.directive.templateUrl;
            var html = templateCache.get(url);
            if (html !== undefined) {
                this.linkFn = compileHtml(html);
            }
            else {
                return new Promise((resolve, err) => {
                    httpBackend('GET', url, null, (status, response) => {
                        if (status == 200) {
                            resolve(this.linkFn = compileHtml(templateCache.put(url, response)));
                        }
                        else {
                            err(`GET ${url} returned ${status}: ${response}`);
                        }
                    });
                });
            }
        }
        else {
            throw new Error(`Directive '${this.name}' is not a component, it is missing template.`);
        }
        return null;
        function compileHtml(html) {
            var div = document.createElement('div');
            div.innerHTML = html;
            return compile(div.childNodes);
        }
    }
    static resolve(exportedComponents, injector) {
        var promises = [];
        var compile = injector.get(NG1_COMPILE);
        var templateCache = injector.get(NG1_TEMPLATE_CACHE);
        var httpBackend = injector.get(NG1_HTTP_BACKEND);
        var $controller = injector.get(NG1_CONTROLLER);
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
    }
}
class UpgradeNg1ComponentAdapter {
    constructor(linkFn, scope, directive, elementRef, $controller, inputs, outputs, propOuts, checkProperties, propertyMap) {
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
            $element.data(controllerKey(directive.name), controller);
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
        linkFn(componentScope, (clonedElement, scope) => {
            for (var i = 0, ii = clonedElement.length; i < ii; i++) {
                element.appendChild(clonedElement[i]);
            }
        }, { parentBoundTranscludeFn: (scope, cloneAttach) => { cloneAttach(childNodes); } });
        for (var i = 0; i < inputs.length; i++) {
            this[inputs[i]] = null;
        }
        for (var j = 0; j < outputs.length; j++) {
            var emitter = this[outputs[j]] = new EventEmitter();
            this.setComponentProperty(outputs[j], ((emitter) => (value) => emitter.emit(value))(emitter));
        }
        for (var k = 0; k < propOuts.length; k++) {
            this[propOuts[k]] = new EventEmitter();
            this.checkLastValues.push(INITIAL_VALUE);
        }
    }
    ngOnChanges(changes) {
        for (var name in changes) {
            if (changes.hasOwnProperty(name)) {
                var change = changes[name];
                this.setComponentProperty(name, change.currentValue);
            }
        }
    }
    ngDoCheck() {
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
                    eventEmitter.emit(lastValues[i] = value);
                }
            }
        }
        return count;
    }
    setComponentProperty(name, value) {
        this.destinationObj[this.propertyMap[name]] = value;
    }
    resolveRequired($element, require) {
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
            var key = controllerKey(name);
            if (startParent)
                $element = $element.parent();
            var dep = searchParents ? $element.inheritedData(key) : $element.data(key);
            if (!dep && !isOptional) {
                throw new Error(`Can not locate '${require}' in '${this.directive.name}'.`);
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
        throw new Error(`Directive '${this.directive.name}' require syntax unrecognized: ${this.directive.require}`);
    }
}
