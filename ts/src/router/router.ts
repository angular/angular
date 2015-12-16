import {Promise, PromiseWrapper, EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {Map, StringMapWrapper, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isString, isPresent, Type, isArray} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {Inject, Injectable} from 'angular2/core';

import {RouteRegistry, ROUTER_PRIMARY_COMPONENT} from './route_registry';
import {
  ComponentInstruction,
  Instruction,
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

  private _subject: EventEmitter<any> = new EventEmitter();


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
   * Register an outlet to be notified of primary route changes.
   *
   * You probably don't need to use this unless you're writing a reusable component.
   */
  registerPrimaryOutlet(outlet: RouterOutlet): Promise<boolean> {
    if (isPresent(outlet.name)) {
      throw new BaseException(`registerPrimaryOutlet expects to be called with an unnamed outlet.`);
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
    var router: Router = this;
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
   * ### Usage
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
   * ### Usage
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
        .then((_) => this._routerCanReuse(instruction))
        .then((_) => this._canActivate(instruction))
        .then((result) => {
          if (!result) {
            return false;
          }
          return this._routerCanDeactivate(instruction)
              .then((result) => {
                if (result) {
                  return this.commit(instruction, _skipLocationChange)
                      .then((_) => {
                        this._emitNavigationFinish(instruction.toRootUrl());
                        return true;
                      });
                }
              });
        });
  }

  /** @internal */
  _settleInstruction(instruction: Instruction): Promise<any> {
    return instruction.resolveComponent().then((_) => {
      instruction.component.reuse = false;

      var unsettledInstructions: Array<Promise<any>> = [];

      if (isPresent(instruction.child)) {
        unsettledInstructions.push(this._settleInstruction(instruction.child));
      }

      StringMapWrapper.forEach(instruction.auxInstruction, (instruction, _) => {
        unsettledInstructions.push(this._settleInstruction(instruction));
      });
      return PromiseWrapper.all(unsettledInstructions);
    });
  }

  private _emitNavigationFinish(url): void { ObservableWrapper.callEmit(this._subject, url); }

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
  _routerCanReuse(instruction: Instruction): Promise<any> {
    if (isBlank(this._outlet)) {
      return _resolveToFalse;
    }
    return this._outlet.routerCanReuse(instruction.component)
        .then((result) => {
          instruction.component.reuse = result;
          if (result && isPresent(this._childRouter) && isPresent(instruction.child)) {
            return this._childRouter._routerCanReuse(instruction.child);
          }
        });
  }

  private _canActivate(nextInstruction: Instruction): Promise<boolean> {
    return canActivateOne(nextInstruction, this._currentInstruction);
  }

  private _routerCanDeactivate(instruction: Instruction): Promise<boolean> {
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
      next = this._outlet.routerCanDeactivate(componentInstruction);
    }
    // TODO: aux route lifecycle hooks
    return next.then((result) => {
      if (result == false) {
        return false;
      }
      if (isPresent(this._childRouter)) {
        return this._childRouter._routerCanDeactivate(childInstruction);
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
    this._auxRouters.forEach((router, name) => {
      if (isPresent(instruction.auxInstruction[name])) {
        promises.push(router.commit(instruction.auxInstruction[name]));
      }
    });

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
    var ancestorComponents = this._getAncestorInstructions();
    return this.registry.recognize(url, ancestorComponents);
  }

  private _getAncestorInstructions(): Instruction[] {
    var ancestorComponents = [];
    var ancestorRouter: Router = this;
    while (isPresent(ancestorRouter.parent) &&
           isPresent(ancestorRouter.parent._currentInstruction)) {
      ancestorRouter = ancestorRouter.parent;
      ancestorComponents.unshift(ancestorRouter._currentInstruction);
    }

    return ancestorComponents;
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
   * Generate an `Instruction` based on the provided Route Link DSL.
   */
  generate(linkParams: any[]): Instruction {
    var ancestorInstructions = this._getAncestorInstructions();
    return this.registry.generate(linkParams, ancestorInstructions);
  }
}

@Injectable()
export class RootRouter extends Router {
  /** @internal */
  _location: Location;
  /** @internal */
  _locationSub: Object;

  constructor(registry: RouteRegistry, location: Location,
              @Inject(ROUTER_PRIMARY_COMPONENT) primaryComponent: Type) {
    super(registry, null, primaryComponent);
    this._location = location;
    this._locationSub = this._location.subscribe((change) => {
      // we call recognize ourselves
      this.recognize(change['url'])
          .then((instruction) => {
            this.navigateByInstruction(instruction, isPresent(change['pop']))
                .then((_) => {
                  // this is a popstate event; no need to change the URL
                  if (isPresent(change['pop']) && change['type'] != 'hashchange') {
                    return;
                  }
                  var emitPath = instruction.toUrlPath();
                  var emitQuery = instruction.toUrlQuery();
                  if (emitPath.length > 0) {
                    emitPath = '/' + emitPath;
                  }

                  // Because we've opted to use All hashchange events occur outside Angular.
                  // However, apps that are migrating might have hash links that operate outside
                  // angular to which routing must respond.
                  // To support these cases where we respond to hashchanges and redirect as a
                  // result, we need to replace the top item on the stack.
                  if (change['type'] == 'hashchange') {
                    if (instruction.toRootUrl() != this._location.path()) {
                      this._location.replaceState(emitPath, emitQuery);
                    }
                  } else {
                    this._location.go(emitPath, emitQuery);
                  }
                });
          });
    });

    this.registry.configFromComponent(primaryComponent);
    this.navigateByUrl(location.path());
  }

  commit(instruction: Instruction, _skipLocationChange: boolean = false): Promise<any> {
    var emitPath = instruction.toUrlPath();
    var emitQuery = instruction.toUrlQuery();
    if (emitPath.length > 0) {
      emitPath = '/' + emitPath;
    }
    var promise = super.commit(instruction);
    if (!_skipLocationChange) {
      promise = promise.then((_) => { this._location.go(emitPath, emitQuery); });
    }
    return promise;
  }

  dispose(): void {
    if (isPresent(this._locationSub)) {
      ObservableWrapper.dispose(this._locationSub);
      this._locationSub = null;
    }
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


function canActivateOne(nextInstruction: Instruction,
                        prevInstruction: Instruction): Promise<boolean> {
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
