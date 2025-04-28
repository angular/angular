/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Injectable} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {createUrlTreeFromSnapshot} from '../src/create_url_tree';
import {QueryParamsHandling, Routes} from '../src/models';
import {Router} from '../src/router';
import {RouterModule} from '../src/router_module';
import {ActivatedRoute, ActivatedRouteSnapshot} from '../src/router_state';
import {Params, PRIMARY_OUTLET} from '../src/shared';
import {DefaultUrlSerializer, UrlTree} from '../src/url_tree';
import {provideRouter, withRouterConfig} from '../src';
import {timeout} from './helpers';

describe('createUrlTree', () => {
  const serializer = new DefaultUrlSerializer();
  let router: Router;
  beforeEach(() => {
    router = TestBed.inject(Router);
    router.resetConfig([
      {
        path: 'parent',
        children: [
          {path: 'child', component: class {}},
          {path: '**', outlet: 'secondary', component: class {}},
        ],
      },
      {
        path: 'a',
        children: [
          {path: '**', component: class {}},
          {path: '**', outlet: 'right', component: class {}},
          {path: '**', outlet: 'left', component: class {}},
        ],
      },
      {path: '**', component: class {}},
      {path: '**', outlet: 'right', component: class {}},
      {path: '**', outlet: 'left', component: class {}},
      {path: '**', outlet: 'rootSecondary', component: class {}},
    ]);
  });

  describe('query parameters', () => {
    it('should support parameter with multiple values', async () => {
      const p1 = serializer.parse('/');
      const t1 = await createRoot(p1, ['/'], {m: ['v1', 'v2']});
      expect(serializer.serialize(t1)).toEqual('/?m=v1&m=v2');

      await router.navigateByUrl('/a/c');
      const t2 = create(router.routerState.root.children[0].children[0], ['c2'], {m: ['v1', 'v2']});
      expect(serializer.serialize(t2)).toEqual('/a/c/c2?m=v1&m=v2');
    });

    it('should support parameter with empty arrays as values', async () => {
      await router.navigateByUrl('/a/c');
      const t1 = create(router.routerState.root.children[0].children[0], ['c2'], {m: []});
      expect(serializer.serialize(t1)).toEqual('/a/c/c2');

      const t2 = create(router.routerState.root.children[0].children[0], ['c2'], {m: [], n: 1});
      expect(serializer.serialize(t2)).toEqual('/a/c/c2?n=1');
    });

    it('should set query params', async () => {
      const p = serializer.parse('/');
      const t = await createRoot(p, [], {a: 'hey'});
      expect(t.queryParams).toEqual({a: 'hey'});
      expect(t.queryParamMap.get('a')).toEqual('hey');
    });

    it('should stringify query params', async () => {
      const p = serializer.parse('/');
      const t = await createRoot(p, [], {a: 1});
      expect(t.queryParams).toEqual({a: '1'});
      expect(t.queryParamMap.get('a')).toEqual('1');
    });
  });

  it('should navigate to the root', async () => {
    const p = serializer.parse('/');
    const t = await createRoot(p, ['/']);
    expect(serializer.serialize(t)).toEqual('/');
  });

  it('should error when navigating to the root segment with params', async () => {
    const p = serializer.parse('/');
    await expectAsync(createRoot(p, ['/', {p: 11}])).toBeRejectedWithError(
      /Root segment cannot have matrix parameters/,
    );
  });

  it('should support nested segments', async () => {
    const p = serializer.parse('/a/b');
    const t = await createRoot(p, ['/one', 11, 'two', 22]);
    expect(serializer.serialize(t)).toEqual('/one/11/two/22');
  });

  it('should stringify positional parameters', async () => {
    const p = serializer.parse('/a/b');
    const t = await createRoot(p, ['/one', 11]);
    const params = t.root.children[PRIMARY_OUTLET].segments;
    expect(params[0].path).toEqual('one');
    expect(params[1].path).toEqual('11');
  });

  it('should support first segments containing slashes', async () => {
    const p = serializer.parse('/');
    const t = await createRoot(p, [{segmentPath: '/one'}, 'two/three']);
    expect(serializer.serialize(t)).toEqual('/%2Fone/two%2Fthree');
  });

  describe('named outlets', () => {
    it('should preserve secondary segments', async () => {
      const p = serializer.parse('/a/11/b(right:c)');
      const t = await createRoot(p, ['/a', 11, 'd']);
      expect(serializer.serialize(t)).toEqual('/a/11/d(right:c)');
    });

    it('should support updating secondary segments (absolute)', async () => {
      const p = serializer.parse('/a(right:b)');
      const t = await createRoot(p, ['/', {outlets: {right: ['c']}}]);
      expect(serializer.serialize(t)).toEqual('/a(right:c)');
    });

    it('should support updating secondary segments', async () => {
      const p = serializer.parse('/a(right:b)');
      const t = await createRoot(p, [{outlets: {right: ['c', 11, 'd']}}]);
      expect(serializer.serialize(t)).toEqual('/a(right:c/11/d)');
    });

    it('should support updating secondary segments (nested case)', async () => {
      const p = serializer.parse('/a/(b//right:c)');
      const t = await createRoot(p, ['a', {outlets: {right: ['d', 11, 'e']}}]);
      expect(serializer.serialize(t)).toEqual('/a/(b//right:d/11/e)');
    });
    it('should support removing secondary outlet with prefix', async () => {
      const p = serializer.parse('/parent/(child//secondary:popup)');
      const t = await createRoot(p, ['parent', {outlets: {secondary: null}}]);
      // - Segment index 0:
      //   * match and keep existing 'parent'
      // - Segment index 1:
      //   * 'secondary' outlet cleared with `null`
      //   * 'primary' outlet not provided in the commands list, so the existing value is kept
      expect(serializer.serialize(t)).toEqual('/parent/child');
    });

    it('should support updating secondary and primary outlets with prefix', async () => {
      const p = serializer.parse('/parent/child');
      const t = await createRoot(p, ['parent', {outlets: {primary: 'child', secondary: 'popup'}}]);
      expect(serializer.serialize(t)).toEqual('/parent/(child//secondary:popup)');
    });

    it('should support updating two outlets at the same time relative to non-root segment', async () => {
      await router.navigateByUrl('/parent/child');
      const t = create(router.routerState.root.children[0], [
        {outlets: {primary: 'child', secondary: 'popup'}},
      ]);
      expect(serializer.serialize(t)).toEqual('/parent/(child//secondary:popup)');
    });

    it('should support adding multiple outlets with prefix', async () => {
      const p = serializer.parse('');
      const t = await createRoot(p, ['parent', {outlets: {primary: 'child', secondary: 'popup'}}]);
      expect(serializer.serialize(t)).toEqual('/parent/(child//secondary:popup)');
    });

    it('should support updating clearing primary and secondary with prefix', async () => {
      const p = serializer.parse('/parent/(child//secondary:popup)');
      const t = await createRoot(p, ['other']);
      // Because we navigate away from the 'parent' route, the children of that route are cleared
      // because they are note valid for the 'other' path.
      expect(serializer.serialize(t)).toEqual('/other');
    });

    it('should not clear secondary outlet when at root and prefix is used', async () => {
      const p = serializer.parse('/other(rootSecondary:rootPopup)');
      const t = await createRoot(p, ['parent', {outlets: {primary: 'child', rootSecondary: null}}]);
      // We prefixed the navigation with 'parent' so we cannot clear the "rootSecondary" outlet
      // because once the outlets object is consumed, traversal is beyond the root segment.
      expect(serializer.serialize(t)).toEqual('/parent/child(rootSecondary:rootPopup)');
    });

    it('should not clear non-root secondary outlet when command is targeting root', async () => {
      const p = serializer.parse('/parent/(child//secondary:popup)');
      const t = await createRoot(p, [{outlets: {secondary: null}}]);
      // The start segment index for the command is at 0, but the outlet lives at index 1
      // so we cannot clear the outlet from processing segment index 0.
      expect(serializer.serialize(t)).toEqual('/parent/(child//secondary:popup)');
    });

    it('can clear an auxiliary outlet at the correct segment level', async () => {
      const p = serializer.parse('/parent/(child//secondary:popup)(rootSecondary:rootPopup)');
      //                                       ^^^^^^^^^^^^^^^^^^^^^^
      // The parens here show that 'child' and 'secondary:popup' appear at the same 'level' in the
      // config, i.e. are part of the same children list. You can also imagine an implicit paren
      // group around the whole URL to visualize how 'parent' and 'rootSecondary:rootPopup' are also
      // defined at the same level.
      const t = await createRoot(p, ['parent', {outlets: {primary: 'child', secondary: null}}]);
      expect(serializer.serialize(t)).toEqual('/parent/child(rootSecondary:rootPopup)');
    });

    it('works with named children of empty path primary, relative to non-empty parent', async () => {
      router.resetConfig([
        {
          path: 'case',
          component: class {},
          children: [
            {
              path: '',
              component: class {},
              children: [{path: 'foo', outlet: 'foo', children: []}],
            },
          ],
        },
      ]);
      await router.navigateByUrl('/case');
      expect(router.url).toEqual('/case');
      expect(
        router
          .createUrlTree(
            [{outlets: {'foo': ['foo']}}],
            // relative to the 'case' route
            {relativeTo: router.routerState.root.firstChild},
          )
          .toString(),
      ).toEqual('/case/(foo:foo)');
    });

    it('can change both primary and named outlets under an empty path', async () => {
      router.resetConfig([
        {
          path: 'foo',
          children: [
            {
              path: '',
              component: class {},
              children: [
                {path: 'bar', component: class {}},
                {path: 'baz', component: class {}, outlet: 'other'},
              ],
            },
          ],
        },
      ]);

      await router.navigateByUrl('/foo/(bar//other:baz)');
      expect(router.url).toEqual('/foo/(bar//other:baz)');
      expect(
        router
          .createUrlTree(
            [
              {
                outlets: {
                  other: null,
                  primary: ['bar'],
                },
              },
            ],
            // relative to the root '' route
            {relativeTo: router.routerState.root.firstChild},
          )
          .toString(),
      ).toEqual('/foo/bar');
    });

    describe('absolute navigations', () => {
      it('with and pathless root', async () => {
        router.resetConfig([
          {
            path: '',
            children: [{path: '**', outlet: 'left', component: class {}}],
          },
        ]);
        await router.navigateByUrl('(left:search)');
        expect(router.url).toEqual('/(left:search)');
        expect(
          router.createUrlTree(['/', {outlets: {'left': ['projects', '123']}}]).toString(),
        ).toEqual('/(left:projects/123)');
      });
      it('empty path parent and sibling with a path', async () => {
        router.resetConfig([
          {
            path: '',
            children: [
              {path: 'x', component: class {}},
              {path: '**', outlet: 'left', component: class {}},
            ],
          },
        ]);
        await router.navigateByUrl('/x(left:search)');
        expect(router.url).toEqual('/x(left:search)');
        expect(
          router.createUrlTree(['/', {outlets: {'left': ['projects', '123']}}]).toString(),
        ).toEqual('/x(left:projects/123)');
        expect(
          router
            .createUrlTree([
              '/',
              {
                outlets: {
                  'primary': [
                    {
                      outlets: {
                        'left': ['projects', '123'],
                      },
                    },
                  ],
                },
              },
            ])
            .toString(),
        ).toEqual('/x(left:projects/123)');
      });

      it('empty path parent and sibling', async () => {
        router.resetConfig([
          {
            path: '',
            children: [
              {path: '', component: class {}},
              {path: '**', outlet: 'left', component: class {}},
              {path: '**', outlet: 'right', component: class {}},
            ],
          },
        ]);
        await router.navigateByUrl('/(left:search//right:define)');
        expect(router.url).toEqual('/(left:search//right:define)');
        expect(
          router.createUrlTree(['/', {outlets: {'left': ['projects', '123']}}]).toString(),
        ).toEqual('/(left:projects/123//right:define)');
      });
      it('two pathless parents', async () => {
        router.resetConfig([
          {
            path: '',
            children: [
              {
                path: '',
                children: [{path: '**', outlet: 'left', component: class {}}],
              },
            ],
          },
        ]);
        await router.navigateByUrl('(left:search)');
        expect(router.url).toEqual('/(left:search)');
        expect(
          router.createUrlTree(['/', {outlets: {'left': ['projects', '123']}}]).toString(),
        ).toEqual('/(left:projects/123)');
      });

      it('maintains structure when primary outlet is not pathless', async () => {
        router.resetConfig([
          {
            path: 'a',
            children: [{path: '**', outlet: 'left', component: class {}}],
          },
          {path: '**', outlet: 'left', component: class {}},
        ]);
        await router.navigateByUrl('/a/(left:search)');
        expect(router.url).toEqual('/a/(left:search)');
        expect(
          router.createUrlTree(['/', {outlets: {'left': ['projects', '123']}}]).toString(),
        ).toEqual('/a/(left:search)(left:projects/123)');
      });
    });
  });

  it('can navigate to nested route where commands is string', async () => {
    const p = serializer.parse('/');
    const t = await createRoot(p, [
      '/',
      {outlets: {primary: ['child', {outlets: {primary: 'nested-primary'}}]}},
    ]);
    expect(serializer.serialize(t)).toEqual('/child/nested-primary');
  });

  it('should throw when outlets is not the last command', async () => {
    const p = serializer.parse('/a');
    await expectAsync(createRoot(p, ['a', {outlets: {right: ['c']}}, 'c'])).toBeRejected();
  });

  it('should support updating using a string', async () => {
    const p = serializer.parse('/a(right:b)');
    const t = await createRoot(p, [{outlets: {right: 'c/11/d'}}]);
    expect(serializer.serialize(t)).toEqual('/a(right:c/11/d)');
  });

  it('should support updating primary and secondary segments at once', async () => {
    const p = serializer.parse('/a(right:b)');
    const t = await createRoot(p, [{outlets: {primary: 'y/z', right: 'c/11/d'}}]);
    expect(serializer.serialize(t)).toEqual('/y/z(right:c/11/d)');
  });

  it('should support removing primary segment', async () => {
    const p = serializer.parse('/a/(b//right:c)');
    const t = await createRoot(p, ['a', {outlets: {primary: null, right: 'd'}}]);
    expect(serializer.serialize(t)).toEqual('/a/(right:d)');
  });

  it('should support removing secondary segments', async () => {
    const p = serializer.parse('/a(right:b)');
    const t = await createRoot(p, [{outlets: {right: null}}]);
    expect(serializer.serialize(t)).toEqual('/a');
  });

  it('should support removing parenthesis for primary segment on second path element', async () => {
    const p = serializer.parse('/a/(b//right:c)');
    const t = await createRoot(p, ['a', {outlets: {right: null}}]);
    expect(serializer.serialize(t)).toEqual('/a/b');
  });

  it('should update matrix parameters', async () => {
    const p = serializer.parse('/a;pp=11');
    const t = await createRoot(p, ['/a', {pp: 22, dd: 33}]);
    expect(serializer.serialize(t)).toEqual('/a;pp=22;dd=33');
  });

  it('should create matrix parameters', async () => {
    const p = serializer.parse('/a');
    const t = await createRoot(p, ['/a', {pp: 22, dd: 33}]);
    expect(serializer.serialize(t)).toEqual('/a;pp=22;dd=33');
  });

  it('should create matrix parameters together with other segments', async () => {
    const p = serializer.parse('/a');
    const t = await createRoot(p, ['/a', 'b', {aa: 22, bb: 33}]);
    expect(serializer.serialize(t)).toEqual('/a/b;aa=22;bb=33');
  });

  it('should stringify matrix parameters', async () => {
    await router.navigateByUrl('/a');
    const relative = create(router.routerState.root.children[0], [{pp: 22}]);
    const segmentR = relative.root.children[PRIMARY_OUTLET].segments[0];
    expect(segmentR.parameterMap.get('pp')).toEqual('22');

    const pa = serializer.parse('/a');
    const absolute = await createRoot(pa, ['/b', {pp: 33}]);
    const segmentA = absolute.root.children[PRIMARY_OUTLET].segments[0];
    expect(segmentA.parameterMap.get('pp')).toEqual('33');
  });

  describe('relative navigation', () => {
    it('should work', async () => {
      await router.navigateByUrl('/a/(c//left:cp)(left:ap)');
      const t = create(router.routerState.root.children[0], ['c2']);
      expect(serializer.serialize(t)).toEqual('/a/(c2//left:cp)(left:ap)');
    });

    it('should work when the first command starts with a ./', async () => {
      await router.navigateByUrl('/a/(c//left:cp)(left:ap)');
      const t = create(router.routerState.root.children[0], ['./c2']);
      expect(serializer.serialize(t)).toEqual('/a/(c2//left:cp)(left:ap)');
    });

    it('should work when the first command is ./)', async () => {
      await router.navigateByUrl('/a/(c//left:cp)(left:ap)');
      const t = create(router.routerState.root.children[0], ['./', 'c2']);
      expect(serializer.serialize(t)).toEqual('/a/(c2//left:cp)(left:ap)');
    });

    it('should support parameters-only navigation', async () => {
      await router.navigateByUrl('/a');
      const t = create(router.routerState.root.children[0], [{k: 99}]);
      expect(serializer.serialize(t)).toEqual('/a;k=99');
    });

    it('should support parameters-only navigation (nested case)', async () => {
      await router.navigateByUrl('/a/(c//left:cp)(left:ap)');
      const t = create(router.routerState.root.children[0], [{'x': 99}]);
      expect(serializer.serialize(t)).toEqual('/a;x=99(left:ap)');
    });

    it('should support parameters-only navigation (with a double dot)', async () => {
      await router.navigateByUrl('/a/(c//left:cp)(left:ap)');
      const t = create(router.routerState.root.children[0].children[0], ['../', {x: 5}]);
      expect(serializer.serialize(t)).toEqual('/a;x=5(left:ap)');
    });

    it('should work when index > 0', async () => {
      await router.navigateByUrl('/a/c');
      const t = create(router.routerState.root.children[0].children[0], ['c2']);
      expect(serializer.serialize(t)).toEqual('/a/c/c2');
    });

    it('should support going to a parent (within a segment)', async () => {
      await router.navigateByUrl('/a/c');
      const t = create(router.routerState.root.children[0].children[0], ['../c2']);
      expect(serializer.serialize(t)).toEqual('/a/c2');
    });

    it('should support going to a parent (across segments)', async () => {
      await router.navigateByUrl('/q/(a/(c//left:cp)//left:qp)(left:ap)');
      // The resulting URL isn't necessarily correct. Though we could never truly navigate to the
      // URL above, this should probably go to '/q/a/c(left:ap)' at the very least and potentially
      // be able to go somewhere like /q/a/c/(left:xyz)(left:ap). That is, allow matching named
      // outlets as long as they do not have a primary outlet sibling. Having a primary outlet
      // sibling isn't possible because the wildcard should consume all the primary outlet segments
      // so there cannot be any remaining in the children.
      // https://github.com/angular/angular/issues/40089
      expect(router.url).toEqual('/q(left:ap)');

      const t = create(router.routerState.root.children[0].children[0], ['../../q2']);
      expect(serializer.serialize(t)).toEqual('/q2(left:ap)');
    });

    it('should navigate to the root', async () => {
      await router.navigateByUrl('/a/c');
      const t = create(router.routerState.root.children[0], ['../']);
      expect(serializer.serialize(t)).toEqual('/');
    });

    it('should work with ../ when absolute url', async () => {
      await router.navigateByUrl('/a/c');
      const t = create(router.routerState.root.children[0].children[0], ['../', 'c2']);
      expect(serializer.serialize(t)).toEqual('/a/c2');
    });

    it('should work relative to root', async () => {
      await router.navigateByUrl('/');
      const t = create(router.routerState.root, ['11']);
      expect(serializer.serialize(t)).toEqual('/11');
    });

    it('should throw when too many ..', async () => {
      await router.navigateByUrl('/a/(c//left:cp)(left:ap)');
      expect(() => create(router.routerState.root.children[0], ['../../'])).toThrowError();
    });

    it('should support updating secondary segments', async () => {
      await router.navigateByUrl('/a/b');
      const t = create(router.routerState.root.children[0].children[0], [
        {outlets: {right: ['c']}},
      ]);
      expect(serializer.serialize(t)).toEqual('/a/b/(right:c)');
    });
  });

  it('should set fragment', async () => {
    const p = serializer.parse('/');
    const t = await createRoot(p, [], {}, 'fragment');
    expect(t.fragment).toEqual('fragment');
  });

  it('should support pathless route', async () => {
    const p = serializer.parse('/a');
    const t = create(router.routerState.root.children[0], ['b']);
    expect(serializer.serialize(t)).toEqual('/b');
  });

  it('should support pathless route with ../ at root', async () => {
    const p = serializer.parse('/a');
    const t = create(router.routerState.root.children[0], ['../b']);
    expect(serializer.serialize(t)).toEqual('/b');
  });

  it('should support pathless child of pathless root', async () => {
    router.resetConfig([
      {
        path: '',
        children: [
          {path: '', component: class {}},
          {path: 'lazy', component: class {}},
        ],
      },
    ]);
    await router.navigateByUrl('/');
    const t = create(router.routerState.root.children[0].children[0], ['lazy']);
    expect(serializer.serialize(t)).toEqual('/lazy');
  });
});

