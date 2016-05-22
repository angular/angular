import {DefaultUrlSerializer, serializeSegment} from '../src/url_serializer';
import {UrlSegment} from '../src/url_tree';

describe('url serializer', () => {
  let url = new DefaultUrlSerializer();

  it('should parse the root url', () => {
    let tree = url.parse("/");
    expectSegment(tree.root, "");
    expect(url.serialize(tree)).toEqual("");
  });

  it('should parse non-empty urls', () => {
    let tree = url.parse("one/two");
    let one = tree.firstChild(tree.root);
    expectSegment(one, "one");
    expectSegment(tree.firstChild(<any>one), "two");
    expect(url.serialize(tree)).toEqual("/one/two");
  });

  it("should parse multiple secondary segments", () => {
    let tree = url.parse("/one/two(three//four)/five");
    let c = tree.children(<any>tree.firstChild(tree.root));

    expectSegment(c[0], "two");
    expectSegment(c[1], "three");
    expectSegment(c[2], "four");

    expectSegment(tree.firstChild(c[0]), "five");

    expect(url.serialize(tree)).toEqual("/one/two(three//four)/five");
  });

  it("should parse secondary segments that have secondary segments", () => {
    let tree = url.parse("/one(/two(/three))");
    let c = tree.children(tree.root);

    expectSegment(c[0], "one");
    expectSegment(c[1], "two");
    expectSegment(c[2], "three");

    expect(url.serialize(tree)).toEqual("/one(two//three)");
  });

  it("should parse secondary segments that have children", () => {
    let tree = url.parse("/one(/two/three)");
    let c = tree.children(tree.root);

    expectSegment(c[0], "one");
    expectSegment(c[1], "two");
    expectSegment(tree.firstChild(c[1]), "three");

    expect(url.serialize(tree)).toEqual("/one(two/three)");
  });

  it("should parse an empty secondary segment group", () => {
    let tree = url.parse("/one()");
    let c = tree.children(tree.root);

    expectSegment(c[0], "one");
    expect(tree.children(c[0]).length).toEqual(0);

    expect(url.serialize(tree)).toEqual("/one");
  });

  it("should parse key-value matrix params", () => {
    let tree = url.parse("/one;a=11a;b=11b(two;c=22//three;d=33)");
    let c = tree.children(tree.root);

    expectSegment(c[0], "one;a=11a;b=11b");
    expectSegment(c[1], "two;c=22");
    expectSegment(c[2], "three;d=33");

    expect(url.serialize(tree)).toEqual("/one;a=11a;b=11b(two;c=22//three;d=33)");
  });

  it("should parse key only matrix params", () => {
    let tree = url.parse("/one;a");

    let c = tree.firstChild(tree.root);
    expectSegment(c, "one;a=true");

    expect(url.serialize(tree)).toEqual("/one;a=true");
  });

  it("should parse query params", () => {
    let tree = url.parse("/one?a=1&b=2");
    expect(tree.queryParameters).toEqual({a: '1', b: '2'});
  });

  it("should parse key only query params", () => {
    let tree = url.parse("/one?a");
    expect(tree.queryParameters).toEqual({a: 'true'});
  });

  it("should serializer query params", () => {
    let tree = url.parse("/one?a");
    expect(url.serialize(tree)).toEqual("/one?a=true");
  });

  it("should parse fragment", () => {
    let tree = url.parse("/one#two");
    expect(tree.fragment).toEqual("two");
    expect(url.serialize(tree)).toEqual("/one#two");
  });

  it("should parse empty fragment", () => {
    let tree = url.parse("/one#");
    expect(tree.fragment).toEqual("");
    expect(url.serialize(tree)).toEqual("/one#");
  });
});

function expectSegment(segment:UrlSegment | null, expected:string):void {
  expect(segment ? serializeSegment(segment) : null).toEqual(expected);
}
