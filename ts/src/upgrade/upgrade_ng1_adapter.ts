import {
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Inject,
  OnChanges,
  SimpleChange,
  Type
} from 'angular2/angular2';
import {
  NG1_COMPILE,
  NG1_SCOPE,
  NG1_HTTP_BACKEND,
  NG1_TEMPLATE_CACHE,
  NG1_CONTROLLER
} from './constants';
import {controllerKey} from './util';
import * as angular from './angular_js';

const CAMEL_CASE = /([A-Z])/g;
const INITIAL_VALUE = {
  __UNINITIALIZED__: true
};
const NOT_SUPPORTED: any = 'NOT_SUPPORTED';


export class UpgradeNg1ComponentAdapterBuilder {
  type: Type;
  inputs: string[] = [];
  inputsRename: string[] = [];
  outputs: string[] = [];
  outputsRename: string[] = [];
  propertyOutputs: string[] = [];
  checkProperties: string[] = [];
  propertyMap: {[name: string]: string} = {};
  linkFn: angular.ILinkFn = null;
  directive: angular.IDirective = null;
  $controller: angular.IControllerService = null;

  constructor(public name: string) {
    var selector = name.replace(CAMEL_CASE, (all, next: string) => '-' + next.toLowerCase());
    var self = this;
    this.type =
        Directive({selector: selector, inputs: this.inputsRename, outputs: this.outputsRename})
            .Class({
              constructor: [
                new Inject(NG1_SCOPE),
                ElementRef,
                function(scope: angular.IScope, elementRef: ElementRef) {
                  return new UpgradeNg1ComponentAdapter(
                      self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs,
                      self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                }
              ],
              onChanges: function() { /* needs to be here for ng2 to properly detect it */ },
              doCheck: function() { /* needs to be here for ng2 to properly detect it */ }
            });
  }

  extractDirective(injector: angular.IInjectorService): angular.IDirective {
    var directives: angular.IDirective[] = injector.get(this.name + 'Directive');
    if (directives.length > 1) {
      throw new Error('Only support single directive definition for: ' + this.name);
    }
    var directive = directives[0];
    if (directive.replace) this.notSupported('replace');
    if (directive.terminal) this.notSupported('terminal');
    var link = directive.link;
    if (typeof link == 'object') {
      if ((<angular.IDirectivePrePost>link).post) this.notSupported('link.post');
    }
    return directive;
  }

  private notSupported(feature: string) {
    throw new Error(`Upgraded directive '${this.name}' does not support '${feature}'.`);
  }

  extractBindings() {
    var scope = this.directive.scope;
    if (typeof scope == 'object') {
      for (var name in scope) {
        if ((<any>scope).hasOwnProperty(name)) {
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
              throw new Error(
                  `Unexpected mapping '${type}' in '${json}' in '${this.name}' directive.`);
          }
        }
      }
    }
  }

  compileTemplate(compile: angular.ICompileService, templateCache: angular.ITemplateCacheService,
                  httpBackend: angular.IHttpBackendService): Promise<any> {
    if (this.directive.template) {
      this.linkFn = compileHtml(this.directive.template);
    } else if (this.directive.templateUrl) {
      var url = this.directive.templateUrl;
      var html = templateCache.get(url);
      if (html !== undefined) {
        this.linkFn = compileHtml(html);
      } else {
        return new Promise((resolve, err) => {
          httpBackend('GET', url, null, (status, response) => {
            if (status == 200) {
              resolve(this.linkFn = compileHtml(templateCache.put(url, response)));
            } else {
              err(`GET ${url} returned ${status}: ${response}`);
            }
          });
        });
      }
    } else {
      throw new Error(`Directive '${this.name}' is not a component, it is missing template.`);
    }
    return null;
    function compileHtml(html): angular.ILinkFn {
      var div = document.createElement('div');
      div.innerHTML = html;
      return compile(div.childNodes);
    }
  }

  static resolve(exportedComponents: {[name: string]: UpgradeNg1ComponentAdapterBuilder},
                 injector: angular.IInjectorService): Promise<any> {
    var promises = [];
    var compile: angular.ICompileService = injector.get(NG1_COMPILE);
    var templateCache: angular.ITemplateCacheService = injector.get(NG1_TEMPLATE_CACHE);
    var httpBackend: angular.IHttpBackendService = injector.get(NG1_HTTP_BACKEND);
    var $controller: angular.IControllerService = injector.get(NG1_CONTROLLER);
    for (var name in exportedComponents) {
      if ((<any>exportedComponents).hasOwnProperty(name)) {
        var exportedComponent = exportedComponents[name];
        exportedComponent.directive = exportedComponent.extractDirective(injector);
        exportedComponent.$controller = $controller;
        exportedComponent.extractBindings();
        var promise = exportedComponent.compileTemplate(compile, templateCache, httpBackend);
        if (promise) promises.push(promise);
      }
    }
    return Promise.all(promises);
  }
}

