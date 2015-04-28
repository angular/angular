import {Decorator} from 'angular2/annotations';
import {NgElement} from 'angular2/core';

import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {Router} from './router';

/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 *
 * Consider the following route configuration:

 * ```
 * @RouteConfig({
 *   path: '/user', component: UserCmp, alias: 'user'
 * });
 * class MyComp {}
 * ```
 *
 * When linking to a route, you can write:
 *
 * ```
 * <a router-link="user">link to user component</a>
 * ```
 *
 * @exportedAs angular2/router
 */
@Decorator({
  selector: '[router-link]',
  properties: {
    'route': 'routerLink',
    'params': 'routerParams'
  }
})
export class RouterLink {
  _domEl;
  _route:string;
  _params:any;
  _router:Router;
  //TODO: handle click events

  constructor(ngEl:NgElement, router:Router) {
    this._domEl = ngEl.domElement;
    this._router = router;
  }

  set route(changes) {
    this._route = changes;
    this.updateHref();
  }

  set params(changes) {
    this._params = changes;
    this.updateHref();
  }

  updateHref() {
    if (isPresent(this._route) && isPresent(this._params)) {
      var newHref = this._router.generate(this._route, this._params);
      DOM.setAttribute(this._domEl, 'href', newHref);
    }
  }
}
