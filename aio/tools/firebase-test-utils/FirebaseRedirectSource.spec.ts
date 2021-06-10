import { FirebaseRedirectSource } from './FirebaseRedirectSource';

describe('FirebaseRedirectSource', () => {
  describe('test', () => {
    describe('(using glob)', () => {
      it('should match * parts', () => {
        testGlob('asdf/*.jpg',
          ['asdf/.jpg', 'asdf/asdf.jpg', 'asdf/asdf_asdf.jpg'],
          ['asdf/asdf/asdf.jpg', 'xxxasdf/asdf.jpgxxx']);
      });

      it('should match ** parts', () => {
        testGlob('asdf/**.jpg', // treated like two consecutive single `*`s
          ['asdf/.jpg', 'asdf/asdf.jpg', 'asdf/asdf_asdf.jpg'],
          ['asdf/a/.jpg', 'asdf/a/b.jpg', '/asdf/asdf.jpg', 'asdff/asdf.jpg', 'xxxasdf/asdf.jpg', 'asdf/asdf.jpgxxx']);
      });

      it('should match **/ and /**/', () => {
        testGlob('**/*.js',
          ['asdf.js', 'asdf/asdf.js', 'asdf/asdf/asdfasdf_asdf.js', '/asdf/asdf.js', '/asdf/aasdf-asdf.2.1.4.js'],
          ['asdf/asdf.jpg', '/asdf/asdf.jpg']);
        testGlob('aaa/**/bbb',
          ['aaa/xxx/bbb', 'aaa/xxx/yyy/bbb', 'aaa/bbb'],
          ['/aaa/xxx/bbb', 'aaa/x/bbb/', 'aaa/bbb/ccc']);
      });

      it('should match choice groups', () => {
        testGlob('aaa/*.@(bbb|ccc)',
          ['aaa/aaa.bbb', 'aaa/aaa_aaa.ccc'],
          ['/aaa/aaa.bbb', 'aaaf/aaa.bbb', 'aaa/aaa.ddd']);

        testGlob('aaa/*(bbb|ccc)',
          ['aaa/', 'aaa/bbb', 'aaa/ccc', 'aaa/bbbbbb', 'aaa/bbbccc', 'aaa/cccbbb', 'aaa/bbbcccbbb'],
          ['aaa/aaa', 'aaa/bbbb']);

        testGlob('aaa/+(bbb|ccc)',
          ['aaa/bbb', 'aaa/ccc', 'aaa/bbbbbb', 'aaa/bbbccc', 'aaa/cccbbb', 'aaa/bbbcccbbb'],
          ['aaa/', 'aaa/aaa', 'aaa/bbbb']);

        testGlob('aaa/?(bbb|ccc)',
          ['aaa/', 'aaa/bbb', 'aaa/ccc'],
          ['aaa/aaa', 'aaa/bbbb', 'aaa/bbbbbb', 'aaa/bbbccc', 'aaa/cccbbb', 'aaa/bbbcccbbb']);
      });

      it('should error on non-supported choice groups', () => {
        expect(() => FirebaseRedirectSource.fromGlobPattern('/!(a|b)/c'))
          .toThrowError('Error in FirebaseRedirectSource: "/!(a|b)/c" - "not" expansions are not supported: "!(a|b)"');
        expect(() => FirebaseRedirectSource.fromGlobPattern('/(a|b)/c'))
        .toThrowError('Error in FirebaseRedirectSource: "/(a|b)/c" - unknown expansion type: "/" in "/(a|b)"');
        expect(() => FirebaseRedirectSource.fromGlobPattern('/&(a|b)/c'))
          .toThrowError('Error in FirebaseRedirectSource: "/&(a|b)/c" - unknown expansion type: "&" in "&(a|b)"');
      });

      // Globs that contain params are tested via the match tests below
    });

    describe('(using regex)', () => {
      it('should match simple regexes', () => {
        testRegex('^asdf/[^/]*\\.jpg$',
          ['asdf/.jpg', 'asdf/asdf.jpg', 'asdf/asdf_asdf.jpg'],
          ['asdf/asdf/asdf.jpg', 'xxxasdf/asdf.jpgxxx', 'asdf/asdf_jpg']);
      });

      it('should match regexes with capture groups', () => {
        testRegex('asdf/([^/]+)\\.jpg$',
          ['asdf/asdf.jpg', 'asdf/asdf_asdf.jpg', 'asdf/asdf/asdf.jpg'],
          ['asdf/.jpg', 'xxxasdf/asdf.jpgxxx', 'asdf/asdf_jpg']);
      });

      it('should match regexes with named capture groups', () => {
        testRegex('^asdf/(?P<name>[^/]*)\\.jpg$',
          ['asdf/.jpg', 'asdf/asdf.jpg', 'asdf/asdf_asdf.jpg'],
          ['asdf/asdf/asdf.jpg', 'xxxasdf/asdf.jpgxxx', 'asdf/asdf_jpg']);
      });

      it('should error on non-supported named capture group syntax', () => {
        expect(() => FirebaseRedirectSource.fromRegexPattern('/(?<foo>.*)')).toThrowError(
            'Error in FirebaseRedirectSource: "/(?<foo>.*)" - The regular expression pattern ' +
            'contains a named capture group of the format `(?<name>...)`, which is not ' +
            'compatible with the RE2 library. Use `(?P<name>...)` instead.');
      });
    });
  });

  describe('match', () => {
    describe('(using glob)', () => {
      it('should match patterns with no parameters', () => {
        testGlobMatch('/abc/def/*', {
        }, {
          '/abc/def/': {},
          '/abc/def/ghi': {},
          '/': undefined,
          '/abc': undefined,
          '/abc/def/ghi/jk;': undefined,
        });
      });

      it('should capture a simple named param', () => {
        testGlobMatch('/:abc', {
          named: ['abc']
        }, {
          '/a': {abc: 'a'},
          '/abc': {abc: 'abc'},
          '/': undefined,
          '/a/': undefined,
          '/a/b/': undefined,
          '/a/a/b': undefined,
          '/a/a/b/': undefined,
        });
        testGlobMatch('/a/:b', {
          named: ['b']
        }, {
          '/a/b': {b: 'b'},
          '/a/bcd': {b: 'bcd'},
          '/a/': undefined,
          '/a/b/': undefined,
          '/a': undefined,
          '/a//': undefined,
          '/a/a/b': undefined,
          '/a/a/b/': undefined,
        });
      });

      it('should capture a named param followed by non-word chars', () => {
        testGlobMatch('/a/:x-', {
          named: ['x']
        }, {
          '/a/b-': {x: 'b'},
          '/a/bcd-': {x: 'bcd'},
          '/a/--': {x: '-'},
          '/a': undefined,
          '/a/-': undefined,
          '/a/-/': undefined,
          '/a/': undefined,
          '/a/b/-': undefined,
          '/a/b-c': undefined,
        });
      });

      it('should capture a named param not preceded by a slash', () => {
        testGlobMatch('/a/b:x', {
          named: ['x']
        }, {
          '/a/bc': {x: 'c'},
          '/a/bcd': {x: 'cd'},
          '/a/b-c': {x: '-c'},
          '/a': undefined,
          '/a/': undefined,
          '/a/b/': undefined,
          '/a/cd': undefined,
          '/a/b/c': undefined,
        });
      });

      it('should capture multiple named params', () => {
        testGlobMatch('/a/:b/:c', {
          named: ['b', 'c']
        }, {
          '/a/b/c': {b: 'b', c: 'c'},
          '/a/bcd/efg': {b: 'bcd', c: 'efg'},
          '/a/b/c-': {b: 'b', c: 'c-'},
          '/a/': undefined,
          '/a/b/': undefined,
          '/a/b/c/': undefined,
        });
        testGlobMatch('/:a/b/:c', {
          named: ['a', 'c']
        }, {
          '/a/b/c': {a: 'a', c: 'c'},
          '/abc/b/efg': {a: 'abc', c: 'efg'},
          '/a/b/c-': {a: 'a', c: 'c-'},
          '/a/': undefined,
          '/a/b/': undefined,
          '/a/b/c/': undefined,
        });
      });

      it('should capture a simple rest param', () => {
        testGlobMatch('/:abc*', {
          rest: ['abc']
        }, {
          '/a': {abc: 'a'},
          '/a/b': {abc: 'a/b'},
          '/a/bcd': {abc: 'a/bcd'},
          '/a/': {abc: 'a/'},
          '/a/b/': {abc: 'a/b/'},
          '/a//': {abc: 'a//'},
          '/a/b/c': {abc: 'a/b/c'},
          '/a/b/c/': {abc: 'a/b/c/'},
        });
        testGlobMatch('/a/:b*', {
          rest: ['b']
        }, {
          '/a/b': {b: 'b'},
          '/a/bcd': {b: 'bcd'},
          '/a/': {b: ''},
          '/a/b/': {b: 'b/'},
          '/a': {b: undefined},
          '/a//': {b: '/'},
          '/a/a/b': {b: 'a/b'},
          '/a/a/b/': {b: 'a/b/'},
        });
      });

      it('should capture a rest param not preceded by a slash', () => {
        testGlobMatch('/a:bc*', {
          rest: ['bc']
        }, {
          '/ab': {bc: 'b'},
          '/a/b': {bc: '/b'},
          '/a/bcd': {bc: '/bcd'},
          '/a/b/c': {bc: '/b/c'},
          '/a//': {bc: '//'},
          '/ab/c': {bc: 'b/c'},
          '/ab/c/': {bc: 'b/c/'},
          '/a': {bc: undefined},
          '/bc': undefined,
        });

        testGlobMatch('/a/b:c*', {
          rest: ['c']
        }, {
          '/a/bc': {c: 'c'},
          '/a/bcd': {c: 'cd'},
          '/a/b/': {c: '/'},
          '/a/b/c/': {c: '/c/'},
          '/a/ba/c': {c: 'a/c'},
          '/a/ba/c/': {c: 'a/c/'},
          '/a/b': {c: undefined},
          '/a/': undefined,
        });
      });

      it('should capture a rest param mixed with a named param', () => {
        testGlobMatch('/:abc/:rest*', {
          named: ['abc'],
          rest: ['rest']
        }, {
          '/a': {abc: 'a', rest: undefined},
          '/a/b': {abc: 'a', rest: 'b'},
          '/a/bcd': {abc: 'a', rest: 'bcd'},
          '/a/': {abc: 'a', rest: ''},
          '/a/b/': {abc: 'a', rest: 'b/'},
          '/a//': {abc: 'a', rest: '/'},
          '/a/b/c': {abc: 'a', rest: 'b/c'},
          '/a/b/c/': {abc: 'a', rest: 'b/c/'},
        });
      });
    });

    describe('(using regex)', () => {
      it('should match patterns with no parameters', () => {
        testRegexMatch('^/abc/def/[^/]*$', {
        }, {
          '/abc/def/': {},
          '/abc/def/ghi': {},
          '/': undefined,
          '/abc': undefined,
          '/abc/def/ghi/jk;': undefined,
        });
      });

      it('should capture a simple named group', () => {
        testRegexMatch('^/(?P<abc>[^/]+)$', {
          named: ['abc'],
        }, {
          '/a': {abc: 'a'},
          '/abc': {abc: 'abc'},
          '/': undefined,
          '/a/': undefined,
          '/a/b/': undefined,
          '/a/a/b': undefined,
          '/a/a/b/': undefined,
        });
        testRegexMatch('^/a/(?P<b>[^/]+)$', {
          named: ['b'],
        }, {
          '/a/b': {b: 'b'},
          '/a/bcd': {b: 'bcd'},
          '/a/': undefined,
          '/a/b/': undefined,
          '/a': undefined,
          '/a//': undefined,
          '/a/a/b': undefined,
          '/a/a/b/': undefined,
        });
      });

      it('should capture a named group followed by non-word chars', () => {
        testRegexMatch('^/a/(?P<x>[^/]+)-$', {
          named: ['x']
        }, {
          '/a/b-': {x: 'b'},
          '/a/bcd-': {x: 'bcd'},
          '/a/--': {x: '-'},
          '/a': undefined,
          '/a/-': undefined,
          '/a/-/': undefined,
          '/a/': undefined,
          '/a/b/-': undefined,
          '/a/b-c': undefined,
        });
      });

      it('should capture multiple named capture groups', () => {
        testRegexMatch('^/a/(?P<b>[^/]+)/(?P<c>[^/]+)$', {
          named: ['b', 'c']
        }, {
          '/a/b/c': {b: 'b', c: 'c'},
          '/a/bcd/efg': {b: 'bcd', c: 'efg'},
          '/a/b/c-': {b: 'b', c: 'c-'},
          '/a/': undefined,
          '/a/b/': undefined,
          '/a/b/c/': undefined,
        });
        testRegexMatch('^/(?P<a>[^/]+)/b/(?P<c>[^/]+)$', {
          named: ['a', 'c']
        }, {
          '/a/b/c': {a: 'a', c: 'c'},
          '/abc/b/efg': {a: 'abc', c: 'efg'},
          '/a/b/c-': {a: 'a', c: 'c-'},
          '/a/': undefined,
          '/a/b/': undefined,
          '/a/b/c/': undefined,
        });
      });
    });
  });
});

