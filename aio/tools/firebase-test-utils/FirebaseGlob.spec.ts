import { FirebaseGlob } from './FirebaseGlob';

describe('FirebaseGlob', () => {

  describe('test', () => {
    it('should match * parts', () => {
      testGlob('asdf/*.jpg',
        ['asdf/asdf.jpg', 'asdf/asdf_asdf.jpg', 'asdf/.jpg'],
        ['asdf/asdf/asdf.jpg', 'xxxasdf/asdf.jpgxxx']);
    });

    it('should match ** parts', () => {
      testGlob('asdf/**.jpg',
        ['asdf/asdf.jpg', 'asdf/asdf_asdf.jpg', 'asdf/asdf/asdf.jpg', 'asdf/asdf/asdf/asdf/asdf.jpg'],
        ['/asdf/asdf.jpg', 'asdff/asdf.jpg', 'xxxasdf/asdf.jpgxxx']);

      testGlob('**/*.js',
        ['asdf/asdf.js', 'asdf/asdf/asdfasdf_asdf.js', '/asdf/asdf.js', '/asdf/aasdf-asdf.2.1.4.js'],
        ['/asdf/asdf.jpg', 'asdf.js']);
    });

    it('should match groups', () => {
      testGlob('asdf/*.(jpg|jpeg)',
        ['asdf/asdf.jpg', 'asdf/asdf_asdf.jpeg'],
        ['/asdf/asdf.jpg', 'asdff/asdf.jpg']);
    });

    it('should match named parts', () => {
      testGlob('/api/:package/:api-*',
        ['/api/common/NgClass-directive', '/api/core/Renderer-class'],
        ['/moo/common/NgClass-directive', '/api/common/', '/api/common/NgClass']);
    });

    it('should match wildcard named parts', () => {
      testGlob('/api/:rest*',
      ['/api/a', '/api/a/b'],
      ['/apx/a', '/apx/a/b']);
    });
  });

  describe('match', () => {
    it('should extract the named parts', () => {
      const glob = new FirebaseGlob('/api/:package/:api-*');
      const match: any = glob.match('/api/common/NgClass-directive');
      expect(match).toEqual({package: 'common', api: 'NgClass'});
    });
  });
});

function testGlob(pattern: string, matches: string[], nonMatches: string[]) {
  const glob = new FirebaseGlob(pattern);
  matches.forEach(url => expect(glob.test(url)).toBe(true, url));
  nonMatches.forEach(url => expect(glob.test(url)).toBe(false, url));
}
