import { FirebaseRedirect } from './FirebaseRedirect';

describe('FirebaseRedirect', () => {
  describe('replace', () => {
    it('should return undefined if the redirect does not match the url', () => {
      const redirect = new FirebaseRedirect({source: '/a/b/c', destination: '/x/y/z'});
      expect(redirect.replace('/1/2/3')).toBe(undefined);
    });

    it('should return the destination if there is a match', () => {
      const redirect = new FirebaseRedirect({source: '/a/b/c', destination: '/x/y/z'});
      expect(redirect.replace('/a/b/c')).toBe('/x/y/z');
    });

    it('should inject name params into the destination', () => {
      const redirect = new FirebaseRedirect({source: '/api/:package/:api-*', destination: '<:package><:api>'});
      expect(redirect.replace('/api/common/NgClass-directive')).toEqual('<common><NgClass>');
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
