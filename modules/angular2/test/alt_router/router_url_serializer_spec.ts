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

import {DefaultRouterUrlSerializer} from 'angular2/src/alt_router/router_url_serializer';
import {UrlSegment} from 'angular2/src/alt_router/segments';

export function main() {
  describe('url parsing', () => {
    let url = new DefaultRouterUrlSerializer();

    it('should throw on an empty urls', () => { expect(() => url.parse("")).toThrow(); });

    it('should parse the root url', () => {
      let tree = url.parse("/");
      expectSegment(tree.root, "");
      expect(url.serialize(tree)).toEqual("");
    });

    it('should parse non-empty urls', () => {
      let tree = url.parse("one/two");
      expectSegment(tree.firstChild(tree.root), "one");
      expectSegment(tree.firstChild(tree.firstChild(tree.root)), "two");
      expect(url.serialize(tree)).toEqual("/one/two");
    });

    it("should parse multiple aux routes", () => {
      let tree = url.parse("/one/two(/three//right:four)/five");
      let c = tree.children(tree.firstChild(tree.root));

      expectSegment(c[0], "two");
      expectSegment(c[1], "aux:three");
      expectSegment(c[2], "right:four");

      expectSegment(tree.firstChild(c[0]), "five");

      expect(url.serialize(tree)).toEqual("/one/two(aux:three//right:four)/five");
    });

    it("should parse aux routes that have aux routes", () => {
      let tree = url.parse("/one(/two(/three))");
      let c = tree.children(tree.root);

      expectSegment(c[0], "one");
      expectSegment(c[1], "aux:two");
      expectSegment(c[2], "aux:three");

      expect(url.serialize(tree)).toEqual("/one(aux:two//aux:three)");
    });

    it("should parse aux routes that have children", () => {
      let tree = url.parse("/one(/two/three)");
      let c = tree.children(tree.root);

      expectSegment(c[0], "one");
      expectSegment(c[1], "aux:two");
      expectSegment(tree.firstChild(c[1]), "three");

      expect(url.serialize(tree)).toEqual("/one(aux:two/three)");
    });

    it("should parse an empty aux route definition", () => {
      let tree = url.parse("/one()");
      let c = tree.children(tree.root);

      expectSegment(c[0], "one");
      expect(tree.children(c[0]).length).toEqual(0);

      expect(url.serialize(tree)).toEqual("/one");
    });

    it("should parse key-value matrix params", () => {
      let tree = url.parse("/one;a=11a;b=11b(/two;c=22//right:three;d=33)");

      let c = tree.firstChild(tree.root);
      expectSegment(c, "one");

      let c2 = tree.children(c);
      expectSegment(c2[0], ";a=11a;b=11b");
      expectSegment(c2[1], "aux:two");
      expectSegment(c2[2], "right:three");

      expectSegment(tree.firstChild(c2[1]), ";c=22");
      expectSegment(tree.firstChild(c2[2]), ";d=33");

      expect(url.serialize(tree)).toEqual("/one;a=11a;b=11b(aux:two;c=22//right:three;d=33)");
    });

    it("should parse key only matrix params", () => {
      let tree = url.parse("/one;a");

      let c = tree.firstChild(tree.root);
      expectSegment(c, "one");
      expectSegment(tree.firstChild(c), ";a=true");

      expect(url.serialize(tree)).toEqual("/one;a=true");
    });

    // it("should parse key-value query params", () => {
    //   let tree = url.parse("/one?a=1&b=2");
    //   expect(tree.root).toEqual(new UrlSegment("", {'a': '1', 'b': '2'}, DEFAULT_OUTLET_NAME));
    // });
    //
    // it("should parse key only query params", () => {
    //   let tree = url.parse("/one?a");
    //   expect(tree.root).toEqual(new UrlSegment("", {'a': "true"}, DEFAULT_OUTLET_NAME));
    // });
    //
    // it("should parse a url with only query params", () => {
    //   let tree = url.parse("?a");
    //   expect(tree.root).toEqual(new UrlSegment("", {'a': "true"}, DEFAULT_OUTLET_NAME));
    // });
    //
    // it("should allow slashes within query params", () => {
    //   let tree = url.parse("?a=http://boo");
    //   expect(tree.root).toEqual(new UrlSegment("", {'a': "http://boo"}, DEFAULT_OUTLET_NAME));
    // });
  });
}

function expectSegment(segment: UrlSegment, expected: string): void {
  expect(segment.toString()).toEqual(expected);
}