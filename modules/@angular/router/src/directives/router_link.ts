import {Directive, HostListener, HostBinding, Input, OnDestroy} from '@angular/core';
import {Router} from '../router';
import {RouteSegment} from '../segments';
import {isString, isArray, isPresent} from '../facade/lang';
import {ObservableWrapper} from '../facade/async';

/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:

 * ```
 * @Routes([
 *   { path: '/user', component: UserCmp }
 * ]);
 * class MyComp {}
 * ```
 *
 * When linking to this `User` route, you can write:
 *
 * ```
 * <a [routerLink]="['/user']">link to user component</a>
 * ```
 *
 * RouterLink expects the value to be an array of path segments, followed by the params
 * for that level of routing. For instance `['/team', {teamId: 1}, 'user', {userId: 2}]`
 * means that we want to generate a link to `/team;teamId=1/user;userId=2`.
 *
 * The first segment name can be prepended with `/`, `./`, or `../`.
 * If the segment begins with `/`, the router will look up the route from the root of the app.
 * If the segment begins with `./`, or doesn't begin with a slash, the router will
 * instead look in the current component's children for the route.
 * And if the segment begins with `../`, the router will go up one segment in the url.
 *
 * See {@link Router.createUrlTree} for more information.
 */
@Directive({selector: '[routerLink]'})
export class RouterLink implements OnDestroy {
  @Input() target: string;
  private _commands: any[] = [];
  private _subscription: any;

  // the url displayed on the anchor element.
  @HostBinding() href: string;
  @HostBinding('class.router-link-active') isActive: boolean = false;

  constructor(private _routeSegment: RouteSegment, private _router: Router) {
    // because auxiliary links take existing primary and auxiliary routes into account,
    // we need to update the link whenever params or other routes change.
    this._subscription =
        ObservableWrapper.subscribe(_router.changes, (_) => { this._updateTargetUrlAndHref(); });
  }

  ngOnDestroy() { ObservableWrapper.dispose(this._subscription); }

  @Input()
  set routerLink(data: any[] | any) {
    if (isArray(data)) {
      this._commands = <any[]>data;
    } else {
      this._commands = [data];
    }
    this._updateTargetUrlAndHref();
  }


  @HostListener("click")
  onClick(): boolean {
    // If no target, or if target is _self, prevent default browser behavior
    if (!isString(this.target) || this.target == '_self') {
      this._router.navigate(this._commands, this._routeSegment);
      return false;
    }
    return true;
  }

  private _updateTargetUrlAndHref(): void {
    let tree = this._router.createUrlTree(this._commands, this._routeSegment);
    if (isPresent(tree)) {
      this.href = this._router.serializeUrl(tree);
      this.isActive = this._router.urlTree.contains(tree);
    } else {
      this.isActive = false;
    }
  }
}
