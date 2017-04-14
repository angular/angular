/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export type Ng1Token = string;

export type Ng1Expression = string | Function;

export interface IAnnotatedFunction extends Function { $inject?: Ng1Token[]; }

export type IInjectable = (Ng1Token | Function)[] | IAnnotatedFunction;

export type SingleOrListOrMap<T> = T | T[] | {[key: string]: T};

export interface IModule {
  name: string;
  requires: (string|IInjectable)[];
  config(fn: IInjectable): IModule;
  directive(selector: string, factory: IInjectable): IModule;
  component(selector: string, component: IComponent): IModule;
  controller(name: string, type: IInjectable): IModule;
  factory(key: Ng1Token, factoryFn: IInjectable): IModule;
  value(key: Ng1Token, value: any): IModule;
  constant(token: Ng1Token, value: any): IModule;
  run(a: IInjectable): IModule;
}
export interface ICompileService {
  (element: Element|NodeList|Node[]|string, transclude?: Function): ILinkFn;
}
export interface ILinkFn {
  (scope: IScope, cloneAttachFn?: ICloneAttachFunction, options?: ILinkFnOptions): IAugmentedJQuery;
}
export interface ILinkFnOptions {
  parentBoundTranscludeFn?: Function;
  transcludeControllers?: {[key: string]: any};
  futureParentElement?: Node;
}
export interface IRootScopeService {
  $new(isolate?: boolean): IScope;
  $id: string;
  $parent: IScope;
  $root: IScope;
  $watch(exp: Ng1Expression, fn?: (a1?: any, a2?: any) => void): Function;
  $on(event: string, fn?: (event?: any, ...args: any[]) => void): Function;
  $destroy(): any;
  $apply(exp?: Ng1Expression): any;
  $digest(): any;
  $evalAsync(): any;
  $on(event: string, fn?: (event?: any, ...args: any[]) => void): Function;
  $$childTail: IScope;
  $$childHead: IScope;
  $$nextSibling: IScope;
  [key: string]: any;
}
export interface IScope extends IRootScopeService {}

export interface IAngularBootstrapConfig { strictDi?: boolean; }
export interface IDirective {
  compile?: IDirectiveCompileFn;
  controller?: IController;
  controllerAs?: string;
  bindToController?: boolean|{[key: string]: string};
  link?: IDirectiveLinkFn|IDirectivePrePost;
  name?: string;
  priority?: number;
  replace?: boolean;
  require?: DirectiveRequireProperty;
  restrict?: string;
  scope?: boolean|{[key: string]: string};
  template?: string|Function;
  templateUrl?: string|Function;
  templateNamespace?: string;
  terminal?: boolean;
  transclude?: boolean|'element'|{[key: string]: string};
}
export type DirectiveRequireProperty = SingleOrListOrMap<string>;
export interface IDirectiveCompileFn {
  (templateElement: IAugmentedJQuery, templateAttributes: IAttributes,
   transclude: ITranscludeFunction): IDirectivePrePost;
}
export interface IDirectivePrePost {
  pre?: IDirectiveLinkFn;
  post?: IDirectiveLinkFn;
}
export interface IDirectiveLinkFn {
  (scope: IScope, instanceElement: IAugmentedJQuery, instanceAttributes: IAttributes,
   controller: any, transclude: ITranscludeFunction): void;
}
export interface IComponent {
  bindings?: {[key: string]: string};
  controller?: string|IInjectable;
  controllerAs?: string;
  require?: DirectiveRequireProperty;
  template?: string|Function;
  templateUrl?: string|Function;
  transclude?: boolean;
}
export interface IAttributes { $observe(attr: string, fn: (v: string) => void): void; }
export interface ITranscludeFunction {
  // If the scope is provided, then the cloneAttachFn must be as well.
  (scope: IScope, cloneAttachFn: ICloneAttachFunction): IAugmentedJQuery;
  // If one argument is provided, then it's assumed to be the cloneAttachFn.
  (cloneAttachFn?: ICloneAttachFunction): IAugmentedJQuery;
}
export interface ICloneAttachFunction {
  // Let's hint but not force cloneAttachFn's signature
  (clonedElement?: IAugmentedJQuery, scope?: IScope): any;
}
export type IAugmentedJQuery = Node[] & {
  bind?: (name: string, fn: () => void) => void;
  data?: (name: string, value?: any) => any;
  text?: () => string;
  inheritedData?: (name: string, value?: any) => any;
  contents?: () => IAugmentedJQuery;
  parent?: () => IAugmentedJQuery;
  empty?: () => void;
  append?: (content: IAugmentedJQuery | string) => IAugmentedJQuery;
  controller?: (name: string) => any;
  isolateScope?: () => IScope;
  injector?: () => IInjectorService;
};
export interface IProvider { $get: IInjectable; }
export interface IProvideService {
  provider(token: Ng1Token, provider: IProvider): IProvider;
  factory(token: Ng1Token, factory: IInjectable): IProvider;
  service(token: Ng1Token, type: IInjectable): IProvider;
  value(token: Ng1Token, value: any): IProvider;
  constant(token: Ng1Token, value: any): void;
  decorator(token: Ng1Token, factory: IInjectable): void;
}
export interface IParseService { (expression: string): ICompiledExpression; }
export interface ICompiledExpression { assign(context: any, value: any): any; }
export interface IHttpBackendService {
  (method: string, url: string, post?: any, callback?: Function, headers?: any, timeout?: number,
   withCredentials?: boolean): void;
}
export interface ICacheObject {
  put<T>(key: string, value?: T): T;
  get(key: string): any;
}
export interface ITemplateCacheService extends ICacheObject {}
export interface ITemplateRequestService {
  (template: string|any /* TrustedResourceUrl */, ignoreRequestError?: boolean): Promise<string>;
  totalPendingRequests: number;
}
export type IController = string | IInjectable;
export interface IControllerService {
  (controllerConstructor: IController, locals?: any, later?: any, ident?: any): any;
  (controllerName: string, locals?: any): any;
}

