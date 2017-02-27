// Imports
import {GithubPullRequests} from '../../lib/common/github-pull-requests';

// Tests
describe('GithubPullRequests', () => {

  describe('constructor()', () => {

    it('should throw if \'repoSlug\' is missing or empty', () => {
      expect(() => new GithubPullRequests('', '12345')).
        toThrowError('Missing or empty required parameter \'repoSlug\'!');
    });


    it('should throw if \'githubToken\' is missing or empty', () => {
      expect(() => new GithubPullRequests('foo/bar', '')).
        toThrowError('Missing or empty required parameter \'githubToken\'!');
    });

  });


  describe('addComment()', () => {
    let prs: GithubPullRequests;
    let deferred: {resolve: Function, reject: Function};

    beforeEach(() => {
      prs = new GithubPullRequests('foo/bar', '12345');

      spyOn(prs, 'post').and.callFake(() => new Promise((resolve, reject) => deferred = {resolve, reject}));
    });


    it('should return a promise', () => {
      expect(prs.addComment(42, 'body')).toEqual(jasmine.any(Promise));
    });


    it('should throw if the PR number is invalid', () => {
      expect(() => prs.addComment(-1337, 'body')).toThrowError(`Invalid PR number: -1337`);
      expect(() => prs.addComment(NaN, 'body')).toThrowError(`Invalid PR number: NaN`);
    });


    it('should throw if the comment body is invalid or empty', () => {
      expect(() => prs.addComment(42, '')).toThrowError(`Invalid or empty comment body: `);
    });


    it('should call \'post()\' with the correct pathname, params and data', () => {
      prs.addComment(42, 'body');

      expect(prs.post).toHaveBeenCalledWith('/repos/foo/bar/issues/42/comments', null, {body: 'body'});
    });


    it('should reject if the request fails', done => {
      prs.addComment(42, 'body').catch(err => {
        expect(err).toBe('Test');
        done();
      });

      deferred.reject('Test');
    });


    it('should resolve with the returned response', done => {
      prs.addComment(42, 'body').then(data => {
        expect(data).toEqual('Test');
        done();
      });

      deferred.resolve('Test');
    });

  });


  describe('fetchAll()', () => {
    let prs: GithubPullRequests;
    let deferreds: {resolve: Function, reject: Function}[];

    beforeEach(() => {
      prs = new GithubPullRequests('foo/bar', '12345');
      deferreds = [];

      spyOn(process.stdout, 'write');
      spyOn(prs, 'get').and.callFake(() => new Promise((resolve, reject) => deferreds.push({resolve, reject})));
    });


    it('should return a promise', () => {
      expect(prs.fetchAll()).toEqual(jasmine.any(Promise));
    });


    it('should call \'get()\' with the correct pathname and params', () => {
      prs.fetchAll('open');

      expect(prs.get).toHaveBeenCalledWith('/repos/foo/bar/pulls', {
        page: 0,
        per_page: 100,
        state: 'open',
      });
    });


    it('should default to \'all\' if no state is specified', () => {
      prs.fetchAll();

      expect(prs.get).toHaveBeenCalledWith('/repos/foo/bar/pulls', {
        page: 0,
        per_page: 100,
        state: 'all',
      });
    });


    it('should reject if the request fails', done => {
      prs.fetchAll().catch(err => {
        expect(err).toBe('Test');
        done();
      });

      deferreds[0].reject('Test');
    });


    it('should resolve with the returned pull requests', done => {
      const pullRequests = [{id: 1}, {id: 2}];

      prs.fetchAll().then(data => {
        expect(data).toEqual(pullRequests);
        done();
      });

      deferreds[0].resolve(pullRequests);
    });


    it('should iteratively call \'get()\' to fetch all pull requests', done => {
      // Create an array or 250 objects.
      const allPullRequests = '.'.repeat(250).split('').map((_, i) => ({id: i}));
      const prsGetApy = prs.get as jasmine.Spy;

      prs.fetchAll().then(data => {
        const paramsForPage = (page: number) => ({page, per_page: 100, state: 'all'});

        expect(prsGetApy).toHaveBeenCalledTimes(3);
        expect(prsGetApy.calls.argsFor(0)).toEqual(['/repos/foo/bar/pulls', paramsForPage(0)]);
        expect(prsGetApy.calls.argsFor(1)).toEqual(['/repos/foo/bar/pulls', paramsForPage(1)]);
        expect(prsGetApy.calls.argsFor(2)).toEqual(['/repos/foo/bar/pulls', paramsForPage(2)]);

        expect(data).toEqual(allPullRequests);

        done();
      });

      deferreds[0].resolve(allPullRequests.slice(0, 100));
      setTimeout(() => {
        deferreds[1].resolve(allPullRequests.slice(100, 200));
        setTimeout(() => deferreds[2].resolve(allPullRequests.slice(200)), 0);
      }, 0);
    });

  });

});
