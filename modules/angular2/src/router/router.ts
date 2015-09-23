import {
  Promise,
  PromiseWrapper,
  EventEmitter,
  ObservableWrapper
} from 'angular2/src/core/facade/async';
import {Map, StringMapWrapper, MapWrapper, ListWrapper} from 'angular2/src/core/facade/collection';
import {
  isBlank,
  isString,
  StringWrapper,
  isPresent,
  Type,
  isArray
} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {RouteRegistry} from './route_registry';
import {
  ComponentInstruction,
  Instruction,
  stringifyInstruction,
  stringifyInstructionPath,
  stringifyInstructionQuery
} from './instruction';
import {RouterOutlet} from './router_outlet';
import {Location} from './location';
import {getCanActivateHook} from './route_lifecycle_reflector';
import {RouteDefinition} from './route_config_impl';

let _resolveToTrue = PromiseWrapper.resolve(true);
let _resolveToFalse = PromiseWrapper.resolve(false);

/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 *
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of {@link RouterOutlet}.
 * An outlet is a placeholder that the router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognize it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 */
export class Router {
  navigating: boolean = false;
  lastNavigationAttempt: string;

  private _currentInstruction: Instruction = null;

  private _currentNavigation: Promise<any> = _resolveToTrue;
  private _outlet: RouterOutlet = null;

  private _auxRouters = new Map<string, Router>();
  private _childRouter: Router;

  private _subject: EventEmitter = new EventEmitter();


  constructor(public registry: RouteRegistry, public parent: Router, public hostComponent: any) {}


  /**
   * Constructs a child router. You probably don't need to use this unless you're writing a reusable
   * component.
   */
  childRouter(hostComponent: any): Router {
    return this._childRouter = new ChildRouter(this, hostComponent);
  }


  /**
   * Constructs a child router. You probably don't need to use this unless you're writing a reusable
   * component.
   */
  auxRouter(hostComponent: any): Router { return new ChildRouter(this, hostComponent); }

  /**
   * Register an outlet to notified of primary route changes.
   *
   * You probably don't need to use this unless you're writing a reusable component.
   */
  registerPrimaryOutlet(outlet: RouterOutlet): Promise<boolean> {
    if (isPresent(outlet.name)) {
      throw new BaseException(`registerAuxOutlet expects to be called with an unnamed outlet.`);
    }

    this._outlet = outlet;
    if (isPresent(this._currentInstruction)) {
      return this.commit(this._currentInstruction, false);
    }
    return _resolveToTrue;
  }

  /**
   * Register an outlet to notified of auxiliary route changes.
   *
   * You probably don't need to use this unless you're writing a reusable component.
   */
  registerAuxOutlet(outlet: RouterOutlet): Promise<boolean> {
    var outletName = outlet.name;
    if (isBlank(outletName)) {
      throw new BaseException(`registerAuxOutlet expects to be called with an outlet with a name.`);
    }

    // TODO...
    // what is the host of an aux route???
    var router = this.auxRouter(this.hostComponent);

    this._auxRouters.set(outletName, router);
    router._outlet = outlet;

    var auxInstruction;
    if (isPresent(this._currentInstruction) &&
        isPresent(auxInstruction = this._currentInstruction.auxInstruction[outletName])) {
      return router.commit(auxInstruction);
    }
    return _resolveToTrue;
  }


  /**
   * Given an instruction, returns `true` if the instruction is currently active,
   * otherwise `false`.
   */
  isRouteActive(instruction: Instruction): boolean {
    var router = this;
    while (isPresent(router.parent) && isPresent(instruction.child)) {
      router = router.parent;
      instruction = instruction.child;
    }
    return isPresent(this._currentInstruction) &&
           this._currentInstruction.component == instruction.component;
  }

  /**
   * Dynamically update the routing configuration and trigger a navigation.
   *
   * # Usage
   *
   * ```
   * router.config([
   *   { 'path': '/', 'component': IndexComp },
   *   { 'path': '/user/:id', 'component': UserComp },
   * ]);
   * ```
   */
  config(definitions: RouteDefinition[]): Promise<any> {
    definitions.forEach(
        (routeDefinition) => { this.registry.config(this.hostComponent, routeDefinition); });
    return this.renavigate();
  }

