/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {PRIMARY_OUTLET} from '../src/shared';
import {
  DefaultUrlSerializer,
  encodeUriFragment,
  encodeUriQuery,
  encodeUriSegment,
  serializePath,
  UrlSegmentGroup,
} from '../src/url_tree';

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

  it('should parse secondary segments with an = in the name', () => {
    const tree = url.parse('/path/to/some=file');
    expect(tree.root.children['primary'].segments[2].path).toEqual('some=file');
  });

  it('should parse segments with matrix parameters when the name contains an =', () => {
    const tree = url.parse('/path/to/some=file;test=11');
    expect(tree.root.children['primary'].segments[2].path).toEqual('some=file');
    expect(tree.root.children['primary'].segments[2].parameterMap.keys).toHaveSize(1);
    expect(tree.root.children['primary'].segments[2].parameterMap.get('test')).toEqual('11');
  });

  it('should parse segments that end with an =', () => {
    const tree = url.parse('/password/de/MDAtMNTk=');
    expect(tree.root.children['primary'].segments[2].path).toEqual('MDAtMNTk=');
  });

  it('should parse segments that only contain an =', () => {
    const tree = url.parse('example.com/prefix/=');
    expect(tree.root.children['primary'].segments[2].path).toEqual('=');
  });

  it('should parse segments with matrix parameter values containing an =', () => {
    const tree = url.parse('/path/to/something;query=file=test;query2=test2');
    expect(tree.root.children['primary'].segments[2].path).toEqual('something');
    expect(tree.root.children['primary'].segments[2].parameterMap.keys).toHaveSize(2);
    expect(tree.root.children['primary'].segments[2].parameterMap.get('query')).toEqual(
      'file=test',
    );
    expect(tree.root.children['primary'].segments[2].parameterMap.get('query2')).toEqual('test2');
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
    expect(() => url.parse('/one/two/(;a=1//right:;b=2)')).toThrowError(
      /Empty path url segment cannot have parameters/,
    );
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

  it('should handle multiple query params of the same name into an array', () => {
    const tree = url.parse('/one?a=foo&a=bar&a=swaz');
    expect(tree.queryParams).toEqual({a: ['foo', 'bar', 'swaz']});
    expect(tree.queryParamMap.get('a')).toEqual('foo');
    expect(tree.queryParamMap.getAll('a')).toEqual(['foo', 'bar', 'swaz']);
    expect(url.serialize(tree)).toEqual('/one?a=foo&a=bar&a=swaz');
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

  it('should parse no fragment', () => {
    const tree = url.parse('/one');
    expect(tree.fragment).toEqual(null);
    expect(url.serialize(tree)).toEqual('/one');
  });

  describe('encoding/decoding', () => {
    it('should encode/decode path segments and parameters', () => {
      const u = `/${encodeUriSegment('one two')};${encodeUriSegment('p 1')}=${encodeUriSegment(
        'v 1',
      )};${encodeUriSegment('p 2')}=${encodeUriSegment('v 2')}`;
      const tree = url.parse(u);

      expect(tree.root.children[PRIMARY_OUTLET].segments[0].path).toEqual('one two');
      expect(tree.root.children[PRIMARY_OUTLET].segments[0].parameters).toEqual({
        ['p 1']: 'v 1',
        ['p 2']: 'v 2',
      });
      expect(url.serialize(tree)).toEqual(u);
    });

    it('should encode/decode "slash" in path segments and parameters', () => {
      const u = `/${encodeUriSegment('one/two')};${encodeUriSegment('p/1')}=${encodeUriSegment(
        'v/1',
      )}/three`;
      const tree = url.parse(u);
      const segment = tree.root.children[PRIMARY_OUTLET].segments[0];
      expect(segment.path).toEqual('one/two');
      expect(segment.parameters).toEqual({'p/1': 'v/1'});
      expect(segment.parameterMap.get('p/1')).toEqual('v/1');
      expect(segment.parameterMap.getAll('p/1')).toEqual(['v/1']);
      expect(url.serialize(tree)).toEqual(u);
    });

    it('should encode/decode query params', () => {
      const u = `/one?${encodeUriQuery('p 1')}=${encodeUriQuery('v 1')}&${encodeUriQuery(
        'p 2',
      )}=${encodeUriQuery('v 2')}`;
      const tree = url.parse(u);

      expect(tree.queryParams).toEqual({'p 1': 'v 1', 'p 2': 'v 2'});
      expect(tree.queryParamMap.get('p 1')).toEqual('v 1');
      expect(tree.queryParamMap.get('p 2')).toEqual('v 2');
      expect(url.serialize(tree)).toEqual(u);
    });

    it('should decode spaces in query as %20 or +', () => {
      const u1 = `/one?foo=bar baz`;
      const u2 = `/one?foo=bar+baz`;
      const u3 = `/one?foo=bar%20baz`;

      const u1p = url.parse(u1);
      const u2p = url.parse(u2);
      const u3p = url.parse(u3);

      expect(url.serialize(u1p)).toBe(url.serialize(u2p));
      expect(url.serialize(u2p)).toBe(url.serialize(u3p));
      expect(u1p.queryParamMap.get('foo')).toBe('bar baz');
      expect(u2p.queryParamMap.get('foo')).toBe('bar baz');
      expect(u3p.queryParamMap.get('foo')).toBe('bar baz');
    });

    it('should encode query params leaving sub-delimiters intact', () => {
      const percentChars = '/?#&+=[] ';
      const percentCharsEncoded = '%2F%3F%23%26%2B%3D%5B%5D%20';
      const intactChars = "!$'()*,;:";
      const params = percentChars + intactChars;
      const paramsEncoded = percentCharsEncoded + intactChars;
      const mixedCaseString = 'sTrInG';

      expect(percentCharsEncoded).toEqual(encodeUriQuery(percentChars));
      expect(intactChars).toEqual(encodeUriQuery(intactChars));
      // Verify it replaces repeated characters correctly
      expect(paramsEncoded + paramsEncoded).toEqual(encodeUriQuery(params + params));
      // Verify it doesn't change the case of alpha characters
      expect(mixedCaseString + paramsEncoded).toEqual(encodeUriQuery(mixedCaseString + params));
    });

    it('should encode/decode fragment', () => {
      const u = `/one#${encodeUriFragment('one two=three four')}`;
      const tree = url.parse(u);

      expect(tree.fragment).toEqual('one two=three four');
      expect(url.serialize(tree)).toEqual('/one#one%20two=three%20four');
    });
  });

  describe('special character encoding/decoding', () => {
    // Tests specific to https://github.com/angular/angular/issues/10280
    it('should parse encoded parens in matrix params', () => {
      const auxRoutesUrl = '/abc;foo=(other:val)';
      const fooValueUrl = '/abc;foo=%28other:val%29';

      const auxParsed = url.parse(auxRoutesUrl).root;
      const fooParsed = url.parse(fooValueUrl).root;

      // Test base case
      expect(auxParsed.children[PRIMARY_OUTLET].segments.length).toBe(1);
      expect(auxParsed.children[PRIMARY_OUTLET].segments[0].path).toBe('abc');
      expect(auxParsed.children[PRIMARY_OUTLET].segments[0].parameters).toEqual({foo: ''});
      expect(auxParsed.children['other'].segments.length).toBe(1);
      expect(auxParsed.children['other'].segments[0].path).toBe('val');

      // Confirm matrix params are URL decoded
      expect(fooParsed.children[PRIMARY_OUTLET].segments.length).toBe(1);
      expect(fooParsed.children[PRIMARY_OUTLET].segments[0].path).toBe('abc');
      expect(fooParsed.children[PRIMARY_OUTLET].segments[0].parameters).toEqual({
        foo: '(other:val)',
      });
    });

    it('should serialize encoded parens in matrix params', () => {
      const testUrl = '/abc;foo=%28one%29';

      const parsed = url.parse(testUrl);

      expect(url.serialize(parsed)).toBe('/abc;foo=%28one%29');
    });

    it('should not serialize encoded parens in query params', () => {
      const testUrl = '/abc?foo=%28one%29';

      const parsed = url.parse(testUrl);

      expect(parsed.queryParams).toEqual({foo: '(one)'});

      expect(url.serialize(parsed)).toBe('/abc?foo=(one)');
    });

    // Test special characters in general

    // From https://tools.ietf.org/html/rfc3986
    const unreserved = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~`;

    it('should encode a minimal set of special characters in queryParams', () => {
      const notEncoded = unreserved + `:@!$'*,();`;
      const encode = ` +%&=#[]/?`;
      const encoded = `%20%2B%25%26%3D%23%5B%5D%2F%3F`;

      const parsed = url.parse('/foo');

      parsed.queryParams = {notEncoded, encode};

      expect(url.serialize(parsed)).toBe(`/foo?notEncoded=${notEncoded}&encode=${encoded}`);
    });

    it('should encode a minimal set of special characters in fragment', () => {
      const notEncoded = unreserved + `:@!$'*,();+&=#/?`;
      const encode = ' %<>`"[]';
      const encoded = `%20%25%3C%3E%60%22%5B%5D`;

      const parsed = url.parse('/foo');

      parsed.fragment = notEncoded + encode;

      expect(url.serialize(parsed)).toBe(`/foo#${notEncoded}${encoded}`);
    });

    it('should encode minimal special characters plus parens and semi-colon in matrix params', () => {
      const notEncoded = unreserved + `:@!$'*,&`;
      const encode = ` /%=#()[];?+`;
      const encoded = `%20%2F%25%3D%23%28%29%5B%5D%3B%3F%2B`;

      const parsed = url.parse('/foo');

      parsed.root.children[PRIMARY_OUTLET].segments[0].parameters = {notEncoded, encode};

      expect(url.serialize(parsed)).toBe(`/foo;notEncoded=${notEncoded};encode=${encoded}`);
    });

    it('should encode special characters in the path the same as matrix params', () => {
      const notEncoded = unreserved + `:@!$'*,&`;
      const encode = ` /%=#()[];?+`;
      const encoded = `%20%2F%25%3D%23%28%29%5B%5D%3B%3F%2B`;

      const parsed = url.parse('/foo');

      parsed.root.children[PRIMARY_OUTLET].segments[0].path = notEncoded + encode;

      expect(url.serialize(parsed)).toBe(`/${notEncoded}${encoded}`);
    });

    it('should correctly encode ampersand in segments', () => {
      const testUrl = '/parent&child';

      const parsed = url.parse(testUrl);

      expect(url.serialize(parsed)).toBe(testUrl);
    });
  });

  describe('error handling', () => {
    it('should throw when invalid characters inside children', () => {
      expect(() => url.parse('/one/(left#one)')).toThrowError();
    });

    it('should throw when missing closing )', () => {
      expect(() => url.parse('/one/(left')).toThrowError();
    });
  });
});

function expectSegment(
  segment: UrlSegmentGroup,
  expected: string,
  hasChildren: boolean = false,
): void {
  if (segment.segments.filter((s) => s.path === '').length > 0) {
    throw new Error(`UrlSegments cannot be empty ${segment.segments}`);
  }
  const p = segment.segments.map((p) => serializePath(p)).join('/');
  expect(p).toEqual(expected);
  expect(Object.keys(segment.children).length > 0).toEqual(hasChildren);
}
