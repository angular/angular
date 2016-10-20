/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DoCheck, ElementRef, EventEmitter, Injector, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';

import * as angular from '../angular_js';
import {looseIdentical} from '../facade/lang';
import {controllerKey} from '../util';

import {$COMPILE, $CONTROLLER, $HTTP_BACKEND, $INJECTOR, $SCOPE, $TEMPLATE_CACHE} from './constants';

const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;
const NOT_SUPPORTED: any = 'NOT_SUPPORTED';
const INITIAL_VALUE = {
  __UNINITIALIZED__: true
};

class Bindings {
  twoWayBoundProperties: string[] = [];
  twoWayBoundLastValues: any[] = [];

  expressionBoundProperties: string[] = [];

  propertyToOutputMap: {[propName: string]: string} = {};
}

interface IBindingDestination {
  [key: string]: any;
  $onChanges?: (changes: SimpleChanges) => void;
}

interface IControllerInstance extends IBindingDestination {
  $onDestroy?: () => void;
  $onInit?: () => void;
  $postLink?: () => void;
}

type LifecycleHook = '$onChanges' | '$onDestroy' | '$onInit' | '$postLink';

/**
 * @experimental
 */
export class UpgradeComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
  private $injector: angular.IInjectorService;
  private $compile: angular.ICompileService;
  private $templateCache: angular.ITemplateCacheService;
  private $httpBackend: angular.IHttpBackendService;
  private $controller: angular.IControllerService;

  private element: Element;
  private $element: angular.IAugmentedJQuery;
  private $componentScope: angular.IScope;

  private directive: angular.IDirective;
  private bindings: Bindings;
  private linkFn: angular.ILinkFn;

  private controllerInstance: IControllerInstance = null;
  private bindingDestination: IBindingDestination = null;

  constructor(private name: string, private elementRef: ElementRef, private injector: Injector) {
    this.$injector = injector.get($INJECTOR);
    this.$compile = this.$injector.get($COMPILE);
    this.$templateCache = this.$injector.get($TEMPLATE_CACHE);
    this.$httpBackend = this.$injector.get($HTTP_BACKEND);
    this.$controller = this.$injector.get($CONTROLLER);

    this.element = elementRef.nativeElement;
    this.$element = angular.element(this.element);

    this.directive = this.getDirective(name);
    this.bindings = this.initializeBindings(this.directive);
    this.linkFn = this.compileTemplate(this.directive);

    // We ask for the Angular 1 scope from the Angular 2 injector, since
    // we will put the new component scope onto the new injector for each component
    const $parentScope = injector.get($SCOPE);
    // QUESTION 1: Should we create an isolated scope if the scope is only true?
    // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
    this.$componentScope = $parentScope.$new(!!this.directive.scope);

    const controllerType = this.directive.controller;
    const bindToController = this.directive.bindToController;
    if (controllerType) {
      this.controllerInstance = this.buildController(
          controllerType, this.$componentScope, this.$element, this.directive.controllerAs);
    } else if (bindToController) {
      throw new Error(
          `Upgraded directive '${name}' specifies 'bindToController' but no controller.`);
    }

    this.bindingDestination = bindToController ? this.controllerInstance : this.$componentScope;

    this.setupOutputs();
  }

  ngOnInit() {
    const attrs: angular.IAttributes = NOT_SUPPORTED;
    const transcludeFn: angular.ITranscludeFunction = NOT_SUPPORTED;
    const directiveRequire = this.getDirectiveRequire(this.directive);
    let requiredControllers =
        this.resolveRequire(this.directive.name, this.$element, directiveRequire);

    if (this.directive.bindToController && isMap(directiveRequire)) {
      const requiredControllersMap = requiredControllers as{[key: string]: IControllerInstance};
      Object.keys(requiredControllersMap).forEach(key => {
        this.controllerInstance[key] = requiredControllersMap[key];
      });
    }

    this.callLifecycleHook('$onInit', this.controllerInstance);

    const link = this.directive.link;
    const preLink = (typeof link == 'object') && (link as angular.IDirectivePrePost).pre;
    const postLink = (typeof link == 'object') ? (link as angular.IDirectivePrePost).post : link;
    if (preLink) {
      preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
    }

    var childNodes: Node[] = [];
    var childNode: Node;
    while (childNode = this.element.firstChild) {
      this.element.removeChild(childNode);
      childNodes.push(childNode);
    }

    const attachElement: angular.ICloneAttachFunction =
        (clonedElements, scope) => { this.$element.append(clonedElements); };
    const attachChildNodes: angular.ILinkFn = (scope, cloneAttach) => cloneAttach(childNodes);

    this.linkFn(this.$componentScope, attachElement, {parentBoundTranscludeFn: attachChildNodes});

    if (postLink) {
      postLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
    }

    this.callLifecycleHook('$postLink', this.controllerInstance);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Forward input changes to `bindingDestination`
    Object.keys(changes).forEach(
        propName => this.bindingDestination[propName] = changes[propName].currentValue);

    this.callLifecycleHook('$onChanges', this.bindingDestination, changes);
  }

  ngDoCheck() {
    const twoWayBoundProperties = this.bindings.twoWayBoundProperties;
    const twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
    const propertyToOutputMap = this.bindings.propertyToOutputMap;

    twoWayBoundProperties.forEach((propName, idx) => {
      const newValue = this.bindingDestination[propName];
      const oldValue = twoWayBoundLastValues[idx];

      if (!looseIdentical(newValue, oldValue)) {
        const outputName = propertyToOutputMap[propName];
        const eventEmitter: EventEmitter<any> = (this as any)[outputName];

        eventEmitter.emit(newValue);
        twoWayBoundLastValues[idx] = newValue;
      }
    });
  }

  ngOnDestroy() {
    this.callLifecycleHook('$onDestroy', this.controllerInstance);
    this.$componentScope.$destroy();
  }

  private callLifecycleHook(method: LifecycleHook, context: IBindingDestination, arg?: any) {
    if (context && typeof context[method] === 'function') {
      context[method](arg);
    }
  }

  private getDirective(name: string): angular.IDirective {
    const directives: angular.IDirective[] = this.$injector.get(name + 'Directive');
    if (directives.length > 1) {
      throw new Error('Only support single directive definition for: ' + this.name);
    }
    const directive = directives[0];
    if (directive.replace) this.notSupported('replace');
    if (directive.terminal) this.notSupported('terminal');
    if (directive.compile) this.notSupported('compile');
    const link = directive.link;
    // QUESTION: why not support link.post?
    if (typeof link == 'object') {
      if ((<angular.IDirectivePrePost>link).post) this.notSupported('link.post');
    }
    return directive;
  }

  private getDirectiveRequire(directive: angular.IDirective): angular.DirectiveRequireProperty {
    const require = directive.require || (directive.controller && directive.name);

    if (isMap(require)) {
      Object.keys(require).forEach(key => {
        const value = require[key];
        const match = value.match(REQUIRE_PREFIX_RE);
        const name = value.substring(match[0].length);

        if (!name) {
          require[key] = match[0] + key;
        }
      });
    }

    return require;
  }

  private initializeBindings(directive: angular.IDirective) {
    const btcIsObject = typeof directive.bindToController === 'object';
    if (btcIsObject && Object.keys(directive.scope).length) {
      throw new Error(
          `Binding definitions on scope and controller at the same time is not supported.`);
    }

    const context = (btcIsObject) ? directive.bindToController : directive.scope;
    const bindings = new Bindings();

    if (typeof context == 'object') {
      Object.keys(context).forEach(propName => {
        const definition = context[propName];
        const bindingType = definition.charAt(0);

        // QUESTION: What about `=*`? Ignore? Throw? Support?

        switch (bindingType) {
          case '@':
          case '<':
            // We don't need to do anything special. They will be defined as inputs on the
            // upgraded component facade and the change propagation will be handled by
            // `ngOnChanges()`.
            break;
          case '=':
            bindings.twoWayBoundProperties.push(propName);
            bindings.twoWayBoundLastValues.push(INITIAL_VALUE);
            bindings.propertyToOutputMap[propName] = propName + 'Change';
            break;
          case '&':
            bindings.expressionBoundProperties.push(propName);
            bindings.propertyToOutputMap[propName] = propName;
            break;
          default:
            var json = JSON.stringify(context);
            throw new Error(
                `Unexpected mapping '${bindingType}' in '${json}' in '${this.name}' directive.`);
        }
      });
    }

    return bindings;
  }

  private compileTemplate(directive: angular.IDirective): angular.ILinkFn {
    if (this.directive.template !== undefined) {
      return this.compileHtml(getOrCall(this.directive.template));
    } else if (this.directive.templateUrl) {
      var url = getOrCall(this.directive.templateUrl);
      var html = this.$templateCache.get(url) as string;
      if (html !== undefined) {
        return this.compileHtml(html);
      } else {
        throw new Error('loading directive templates asynchronously is not supported');
        // return new Promise((resolve, reject) => {
        //   this.$httpBackend('GET', url, null, (status: number, response: string) => {
        //     if (status == 200) {
        //       resolve(this.compileHtml(this.$templateCache.put(url, response)));
        //     } else {
        //       reject(`GET component template from '${url}' returned '${status}: ${response}'`);
        //     }
        //   });
        // });
      }
    } else {
      throw new Error(`Directive '${this.name}' is not a component, it is missing template.`);
    }
  }

  private buildController(
      controllerType: angular.IController, $scope: angular.IScope,
      $element: angular.IAugmentedJQuery, controllerAs: string) {
    // TODO: Document that we do not pre-assign bindings on the controller instance
    var locals = {$scope, $element};
    var controller = this.$controller(controllerType, locals, null, controllerAs);
    $element.data(controllerKey(this.directive.name), controller);
    return controller;
  }

  private resolveRequire(
      directiveName: string, $element: angular.IAugmentedJQuery,
      require: angular.DirectiveRequireProperty): angular.SingleOrListOrMap<IControllerInstance> {
    if (!require) {
      return null;
    } else if (Array.isArray(require)) {
      return require.map(req => this.resolveRequire(directiveName, $element, req));
    } else if (typeof require === 'object') {
      const value: {[key: string]: IControllerInstance} = {};

      Object.keys(require).forEach(
          key => value[key] = this.resolveRequire(directiveName, $element, require[key]));

      return value;
    } else if (typeof require === 'string') {
      const match = require.match(REQUIRE_PREFIX_RE);
      const inheritType = match[1] || match[3];

      const name = require.substring(match[0].length);
      const isOptional = !!match[2];
      const searchParents = !!inheritType;
      const startOnParent = inheritType === '^^';

      const ctrlKey = controllerKey(name);

      if (startOnParent) {
        $element = $element.parent();
      }

      const value = searchParents ? $element.inheritedData(ctrlKey) : $element.data(ctrlKey);

      if (!value && !isOptional) {
        throw new Error(
            `Unable to find required '${require}' in upgraded directive '${directiveName}'.`);
      }

      return value;
    } else {
      throw new Error(
          `Unrecognized require syntax on upgraded directive '${directiveName}': ${require}`);
    }
  }

  private setupOutputs() {
    // Set up the outputs for `=` bindings
    this.bindings.twoWayBoundProperties.forEach(propName => {
      const outputName = this.bindings.propertyToOutputMap[propName];
      (this as any)[outputName] = new EventEmitter();
    });

    // Set up the outputs for `&` bindings
    this.bindings.expressionBoundProperties.forEach(propName => {
      const outputName = this.bindings.propertyToOutputMap[propName];
      const emitter = (this as any)[outputName] = new EventEmitter();

      // QUESTION: Do we want the ng1 component to call the function with `<value>` or with
      //           `{$event: <value>}`. The former is closer to ng2, the latter to ng1.
      this.bindingDestination[propName] = (value: any) => emitter.emit(value);
    });
  }

  private notSupported(feature: string) {
    throw new Error(
        `Upgraded directive '${this.name}' contains unsupported feature: '${feature}'.`);
  }

  private compileHtml(html: string): angular.ILinkFn {
    const div = document.createElement('div');
    div.innerHTML = html;
    return this.$compile(div.childNodes);
  }
}


function getOrCall<T>(property: Function | T): T {
  return typeof(property) === 'function' ? property() : property;
}

// NOTE: Only works for `typeof T !== 'object'`.
function isMap<T>(value: angular.SingleOrListOrMap<T>): value is {[key: string]: T} {
  return value && !Array.isArray(value) && typeof value === 'object';
}