  /**
   * Navigate based on the provided Route Link DSL. It's preferred to navigate with this method
   * over `navigateByUrl`.
   *
   * # Usage
   *
   * This method takes an array representing the Route Link DSL:
   * ```
   * ['./MyCmp', {param: 3}]
   * ```
   * See the {@link RouterLink} directive for more.
   */
  navigate(linkParams: any[]): Promise<any> {
    var instruction = this.generate(linkParams);
    return this.navigateByInstruction(instruction, false);
  }


  /**
   * Navigate to a URL. Returns a promise that resolves when navigation is complete.
   * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
   *
   * If the given URL begins with a `/`, router will navigate absolutely.
   * If the given URL does not begin with `/`, the router will navigate relative to this component.
   */
  navigateByUrl(url: string, _skipLocationChange: boolean = false): Promise<any> {
    return this._currentNavigation = this._currentNavigation.then((_) => {
      this.lastNavigationAttempt = url;
      this._startNavigating();
      return this._afterPromiseFinishNavigating(this.recognize(url).then((instruction) => {
        if (isBlank(instruction)) {
          return false;
        }
        return this._navigate(instruction, _skipLocationChange);
      }));
    });
  }


  /**
   * Navigate via the provided instruction. Returns a promise that resolves when navigation is
   * complete.
   */
  navigateByInstruction(instruction: Instruction,
                        _skipLocationChange: boolean = false): Promise<any> {
    if (isBlank(instruction)) {
      return _resolveToFalse;
    }
    return this._currentNavigation = this._currentNavigation.then((_) => {
      this._startNavigating();
      return this._afterPromiseFinishNavigating(this._navigate(instruction, _skipLocationChange));
    });
  }

  /** @internal */
  _navigate(instruction: Instruction, _skipLocationChange: boolean): Promise<any> {
    return this._settleInstruction(instruction)
        .then((_) => this._canReuse(instruction))
        .then((_) => this._canActivate(instruction))
        .then((result) => {
          if (!result) {
            return false;
          }
          return this._canDeactivate(instruction)
              .then((result) => {
                if (result) {
                  return this.commit(instruction, _skipLocationChange)
                      .then((_) => {
                        this._emitNavigationFinish(stringifyInstruction(instruction));
                        return true;
                      });
                }
              });
        });
  }

  // TODO(btford): it'd be nice to remove this method as part of cleaning up the traversal logic
  // Since refactoring `Router.generate` to return an instruction rather than a string, it's not
  // guaranteed that the `componentType`s for the terminal async routes have been loaded by the time
  // we begin navigation. The method below simply traverses instructions and resolves any components
  // for which `componentType` is not present
  /** @internal */
  _settleInstruction(instruction: Instruction): Promise<any> {
    var unsettledInstructions: Array<Promise<any>> = [];
    if (isBlank(instruction.component.componentType)) {
      unsettledInstructions.push(instruction.component.resolveComponentType().then(
          (type: Type) => { this.registry.configFromComponent(type); }));
    }
    if (isPresent(instruction.child)) {
      unsettledInstructions.push(this._settleInstruction(instruction.child));
    }
    StringMapWrapper.forEach(instruction.auxInstruction, (instruction, _) => {
      unsettledInstructions.push(this._settleInstruction(instruction));
    });
    return PromiseWrapper.all(unsettledInstructions);
  }

  private _emitNavigationFinish(url): void { ObservableWrapper.callNext(this._subject, url); }

  private _afterPromiseFinishNavigating(promise: Promise<any>): Promise<any> {
    return PromiseWrapper.catchError(promise.then((_) => this._finishNavigating()), (err) => {
      this._finishNavigating();
      throw err;
    });
  }

