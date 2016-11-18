/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, DoCheck, ElementRef, EventEmitter, Inject, OnChanges, OnInit, SimpleChange, SimpleChanges, Type} from '@angular/core';

import * as angular from './angular_js';
import {NG1_COMPILE, NG1_CONTROLLER, NG1_HTTP_BACKEND, NG1_SCOPE, NG1_TEMPLATE_CACHE} from './constants';
import {controllerKey} from './util';

const CAMEL_CASE = /([A-Z])/g;
const INITIAL_VALUE = {
  __UNINITIALIZED__: true
};
const NOT_SUPPORTED: any = 'NOT_SUPPORTED';


export class UpgradeNg1ComponentAdapterBuilder {
  type: Type<any>;
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
    const selector = name.replace(
        CAMEL_CASE, (all: any /** TODO #9100 */, next: string) => '-' + next.toLowerCase());
    const self = this;
    this.type =
        Directive({selector: selector, inputs: this.inputsRename, outputs: this.outputsRename})
            .Class({
              constructor: [
                new Inject(NG1_SCOPE), ElementRef,
                function(scope: angular.IScope, elementRef: ElementRef) {
                  return new UpgradeNg1ComponentAdapter(
                      self.linkFn, scope, self.directive, elementRef, self.$controller, self.inputs,
                      self.outputs, self.propertyOutputs, self.checkProperties, self.propertyMap);
                }
              ],
              ngOnInit: function() { /* needs to be here for ng2 to properly detect it */ },
              ngOnChanges: function() { /* needs to be here for ng2 to properly detect it */ },
              ngDoCheck: function() { /* needs to be here for ng2 to properly detect it */ },
              ngOnDestroy: function() { /* needs to be here for ng2 to properly detect it */ },
            });
  }

  extractDirective(injector: angular.IInjectorService): angular.IDirective {
    const directives: angular.IDirective[] = injector.get(this.name + 'Directive');
    if (directives.length > 1) {
      throw new Error('Only support single directive definition for: ' + this.name);
    }
    const directive = directives[0];
    if (directive.replace) this.notSupported('replace');
    if (directive.terminal) this.notSupported('terminal');
    const link = directive.link;
    if (typeof link == 'object') {
      if ((<angular.IDirectivePrePost>link).post) this.notSupported('link.post');
    }
    return directive;
  }

  private notSupported(feature: string) {
    throw new Error(`Upgraded directive '${this.name}' does not support '${feature}'.`);
  }

  extractBindings() {
    const btcIsObject = typeof this.directive.bindToController === 'object';
    if (btcIsObject && Object.keys(this.directive.scope).length) {
      throw new Error(
          `Binding definitions on scope and controller at the same time are not supported.`);
    }

    const context = (btcIsObject) ? this.directive.bindToController : this.directive.scope;

    if (typeof context == 'object') {
      for (const name in context) {
        if ((<any>context).hasOwnProperty(name)) {
          let localName = context[name];
          const type = localName.charAt(0);
          const typeOptions = localName.charAt(1);
          localName = typeOptions === '?' ? localName.substr(2) : localName.substr(1);
          localName = localName || name;

          const outputName = 'output_' + name;
          const outputNameRename = outputName + ': ' + name;
          const outputNameRenameChange = outputName + ': ' + name + 'Change';
          const inputName = 'input_' + name;
          const inputNameRename = inputName + ': ' + name;
          switch (type) {
            case '=':
              this.propertyOutputs.push(outputName);
              this.checkProperties.push(localName);
              this.outputs.push(outputName);
              this.outputsRename.push(outputNameRenameChange);
              this.propertyMap[outputName] = localName;
              this.inputs.push(inputName);
              this.inputsRename.push(inputNameRename);
              this.propertyMap[inputName] = localName;
              break;
            case '@':
            // handle the '<' binding of angular 1.5 components
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
              let json = JSON.stringify(context);
              throw new Error(
                  `Unexpected mapping '${type}' in '${json}' in '${this.name}' directive.`);
          }
        }
      }
    }
  }

  compileTemplate(
      compile: angular.ICompileService, templateCache: angular.ITemplateCacheService,
      httpBackend: angular.IHttpBackendService): Promise<angular.ILinkFn> {
    if (this.directive.template !== undefined) {
      this.linkFn = compileHtml(
          typeof this.directive.template === 'function' ? this.directive.template() :
                                                          this.directive.template);
    } else if (this.directive.templateUrl) {
      const url = typeof this.directive.templateUrl === 'function' ? this.directive.templateUrl() :
                                                                     this.directive.templateUrl;
      const html = templateCache.get(url);
      if (html !== undefined) {
        this.linkFn = compileHtml(html);
      } else {
        return new Promise((resolve, err) => {
          httpBackend(
              'GET', url, null,
              (status: any /** TODO #9100 */, response: any /** TODO #9100 */) => {
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
    function compileHtml(html: any /** TODO #9100 */): angular.ILinkFn {
      const div = document.createElement('div');
      div.innerHTML = html;
      return compile(div.childNodes);
    }
  }

  /**
   * Upgrade ng1 components into Angular 2.
   */
  static resolve(
      exportedComponents: {[name: string]: UpgradeNg1ComponentAdapterBuilder},
      injector: angular.IInjectorService): Promise<angular.ILinkFn[]> {
    const promises: Promise<angular.ILinkFn>[] = [];
    const compile: angular.ICompileService = injector.get(NG1_COMPILE);
    const templateCache: angular.ITemplateCacheService = injector.get(NG1_TEMPLATE_CACHE);
    const httpBackend: angular.IHttpBackendService = injector.get(NG1_HTTP_BACKEND);
    const $controller: angular.IControllerService = injector.get(NG1_CONTROLLER);
    for (const name in exportedComponents) {
      if ((<any>exportedComponents).hasOwnProperty(name)) {
        const exportedComponent = exportedComponents[name];
        exportedComponent.directive = exportedComponent.extractDirective(injector);
        exportedComponent.$controller = $controller;
        exportedComponent.extractBindings();
        const promise: Promise<angular.ILinkFn> =
            exportedComponent.compileTemplate(compile, templateCache, httpBackend);
        if (promise) promises.push(promise);
      }
    }
    return Promise.all(promises);
  }
}

class UpgradeNg1ComponentAdapter implements OnInit, OnChanges, DoCheck {
  destinationObj: any = null;
  checkLastValues: any[] = [];
  componentScope: angular.IScope;
  element: Element;
  $element: any = null;

  constructor(
      private linkFn: angular.ILinkFn, scope: angular.IScope, private directive: angular.IDirective,
      elementRef: ElementRef, private $controller: angular.IControllerService,
      private inputs: string[], private outputs: string[], private propOuts: string[],
      private checkProperties: string[], private propertyMap: {[key: string]: string}) {
    this.element = elementRef.nativeElement;
    this.componentScope = scope.$new(!!directive.scope);
    this.$element = angular.element(this.element);
    const controllerType = directive.controller;
    if (directive.bindToController && controllerType) {
      this.destinationObj = this.buildController(controllerType);
    } else {
      this.destinationObj = this.componentScope;
    }

    for (let i = 0; i < inputs.length; i++) {
      (this as any /** TODO #9100 */)[inputs[i]] = null;
    }
    for (let j = 0; j < outputs.length; j++) {
      const emitter = (this as any /** TODO #9100 */)[outputs[j]] = new EventEmitter();
      this.setComponentProperty(
          outputs[j], ((emitter: any /** TODO #9100 */) => (value: any /** TODO #9100 */) =>
                           emitter.emit(value))(emitter));
    }
    for (let k = 0; k < propOuts.length; k++) {
      (this as any /** TODO #9100 */)[propOuts[k]] = new EventEmitter();
      this.checkLastValues.push(INITIAL_VALUE);
    }
  }

  ngOnInit() {
    if (!this.directive.bindToController && this.directive.controller) {
      this.buildController(this.directive.controller);
    }
    let link = this.directive.link;
    if (typeof link == 'object') link = (<angular.IDirectivePrePost>link).pre;
    if (link) {
      const attrs: angular.IAttributes = NOT_SUPPORTED;
      const transcludeFn: angular.ITranscludeFunction = NOT_SUPPORTED;
      const linkController = this.resolveRequired(this.$element, this.directive.require);
      (<angular.IDirectiveLinkFn>this.directive.link)(
          this.componentScope, this.$element, attrs, linkController, transcludeFn);
    }

    const childNodes: Node[] = [];
    let childNode: any /** TODO #9100 */;
    while (childNode = this.element.firstChild) {
      this.element.removeChild(childNode);
      childNodes.push(childNode);
    }
    this.linkFn(this.componentScope, (clonedElement, scope) => {
      for (let i = 0, ii = clonedElement.length; i < ii; i++) {
        this.element.appendChild(clonedElement[i]);
      }
    }, {
      parentBoundTranscludeFn: (scope: any /** TODO #9100 */,
                                cloneAttach: any /** TODO #9100 */) => { cloneAttach(childNodes); }
    });
    if (this.destinationObj.$onInit) {
      this.destinationObj.$onInit();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const ng1Changes: any = {};
    Object.keys(changes).forEach(name => {
      const change: SimpleChange = changes[name];
      this.setComponentProperty(name, change.currentValue);
      ng1Changes[this.propertyMap[name]] = change;
    });
    if (this.destinationObj.$onChanges) {
      this.destinationObj.$onChanges(ng1Changes);
    }
  }

  ngDoCheck() {
    const destinationObj = this.destinationObj;
    const lastValues = this.checkLastValues;
    const checkProperties = this.checkProperties;
    for (let i = 0; i < checkProperties.length; i++) {
      const value = destinationObj[checkProperties[i]];
      const last = lastValues[i];
      if (value !== last) {
        if (typeof value == 'number' && isNaN(value) && typeof last == 'number' && isNaN(last)) {
          // ignore because NaN != NaN
        } else {
          const eventEmitter: EventEmitter<any> = (this as any /** TODO #9100 */)[this.propOuts[i]];
          eventEmitter.emit(lastValues[i] = value);
        }
      }
    }
    if (this.destinationObj.$doCheck && this.directive.controller) {
      this.destinationObj.$doCheck();
    }
  }

  ngOnDestroy() {
    if (this.destinationObj.$onDestroy && this.directive.controller) {
      this.destinationObj.$onDestroy();
    }
  }

  setComponentProperty(name: string, value: any) {
    this.destinationObj[this.propertyMap[name]] = value;
  }

  private buildController(controllerType: any /** TODO #9100 */) {
    const locals = {$scope: this.componentScope, $element: this.$element};
    const controller: any =
        this.$controller(controllerType, locals, null, this.directive.controllerAs);
    this.$element.data(controllerKey(this.directive.name), controller);
    return controller;
  }

  private resolveRequired(
      $element: angular.IAugmentedJQuery, require: angular.DirectiveRequireProperty): any {
    if (!require) {
      return undefined;
    } else if (typeof require == 'string') {
      let name: string = <string>require;
      let isOptional = false;
      let startParent = false;
      let searchParents = false;
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

      const key = controllerKey(name);
      if (startParent) $element = $element.parent();
      const dep = searchParents ? $element.inheritedData(key) : $element.data(key);
      if (!dep && !isOptional) {
        throw new Error(`Can not locate '${require}' in '${this.directive.name}'.`);
      }
      return dep;
    } else if (require instanceof Array) {
      const deps: any[] = [];
      for (let i = 0; i < require.length; i++) {
        deps.push(this.resolveRequired($element, require[i]));
      }
      return deps;
    }
    throw new Error(
        `Directive '${this.directive.name}' require syntax unrecognized: ${this.directive.require}`);
  }
}
