export interface IModule {
    config(fn: any): IModule;
    directive(selector: string, factory: any): IModule;
    component(selector: string, component: IComponent): IModule;
    controller(name: string, type: any): IModule;
    factory(key: string, factoryFn: any): IModule;
    value(key: string, value: any): IModule;
    run(a: any): void;
}
export interface ICompileService {
    (element: Element | NodeList | string, transclude?: Function): ILinkFn;
}
export interface ILinkFn {
    (scope: IScope, cloneAttachFn?: Function, options?: ILinkFnOptions): void;
}
export interface ILinkFnOptions {
    parentBoundTranscludeFn?: Function;
    transcludeControllers?: {
        [key: string]: any;
    };
    futureParentElement?: Node;
}
export interface IRootScopeService {
    $new(isolate?: boolean): IScope;
    $id: string;
    $watch(expr: any, fn?: (a1?: any, a2?: any) => void): Function;
    $destroy(): any;
    $apply(): any;
    $apply(exp: string): any;
    $apply(exp: Function): any;
    $$childTail: IScope;
    $$childHead: IScope;
    $$nextSibling: IScope;
}
export interface IScope extends IRootScopeService {
}
export interface IAngularBootstrapConfig {
}
export interface IDirective {
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
export interface IDirectiveCompileFn {
    (templateElement: IAugmentedJQuery, templateAttributes: IAttributes, transclude: ITranscludeFunction): IDirectivePrePost;
}
export interface IDirectivePrePost {
    pre?: IDirectiveLinkFn;
    post?: IDirectiveLinkFn;
}
export interface IDirectiveLinkFn {
    (scope: IScope, instanceElement: IAugmentedJQuery, instanceAttributes: IAttributes, controller: any, transclude: ITranscludeFunction): void;
}
export interface IComponent {
    bindings?: Object;
    controller?: any;
    controllerAs?: string;
    require?: any;
    template?: any;
    templateUrl?: any;
    transclude?: any;
}
export interface IAttributes {
    $observe(attr: string, fn: (v: string) => void): void;
}
export interface ITranscludeFunction {
    (scope: IScope, cloneAttachFn: ICloneAttachFunction): IAugmentedJQuery;
    (cloneAttachFn?: ICloneAttachFunction): IAugmentedJQuery;
}
export interface ICloneAttachFunction {
    (clonedElement?: IAugmentedJQuery, scope?: IScope): any;
}
export interface IAugmentedJQuery {
    bind(name: string, fn: () => void): void;
    data(name: string, value?: any): any;
    inheritedData(name: string, value?: any): any;
    contents(): IAugmentedJQuery;
    parent(): IAugmentedJQuery;
    length: number;
    [index: number]: Node;
}
export interface IParseService {
    (expression: string): ICompiledExpression;
}
export interface ICompiledExpression {
    assign(context: any, value: any): any;
}
export interface IHttpBackendService {
    (method: string, url: string, post?: any, callback?: Function, headers?: any, timeout?: number, withCredentials?: boolean): void;
}
export interface ICacheObject {
    put<T>(key: string, value?: T): T;
    get(key: string): any;
}
export interface ITemplateCacheService extends ICacheObject {
}
export interface IControllerService {
    (controllerConstructor: Function, locals?: any, later?: any, ident?: any): any;
    (controllerName: string, locals?: any): any;
}
export interface IInjectorService {
    get(key: string): any;
}
export interface ITestabilityService {
    findBindings(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
    findModels(element: Element, expression: string, opt_exactMatch?: boolean): Element[];
    getLocation(): string;
    setLocation(url: string): void;
    whenStable(callback: Function): void;
}
export declare var bootstrap: (e: Element, modules: string[], config: IAngularBootstrapConfig) => void;
export declare var module: (prefix: string, dependencies?: string[]) => IModule;
export declare var element: (e: Element) => IAugmentedJQuery;
export declare var version: {
    major: number;
};
export declare var resumeBootstrap: () => void;
export declare var getTestability: (e: Element) => ITestabilityService;