  /*
   * Recursively set reuse flags
   */
  /** @internal */
  _canReuse(instruction: Instruction): Promise<any> {
    if (isBlank(this._outlet)) {
      return _resolveToFalse;
    }
    return this._outlet.canReuse(instruction.component)
        .then((result) => {
          instruction.component.reuse = result;
          if (result && isPresent(this._childRouter) && isPresent(instruction.child)) {
            return this._childRouter._canReuse(instruction.child);
          }
        });
  }

  private _canActivate(nextInstruction: Instruction): Promise<boolean> {
    return canActivateOne(nextInstruction, this._currentInstruction);
  }

  private _canDeactivate(instruction: Instruction): Promise<boolean> {
    if (isBlank(this._outlet)) {
      return _resolveToTrue;
    }
    var next: Promise<boolean>;
    var childInstruction: Instruction = null;
    var reuse: boolean = false;
    var componentInstruction: ComponentInstruction = null;
    if (isPresent(instruction)) {
      childInstruction = instruction.child;
      componentInstruction = instruction.component;
      reuse = instruction.component.reuse;
    }
    if (reuse) {
      next = _resolveToTrue;
    } else {
      next = this._outlet.canDeactivate(componentInstruction);
    }
    // TODO: aux route lifecycle hooks
    return next.then((result) => {
      if (result == false) {
        return false;
      }
      if (isPresent(this._childRouter)) {
        return this._childRouter._canDeactivate(childInstruction);
      }
      return true;
    });
  }

  /**
   * Updates this router and all descendant routers according to the given instruction
   */
  commit(instruction: Instruction, _skipLocationChange: boolean = false): Promise<any> {
    this._currentInstruction = instruction;
    var next: Promise<any> = _resolveToTrue;
    if (isPresent(this._outlet)) {
      var componentInstruction = instruction.component;
      if (componentInstruction.reuse) {
        next = this._outlet.reuse(componentInstruction);
      } else {
        next =
            this.deactivate(instruction).then((_) => this._outlet.activate(componentInstruction));
      }
      if (isPresent(instruction.child)) {
        next = next.then((_) => {
          if (isPresent(this._childRouter)) {
            return this._childRouter.commit(instruction.child);
          }
        });
      }
    }

    var promises = [];
    this._auxRouters.forEach(
        (router, name) => { promises.push(router.commit(instruction.auxInstruction[name])); });

    return next.then((_) => PromiseWrapper.all(promises));
  }


  /** @internal */
  _startNavigating(): void { this.navigating = true; }

  /** @internal */
  _finishNavigating(): void { this.navigating = false; }


  /**
   * Subscribe to URL updates from the router
   */
  subscribe(onNext: (value: any) => void): Object {
    return ObservableWrapper.subscribe(this._subject, onNext);
  }


  /**
   * Removes the contents of this router's outlet and all descendant outlets
   */
  deactivate(instruction: Instruction): Promise<any> {
    var childInstruction: Instruction = null;
    var componentInstruction: ComponentInstruction = null;
    if (isPresent(instruction)) {
      childInstruction = instruction.child;
      componentInstruction = instruction.component;
    }
    var next: Promise<any> = _resolveToTrue;
    if (isPresent(this._childRouter)) {
      next = this._childRouter.deactivate(childInstruction);
    }
    if (isPresent(this._outlet)) {
      next = next.then((_) => this._outlet.deactivate(componentInstruction));
    }

    // TODO: handle aux routes

    return next;
  }


  /**
   * Given a URL, returns an instruction representing the component graph
   */
  recognize(url: string): Promise<Instruction> {
    return this.registry.recognize(url, this.hostComponent);
  }


  /**
   * Navigates to either the last URL successfully navigated to, or the last URL requested if the
   * router has yet to successfully navigate.
   */
  renavigate(): Promise<any> {
    if (isBlank(this.lastNavigationAttempt)) {
      return this._currentNavigation;
    }
    return this.navigateByUrl(this.lastNavigationAttempt);
  }


