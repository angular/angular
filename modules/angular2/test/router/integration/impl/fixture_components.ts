import {Component} from 'angular2/angular2';
import {
  AsyncRoute,
  Route,
  Redirect,
  RouteConfig,
  RouteParams,
  RouteData,
  ROUTER_DIRECTIVES
} from 'angular2/router';
import {PromiseWrapper} from 'angular2/src/facade/async';

@Component({selector: 'hello-cmp', template: `{{greeting}}`})
export class HelloCmp {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
}

export function helloCmpLoader() {
  return PromiseWrapper.resolve(HelloCmp);
}


@Component({selector: 'user-cmp', template: `hello {{user}}`})
export class UserCmp {
  user: string;
  constructor(params: RouteParams) { this.user = params.get('name'); }
}

export function userCmpLoader() {
  return PromiseWrapper.resolve(UserCmp);
}


@Component({
  selector: 'parent-cmp',
  template: `inner { <router-outlet></router-outlet> }`,
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([new Route({path: '/b', component: HelloCmp, name: 'Child'})])
export class ParentCmp {
}

export function parentCmpLoader() {
  return PromiseWrapper.resolve(ParentCmp);
}


@Component({
  selector: 'parent-cmp',
  template: `inner { <router-outlet></router-outlet> }`,
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([new AsyncRoute({path: '/b', loader: helloCmpLoader, name: 'Child'})])
export class AsyncParentCmp {
}

export function asyncParentCmpLoader() {
  return PromiseWrapper.resolve(AsyncParentCmp);
}

@Component({
  selector: 'parent-cmp',
  template: `inner { <router-outlet></router-outlet> }`,
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig(
    [new AsyncRoute({path: '/b', loader: helloCmpLoader, name: 'Child', useAsDefault: true})])
export class AsyncDefaultParentCmp {
}

export function asyncDefaultParentCmpLoader() {
  return PromiseWrapper.resolve(AsyncDefaultParentCmp);
}


@Component({
  selector: 'parent-cmp',
  template: `inner { <router-outlet></router-outlet> }`,
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([new Route({path: '/b', component: HelloCmp, name: 'Child', useAsDefault: true})])
export class ParentWithDefaultCmp {
}

export function parentWithDefaultCmpLoader() {
  return PromiseWrapper.resolve(ParentWithDefaultCmp);
}


@Component({
  selector: 'team-cmp',
  template: `team {{id}} | user { <router-outlet></router-outlet> }`,
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([new Route({path: '/user/:name', component: UserCmp, name: 'User'})])
export class TeamCmp {
  id: string;
  constructor(params: RouteParams) { this.id = params.get('id'); }
}

@Component({
  selector: 'team-cmp',
  template: `team {{id}} | user { <router-outlet></router-outlet> }`,
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([new AsyncRoute({path: '/user/:name', loader: userCmpLoader, name: 'User'})])
export class AsyncTeamCmp {
  id: string;
  constructor(params: RouteParams) { this.id = params.get('id'); }
}

export function asyncTeamLoader() {
  return PromiseWrapper.resolve(AsyncTeamCmp);
}


@Component({selector: 'data-cmp', template: `{{myData}}`})
export class RouteDataCmp {
  myData: boolean;
  constructor(data: RouteData) { this.myData = data.get('isAdmin'); }
}

export function asyncRouteDataCmp() {
  return PromiseWrapper.resolve(RouteDataCmp);
}

@Component({selector: 'redirect-to-parent-cmp', template: 'redirect-to-parent'})
@RouteConfig([new Redirect({path: '/child-redirect', redirectTo: ['../HelloSib']})])
export class RedirectToParentCmp {
}
