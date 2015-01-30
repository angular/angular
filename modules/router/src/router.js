/*
 * Both the Angular 1.3 Router and Angular 2 Router use this
 */

import {Promise, PromiseWrapper} from 'facade/async';
import {RouteRecognizer} from 'router/route-recognizer';

var CHILD_ROUTE_SUFFIX = '/*childRoute';

export class Router {
  parent: Router;
  navigating;
  ports;
  children;
  context;
  recognizer : RouteRecognizer;
  childRecognizer : RouteRecognizer;
  fullContext;
  previousUrl;

  constructor(parent:Router = null) {
    this.parent = parent;
    this.navigating = false;
    this.ports = {};
    this.children = [];
    this.context = null;
    this.fullContext = null;
    this.recognizer = new RouteRecognizer();
    this.childRecognizer = new RouteRecognizer();
  }


  /*
   * constructs a child router
   */
  childRouter() {
    var child = new Router(this);
    this.children.push(child);
    return child;
  }


  /*
   * object to notify of route changes
   */
  registerViewPort(view, name = 'default') {
    this.ports[name] = view;
    if (this.fullContext != null) {
      return this.activatePorts(this.fullContext);
    }
  }


  /*
   * update the routing configuation and trigger a navigation
   */
  config(mapping) {
    if (mapping instanceof Array) {
      return mapping.forEach(nav => this.config(nav));
    }
    var component = mapping.component;

    if (typeof component === 'string') {
      mapping.handler = { component: component };
    } else if (typeof component === 'function') {
      mapping.handler = component();
    } else if (!mapping.handler) {
      mapping.handler = { component: component };
    }

    this.recognizer.add([mapping], { as: component });

    var withChild = copy(mapping);
    withChild.path += CHILD_ROUTE_SUFFIX;
    this.childRecognizer.add([{
      path: withChild.path,
      handler: withChild
    }]);

    return this.renavigate();
  }


  /*
   * public API for navigating from a URL
   */
  navigate(url:String, force:boolean=false) {

    // TODO: test this behavior
    // we need this check because a navigation might cause additional config
    // to be loaded and we dont want to kick off two navigations
    // also maybe this should return a promise that resolves when the naviagation finishes
    if (this.navigating) {
      return Promise.resolve();
    }

    if (!force && url === this.previousUrl) {
      return Promise.resolve();
    }
    this.previousUrl = url;
    var context = this.recognizer.recognize(url);

    if (notMatched(context)) {
      context = this.childRecognizer.recognize(url);

      if (notMatched(context)) {
        return Promise.reject();
      }

      var path = context[0].handler.path;
      var segment = path.substr(0, path.length - CHILD_ROUTE_SUFFIX.length);

      if (this.previousSegment === segment) {
        return this.navigateChildren(context);
      }
      this.previousSegment = segment;
    }

    if (notMatched(context)) {
      return Promise.reject();
    }

    // TODO: not sure if I can compare by identity here
    if (this.context === context[0]) {
      return Promise.resolve();
    }
    this.context = context[0];
    this.fullContext = context;
    this.navigating = true;

    // TODO: not sure what types of things to pass to the handler
    //       the handler should represent a deserialization from params to resources,
    //       but I think this is better owned by the pipeline
    context.component = this.context.handler.component;

    // TODO: this will become the pipeline
    return this.canNavigate(context)
               .then(status => (status && this.activatePorts(context)))
               .then(() => this.navigating = false)
               .then(() => this.previousContext = context);
  }

  renavigate() {
    if (this.navigating) {
      return Promise.resolve();
    }
    if (this.previousUrl) {
      return this.navigate(this.previousUrl, true);
    } else {
      return Promise.resolve();
    }
  }

  navigateChildren(context) {
    if (context[0].params.childRoute) {
      var subNav = '/' + context[0].params.childRoute;
      return Promise.all(this.children.map(child => child.navigate(subNav)));
    }
    return Promise.resolve();
  }


  generate(name:string, params) {
    var router = this,
        prefix = '';

    while (router && !router.recognizer.hasRoute(name)) {
      router = router.parent;
    }

    if (!router) {
      throw new Error('Can not find route');
    }

    var path = router.recognizer.generate(name, params);

    while (router = router.parent) {
      prefix += router.previousSegment;
    }
    return prefix + path;
  }

  /*
   * given a context obj
   * update viewports accordingly
   */
  activatePorts(context) {
    var activations = mapObj(this.ports,
        port => Promise.resolve(port.deactivate && port.deactivate(context)).
            then(port.activate(context)));

    return Promise.all(activations).then(() => this.navigateChildren(context));
  }


  /*
   * given a context obj
   * returns a Promise<bool> that represents
   * whether this router and all the descendants can navigate
   */
  canNavigate(context) {
    return Promise.all(this.gatherNagigationPredicates(context))
                  .then(booleanReduction);
  }


  /*
   * given a context obj
   * returns an Array<Promise<bool>> that represents
   * whether this router and all the descendants can navigate
   */
  gatherNagigationPredicates(context) {
    return this.children.reduce(
        (promises, child) => promises.concat(child.gatherNagigationPredicates(context)),
        [this.navigationPredicate(context)]
    );
  }


  /*
   * whether or not this level of router can navigate
   *
   * returns a promise<bool>
   */
  navigationPredicate(context) {
    return this.viewportsCanDeactivate(context).
        then(status => (status && this.viewportsCanActivate(context)));
  }

  viewportsCanDeactivate(context) {
    return this.queryViewports(context,
        port => Promise.resolve(!port.canDeactivate || port.canDeactivate(context)));
  }

  viewportsCanActivate(context) {
    return this.queryViewports(context,
        port => Promise.resolve(!port.canActivate || port.canActivate(context)));
  }

  queryViewports(context, fn) {
    var allViewportQueries = mapObj(this.ports, fn);

    return Promise.all(allViewportQueries).
        then(booleanReduction);
  }
}

function copy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function notMatched(context) {
  return context == null || context.length < 1;
}

function forEach(obj, fn) {
  Object.keys(obj).forEach(key => fn(obj[key], key));
}

function mapObj(obj, fn) {
  var result = [];
  Object.keys(obj).forEach(key => result.push(fn(obj[key], key)));
  return result;
}

function booleanReduction (arr) {
  return arr.reduce((acc, val) => acc && val, true);
}
