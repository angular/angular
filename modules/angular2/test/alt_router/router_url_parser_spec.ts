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

import {DefaultRouterUrlParser} from 'angular2/src/alt_router/router_url_parser';
import {UrlSegment} from 'angular2/src/alt_router/segments';

export function main() {
  describe('url parsing', () => {
    let parser = new DefaultRouterUrlParser();

    it('should throw on an empty urls', () => { expect(() => parser.parse("")).toThrow(); });

    it('should parse the root url', () => {
      let tree = parser.parse("/");
      expect(tree.root).toEqual(new UrlSegment("/", {}, ""));
    });

    it('should parse non-empty urls', () => {
      let tree = parser.parse("one/two/three");
      expect(tree.root).toEqual(new UrlSegment("one", {}, ""));
      expect(tree.firstChild(tree.root)).toEqual(new UrlSegment("two", {}, ""));
      expect(tree.firstChild(tree.firstChild(tree.root))).toEqual(new UrlSegment("three", {}, ""));
    });

    it('should parse non-empty absolute urls', () => {
      let tree = parser.parse("/one/two");
      expect(tree.root).toEqual(new UrlSegment("/one", {}, ""));
      expect(tree.firstChild(tree.root)).toEqual(new UrlSegment("two", {}, ""));
    });
  });
}