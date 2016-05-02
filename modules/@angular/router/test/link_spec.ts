import {
  ComponentFixture,
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit
} from 'angular2/testing_internal';

import {
  RouteSegment,
  UrlSegment,
  UrlTree,
  TreeNode,
  RouteTree
} from 'angular2/src/alt_router/segments';
import {link} from 'angular2/src/alt_router/link';
import {DefaultRouterUrlSerializer} from 'angular2/src/alt_router/router_url_serializer';

export function main() {
  describe('link', () => {
    let parser = new DefaultRouterUrlSerializer();

    it("should return the original tree when given an empty array", () => {
      let p = parser.parse("/");
      let tree = s(p.root);
      let t = link(tree.root, tree, p, []);
      expect(t).toBe(p);
    });

    it("should support going to root", () => {
      let p = parser.parse("/");
      let tree = s(p.root);
      let t = link(tree.root, tree, p, ["/"]);
      expect(parser.serialize(t)).toEqual("");
    });

    it("should support positional params", () => {
      let p = parser.parse("/a/b");
      let tree = s(p.firstChild(p.root));
      let t = link(tree.root, tree, p, ["/one", 11, "two", 22]);
      expect(parser.serialize(t)).toEqual("/one/11/two/22");
    });

    it("should preserve route siblings when changing the main route", () => {
      let p = parser.parse("/a/11/b(c)");
      let tree = s(p.root);
      let t = link(tree.root, tree, p, ["/a", 11, 'd']);
      expect(parser.serialize(t)).toEqual("/a/11/d(aux:c)");
    });

    it("should preserve route siblings when changing a aux route", () => {
      let p = parser.parse("/a/11/b(c)");
      let tree = s(p.root);
      let t = link(tree.root, tree, p, ["/a", 11, 'aux:d']);
      expect(parser.serialize(t)).toEqual("/a/11/b(aux:d)");
    });

    it('should update parameters', () => {
      let p = parser.parse("/a;aa=11");
      let tree = s(p.root);
      let t = link(tree.root, tree, p, ["/a", {aa: 22, bb: 33}]);
      expect(parser.serialize(t)).toEqual("/a;aa=22;bb=33");
    });

    it("should update relative subtree (when starts with ./)", () => {
      let p = parser.parse("/a(ap)/c(cp)");
      let c = p.firstChild(p.root);
      let tree = s(c);
      let t = link(tree.root, tree, p, ["./c2"]);
      expect(parser.serialize(t)).toEqual("/a(aux:ap)/c2(aux:cp)");
    });

    it("should update relative subtree (when does not start with ./)", () => {
      let p = parser.parse("/a(ap)/c(cp)");
      let c = p.firstChild(p.root);
      let tree = s(c);
      let t = link(tree.root, tree, p, ["c2"]);
      expect(parser.serialize(t)).toEqual("/a(aux:ap)/c2(aux:cp)");
    });

    it("should update relative subtree when the provided segment doesn't have url segments", () => {
      let p = parser.parse("/a(ap)/c(cp)");
      let c = p.firstChild(p.root);

      let child = new RouteSegment([], null, null, null, null);
      let root = new TreeNode<RouteSegment>(new RouteSegment([c], {}, null, null, null),
                                            [new TreeNode<RouteSegment>(child, [])]);
      let tree = new RouteTree(root);

      let t = link(child, tree, p, ["./c2"]);
      expect(parser.serialize(t)).toEqual("/a(aux:ap)/c2(aux:cp)");
    });
  });
}

function s(u: UrlSegment): RouteTree {
  let root = new TreeNode<RouteSegment>(new RouteSegment([u], {}, null, null, null), []);
  return new RouteTree(root);
}