import {Promise, PromiseWrapper, EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent, Type} from 'angular2/src/facade/lang';

import {RouteRegistry} from './route_registry';
import {Pipeline} from './pipeline';
import {Instruction} from './instruction';
import {RouterOutlet} from './router_outlet';
import {Location} from './location';

/**
 * # Router
 * The router is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of "outlets." An outlet is a placeholder that the
 * router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognizes it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 *
 * @exportedAs angular2/router
 */
export class Router {
  navigating: boolean;
  lastNavigationAttempt: string;
  previousUrl: string;

  private _currentInstruction: Instruction;
  private _currentNavigation: Promise<any>;
  private _outlet: RouterOutlet;
  private _subject: EventEmitter;
  // todo(jeffbcross): rename _registry to registry since it is accessed from subclasses
  // todo(jeffbcross): rename _pipeline to pipeline since it is accessed from subclasses
  constructor(public _registry: RouteRegistry, public _pipeline: Pipeline, public parent: Router,
              public hostComponent: any) {
    this.navigating = false;
    this.previousUrl = null;
    this._outlet = null;
    this._subject = new EventEmitter();
    this._currentInstruction = null;
    this._currentNavigation = PromiseWrapper.resolve(true);
  }


  /**
   * Constructs a child router. You probably don't need to use this unless you're writing a reusable
   * component.
   */
  childRouter(hostComponent: any): Router { return new ChildRouter(this, hostComponent); }


  /**
   * Register an object to notify of route changes. You probably don't need to use this unless
   * you're writing a reusable component.
   */
  registerOutlet(outlet: RouterOutlet): Promise<boolean> {
    // TODO: sibling routes
    this._outlet = outlet;
    if (isPresent(this._currentInstruction)) {
      return outlet.activate(this._currentInstruction);
    }
    return PromiseWrapper.resolve(true);
  }


  /**
   * Dynamically update the routing configuration and trigger a navigation.
   *
   * # Usage
   *
   * ```
   * router.config({ 'path': '/', 'component': IndexCmp});
   * ```
   *
   * Or:
   *
   * ```
   * router.config([
   *   { 'path': '/', 'component': IndexComp },
   *   { 'path': '/user/:id', 'component': UserComp },
   * ]);
   * ```
   */
  config(config: any): Promise<any> {
    if (config instanceof List) {
      (<List<any>>config)
          .forEach((configObject) => { this._registry.config(this.hostComponent, configObject); });
    } else {
      this._registry.config(this.hostComponent, config);
    }
    return this.renavigate();
  }


  /**
   * Navigate to a URL. Returns a promise that resolves when navigation is complete.
   *
   * If the given URL begins with a `/`, router will navigate absolutely.
   * If the given URL does not begin with `/`, the router will navigate relative to this component.
   */
  navigate(url: string): Promise<any> {
    if (this.navigating) {
      return this._currentNavigation;
    }
    this.lastNavigationAttempt = url;
    return this._currentNavigation = this.recognize(url).then((matchedInstruction) => {
      if (isBlank(matchedInstruction)) {
        return PromiseWrapper.resolve(false);
      }

      if (isPresent(this._currentInstruction)) {
        matchedInstruction.reuseComponentsFrom(this._currentInstruction);
      }

      this._startNavigating();

      var result =
          this.commit(matchedInstruction)
              .then((_) => {
                this._finishNavigating();
                ObservableWrapper.callNext(this._subject, matchedInstruction.accumulatedUrl);
              });

      PromiseWrapper.catchError(result, (err) => {
        this._finishNavigating();
        return err;
      });

      return result;
    });
  }

  _startNavigating(): void { this.navigating = true; }

  _finishNavigating(): void { this.navigating = false; }


  /**
   * Subscribe to URL updates from the router
   */
  subscribe(onNext): void { ObservableWrapper.subscribe(this._subject, onNext); }


  /**
   * Updates this router and all descendant routers according to the given instruction
   */
  commit(instruction: Instruction): Promise<any> {
    this._currentInstruction = instruction;
    if (isPresent(this._outlet)) {
      return this._outlet.activate(instruction);
    }
    return PromiseWrapper.resolve(true);
  }


  /**
   * Removes the contents of this router's outlet and all descendant outlets
   */
  deactivate(): Promise<any> {
    if (isPresent(this._outlet)) {
      return this._outlet.deactivate();
    }
    return PromiseWrapper.resolve(true);
  }


  /**
   * Given a URL, returns an instruction representing the component graph
   */
  recognize(url: string): Promise<Instruction> {
    return this._registry.recognize(url, this.hostComponent);
  }


  /**
   * Navigates to either the last URL successfully navigated to, or the last URL requested if the
   * router has yet to successfully navigate.
   */
  renavigate(): Promise<any> {
    var destination = isBlank(this.previousUrl) ? this.lastNavigationAttempt : this.previousUrl;
    if (isBlank(destination)) {
      return this._currentNavigation;
    }
    return this.navigate(destination);
  }


  /**
   * Generate a URL from a component name and optional map of parameters. The URL is relative to the
   * app's base href.
   */
  generate(name: string, params: StringMap<string, string>): string {
    return this._registry.generate(name, params, this.hostComponent);
  }
}

export class RootRouter extends Router {
  _location: Location;

  constructor(registry: RouteRegistry, pipeline: Pipeline, location: Location,
              hostComponent: Type) {
    super(registry, pipeline, null, hostComponent);
    this._location = location;
    this._location.subscribe((change) => this.navigate(change['url']));
    this._registry.configFromComponent(hostComponent);
    this.navigate(location.path());
  }

  commit(instruction): Promise<any> {
    return super.commit(instruction)
        .then((_) => { this._location.go(instruction.accumulatedUrl); });
  }
}

class ChildRouter extends Router {
  constructor(parent: Router, hostComponent) {
    super(parent._registry, parent._pipeline, parent, hostComponent);
    this.parent = parent;
  }
}
