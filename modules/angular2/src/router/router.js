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
 * @exportedAs angular2/router
 */
export class Router {
  hostComponent:any;
  parent:Router;
  navigating:boolean;
  lastNavigationAttempt: string;
  previousUrl:string;

  _currentInstruction:Instruction;

  _pipeline:Pipeline;
  _registry:RouteRegistry;
  _outlets:Map<any, RouterOutlet>;
  _children:Map<any, Router>;
  _subject:EventEmitter;
  _location:Location;

  constructor(registry:RouteRegistry, pipeline:Pipeline, location:Location, parent:Router, hostComponent) {
    this.hostComponent = hostComponent;
    this.navigating = false;
    this.parent = parent;
    this.previousUrl = null;
    this._outlets = MapWrapper.create();
    this._children = MapWrapper.create();
    this._location = location;
    this._registry = registry;
    this._pipeline = pipeline;
    this._subject = new EventEmitter();
    this._currentInstruction = null;
  }


  /**
   * Constructs a child router. You probably don't need to use this unless you're writing a reusable component.
   */
  childRouter(outletName = 'default') {
    if (!MapWrapper.contains(this._children, outletName)) {
      MapWrapper.set(this._children, outletName, new ChildRouter(this, outletName));
    }
    return MapWrapper.get(this._children, outletName);
  }


  /**
   * Register an object to notify of route changes. You probably don't need to use this unless you're writing a reusable component.
   */
  registerOutlet(outlet:RouterOutlet, name = 'default'):Promise {
    MapWrapper.set(this._outlets, name, outlet);
    if (isPresent(this._currentInstruction)) {
      var childInstruction = this._currentInstruction.getChildInstruction(name);
      return outlet.activate(childInstruction);
    }
    return PromiseWrapper.resolve(true);
  }


  /**
   * Update the routing configuration and trigger a navigation.
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
   *
   */
  config(config:any) {
    if (config instanceof List) {
      config.forEach((configObject) => {
        // TODO: this is a hack
        this._registry.config(this.hostComponent, configObject);
      })
    } else {
      this._registry.config(this.hostComponent, config);
    }
    return this.renavigate();
  }


  /**
   * Navigate to a URL. Returns a promise that resolves to the canonical URL for the route.
   */
  navigate(url:string):Promise {
    if (this.navigating) {
      return PromiseWrapper.resolve(true);
    }

    this.lastNavigationAttempt = url;

    var matchedInstruction = this.recognize(url);

    if (isBlank(matchedInstruction)) {
      return PromiseWrapper.resolve(false);
    }

    if(isPresent(this._currentInstruction)) {
      matchedInstruction.reuseComponentsFrom(this._currentInstruction);
    }

    matchedInstruction.router = this;
    this._startNavigating();

    var result = this._pipeline.process(matchedInstruction)
        .then((_) => {
          this._location.go(matchedInstruction.matchedUrl);
          ObservableWrapper.callNext(this._subject, matchedInstruction.matchedUrl);
          this._finishNavigating();
          this._currentInstruction = matchedInstruction;
        });

    PromiseWrapper.catchError(result, (_) => this._finishNavigating());

    return result;
  }

  _startNavigating() {
    this.navigating = true;
  }

  _finishNavigating() {
    this.navigating = false;
  }

  /**
   * Subscribe to URL updates from the router
   */
  subscribe(onNext) {
    ObservableWrapper.subscribe(this._subject, onNext);
  }


  activateOutlets(instruction:Instruction):Promise {
    return this._queryOutlets((outlet, name) => {
      var childInstruction = instruction.getChildInstruction(name);
      if (childInstruction.reuse) {
        return PromiseWrapper.resolve(true);
      }
      return outlet.activate(childInstruction);
    })
    .then((_) => instruction.mapChildrenAsync((instruction, _) => {
      return instruction.router.activateOutlets(instruction);
    }));
  }

  traverseOutlets(fn):Promise {
    return this._queryOutlets(fn)
        .then((_) => mapObjAsync(this._children, (child, _) => child.traverseOutlets(fn)));
  }

  _queryOutlets(fn):Promise {
    return mapObjAsync(this._outlets, fn);
  }


  /**
   * Given a URL, returns an instruction representing the component graph
   */
  recognize(url:string) {
    return this._registry.recognize(url, this.hostComponent);
  }


  /**
   * Navigates to either the last URL successfully navigated to, or the last URL requested if the router has yet to successfully navigate.
   */
  renavigate():Promise {
    var destination = isBlank(this.previousUrl) ? this.lastNavigationAttempt : this.previousUrl;
    if (this.navigating || isBlank(destination)) {
      return PromiseWrapper.resolve(false);
    }
    return this.navigate(destination);
  }


  /**
   * Generate a URL from a component name and optional map of parameters. The URL is relative to the app's base href.
   */
  generate(name:string, params:any) {
    return this._registry.generate(name, params, this.hostComponent);
  }
}

export class RootRouter extends Router {
  constructor(registry:RouteRegistry, pipeline:Pipeline, location:Location, hostComponent:Type) {
    super(registry, pipeline, location, null, hostComponent);
    this._location.subscribe((change) => this.navigate(change['url']));
    this._registry.configFromComponent(hostComponent);
    this.navigate(location.path());
  }
}

class ChildRouter extends Router {
  constructor(parent:Router, hostComponent) {
    super(parent._registry, parent._pipeline, parent._location, parent, hostComponent);
    this.parent = parent;
  }
}

function mapObjAsync(obj:Map, fn) {
  return PromiseWrapper.all(mapObj(obj, fn));
}

function mapObj(obj:Map, fn):List {
  var result = ListWrapper.create();
  MapWrapper.forEach(obj, (value, key) => ListWrapper.push(result, fn(value, key)));
  return result;
}
