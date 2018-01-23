import { FirebaseRedirect } from './FirebaseRedirect';

describe('FirebaseRedirect', () => {
  describe('replace', () => {
    it('should inject the named captures into the destination', () => {
      const redirect = new FirebaseRedirect('/api/:package/:api-*', '<:package><:api>');
      const newUrl = redirect.replace('/api/common/NgClass-directive');
      expect(newUrl).toEqual('<common><NgClass>');
    });

    it('should handle empty ** sections', () => {
      const redirect2 = new FirebaseRedirect('/**/a/b', '/xxx');
      expect(redirect2.replace('/a/b')).toEqual('/xxx');
    });

    it('should return `undefined` if the redirect failed to match', () => {
      const redirect = new FirebaseRedirect('/api/:package/:api-*', '<:package><:api>');
      const newUrl = redirect.replace('/common/NgClass-directive');
      expect(newUrl).toBe(undefined);
    });
  });
});