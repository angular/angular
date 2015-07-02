import {Directive} from 'angular2/src/core/annotations/decorators';
import {List, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';

import {Router} from './router';
import {Location} from './location';

/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:

 * ```
 * @RouteConfig([
 *   { path: '/user', component: UserCmp, as: 'user' }
 * ]);
 * class MyComp {}
 * ```
 *
 * When linking to this `user` route, you can write:
 *
 * ```
 * <a [router-link]="['./user']">link to user component</a>
 * ```
 *
 * RouterLink expects the value to be an array of route names, followed by the params
 * for that level of routing. For instance `['/team', {teamId: 1}, 'user', {userId: 2}]`
 * means that we want to generate a link for the `team` route with params `{teamId: 1}`,
 * and with a child route `user` with params `{userId: 2}`.
 *
 * The first route name should be prepended with `/`, `./`, or `../`.
 * If the route begins with `/`, the router will look up the route from the root of the app.
 * If the route begins with `./`, the router will instead look in the current component's
 * children for the route. And if the route begins with `../`, the router will look at the
 * current component's parent.
 */
@Directive({
  selector: '[router-link]',
  properties: ['routeParams: routerLink'],
  host: {'(^click)': 'onClick()', '[attr.href]': 'visibleHref'}
})
export class RouterLink {
  private _routeParams: List<any>;

  // the url displayed on the anchor element.
  visibleHref: string;
  // the url passed to the router navigation.
  _navigationHref: string;

  constructor(private _router: Router, private _location: Location) {}

  set routeParams(changes: List<any>) {
    this._routeParams = changes;
    this._navigationHref = this._router.generate(this._routeParams);
    this.visibleHref = this._location.normalizeAbsolutely(this._navigationHref);
  }

  onClick(): boolean {
    this._router.navigate(this._navigationHref);
    return false;
  }
}