describe('defaultQueryParamsHandling', () => {
  async function setupRouter(defaultQueryParamsHandling: QueryParamsHandling): Promise<Router> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [{path: '**', component: class {}}],
          withRouterConfig({
            defaultQueryParamsHandling,
          }),
        ),
      ],
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/initial?a=1');
    return router;
  }

  it('can use "merge" as the default', async () => {
    const router = await setupRouter('merge');
    await router.navigate(['new'], {queryParams: {'b': 2}});
    expect(router.url).toEqual('/new?a=1&b=2');
  });

  it('can use "perserve" as the default', async () => {
    const router = await setupRouter('preserve');
    await router.navigate(['new'], {queryParams: {'b': 2}});
    expect(router.url).toEqual('/new?a=1');
  });

  it('can override the default by providing a new option', async () => {
    const router = await setupRouter('preserve');
    await router.navigate(['new'], {queryParams: {'b': 2}, queryParamsHandling: 'merge'});
    expect(router.url).toEqual('/new?a=1&b=2');
    await router.navigate(['replace'], {queryParamsHandling: 'replace'});
    expect(router.url).toEqual('/replace');
  });
});

async function createRoot(
  tree: UrlTree,
  commands: readonly any[],
  queryParams?: Params,
  fragment?: string,
): Promise<UrlTree> {
  const router = TestBed.inject(Router);
  await router.navigateByUrl(tree);
  return router.createUrlTree(commands, {
    relativeTo: router.routerState.root,
    queryParams,
    fragment,
  });
}

