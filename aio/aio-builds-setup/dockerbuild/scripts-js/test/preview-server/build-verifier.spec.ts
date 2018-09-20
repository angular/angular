// Imports
import {GithubApi} from '../../lib/common/github-api';
import {GithubPullRequests, PullRequest} from '../../lib/common/github-pull-requests';
import {GithubTeams} from '../../lib/common/github-teams';
import {BuildVerifier} from '../../lib/preview-server/build-verifier';

// Tests
describe('BuildVerifier', () => {
  const defaultConfig = {
    allowedTeamSlugs: ['team1', 'team2'],
    githubOrg: 'organization',
    githubRepo: 'repo',
    githubToken: 'githubToken',
    secret: 'secret',
    trustedPrLabel: 'trusted: pr-label',
  };
  let prs: GithubPullRequests;
  let bv: BuildVerifier;

  // Helpers
  const createBuildVerifier = (partialConfig: Partial<typeof defaultConfig> = {}) => {
    const cfg = {...defaultConfig, ...partialConfig} as typeof defaultConfig;
    const api = new GithubApi(cfg.githubToken);
    prs = new GithubPullRequests(api, cfg.githubOrg, cfg.githubRepo);
    const teams = new GithubTeams(api, cfg.githubOrg);
    return new BuildVerifier(prs, teams, cfg.allowedTeamSlugs, cfg.trustedPrLabel);
  };

  beforeEach(() => bv = createBuildVerifier());


  describe('constructor()', () => {

    ['githubToken', 'githubRepo', 'githubOrg', 'allowedTeamSlugs', 'trustedPrLabel'].
      forEach(param => {
        it(`should throw if '${param}' is missing or empty`, () => {
          expect(() => createBuildVerifier({[param]: ''})).
            toThrowError(`Missing or empty required parameter '${param}'!`);
        });
      });


    it('should throw if \'allowedTeamSlugs\' is an empty array', () => {
      expect(() => createBuildVerifier({allowedTeamSlugs: []})).
        toThrowError('Missing or empty required parameter \'allowedTeamSlugs\'!');
    });

  });


  describe('getSignificantFilesChanged', () => {
    it('should return false if none of the fetched files match the given pattern', async () => {
      const fetchFilesSpy = spyOn(prs, 'fetchFiles');
      fetchFilesSpy.and.callFake(() => Promise.resolve([{filename: 'a/b/c'}, {filename: 'd/e/f'}]));
      expect(await bv.getSignificantFilesChanged(777, /^x/)).toEqual(false);
      expect(fetchFilesSpy).toHaveBeenCalledWith(777);

      fetchFilesSpy.calls.reset();
      expect(await bv.getSignificantFilesChanged(777, /^a/)).toEqual(true);
      expect(fetchFilesSpy).toHaveBeenCalledWith(777);
    });
  });


  describe('getPrIsTrusted()', () => {
    const pr = 9;
    let mockPrInfo: PullRequest;
    let prsFetchSpy: jasmine.Spy;
    let teamsIsMemberBySlugSpy: jasmine.Spy;

    beforeEach(() => {
      mockPrInfo = {
        labels: [
          {name: 'foo'},
          {name: 'bar'},
        ],
        number: 9,
        user: {login: 'username'},
      };

      prsFetchSpy = spyOn(GithubPullRequests.prototype, 'fetch').
        and.callFake(() => Promise.resolve(mockPrInfo));

      teamsIsMemberBySlugSpy = spyOn(GithubTeams.prototype, 'isMemberBySlug').
        and.callFake(() => Promise.resolve(true));
    });


    it('should return a promise', done => {
      const promise = bv.getPrIsTrusted(pr);
      promise.then(done);   // Do not complete the test (and release the spies) synchronously
                            // to avoid running the actual `GithubTeams#isMemberBySlug()`.

      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should fetch the corresponding PR', done => {
      bv.getPrIsTrusted(pr).then(() => {
        expect(prsFetchSpy).toHaveBeenCalledWith(pr);
        done();
      });
    });


    it('should fail if fetching the PR errors', done => {
      prsFetchSpy.and.callFake(() => Promise.reject('Test'));
      bv.getPrIsTrusted(pr).catch(err => {
        expect(err).toBe('Test');
        done();
      });
    });


    describe('when the PR has the "trusted PR" label', () => {

      beforeEach(() => mockPrInfo.labels.push({name: 'trusted: pr-label'}));


      it('should resolve to true', done => {
        bv.getPrIsTrusted(pr).then(isTrusted => {
          expect(isTrusted).toBe(true);
          done();
        });
      });


      it('should not try to verify the author\'s membership status', done => {
        bv.getPrIsTrusted(pr).then(() => {
          expect(teamsIsMemberBySlugSpy).not.toHaveBeenCalled();
          done();
        });
      });

    });


    describe('when the PR does not have the "trusted PR" label', () => {

      it('should verify the PR author\'s membership in the specified teams', done => {
        bv.getPrIsTrusted(pr).then(() => {
          expect(teamsIsMemberBySlugSpy).toHaveBeenCalledWith('username', ['team1', 'team2']);
          done();
        });
      });


      it('should fail if verifying membership errors', done => {
        teamsIsMemberBySlugSpy.and.callFake(() => Promise.reject('Test'));
        bv.getPrIsTrusted(pr).catch(err => {
          expect(err).toBe('Test');
          done();
        });
      });


      it('should resolve to true if the PR\'s author is a member', done => {
        teamsIsMemberBySlugSpy.and.callFake(() => Promise.resolve(true));

        bv.getPrIsTrusted(pr).then(isTrusted => {
          expect(isTrusted).toBe(true);
          done();
        });
      });


      it('should resolve to false if the PR\'s author is not a member', done => {
        teamsIsMemberBySlugSpy.and.callFake(() => Promise.resolve(false));

        bv.getPrIsTrusted(pr).then(isTrusted => {
          expect(isTrusted).toBe(false);
          done();
        });
      });

    });

  });

});
