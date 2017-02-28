// Imports
import {GithubPullRequests} from '../../lib/common/github-pull-requests';

// Tests
describe('GithubPullRequests', () => {

  describe('constructor()', () => {

    it('should throw if \'githubToken\' is missing or empty', () => {
      expect(() => new GithubPullRequests('', 'foo/bar')).
        toThrowError('Missing or empty required parameter \'githubToken\'!');
    });


    it('should throw if \'repoSlug\' is missing or empty', () => {
      expect(() => new GithubPullRequests('12345', '')).
        toThrowError('Missing or empty required parameter \'repoSlug\'!');
    });

  });


  describe('addComment()', () => {
    let prs: GithubPullRequests;
    let deferred: {resolve: Function, reject: Function};

    beforeEach(() => {
      prs = new GithubPullRequests('12345', 'foo/bar');

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
    let prsGetPaginatedSpy: jasmine.Spy;

    beforeEach(() => {
      prs = new GithubPullRequests('12345', 'foo/bar');
      prsGetPaginatedSpy = spyOn(prs as any, 'getPaginated');
      spyOn(console, 'log');
    });


    it('should call \'getPaginated()\' with the correct pathname and params', () => {
      const expectedPathname = '/repos/foo/bar/pulls';

      prs.fetchAll('all');
      prs.fetchAll('closed');
      prs.fetchAll('open');

      expect(prsGetPaginatedSpy).toHaveBeenCalledTimes(3);
      expect(prsGetPaginatedSpy.calls.argsFor(0)).toEqual([expectedPathname, {state: 'all'}]);
      expect(prsGetPaginatedSpy.calls.argsFor(1)).toEqual([expectedPathname, {state: 'closed'}]);
      expect(prsGetPaginatedSpy.calls.argsFor(2)).toEqual([expectedPathname, {state: 'open'}]);
    });


    it('should default to \'all\' if no state is specified', () => {
      prs.fetchAll();
      expect(prsGetPaginatedSpy).toHaveBeenCalledWith('/repos/foo/bar/pulls', {state: 'all'});
    });


    it('should forward the value returned by \'getPaginated()\'', () => {
      prsGetPaginatedSpy.and.returnValue('Test');
      expect(prs.fetchAll()).toBe('Test');
    });

  });

});
