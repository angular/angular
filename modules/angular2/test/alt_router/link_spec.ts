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

import {RouteSegment, UrlSegment, Tree} from 'angular2/src/alt_router/segments';
import {link} from 'angular2/src/alt_router/link';
import {DefaultRouterUrlSerializer} from 'angular2/src/alt_router/router_url_serializer';

export function main() {
  describe('link', () => {
    let parser = new DefaultRouterUrlSerializer();

    it("should return the original tree when given an empty array", () => {
      let p = parser.parse("/");
      let t = link(s(p.root), p, []);
      expect(t).toBe(p);
    });

    it("should support going to root", () => {
      let p = parser.parse("/");
      let t = link(s(p.root), p, ["/"]);
      expect(parser.serialize(t)).toEqual("");
    });

    it("should support positional params", () => {
      let p = parser.parse("/");
      let t = link(s(p.root), p, ["/one", 11, "two", 22]);
      expect(parser.serialize(t)).toEqual("/one/11/two/22");
    });

    it("should preserve route siblings when changing the main route", () => {
      let p = parser.parse("/a/11/b(c)");
      let t = link(s(p.root), p, ["/a", 11, 'd']);
      expect(parser.serialize(t)).toEqual("/a/11/d(aux:c)");
    });

    it("should preserve route siblings when changing a aux route", () => {
      let p = parser.parse("/a/11/b(c)");
      let t = link(s(p.root), p, ["/a", 11, 'aux:d']);
      expect(parser.serialize(t)).toEqual("/a/11/b(aux:d)");
    });


    it('should update parameters', () => {
      let p = parser.parse("/a;aa=11");
      let t = link(s(p.root), p, ["/a", {aa: 22, bb: 33}]);
      expect(parser.serialize(t)).toEqual("/a;aa=22;bb=33");
    });
  });
}

function s(u: UrlSegment): RouteSegment {
  return new RouteSegment([u], {}, null, null, null);
}