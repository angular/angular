import { FirebaseGlob } from './FirebaseGlob';
describe('FirebaseGlob', () => {

  describe('test', () => {
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
      expect(() => new FirebaseGlob('/!(a|b)/c'))
        .toThrowError('Error in FirebaseGlob: "/!(a|b)/c" - "not" expansions are not supported: "!(a|b)"');
      expect(() => new FirebaseGlob('/(a|b)/c'))
      .toThrowError('Error in FirebaseGlob: "/(a|b)/c" - unknown expansion type: "/" in "/(a|b)"');
      expect(() => new FirebaseGlob('/&(a|b)/c'))
        .toThrowError('Error in FirebaseGlob: "/&(a|b)/c" - unknown expansion type: "&" in "&(a|b)"');
    });

    // Globs that contain params tested via the match tests below
  });

  describe('match', () => {
    it('should match patterns with no parameters', () => {
      testMatch('/abc/def/*', {
      }, {
        '/abc/def/': {},
        '/abc/def/ghi': {},
        '/': undefined,
        '/abc': undefined,
        '/abc/def/ghi/jk;': undefined,
      });
    });

    it('should capture a simple named param', () => {
      testMatch('/:abc', {
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
      testMatch('/a/:b', {
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
      testMatch('/a/:x-', {
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

    it('should capture multiple named params', () => {
      testMatch('/a/:b/:c', {
        named: ['b', 'c']
      }, {
        '/a/b/c': {b: 'b', c: 'c'},
        '/a/bcd/efg': {b: 'bcd', c: 'efg'},
        '/a/b/c-': {b: 'b', c: 'c-'},
        '/a/': undefined,
        '/a/b/': undefined,
        '/a/b/c/': undefined,
      });
      testMatch('/:a/b/:c', {
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
      testMatch('/:abc*', {
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
      testMatch('/a/:b*', {
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

    it('should capture a rest param mixed with a named param', () => {
      testMatch('/:abc/:rest*', {
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
});

function testGlob(pattern: string, matches: string[], nonMatches: string[]) {
  const glob = new FirebaseGlob(pattern);
  matches.forEach(url => expect(glob.test(url)).toBe(true, url));
  nonMatches.forEach(url => expect(glob.test(url)).toBe(false, url));
}

function testMatch(pattern: string, captures: { named?: string[], rest?: string[] }, matches: { [url: string]: object|undefined }) {
  const glob = new FirebaseGlob(pattern);
  expect(Object.keys(glob.namedParams)).toEqual(captures.named || []);
  expect(Object.keys(glob.restParams)).toEqual(captures.rest || []);
  Object.keys(matches).forEach(url => expect(glob.match(url)).toEqual(matches[url]));
}
