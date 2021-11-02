import { FirebaseRedirect } from './FirebaseRedirect';

describe('FirebaseRedirect', () => {
  describe('replace', () => {
    it('should return undefined if the redirect does not match the url', () => {
      const globRedirect = new FirebaseRedirect({source: '/a/b/c', destination: '/x/y/z'});
      expect(globRedirect.replace('/1/2/3')).toBe(undefined);

      const regexRedirect = new FirebaseRedirect({regex: '^/a/b/c$', destination: '/x/y/z'});
      expect(regexRedirect.replace('/1/2/3')).toBe(undefined);
    });

    it('should return the destination if there is a match', () => {
      const globRedirect = new FirebaseRedirect({source: '/a/b/c', destination: '/x/y/z'});
      expect(globRedirect.replace('/a/b/c')).toBe('/x/y/z');

      const regexRedirect = new FirebaseRedirect({regex: '^/a/b/c$', destination: '/x/y/z'});
      expect(regexRedirect.replace('/a/b/c')).toBe('/x/y/z');
    });

    it('should inject name params into the destination', () => {
      const globRedirect = new FirebaseRedirect({source: '/api/:package/:api-*', destination: '<:package><:api>'});
      expect(globRedirect.replace('/api/common/NgClass-directive')).toBe('<common><NgClass>');

      const regexRedirect = new FirebaseRedirect(
          {regex: '^/api/(?P<package>[^/]+)/(?P<api>[^/]+)-.*$', destination: '<:package><:api>'});
      expect(regexRedirect.replace('/api/common/NgClass-directive')).toBe('<common><NgClass>');
    });

    it('should inject rest params into the destination', () => {
      const redirect = new FirebaseRedirect({source: '/a/:rest*', destination: '/x/:rest*/y'});
      expect(redirect.replace('/a/b/c')).toEqual('/x/b/c/y');
    });

    it('should inject both named and rest parameters into the destination', () => {
      const redirect = new FirebaseRedirect({source: '/:a/:rest*', destination: '/x/:a/y/:rest*/z'});
      expect(redirect.replace('/a/b/c')).toEqual('/x/a/y/b/c/z');
    });
  });
});