class UpgradeNg1ComponentAdapter implements OnChanges, DoCheck {
  destinationObj: any = null;
  checkLastValues: any[] = [];

  constructor(linkFn: angular.ILinkFn, scope: angular.IScope, private directive: angular.IDirective,
              elementRef: ElementRef, $controller: angular.IControllerService,
              private inputs: string[], private outputs: string[], private propOuts: string[],
              private checkProperties: string[], private propertyMap: {[key: string]: string}) {
    var element: Element = elementRef.nativeElement;
    var childNodes: Node[] = [];
    var childNode;
    while (childNode = element.firstChild) {
      element.removeChild(childNode);
      childNodes.push(childNode);
    }
    var componentScope = scope.$new(!!directive.scope);
    var $element = angular.element(element);
    var controllerType = directive.controller;
    var controller: any = null;
    if (controllerType) {
      var locals = {$scope: componentScope, $element: $element};
      controller = $controller(controllerType, locals, null, directive.controllerAs);
      $element.data(controllerKey(directive.name), controller);
    }
    var link = directive.link;
    if (typeof link == 'object') link = (<angular.IDirectivePrePost>link).pre;
    if (link) {
      var attrs: angular.IAttributes = NOT_SUPPORTED;
      var transcludeFn: angular.ITranscludeFunction = NOT_SUPPORTED;
      var linkController = this.resolveRequired($element, directive.require);
      (<angular.IDirectiveLinkFn>directive.link)(componentScope, $element, attrs, linkController,
                                                 transcludeFn);
    }
    this.destinationObj = directive.bindToController && controller ? controller : componentScope;

    linkFn(componentScope, (clonedElement: Node[], scope: angular.IScope) => {
      for (var i = 0, ii = clonedElement.length; i < ii; i++) {
        element.appendChild(clonedElement[i]);
      }
    }, {parentBoundTranscludeFn: (scope, cloneAttach) => { cloneAttach(childNodes); }});

    for (var i = 0; i < inputs.length; i++) {
      this[inputs[i]] = null;
    }
    for (var j = 0; j < outputs.length; j++) {
      var emitter = this[outputs[j]] = new EventEmitter();
      this.setComponentProperty(outputs[j], ((emitter) => (value) => emitter.next(value))(emitter));
    }
    for (var k = 0; k < propOuts.length; k++) {
      this[propOuts[k]] = new EventEmitter();
      this.checkLastValues.push(INITIAL_VALUE);
    }
  }

  onChanges(changes: {[name: string]: SimpleChange}) {
    for (var name in changes) {
      if ((<Object>changes).hasOwnProperty(name)) {
        var change: SimpleChange = changes[name];
        this.setComponentProperty(name, change.currentValue);
      }
    }
  }

  doCheck(): number {
    var count = 0;
    var destinationObj = this.destinationObj;
    var lastValues = this.checkLastValues;
    var checkProperties = this.checkProperties;
    for (var i = 0; i < checkProperties.length; i++) {
      var value = destinationObj[checkProperties[i]];
      var last = lastValues[i];
      if (value !== last) {
        if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
          // ignore because NaN != NaN
        } else {
          var eventEmitter: EventEmitter<any> = this[this.propOuts[i]];
          eventEmitter.next(lastValues[i] = value);
        }
      }
    }
    return count;
  }

  setComponentProperty(name: string, value: any) {
    this.destinationObj[this.propertyMap[name]] = value;
  }

  private resolveRequired($element: angular.IAugmentedJQuery, require: string | string[]): any {
    if (!require) {
      return undefined;
    } else if (typeof require == 'string') {
      var name: string = <string>require;
      var isOptional = false;
      var startParent = false;
      var searchParents = false;
      var ch: string;
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
      if (startParent) $element = $element.parent();
      var dep = searchParents ? $element.inheritedData(key) : $element.data(key);
      if (!dep && !isOptional) {
        throw new Error(`Can not locate '${require}' in '${this.directive.name}'.`);
      }
      return dep;
    } else if (require instanceof Array) {
      var deps = [];
      for (var i = 0; i < require.length; i++) {
        deps.push(this.resolveRequired($element, require[i]));
      }
      return deps;
    }
    throw new Error(
        `Directive '${this.directive.name}' require syntax unrecognized: ${this.directive.require}`);
  }
}
