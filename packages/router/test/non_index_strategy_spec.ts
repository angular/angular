/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {provideLocationMocks} from '@angular/common/testing';
import {Component, inject, Inject, Injectable, NgModule} from '@angular/core';
import {Meta} from '@angular/platform-browser';
import {TestBed} from '@angular/core/testing';
import {
  provideRouter,
  Router,
  RouterModule,
  RouterStateSnapshot,
  NonIndexStrategy,
  withRouterConfig,
  ActivatedRoute,
  ResolveFn,
} from '../index';
import {takeUntilDestroyed} from '../../core/rxjs-interop';
import {RouterTestingHarness} from '../testing';

describe('non-index strategy', () => {
  describe('DefaultNonIndexStrategy', () => {
    let router: Router;
    let meta: Meta;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        providers: [
          provideLocationMocks(),
          provideRouter([], withRouterConfig({paramsInheritanceStrategy: 'always'})),
        ],
      });
      router = TestBed.inject(Router);
      meta = TestBed.inject(Meta);
    });

    it('sets page nonIndex from data', async () => {
      router.resetConfig([{path: 'home', nonIndex: true, component: BlankCmp}]);
      await router.navigateByUrl('home');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toContain('noindex,nofollow');
    });

    it('does not set noindex when nonIndex is false', async () => {
      router.resetConfig([{path: 'home', nonIndex: false, component: BlankCmp}]);
      await router.navigateByUrl('home');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toContain('index,follow');
    });

    it('sets nonIndex from resolved data', async () => {
      router.resetConfig([
        {
          path: 'home',
          nonIndex: NonIndexResolver,
          component: BlankCmp,
        },
      ]);
      await router.navigateByUrl('home');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toContain('noindex,nofollow');
    });

    it('sets nonIndex from resolved data function', async () => {
      router.resetConfig([
        {
          path: 'home',
          nonIndex: () => true,
          component: BlankCmp,
        },
      ]);
      await router.navigateByUrl('home');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toContain('noindex,nofollow');
    });

    it('inherits nonIndex from parent routes', async () => {
      router.resetConfig([
        {
          path: 'parent',
          nonIndex: true,
          children: [{path: 'child', component: BlankCmp}],
        },
      ]);
      await router.navigateByUrl('parent/child');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toContain('noindex');
    });

    it('child route nonIndex overrides parent', async () => {
      router.resetConfig([
        {
          path: 'home',
          nonIndex: true,
          children: [{path: 'child', nonIndex: false, component: BlankCmp}],
        },
      ]);
      await router.navigateByUrl('home/child');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toContain('index,follow');
    });

    it('sets title with child routes and named outlets', async () => {
      router.resetConfig([
        {
          path: 'home',
          title: 'My Application',
          children: [
            {path: '', nonIndex: false, component: BlankCmp},
            {path: '', outlet: 'childaux', nonIndex: true, component: BlankCmp},
          ],
        },
        {path: 'compose', component: BlankCmp, outlet: 'aux'},
      ]);
      await router.navigateByUrl('home(aux:compose)');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toContain('index,follow');
    });

    it('uses deepest primary route nonIndex value', async () => {
      router.resetConfig([
        {
          path: 'level1',
          nonIndex: false,
          children: [
            {
              path: 'level2',
              nonIndex: true,
              children: [{path: 'level3', nonIndex: false, component: BlankCmp}],
            },
          ],
        },
      ]);
      await router.navigateByUrl('level1/level2/level3');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toContain('index,follow');
    });

    it('can get the nonIndex from the ActivatedRouteSnapshot', async () => {
      router.resetConfig([
        {
          path: 'home',
          nonIndex: true,
          component: BlankCmp,
        },
      ]);
      await router.navigateByUrl('home');
      expect(router.routerState.snapshot.root.firstChild!.nonIndex).toEqual(true);
    });

    it('pushes updates through the nonIndex observable', async () => {
      @Component({template: ''})
      class HomeCmp {
        private readonly nonIndex$ = inject(ActivatedRoute).nonIndex.pipe(takeUntilDestroyed());
        nonIndex?: boolean;

        constructor() {
          this.nonIndex$.subscribe((v) => (this.nonIndex = v));
        }
      }

      const nonIndexResolver: ResolveFn<boolean> = (route) =>
        JSON.parse(route.queryParams['nonIndex']);

      router.resetConfig([
        {
          path: 'home',
          nonIndex: nonIndexResolver,
          component: HomeCmp,
          runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        },
      ]);

      const harness = await RouterTestingHarness.create();
      const homeCmp = await harness.navigateByUrl('/home?nonIndex=true', HomeCmp);
      expect(homeCmp.nonIndex).toEqual(true);
      await harness.navigateByUrl('home?nonIndex=false');
      expect(homeCmp.nonIndex).toEqual(false);
    });
  });

  describe('custom strategies', () => {
    it('allows overriding the updateNonIndex method', async () => {
      @Injectable({providedIn: 'root'})
      class CustomNonIndexStrategy extends NonIndexStrategy {
        constructor(private meta: Meta) {
          super();
        }

        override updateNonIndex(state: RouterStateSnapshot) {
          const nonIndex = this.buildNonIndex(state);
          if (nonIndex) {
            // Custom implementation: only set noindex, not nofollow
            this.meta.updateTag({name: 'robots', content: 'noindex'});
          }
        }
      }

      TestBed.configureTestingModule({
        imports: [TestModule],
        providers: [
          provideLocationMocks(),
          provideRouter([]),
          {provide: NonIndexStrategy, useClass: CustomNonIndexStrategy},
        ],
      });

      const router = TestBed.inject(Router);
      const meta = TestBed.inject(Meta);

      router.resetConfig([{path: 'custom', nonIndex: true, component: BlankCmp}]);
      await router.navigateByUrl('custom');

      const robotsTag = meta.getTag('name="robots"');
      expect(robotsTag?.content).toBe('noindex');
      expect(robotsTag?.content).not.toContain('nofollow');
    });

    it('allows completely custom nonIndex logic', async () => {
      @Injectable({providedIn: 'root'})
      class ConditionalNonIndexStrategy extends NonIndexStrategy {
        constructor(@Inject(DOCUMENT) private document: Document) {
          super();
        }

        override updateNonIndex(state: RouterStateSnapshot) {
          const nonIndex = this.buildNonIndex(state);
          // Custom logic: add a data attribute instead of meta tag
          if (nonIndex) {
            this.document.body.setAttribute('data-noindex', 'true');
          } else {
            this.document.body.removeAttribute('data-noindex');
          }
        }
      }

      TestBed.configureTestingModule({
        imports: [TestModule],
        providers: [
          provideLocationMocks(),
          provideRouter([]),
          {provide: NonIndexStrategy, useClass: ConditionalNonIndexStrategy},
        ],
      });

      const router = TestBed.inject(Router);
      const document = TestBed.inject(DOCUMENT);

      router.resetConfig([{path: 'custom', nonIndex: true, component: BlankCmp}]);
      await router.navigateByUrl('custom');

      expect(document.body.getAttribute('data-noindex')).toBe('true');
    });
  });
});

@Component({
  template: '',
  standalone: false,
})
export class BlankCmp {}

@Component({
  template: `
<router-outlet></router-outlet>
<router-outlet name="auxiliary"></router-outlet>
`,
  standalone: false,
})
export class RootCmp {}

@NgModule({
  declarations: [BlankCmp],
  imports: [RouterModule.forRoot([])],
})
export class TestModule {}

@Injectable({providedIn: 'root'})
export class NonIndexResolver {
  resolve() {
    return true;
  }
}
