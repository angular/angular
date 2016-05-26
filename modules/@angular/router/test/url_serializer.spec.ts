import {DefaultUrlSerializer, serializeSegment} from '../src/url_serializer';
import {UrlSegment} from '../src/url_tree';

describe('url serializer', () => {
  const url = new DefaultUrlSerializer();

  it('should parse the root url', () => {
    const tree = url.parse("/");
    expectSegment(tree.root, "");
    expect(url.serialize(tree)).toEqual("");
  });

  it('should parse non-empty urls', () => {
    const tree = url.parse("one/two");
    const one = tree.firstChild(tree.root);

    expectSegment(one, "one");
    expectSegment(tree.firstChild(<any>one), "two");
    expect(url.serialize(tree)).toEqual("/one/two");
  });

  it("should parse multiple secondary segments", () => {
    const tree = url.parse("/one/two(left:three//right:four)/five");
    const c = tree.children(<any>tree.firstChild(tree.root));

    expectSegment(c[0], "two");
    expectSegment(c[1], "left:three");
    expectSegment(c[2], "right:four");

    expectSegment(tree.firstChild(c[0]), "five");

    expect(url.serialize(tree)).toEqual("/one/two(left:three//right:four)/five");
  });

  it("should parse secondary segments that have secondary segments", () => {
    const tree = url.parse("/one(left:two(right:three))");
    const c = tree.children(tree.root);

    expectSegment(c[0], "one");
    expectSegment(c[1], "left:two");
    expectSegment(c[2], "right:three");

    expect(url.serialize(tree)).toEqual("/one(left:two//right:three)");
  });

  it("should parse secondary segments that have children", () => {
    const tree = url.parse("/one(left:two/three)");
    const c = tree.children(tree.root);

    expectSegment(c[0], "one");
    expectSegment(c[1], "left:two");
    expectSegment(tree.firstChild(c[1]), "three");

    expect(url.serialize(tree)).toEqual("/one(left:two/three)");
  });

  it("should parse an empty secondary segment group", () => {
    const tree = url.parse("/one()");
    const c = tree.children(tree.root);

    expectSegment(c[0], "one");
    expect(tree.children(c[0]).length).toEqual(0);

    expect(url.serialize(tree)).toEqual("/one");
  });

  it("should parse key-value matrix params", () => {
    const tree = url.parse("/one;a=11a;b=11b(left:two;c=22//right:three;d=33)");
    const c = tree.children(tree.root);

    expectSegment(c[0], "one;a=11a;b=11b");
    expectSegment(c[1], "left:two;c=22");
    expectSegment(c[2], "right:three;d=33");

    expect(url.serialize(tree)).toEqual("/one;a=11a;b=11b(left:two;c=22//right:three;d=33)");
  });

  it("should parse key only matrix params", () => {
    const tree = url.parse("/one;a");

    const c = tree.firstChild(tree.root);
    expectSegment(c, "one;a=true");

    expect(url.serialize(tree)).toEqual("/one;a=true");
  });

  it("should parse query params", () => {
    const tree = url.parse("/one?a=1&b=2");
    expect(tree.queryParameters).toEqual({a: '1', b: '2'});
  });

  it("should parse key only query params", () => {
    const tree = url.parse("/one?a");
    expect(tree.queryParameters).toEqual({a: 'true'});
  });

  it("should serializer query params", () => {
    const tree = url.parse("/one?a");
    expect(url.serialize(tree)).toEqual("/one?a=true");
  });

  it("should parse fragment", () => {
    const tree = url.parse("/one#two");
    expect(tree.fragment).toEqual("two");
    expect(url.serialize(tree)).toEqual("/one#two");
  });

  it("should parse empty fragment", () => {
    const tree = url.parse("/one#");
    expect(tree.fragment).toEqual("");
    expect(url.serialize(tree)).toEqual("/one#");
  });
});

function expectSegment(segment:UrlSegment | null, expected:string):void {
  expect(segment ? serializeSegment(segment) : null).toEqual(expected);
}