export interface IInjectorService {
  get(key: string): any;
  has(key: string): boolean;
}

export interface ITestabilityService {
  findBindings(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
  findModels(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
  getLocation(): string;
  setLocation(url: string): void;
  whenStable(callback: Function): void;
}

export interface INgModelController {
  $render(): void;
  $isEmpty(value: any): boolean;
  $setValidity(validationErrorKey: string, isValid: boolean): void;
  $setPristine(): void;
  $setDirty(): void;
  $setUntouched(): void;
  $setTouched(): void;
  $rollbackViewValue(): void;
  $validate(): void;
  $commitViewValue(): void;
  $setViewValue(value: any, trigger: string): void;

  $viewValue: any;
  $modelValue: any;
  $parsers: Function[];
  $formatters: Function[];
  $validators: {[key: string]: Function};
  $asyncValidators: {[key: string]: Function};
  $viewChangeListeners: Function[];
  $error: Object;
  $pending: Object;
  $untouched: boolean;
  $touched: boolean;
  $pristine: boolean;
  $dirty: boolean;
  $valid: boolean;
  $invalid: boolean;
  $name: string;
}

function noNg() {
  throw new Error('AngularJS v1.x is not loaded!');
}


let angular: {
  bootstrap: (e: Element, modules: (string | IInjectable)[], config: IAngularBootstrapConfig) =>
                 void,
  module: (prefix: string, dependencies?: string[]) => IModule,
  element: (e: Element | string) => IAugmentedJQuery,
  version: {major: number},
  resumeBootstrap: () => void,
  getTestability: (e: Element) => ITestabilityService
} = <any>{
  bootstrap: noNg,
  module: noNg,
  element: noNg,
  version: noNg,
  resumeBootstrap: noNg,
  getTestability: noNg
};

try {
  if (window.hasOwnProperty('angular')) {
    angular = (<any>window).angular;
  }
} catch (e) {
  // ignore in CJS mode.
}

/**
 * Resets the AngularJS library.
 *
 * Used when angularjs is loaded lazily, and not available on `window`.
 *
 * @stable
 */
export function setAngularLib(ng: any): void {
  angular = ng;
}

/**
 * Returns the current version of the AngularJS library.
 *
 * @stable
 */
export function getAngularLib(): any {
  return angular;
}

export const bootstrap =
    (e: Element, modules: (string | IInjectable)[], config: IAngularBootstrapConfig): void =>
        angular.bootstrap(e, modules, config);

export const module = (prefix: string, dependencies?: string[]): IModule =>
    angular.module(prefix, dependencies);

export const element = (e: Element | string): IAugmentedJQuery => angular.element(e);

export const resumeBootstrap = (): void => angular.resumeBootstrap();

export const getTestability = (e: Element): ITestabilityService => angular.getTestability(e);

export const version = angular.version;
