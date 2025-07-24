/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ElementRef, Injector, SimpleChanges} from '@angular/core';

import {
  DirectiveRequireProperty,
  element as angularElement,
  IAugmentedJQuery,
  ICloneAttachFunction,
  ICompileService,
  IController,
  IControllerService,
  IDirective,
  IHttpBackendService,
  IInjectorService,
  ILinkFn,
  IScope,
  ITemplateCacheService,
  SingleOrListOrMap,
} from './angular1';
import {$COMPILE, $CONTROLLER, $HTTP_BACKEND, $INJECTOR, $TEMPLATE_CACHE} from './constants';
import {cleanData, controllerKey, directiveNormalize, isFunction} from './util';
import {TrustedHTML} from './security/trusted_types_defs';
import {trustedHTMLFromLegacyTemplate} from './security/trusted_types';

// Constants
const REQUIRE_PREFIX_RE = /^(\^\^?)?(\?)?(\^\^?)?/;

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
  public readonly $injector: IInjectorService;
  public readonly element: Element;
  public readonly $element: IAugmentedJQuery;
  public readonly directive: IDirective;

  private readonly $compile: ICompileService;
  private readonly $controller: IControllerService;

  constructor(
    injector: Injector,
    private name: string,
    elementRef: ElementRef,
    directive?: IDirective,
  ) {
    this.$injector = injector.get($INJECTOR);
    this.$compile = this.$injector.get($COMPILE);
    this.$controller = this.$injector.get($CONTROLLER);

    this.element = elementRef.nativeElement;
    this.$element = angularElement(this.element);

    this.directive = directive ?? UpgradeHelper.getDirective(this.$injector, name);
  }

  static getDirective($injector: IInjectorService, name: string): IDirective {
    const directives: IDirective[] = $injector.get(name + 'Directive');
    if (directives.length > 1) {
      throw new Error(`Only support single directive definition for: ${name}`);
    }

    const directive = directives[0];

    // AngularJS will transform `link: xyz` to `compile: () => xyz`. So we can only tell there was a
    // user-defined `compile` if there is no `link`. In other cases, we will just ignore `compile`.
    if (directive.compile && !directive.link) notSupported(name, 'compile');
    if (directive.replace) notSupported(name, 'replace');
    if (directive.terminal) notSupported(name, 'terminal');

    return directive;
  }

  static getTemplate(
    $injector: IInjectorService,
    directive: IDirective,
    fetchRemoteTemplate = false,
    $element?: IAugmentedJQuery,
  ): string | TrustedHTML | Promise<string | TrustedHTML> {
    if (directive.template !== undefined) {
      return trustedHTMLFromLegacyTemplate(getOrCall<string>(directive.template, $element));
    } else if (directive.templateUrl) {
      const $templateCache = $injector.get($TEMPLATE_CACHE) as ITemplateCacheService;
      const url = getOrCall<string>(directive.templateUrl, $element);
      const template = $templateCache.get(url);

      if (template !== undefined) {
        return trustedHTMLFromLegacyTemplate(template);
      } else if (!fetchRemoteTemplate) {
        throw new Error('loading directive templates asynchronously is not supported');
      }

      return new Promise((resolve, reject) => {
        const $httpBackend = $injector.get($HTTP_BACKEND) as IHttpBackendService;
        $httpBackend('GET', url, null, (status: number, response: string) => {
          if (status === 200) {
            resolve(trustedHTMLFromLegacyTemplate($templateCache.put(url, response)));
          } else {
            reject(`GET component template from '${url}' returned '${status}: ${response}'`);
          }
        });
      });
    } else {
      throw new Error(`Directive '${directive.name}' is not a component, it is missing template.`);
    }
  }

  buildController(controllerType: IController, $scope: IScope) {
    // TODO: Document that we do not pre-assign bindings on the controller instance.
    // Quoted properties below so that this code can be optimized with Closure Compiler.
    const locals = {'$scope': $scope, '$element': this.$element};
    const controller = this.$controller(controllerType, locals, null, this.directive.controllerAs);

    this.$element.data?.(controllerKey(this.directive.name!), controller);

    return controller;
  }

  compileTemplate(template?: string | TrustedHTML): ILinkFn {
    if (template === undefined) {
      template = UpgradeHelper.getTemplate(this.$injector, this.directive, false, this.$element) as
        | string
        | TrustedHTML;
    }

    return this.compileHtml(template);
  }

  onDestroy($scope: IScope, controllerInstance?: any) {
    if (controllerInstance && isFunction(controllerInstance.$onDestroy)) {
      controllerInstance.$onDestroy();
    }
    $scope.$destroy();
    cleanData(this.element);
  }

  prepareTransclusion(): ILinkFn | undefined {
    const transclude = this.directive.transclude;
    const contentChildNodes = this.extractChildNodes();
    const attachChildrenFn: ILinkFn = (scope, cloneAttachFn) => {
      // Since AngularJS v1.5.8, `cloneAttachFn` will try to destroy the transclusion scope if
      // `$template` is empty. Since the transcluded content comes from Angular, not AngularJS,
      // there will be no transclusion scope here.
      // Provide a dummy `scope.$destroy()` method to prevent `cloneAttachFn` from throwing.
      scope = scope || {$destroy: () => undefined};
      return cloneAttachFn!($template, scope);
    };
    let $template = contentChildNodes;

    if (transclude) {
      const slots = Object.create(null);

      if (typeof transclude === 'object') {
        $template = [];

        const slotMap = Object.create(null);
        const filledSlots = Object.create(null);

        // Parse the element selectors.
        Object.keys(transclude).forEach((slotName) => {
          let selector = transclude[slotName];
          const optional = selector.charAt(0) === '?';
          selector = optional ? selector.substring(1) : selector;

          slotMap[selector] = slotName;
          slots[slotName] = null; // `null`: Defined but not yet filled.
          filledSlots[slotName] = optional; // Consider optional slots as filled.
        });

        // Add the matching elements into their slot.
        contentChildNodes.forEach((node) => {
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
        Object.keys(filledSlots).forEach((slotName) => {
          if (!filledSlots[slotName]) {
            throw new Error(`Required transclusion slot '${slotName}' on directive: ${this.name}`);
          }
        });

        Object.keys(slots)
          .filter((slotName) => slots[slotName])
          .forEach((slotName) => {
            const nodes = slots[slotName];
            slots[slotName] = (scope: IScope, cloneAttach: ICloneAttachFunction) => {
              return cloneAttach!(nodes, scope);
            };
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
      $template.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.nodeValue) {
          node.nodeValue = '\u200C';
        }
      });
    }

    return attachChildrenFn;
  }

  resolveAndBindRequiredControllers(controllerInstance: IControllerInstance | null) {
    const directiveRequire = this.getDirectiveRequire();
    const requiredControllers = this.resolveRequire(directiveRequire);

    if (controllerInstance && this.directive.bindToController && isMap(directiveRequire)) {
      const requiredControllersMap = requiredControllers as {[key: string]: IControllerInstance};
      Object.keys(requiredControllersMap).forEach((key) => {
        controllerInstance[key] = requiredControllersMap[key];
      });
    }

    return requiredControllers;
  }

  private compileHtml(html: string | TrustedHTML): ILinkFn {
    this.element.innerHTML = html;
    return this.$compile(this.element.childNodes);
  }

  private extractChildNodes(): Node[] {
    const childNodes: Node[] = [];
    let childNode: Node | null;

    while ((childNode = this.element.firstChild)) {
      (childNode as Element | Comment | Text).remove();
      childNodes.push(childNode);
    }

    return childNodes;
  }

  private getDirectiveRequire(): DirectiveRequireProperty {
    const require = this.directive.require || (this.directive.controller && this.directive.name)!;

    if (isMap(require)) {
      Object.entries(require).forEach(([key, value]) => {
        const match = value.match(REQUIRE_PREFIX_RE)!;
        const name = value.substring(match[0].length);

        if (!name) {
          require[key] = match[0] + key;
        }
      });
    }

    return require;
  }

  private resolveRequire(
    require: DirectiveRequireProperty,
  ): SingleOrListOrMap<IControllerInstance> | null {
    if (!require) {
      return null;
    } else if (Array.isArray(require)) {
      return require.map((req) => this.resolveRequire(req));
    } else if (typeof require === 'object') {
      const value: {[key: string]: IControllerInstance} = {};
      Object.keys(require).forEach((key) => (value[key] = this.resolveRequire(require[key])!));
      return value;
    } else if (typeof require === 'string') {
      const match = require.match(REQUIRE_PREFIX_RE)!;
      const inheritType = match[1] || match[3];

      const name = require.substring(match[0].length);
      const isOptional = !!match[2];
      const searchParents = !!inheritType;
      const startOnParent = inheritType === '^^';

      const ctrlKey = controllerKey(name);
      const elem = startOnParent ? this.$element.parent!() : this.$element;
      const value = searchParents ? elem.inheritedData!(ctrlKey) : elem.data!(ctrlKey);

      if (!value && !isOptional) {
        throw new Error(
          `Unable to find required '${require}' in upgraded directive '${this.name}'.`,
        );
      }

      return value;
    } else {
      throw new Error(
        `Unrecognized 'require' syntax on upgraded directive '${this.name}': ${require}`,
      );
    }
  }
}

function getOrCall<T>(property: T | Function, ...args: any[]): T {
  return isFunction(property) ? property(...args) : property;
}

// NOTE: Only works for `typeof T !== 'object'`.
function isMap<T>(value: SingleOrListOrMap<T>): value is {[key: string]: T} {
  return value && !Array.isArray(value) && typeof value === 'object';
}

function notSupported(name: string, feature: string) {
  throw new Error(`Upgraded directive '${name}' contains unsupported feature: '${feature}'.`);
}
