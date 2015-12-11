import {Map, MapWrapper, StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, normalizeBlank, Type, CONST_EXPR} from 'angular2/src/facade/lang';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';


/**
 * `RouteParams` is an immutable map of parameters for the given route
 * based on the url matcher and optional parameters for that route.
 *
 * You can inject `RouteParams` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, as: 'UserCmp'},
 * ])
 * class AppCmp {}
 *
 * @Component({ template: 'user: {{id}}' })
 * class UserCmp {
 *   id: string;
 *   constructor(params: RouteParams) {
 *     this.id = params.get('id');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export class RouteParams {
  constructor(public params: {[key: string]: string}) {}

  get(param: string): string { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
}

/**
 * `RouteData` is an immutable map of additional data you can configure in your {@link Route}.
 *
 * You can inject `RouteData` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component, View} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, routerBindings, RouteConfig} from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, as: 'UserCmp', data: {isAdmin: true}},
 * ])
 * class AppCmp {}
 *
 * @Component({...})
 * @View({ template: 'user: {{isAdmin}}' })
 * class UserCmp {
 *   string: isAdmin;
 *   constructor(data: RouteData) {
 *     this.isAdmin = data.get('isAdmin');
 *   }
 * }
 *
 * bootstrap(AppCmp, routerBindings(AppCmp));
 * ```
 */
export class RouteData {
  constructor(public data: {[key: string]: any} = CONST_EXPR({})) {}

  get(key: string): any { return normalizeBlank(StringMapWrapper.get(this.data, key)); }
}

export var BLANK_ROUTE_DATA = new RouteData();

/**
 * `Instruction` is a tree of {@link ComponentInstruction}s with all the information needed
 * to transition each component in the app to a given route, including all auxiliary routes.
 *
 * `Instruction`s can be created using {@link Router#generate}, and can be used to
 * perform route changes with {@link Router#navigateByInstruction}.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(router: Router) {
 *     var instruction = router.generate(['/MyRoute']);
 *     router.navigateByInstruction(instruction);
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export abstract class Instruction {
  public component: ComponentInstruction;
  public child: Instruction;
  public auxInstruction: {[key: string]: Instruction} = {};

  get urlPath(): string { return this.component.urlPath; }

  get urlParams(): string[] { return this.component.urlParams; }

  get specificity(): number {
    var total = 0;
    if (isPresent(this.component)) {
      total += this.component.specificity;
    }
    if (isPresent(this.child)) {
      total += this.child.specificity;
    }
    return total;
  }

  abstract resolveComponent(): Promise<ComponentInstruction>;

  /**
   * converts the instruction into a URL string
   */
  toRootUrl(): string { return this.toUrlPath() + this.toUrlQuery(); }

  /** @internal */
  _toNonRootUrl(): string {
    return this._stringifyPathMatrixAuxPrefixed() +
           (isPresent(this.child) ? this.child._toNonRootUrl() : '');
  }

  toUrlQuery(): string { return this.urlParams.length > 0 ? ('?' + this.urlParams.join('&')) : ''; }

  /**
   * Returns a new instruction that shares the state of the existing instruction, but with
   * the given child {@link Instruction} replacing the existing child.
   */
  replaceChild(child: Instruction): Instruction {
    return new ResolvedInstruction(this.component, child, this.auxInstruction);
  }

  /**
   * If the final URL for the instruction is ``
   */
  toUrlPath(): string {
    return this.urlPath + this._stringifyAux() +
           (isPresent(this.child) ? this.child._toNonRootUrl() : '');
  }

  // default instructions override these
  toLinkUrl(): string {
    return this.urlPath + this._stringifyAux() +
           (isPresent(this.child) ? this.child._toLinkUrl() : '');
  }

  // this is the non-root version (called recursively)
  /** @internal */
  _toLinkUrl(): string {
    return this._stringifyPathMatrixAuxPrefixed() +
           (isPresent(this.child) ? this.child._toLinkUrl() : '');
  }

  /** @internal */
  _stringifyPathMatrixAuxPrefixed(): string {
    var primary = this._stringifyPathMatrixAux();
    if (primary.length > 0) {
      primary = '/' + primary;
    }
    return primary;
  }

  /** @internal */
  _stringifyMatrixParams(): string {
    return this.urlParams.length > 0 ? (';' + this.component.urlParams.join(';')) : '';
  }

  /** @internal */
  _stringifyPathMatrixAux(): string {
    if (isBlank(this.component)) {
      return '';
    }
    return this.urlPath + this._stringifyMatrixParams() + this._stringifyAux();
  }

  /** @internal */
  _stringifyAux(): string {
    var routes = [];
    StringMapWrapper.forEach(this.auxInstruction, (auxInstruction, _) => {
      routes.push(auxInstruction._stringifyPathMatrixAux());
    });
    if (routes.length > 0) {
      return '(' + routes.join('//') + ')';
    }
    return '';
  }
}


/**
 * a resolved instruction has an outlet instruction for itself, but maybe not for...
 */
export class ResolvedInstruction extends Instruction {
  constructor(public component: ComponentInstruction, public child: Instruction,
              public auxInstruction: {[key: string]: Instruction}) {
    super();
  }

  resolveComponent(): Promise<ComponentInstruction> {
    return PromiseWrapper.resolve(this.component);
  }
}


/**
 * Represents a resolved default route
 */
export class DefaultInstruction extends Instruction {
  constructor(public component: ComponentInstruction, public child: DefaultInstruction) { super(); }

  resolveComponent(): Promise<ComponentInstruction> {
    return PromiseWrapper.resolve(this.component);
  }

  toLinkUrl(): string { return ''; }

  /** @internal */
  _toLinkUrl(): string { return ''; }
}


/**
 * Represents a component that may need to do some redirection or lazy loading at a later time.
 */
export class UnresolvedInstruction extends Instruction {
  constructor(private _resolver: () => Promise<Instruction>, private _urlPath: string = '',
              private _urlParams: string[] = CONST_EXPR([])) {
    super();
  }

  get urlPath(): string {
    if (isPresent(this.component)) {
      return this.component.urlPath;
    }
    if (isPresent(this._urlPath)) {
      return this._urlPath;
    }
    return '';
  }

  get urlParams(): string[] {
    if (isPresent(this.component)) {
      return this.component.urlParams;
    }
    if (isPresent(this._urlParams)) {
      return this._urlParams;
    }
    return [];
  }

  resolveComponent(): Promise<ComponentInstruction> {
    if (isPresent(this.component)) {
      return PromiseWrapper.resolve(this.component);
    }
    return this._resolver().then((resolution: Instruction) => {
      this.child = resolution.child;
      return this.component = resolution.component;
    });
  }
}


export class RedirectInstruction extends ResolvedInstruction {
  constructor(component: ComponentInstruction, child: Instruction,
              auxInstruction: {[key: string]: Instruction}) {
    super(component, child, auxInstruction);
  }
}


/**
 * A `ComponentInstruction` represents the route state for a single component. An `Instruction` is
 * composed of a tree of these `ComponentInstruction`s.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 *
 * `ComponentInstruction`s are [https://en.wikipedia.org/wiki/Hash_consing](hash consed). You should
 * never construct one yourself with "new." Instead, rely on {@link Router/RouteRecognizer} to
 * construct `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
export class ComponentInstruction {
  reuse: boolean = false;
  public routeData: RouteData;

  constructor(public urlPath: string, public urlParams: string[], data: RouteData,
              public componentType, public terminal: boolean, public specificity: number,
              public params: {[key: string]: any} = null) {
    this.routeData = isPresent(data) ? data : BLANK_ROUTE_DATA;
  }
}
