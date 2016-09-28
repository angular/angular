/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PRIMARY_OUTLET} from '../src/shared';
import {DefaultUrlSerializer, UrlSegmentGroup, encode, serializePath} from '../src/url_tree';

describe('url serializer', () => {
  const url = new DefaultUrlSerializer();

  it('should parse the root url', () => {
    const tree = url.parse('/');
    expectSegment(tree.root, '');
    expect(url.serialize(tree)).toEqual('/');
  });

  it('should parse non-empty urls', () => {
    const tree = url.parse('one/two');
    expectSegment(tree.root.children[PRIMARY_OUTLET], 'one/two');
    expect(url.serialize(tree)).toEqual('/one/two');
  });

  it('should parse multiple secondary segments', () => {
    const tree = url.parse('/one/two(left:three//right:four)');

    expectSegment(tree.root.children[PRIMARY_OUTLET], 'one/two');
    expectSegment(tree.root.children['left'], 'three');
    expectSegment(tree.root.children['right'], 'four');

    expect(url.serialize(tree)).toEqual('/one/two(left:three//right:four)');
  });

  it('should parse top-level nodes with only secondary segment', () => {
    const tree = url.parse('/(left:one)');

    expect(tree.root.numberOfChildren).toEqual(1);
    expectSegment(tree.root.children['left'], 'one');

    expect(url.serialize(tree)).toEqual('/(left:one)');
  });

  it('should parse nodes with only secondary segment', () => {
    const tree = url.parse('/one/(left:two)');

    const one = tree.root.children[PRIMARY_OUTLET];
    expectSegment(one, 'one', true);
    expect(one.numberOfChildren).toEqual(1);
    expectSegment(one.children['left'], 'two');

    expect(url.serialize(tree)).toEqual('/one/(left:two)');
  });

  it('should not parse empty path segments with params', () => {
    expect(() => url.parse('/one/two/(;a=1//right:;b=2)'))
        .toThrowError(/Empty path url segment cannot have parameters/);
  });

  it('should parse scoped secondary segments', () => {
    const tree = url.parse('/one/(two//left:three)');

    const primary = tree.root.children[PRIMARY_OUTLET];
    expectSegment(primary, 'one', true);

    expectSegment(primary.children[PRIMARY_OUTLET], 'two');
    expectSegment(primary.children['left'], 'three');

    expect(url.serialize(tree)).toEqual('/one/(two//left:three)');
  });

  it('should parse scoped secondary segments with unscoped ones', () => {
    const tree = url.parse('/one/(two//left:three)(right:four)');

    const primary = tree.root.children[PRIMARY_OUTLET];
    expectSegment(primary, 'one', true);
    expectSegment(primary.children[PRIMARY_OUTLET], 'two');
    expectSegment(primary.children['left'], 'three');
    expectSegment(tree.root.children['right'], 'four');

    expect(url.serialize(tree)).toEqual('/one/(two//left:three)(right:four)');
  });

  it('should parse secondary segments that have children', () => {
    const tree = url.parse('/one(left:two/three)');

    expectSegment(tree.root.children[PRIMARY_OUTLET], 'one');
    expectSegment(tree.root.children['left'], 'two/three');

    expect(url.serialize(tree)).toEqual('/one(left:two/three)');
  });

  it('should parse an empty secondary segment group', () => {
    const tree = url.parse('/one()');

    expectSegment(tree.root.children[PRIMARY_OUTLET], 'one');

    expect(url.serialize(tree)).toEqual('/one');
  });

  it('should parse key-value matrix params', () => {
    const tree = url.parse('/one;a=11a;b=11b(left:two;c=22//right:three;d=33)');

    expectSegment(tree.root.children[PRIMARY_OUTLET], 'one;a=11a;b=11b');
    expectSegment(tree.root.children['left'], 'two;c=22');
    expectSegment(tree.root.children['right'], 'three;d=33');

    expect(url.serialize(tree)).toEqual('/one;a=11a;b=11b(left:two;c=22//right:three;d=33)');
  });

  it('should parse key only matrix params', () => {
    const tree = url.parse('/one;a');

    expectSegment(tree.root.children[PRIMARY_OUTLET], 'one;a=');

    expect(url.serialize(tree)).toEqual('/one;a=');
  });

  it('should parse query params (root)', () => {
    const tree = url.parse('/?a=1&b=2');
    expect(tree.root.children).toEqual({});
    expect(tree.queryParams).toEqual({a: '1', b: '2'});
    expect(url.serialize(tree)).toEqual('/?a=1&b=2');
  });

  it('should parse query params', () => {
    const tree = url.parse('/one?a=1&b=2');
    expect(tree.queryParams).toEqual({a: '1', b: '2'});
  });

  it('should parse query params when with parenthesis', () => {
    const tree = url.parse('/one?a=(11)&b=(22)');
    expect(tree.queryParams).toEqual({a: '(11)', b: '(22)'});
  });

  it('should parse query params when with slashes', () => {
    const tree = url.parse('/one?a=1/2&b=3/4');
    expect(tree.queryParams).toEqual({a: '1/2', b: '3/4'});
  });

  it('should parse key only query params', () => {
    const tree = url.parse('/one?a');
    expect(tree.queryParams).toEqual({a: ''});
  });

  it('should parse a value-empty query param', () => {
    const tree = url.parse('/one?a=');
    expect(tree.queryParams).toEqual({a: ''});
  });

  it('should parse value-empty query params', () => {
    const tree = url.parse('/one?a=&b=');
    expect(tree.queryParams).toEqual({a: '', b: ''});
  });

  it('should serializer query params', () => {
    const tree = url.parse('/one?a');
    expect(url.serialize(tree)).toEqual('/one?a=');
  });

  it('should parse fragment', () => {
    const tree = url.parse('/one#two');
    expect(tree.fragment).toEqual('two');
    expect(url.serialize(tree)).toEqual('/one#two');
  });

  it('should parse fragment (root)', () => {
    const tree = url.parse('/#one');
    expectSegment(tree.root, '');
    expect(url.serialize(tree)).toEqual('/#one');
  });

  it('should parse empty fragment', () => {
    const tree = url.parse('/one#');
    expect(tree.fragment).toEqual('');
    expect(url.serialize(tree)).toEqual('/one#');
  });

  describe('encoding/decoding', () => {
    it('should encode/decode path segments and parameters', () => {
      const u =
          `/${encode("one two")};${encode("p 1")}=${encode("v 1")};${encode("p 2")}=${encode("v 2")}`;
      const tree = url.parse(u);

      expect(tree.root.children[PRIMARY_OUTLET].segments[0].path).toEqual('one two');
      expect(tree.root.children[PRIMARY_OUTLET].segments[0].parameters)
          .toEqual({['p 1']: 'v 1', ['p 2']: 'v 2'});
      expect(url.serialize(tree)).toEqual(u);
    });

    it('should encode/decode "slash" in path segments and parameters', () => {
      const u = `/${encode("one/two")};${encode("p/1")}=${encode("v/1")}/three`;
      const tree = url.parse(u);
      expect(tree.root.children[PRIMARY_OUTLET].segments[0].path).toEqual('one/two');
      expect(tree.root.children[PRIMARY_OUTLET].segments[0].parameters).toEqual({['p/1']: 'v/1'});
      expect(url.serialize(tree)).toEqual(u);
    });

    it('should encode/decode query params', () => {
      const u = `/one?${encode("p 1")}=${encode("v 1")}&${encode("p 2")}=${encode("v 2")}`;
      const tree = url.parse(u);

      expect(tree.queryParams).toEqual({['p 1']: 'v 1', ['p 2']: 'v 2'});
      expect(url.serialize(tree)).toEqual(u);
    });

    it('should encode/decode fragment', () => {
      const u = `/one#${encodeURI("one two=three four")}`;
      const tree = url.parse(u);

      expect(tree.fragment).toEqual('one two=three four');
      expect(url.serialize(tree)).toEqual(u);
    });
  });

  describe('error handling', () => {
    it('should throw when invalid characters inside children', () => {
      expect(() => url.parse('/one/(left#one)'))
          .toThrowError('Cannot parse url \'/one/(left#one)\'');
    });

    it('should throw when missing closing )', () => {
      expect(() => url.parse('/one/(left')).toThrowError('Cannot parse url \'/one/(left\'');
    });
  });
});

function expectSegment(
    segment: UrlSegmentGroup, expected: string, hasChildren: boolean = false): void {
  if (segment.segments.filter(s => s.path === '').length > 0) {
    throw new Error(`UrlSegments cannot be empty ${segment.segments}`);
  }
  const p = segment.segments.map(p => serializePath(p)).join('/');
  expect(p).toEqual(expected);
  expect(Object.keys(segment.children).length > 0).toEqual(hasChildren);
}
