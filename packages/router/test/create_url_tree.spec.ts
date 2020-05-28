/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BehaviorSubject} from 'rxjs';

import {createUrlTree} from '../src/create_url_tree';
import {ActivatedRoute, ActivatedRouteSnapshot, advanceActivatedRoute} from '../src/router_state';
import {Params, PRIMARY_OUTLET} from '../src/shared';
import {DefaultUrlSerializer, UrlSegment, UrlSegmentGroup, UrlTree} from '../src/url_tree';

describe('createUrlTree', () => {
  const serializer = new DefaultUrlSerializer();

  describe('query parameters', () => {
    it('should support parameter with multiple values', () => {
      const p1 = serializer.parse('/');
      const t1 = createRoot(p1, ['/'], {m: ['v1', 'v2']});
      expect(serializer.serialize(t1)).toEqual('/?m=v1&m=v2');

      const p2 = serializer.parse('/a/c');
      const t2 = create(p2.root.children[PRIMARY_OUTLET], 1, p2, ['c2'], {m: ['v1', 'v2']});
      expect(serializer.serialize(t2)).toEqual('/a/c/c2?m=v1&m=v2');
    });

    it('should set query params', () => {
      const p = serializer.parse('/');
      const t = createRoot(p, [], {a: 'hey'});
      expect(t.queryParams).toEqual({a: 'hey'});
      expect(t.queryParamMap.get('a')).toEqual('hey');
    });

    it('should stringify query params', () => {
      const p = serializer.parse('/');
      const t = createRoot(p, [], <any>{a: 1});
      expect(t.queryParams).toEqual({a: '1'});
      expect(t.queryParamMap.get('a')).toEqual('1');
    });
  });

  it('should navigate to the root', () => {
    const p = serializer.parse('/');
    const t = createRoot(p, ['/']);
    expect(serializer.serialize(t)).toEqual('/');
  });

  it('should error when navigating to the root segment with params', () => {
    const p = serializer.parse('/');
    expect(() => createRoot(p, ['/', {p: 11}]))
        .toThrowError(/Root segment cannot have matrix parameters/);
  });

  it('should support nested segments', () => {
    const p = serializer.parse('/a/b');
    const t = createRoot(p, ['/one', 11, 'two', 22]);
    expect(serializer.serialize(t)).toEqual('/one/11/two/22');
  });

  it('should stringify positional parameters', () => {
    const p = serializer.parse('/a/b');
    const t = createRoot(p, ['/one', 11]);
    const params = t.root.children[PRIMARY_OUTLET].segments;
    expect(params[0].path).toEqual('one');
    expect(params[1].path).toEqual('11');
  });

  it('should work if command = null', () => {
    const p = serializer.parse('/a/b');
    const t = createRoot(p, [null]);
    const params = t.root.children[PRIMARY_OUTLET].segments;
    expect(params[0].path).toEqual('null');
  });

  it('should work if command is undefined', () => {
    const p = serializer.parse('/a/b');
    const t = createRoot(p, [undefined]);
    const params = t.root.children[PRIMARY_OUTLET].segments;
    expect(params[0].path).toEqual('undefined');
  });

  it('should support first segments containing slashes', () => {
    const p = serializer.parse('/');
    const t = createRoot(p, [{segmentPath: '/one'}, 'two/three']);
    expect(serializer.serialize(t)).toEqual('/%2Fone/two%2Fthree');
  });

  it('should preserve secondary segments', () => {
    const p = serializer.parse('/a/11/b(right:c)');
    const t = createRoot(p, ['/a', 11, 'd']);
    expect(serializer.serialize(t)).toEqual('/a/11/d(right:c)');
  });

  it('should support updating secondary segments (absolute)', () => {
    const p = serializer.parse('/a(right:b)');
    const t = createRoot(p, ['/', {outlets: {right: ['c']}}]);
    expect(serializer.serialize(t)).toEqual('/a(right:c)');
  });

  it('should support updating secondary segments', () => {
    const p = serializer.parse('/a(right:b)');
    const t = createRoot(p, [{outlets: {right: ['c', 11, 'd']}}]);
    expect(serializer.serialize(t)).toEqual('/a(right:c/11/d)');
  });

  it('should support updating secondary segments (nested case)', () => {
    const p = serializer.parse('/a/(b//right:c)');
    const t = createRoot(p, ['a', {outlets: {right: ['d', 11, 'e']}}]);
    expect(serializer.serialize(t)).toEqual('/a/(b//right:d/11/e)');
  });

  describe('', () => {
    /**
     * In this group of scenarios, imagine a config like:
     * {
     *   path: 'parent',
     *   children: [
     *     {
     *       path: 'child',
     *       component: AnyCmp
     *     },
     *     {
     *       path: 'popup',
     *       outlet: 'secondary',
     *       component: AnyCmp
     *     }
     *   ]
     * },
     * {
     *   path: 'other',
     *   component: AnyCmp
     * },
     * {
     *   path: 'rootPopup',
     *   outlet: 'rootSecondary',
     * }
     */

    it('should support removing secondary outlet with prefix', () => {
      const p = serializer.parse('/parent/(child//secondary:popup)');
      const t = createRoot(p, ['parent', {outlets: {secondary: null}}]);
      // - Segment index 0:
      //   * match and keep existing 'parent'
      // - Segment index 1:
      //   * 'secondary' outlet cleared with `null`
      //   * 'primary' outlet not provided in the commands list, so the existing value is kept
      expect(serializer.serialize(t)).toEqual('/parent/child');
    });

    it('should support updating secondary and primary outlets with prefix', () => {
      const p = serializer.parse('/parent/child');
      const t = createRoot(p, ['parent', {outlets: {primary: 'child', secondary: 'popup'}}]);
      expect(serializer.serialize(t)).toEqual('/parent/(child//secondary:popup)');
    });

    it('should support updating two outlets at the same time relative to non-root segment', () => {
      const p = serializer.parse('/parent/child');
      const t = create(
          p.root.children[PRIMARY_OUTLET], 0 /* relativeTo: 'parent' */, p,
          [{outlets: {primary: 'child', secondary: 'popup'}}]);
      expect(serializer.serialize(t)).toEqual('/parent/(child//secondary:popup)');
    });

    it('should support adding multiple outlets with prefix', () => {
      const p = serializer.parse('');
      const t = createRoot(p, ['parent', {outlets: {primary: 'child', secondary: 'popup'}}]);
      expect(serializer.serialize(t)).toEqual('/parent/(child//secondary:popup)');
    });

    it('should support updating clearing primary and secondary with prefix', () => {
      const p = serializer.parse('/parent/(child//secondary:popup)');
      const t = createRoot(p, ['other']);
      // Because we navigate away from the 'parent' route, the children of that route are cleared
      // because they are note valid for the 'other' path.
      expect(serializer.serialize(t)).toEqual('/other');
    });

    it('should not clear secondary outlet when at root and prefix is used', () => {
      const p = serializer.parse('/other(rootSecondary:rootPopup)');
      const t = createRoot(p, ['parent', {outlets: {primary: 'child', rootSecondary: null}}]);
      // We prefixed the navigation with 'parent' so we cannot clear the "rootSecondary" outlet
      // because once the outlets object is consumed, traversal is beyond the root segment.
      expect(serializer.serialize(t)).toEqual('/parent/child(rootSecondary:rootPopup)');
    });

    it('should not clear non-root secondary outlet when command is targeting root', () => {
      const p = serializer.parse('/parent/(child//secondary:popup)');
      const t = createRoot(p, [{outlets: {secondary: null}}]);
      // The start segment index for the command is at 0, but the outlet lives at index 1
      // so we cannot clear the outlet from processing segment index 0.
      expect(serializer.serialize(t)).toEqual('/parent/(child//secondary:popup)');
    });

    it('can clear an auxiliary outlet at the correct segment level', () => {
      const p = serializer.parse('/parent/(child//secondary:popup)(rootSecondary:rootPopup)');
      //                                       ^^^^^^^^^^^^^^^^^^^^^^
      // The parens here show that 'child' and 'secondary:popup' appear at the same 'level' in the
      // config, i.e. are part of the same children list. You can also imagine an implicit paren
      // group around the whole URL to visualize how 'parent' and 'rootSecondary:rootPopup' are also
      // defined at the same level.
      const t = createRoot(p, ['parent', {outlets: {primary: 'child', secondary: null}}]);
      expect(serializer.serialize(t)).toEqual('/parent/child(rootSecondary:rootPopup)');
    });
  });

  it('can navigate to nested route where commands is string', () => {
    const p = serializer.parse('/');
    const t = createRoot(
        p, ['/', {outlets: {primary: ['child', {outlets: {primary: 'nested-primary'}}]}}]);
    expect(serializer.serialize(t)).toEqual('/child/nested-primary');
  });

  it('should throw when outlets is not the last command', () => {
    const p = serializer.parse('/a');
    expect(() => createRoot(p, ['a', {outlets: {right: ['c']}}, 'c']))
        .toThrowError('{outlets:{}} has to be the last command');
  });

  it('should support updating using a string', () => {
    const p = serializer.parse('/a(right:b)');
    const t = createRoot(p, [{outlets: {right: 'c/11/d'}}]);
    expect(serializer.serialize(t)).toEqual('/a(right:c/11/d)');
  });

  it('should support updating primary and secondary segments at once', () => {
    const p = serializer.parse('/a(right:b)');
    const t = createRoot(p, [{outlets: {primary: 'y/z', right: 'c/11/d'}}]);
    expect(serializer.serialize(t)).toEqual('/y/z(right:c/11/d)');
  });

  it('should support removing primary segment', () => {
    const p = serializer.parse('/a/(b//right:c)');
    const t = createRoot(p, ['a', {outlets: {primary: null, right: 'd'}}]);
    expect(serializer.serialize(t)).toEqual('/a/(right:d)');
  });

  it('should support removing secondary segments', () => {
    const p = serializer.parse('/a(right:b)');
    const t = createRoot(p, [{outlets: {right: null}}]);
    expect(serializer.serialize(t)).toEqual('/a');
  });

  it('should support removing parenthesis for primary segment on second path element', () => {
    const p = serializer.parse('/a/(b//right:c)');
    const t = createRoot(p, ['a', {outlets: {right: null}}]);
    expect(serializer.serialize(t)).toEqual('/a/b');
  });

  it('should update matrix parameters', () => {
    const p = serializer.parse('/a;pp=11');
    const t = createRoot(p, ['/a', {pp: 22, dd: 33}]);
    expect(serializer.serialize(t)).toEqual('/a;pp=22;dd=33');
  });

  it('should create matrix parameters', () => {
    const p = serializer.parse('/a');
    const t = createRoot(p, ['/a', {pp: 22, dd: 33}]);
    expect(serializer.serialize(t)).toEqual('/a;pp=22;dd=33');
  });

  it('should create matrix parameters together with other segments', () => {
    const p = serializer.parse('/a');
    const t = createRoot(p, ['/a', 'b', {aa: 22, bb: 33}]);
    expect(serializer.serialize(t)).toEqual('/a/b;aa=22;bb=33');
  });

  it('should stringify matrix parameters', () => {
    const pr = serializer.parse('/r');
    const relative = create(pr.root.children[PRIMARY_OUTLET], 0, pr, [{pp: 22}]);
    const segmentR = relative.root.children[PRIMARY_OUTLET].segments[0];
    expect(segmentR.parameterMap.get('pp')).toEqual('22');

    const pa = serializer.parse('/a');
    const absolute = createRoot(pa, ['/b', {pp: 33}]);
    const segmentA = absolute.root.children[PRIMARY_OUTLET].segments[0];
    expect(segmentA.parameterMap.get('pp')).toEqual('33');
  });

  describe('relative navigation', () => {
    it('should work', () => {
      const p = serializer.parse('/a/(c//left:cp)(left:ap)');
      const t = create(p.root.children[PRIMARY_OUTLET], 0, p, ['c2']);
      expect(serializer.serialize(t)).toEqual('/a/(c2//left:cp)(left:ap)');
    });

    it('should work when the first command starts with a ./', () => {
      const p = serializer.parse('/a/(c//left:cp)(left:ap)');
      const t = create(p.root.children[PRIMARY_OUTLET], 0, p, ['./c2']);
      expect(serializer.serialize(t)).toEqual('/a/(c2//left:cp)(left:ap)');
    });

    it('should work when the first command is ./)', () => {
      const p = serializer.parse('/a/(c//left:cp)(left:ap)');
      const t = create(p.root.children[PRIMARY_OUTLET], 0, p, ['./', 'c2']);
      expect(serializer.serialize(t)).toEqual('/a/(c2//left:cp)(left:ap)');
    });

    it('should support parameters-only navigation', () => {
      const p = serializer.parse('/a');
      const t = create(p.root.children[PRIMARY_OUTLET], 0, p, [{k: 99}]);
      expect(serializer.serialize(t)).toEqual('/a;k=99');
    });

    it('should support parameters-only navigation (nested case)', () => {
      const p = serializer.parse('/a/(c//left:cp)(left:ap)');
      const t = create(p.root.children[PRIMARY_OUTLET], 0, p, [{'x': 99}]);
      expect(serializer.serialize(t)).toEqual('/a;x=99(left:ap)');
    });

    it('should support parameters-only navigation (with a double dot)', () => {
      const p = serializer.parse('/a/(c//left:cp)(left:ap)');
      const t =
          create(p.root.children[PRIMARY_OUTLET].children[PRIMARY_OUTLET], 0, p, ['../', {x: 5}]);
      expect(serializer.serialize(t)).toEqual('/a;x=5(left:ap)');
    });

    it('should work when index > 0', () => {
      const p = serializer.parse('/a/c');
      const t = create(p.root.children[PRIMARY_OUTLET], 1, p, ['c2']);
      expect(serializer.serialize(t)).toEqual('/a/c/c2');
    });

    it('should support going to a parent (within a segment)', () => {
      const p = serializer.parse('/a/c');
      const t = create(p.root.children[PRIMARY_OUTLET], 1, p, ['../c2']);
      expect(serializer.serialize(t)).toEqual('/a/c2');
    });

    it('should support going to a parent (across segments)', () => {
      const p = serializer.parse('/q/(a/(c//left:cp)//left:qp)(left:ap)');

      const t =
          create(p.root.children[PRIMARY_OUTLET].children[PRIMARY_OUTLET], 0, p, ['../../q2']);
      expect(serializer.serialize(t)).toEqual('/q2(left:ap)');
    });

    it('should navigate to the root', () => {
      const p = serializer.parse('/a/c');
      const t = create(p.root.children[PRIMARY_OUTLET], 0, p, ['../']);
      expect(serializer.serialize(t)).toEqual('/');
    });

    it('should work with ../ when absolute url', () => {
      const p = serializer.parse('/a/c');
      const t = create(p.root.children[PRIMARY_OUTLET], 1, p, ['../', 'c2']);
      expect(serializer.serialize(t)).toEqual('/a/c2');
    });

    it('should work with position = -1', () => {
      const p = serializer.parse('/');
      const t = create(p.root, -1, p, ['11']);
      expect(serializer.serialize(t)).toEqual('/11');
    });

    it('should throw when too many ..', () => {
      const p = serializer.parse('/a/(c//left:cp)(left:ap)');
      expect(() => create(p.root.children[PRIMARY_OUTLET], 0, p, ['../../']))
          .toThrowError('Invalid number of \'../\'');
    });

    it('should support updating secondary segments', () => {
      const p = serializer.parse('/a/b');
      const t = create(p.root.children[PRIMARY_OUTLET], 1, p, [{outlets: {right: ['c']}}]);
      expect(serializer.serialize(t)).toEqual('/a/b/(right:c)');
    });
  });

  it('should set fragment', () => {
    const p = serializer.parse('/');
    const t = createRoot(p, [], {}, 'fragment');
    expect(t.fragment).toEqual('fragment');
  });

  it('should support pathless route', () => {
    const p = serializer.parse('/a');
    const t = create(p.root.children[PRIMARY_OUTLET], -1, p, ['b']);
    expect(serializer.serialize(t)).toEqual('/b');
  });

  it('should support pathless route with ../ at root', () => {
    const p = serializer.parse('/a');
    const t = create(p.root.children[PRIMARY_OUTLET], -1, p, ['../b']);
    expect(serializer.serialize(t)).toEqual('/b');
  });

  it('should support pathless child of pathless root', () => {
    // i.e. routes = {path: '', loadChildren: () => import('child')...}
    // forChild: {path: '', component: Comp}
    const p = serializer.parse('');
    const empty = new UrlSegmentGroup([], {});
    p.root.children[PRIMARY_OUTLET] = empty;
    empty.parent = p.root;
    const t = create(empty, -1, p, ['lazy']);
    expect(serializer.serialize(t)).toEqual('/lazy');
  });
});

