declare namespace angular {
  function module(prefix: string, dependencies?: string[]);
  interface IModule {
    config(fn: any): IModule;
    directive(selector: string, factory: any): IModule;
    value(key: string, value: any): IModule;
    run(a: any);
  }
  interface ICompileService {
    (element: Element | NodeList | string, transclude?: Function): ILinkFn;
  }
  interface ILinkFn {
    (scope: IScope, cloneAttachFn?: Function, options?: ILinkFnOptions): void
  }
  interface ILinkFnOptions {
    parentBoundTranscludeFn?: Function, transcludeControllers?: {[key: string]: any},
        futureParentElement?: Node
  }
  interface IRootScopeService {
    $new(isolate?: boolean): IScope;
    $id: string;
    $watch(expr: any, fn?: (a1?: any, a2?: any) => void);
    $apply(): any;
    $apply(exp: string): any;
    $apply(exp: Function): any;
    $$childTail: IScope;
    $$childHead: IScope;
    $$nextSibling: IScope;
  }
  interface IScope extends IRootScopeService {}
  interface IAngularBootstrapConfig {}
  interface IDirective {
    compile?: IDirectiveCompileFn;
    controller?: any;
    controllerAs?: string;
    bindToController?: boolean | Object;
    link?: IDirectiveLinkFn | IDirectivePrePost;
    name?: string;
    priority?: number;
    replace?: boolean;
    require?: any;
    restrict?: string;
    scope?: any;
    template?: any;
    templateUrl?: any;
    terminal?: boolean;
    transclude?: any;
  }
  interface IDirectiveCompileFn {
    (templateElement: IAugmentedJQuery, templateAttributes: IAttributes,
     transclude: ITranscludeFunction): IDirectivePrePost;
  }
  interface IDirectivePrePost {
    pre?: IDirectiveLinkFn;
    post?: IDirectiveLinkFn;
  }
  interface IDirectiveLinkFn {
    (scope: IScope, instanceElement: IAugmentedJQuery, instanceAttributes: IAttributes,
     controller: any, transclude: ITranscludeFunction): void;
  }
  interface IAttributes {
    $observe(attr: string, fn: (v: string) => void);
  }
  interface ITranscludeFunction {
    // If the scope is provided, then the cloneAttachFn must be as well.
    (scope: IScope, cloneAttachFn: ICloneAttachFunction): IAugmentedJQuery;
    // If one argument is provided, then it's assumed to be the cloneAttachFn.
    (cloneAttachFn?: ICloneAttachFunction): IAugmentedJQuery;
  }
  interface ICloneAttachFunction {
    // Let's hint but not force cloneAttachFn's signature
    (clonedElement?: IAugmentedJQuery, scope?: IScope): any;
  }
  interface IAugmentedJQuery {
    bind(name: string, fn: () => void);
    data(name: string, value?: any);
    inheritedData(name: string, value?: any);
    contents(): IAugmentedJQuery;
    parent(): IAugmentedJQuery;
    length: number;
    [index: number]: Node;
  }
  interface IParseService {
    (expression: string): ICompiledExpression;
  }
  interface ICompiledExpression {
    assign(context: any, value: any): any;
  }
  function element(e: Element): IAugmentedJQuery;
  function bootstrap(e: Element, modules: string[], config: IAngularBootstrapConfig);
  interface IHttpBackendService {
    (method: string, url: string, post?: any, callback?: Function, headers?: any, timeout?: number,
     withCredentials?: boolean): void;
  }
  interface ICacheObject {
    put<T>(key: string, value?: T): T;
    get(key: string): any;
  }
  interface ITemplateCacheService extends ICacheObject {}
  interface IControllerService {
    (controllerConstructor: Function, locals?: any, later?: any, ident?: any): any;
    (controllerName: string, locals?: any): any;
  }

  namespace auto {
    interface IInjectorService {
      get(key: string): any;
    }
  }
  var version: {major: number};
}

interface Function {
  $inject?: string[];
}
