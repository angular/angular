/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router, RouterModule, CanActivateFn} from '../index';
import {
  getLoadedRoutes,
  getRouterInstance,
  navigateByUrl,
  parseRoutes,
} from '../src/router_devtools';

@Component({template: '<div>simple standalone</div>'})
export class SimpleStandaloneComponent {}

@Component({
  template: '<router-outlet></router-outlet>',
  imports: [RouterModule],
})
export class RootCmp {}

describe('router_devtools', () => {
  describe('getLoadedRoutes', () => {
    it('should return loaded routes when called with load children', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'lazy',
              component: RootCmp,
              loadChildren: () => [{path: 'simple', component: SimpleStandaloneComponent}],
            },
          ]),
        ],
      });

      const root = TestBed.createComponent(RootCmp);

      const router = TestBed.inject(Router);
      await router.navigateByUrl('/lazy/simple');
      root.detectChanges();
      expect(root.nativeElement.innerHTML).toContain('simple standalone');

      const loadedRoutes = getLoadedRoutes(router.config[0]);
      const loadedPath = loadedRoutes && loadedRoutes[0].path;
      expect(loadedPath).toEqual('simple');
    });
  });

  it('should return undefined when called without load children', async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([
          {
            path: 'lazy',
            component: RootCmp,
          },
        ]),
      ],
    });

    const root = TestBed.createComponent(RootCmp);

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/lazy');
    root.detectChanges();
    expect(root.nativeElement.innerHTML).toContain('');

    const loadedRoutes = getLoadedRoutes(router.config[0]);
    const loadedPath = loadedRoutes && loadedRoutes[0].path;
    expect(loadedPath).toEqual(undefined);
  });

  describe('getRouterInstance', () => {
    it('should return the Router instance from the injector', () => {
      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([])],
      });
      const injector = TestBed.inject(Injector);
      const router = TestBed.inject(Router);
      expect(getRouterInstance(injector)).toBe(router);
    });

    it('should return null if Router is not provided', () => {
      const injector = Injector.create({providers: []});
      expect(getRouterInstance(injector)).toBeNull();
    });
  });

  describe('navigateByUrl', () => {
    it('should navigate to the given url', async () => {
      TestBed.configureTestingModule({
        imports: [RouterModule.forRoot([{path: 'foo', component: SimpleStandaloneComponent}])],
      });
      const router = TestBed.inject(Router);
      const result = await navigateByUrl(router, '/foo');
      expect(result).toBeTrue();
      expect(router.url).toBe('/foo');
    });

    it('should throw if not given a Router instance', async () => {
      expect(() => navigateByUrl({} as unknown as Router, '/foo')).toThrowError(
        'The provided router is not an Angular Router.',
      );
    });
  });

  describe('parseRoutes', () => {
    it('should parse basic routes', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {path: 'foo', component: SimpleStandaloneComponent},
            {path: 'bar', component: RootCmp},
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const result = parseRoutes(router);

      expect(result.component).toBe('App Root');
      expect(result.path).toBe('App Root');
      expect(result.isActive).toBe(true);
      expect(result.children).toBeDefined();
      expect(result.children!.length).toBe(2);
      expect(result.children![0].path).toBe('/foo');
      expect(result.children![0].component).toBe('SimpleStandaloneComponent');
      expect(result.children![1].path).toBe('/bar');
      expect(result.children![1].component).toBe('RootCmp');
    });

    it('should mark active routes correctly', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {path: 'foo', component: SimpleStandaloneComponent},
            {path: 'bar', component: RootCmp},
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      await router.navigateByUrl('/foo');

      const result = parseRoutes(router);

      expect(result.children![0].isActive).toBe(true);
      expect(result.children![1].isActive).toBe(false);
    });

    it('should handle nested routes', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'parent',
              component: RootCmp,
              children: [
                {path: 'child1', component: SimpleStandaloneComponent},
                {path: 'child2', component: SimpleStandaloneComponent},
              ],
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      await router.navigateByUrl('/parent/child1');

      const result = parseRoutes(router);

      expect(result.children![0].path).toBe('/parent');
      expect(result.children![0].children).toBeDefined();
      expect(result.children![0].children!.length).toBe(2);
      expect(result.children![0].children![0].path).toBe('/parent/child1');
      expect(result.children![0].children![0].isActive).toBe(true);
    });

    it('should detect lazy loaded routes', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'lazy',
              loadChildren: () => [{path: 'simple', component: SimpleStandaloneComponent}],
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      await router.navigateByUrl('/lazy/simple');

      const result = parseRoutes(router);

      expect(result.children![0].path).toBe('/lazy');
      expect(result.children![0].isLazy).toBe(true);
      expect(result.children![0].component).toBe('lazy [Lazy]');
    });

    it('should include guard information', async () => {
      const testGuard: CanActivateFn = () => true;

      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'guarded',
              component: SimpleStandaloneComponent,
              canActivate: [testGuard],
              canMatch: [testGuard],
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const result = parseRoutes(router);

      expect(result.children![0].canActivateGuards).toContain('testGuard');
      expect(result.children![0].canMatchGuards).toContain('testGuard');
    });

    it('should handle routes with title', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'titled',
              component: SimpleStandaloneComponent,
              title: 'Test Title',
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const result = parseRoutes(router);

      expect(result.children![0].title).toBe('Test Title');
    });

    it('should handle redirect routes', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'redirect',
              redirectTo: '/foo',
            },
            {path: 'foo', component: SimpleStandaloneComponent},
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const result = parseRoutes(router);

      expect(result.children![0].redirectTo).toBe('/foo');
      expect(result.children![0].component).toBe('no-name-route');
    });

    it('should handle auxiliary routes', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {path: 'aux', component: SimpleStandaloneComponent, outlet: 'sidebar'},
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const result = parseRoutes(router);

      expect(result.children![0].isAux).toBe(true);
      expect(result.children![0].path).toContain('sidebar');
    });

    it('should handle routes with data', async () => {
      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'data',
              component: SimpleStandaloneComponent,
              data: {key: 'value', number: 42},
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const result = parseRoutes(router);

      expect(result.children![0].data).toEqual({key: 'value', number: 42});
    });

    it('should handle routes with resolvers', async () => {
      const testResolver = () => 'resolved';

      TestBed.configureTestingModule({
        imports: [
          RouterModule.forRoot([
            {
              path: 'resolve',
              component: SimpleStandaloneComponent,
              resolve: {data: testResolver},
            },
          ]),
        ],
      });

      const router = TestBed.inject(Router);
      const result = parseRoutes(router);

      expect(result.children![0].resolvers).toBeDefined();
      expect(result.children![0].resolvers!['data']).toBe('testResolver');
    });
  });
});
