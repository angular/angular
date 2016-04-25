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
import {DEFAULT_OUTLET_NAME} from 'angular2/src/alt_router/constants';

export function main() {
  describe('url parsing', () => {
    let parser = new DefaultRouterUrlParser();

    it('should throw on an empty urls', () => { expect(() => parser.parse("")).toThrow(); });

    it('should parse the root url', () => {
      let tree = parser.parse("/");
      expectSegment(tree.root, "");
    });

    it('should parse non-empty urls', () => {
      let tree = parser.parse("one/two");
      expectSegment(tree.firstChild(tree.root), "one");
      expectSegment(tree.firstChild(tree.firstChild(tree.root)), "two");
    });

    it("should parse multiple aux routes", () => {
      let tree = parser.parse("/one/two(/three//right:four)/five");
      let c = tree.children(tree.firstChild(tree.root));

      expectSegment(c[0], "two");
      expectSegment(c[1], "aux:three");
      expectSegment(c[2], "right:four");

      expectSegment(tree.firstChild(c[0]), "five");
    });

    it("should parse aux routes that have aux routes", () => {
      let tree = parser.parse("/one(/two(/three))");
      let c = tree.children(tree.root);

      expectSegment(c[0], "one");
      expectSegment(c[1], "aux:two");
      expectSegment(c[2], "aux:three");
    });

    it("should parse aux routes that have children", () => {
      let tree = parser.parse("/one(/two/three)");
      let c = tree.children(tree.root);

      expectSegment(c[0], "one");
      expectSegment(c[1], "aux:two");
      expectSegment(tree.firstChild(c[1]), "three");
    });

    it("should parse an empty aux route definition", () => {
      let tree = parser.parse("/one()");
      let c = tree.children(tree.root);

      expectSegment(c[0], "one");
      expect(tree.children(c[0]).length).toEqual(0);
    });

    it("should parse key-value matrix params", () => {
      let tree = parser.parse("/one;a=11a;b=11b(/two;c=22//right:three;d=33)");

      let c = tree.children(tree.root);
      expectSegment(c[0], "one;a=11a;b=11b");
      expectSegment(c[1], "aux:two;c=22");
      expectSegment(c[2], "right:three;d=33");
    });

    it("should parse key only matrix params", () => {
      let tree = parser.parse("/one;a");

      let c = tree.children(tree.root);
      expectSegment(c[0], "one;a=true");
    });

    it("should parse key-value query params", () => {
      let tree = parser.parse("/one?a=1&b=2");
      expect(tree.root).toEqual(new UrlSegment("", {'a': '1', 'b': '2'}, DEFAULT_OUTLET_NAME));
    });

    it("should parse key only query params", () => {
      let tree = parser.parse("/one?a");
      expect(tree.root).toEqual(new UrlSegment("", {'a': "true"}, DEFAULT_OUTLET_NAME));
    });

    it("should parse a url with only query params", () => {
      let tree = parser.parse("?a");
      expect(tree.root).toEqual(new UrlSegment("", {'a': "true"}, DEFAULT_OUTLET_NAME));
    });

    it("should allow slashes within query params", () => {
      let tree = parser.parse("?a=http://boo");
      expect(tree.root).toEqual(new UrlSegment("", {'a': "http://boo"}, DEFAULT_OUTLET_NAME));
    });
  });
}

function expectSegment(segment: UrlSegment, expected: string): void {
  expect(segment.toString()).toEqual(expected);
}