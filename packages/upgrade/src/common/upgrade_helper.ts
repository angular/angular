/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, Injector, SimpleChanges} from '@angular/core';

import * as angular from './angular1';
import {$COMPILE, $CONTROLLER, $HTTP_BACKEND, $INJECTOR, $TEMPLATE_CACHE} from './constants';
import {controllerKey, directiveNormalize, isFunction} from './util';


// Constants
export const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;

// Interfaces
export interface IBindingDestination {
  [key: string]: any;
  $onChanges?: (changes: SimpleChanges) => void;
}

export interface IControllerInstance extends IBindingDestination {
  $doCheck?: () => void;
  $onDestroy?: () => void;
  $onInit?: () => void;
  $postLink?: () => void;
}

// Classes
export class UpgradeHelper {
  public readonly $injector: angular.IInjectorService;
  public readonly element: Element;
  public readonly $element: angular.IAugmentedJQuery;
  public readonly directive: angular.IDirective;

  private readonly $compile: angular.ICompileService;
  private readonly $controller: angular.IControllerService;
  private readonly $templateCache: angular.ITemplateCacheService;

  constructor(private injector: Injector, private name: string, elementRef: ElementRef) {
    this.$injector = injector.get($INJECTOR);
    this.$compile = this.$injector.get($COMPILE);
    this.$controller = this.$injector.get($CONTROLLER);
    this.$templateCache = this.$injector.get($TEMPLATE_CACHE);

    this.element = elementRef.nativeElement;
    this.$element = angular.element(this.element);

    this.directive = this.getDirective();
  }

  buildController(controllerType: angular.IController, $scope: angular.IScope) {
    // TODO: Document that we do not pre-assign bindings on the controller instance.
    // Quoted properties below so that this code can be optimized with Closure Compiler.
    const locals = {'$scope': $scope, '$element': this.$element};
    const controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);

    this.$element.data !(controllerKey(this.directive.name !), controller);

    return controller;
  }

  compileTemplate(): angular.ILinkFn {
    if (this.directive.template !== undefined) {
      return this.compileHtml(this.getOrCall<string>(this.directive.template));
    } else if (this.directive.templateUrl) {
      const url = this.getOrCall<string>(this.directive.templateUrl);
      const html = this.$templateCache.get(url) as string;
      if (html !== undefined) {
        return this.compileHtml(html);
      } else {
        throw new Error('loading directive templates asynchronously is not supported');
      }
    } else {
      throw new Error(`Directive '${this.name}' is not a component, it is missing template.`);
    }
  }

  getDirective(): angular.IDirective {
    const directives: angular.IDirective[] = this.$injector.get(this.name + 'Directive');
    if (directives.length > 1) {
      throw new Error(`Only support single directive definition for: ${this.name}`);
    }

    const directive = directives[0];
    if (directive.replace) this.notSupported('replace');
    if (directive.terminal) this.notSupported('terminal');
    if (directive.compile) this.notSupported('compile');

    return directive;
  }

  prepareTransclusion(): angular.ILinkFn|undefined {
    const transclude = this.directive.transclude;
    const contentChildNodes = this.extractChildNodes();
    let $template = contentChildNodes;
    let attachChildrenFn: angular.ILinkFn|undefined = (scope, cloneAttach) =>
        cloneAttach !($template, scope);

    if (transclude) {
      const slots = Object.create(null);

      if (typeof transclude === 'object') {
        $template = [];

        const slotMap = Object.create(null);
        const filledSlots = Object.create(null);

        // Parse the element selectors.
        Object.keys(transclude).forEach(slotName => {
          let selector = transclude[slotName];
          const optional = selector.charAt(0) === '?';
          selector = optional ? selector.substring(1) : selector;

          slotMap[selector] = slotName;
          slots[slotName] = null;            // `null`: Defined but not yet filled.
          filledSlots[slotName] = optional;  // Consider optional slots as filled.
        });

        // Add the matching elements into their slot.
        contentChildNodes.forEach(node => {
          const slotName = slotMap[directiveNormalize(node.nodeName.toLowerCase())];
          if (slotName) {
            filledSlots[slotName] = true;
            slots[slotName] = slots[slotName] || [];
            slots[slotName].push(node);
          } else {
            $template.push(node);
          }
        });

        // Check for required slots that were not filled.
        Object.keys(filledSlots).forEach(slotName => {
          if (!filledSlots[slotName]) {
            throw new Error(`Required transclusion slot '${slotName}' on directive: ${this.name}`);
          }
        });

        Object.keys(slots).filter(slotName => slots[slotName]).forEach(slotName => {
          const nodes = slots[slotName];
          slots[slotName] = (scope: angular.IScope, cloneAttach: angular.ICloneAttachFunction) =>
              cloneAttach !(nodes, scope);
        });
      }

      // Attach `$$slots` to default slot transclude fn.
      attachChildrenFn.$$slots = slots;

      // AngularJS v1.6+ ignores empty or whitespace-only transcluded text nodes. But Angular
      // removes all text content after the first interpolation and updates it later, after
      // evaluating the expressions. This would result in AngularJS failing to recognize text
      // nodes that start with an interpolation as transcluded content and use the fallback
      // content instead.
      // To avoid this issue, we add a
      // [zero-width non-joiner character](https://en.wikipedia.org/wiki/Zero-width_non-joiner)
      // to empty text nodes (which can only be a result of Angular removing their initial content).
      // NOTE: Transcluded text content that starts with whitespace followed by an interpolation
      //       will still fail to be detected by AngularJS v1.6+
      $template.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && !node.nodeValue) {
          node.nodeValue = '\u200C';
        }
      });
    }

    return attachChildrenFn;
  }

  resolveRequire(require: angular.DirectiveRequireProperty):
      angular.SingleOrListOrMap<IControllerInstance>|null {
    if (!require) {
      return null;
    } else if (Array.isArray(require)) {
      return require.map(req => this.resolveRequire(req));
    } else if (typeof require === 'object') {
      const value: {[key: string]: IControllerInstance} = {};
      Object.keys(require).forEach(key => value[key] = this.resolveRequire(require[key]) !);
      return value;
    } else if (typeof require === 'string') {
      const match = require.match(REQUIRE_PREFIX_RE) !;
      const inheritType = match[1] || match[3];

      const name = require.substring(match[0].length);
      const isOptional = !!match[2];
      const searchParents = !!inheritType;
      const startOnParent = inheritType === '^^';

      const ctrlKey = controllerKey(name);
      const elem = startOnParent ? this.$element.parent !() : this.$element;
      const value = searchParents ? elem.inheritedData !(ctrlKey) : elem.data !(ctrlKey);

      if (!value && !isOptional) {
        throw new Error(
            `Unable to find required '${require}' in upgraded directive '${this.name}'.`);
      }

      return value;
    } else {
      throw new Error(
          `Unrecognized 'require' syntax on upgraded directive '${this.name}': ${require}`);
    }
  }

  private compileHtml(html: string): angular.ILinkFn {
    this.element.innerHTML = html;
    return this.$compile(this.element.childNodes);
  }

  private extractChildNodes(): Node[] {
    const childNodes: Node[] = [];
    let childNode: Node|null;

    while (childNode = this.element.firstChild) {
      this.element.removeChild(childNode);
      childNodes.push(childNode);
    }

    return childNodes;
  }

  private getOrCall<T>(property: T|Function): T {
    return isFunction(property) ? property() : property;
  }

  private notSupported(feature: string) {
    throw new Error(
        `Upgraded directive '${this.name}' contains unsupported feature: '${feature}'.`);
  }
}
