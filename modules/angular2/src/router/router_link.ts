import {onAllChangesDone} from 'angular2/src/core/annotations/annotations';
import {Directive} from 'angular2/src/core/annotations/decorators';
import {ElementRef} from 'angular2/core';
import {List, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';

import {isPresent} from 'angular2/src/facade/lang';

import {Router} from './router';
import {Location} from './location';
import {Renderer} from 'angular2/src/render/api';

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
 * <a [router-link]="['./user']">link to user component</a>
 * ```
 *
 * RouterLink expects the value to be an array of route names
 *
 * @exportedAs angular2/router
 */
@Directive({
  selector: '[router-link]',
  properties: ['routeParams: routerLink'],
  lifecycle: [onAllChangesDone],
  host: {'(^click)': 'onClick()'}
})
export class RouterLink {
  private _routeParams: List<any>;

  // the url displayed on the anchor element.
  _visibleHref: string;
  // the url passed to the router navigation.
  _navigationHref: string;

  constructor(private _elementRef: ElementRef, private _router: Router, private _location: Location,
              private _renderer: Renderer) {}

  set routeParams(changes: List<any>) { this._routeParams = changes; }

  onClick(): boolean {
    this._router.navigate(this._navigationHref);
    return false;
  }

  onAllChangesDone(): void {
    if (isPresent(this._routeParams)) {
      this._navigationHref = this._router.generate(this._routeParams);
      this._visibleHref = this._location.normalizeAbsolutely(this._navigationHref);
      // Keeping the link on the element to support contextual menu `copy link`
      // and other in-browser affordances.
      this._renderer.setElementAttribute(this._elementRef, 'href', this._visibleHref);
    }
  }
}
