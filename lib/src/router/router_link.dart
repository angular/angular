library angular2.src.router.router_link;

import "package:angular2/core.dart" show Directive;
import "package:angular2/src/facade/lang.dart" show isString;
import "router.dart" show Router;
import "location.dart" show Location;
import "instruction.dart" show Instruction, stringifyInstruction;

/**
 * The RouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:

 * ```
 * @RouteConfig([
 *   { path: '/user', component: UserCmp, as: 'User' }
 * ]);
 * class MyComp {}
 * ```
 *
 * When linking to this `User` route, you can write:
 *
 * ```
 * <a [router-link]="['./User']">link to user component</a>
 * ```
 *
 * RouterLink expects the value to be an array of route names, followed by the params
 * for that level of routing. For instance `['/Team', {teamId: 1}, 'User', {userId: 2}]`
 * means that we want to generate a link for the `Team` route with params `{teamId: 1}`,
 * and with a child route `User` with params `{userId: 2}`.
 *
 * The first route name should be prepended with `/`, `./`, or `../`.
 * If the route begins with `/`, the router will look up the route from the root of the app.
 * If the route begins with `./`, the router will instead look in the current component's
 * children for the route. And if the route begins with `../`, the router will look at the
 * current component's parent.
 */
@Directive(
    selector: "[router-link]",
    inputs: const ["routeParams: routerLink", "target: target"],
    host: const {
      "(click)": "onClick()",
      "[attr.href]": "visibleHref",
      "[class.router-link-active]": "isRouteActive"
    })
class RouterLink {
  Router _router;
  Location _location;
  List<dynamic> _routeParams;
  // the url displayed on the anchor element.
  String visibleHref;
  String target;
  // the instruction passed to the router to navigate
  Instruction _navigationInstruction;
  RouterLink(this._router, this._location) {}
  bool get isRouteActive {
    return this._router.isRouteActive(this._navigationInstruction);
  }

  set routeParams(List<dynamic> changes) {
    this._routeParams = changes;
    this._navigationInstruction = this._router.generate(this._routeParams);
    var navigationHref = stringifyInstruction(this._navigationInstruction);
    this.visibleHref = this._location.prepareExternalUrl(navigationHref);
  }

  bool onClick() {
    // If no target, or if target is _self, prevent default browser behavior
    if (!isString(this.target) || this.target == "_self") {
      this._router.navigateByInstruction(this._navigationInstruction);
      return false;
    }
    return true;
  }
}
