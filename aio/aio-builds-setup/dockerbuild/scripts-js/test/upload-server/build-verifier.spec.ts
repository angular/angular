// Imports
import * as jwt from 'jsonwebtoken';
import {GithubPullRequests} from '../../lib/common/github-pull-requests';
import {GithubTeams} from '../../lib/common/github-teams';
import {BuildVerifier} from '../../lib/upload-server/build-verifier';
import {expectToBeUploadError} from './helpers';

// Tests
describe('BuildVerifier', () => {
  const defaultConfig = {
    allowedTeamSlugs: ['team1', 'team2'],
    githubToken: 'githubToken',
    organization: 'organization',
    repoSlug: 'repo/slug',
    secret: 'secret',
  };
  let bv: BuildVerifier;

  // Helpers
  const createBuildVerifier = (partialConfig: Partial<typeof defaultConfig> = {}) => {
    const cfg = {...defaultConfig, ...partialConfig};
    return new BuildVerifier(cfg.secret, cfg.githubToken, cfg.repoSlug, cfg.organization,
                             cfg.allowedTeamSlugs);
  };

  beforeEach(() => bv = createBuildVerifier());


  describe('constructor()', () => {

    ['secret', 'githubToken', 'repoSlug', 'organization', 'allowedTeamSlugs'].forEach(param => {
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


  describe('verify()', () => {
    const pr = 9;
    const defaultJwt = {
      'exp': Math.floor(Date.now() / 1000) + 30,
      'iat': Math.floor(Date.now() / 1000) - 30,
      'iss': 'Travis CI, GmbH',
      'pull-request': pr,
      'slug': defaultConfig.repoSlug,
    };
    let bvGetPrAuthorTeamMembership: jasmine.Spy;

    // Heleprs
    const createAuthHeader = (partialJwt: Partial<typeof defaultJwt> = {}, secret: string = defaultConfig.secret) =>
      `Token ${jwt.sign({...defaultJwt, ...partialJwt}, secret)}`;

    beforeEach(() => {
      bvGetPrAuthorTeamMembership = spyOn(bv, 'getPrAuthorTeamMembership').
        and.returnValue(Promise.resolve({author: 'some-author', isMember: true}));
    });


    it('should return a promise', done => {
      const promise = bv.verify(pr, createAuthHeader());
      promise.then(done);   // Do not complete the test (and release the spies) synchronously
                            // to avoid running the actual `bvGetPrAuthorTeamMembership()`.

      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should fail if the authorization header is invalid', done => {
      bv.verify(pr, 'foo').catch(err => {
        const errorMessage = 'Error while verifying upload for PR 9: jwt malformed';

        expectToBeUploadError(err, 403, errorMessage);
        done();
      });
    });


    it('should fail if the secret is invalid', done => {
      bv.verify(pr, createAuthHeader({}, 'foo')).catch(err => {
        const errorMessage = 'Error while verifying upload for PR 9: invalid signature';

        expectToBeUploadError(err, 403, errorMessage);
        done();
      });
    });


    it('should fail if the issuer is invalid', done => {
      bv.verify(pr, createAuthHeader({iss: 'not valid'})).catch(err => {
        const errorMessage = 'Error while verifying upload for PR 9: ' +
                             `jwt issuer invalid. expected: ${defaultJwt.iss}`;

        expectToBeUploadError(err, 403, errorMessage);
        done();
      });
    });


    it('should fail if the token has expired', done => {
      bv.verify(pr, createAuthHeader({exp: 0})).catch(err => {
        const errorMessage = 'Error while verifying upload for PR 9: jwt expired';

        expectToBeUploadError(err, 403, errorMessage);
        done();
      });
    });


    it('should fail if the repo slug does not match', done => {
      bv.verify(pr, createAuthHeader({slug: 'foo/bar'})).catch(err => {
        const errorMessage = 'Error while verifying upload for PR 9: ' +
                             `jwt slug invalid. expected: ${defaultConfig.repoSlug}`;

        expectToBeUploadError(err, 403, errorMessage);
        done();
      });
    });


    it('should fail if the PR does not match', done => {
      bv.verify(pr, createAuthHeader({'pull-request': 1337})).catch(err => {
        const errorMessage = 'Error while verifying upload for PR 9: ' +
                             `jwt pull-request invalid. expected: ${pr}`;

        expectToBeUploadError(err, 403, errorMessage);
        done();
      });
    });


    it('should not fail if the token is valid', done => {
      bv.verify(pr, createAuthHeader()).then(done);
    });


    it('should not fail even if the token has been issued in the future', done => {
      const in30s = Math.floor(Date.now() / 1000) + 30;
      bv.verify(pr, createAuthHeader({iat: in30s})).then(done);
    });


    it('should call \'getPrAuthorTeamMembership()\' if the token is valid', done => {
      bv.verify(pr, createAuthHeader()).then(() => {
        expect(bvGetPrAuthorTeamMembership).toHaveBeenCalledWith(pr);
        done();
      });
    });


    it('should fail if \'getPrAuthorTeamMembership()\' rejects', done => {
      bvGetPrAuthorTeamMembership.and.callFake(() => Promise.reject('Test'));
      bv.verify(pr, createAuthHeader()).catch(err => {
        expectToBeUploadError(err, 403, `Error while verifying upload for PR ${pr}: Test`);
        done();
      });
    });


    it('should fail if \'getPrAuthorTeamMembership()\' reports no membership', done => {
      const errorMessage = `Error while verifying upload for PR ${pr}: User 'test' is not an active member of any of ` +
                           'the following teams: team1, team2';

      bvGetPrAuthorTeamMembership.and.returnValue(Promise.resolve({author: 'test', isMember: false}));
      bv.verify(pr, createAuthHeader()).catch(err => {
        expectToBeUploadError(err, 403, errorMessage);
        done();
      });
    });


    it('should succeed if everything checks outs', done => {
      bv.verify(pr, createAuthHeader()).then(done);
    });

  });


  describe('getPrAuthorTeamMembership()', () => {
    const pr = 9;
    let prsFetchSpy: jasmine.Spy;
    let teamsIsMemberBySlugSpy: jasmine.Spy;

    beforeEach(() => {
      prsFetchSpy = spyOn(GithubPullRequests.prototype, 'fetch').
        and.returnValue(Promise.resolve({user: {login: 'username'}}));

      teamsIsMemberBySlugSpy = spyOn(GithubTeams.prototype, 'isMemberBySlug').
        and.returnValue(Promise.resolve(true));
    });


    it('should return a promise', done => {
      const promise = bv.getPrAuthorTeamMembership(pr);
      promise.then(done);   // Do not complete the test (and release the spies) synchronously
                            // to avoid running the actual `GithubTeams#isMemberBySlug()`.

      expect(promise).toEqual(jasmine.any(Promise));
    });


    it('should fetch the corresponding PR', done => {
      bv.getPrAuthorTeamMembership(pr).then(() => {
        expect(prsFetchSpy).toHaveBeenCalledWith(pr);
        done();
      });
    });


    it('should fail if fetching the PR errors', done => {
      prsFetchSpy.and.callFake(() => Promise.reject('Test'));
      bv.getPrAuthorTeamMembership(pr).catch(err => {
        expect(err).toBe('Test');
        done();
      });
    });


    it('should verify the PR author\'s membership in the specified teams', done => {
      bv.getPrAuthorTeamMembership(pr).then(() => {
        expect(teamsIsMemberBySlugSpy).toHaveBeenCalledWith('username', ['team1', 'team2']);
        done();
      });
    });


    it('should fail if verifying membership errors', done => {
      teamsIsMemberBySlugSpy.and.callFake(() => Promise.reject('Test'));
      bv.getPrAuthorTeamMembership(pr).catch(err => {
        expect(err).toBe('Test');
        done();
      });
    });


    it('should return the PR\'s author and whether they are members', done => {
      teamsIsMemberBySlugSpy.and.returnValues(Promise.resolve(true), Promise.resolve(false));

      Promise.all([
        bv.getPrAuthorTeamMembership(pr).then(({author, isMember}) => {
          expect(author).toBe('username');
          expect(isMember).toBe(true);
        }),
        bv.getPrAuthorTeamMembership(pr).then(({author, isMember}) => {
          expect(author).toBe('username');
          expect(isMember).toBe(false);
        }),
      ]).then(done);
    });

  });

});
