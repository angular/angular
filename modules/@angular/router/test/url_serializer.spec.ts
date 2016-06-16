import {DefaultUrlSerializer, serializePath} from '../src/url_serializer';
import {UrlSegment} from '../src/url_tree';
import {PRIMARY_OUTLET} from '../src/shared';

describe('url serializer', () => {
  const url = new DefaultUrlSerializer();

  it('should parse the root url', () => {
    const tree = url.parse("/");
    
    expectSegment(tree.root, "");
    expect(url.serialize(tree)).toEqual("/");
  });

  it('should parse non-empty urls', () => {
    const tree = url.parse("one/two");
    expectSegment(tree.root.children[PRIMARY_OUTLET], "one/two");
    expect(url.serialize(tree)).toEqual("/one/two");
  });

  it("should parse multiple secondary segments", () => {
    const tree = url.parse("/one/two(left:three//right:four)");

    expectSegment(tree.root.children[PRIMARY_OUTLET], "one/two");
    expectSegment(tree.root.children['left'], "three");
    expectSegment(tree.root.children['right'], "four");

    expect(url.serialize(tree)).toEqual("/one/two(left:three//right:four)");
  });

  it("should parse scoped secondary segments", () => {
    const tree = url.parse("/one/(two//left:three)");

    const primary = tree.root.children[PRIMARY_OUTLET];
    expectSegment(primary, "one", true);

    expectSegment(primary.children[PRIMARY_OUTLET], "two");
    expectSegment(primary.children["left"], "three");

    expect(url.serialize(tree)).toEqual("/one/(two//left:three)");
  });

  it("should parse scoped secondary segments with unscoped ones", () => {
    const tree = url.parse("/one/(two//left:three)(right:four)");

    const primary = tree.root.children[PRIMARY_OUTLET];
    expectSegment(primary, "one", true);
    expectSegment(primary.children[PRIMARY_OUTLET], "two");
    expectSegment(primary.children["left"], "three");
    expectSegment(tree.root.children["right"], "four");

    expect(url.serialize(tree)).toEqual("/one/(two//left:three)(right:four)");
  });

  it("should parse secondary segments that have children", () => {
    const tree = url.parse("/one(left:two/three)");

    expectSegment(tree.root.children[PRIMARY_OUTLET], "one");
    expectSegment(tree.root.children['left'], "two/three");

    expect(url.serialize(tree)).toEqual("/one(left:two/three)");
  });

  it("should parse an empty secondary segment group", () => {
    const tree = url.parse("/one()");

    expectSegment(tree.root.children[PRIMARY_OUTLET], "one");

    expect(url.serialize(tree)).toEqual("/one");
  });

  it("should parse key-value matrix params", () => {
    const tree = url.parse("/one;a=11a;b=11b(left:two;c=22//right:three;d=33)");

    expectSegment(tree.root.children[PRIMARY_OUTLET], "one;a=11a;b=11b");
    expectSegment(tree.root.children["left"], "two;c=22");
    expectSegment(tree.root.children["right"], "three;d=33");

    expect(url.serialize(tree)).toEqual("/one;a=11a;b=11b(left:two;c=22//right:three;d=33)");
  });

  it("should parse key only matrix params", () => {
    const tree = url.parse("/one;a");

    expectSegment(tree.root.children[PRIMARY_OUTLET], "one;a=true");

    expect(url.serialize(tree)).toEqual("/one;a=true");
  });

  it("should parse query params", () => {
    const tree = url.parse("/one?a=1&b=2");
    expect(tree.queryParams).toEqual({a: '1', b: '2'});
  });

  it("should parse query params when with parenthesis", () => {
    const tree = url.parse("/one?a=(11)&b=(22)");
    expect(tree.queryParams).toEqual({a: '(11)', b: '(22)'});
  });

  it("should parse key only query params", () => {
    const tree = url.parse("/one?a");
    expect(tree.queryParams).toEqual({a: 'true'});
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

function expectSegment(segment:UrlSegment, expected:string, hasChildren: boolean = false):void {
  const p = segment.pathsWithParams.map(p => serializePath(p)).join("/");
  expect(p).toEqual(expected);
  expect(Object.keys(segment.children).length > 0).toEqual(hasChildren);
}