  /**
   * Generate a URL from a component name and optional map of parameters. The URL is relative to the
   * app's base href.
   */
  generate(linkParams: any[]): Instruction {
    let normalizedLinkParams = splitAndFlattenLinkParams(linkParams);

    var first = ListWrapper.first(normalizedLinkParams);
    var rest = ListWrapper.slice(normalizedLinkParams, 1);

    var router = this;

    // The first segment should be either '.' (generate from parent) or '' (generate from root).
    // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
    if (first == '') {
      while (isPresent(router.parent)) {
        router = router.parent;
      }
    } else if (first == '..') {
      router = router.parent;
      while (ListWrapper.first(rest) == '..') {
        rest = ListWrapper.slice(rest, 1);
        router = router.parent;
        if (isBlank(router)) {
          throw new BaseException(
              `Link "${ListWrapper.toJSON(linkParams)}" has too many "../" segments.`);
        }
      }
    } else if (first != '.') {
      throw new BaseException(
          `Link "${ListWrapper.toJSON(linkParams)}" must start with "/", "./", or "../"`);
    }

    if (rest[rest.length - 1] == '') {
      rest.pop();
    }

    if (rest.length < 1) {
      let msg = `Link "${ListWrapper.toJSON(linkParams)}" must include a route name.`;
      throw new BaseException(msg);
    }

    // TODO: structural cloning and whatnot

    var url = [];
    var parent = router.parent;
    while (isPresent(parent)) {
      url.unshift(parent._currentInstruction);
      parent = parent.parent;
    }

    var nextInstruction = this.registry.generate(rest, router.hostComponent);

    while (url.length > 0) {
      nextInstruction = url.pop().replaceChild(nextInstruction);
    }

    return nextInstruction;
  }
}

export class RootRouter extends Router {
  /** @internal */
  _location: Location;

  constructor(registry: RouteRegistry, location: Location, primaryComponent: Type) {
    super(registry, null, primaryComponent);
    this._location = location;
    this._location.subscribe((change) =>
                                 this.navigateByUrl(change['url'], isPresent(change['pop'])));
    this.registry.configFromComponent(primaryComponent);
    this.navigateByUrl(location.path());
  }

  commit(instruction: Instruction, _skipLocationChange: boolean = false): Promise<any> {
    var emitPath = stringifyInstructionPath(instruction);
    var emitQuery = stringifyInstructionQuery(instruction);
    if (emitPath.length > 0) {
      emitPath = '/' + emitPath;
    }
    var promise = super.commit(instruction);
    if (!_skipLocationChange) {
      promise = promise.then((_) => { this._location.go(emitPath, emitQuery); });
    }
    return promise;
  }
}

class ChildRouter extends Router {
  constructor(parent: Router, hostComponent) {
    super(parent.registry, parent, hostComponent);
    this.parent = parent;
  }


  navigateByUrl(url: string, _skipLocationChange: boolean = false): Promise<any> {
    // Delegate navigation to the root router
    return this.parent.navigateByUrl(url, _skipLocationChange);
  }

  navigateByInstruction(instruction: Instruction,
                        _skipLocationChange: boolean = false): Promise<any> {
    // Delegate navigation to the root router
    return this.parent.navigateByInstruction(instruction, _skipLocationChange);
  }
}

/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
var SLASH = new RegExp('/');
function splitAndFlattenLinkParams(linkParams: any[]): any[] {
  return ListWrapper.reduce(linkParams, (accumulation, item) => {
    if (isString(item)) {
      return accumulation.concat(StringWrapper.split(item, SLASH));
    }
    accumulation.push(item);
    return accumulation;
  }, []);
}

function canActivateOne(nextInstruction: Instruction, prevInstruction: Instruction):
    Promise<boolean> {
  var next = _resolveToTrue;
  if (isPresent(nextInstruction.child)) {
    next = canActivateOne(nextInstruction.child,
                          isPresent(prevInstruction) ? prevInstruction.child : null);
  }
  return next.then((result) => {
    if (result == false) {
      return false;
    }
    if (nextInstruction.component.reuse) {
      return true;
    }
    var hook = getCanActivateHook(nextInstruction.component.componentType);
    if (isPresent(hook)) {
      return hook(nextInstruction.component,
                  isPresent(prevInstruction) ? prevInstruction.component : null);
    }
    return true;
  });
}
