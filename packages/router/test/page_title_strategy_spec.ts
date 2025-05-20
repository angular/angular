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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TestBed} from '@angular/core/testing';
import {
  ActivatedRoute,
  provideRouter,
  ResolveFn,
  Router,
  RouterModule,
  RouterStateSnapshot,
  TitleStrategy,
  withRouterConfig,
} from '../index';
import {RouterTestingHarness} from '../testing';

describe('title strategy', () => {
  describe('DefaultTitleStrategy', () => {
    let router: Router;
    let document: Document;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [TestModule],
        providers: [
          provideLocationMocks(),
          provideRouter([], withRouterConfig({paramsInheritanceStrategy: 'always'})),
        ],
      });
      router = TestBed.inject(Router);
      document = TestBed.inject(DOCUMENT);
    });

    it('sets page title from data', async () => {
      router.resetConfig([{path: 'home', title: 'My Application', component: BlankCmp}]);
      await router.navigateByUrl('home');
      expect(document.title).toBe('My Application');
    });

    it('sets page title from resolved data', async () => {
      router.resetConfig([{path: 'home', title: TitleResolver, component: BlankCmp}]);
      await router.navigateByUrl('home');
      expect(document.title).toBe('resolved title');
    });

    it('sets page title from resolved data function', async () => {
      router.resetConfig([{path: 'home', title: () => 'resolved title', component: BlankCmp}]);
      await router.navigateByUrl('home');
      expect(document.title).toBe('resolved title');
    });

    it('sets title with child routes', async () => {
      router.resetConfig([
        {
          path: 'home',
          title: 'My Application',
          children: [{path: '', title: 'child title', component: BlankCmp}],
        },
      ]);
      await router.navigateByUrl('home');

      expect(document.title).toBe('child title');
    });

    it('sets title with child routes and named outlets', async () => {
      router.resetConfig([
        {
          path: 'home',
          title: 'My Application',
          children: [
            {path: '', title: 'child title', component: BlankCmp},
            {path: '', outlet: 'childaux', title: 'child aux title', component: BlankCmp},
          ],
        },
        {path: 'compose', component: BlankCmp, outlet: 'aux', title: 'compose'},
      ]);
      await router.navigateByUrl('home(aux:compose)');
      expect(document.title).toBe('child title');
    });

    it('sets page title with inherited params', async () => {
      router.resetConfig([
        {
          path: 'home',
          title: 'My Application',
          children: [
            {
              path: '',
              title: TitleResolver,
              component: BlankCmp,
            },
          ],
        },
      ]);
      await router.navigateByUrl('home');
      expect(document.title).toBe('resolved title');
    });

    it('can get the title from the ActivatedRouteSnapshot', async () => {
      router.resetConfig([
        {
          path: 'home',
          title: 'My Application',
          component: BlankCmp,
        },
      ]);
      await router.navigateByUrl('home');
      expect(router.routerState.snapshot.root.firstChild!.title).toEqual('My Application');
    });

    it('pushes updates through the title observable', async () => {
      @Component({template: ''})
      class HomeCmp {
        private readonly title$ = inject(ActivatedRoute).title.pipe(takeUntilDestroyed());
        title?: string;

        constructor() {
          this.title$.subscribe((v) => (this.title = v));
        }
      }
      const titleResolver: ResolveFn<string> = (route) => route.queryParams['id'];
      router.resetConfig([
        {
          path: 'home',
          title: titleResolver,
          component: HomeCmp,
          runGuardsAndResolvers: 'paramsOrQueryParamsChange',
        },
      ]);

      const harness = await RouterTestingHarness.create();
      const homeCmp = await harness.navigateByUrl('/home?id=1', HomeCmp);
      expect(homeCmp.title).toEqual('1');
      await harness.navigateByUrl('home?id=2');
      expect(homeCmp.title).toEqual('2');
    });
  });

  describe('custom strategies', () => {
    it('overriding the setTitle method', async () => {
      @Injectable({providedIn: 'root'})
      class TemplatePageTitleStrategy extends TitleStrategy {
        constructor(@Inject(DOCUMENT) private readonly document: Document) {
          super();
        }

        // Example of how setTitle could implement a template for the title
        override updateTitle(state: RouterStateSnapshot) {
          const title = this.buildTitle(state);
          this.document.title = `My Application | ${title}`;
        }
      }

      TestBed.configureTestingModule({
        imports: [TestModule],
        providers: [
          provideLocationMocks(),
          provideRouter([]),
          {provide: TitleStrategy, useClass: TemplatePageTitleStrategy},
        ],
      });
      const router = TestBed.inject(Router);
      const document = TestBed.inject(DOCUMENT);
      router.resetConfig([
        {
          path: 'home',
          title: 'Home',
          children: [{path: '', title: 'Child', component: BlankCmp}],
        },
      ]);

      await router.navigateByUrl('home');
      expect(document.title).toEqual('My Application | Child');
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
<router-outlet name="aux"></router-outlet>
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
export class TitleResolver {
  resolve() {
    return 'resolved title';
  }
}
