/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {CommonModule} from '@angular/common';
import {Component, NgModule, Type, signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  ActivatedRoute,
  Event,
  NavigationEnd,
  NavigationStart,
  ParamMap,
  Params,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
  RouterOutlet,
  UrlSegment,
} from '../../index';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {timeout} from '../helpers';

export const ROUTER_DIRECTIVES = [RouterLink, RouterLinkActive, RouterOutlet];

export function expectEvents(events: Event[], pairs: any[]) {
  expect(events.length).toEqual(pairs.length);
  for (let i = 0; i < events.length; ++i) {
    expect(events[i].constructor.name).toBe(pairs[i][0].name);
    expect((<any>events[i]).url).toBe(pairs[i][1]);
  }
}

export function onlyNavigationStartAndEnd(e: Event): e is NavigationStart | NavigationEnd {
  return e instanceof NavigationStart || e instanceof NavigationEnd;
}

@Component({
  selector: 'link-cmp',
  template: `<a routerLink="/team/33/simple" [target]="'_self'">link</a>`,
  standalone: false,
})
export class StringLinkCmp {}

@Component({
  selector: 'link-cmp',
  template: `<button routerLink="/team/33/simple">link</button>`,
  standalone: false,
})
export class StringLinkButtonCmp {}

@Component({
  selector: 'link-cmp',
  template: `<router-outlet></router-outlet><a [routerLink]="['/team/33/simple']">link</a>`,
  standalone: false,
})
export class AbsoluteLinkCmp {}

@Component({
  selector: 'link-cmp',
  template: `<router-outlet></router-outlet><a routerLinkActive="active" (isActiveChange)="this.onRouterLinkActivated($event)" [routerLinkActiveOptions]="{exact: exact}" ariaCurrentWhenActive="page" [routerLink]="['./']">link</a>
 <button routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}" [routerLink]="['./']">button</button>
 `,
  standalone: false,
})
export class DummyLinkCmp {
  private exact: boolean;
  public isLinkActivated?: boolean;

  constructor(route: ActivatedRoute) {
    this.exact = route.snapshot.paramMap.get('exact') === 'true';
  }

  public onRouterLinkActivated(isActive: boolean): void {
    this.isLinkActivated = isActive;
  }
}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['/simple']">link</a>`,
  standalone: false,
})
export class AbsoluteSimpleLinkCmp {}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['../simple']">link</a>`,
  standalone: false,
})
export class RelativeLinkCmp {}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['../simple']" [queryParams]="{q: '1'}" fragment="f">link</a>`,
  standalone: false,
})
export class LinkWithQueryParamsAndFragment {}

@Component({
  selector: 'link-cmp',
  template: `<a id="link" [routerLink]="['../simple']" [state]="{foo: 'bar'}">link</a>`,
  standalone: false,
})
export class LinkWithState {}

@Component({
  selector: 'div-link-cmp',
  template: `<div id="link" [routerLink]="['../simple']" [state]="{foo: 'bar'}">link</div>`,
  standalone: false,
})
export class DivLinkWithState {}

@Component({
  selector: 'simple-cmp',
  template: `simple`,
  standalone: false,
})
export class SimpleCmp {}

@Component({
  selector: 'collect-params-cmp',
  template: `collect-params`,
  standalone: false,
})
export class CollectParamsCmp {
  private params: Params[] = [];
  private urls: UrlSegment[][] = [];

  constructor(public route: ActivatedRoute) {
    route.params.forEach((p) => this.params.push(p));
    route.url.forEach((u) => this.urls.push(u));
  }

  recordedUrls(): string[] {
    return this.urls.map((a: UrlSegment[]) => a.map((p: UrlSegment) => p.path).join('/'));
  }
}

@Component({
  selector: 'blank-cmp',
  template: ``,
  standalone: false,
})
export class BlankCmp {}

@NgModule({imports: [RouterModule.forChild([{path: '', component: BlankCmp}])]})
export class ModuleWithBlankCmpAsRoute {}