function createRoot(tree: UrlTree, commands: any[], queryParams?: Params, fragment?: string) {
  const s = new (ActivatedRouteSnapshot as any)(
      [], <any>{}, <any>{}, '', <any>{}, PRIMARY_OUTLET, 'someComponent', null, tree.root, -1,
      <any>null);
  const a = new (ActivatedRoute as any)(
      new BehaviorSubject(null!), new BehaviorSubject(null!), new BehaviorSubject(null!),
      new BehaviorSubject(null!), new BehaviorSubject(null!), PRIMARY_OUTLET, 'someComponent', s);
  advanceActivatedRoute(a);
  return createUrlTree(a, tree, commands, queryParams ?? null, fragment ?? null);
}

function create(
    segment: UrlSegmentGroup, startIndex: number, tree: UrlTree, commands: any[],
    queryParams?: Params, fragment?: string) {
  if (!segment) {
    expect(segment).toBeDefined();
  }
  const s = new (ActivatedRouteSnapshot as any)(
      segment.segments, <any>{}, <any>{}, '', <any>{}, PRIMARY_OUTLET, 'someComponent', null,
      <any>segment, startIndex, <any>null);
  const a = new (ActivatedRoute as any)(
      new BehaviorSubject(null!), new BehaviorSubject(null!), new BehaviorSubject(null!),
      new BehaviorSubject(null!), new BehaviorSubject(null!), PRIMARY_OUTLET, 'someComponent', s);
  advanceActivatedRoute(a);
  return createUrlTree(a, tree, commands, queryParams ?? null, fragment ?? null);
}
