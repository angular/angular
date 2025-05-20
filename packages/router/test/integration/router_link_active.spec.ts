/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component, NgZone} from '@angular/core';
import {Location} from '@angular/common';
import {fakeAsync, TestBed} from '@angular/core/testing';
import {Router, provideRouter} from '../../src';
import {By} from '@angular/platform-browser';
import {
  createRoot,
  RootCmp,
  BlankCmp,
  TeamCmp,
  DummyLinkCmp,
  SimpleCmp,
  advance,
  DummyLinkWithParentCmp,
  ROUTER_DIRECTIVES,
} from './integration_helpers';

export function routerLinkActiveIntegrationSuite() {
  describe('routerLinkActive', () => {
    it('should set the class when the link is active (a tag)', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {
              path: 'link',
              component: DummyLinkCmp,
              children: [
                {path: 'simple', component: SimpleCmp},
                {path: '', component: BlankCmp},
              ],
            },
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link;exact=true');
      advance(fixture);
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link;exact=true');

      const nativeLink = fixture.nativeElement.querySelector('a');
      const nativeButton = fixture.nativeElement.querySelector('button');
      expect(nativeLink.className).toEqual('active');
      expect(nativeButton.className).toEqual('active');

      router.navigateByUrl('/team/22/link/simple');
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link/simple');
      expect(nativeLink.className).toEqual('');
      expect(nativeButton.className).toEqual('');
    }));

    it('should not set the class until the first navigation succeeds', fakeAsync(() => {
      @Component({
        template:
          '<router-outlet></router-outlet><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" ></a>',
        standalone: false,
      })
      class RootCmpWithLink {}

      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
      const router: Router = TestBed.inject(Router);

      const f = TestBed.createComponent(RootCmpWithLink);
      advance(f);

      const link = f.nativeElement.querySelector('a');
      expect(link.className).toEqual('');

      router.initialNavigation();
      advance(f);

      expect(link.className).toEqual('active');
    }));

    it('should set the class on a parent element when the link is active', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {
              path: 'link',
              component: DummyLinkWithParentCmp,
              children: [
                {path: 'simple', component: SimpleCmp},
                {path: '', component: BlankCmp},
              ],
            },
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link;exact=true');
      advance(fixture);
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link;exact=true');

      const native = fixture.nativeElement.querySelector('#link-parent');
      expect(native.className).toEqual('active');

      router.navigateByUrl('/team/22/link/simple');
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link/simple');
      expect(native.className).toEqual('');
    }));

    it('should set the class when the link is active', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {
              path: 'link',
              component: DummyLinkCmp,
              children: [
                {path: 'simple', component: SimpleCmp},
                {path: '', component: BlankCmp},
              ],
            },
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link');
      advance(fixture);
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link');

      const native = fixture.nativeElement.querySelector('a');
      expect(native.className).toEqual('active');

      router.navigateByUrl('/team/22/link/simple');
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link/simple');
      expect(native.className).toEqual('active');
    }));

    it('should expose an isActive property', fakeAsync(() => {
      @Component({
        template: `<a routerLink="/team" routerLinkActive #rla="routerLinkActive"></a>
               <p>{{rla.isActive}}</p>
               <span *ngIf="rla.isActive"></span>
               <span [ngClass]="{'highlight': rla.isActive}"></span>
               <router-outlet></router-outlet>`,
        standalone: false,
      })
      class ComponentWithRouterLink {}

      TestBed.configureTestingModule({declarations: [ComponentWithRouterLink]});
      const router: Router = TestBed.inject(Router);

      router.resetConfig([
        {
          path: 'team',
          component: TeamCmp,
        },
        {
          path: 'otherteam',
          component: TeamCmp,
        },
      ]);

      const fixture = TestBed.createComponent(ComponentWithRouterLink);
      router.navigateByUrl('/team');
      expect(() => advance(fixture)).not.toThrow();
      advance(fixture);

      const paragraph = fixture.nativeElement.querySelector('p');
      expect(paragraph.textContent).toEqual('true');

      router.navigateByUrl('/otherteam');
      advance(fixture);
      advance(fixture);
      expect(paragraph.textContent).toEqual('false');
    }));

    it('should not trigger change detection when active state has not changed', fakeAsync(() => {
      @Component({
        template: `<div id="link" routerLinkActive="active" [routerLink]="link"></div>`,
        standalone: false,
      })
      class LinkComponent {
        link = 'notactive';
      }

      @Component({
        template: '',
        standalone: false,
      })
      class SimpleComponent {}

      TestBed.configureTestingModule({
        imports: [...ROUTER_DIRECTIVES],
        providers: [provideRouter([{path: '', component: SimpleComponent}])],
        declarations: [LinkComponent, SimpleComponent],
      });

      const fixture = createRoot(TestBed.inject(Router), LinkComponent);
      fixture.componentInstance.link = 'stillnotactive';
      fixture.detectChanges(false /** checkNoChanges */);
      expect(TestBed.inject(NgZone).hasPendingMicrotasks).toBe(false);
    }));

    it('should emit on isActiveChange output when link is activated or inactivated', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {
              path: 'link',
              component: DummyLinkCmp,
              children: [
                {path: 'simple', component: SimpleCmp},
                {path: '', component: BlankCmp},
              ],
            },
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link;exact=true');
      advance(fixture);
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link;exact=true');

      const linkComponent = fixture.debugElement.query(By.directive(DummyLinkCmp))
        .componentInstance as DummyLinkCmp;

      expect(linkComponent.isLinkActivated).toEqual(true);
      const nativeLink = fixture.nativeElement.querySelector('a');
      const nativeButton = fixture.nativeElement.querySelector('button');
      expect(nativeLink.className).toEqual('active');
      expect(nativeButton.className).toEqual('active');

      router.navigateByUrl('/team/22/link/simple');
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link/simple');
      expect(linkComponent.isLinkActivated).toEqual(false);
      expect(nativeLink.className).toEqual('');
      expect(nativeButton.className).toEqual('');
    }));

    it('should set a provided aria-current attribute when the link is active (a tag)', fakeAsync(() => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {
              path: 'link',
              component: DummyLinkCmp,
              children: [
                {path: 'simple', component: SimpleCmp},
                {path: '', component: BlankCmp},
              ],
            },
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link;exact=true');
      advance(fixture);
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link;exact=true');

      const nativeLink = fixture.nativeElement.querySelector('a');
      const nativeButton = fixture.nativeElement.querySelector('button');
      expect(nativeLink.getAttribute('aria-current')).toEqual('page');
      expect(nativeButton.hasAttribute('aria-current')).toEqual(false);

      router.navigateByUrl('/team/22/link/simple');
      advance(fixture);
      expect(location.path()).toEqual('/team/22/link/simple');
      expect(nativeLink.hasAttribute('aria-current')).toEqual(false);
      expect(nativeButton.hasAttribute('aria-current')).toEqual(false);
    }));
  });
}