@Component({
  selector: 'team-cmp',
  template:
    'team {{id | async}} ' +
    '[ <router-outlet></router-outlet>, right: <router-outlet name="right"></router-outlet> ]' +
    '<a [routerLink]="routerLink()" skipLocationChange></a>' +
    '<button [routerLink]="routerLink()" skipLocationChange></button>',
  standalone: false,
})
export class TeamCmp {
  id: Observable<string>;
  recordedParams: Params[] = [];
  snapshotParams: Params[] = [];
  readonly routerLink = signal(['.']);

  constructor(public route: ActivatedRoute) {
    this.id = route.params.pipe(map((p: Params) => p['id']));
    route.params.forEach((p) => {
      this.recordedParams.push(p);
      this.snapshotParams.push(route.snapshot.params);
    });
  }
}

@Component({
  selector: 'two-outlets-cmp',
  template: `[ <router-outlet></router-outlet>, aux: <router-outlet name="aux"></router-outlet> ]`,
  standalone: false,
})
export class TwoOutletsCmp {}

@Component({
  selector: 'user-cmp',
  template: `user {{name | async}}`,
  standalone: false,
})
export class UserCmp {
  name: Observable<string>;
  recordedParams: Params[] = [];
  snapshotParams: Params[] = [];

  constructor(route: ActivatedRoute) {
    this.name = route.params.pipe(map((p: Params) => p['name']));
    route.params.forEach((p) => {
      this.recordedParams.push(p);
      this.snapshotParams.push(route.snapshot.params);
    });
  }
}

@Component({
  selector: 'wrapper',
  template: `<router-outlet></router-outlet>`,
  standalone: false,
})
export class WrapperCmp {}

@Component({
  selector: 'query-cmp',
  template: `query: {{name | async}} fragment: {{fragment | async}}`,
  standalone: false,
})
export class QueryParamsAndFragmentCmp {
  name: Observable<string | null>;
  fragment: Observable<string>;

  constructor(route: ActivatedRoute) {
    this.name = route.queryParamMap.pipe(map((p: ParamMap) => p.get('name')));
    this.fragment = route.fragment.pipe(
      map((p: string | null | undefined) => {
        if (p === undefined) {
          return 'undefined';
        } else if (p === null) {
          return 'null';
        } else {
          return p;
        }
      }),
    );
  }
}

@Component({
  selector: 'empty-query-cmp',
  template: ``,
  standalone: false,
})
export class EmptyQueryParamsCmp {
  recordedParams: Params[] = [];

  constructor(route: ActivatedRoute) {
    route.queryParams.forEach((_) => this.recordedParams.push(_));
  }
}

@Component({
  selector: 'route-cmp',
  template: `route`,
  standalone: false,
})
export class RouteCmp {
  constructor(public route: ActivatedRoute) {}
}

@Component({
  selector: 'link-cmp',
  template: `<div *ngIf="show()"><a [routerLink]="['./simple']">link</a></div> <router-outlet></router-outlet>`,
  standalone: false,
})
export class RelativeLinkInIfCmp {
  show = signal(false);
}

@Component({
  selector: 'child',
  template: '<div *ngIf="alwaysTrue"><router-outlet></router-outlet></div>',
  standalone: false,
})
export class OutletInNgIf {
  alwaysTrue = true;
}

@Component({
  selector: 'link-cmp',
  template: `<router-outlet></router-outlet>
              <div id="link-parent" routerLinkActive="active" [routerLinkActiveOptions]="{exact: exact}">
                <div ngClass="{one: 'true'}"><a [routerLink]="['./']">link</a></div>
              </div>`,
  standalone: false,
})
export class DummyLinkWithParentCmp {
  protected exact: boolean;
  constructor(route: ActivatedRoute) {
    this.exact = route.snapshot.params['exact'] === 'true';
  }
}

@Component({
  selector: 'cmp',
  template: '',
  standalone: false,
})
export class ComponentRecordingRoutePathAndUrl {
  public path: ActivatedRoute[];
  public url: string;

