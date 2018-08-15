// Imports
import * as http from 'http';
import * as supertest from 'supertest';
import {CircleCiApi} from '../../lib/common/circle-ci-api';
import {GithubApi} from '../../lib/common/github-api';
import {GithubPullRequests} from '../../lib/common/github-pull-requests';
import {GithubTeams} from '../../lib/common/github-teams';
import {Logger} from '../../lib/common/utils';
import {BuildCreator} from '../../lib/preview-server/build-creator';
import {ChangedPrVisibilityEvent, CreatedBuildEvent} from '../../lib/preview-server/build-events';
import {BuildRetriever, GithubInfo} from '../../lib/preview-server/build-retriever';
import {BuildVerifier} from '../../lib/preview-server/build-verifier';
import {PreviewServerConfig, PreviewServerFactory} from '../../lib/preview-server/preview-server-factory';

interface CircleCiWebHookPayload {
  payload: {
    build_num: number;
    build_parameters: {
      CIRCLE_JOB: string;
    }
  };
}

// Tests
describe('PreviewServerFactory', () => {
  const defaultConfig: PreviewServerConfig = {
    buildArtifactPath: 'artifact/path.zip',
    buildsDir: 'builds/dir',
    circleCiToken: 'CIRCLE_CI_TOKEN',
    domainName: 'domain.name',
    downloadSizeLimit: 999,
    downloadsDir: '/tmp/aio-create-builds',
    githubOrg: 'organisation',
    githubRepo: 'repo',
    githubTeamSlugs: ['team1', 'team2'],
    githubToken: '12345',
    significantFilesPattern: '^(?:aio|packages)\\/(?!.*[._]spec\\.[jt]s$)',
    trustedPrLabel: 'trusted: pr-label',
  };
  let loggerErrorSpy: jasmine.Spy;
  let loggerInfoSpy: jasmine.Spy;
  let loggerLogSpy: jasmine.Spy;

  // Helpers
  const createPreviewServer = (partialConfig: Partial<PreviewServerConfig> = {}) =>
    PreviewServerFactory.create({...defaultConfig, ...partialConfig});

  beforeEach(() => {
    loggerErrorSpy = spyOn(Logger.prototype, 'error');
    loggerInfoSpy = spyOn(Logger.prototype, 'info');
    loggerLogSpy = spyOn(Logger.prototype, 'log');
  });

  describe('create()', () => {
    let usfCreateMiddlewareSpy: jasmine.Spy;

    beforeEach(() => {
      usfCreateMiddlewareSpy = spyOn(PreviewServerFactory, 'createMiddleware').and.callThrough();
    });


    it('should throw if \'buildsDir\' is missing or empty', () => {
      expect(() => createPreviewServer({buildsDir: ''})).
        toThrowError('Missing or empty required parameter \'buildsDir\'!');
    });


    it('should throw if \'domainName\' is missing or empty', () => {
      expect(() => createPreviewServer({domainName: ''})).
        toThrowError('Missing or empty required parameter \'domainName\'!');
    });


    it('should throw if \'githubToken\' is missing or empty', () => {
      expect(() => createPreviewServer({githubToken: ''})).
        toThrowError('Missing or empty required parameter \'githubToken\'!');
    });


    it('should throw if \'githubOrg\' is missing or empty', () => {
      expect(() => createPreviewServer({githubOrg: ''})).
        toThrowError('Missing or empty required parameter \'githubOrg\'!');
    });


    it('should throw if \'githubTeamSlugs\' is missing or empty', () => {
      expect(() => createPreviewServer({githubTeamSlugs: []})).
        toThrowError('Missing or empty required parameter \'allowedTeamSlugs\'!');
    });


    it('should throw if \'githubRepo\' is missing or empty', () => {
      expect(() => createPreviewServer({githubRepo: ''})).
        toThrowError('Missing or empty required parameter \'githubRepo\'!');
    });


    it('should throw if \'trustedPrLabel\' is missing or empty', () => {
      expect(() => createPreviewServer({trustedPrLabel: ''})).
        toThrowError('Missing or empty required parameter \'trustedPrLabel\'!');
    });


    it('should return an http.Server', () => {
      const httpCreateServerSpy = spyOn(http, 'createServer').and.callThrough();
      const server = createPreviewServer();

      expect(server).toBe(httpCreateServerSpy.calls.mostRecent().returnValue);
    });


    it('should create and use an appropriate BuildCreator', () => {
      const usfCreateBuildCreatorSpy = spyOn(PreviewServerFactory, 'createBuildCreator').and.callThrough();

      createPreviewServer();
      const buildRetriever = jasmine.any(BuildRetriever);
      const buildVerifier = jasmine.any(BuildVerifier);
      const prs = jasmine.any(GithubPullRequests);
      const buildCreator: BuildCreator = usfCreateBuildCreatorSpy.calls.mostRecent().returnValue;

      expect(usfCreateMiddlewareSpy).toHaveBeenCalledWith(buildRetriever, buildVerifier, buildCreator, defaultConfig);
      expect(usfCreateBuildCreatorSpy).toHaveBeenCalledWith(prs, 'builds/dir', 'domain.name');
    });


    it('should create and use an appropriate middleware', () => {
      const httpCreateServerSpy = spyOn(http, 'createServer').and.callThrough();

      createPreviewServer();

      const buildRetriever = jasmine.any(BuildRetriever);
      const buildVerifier = jasmine.any(BuildVerifier);
      const buildCreator = jasmine.any(BuildCreator);
      expect(usfCreateMiddlewareSpy).toHaveBeenCalledWith(buildRetriever, buildVerifier, buildCreator, defaultConfig);

      const middleware = usfCreateMiddlewareSpy.calls.mostRecent().returnValue;
      expect(httpCreateServerSpy).toHaveBeenCalledWith(middleware);
    });


    it('should log the server address info on \'listening\'', () => {
      const server = createPreviewServer();
      server.address = () => ({address: 'foo', family: '', port: 1337});

      expect(loggerInfoSpy).not.toHaveBeenCalled();

      server.emit('listening');
      expect(loggerInfoSpy).toHaveBeenCalledWith('Up and running (and listening on foo:1337)...');
    });

  });


  // Protected methods

  describe('createBuildCreator()', () => {
    let buildCreator: BuildCreator;

    beforeEach(() => {
      const api = new GithubApi(defaultConfig.githubToken);
      const prs = new GithubPullRequests(api, defaultConfig.githubOrg, defaultConfig.githubRepo);
      buildCreator = PreviewServerFactory.createBuildCreator(prs, defaultConfig.buildsDir, defaultConfig.domainName);
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


    it('should pass the correct parameters to GithubPullRequests', () => {
      const prsAddCommentSpy = spyOn(GithubPullRequests.prototype, 'addComment');

      buildCreator.emit(CreatedBuildEvent.type, {pr: 42, sha: '1234567890', isPublic: true});
      buildCreator.emit(ChangedPrVisibilityEvent.type, {pr: 42, shas: ['12345', '67890'], isPublic: true});

      const allCalls = prsAddCommentSpy.calls.all();
      const prs: GithubPullRequests = allCalls[0].object;

      expect(prsAddCommentSpy).toHaveBeenCalledTimes(2);
      expect(prs).toBe(allCalls[1].object);
      expect(prs).toBeInstanceOf(GithubPullRequests);
      expect(prs.repoSlug).toBe('organisation/repo');
    });

  });


  describe('createMiddleware()', () => {
    let buildRetriever: BuildRetriever;
    let buildVerifier: BuildVerifier;
    let buildCreator: BuildCreator;
    let agent: supertest.SuperTest<supertest.Test>;

    beforeEach(() => {
      const circleCiApi = new CircleCiApi(defaultConfig.githubOrg, defaultConfig.githubRepo,
                                          defaultConfig.circleCiToken);
      const githubApi = new GithubApi(defaultConfig.githubToken);
      const prs = new GithubPullRequests(githubApi, defaultConfig.githubOrg, defaultConfig.githubRepo);
      const teams = new GithubTeams(githubApi, defaultConfig.githubOrg);

      buildRetriever = new BuildRetriever(circleCiApi, defaultConfig.downloadSizeLimit, defaultConfig.downloadsDir);
      buildVerifier = new BuildVerifier(prs, teams, defaultConfig.githubTeamSlugs, defaultConfig.trustedPrLabel);
      buildCreator = new BuildCreator(defaultConfig.buildsDir);

      const middleware = PreviewServerFactory.createMiddleware(buildRetriever, buildVerifier, buildCreator,
                                                               defaultConfig);
      agent = supertest.agent(middleware);
    });


    describe('GET /health-check', () => {

      it('should respond with 200', async () => {
        await Promise.all([
          agent.get('/health-check').expect(200),
          agent.get('/health-check/').expect(200),
        ]);
      });


      it('should respond with 404 for non-GET requests', async () => {
        await Promise.all([
          agent.put('/health-check').expect(404),
          agent.post('/health-check').expect(404),
          agent.patch('/health-check').expect(404),
          agent.delete('/health-check').expect(404),
        ]);
      });


      it('should respond with 404 if the path does not match exactly', async () => {
        await Promise.all([
          agent.get('/health-check/foo').expect(404),
          agent.get('/health-check-foo').expect(404),
          agent.get('/health-checknfoo').expect(404),
          agent.get('/foo/health-check').expect(404),
          agent.get('/foo-health-check').expect(404),
          agent.get('/foonhealth-check').expect(404),
        ]);
      });

    });


    describe('GET /can-have-public-preview/<pr>', () => {
      const baseUrl = '/can-have-public-preview';
      const pr = 777;
      const url = `${baseUrl}/${pr}`;
      let bvGetPrIsTrustedSpy: jasmine.Spy;
      let bvGetSignificantFilesChangedSpy: jasmine.Spy;

      beforeEach(() => {
        bvGetPrIsTrustedSpy = spyOn(buildVerifier, 'getPrIsTrusted').and.resolveTo(true);
        bvGetSignificantFilesChangedSpy = spyOn(buildVerifier, 'getSignificantFilesChanged').and.resolveTo(true);
      });


      it('should respond with 404 for non-GET requests', async () => {
        await Promise.all([
          agent.put(url).expect(404),
          agent.post(url).expect(404),
          agent.patch(url).expect(404),
          agent.delete(url).expect(404),
        ]);
      });


      it('should respond with 404 if the path does not match exactly', async () => {
        await Promise.all([
          agent.get('/can-have-public-preview/42/foo').expect(404),
          agent.get('/can-have-public-preview-foo/42').expect(404),
          agent.get('/can-have-public-previewnfoo/42').expect(404),
          agent.get('/foo/can-have-public-preview/42').expect(404),
          agent.get('/foo-can-have-public-preview/42').expect(404),
          agent.get('/fooncan-have-public-preview/42').expect(404),
        ]);
      });


      it('should respond appropriately if the PR did not touch any significant files', async () => {
        bvGetSignificantFilesChangedSpy.and.resolveTo(false);

        const expectedResponse = {canHavePublicPreview: false, reason: 'No significant files touched.'};
        const expectedLog = `PR:${pr} - Cannot have a public preview, because it did not touch any significant files.`;

        await agent.get(url).expect(200, expectedResponse);

        expect(bvGetSignificantFilesChangedSpy).toHaveBeenCalledWith(pr, jasmine.any(RegExp));
        expect(bvGetPrIsTrustedSpy).not.toHaveBeenCalled();
        expect(loggerLogSpy).toHaveBeenCalledWith(expectedLog);
      });


      it('should respond appropriately if the PR is not automatically verifiable as "trusted"', async () => {
        bvGetPrIsTrustedSpy.and.resolveTo(false);

        const expectedResponse = {canHavePublicPreview: false, reason: 'Not automatically verifiable as "trusted".'};
        const expectedLog =
          `PR:${pr} - Cannot have a public preview, because not automatically verifiable as "trusted".`;

        await agent.get(url).expect(200, expectedResponse);

        expect(bvGetSignificantFilesChangedSpy).toHaveBeenCalledWith(pr, jasmine.any(RegExp));
        expect(bvGetPrIsTrustedSpy).toHaveBeenCalledWith(pr);
        expect(loggerLogSpy).toHaveBeenCalledWith(expectedLog);
      });


      it('should respond appropriately if the PR can have a preview', async () => {
        const expectedResponse = {canHavePublicPreview: true, reason: null};
        const expectedLog = `PR:${pr} - Can have a public preview.`;

        await agent.get(url).expect(200, expectedResponse);

        expect(bvGetSignificantFilesChangedSpy).toHaveBeenCalledWith(pr, jasmine.any(RegExp));
        expect(bvGetPrIsTrustedSpy).toHaveBeenCalledWith(pr);
        expect(loggerLogSpy).toHaveBeenCalledWith(expectedLog);
      });


      it('should respond with error if `getSignificantFilesChanged()` fails', async () => {
        bvGetSignificantFilesChangedSpy.and.rejectWith('getSignificantFilesChanged error');

        await agent.get(url).expect(500, 'getSignificantFilesChanged error');
        expect(loggerErrorSpy).toHaveBeenCalledWith('Previewability check error', 'getSignificantFilesChanged error');
      });


      it('should respond with error if `getPrIsTrusted()` fails', async () => {
        bvGetPrIsTrustedSpy.and.throwError('getPrIsTrusted error');

        await agent.get(url).expect(500, 'getPrIsTrusted error');
        expect(loggerErrorSpy).toHaveBeenCalledWith('Previewability check error', new Error('getPrIsTrusted error'));
      });

    });


    describe('POST /circle-build', () => {
      let getGithubInfoSpy: jasmine.Spy;
      let getSignificantFilesChangedSpy: jasmine.Spy;
      let downloadBuildArtifactSpy: jasmine.Spy;
      let getPrIsTrustedSpy: jasmine.Spy;
      let createBuildSpy: jasmine.Spy;
      let IS_PUBLIC: boolean;
      let BUILD_INFO: GithubInfo;
      let AFFECTS_SIGNIFICANT_FILES: boolean;
      let BASIC_PAYLOAD: CircleCiWebHookPayload;
      const URL = '/circle-build';
      const BUILD_NUM = 12345;
      const PR = 777;
      const SHA = 'COMMIT';
      const DOWNLOADED_ARTIFACT_PATH = 'downloads/777-COMMIT-build.zip';

      beforeEach(() => {
        IS_PUBLIC = true;
        BUILD_INFO  = {
          org: defaultConfig.githubOrg,
          pr: PR,
          repo: defaultConfig.githubRepo,
          sha: SHA,
          success: true,
        };
        BASIC_PAYLOAD = { payload: { build_num: BUILD_NUM, build_parameters: { CIRCLE_JOB: 'aio_preview' } } };
        AFFECTS_SIGNIFICANT_FILES = true;
        getGithubInfoSpy = spyOn(buildRetriever, 'getGithubInfo')
          .and.callFake(() => Promise.resolve(BUILD_INFO));
        getSignificantFilesChangedSpy = spyOn(buildVerifier, 'getSignificantFilesChanged')
          .and.callFake(() => Promise.resolve(AFFECTS_SIGNIFICANT_FILES));
        downloadBuildArtifactSpy = spyOn(buildRetriever, 'downloadBuildArtifact')
          .and.callFake(() => Promise.resolve(DOWNLOADED_ARTIFACT_PATH));
        getPrIsTrustedSpy = spyOn(buildVerifier, 'getPrIsTrusted')
          .and.callFake(() => Promise.resolve(IS_PUBLIC));
        createBuildSpy = spyOn(buildCreator, 'create');
      });

      it('should respond with 400 if the request body is not in the correct format', async () => {
        await Promise.all([
          agent.post(URL).expect(400),
          agent.post(URL).send().expect(400),
          agent.post(URL).send({}).expect(400),
          agent.post(URL).send({ payload: {} }).expect(400),
          agent.post(URL).send({ payload: { build_num: -1 } }).expect(400),
          agent.post(URL).send({ payload: { build_num: 4000 } }).expect(400),
          agent.post(URL).send({ payload: { build_num: 4000, build_parameters: { } } }).expect(400),
          agent.post(URL).send({ payload: { build_num: 4000, build_parameters: { CIRCLE_JOB: '' } } }).expect(400),
        ]);
      });

      it('should create a preview if everything is good and the build succeeded', async () => {
        await agent.post(URL).send(BASIC_PAYLOAD).expect(201);
        expect(getGithubInfoSpy).toHaveBeenCalledWith(BUILD_NUM);
        expect(getSignificantFilesChangedSpy).toHaveBeenCalledWith(PR, jasmine.any(RegExp));
        expect(downloadBuildArtifactSpy).toHaveBeenCalledWith(BUILD_NUM, PR, SHA, defaultConfig.buildArtifactPath);
        expect(getPrIsTrustedSpy).toHaveBeenCalledWith(PR);
        expect(createBuildSpy).toHaveBeenCalledWith(PR, SHA, DOWNLOADED_ARTIFACT_PATH, IS_PUBLIC);
      });

      it('should respond with 204 if the reported build is not the "AIO preview" job', async () => {
        BASIC_PAYLOAD.payload.build_parameters.CIRCLE_JOB = 'lint';
        await agent.post(URL).send(BASIC_PAYLOAD).expect(204);
        expect(getGithubInfoSpy).not.toHaveBeenCalled();
        expect(getSignificantFilesChangedSpy).not.toHaveBeenCalled();
        expect(loggerLogSpy).toHaveBeenCalledWith(
          'Build:12345, Job:lint -', 'Skipping preview processing because this is not the "aio_preview" job.');
        expect(downloadBuildArtifactSpy).not.toHaveBeenCalled();
        expect(getPrIsTrustedSpy).not.toHaveBeenCalled();
        expect(createBuildSpy).not.toHaveBeenCalled();
      });

      it('should respond with 204 if the build did not affect any significant files', async () => {
        AFFECTS_SIGNIFICANT_FILES = false;
        await agent.post(URL).send(BASIC_PAYLOAD).expect(204);
        expect(getGithubInfoSpy).toHaveBeenCalledWith(BUILD_NUM);
        expect(getSignificantFilesChangedSpy).toHaveBeenCalledWith(PR, jasmine.any(RegExp));
        expect(loggerLogSpy).toHaveBeenCalledWith(
          'PR:777, Build:12345 - Skipping preview processing because this PR did not touch any significant files.');
        expect(downloadBuildArtifactSpy).not.toHaveBeenCalled();
        expect(getPrIsTrustedSpy).not.toHaveBeenCalled();
        expect(createBuildSpy).not.toHaveBeenCalled();
      });

      it('should respond with 201 if the build is trusted', async () => {
        IS_PUBLIC = true;
        await agent.post(URL).send(BASIC_PAYLOAD).expect(201);
      });

      it('should respond with 202 if the build is not trusted', async () => {
        IS_PUBLIC = false;
        await agent.post(URL).send(BASIC_PAYLOAD).expect(202);
      });

      it('should not create a preview if the build was not successful', async () => {
        BUILD_INFO.success = false;
        await agent.post(URL).send(BASIC_PAYLOAD).expect(204);
        expect(getGithubInfoSpy).toHaveBeenCalledWith(BUILD_NUM);
        expect(downloadBuildArtifactSpy).not.toHaveBeenCalled();
        expect(getPrIsTrustedSpy).not.toHaveBeenCalled();
        expect(createBuildSpy).not.toHaveBeenCalled();
      });

      it('should fail if the CircleCI request fails', async () => {
        // Note it is important to put the `reject` into `and.callFake`;
        // If you just `and.returnValue` the rejected promise
        // then you get an "unhandled rejection" message in the console.
        getGithubInfoSpy.and.rejectWith('Test Error');
        await agent.post(URL).send(BASIC_PAYLOAD).expect(500, 'Test Error');
        expect(getGithubInfoSpy).toHaveBeenCalledWith(BUILD_NUM);
        expect(downloadBuildArtifactSpy).not.toHaveBeenCalled();
        expect(getPrIsTrustedSpy).not.toHaveBeenCalled();
        expect(createBuildSpy).not.toHaveBeenCalled();
      });

      it('should fail if the Github organisation of the build does not match the configured organisation', async () => {
        BUILD_INFO.org = 'bad';
        await agent.post(URL).send(BASIC_PAYLOAD)
          .expect(500, `Invalid webhook: expected "githubOrg" property to equal "organisation" but got "bad".`);
      });

      it('should fail if the Github repo of the build does not match the configured repo', async () => {
        BUILD_INFO.repo = 'bad';
        await agent.post(URL).send(BASIC_PAYLOAD)
          .expect(500, `Invalid webhook: expected "githubRepo" property to equal "repo" but got "bad".`);
      });

      it('should fail if the artifact fetch request fails', async () => {
        downloadBuildArtifactSpy.and.rejectWith('Test Error');
        await agent.post(URL).send(BASIC_PAYLOAD).expect(500, 'Test Error');
        expect(getGithubInfoSpy).toHaveBeenCalledWith(BUILD_NUM);
        expect(downloadBuildArtifactSpy).toHaveBeenCalled();
        expect(getPrIsTrustedSpy).not.toHaveBeenCalled();
        expect(createBuildSpy).not.toHaveBeenCalled();
      });

      it('should fail if verifying the PR fails', async () => {
        getPrIsTrustedSpy.and.rejectWith('Test Error');
        await agent.post(URL).send(BASIC_PAYLOAD).expect(500, 'Test Error');
        expect(getGithubInfoSpy).toHaveBeenCalledWith(BUILD_NUM);
        expect(downloadBuildArtifactSpy).toHaveBeenCalled();
        expect(getPrIsTrustedSpy).toHaveBeenCalled();
        expect(createBuildSpy).not.toHaveBeenCalled();
      });

      it('should fail if creating the preview build fails', async () => {
        createBuildSpy.and.rejectWith('Test Error');
        await agent.post(URL).send(BASIC_PAYLOAD).expect(500, 'Test Error');
        expect(getGithubInfoSpy).toHaveBeenCalledWith(BUILD_NUM);
        expect(downloadBuildArtifactSpy).toHaveBeenCalled();
        expect(getPrIsTrustedSpy).toHaveBeenCalled();
        expect(createBuildSpy).toHaveBeenCalled();
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


      it('should respond with 404 for non-POST requests', async () => {
        await Promise.all([
          agent.get(url).expect(404),
          agent.put(url).expect(404),
          agent.patch(url).expect(404),
          agent.delete(url).expect(404),
        ]);
      });


      it('should respond with 400 for requests without a payload', async () => {
        const responseBody = `Missing or empty 'number' field in request: POST ${url} {}`;

        const request1 = agent.post(url);
        const request2 = agent.post(url).send();

        await Promise.all([
          request1.expect(400, responseBody),
          request2.expect(400, responseBody),
        ]);
      });


      it('should respond with 400 for requests without a \'number\' field', async () => {
        const responseBodyPrefix = `Missing or empty 'number' field in request: POST ${url}`;

        const request1 = agent.post(url).send({});
        const request2 = agent.post(url).send({number: null});

        await Promise.all([
          request1.expect(400, `${responseBodyPrefix} {}`),
          request2.expect(400, `${responseBodyPrefix} {"number":null}`),
        ]);
      });


      it('should call \'BuildVerifier#gtPrIsTrusted()\' with the correct arguments', async () => {
        await createRequest(+pr);
        expect(bvGetPrIsTrustedSpy).toHaveBeenCalledWith(9);
      });


      it('should propagate errors from BuildVerifier', async () => {
        bvGetPrIsTrustedSpy.and.rejectWith('Test');

        await createRequest(+pr).expect(500, 'Test');

        expect(bvGetPrIsTrustedSpy).toHaveBeenCalledWith(9);
        expect(bcUpdatePrVisibilitySpy).not.toHaveBeenCalled();
      });


      it('should call \'BuildCreator#updatePrVisibility()\' with the correct arguments', async () => {
        bvGetPrIsTrustedSpy.
          withArgs(24).and.resolveTo(false).
          withArgs(42).and.resolveTo(true);

        await createRequest(24);
        expect(bcUpdatePrVisibilitySpy).toHaveBeenCalledWith(24, false);

        await createRequest(42);
        expect(bcUpdatePrVisibilitySpy).toHaveBeenCalledWith(42, true);
      });


      it('should propagate errors from BuildCreator', async () => {
        bcUpdatePrVisibilitySpy.and.rejectWith('Test');
        await createRequest(+pr).expect(500, 'Test');
      });


      describe('on success', () => {

        it('should respond with 200 (action: undefined)', async () => {
          bvGetPrIsTrustedSpy.
            withArgs(2).and.resolveTo(false).
            withArgs(4).and.resolveTo(true);

          const reqs = [4, 2].map(num => createRequest(num).expect(200, http.STATUS_CODES[200]));
          await Promise.all(reqs);
        });


        it('should respond with 200 (action: labeled)', async () => {
          bvGetPrIsTrustedSpy.
            withArgs(2).and.resolveTo(false).
            withArgs(4).and.resolveTo(true);

          const reqs = [4, 2].map(num => createRequest(num, 'labeled').expect(200, http.STATUS_CODES[200]));
          await Promise.all(reqs);
        });


        it('should respond with 200 (action: unlabeled)', async () => {
          bvGetPrIsTrustedSpy.
            withArgs(2).and.resolveTo(false).
            withArgs(4).and.resolveTo(true);

          const reqs = [4, 2].map(num => createRequest(num, 'unlabeled').expect(200, http.STATUS_CODES[200]));
          await Promise.all(reqs);
        });


        it('should respond with 200 (and do nothing) if \'action\' implies no visibility change', async () => {
          const promises = ['foo', 'notlabeled'].
            map(action => createRequest(+pr, action).expect(200, http.STATUS_CODES[200]));

          await Promise.all(promises);
          expect(bvGetPrIsTrustedSpy).not.toHaveBeenCalled();
          expect(bcUpdatePrVisibilitySpy).not.toHaveBeenCalled();
        });

      });

    });


    describe('ALL *', () => {

      it('should respond with 404', async () => {
        const responseFor = (method: string) => `Unknown resource in request: ${method.toUpperCase()} /some/url`;

        await Promise.all([
          agent.get('/some/url').expect(404, responseFor('get')),
          agent.put('/some/url').expect(404, responseFor('put')),
          agent.post('/some/url').expect(404, responseFor('post')),
          agent.patch('/some/url').expect(404, responseFor('patch')),
          agent.delete('/some/url').expect(404, responseFor('delete')),
        ]);
      });

    });

  });

});
