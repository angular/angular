declare namespace angular {
  function module(prefix: string, dependencies?: string[]);
  interface IModule {
    directive(selector: string, factory: any): IModule;
    value(key: string, value: any): IModule;
    run(a: any);
  }
  interface ICompileService {
    (element: Element): (IScope) => void;
  }
  interface IRootScopeService {
    $new(): IScope;
    $watch(expr: any, fn?: (a1?: any, a2?: any) => void);
    $apply(): any;
    $apply(exp: string): any;
    $apply(exp: (scope: IScope) => any): any;
  }
  interface IScope extends IRootScopeService {}
  interface IAngularBootstrapConfig {}
  interface IDirective {}
  interface IAttributes {
    $observe(attr: string, fn: (v: string) => void);
  }
  interface ITranscludeFunction {}
  interface IAugmentedJQuery {
    bind(name: string, fn: () => void);
  }
  interface IParseService {
    (expression: string): ICompiledExpression;
  }
  interface ICompiledExpression {
    assign(context: any, value: any): any;
  }
  function element(e: Element);
  function bootstrap(e: Element, modules: IModule[], config: IAngularBootstrapConfig);

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
