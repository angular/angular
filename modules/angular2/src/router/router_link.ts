import {onAllChangesDone} from 'angular2/src/core/annotations/annotations';
import {Directive} from 'angular2/src/core/annotations/decorators';
import {ElementRef} from 'angular2/core';
import {StringMap, StringMapWrapper} from 'angular2/src/facade/collection';

import {isPresent} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {Router} from './router';
import {Location} from './location';

/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 *
 * Consider the following route configuration:

 * ```
 * @RouteConfig({
 *   path: '/user', component: UserCmp, as: 'user'
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
@Directive({
  selector: '[router-link]',
  properties: ['route: routerLink', 'params: routerParams'],
  lifecycle: [onAllChangesDone],
  host: {'(^click)': 'onClick()'}
})
export class RouterLink {
  private _domEl;
  private _route: string;
  private _params: StringMap<string, string>;

  // the url displayed on the anchor element.
  _visibleHref: string;
  // the url passed to the router navigation.
  _navigationHref: string;

  constructor(elementRef: ElementRef, private _router: Router, private _location: Location) {
    this._domEl = elementRef.domElement;
    this._params = StringMapWrapper.create();
  }

  set route(changes: string) { this._route = changes; }

  set params(changes: StringMap<string, string>) { this._params = changes; }

  onClick() {
    this._router.navigate(this._navigationHref);
    return false;
  }

  onAllChangesDone(): void {
    if (isPresent(this._route) && isPresent(this._params)) {
      this._navigationHref = this._router.generate(this._route, this._params);
      this._visibleHref = this._location.normalizeAbsolutely(this._navigationHref);
      // Keeping the link on the element to support contextual menu `copy link`
      // and other in-browser affordances.
      DOM.setAttribute(this._domEl, 'href', this._visibleHref);
    }
  }
}
