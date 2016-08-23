/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {of } from 'rxjs/observable/of';

import {applyRedirects} from '../src/apply_redirects';
import {Routes} from '../src/config';
import {LoadedRouterConfig} from '../src/router_config_loader';
import {DefaultUrlSerializer, UrlSegmentGroup, UrlTree, equalSegments} from '../src/url_tree';

describe('applyRedirects', () => {

  it('should return the same url tree when no redirects', () => {
    checkRedirect(
        [{path: 'a', component: ComponentA, children: [{path: 'b', component: ComponentB}]}],
        '/a/b', (t: UrlTree) => { compareTrees(t, tree('/a/b')); });
  });

  it('should add new segments when needed', () => {
    checkRedirect(
        [{path: 'a/b', redirectTo: 'a/b/c'}, {path: '**', component: ComponentC}], '/a/b',
        (t: UrlTree) => { compareTrees(t, tree('/a/b/c')); });
  });

  it('should handle positional parameters', () => {
    checkRedirect(
        [
          {path: 'a/:aid/b/:bid', redirectTo: 'newa/:aid/newb/:bid'},
          {path: '**', component: ComponentC}
        ],
        '/a/1/b/2', (t: UrlTree) => { compareTrees(t, tree('/newa/1/newb/2')); });
  });

  it('should throw when cannot handle a positional parameter', () => {
    applyRedirects(null, null, tree('/a/1'), [
      {path: 'a/:id', redirectTo: 'a/:other'}
    ]).subscribe(() => {}, (e) => {
      expect(e.message).toEqual('Cannot redirect to \'a/:other\'. Cannot find \':other\'.');
    });
  });

  it('should pass matrix parameters', () => {
    checkRedirect(
        [{path: 'a/:id', redirectTo: 'd/a/:id/e'}, {path: '**', component: ComponentC}],
        '/a;p1=1/1;p2=2', (t: UrlTree) => { compareTrees(t, tree('/d/a;p1=1/1;p2=2/e')); });
  });

  it('should handle preserve secondary routes', () => {
    checkRedirect(
        [
          {path: 'a/:id', redirectTo: 'd/a/:id/e'},
          {path: 'c/d', component: ComponentA, outlet: 'aux'}, {path: '**', component: ComponentC}
        ],
        '/a/1(aux:c/d)', (t: UrlTree) => { compareTrees(t, tree('/d/a/1/e(aux:c/d)')); });
  });

  it('should redirect secondary routes', () => {
    checkRedirect(
        [
          {path: 'a/:id', component: ComponentA},
          {path: 'c/d', redirectTo: 'f/c/d/e', outlet: 'aux'},
          {path: '**', component: ComponentC, outlet: 'aux'}
        ],
        '/a/1(aux:c/d)', (t: UrlTree) => { compareTrees(t, tree('/a/1(aux:f/c/d/e)')); });
  });

  it('should use the configuration of the route redirected to', () => {
    checkRedirect(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [
              {path: 'b', component: ComponentB},
            ]
          },
          {path: 'c', redirectTo: 'a'}
        ],
        'c/b', (t: UrlTree) => { compareTrees(t, tree('a/b')); });
  });

  it('should support redirects with both main and aux', () => {
    checkRedirect(
        [{
          path: 'a',
          children: [
            {path: 'bb', component: ComponentB}, {path: 'b', redirectTo: 'bb'},

            {path: 'cc', component: ComponentC, outlet: 'aux'},
            {path: 'b', redirectTo: 'cc', outlet: 'aux'}
          ]
        }],
        'a/(b//aux:b)', (t: UrlTree) => { compareTrees(t, tree('a/(bb//aux:cc)')); });
  });

  it('should support redirects with both main and aux (with a nested redirect)', () => {
    checkRedirect(
        [{
          path: 'a',
          children: [
            {path: 'bb', component: ComponentB}, {path: 'b', redirectTo: 'bb'},

            {
              path: 'cc',
              component: ComponentC,
              outlet: 'aux',
              children: [{path: 'dd', component: ComponentC}, {path: 'd', redirectTo: 'dd'}]
            },
            {path: 'b', redirectTo: 'cc/d', outlet: 'aux'}
          ]
        }],
        'a/(b//aux:b)', (t: UrlTree) => { compareTrees(t, tree('a/(bb//aux:cc/dd)')); });
  });

  it('should redirect wild cards', () => {
    checkRedirect(
        [
          {path: '404', component: ComponentA},
          {path: '**', redirectTo: '/404'},
        ],
        '/a/1(aux:c/d)', (t: UrlTree) => { compareTrees(t, tree('/404')); });
  });

  it('should support absolute redirects', () => {
    checkRedirect(
        [
          {
            path: 'a',
            component: ComponentA,
            children: [{path: 'b/:id', redirectTo: '/absolute/:id'}]
          },
          {path: '**', component: ComponentC}
        ],
        '/a/b/1', (t: UrlTree) => { compareTrees(t, tree('/absolute/1')); });
  });

  describe('lazy loading', () => {
    it('should load config on demand', () => {
      const loadedConfig = new LoadedRouterConfig(
          [{path: 'b', component: ComponentB}], <any>'stubInjector', <any>'stubFactoryResolver');
      const loader = {
        load: (injector: any, p: any) => {
          if (injector !== 'providedInjector') throw 'Invalid Injector';
          return of (loadedConfig);
        }
      };
      const config = [{path: 'a', component: ComponentA, loadChildren: 'children'}];

      applyRedirects(<any>'providedInjector', <any>loader, tree('a/b'), config).forEach(r => {
        compareTrees(r, tree('/a/b'));
        expect((<any>config[0])._loadedConfig).toBe(loadedConfig);
      });
    });

    it('should handle the case when the loader errors', () => {
      const loader = {
        load: (p: any) => new Observable<any>((obs: any) => obs.error(new Error('Loading Error')))
      };
      const config = [{path: 'a', component: ComponentA, loadChildren: 'children'}];

      applyRedirects(null, <any>loader, tree('a/b'), config).subscribe(() => {}, (e) => {
        expect(e.message).toEqual('Loading Error');
      });
    });

    it('should load when all canLoad guards return true', () => {
      const loadedConfig = new LoadedRouterConfig(
          [{path: 'b', component: ComponentB}], <any>'stubInjector', <any>'stubFactoryResolver');
      const loader = {load: (injector: any, p: any) => of (loadedConfig)};

      const guard = () => true;
      const injector = {get: () => guard};

      const config = [{
        path: 'a',
        component: ComponentA,
        canLoad: ['guard1', 'guard2'],
        loadChildren: 'children'
      }];

      applyRedirects(<any>injector, <any>loader, tree('a/b'), config).forEach(r => {
        compareTrees(r, tree('/a/b'));
      });
    });

    it('should not load when any canLoad guards return false', () => {
      const loadedConfig = new LoadedRouterConfig(
          [{path: 'b', component: ComponentB}], <any>'stubInjector', <any>'stubFactoryResolver');
      const loader = {load: (injector: any, p: any) => of (loadedConfig)};

      const trueGuard = () => true;
      const falseGuard = () => false;
      const injector = {get: (guardName: any) => guardName === 'guard1' ? trueGuard : falseGuard};

      const config = [{
        path: 'a',
        component: ComponentA,
        canLoad: ['guard1', 'guard2'],
        loadChildren: 'children'
      }];

      applyRedirects(<any>injector, <any>loader, tree('a/b'), config)
          .subscribe(
              () => { throw 'Should not reach'; },
              (e) => {
                expect(e.message).toEqual(
                    `Cannot load children because the guard of the route "path: 'a'" returned false`);
              });
    });

    it('should not load when any canLoad guards is rejected (promises)', () => {
      const loadedConfig = new LoadedRouterConfig(
          [{path: 'b', component: ComponentB}], <any>'stubInjector', <any>'stubFactoryResolver');
      const loader = {load: (injector: any, p: any) => of (loadedConfig)};

      const trueGuard = () => Promise.resolve(true);
      const falseGuard = () => Promise.reject('someError');
      const injector = {get: (guardName: any) => guardName === 'guard1' ? trueGuard : falseGuard};

      const config = [{
        path: 'a',
        component: ComponentA,
        canLoad: ['guard1', 'guard2'],
        loadChildren: 'children'
      }];

      applyRedirects(<any>injector, <any>loader, tree('a/b'), config)
          .subscribe(
              () => { throw 'Should not reach'; }, (e) => { expect(e).toEqual('someError'); });
    });

    it('should work with objects implementing the CanLoad interface', () => {
      const loadedConfig = new LoadedRouterConfig(
          [{path: 'b', component: ComponentB}], <any>'stubInjector', <any>'stubFactoryResolver');
      const loader = {load: (injector: any, p: any) => of (loadedConfig)};

      const guard = {canLoad: () => Promise.resolve(true)};
      const injector = {get: () => guard};

      const config =
          [{path: 'a', component: ComponentA, canLoad: ['guard'], loadChildren: 'children'}];

      applyRedirects(<any>injector, <any>loader, tree('a/b'), config)
          .subscribe(
              (r) => { compareTrees(r, tree('/a/b')); }, (e) => { throw 'Should not reach'; });

    });

    it('should work with absolute redirects', () => {
      const loadedConfig = new LoadedRouterConfig(
          [{path: '', component: ComponentB}], <any>'stubInjector', <any>'stubFactoryResolver');

      const loader = {load: (injector: any, p: any) => of (loadedConfig)};

      const config =
          [{path: '', pathMatch: 'full', redirectTo: '/a'}, {path: 'a', loadChildren: 'children'}];

      applyRedirects(<any>'providedInjector', <any>loader, tree(''), config).forEach(r => {
        compareTrees(r, tree('a'));
        expect((<any>config[1])._loadedConfig).toBe(loadedConfig);
      });
    });

    it('should load the configuration only once', () => {
      const loadedConfig = new LoadedRouterConfig(
          [{path: '', component: ComponentB}], <any>'stubInjector', <any>'stubFactoryResolver');

      let called = false;
      const loader = {
        load: (injector: any, p: any) => {
          if (called) throw new Error('Should not be called twice');
          called = true;
          return of (loadedConfig);
        }
      };

      const config = [{path: 'a', loadChildren: 'children'}];

      applyRedirects(<any>'providedInjector', <any>loader, tree('a?k1'), config).subscribe(r => {});

      applyRedirects(<any>'providedInjector', <any>loader, tree('a?k2'), config)
          .subscribe(
              r => {
                compareTrees(r, tree('a'));
                expect((<any>config[0])._loadedConfig).toBe(loadedConfig);
              },
              (e) => { throw 'Should not reach'; });
    });
  });

  describe('empty paths', () => {
    it('redirect from an empty path should work (local redirect)', () => {
      checkRedirect(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
              ]
            },
            {path: '', redirectTo: 'a'}
          ],
          'b', (t: UrlTree) => { compareTrees(t, tree('a/b')); });
    });

    it('redirect from an empty path should work (absolute redirect)', () => {
      checkRedirect(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [
                {path: 'b', component: ComponentB},
              ]
            },
            {path: '', redirectTo: '/a/b'}
          ],
          '', (t: UrlTree) => { compareTrees(t, tree('a/b')); });
    });

    it('should redirect empty path route only when terminal', () => {
      const config: Routes = [
        {
          path: 'a',
          component: ComponentA,
          children: [
            {path: 'b', component: ComponentB},
          ]
        },
        {path: '', redirectTo: 'a', pathMatch: 'full'}
      ];

      applyRedirects(null, null, tree('b'), config)
          .subscribe(
              (_) => { throw 'Should not be reached'; },
              e => { expect(e.message).toEqual('Cannot match any routes: \'b\''); });
    });

    it('redirect from an empty path should work (nested case)', () => {
      checkRedirect(
          [
            {
              path: 'a',
              component: ComponentA,
              children: [{path: 'b', component: ComponentB}, {path: '', redirectTo: 'b'}]
            },
            {path: '', redirectTo: 'a'}
          ],
          '', (t: UrlTree) => { compareTrees(t, tree('a/b')); });
    });

    it('redirect to an empty path should work', () => {
      checkRedirect(
          [
            {path: '', component: ComponentA, children: [{path: 'b', component: ComponentB}]},
            {path: 'a', redirectTo: ''}
          ],
          'a/b', (t: UrlTree) => { compareTrees(t, tree('b')); });
    });

    describe('aux split is in the middle', () => {
      it('should create a new url segment (non-terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a/b', (t: UrlTree) => { compareTrees(t, tree('a/(b//aux:c)')); });
      });

      it('should create a new url segment (terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a/b', (t: UrlTree) => { compareTrees(t, tree('a/b')); });
      });
    });

    describe('split at the end (no right child)', () => {
      it('should create a new child (non-terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB}, {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a', (t: UrlTree) => { compareTrees(t, tree('a/(b//aux:c)')); });
      });

      it('should create a new child (terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB}, {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'},
                {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a', (t: UrlTree) => { compareTrees(t, tree('a/(b//aux:c)')); });
      });

      it('should work only only primary outlet', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB}, {path: '', redirectTo: 'b'},
                {path: 'c', component: ComponentC, outlet: 'aux'}
              ]
            }],
            'a/(aux:c)', (t: UrlTree) => { compareTrees(t, tree('a/(b//aux:c)')); });
      });
    });

    describe('split at the end (right child)', () => {
      it('should create a new child (non-terminal)', () => {
        checkRedirect(
            [{
              path: 'a',
              children: [
                {path: 'b', component: ComponentB, children: [{path: 'd', component: ComponentB}]},
                {path: '', redirectTo: 'b'}, {
                  path: 'c',
                  component: ComponentC,
                  outlet: 'aux',
                  children: [{path: 'e', component: ComponentC}]
                },
                {path: '', redirectTo: 'c', outlet: 'aux'}
              ]
            }],
            'a/(d//aux:e)', (t: UrlTree) => { compareTrees(t, tree('a/(b/d//aux:c/e)')); });
      });

      it('should not create a new child (terminal)', () => {
        const config: Routes = [{
          path: 'a',
          children: [
            {path: 'b', component: ComponentB, children: [{path: 'd', component: ComponentB}]},
            {path: '', redirectTo: 'b'}, {
              path: 'c',
              component: ComponentC,
              outlet: 'aux',
              children: [{path: 'e', component: ComponentC}]
            },
            {path: '', pathMatch: 'full', redirectTo: 'c', outlet: 'aux'}
          ]
        }];

        applyRedirects(null, null, tree('a/(d//aux:e)'), config)
            .subscribe(
                (_) => { throw 'Should not be reached'; },
                e => { expect(e.message).toEqual('Cannot match any routes: \'a\''); });
      });
    });
  });
});

function checkRedirect(config: Routes, url: string, callback: any): void {
  applyRedirects(null, null, tree(url), config).subscribe(callback, e => { throw e; });
}

function tree(url: string): UrlTree {
  return new DefaultUrlSerializer().parse(url);
}

function compareTrees(actual: UrlTree, expected: UrlTree): void {
  const serializer = new DefaultUrlSerializer();
  const error =
      `"${serializer.serialize(actual)}" is not equal to "${serializer.serialize(expected)}"`;
  compareSegments(actual.root, expected.root, error);
}

function compareSegments(actual: UrlSegmentGroup, expected: UrlSegmentGroup, error: string): void {
  expect(actual).toBeDefined(error);
  expect(equalSegments(actual.segments, expected.segments)).toEqual(true, error);

  expect(Object.keys(actual.children).length).toEqual(Object.keys(expected.children).length, error);

  Object.keys(expected.children).forEach(key => {
    compareSegments(actual.children[key], expected.children[key], error);
  });
}

class ComponentA {}
class ComponentB {}
class ComponentC {}
