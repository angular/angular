/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {Router} from '../../src';
import {expect} from '@angular/private/testing/matchers';
import {
  RootCmp,
  BlankCmp,
  TeamCmp,
  StringLinkCmp,
  SimpleCmp,
  StringLinkButtonCmp,
  AbsoluteLinkCmp,
  RelativeLinkCmp,
  RelativeLinkInIfCmp,
  LinkWithQueryParamsAndFragment,
  LinkWithState,
  DivLinkWithState,
  createRoot,
  advance,
} from './integration_helpers';
import {timeout} from '../helpers';

export function routerLinkIntegrationSpec() {
  describe('router links', () => {
    it('should support skipping location update for anchor router links', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);
      await advance(fixture);

      router.resetConfig([{path: 'team/:id', component: TeamCmp}]);

      router.navigateByUrl('/team/22');
      await advance(fixture);
      expect(location.path()).toEqual('/team/22');
      expect(fixture.nativeElement).toHaveText('team 22 [ , right:  ]');

      const teamCmp = fixture.debugElement.childNodes[1].componentInstance;

      teamCmp.routerLink.set(['/team/0']);
      await advance(fixture);
      const anchor = fixture.debugElement.query(By.css('a')).nativeElement;
      anchor.click();
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('team 0 [ , right:  ]');
      expect(location.path()).toEqual('/team/22');

      teamCmp.routerLink.set(['/team/1']);
      await advance(fixture);
      const button = fixture.debugElement.query(By.css('button')).nativeElement;
      button.click();
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('team 1 [ , right:  ]');
      expect(location.path()).toEqual('/team/22');
    });

    it('should support string router links', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {path: 'link', component: StringLinkCmp},
            {path: 'simple', component: SimpleCmp},
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

      const native = fixture.nativeElement.querySelector('a');
      expect(native.getAttribute('href')).toEqual('/team/33/simple');
      expect(native.getAttribute('target')).toEqual('_self');
      native.click();
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');
    });

    it('should not preserve query params and fragment by default', async () => {
      @Component({
        selector: 'someRoot',
        template: `<router-outlet></router-outlet><a routerLink="/home">Link</a>`,
        standalone: false,
      })
      class RootCmpWithLink {}

      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
      const router: Router = TestBed.inject(Router);

      const fixture = await createRoot(router, RootCmpWithLink);

      router.resetConfig([{path: 'home', component: SimpleCmp}]);

      const native = fixture.nativeElement.querySelector('a');

      router.navigateByUrl('/home?q=123#fragment');
      await advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home');
    });

    it('should not throw when commands is null or undefined', async () => {
      @Component({
        selector: 'someCmp',
        template: `<router-outlet></router-outlet>
                <a [routerLink]="null">Link</a>
                <button [routerLink]="null">Button</button>
                <a [routerLink]="undefined">Link</a>
                <button [routerLink]="undefined">Button</button>
                `,
        standalone: false,
      })
      class CmpWithLink {}

      TestBed.configureTestingModule({declarations: [CmpWithLink]});
      const router: Router = TestBed.inject(Router);

      let fixture: ComponentFixture<CmpWithLink> = await createRoot(router, CmpWithLink);
      router.resetConfig([{path: 'home', component: SimpleCmp}]);
      const anchors = fixture.nativeElement.querySelectorAll('a');
      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(() => anchors[0].click()).not.toThrow();
      expect(() => anchors[1].click()).not.toThrow();
      expect(() => buttons[0].click()).not.toThrow();
      expect(() => buttons[1].click()).not.toThrow();
    });

    it('should not throw when some command is null', async () => {
      @Component({
        selector: 'someCmp',
        template: `<router-outlet></router-outlet><a [routerLink]="[null]">Link</a><button [routerLink]="[null]">Button</button>`,
        standalone: false,
      })
      class CmpWithLink {}

      TestBed.configureTestingModule({declarations: [CmpWithLink]});
      const router: Router = TestBed.inject(Router);

      expect(async () => await createRoot(router, CmpWithLink)).not.toThrow();
    });

    it('should not throw when some command is undefined', async () => {
      @Component({
        selector: 'someCmp',
        template: `<router-outlet></router-outlet><a [routerLink]="[undefined]">Link</a><button [routerLink]="[undefined]">Button</button>`,
        standalone: false,
      })
      class CmpWithLink {}

      TestBed.configureTestingModule({declarations: [CmpWithLink]});
      const router: Router = TestBed.inject(Router);

      expect(async () => await createRoot(router, CmpWithLink)).not.toThrow();
    });

    it('should update hrefs when query params or fragment change', async () => {
      @Component({
        selector: 'someRoot',
        template: `<router-outlet></router-outlet><a routerLink="/home" queryParamsHandling="preserve" preserveFragment>Link</a>`,
        standalone: false,
      })
      class RootCmpWithLink {}
      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmpWithLink);

      router.resetConfig([{path: 'home', component: SimpleCmp}]);

      const native = fixture.nativeElement.querySelector('a');

      router.navigateByUrl('/home?q=123');
      await advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=123');

      router.navigateByUrl('/home?q=456');
      await advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=456');

      router.navigateByUrl('/home?q=456#1');
      await advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?q=456#1');
    });

    it('should correctly use the preserve strategy', async () => {
      @Component({
        selector: 'someRoot',
        template: `<router-outlet></router-outlet><a routerLink="/home" [queryParams]="{q: 456}" queryParamsHandling="preserve">Link</a>`,
        standalone: false,
      })
      class RootCmpWithLink {}
      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmpWithLink);

      router.resetConfig([{path: 'home', component: SimpleCmp}]);

      const native = fixture.nativeElement.querySelector('a');

      router.navigateByUrl('/home?a=123');
      await advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?a=123');
    });

    it('should correctly use the merge strategy', async () => {
      @Component({
        selector: 'someRoot',
        template: `<router-outlet></router-outlet><a routerLink="/home" [queryParams]="{removeMe: null, q: 456}" queryParamsHandling="merge">Link</a>`,
        standalone: false,
      })
      class RootCmpWithLink {}
      TestBed.configureTestingModule({declarations: [RootCmpWithLink]});
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmpWithLink);

      router.resetConfig([{path: 'home', component: SimpleCmp}]);

      const native = fixture.nativeElement.querySelector('a');

      router.navigateByUrl('/home?a=123&removeMe=123');
      await advance(fixture);
      expect(native.getAttribute('href')).toEqual('/home?a=123&q=456');
    });

    it('should support using links on non-a tags', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {path: 'link', component: StringLinkButtonCmp},
            {path: 'simple', component: SimpleCmp},
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

      const button = fixture.nativeElement.querySelector('button');
      expect(button.getAttribute('tabindex')).toEqual('0');
      button.click();
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');
    });

    it('should support absolute router links', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {path: 'link', component: AbsoluteLinkCmp},
            {path: 'simple', component: SimpleCmp},
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

      const native = fixture.nativeElement.querySelector('a');
      expect(native.getAttribute('href')).toEqual('/team/33/simple');
      native.click();
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 33 [ simple, right:  ]');
    });

    it('should support relative router links', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {path: 'link', component: RelativeLinkCmp},
            {path: 'simple', component: SimpleCmp},
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('team 22 [ link, right:  ]');

      const native = fixture.nativeElement.querySelector('a');
      expect(native.getAttribute('href')).toEqual('/team/22/simple');
      native.click();
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 22 [ simple, right:  ]');
    });

    it('should support top-level link', async () => {
      const router: Router = TestBed.inject(Router);
      const fixture = await createRoot(router, RelativeLinkInIfCmp);
      await advance(fixture);

      router.resetConfig([
        {path: 'simple', component: SimpleCmp},
        {path: '', component: BlankCmp},
      ]);

      router.navigateByUrl('/');
      await advance(fixture);
      expect(fixture.nativeElement).toHaveText('');
      const cmp = fixture.componentInstance;

      cmp.show.set(true);
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('link');
      const native = fixture.nativeElement.querySelector('a');

      expect(native.getAttribute('href')).toEqual('/simple');
      native.click();
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('linksimple');
    });

    it('should support query params and fragments', async () => {
      const router: Router = TestBed.inject(Router);
      const location: Location = TestBed.inject(Location);
      const fixture = await createRoot(router, RootCmp);

      router.resetConfig([
        {
          path: 'team/:id',
          component: TeamCmp,
          children: [
            {path: 'link', component: LinkWithQueryParamsAndFragment},
            {path: 'simple', component: SimpleCmp},
          ],
        },
      ]);

      router.navigateByUrl('/team/22/link');
      await advance(fixture);

      const native = fixture.nativeElement.querySelector('a');
      expect(native.getAttribute('href')).toEqual('/team/22/simple?q=1#f');
      native.click();
      await advance(fixture);

      expect(fixture.nativeElement).toHaveText('team 22 [ simple, right:  ]');

      expect(location.path(true)).toEqual('/team/22/simple?q=1#f');
    });

    describe('should support history and state', () => {
      let component: typeof LinkWithState | typeof DivLinkWithState;
      it('for anchor elements', () => {
        // Test logic in afterEach to reduce duplication
        component = LinkWithState;
      });

      it('for non-anchor elements', () => {
        // Test logic in afterEach to reduce duplication
        component = DivLinkWithState;
      });

      afterEach(async () => {
        const router: Router = TestBed.inject(Router);
        const location: Location = TestBed.inject(Location);
        const fixture = await createRoot(router, RootCmp);

        router.resetConfig([
          {
            path: 'team/:id',
            component: TeamCmp,
            children: [
              {path: 'link', component},
              {path: 'simple', component: SimpleCmp},
            ],
          },
        ]);

        router.navigateByUrl('/team/22/link');
        await advance(fixture);

        const native = fixture.nativeElement.querySelector('#link');
        native.click();
        await advance(fixture);

        expect(fixture.nativeElement).toHaveText('team 22 [ simple, right:  ]');

        // Check the history entry
        expect(location.getState()).toEqual({foo: 'bar', navigationId: 3});
      });
    });

    it('should set href on area elements', async () => {
      @Component({
        selector: 'someRoot',
        template: `<router-outlet></router-outlet><map><area routerLink="/home" /></map>`,
        standalone: false,
      })
      class RootCmpWithArea {}

      TestBed.configureTestingModule({declarations: [RootCmpWithArea]});
      const router: Router = TestBed.inject(Router);

      const fixture = await createRoot(router, RootCmpWithArea);

      router.resetConfig([{path: 'home', component: SimpleCmp}]);

      const native = fixture.nativeElement.querySelector('area');
      expect(native.getAttribute('href')).toEqual('/home');
    });
  });
}
