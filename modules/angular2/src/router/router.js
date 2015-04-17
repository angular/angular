import {Promise, PromiseWrapper, EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';
import {Map, MapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';
import {isBlank} from 'angular2/src/facade/lang';

import {RouteRegistry} from './route_registry';
import {Pipeline} from './pipeline';
import {Instruction} from './instruction';
import {RouterOutlet} from './router_outlet';

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
  name;
  parent:Router;
  navigating:boolean;
  lastNavigationAttempt: string;
  previousUrl:string;

  _pipeline:Pipeline;
  _registry:RouteRegistry;
  _outlets:Map<any, RouterOutlet>;
  _children:Map<any, Router>;
  _subject:EventEmitter;

  constructor(registry:RouteRegistry, pipeline:Pipeline, parent:Router = null, name = '/') {
    this.name = name;
    this.navigating = false;
    this.parent = parent;
    this.previousUrl = null;
    this._outlets = MapWrapper.create();
    this._children = MapWrapper.create();
    this._registry = registry;
    this._pipeline = pipeline;
    this._subject = new EventEmitter();
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
    return this.renavigate();
  }


  /**
   * Update the routing configuration and trigger a navigation.
   *
   * # Usage
   *
   * ```
   * router.config('/', SomeCmp);
   * ```
   */
  config(path:string, component, alias:string=null) {
    this._registry.config(this.name, path, component, alias);
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

    var instruction = this.recognize(url);

    if (isBlank(instruction)) {
      return PromiseWrapper.resolve(false);
    }

    instruction.router = this;
    this._startNavigating();

    var result = this._pipeline.process(instruction)
        .then((_) => {
          ObservableWrapper.callNext(this._subject, instruction.matchedUrl);
        })
        .then((_) => this._finishNavigating());

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
      return outlet.activate(instruction.getChildInstruction(name));
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
    return this._registry.recognize(url);
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
    return this._registry.generate(name, params);
  }

  static getRoot():Router {
    return new RootRouter(new Pipeline());
  }
}

export class RootRouter extends Router {
  constructor(pipeline:Pipeline) {
    super(new RouteRegistry(), pipeline, null, '/');
  }
}

class ChildRouter extends Router {
  constructor(parent, name) {
    super(parent._registry, parent._pipeline, parent, name);
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
