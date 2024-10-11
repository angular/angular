/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, Injectable} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivateChildFn,
  CanActivateFn,
  CanDeactivateFn,
  CanMatchFn,
  provideRouter,
  ResolveFn,
  Route,
  RouterStateSnapshot,
  UrlSegment,
} from '@angular/router';

@Component({
  template: '',
  standalone: false,
})
export class App {}

@Component({
  template: '',
  standalone: false,
})
export class TeamComponent {}

// #docregion CanActivateFn
@Injectable()
class UserToken {}

@Injectable()
class PermissionsService {
  canActivate(currentUser: UserToken, userId: string): boolean {
    return true;
  }
  canMatch(currentUser: UserToken): boolean {
    return true;
  }
}

const canActivateTeam: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(PermissionsService).canActivate(inject(UserToken), route.params['id']);
};
// #enddocregion

// #docregion CanActivateFnInRoute
bootstrapApplication(App, {
  providers: [
    provideRouter([
      {
        path: 'team/:id',
        component: TeamComponent,
        canActivate: [canActivateTeam],
      },
    ]),
  ],
});
// #enddocregion

// #docregion CanActivateChildFn
const canActivateChildExample: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(PermissionsService).canActivate(inject(UserToken), route.params['id']);
};

bootstrapApplication(App, {
  providers: [
    provideRouter([
      {
        path: 'team/:id',
        component: TeamComponent,
        canActivateChild: [canActivateChildExample],
        children: [],
      },
    ]),
  ],
});
// #enddocregion

// #docregion CanDeactivateFn
@Component({
  template: '',
  standalone: false,
})
export class UserComponent {
  hasUnsavedChanges = true;
}

bootstrapApplication(App, {
  providers: [
    provideRouter([
      {
        path: 'user/:id',
        component: UserComponent,
        canDeactivate: [(component: UserComponent) => !component.hasUnsavedChanges],
      },
    ]),
  ],
});
// #enddocregion

// #docregion CanMatchFn
const canMatchTeam: CanMatchFn = (route: Route, segments: UrlSegment[]) => {
  return inject(PermissionsService).canMatch(inject(UserToken));
};

bootstrapApplication(App, {
  providers: [
    provideRouter([
      {
        path: 'team/:id',
        component: TeamComponent,
        canMatch: [canMatchTeam],
      },
    ]),
  ],
});
// #enddocregion

// #docregion ResolveDataUse
@Component({
  template: '',
  standalone: false,
})
export class HeroDetailComponent {
  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.activatedRoute.data.subscribe(({hero}) => {
      // do something with your resolved data ...
    });
  }
}
// #enddocregion

// #docregion ResolveFn
interface Hero {
  name: string;
}
@Injectable()
export class HeroService {
  getHero(id: string) {
    return {name: `Superman-${id}`};
  }
}

export const heroResolver: ResolveFn<Hero> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  return inject(HeroService).getHero(route.paramMap.get('id')!);
};

bootstrapApplication(App, {
  providers: [
    provideRouter([
      {
        path: 'detail/:id',
        component: HeroDetailComponent,
        resolve: {hero: heroResolver},
      },
    ]),
  ],
});
// #enddocregion