function testGlob(pattern: string, matches: string[], nonMatches: string[]) {
  return testSource(FirebaseRedirectSource.fromGlobPattern(pattern), matches, nonMatches);
}

function testRegex(pattern: string, matches: string[], nonMatches: string[]) {
  return testSource(FirebaseRedirectSource.fromRegexPattern(pattern), matches, nonMatches);
}

function testSource(source: FirebaseRedirectSource, matches: string[], nonMatches: string[]) {
  matches.forEach(url => expect(source.test(url)).toBe(true, url));
  nonMatches.forEach(url => expect(source.test(url)).toBe(false, url));
}

function testGlobMatch(
    pattern: string,
    captures: { named?: string[], rest?: string[] },
    matches: { [url: string]: object|undefined }) {
  return testSourceMatch(FirebaseRedirectSource.fromGlobPattern(pattern), captures, matches);
}

function testRegexMatch(
    pattern: string,
    captures: { named?: string[], rest?: string[] },
    matches: { [url: string]: object|undefined }) {
  return testSourceMatch(FirebaseRedirectSource.fromRegexPattern(pattern), captures, matches);
}

function testSourceMatch(
    source: FirebaseRedirectSource,
    captures: { named?: string[], rest?: string[] },
    matches: { [url: string]: object|undefined }) {
  expect(source.namedGroups).toEqual(captures.named || []);
  expect(source.restNamedGroups).toEqual(captures.rest || []);
  Object.keys(matches).forEach(url => expect(source.match(url)).toEqual(matches[url]));
}
