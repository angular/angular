import { FirebaseRedirector } from './FirebaseRedirector';

describe('FirebaseRedirector', () => {
  it('should replace with the first matching redirect', () => {
    const redirector = new FirebaseRedirector([
      { source: '/a/b/c', destination: '/X/Y/Z' },
      { regex: '^/a/(?P<foo>[^/]+)/c$', destination: '/X/:foo/Z' },
      { source: '/**/:foo/c', destination: '/A/:foo/zzz' },
    ]);
    expect(redirector.redirect('/a/b/c')).toEqual('/X/Y/Z');
    expect(redirector.redirect('/a/moo/c')).toEqual('/X/moo/Z');
    expect(redirector.redirect('/x/y/a/b/c')).toEqual('/A/b/zzz');
    expect(redirector.redirect('/x/y/c')).toEqual('/A/y/zzz');
  });

  it('should return the original url if no redirect matches', () => {
    const redirector = new FirebaseRedirector([
      { regex: '^x$', destination: 'X' },
      { source: 'y', destination: 'Y' },
      { regex: '^z$', destination: 'Z' },
    ]);
    expect(redirector.redirect('a')).toEqual('a');
  });

  it('should recursively redirect', () => {
    const redirector = new FirebaseRedirector([
      { source: 'a', destination: 'b' },
      { regex: '^b$', destination: 'c' },
      { source: 'c', destination: 'd' },
    ]);
    expect(redirector.redirect('a')).toEqual('d');
  });

  it('should throw if stuck in an infinite loop', () => {
    const redirector = new FirebaseRedirector([
      { regex: '^a$', destination: 'b' },
      { source: 'b', destination: 'c' },
      { regex: '^c$', destination: 'a' },
    ]);
    expect(() => redirector.redirect('a')).toThrowError('infinite redirect loop');
  });

  it('should keep track of unused redirects', () => {
    const redirects = [
      { source: '/a', destination: '/A' },
      { regex: '^/b$', destination: '/B' },
      { source: '/c', destination: '/C' },
    ];
    const redirector = new FirebaseRedirector(redirects);

    expect(redirector.unusedRedirectConfigs).toEqual([redirects[0], redirects[1], redirects[2]]);

    redirector.redirect('/a');
    expect(redirector.unusedRedirectConfigs).toEqual([redirects[1], redirects[2]]);

    redirector.redirect('/not-redirected');
    expect(redirector.unusedRedirectConfigs).toEqual([redirects[1], redirects[2]]);

    redirector.redirect('/b');
    redirector.redirect('/c');
    expect(redirector.unusedRedirectConfigs).toEqual([]);
  });
});