function create(
  relativeTo: ActivatedRoute,
  commands: readonly any[],
  queryParams?: Params,
  fragment?: string,
) {
  return TestBed.inject(Router).createUrlTree(commands, {relativeTo, queryParams, fragment});
}

describe('createUrlTreeFromSnapshot', () => {
  it('can create a UrlTree relative to empty path named parent', async () => {
    @Component({
      template: `<router-outlet></router-outlet>`,
      imports: [RouterModule],
    })
    class MainPageComponent {
      constructor(
        private route: ActivatedRoute,
        private router: Router,
      ) {}

      navigate() {
        this.router.navigateByUrl(
          createUrlTreeFromSnapshot(this.route.snapshot, ['innerRoute'], null, null),
        );
      }
    }

    @Component({
      template: 'child works!',
      standalone: false,
    })
    class ChildComponent {}

    @Component({
      template: '<router-outlet name="main-page"></router-outlet>',
      imports: [RouterModule],
    })
    class RootCmp {}

    const routes: Routes = [
      {
        path: '',
        component: MainPageComponent,
        outlet: 'main-page',
        children: [{path: 'innerRoute', component: ChildComponent}],
      },
    ];

    TestBed.configureTestingModule({imports: [RouterModule.forRoot(routes)]});
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(RootCmp);

    router.initialNavigation();
    await advance(fixture);
    fixture.debugElement.query(By.directive(MainPageComponent)).componentInstance.navigate();
    await advance(fixture);
    expect(fixture.nativeElement.innerHTML).toContain('child works!');
  });

  it('can navigate to relative to `ActivatedRouteSnapshot` in guard', async () => {
    @Injectable({providedIn: 'root'})
    class Guard {
      constructor(private readonly router: Router) {}
      canActivate(snapshot: ActivatedRouteSnapshot) {
        this.router.navigateByUrl(createUrlTreeFromSnapshot(snapshot, ['../sibling'], null, null));
      }
    }

    @Component({
      template: `main`,
      imports: [RouterModule],
    })
    class GuardedComponent {}

    @Component({template: 'sibling'})
    class SiblingComponent {}

    @Component({
      template: '<router-outlet></router-outlet>',
      imports: [RouterModule],
    })
    class RootCmp {}

    const routes: Routes = [
      {
        path: 'parent',
        component: RootCmp,
        children: [
          {
            path: 'guarded',
            component: GuardedComponent,
            canActivate: [Guard],
          },
          {
            path: 'sibling',
            component: SiblingComponent,
          },
        ],
      },
    ];

    TestBed.configureTestingModule({imports: [RouterModule.forRoot(routes)]});
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(RootCmp);

    router.navigateByUrl('parent/guarded');
    await advance(fixture);
    expect(router.url).toEqual('/parent/sibling');
  });
});

async function advance(fixture: ComponentFixture<unknown>) {
  await timeout();
  fixture.detectChanges();
}
