// Imports
import {GithubApi} from '../../lib/common/github-api';
import {GithubPullRequests} from '../../lib/common/github-pull-requests';

// Tests
describe('GithubPullRequests', () => {
  let githubApi: jasmine.SpyObj<GithubApi>;

  beforeEach(() => {
    githubApi = jasmine.createSpyObj('githubApi', ['post', 'get', 'getPaginated']);
  });


  describe('constructor()', () => {

    it('should throw if \'githubOrg\' is missing or empty', () => {
      expect(() => new GithubPullRequests(githubApi, '', 'bar')).
        toThrowError('Missing or empty required parameter \'githubOrg\'!');
    });


    it('should throw if \'githubRepo\' is missing or empty', () => {
      expect(() => new GithubPullRequests(githubApi, 'foo', '')).
        toThrowError('Missing or empty required parameter \'githubRepo\'!');
    });

  });


  describe('addComment()', () => {
    let prs: GithubPullRequests;

    beforeEach(() => {
      prs = new GithubPullRequests(githubApi, 'foo', 'bar');
    });


    it('should throw if the PR number is invalid', () => {
      expect(() => prs.addComment(-1337, 'body')).toThrowError(`Invalid PR number: -1337`);
      expect(() => prs.addComment(NaN, 'body')).toThrowError(`Invalid PR number: NaN`);
    });


    it('should throw if the comment body is invalid or empty', () => {
      expect(() => prs.addComment(42, '')).toThrowError(`Invalid or empty comment body: `);
    });


    it('should make a POST request to Github with the correct pathname, params and data', () => {
      githubApi.post.and.callFake(() => Promise.resolve());
      prs.addComment(42, 'body');
      expect(githubApi.post).toHaveBeenCalledWith('/repos/foo/bar/issues/42/comments', null, {body: 'body'});
    });


    it('should reject if the request fails', done => {
      githubApi.post.and.callFake(() => Promise.reject('Test'));
      prs.addComment(42, 'body').catch(err => {
        expect(err).toBe('Test');
        done();
      });
    });


    it('should resolve with the data from the Github POST', done => {
      githubApi.post.and.callFake(() => Promise.resolve('Test'));
      prs.addComment(42, 'body').then(data => {
        expect(data).toBe('Test');
        done();
      });
    });

  });


  describe('fetch()', () => {
    let prs: GithubPullRequests;

    beforeEach(() => {
      prs = new GithubPullRequests(githubApi, 'foo', 'bar');
    });


    it('should make a GET request to GitHub with the correct pathname', () => {
      prs.fetch(42);
      expect(githubApi.get).toHaveBeenCalledWith('/repos/foo/bar/issues/42');
    });


    it('should resolve with the data returned from GitHub', done => {
      const expected: any = {number: 42};
      githubApi.get.and.callFake(() => Promise.resolve(expected));
      prs.fetch(42).then(data => {
        expect(data).toEqual(expected);
        done();
      });
    });

  });


  describe('fetchAll()', () => {
    let prs: GithubPullRequests;

    beforeEach(() => prs = new GithubPullRequests(githubApi, 'foo', 'bar'));


    it('should call \'getPaginated()\' with the correct pathname and params', () => {
      const expectedPathname = '/repos/foo/bar/pulls';

      prs.fetchAll('all');
      prs.fetchAll('closed');
      prs.fetchAll('open');

      expect(githubApi.getPaginated).toHaveBeenCalledTimes(3);
      expect(githubApi.getPaginated.calls.argsFor(0)).toEqual([expectedPathname, {state: 'all'}]);
      expect(githubApi.getPaginated.calls.argsFor(1)).toEqual([expectedPathname, {state: 'closed'}]);
      expect(githubApi.getPaginated.calls.argsFor(2)).toEqual([expectedPathname, {state: 'open'}]);
    });


    it('should default to \'all\' if no state is specified', () => {
      prs.fetchAll();
      expect(githubApi.getPaginated).toHaveBeenCalledWith('/repos/foo/bar/pulls', {state: 'all'});
    });


    it('should forward the value returned by \'getPaginated()\'', () => {
      githubApi.getPaginated.and.returnValue('Test');
      expect(prs.fetchAll() as any).toBe('Test');
    });

  });


  describe('fetchFiles()', () => {
    let prs: GithubPullRequests;

    beforeEach(() => {
      prs = new GithubPullRequests(githubApi, 'foo', 'bar');
    });


    it('should make a paginated GET request to GitHub with the correct pathname', () => {
      prs.fetchFiles(42);
      expect(githubApi.getPaginated).toHaveBeenCalledWith('/repos/foo/bar/pulls/42/files');
    });


    it('should resolve with the data returned from GitHub', done => {
      const expected: any = [{sha: 'ABCDE', filename: 'a/b/c'}, {sha: '12345', filename: 'x/y/z'}];
      githubApi.getPaginated.and.callFake(() => Promise.resolve(expected));
      prs.fetchFiles(42).then(data => {
        expect(data).toEqual(expected);
        done();
      });
    });

  });

});
