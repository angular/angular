import {
  Directive,
  HostListener,
  HostBinding,
  Input
} from '@angular/core';
import {Router} from '../router';
import {ActivatedRoute} from '../router_state';

/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:

 * ```
 * [{ path: '/user', component: UserCmp }]
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
 * And if the segment begins with `../`, the router will go up one level.
 */
@Directive({selector: '[routerLink]'})
export class RouterLink {
  @Input() target: string;
  private commands: any[] = [];

  // the url displayed on the anchor element.
  @HostBinding() href: string;

  constructor(private router: Router, private route: ActivatedRoute) {}

  @Input()
  set routerLink(data: any[] | string) {
    if (Array.isArray(data)) {
      this.commands = data;
    } else {
      this.commands = [data];
    }
    this.updateTargetUrlAndHref();
  }


  @HostListener("click")
  onClick(): boolean {
    // If no target, or if target is _self, prevent default browser behavior
    if (!(typeof this.target === "string") || this.target == '_self') {
      this.router.navigate(this.commands, {relativeTo: this.route});
      return false;
    }
    return true;
  }

  private updateTargetUrlAndHref(): void {
    const tree = this.router.createUrlTree(this.commands, {relativeTo: this.route});
    if (tree) {
      this.href = this.router.serializeUrl(tree);
    }
  }
}
