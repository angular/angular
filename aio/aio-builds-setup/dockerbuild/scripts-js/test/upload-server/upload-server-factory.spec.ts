// Imports
import * as express from 'express';
import * as http from 'http';
import * as supertest from 'supertest';
import {GithubPullRequests} from '../../lib/common/github-pull-requests';
import {BuildCreator} from '../../lib/upload-server/build-creator';
import {ChangedPrVisibilityEvent, CreatedBuildEvent} from '../../lib/upload-server/build-events';
import {BUILD_VERIFICATION_STATUS, BuildVerifier} from '../../lib/upload-server/build-verifier';
import {uploadServerFactory as usf} from '../../lib/upload-server/upload-server-factory';

// Tests
describe('uploadServerFactory', () => {
  const defaultConfig = {
    buildsDir: 'builds/dir',
    domainName: 'domain.name',
    githubOrganization: 'organization',
    githubTeamSlugs: ['team1', 'team2'],
    githubToken: '12345',
    repoSlug: 'repo/slug',
    secret: 'secret',
    trustedPrLabel: 'trusted: pr-label',
  };

  // Helpers
  const createUploadServer = (partialConfig: Partial<typeof defaultConfig> = {}) =>
    usf.create({...defaultConfig, ...partialConfig} as typeof defaultConfig);


  describe('create()', () => {
    let usfCreateMiddlewareSpy: jasmine.Spy;

    beforeEach(() => {
      usfCreateMiddlewareSpy = spyOn(usf as any, 'createMiddleware').and.callThrough();
    });


    it('should throw if \'buildsDir\' is missing or empty', () => {
      expect(() => createUploadServer({buildsDir: ''})).
        toThrowError('Missing or empty required parameter \'buildsDir\'!');
    });


    it('should throw if \'domainName\' is missing or empty', () => {
      expect(() => createUploadServer({domainName: ''})).
        toThrowError('Missing or empty required parameter \'domainName\'!');
    });


    it('should throw if \'githubToken\' is missing or empty', () => {
      expect(() => createUploadServer({githubToken: ''})).
        toThrowError('Missing or empty required parameter \'githubToken\'!');
    });


    it('should throw if \'githubOrganization\' is missing or empty', () => {
      expect(() => createUploadServer({githubOrganization: ''})).
        toThrowError('Missing or empty required parameter \'organization\'!');
    });


    it('should throw if \'githubTeamSlugs\' is missing or empty', () => {
      expect(() => createUploadServer({githubTeamSlugs: []})).
        toThrowError('Missing or empty required parameter \'allowedTeamSlugs\'!');
    });


    it('should throw if \'repoSlug\' is missing or empty', () => {
      expect(() => createUploadServer({repoSlug: ''})).
        toThrowError('Missing or empty required parameter \'repoSlug\'!');
    });


    it('should throw if \'secret\' is missing or empty', () => {
      expect(() => createUploadServer({secret: ''})).
        toThrowError('Missing or empty required parameter \'secret\'!');
    });


    it('should throw if \'trustedPrLabel\' is missing or empty', () => {
      expect(() => createUploadServer({trustedPrLabel: ''})).
        toThrowError('Missing or empty required parameter \'trustedPrLabel\'!');
    });


    it('should return an http.Server', () => {
      const httpCreateServerSpy = spyOn(http, 'createServer').and.callThrough();
      const server = createUploadServer();

      expect(server).toBe(httpCreateServerSpy.calls.mostRecent().returnValue);
    });


    it('should create and use an appropriate BuildCreator', () => {
      const usfCreateBuildCreatorSpy = spyOn(usf as any, 'createBuildCreator').and.callThrough();

      createUploadServer();
      const buildCreator: BuildCreator = usfCreateBuildCreatorSpy.calls.mostRecent().returnValue;

      expect(usfCreateMiddlewareSpy).toHaveBeenCalledWith(jasmine.any(BuildVerifier), buildCreator);
      expect(usfCreateBuildCreatorSpy).toHaveBeenCalledWith('builds/dir', '12345', 'repo/slug', 'domain.name');
    });


    it('should create and use an appropriate middleware', () => {
      const httpCreateServerSpy = spyOn(http, 'createServer').and.callThrough();

      createUploadServer();
      const middleware: express.Express = usfCreateMiddlewareSpy.calls.mostRecent().returnValue;
      const buildVerifier = jasmine.any(BuildVerifier);
      const buildCreator = jasmine.any(BuildCreator);

      expect(httpCreateServerSpy).toHaveBeenCalledWith(middleware);
      expect(usfCreateMiddlewareSpy).toHaveBeenCalledWith(buildVerifier, buildCreator);
    });


    it('should log the server address info on \'listening\'', () => {
      const consoleInfoSpy = spyOn(console, 'info');
      const server = createUploadServer();
      server.address = () => ({address: 'foo', family: '', port: 1337});

      expect(consoleInfoSpy).not.toHaveBeenCalled();

      server.emit('listening');
      expect(consoleInfoSpy).toHaveBeenCalledWith('Up and running (and listening on foo:1337)...');
    });

  });


  // Protected methods

  describe('createBuildCreator()', () => {
    let buildCreator: BuildCreator;

    beforeEach(() => {
      buildCreator = (usf as any).createBuildCreator(
        defaultConfig.buildsDir,
        defaultConfig.githubToken,
        defaultConfig.repoSlug,
        defaultConfig.domainName,
      );
    });


    it('should pass the \'buildsDir\' to the BuildCreator', () => {
      expect((buildCreator as any).buildsDir).toBe('builds/dir');
    });


    describe('on \'build.created\'', () => {
      let prsAddCommentSpy: jasmine.Spy;

      beforeEach(() => prsAddCommentSpy = spyOn(GithubPullRequests.prototype, 'addComment'));


      it('should post a comment on GitHub for public previews', () => {
        const commentBody = 'You can preview 1234567890 at https://pr42-1234567890.domain.name/.';

        buildCreator.emit(CreatedBuildEvent.type, {pr: 42, sha: '1234567890', isPublic: true});
        expect(prsAddCommentSpy).toHaveBeenCalledWith(42, commentBody);
      });


      it('should not post a comment on GitHub for non-public previews', () => {
        buildCreator.emit(CreatedBuildEvent.type, {pr: 42, sha: '1234567890', isPublic: false});
        expect(prsAddCommentSpy).not.toHaveBeenCalled();
      });

    });


    describe('on \'pr.changedVisibility\'', () => {
      let prsAddCommentSpy: jasmine.Spy;

      beforeEach(() => prsAddCommentSpy = spyOn(GithubPullRequests.prototype, 'addComment'));


      it('should post a comment on GitHub (for all SHAs) for PRs made public', () => {
        const commentBody = 'You can preview 12345 at https://pr42-12345.domain.name/.\n' +
                            'You can preview 67890 at https://pr42-67890.domain.name/.';

        buildCreator.emit(ChangedPrVisibilityEvent.type, {pr: 42, shas: ['12345', '67890'], isPublic: true});
        expect(prsAddCommentSpy).toHaveBeenCalledWith(42, commentBody);
      });


      it('should not post a comment on GitHub if no SHAs were affected', () => {
        buildCreator.emit(ChangedPrVisibilityEvent.type, {pr: 42, shas: [], isPublic: true});
        expect(prsAddCommentSpy).not.toHaveBeenCalled();
      });


      it('should not post a comment on GitHub for PRs made non-public', () => {
        buildCreator.emit(ChangedPrVisibilityEvent.type, {pr: 42, shas: ['12345', '67890'], isPublic: false});
        expect(prsAddCommentSpy).not.toHaveBeenCalled();
      });

    });


    it('should pass the correct \'githubToken\' and \'repoSlug\' to GithubPullRequests', () => {
      const prsAddCommentSpy = spyOn(GithubPullRequests.prototype, 'addComment');

      buildCreator.emit(CreatedBuildEvent.type, {pr: 42, sha: '1234567890', isPublic: true});
      buildCreator.emit(ChangedPrVisibilityEvent.type, {pr: 42, shas: ['12345', '67890'], isPublic: true});

      const allCalls = prsAddCommentSpy.calls.all();
      const prs = allCalls[0].object;

      expect(prsAddCommentSpy).toHaveBeenCalledTimes(2);
      expect(prs).toBe(allCalls[1].object);
      expect(prs).toEqual(jasmine.any(GithubPullRequests));
      expect(prs.repoSlug).toBe('repo/slug');
      expect(prs.requestHeaders.Authorization).toContain('12345');
    });

  });


  describe('createMiddleware()', () => {
    let buildVerifier: BuildVerifier;
    let buildCreator: BuildCreator;
    let agent: supertest.SuperTest<supertest.Test>;

    // Helpers
    const promisifyRequest = (req: supertest.Request) =>
      new Promise((resolve, reject) => req.end(err => err ? reject(err) : resolve()));
    const verifyRequests = (reqs: supertest.Request[], done: jasmine.DoneFn) =>
      Promise.all(reqs.map(promisifyRequest)).then(done, done.fail);

    beforeEach(() => {
      buildVerifier = new BuildVerifier(
        defaultConfig.secret,
        defaultConfig.githubToken,
        defaultConfig.repoSlug,
        defaultConfig.githubOrganization,
        defaultConfig.githubTeamSlugs,
        defaultConfig.trustedPrLabel,
      );
      buildCreator = new BuildCreator(defaultConfig.buildsDir);
      agent = supertest.agent((usf as any).createMiddleware(buildVerifier, buildCreator));

      spyOn(console, 'error');
    });


    describe('GET /create-build/<pr>/<sha>', () => {
      const pr = '9';
      const sha = '9'.repeat(40);
      let buildVerifierVerifySpy: jasmine.Spy;
      let buildCreatorCreateSpy: jasmine.Spy;

      beforeEach(() => {
        const verStatus = BUILD_VERIFICATION_STATUS.verifiedAndTrusted;
        buildVerifierVerifySpy = spyOn(buildVerifier, 'verify').and.returnValue(Promise.resolve(verStatus));
        buildCreatorCreateSpy = spyOn(buildCreator, 'create').and.returnValue(Promise.resolve());
      });


      it('should respond with 404 for non-GET requests', done => {
        verifyRequests([
          agent.put(`/create-build/${pr}/${sha}`).expect(404),
          agent.post(`/create-build/${pr}/${sha}`).expect(404),
          agent.patch(`/create-build/${pr}/${sha}`).expect(404),
          agent.delete(`/create-build/${pr}/${sha}`).expect(404),
        ], done);
      });


      it('should respond with 401 for requests without an \'AUTHORIZATION\' header', done => {
        const url = `/create-build/${pr}/${sha}`;
        const responseBody = `Missing or empty 'AUTHORIZATION' header in request: GET ${url}`;

        verifyRequests([
          agent.get(url).expect(401, responseBody),
          agent.get(url).set('AUTHORIZATION', '').expect(401, responseBody),
        ], done);
      });


      it('should respond with 400 for requests without an \'X-FILE\' header', done => {
        const url = `/create-build/${pr}/${sha}`;
        const responseBody = `Missing or empty 'X-FILE' header in request: GET ${url}`;

        const request1 = agent.get(url).set('AUTHORIZATION', 'foo');
        const request2 = agent.get(url).set('AUTHORIZATION', 'foo').set('X-FILE', '');

        verifyRequests([
          request1.expect(400, responseBody),
          request2.expect(400, responseBody),
        ], done);
      });


      it('should respond with 404 for unknown paths', done => {
        verifyRequests([
          agent.get(`/foo/create-build/${pr}/${sha}`).expect(404),
          agent.get(`/foo-create-build/${pr}/${sha}`).expect(404),
          agent.get(`/fooncreate-build/${pr}/${sha}`).expect(404),
          agent.get(`/create-build/foo/${pr}/${sha}`).expect(404),
          agent.get(`/create-build-foo/${pr}/${sha}`).expect(404),
          agent.get(`/create-buildnfoo/${pr}/${sha}`).expect(404),
          agent.get(`/create-build/pr${pr}/${sha}`).expect(404),
          agent.get(`/create-build/${pr}/${sha}42`).expect(404),
        ], done);
      });


      it('should call \'BuildVerifier#verify()\' with the correct arguments', done => {
        const req = agent.
          get(`/create-build/${pr}/${sha}`).
          set('AUTHORIZATION', 'foo').
          set('X-FILE', 'bar');

        promisifyRequest(req).
          then(() => expect(buildVerifierVerifySpy).toHaveBeenCalledWith(9, 'foo')).
          then(done, done.fail);
      });


      it('should propagate errors from BuildVerifier', done => {
        buildVerifierVerifySpy.and.callFake(() => Promise.reject('Test'));

        const req = agent.
          get(`/create-build/${pr}/${sha}`).
          set('AUTHORIZATION', 'foo').
          set('X-FILE', 'bar').
          expect(500, 'Test');

        promisifyRequest(req).
          then(() => {
            expect(buildVerifierVerifySpy).toHaveBeenCalledWith(9, 'foo');
            expect(buildCreatorCreateSpy).not.toHaveBeenCalled();
          }).
          then(done, done.fail);
      });


      it('should call \'BuildCreator#create()\' with the correct arguments', done => {
        buildVerifierVerifySpy.and.returnValues(
            Promise.resolve(BUILD_VERIFICATION_STATUS.verifiedAndTrusted),
            Promise.resolve(BUILD_VERIFICATION_STATUS.verifiedNotTrusted));

        const req1 = agent.get(`/create-build/${pr}/${sha}`).set('AUTHORIZATION', 'foo').set('X-FILE', 'bar');
        const req2 = agent.get(`/create-build/${pr}/${sha}`).set('AUTHORIZATION', 'foo').set('X-FILE', 'bar');

        Promise.all([
          promisifyRequest(req1).then(() => expect(buildCreatorCreateSpy).toHaveBeenCalledWith(pr, sha, 'bar', true)),
          promisifyRequest(req2).then(() => expect(buildCreatorCreateSpy).toHaveBeenCalledWith(pr, sha, 'bar', false)),
        ]).then(done, done.fail);
      });


      it('should propagate errors from BuildCreator', done => {
        buildCreatorCreateSpy.and.callFake(() => Promise.reject('Test'));
        const req = agent.
          get(`/create-build/${pr}/${sha}`).
          set('AUTHORIZATION', 'foo').
          set('X-FILE', 'bar').
          expect(500, 'Test');

        verifyRequests([req], done);
      });


      it('should respond with 201 on successful upload (for public builds)', done => {
        const req = agent.
          get(`/create-build/${pr}/${sha}`).
          set('AUTHORIZATION', 'foo').
          set('X-FILE', 'bar').
          expect(201, http.STATUS_CODES[201]);

        verifyRequests([req], done);
      });


      it('should respond with 202 on successful upload (for hidden builds)', done => {
        buildVerifierVerifySpy.and.returnValue(Promise.resolve(BUILD_VERIFICATION_STATUS.verifiedNotTrusted));
        const req = agent.
          get(`/create-build/${pr}/${sha}`).
          set('AUTHORIZATION', 'foo').
          set('X-FILE', 'bar').
          expect(202, http.STATUS_CODES[202]);

        verifyRequests([req], done);
      });


      it('should reject PRs with leading zeros', done => {
        verifyRequests([agent.get(`/create-build/0${pr}/${sha}`).expect(404)], done);
      });


      it('should accept SHAs with leading zeros (but not trim the zeros)', done => {
        const sha40 = '0'.repeat(40);
        const sha41 = `0${sha40}`;

        const request40 = agent.get(`/create-build/${pr}/${sha40}`).set('AUTHORIZATION', 'foo').set('X-FILE', 'bar');
        const request41 = agent.get(`/create-build/${pr}/${sha41}`).set('AUTHORIZATION', 'baz').set('X-FILE', 'qux');

        Promise.all([
          promisifyRequest(request40.expect(201)),
          promisifyRequest(request41.expect(404)),
        ]).then(done, done.fail);
      });

    });


    describe('GET /health-check', () => {

      it('should respond with 200', done => {
        verifyRequests([
          agent.get('/health-check').expect(200),
          agent.get('/health-check/').expect(200),
         ], done);
      });


      it('should respond with 404 for non-GET requests', done => {
        verifyRequests([
          agent.put('/health-check').expect(404),
          agent.post('/health-check').expect(404),
          agent.patch('/health-check').expect(404),
          agent.delete('/health-check').expect(404),
        ], done);
      });


      it('should respond with 404 if the path does not match exactly', done => {
        verifyRequests([
          agent.get('/health-check/foo').expect(404),
          agent.get('/health-check-foo').expect(404),
          agent.get('/health-checknfoo').expect(404),
          agent.get('/foo/health-check').expect(404),
          agent.get('/foo-health-check').expect(404),
          agent.get('/foonhealth-check').expect(404),
        ], done);
      });

    });


    describe('POST /pr-updated', () => {
      const pr = '9';
      const url = '/pr-updated';
      let bvGetPrIsTrustedSpy: jasmine.Spy;
      let bcUpdatePrVisibilitySpy: jasmine.Spy;

      // Helpers
      const createRequest = (num: number, action?: string) =>
        agent.post(url).send({number: num, action});

      beforeEach(() => {
        bvGetPrIsTrustedSpy = spyOn(buildVerifier, 'getPrIsTrusted');
        bcUpdatePrVisibilitySpy = spyOn(buildCreator, 'updatePrVisibility');
      });


      it('should respond with 404 for non-POST requests', done => {
        verifyRequests([
          agent.get(url).expect(404),
          agent.put(url).expect(404),
          agent.patch(url).expect(404),
          agent.delete(url).expect(404),
        ], done);
      });


      it('should respond with 400 for requests without a payload', done => {
        const responseBody = `Missing or empty 'number' field in request: POST ${url} {}`;

        const request1 = agent.post(url);
        const request2 = agent.post(url).send();

        verifyRequests([
          request1.expect(400, responseBody),
          request2.expect(400, responseBody),
        ], done);
      });


      it('should respond with 400 for requests without a \'number\' field', done => {
        const responseBodyPrefix = `Missing or empty 'number' field in request: POST ${url}`;

        const request1 = agent.post(url).send({});
        const request2 = agent.post(url).send({number: null});

        verifyRequests([
          request1.expect(400, `${responseBodyPrefix} {}`),
          request2.expect(400, `${responseBodyPrefix} {"number":null}`),
        ], done);
      });


      it('should call \'BuildVerifier#gtPrIsTrusted()\' with the correct arguments', done => {
        const req = createRequest(+pr);

        promisifyRequest(req).
          then(() => expect(bvGetPrIsTrustedSpy).toHaveBeenCalledWith(9)).
          then(done, done.fail);
      });


      it('should propagate errors from BuildVerifier', done => {
        bvGetPrIsTrustedSpy.and.callFake(() => Promise.reject('Test'));

        const req = createRequest(+pr).expect(500, 'Test');

        promisifyRequest(req).
          then(() => {
            expect(bvGetPrIsTrustedSpy).toHaveBeenCalledWith(9);
            expect(bcUpdatePrVisibilitySpy).not.toHaveBeenCalled();
          }).
          then(done, done.fail);
      });


      it('should call \'BuildCreator#updatePrVisibility()\' with the correct arguments', done => {
        bvGetPrIsTrustedSpy.and.callFake((pr2: number) => Promise.resolve(pr2 === 42));

        const req1 = createRequest(24);
        const req2 = createRequest(42);

        Promise.all([
          promisifyRequest(req1).then(() => expect(bcUpdatePrVisibilitySpy).toHaveBeenCalledWith('24', false)),
          promisifyRequest(req2).then(() => expect(bcUpdatePrVisibilitySpy).toHaveBeenCalledWith('42', true)),
        ]).then(done, done.fail);
      });


      it('should propagate errors from BuildCreator', done => {
        bcUpdatePrVisibilitySpy.and.callFake(() => Promise.reject('Test'));

        const req = createRequest(+pr).expect(500, 'Test');
        verifyRequests([req], done);
      });


      describe('on success', () => {

        it('should respond with 200 (action: undefined)', done => {
          bvGetPrIsTrustedSpy.and.returnValues(Promise.resolve(true), Promise.resolve(false));

          const reqs = [4, 2].map(num => createRequest(num).expect(200, http.STATUS_CODES[200]));
          verifyRequests(reqs, done);
        });


        it('should respond with 200 (action: labeled)', done => {
          bvGetPrIsTrustedSpy.and.returnValues(Promise.resolve(true), Promise.resolve(false));

          const reqs = [4, 2].map(num => createRequest(num, 'labeled').expect(200, http.STATUS_CODES[200]));
          verifyRequests(reqs, done);
        });


        it('should respond with 200 (action: unlabeled)', done => {
          bvGetPrIsTrustedSpy.and.returnValues(Promise.resolve(true), Promise.resolve(false));

          const reqs = [4, 2].map(num => createRequest(num, 'unlabeled').expect(200, http.STATUS_CODES[200]));
          verifyRequests(reqs, done);
        });


        it('should respond with 200 (and do nothing) if \'action\' implies no visibility change', done => {
          const promises = ['foo', 'notlabeled'].
            map(action => createRequest(+pr, action).expect(200, http.STATUS_CODES[200])).
            map(promisifyRequest);

          Promise.all(promises).
            then(() => {
              expect(bvGetPrIsTrustedSpy).not.toHaveBeenCalled();
              expect(bcUpdatePrVisibilitySpy).not.toHaveBeenCalled();
            }).
            then(done, done.fail);
        });

      });

    });


    describe('ALL *', () => {

      it('should respond with 404', done => {
        const responseFor = (method: string) => `Unknown resource in request: ${method.toUpperCase()} /some/url`;

        verifyRequests([
          agent.get('/some/url').expect(404, responseFor('get')),
          agent.put('/some/url').expect(404, responseFor('put')),
          agent.post('/some/url').expect(404, responseFor('post')),
          agent.patch('/some/url').expect(404, responseFor('patch')),
          agent.delete('/some/url').expect(404, responseFor('delete')),
        ], done);
      });

    });

  });

});