  constructor(router: Router, route: ActivatedRoute) {
    this.path = route.pathFromRoot;
    this.url = router.url.toString();
  }
}

@Component({
  selector: 'root-cmp',
  template: `<router-outlet></router-outlet>`,
  standalone: false,
})
export class RootCmp {}

@Component({
  selector: 'root-cmp-on-init',
  template: `<router-outlet></router-outlet>`,
  standalone: false,
})
export class RootCmpWithOnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['one']);
  }
}

@Component({
  selector: 'root-cmp',
  template: `primary [<router-outlet></router-outlet>] right [<router-outlet name="right"></router-outlet>]`,
  standalone: false,
})
export class RootCmpWithTwoOutlets {}

@Component({
  selector: 'root-cmp',
  template: `main [<router-outlet name="main"></router-outlet>]`,
  standalone: false,
})
export class RootCmpWithNamedOutlet {}

@Component({
  selector: 'throwing-cmp',
  template: '',
  standalone: false,
})
export class ThrowingCmp {
  constructor() {
    throw new Error('Throwing Cmp');
  }
}
@Component({
  selector: 'conditional-throwing-cmp',
  template: 'conditional throwing',
  standalone: false,
})
export class ConditionalThrowingCmp {
  static throwError = true;
  constructor() {
    if (ConditionalThrowingCmp.throwError) {
      throw new Error('Throwing Cmp');
    }
  }
}

export async function advance(
  fixture: ComponentFixture<unknown>,
  millis: number = 1,
): Promise<void> {
  await timeout(millis);
  fixture.detectChanges();
}

export async function createRoot<T>(router: Router, type: Type<T>): Promise<ComponentFixture<T>> {
  const f = TestBed.createComponent<T>(type);
  await advance(f);
  router.initialNavigation();
  await advance(f);
  return f;
}

@Component({
  selector: 'lazy',
  template: 'lazy-loaded',
  standalone: false,
})
export class LazyComponent {}

@NgModule({
  imports: [CommonModule, ...ROUTER_DIRECTIVES],

  exports: [
    BlankCmp,
    SimpleCmp,
    TwoOutletsCmp,
    TeamCmp,
    UserCmp,
    StringLinkCmp,
    DummyLinkCmp,
    AbsoluteLinkCmp,
    AbsoluteSimpleLinkCmp,
    RelativeLinkCmp,
    DummyLinkWithParentCmp,
    LinkWithQueryParamsAndFragment,
    DivLinkWithState,
    LinkWithState,
    CollectParamsCmp,
    QueryParamsAndFragmentCmp,
    StringLinkButtonCmp,
    WrapperCmp,
    OutletInNgIf,
    ComponentRecordingRoutePathAndUrl,
    RouteCmp,
    RootCmp,
    RootCmpWithOnInit,
    RelativeLinkInIfCmp,
    RootCmpWithTwoOutlets,
    RootCmpWithNamedOutlet,
    EmptyQueryParamsCmp,
    ThrowingCmp,
    ConditionalThrowingCmp,
  ],

  declarations: [
    BlankCmp,
    SimpleCmp,
    TeamCmp,
    TwoOutletsCmp,
    UserCmp,
    StringLinkCmp,
    DummyLinkCmp,
    AbsoluteLinkCmp,
    AbsoluteSimpleLinkCmp,
    RelativeLinkCmp,
    DummyLinkWithParentCmp,
    LinkWithQueryParamsAndFragment,
    DivLinkWithState,
    LinkWithState,
    CollectParamsCmp,
    QueryParamsAndFragmentCmp,
    StringLinkButtonCmp,
    WrapperCmp,
    OutletInNgIf,
    ComponentRecordingRoutePathAndUrl,
    RouteCmp,
    RootCmp,
    RootCmpWithOnInit,
    RelativeLinkInIfCmp,
    RootCmpWithTwoOutlets,
    RootCmpWithNamedOutlet,
    EmptyQueryParamsCmp,
    ThrowingCmp,
    ConditionalThrowingCmp,
  ],
})
export class TestModule {}
