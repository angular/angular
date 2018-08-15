// Imports
import * as fs from 'fs';
import {join} from 'path';
import {AIO_PREVIEW_SERVER_HOSTNAME, AIO_PREVIEW_SERVER_PORT, AIO_WWW_USER} from '../common/env-variables';
import {computeShortSha} from '../common/utils';
import {ALT_SHA, BuildNums, PrNums, SHA, SIMILAR_SHA} from './constants';
import {helper as h, makeCurl, payload} from './helper';
import {customMatchers} from './jasmine-custom-matchers';

// Tests
describe('preview-server', () => {
  const hostname = AIO_PREVIEW_SERVER_HOSTNAME;
  const port = AIO_PREVIEW_SERVER_PORT;
  const host = `http://${hostname}:${port}`;

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000);
  beforeEach(() => jasmine.addMatchers(customMatchers));
  afterEach(() => h.cleanUp());


  describe(`${host}/can-have-public-preview`, () => {
    const curl = makeCurl(`${host}/can-have-public-preview`, {
      defaultData: null,
      defaultExtraPath: `/${PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER}`,
      defaultHeaders: [],
      defaultMethod: 'GET',
    });


    it('should disallow non-GET requests', async () => {
      const bodyRegex = /^Unknown resource in request/;

      await Promise.all([
        curl({method: 'POST'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'PUT'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'PATCH'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'DELETE'}).then(h.verifyResponse(404, bodyRegex)),
      ]);
    });


    it('should respond with 404 for unknown paths', async () => {
      const bodyRegex = /^Unknown resource in request/;

      await Promise.all([
        curl({extraPath: `/foo/${PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER}`}).then(h.verifyResponse(404, bodyRegex)),
        curl({extraPath: `-foo/${PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER}`}).then(h.verifyResponse(404, bodyRegex)),
        curl({extraPath: `nfoo/${PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER}`}).then(h.verifyResponse(404, bodyRegex)),
        curl({extraPath: `/${PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER}/foo`}).then(h.verifyResponse(404, bodyRegex)),
        curl({extraPath: '/f00'}).then(h.verifyResponse(404, bodyRegex)),
        curl({extraPath: '/'}).then(h.verifyResponse(404, bodyRegex)),
      ]);
    });


    it('should respond with 500 if checking for significant file changes fails', async () => {
      await Promise.all([
        curl({extraPath: `/${PrNums.CHANGED_FILES_404}`}).then(h.verifyResponse(500, /CHANGED_FILES_404/)),
        curl({extraPath: `/${PrNums.CHANGED_FILES_ERROR}`}).then(h.verifyResponse(500, /CHANGED_FILES_ERROR/)),
      ]);
    });


    it('should respond with 200 (false) if no significant files were touched', async () => {
      const expectedResponse = JSON.stringify({
        canHavePublicPreview: false,
        reason: 'No significant files touched.',
      });

      await curl({extraPath: `/${PrNums.CHANGED_FILES_NONE}`}).then(h.verifyResponse(200, expectedResponse));
    });


    it('should respond with 500 if checking "trusted" status fails', async () => {
      await curl({extraPath: `/${PrNums.TRUST_CHECK_ERROR}`}).then(h.verifyResponse(500, 'TRUST_CHECK_ERROR'));
    });


    it('should respond with 200 (false) if the PR is not automatically verifiable as "trusted"', async () => {
      const expectedResponse = JSON.stringify({
        canHavePublicPreview: false,
        reason: 'Not automatically verifiable as \\"trusted\\".',
      });

      await Promise.all([
        curl({extraPath: `/${PrNums.TRUST_CHECK_INACTIVE_TRUSTED_USER}`}).then(h.verifyResponse(200, expectedResponse)),
        curl({extraPath: `/${PrNums.TRUST_CHECK_UNTRUSTED}`}).then(h.verifyResponse(200, expectedResponse)),
      ]);
    });


    it('should respond with 200 (true) if the PR can have a public preview', async () => {
      const expectedResponse = JSON.stringify({
        canHavePublicPreview: true,
        reason: null,
      });

      await Promise.all([
        curl({extraPath: `/${PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER}`}).then(h.verifyResponse(200, expectedResponse)),
        curl({extraPath: `/${PrNums.TRUST_CHECK_TRUSTED_LABEL}`}).then(h.verifyResponse(200, expectedResponse)),
      ]);
    });

  });


  describe(`${host}/circle-build`, () => {
    const curl = makeCurl(`${host}/circle-build`);


    it('should disallow non-POST requests', async () => {
      const bodyRegex = /^Unknown resource/;

      await Promise.all([
        curl({method: 'GET'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'PUT'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'PATCH'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'DELETE'}).then(h.verifyResponse(404, bodyRegex)),
      ]);
    });


    it('should respond with 404 for unknown paths', async () => {
      await Promise.all([
        curl({url: `${host}/foo/circle-build`}).then(h.verifyResponse(404)),
        curl({url: `${host}/foo-circle-build`}).then(h.verifyResponse(404)),
        curl({url: `${host}/fooncircle-build`}).then(h.verifyResponse(404)),
        curl({url: `${host}/circle-build/foo`}).then(h.verifyResponse(404)),
        curl({url: `${host}/circle-build-foo`}).then(h.verifyResponse(404)),
        curl({url: `${host}/circle-buildnfoo`}).then(h.verifyResponse(404)),
        curl({url: `${host}/circle-build/pr`}).then(h.verifyResponse(404)),
        curl({url: `${host}/circle-build42`}).then(h.verifyResponse(404)),
      ]);
    });

    it('should respond with 400 if the body is not valid', async () => {
      await Promise.all([
        curl({ data: '' }).then(h.verifyResponse(400)),
        curl({ data: {} }).then(h.verifyResponse(400)),
        curl({ data: { payload: {} } }).then(h.verifyResponse(400)),
        curl({ data: { payload: { build_num: 1 } } }).then(h.verifyResponse(400)),
        curl({ data: { payload: { build_num: 1, build_parameters: {} } } }).then(h.verifyResponse(400)),
        curl(payload(0)).then(h.verifyResponse(400)),
        curl(payload(-1)).then(h.verifyResponse(400)),
      ]);
    });

    it('should respond with 500 if the CircleCI API request errors', async () => {
      await curl(payload(BuildNums.BUILD_INFO_ERROR)).then(h.verifyResponse(500));
      await curl(payload(BuildNums.BUILD_INFO_404)).then(h.verifyResponse(500));
    });

    it('should respond with 204 if the build on CircleCI failed', async () => {
      await curl(payload(BuildNums.BUILD_INFO_BUILD_FAILED)).then(h.verifyResponse(204));
    });

    it('should respond with 500 if the github org from CircleCI does not match what is configured', async () => {
      await curl(payload(BuildNums.BUILD_INFO_INVALID_GH_ORG)).then(h.verifyResponse(500));
    });

    it('should respond with 500 if the github repo from CircleCI does not match what is configured', async () => {
      await curl(payload(BuildNums.BUILD_INFO_INVALID_GH_REPO)).then(h.verifyResponse(500));
    });

    it('should respond with 500 if the github files API errors', async () => {
      await curl(payload(BuildNums.CHANGED_FILES_ERROR)).then(h.verifyResponse(500));
      await curl(payload(BuildNums.CHANGED_FILES_404)).then(h.verifyResponse(500));
    });

    it('should respond with 204 if no significant files are changed by the PR', async () => {
      await curl(payload(BuildNums.CHANGED_FILES_NONE)).then(h.verifyResponse(204));
    });

    it('should respond with 500 if the CircleCI artifact API fails', async () => {
      await curl(payload(BuildNums.BUILD_ARTIFACTS_ERROR)).then(h.verifyResponse(500));
      await curl(payload(BuildNums.BUILD_ARTIFACTS_404)).then(h.verifyResponse(500));
      await curl(payload(BuildNums.BUILD_ARTIFACTS_EMPTY)).then(h.verifyResponse(500));
      await curl(payload(BuildNums.BUILD_ARTIFACTS_MISSING)).then(h.verifyResponse(500));
    });

    it('should respond with 500 if fetching the artifact errors', async () => {
      await curl(payload(BuildNums.DOWNLOAD_ARTIFACT_ERROR)).then(h.verifyResponse(500));
      await curl(payload(BuildNums.DOWNLOAD_ARTIFACT_404)).then(h.verifyResponse(500));
    });

    it('should respond with 500 if the GH trusted API fails', async () => {
      await curl(payload(BuildNums.TRUST_CHECK_ERROR)).then(h.verifyResponse(500));
      expect({ prNum: PrNums.TRUST_CHECK_ERROR }).toExistAsAnArtifact();
    });

    it('should respond with 201 if a new public build is created', async () => {
      await curl(payload(BuildNums.TRUST_CHECK_ACTIVE_TRUSTED_USER)).then(h.verifyResponse(201));
      expect({ prNum: PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER }).toExistAsABuild();
    });

    it('should respond with 202 if a new private build is created', async () => {
      await curl(payload(BuildNums.TRUST_CHECK_UNTRUSTED)).then(h.verifyResponse(202));
      expect({ prNum: PrNums.TRUST_CHECK_UNTRUSTED, isPublic: false }).toExistAsABuild();
    });

    [true, false].forEach(isPublic => {
      const build = isPublic ? BuildNums.TRUST_CHECK_ACTIVE_TRUSTED_USER : BuildNums.TRUST_CHECK_UNTRUSTED;
      const prNum = isPublic ? PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER : PrNums.TRUST_CHECK_UNTRUSTED;
      const label = isPublic ? 'public' : 'non-public';
      const overwriteRe = RegExp(`^Request to overwrite existing ${label} directory`);
      const statusCode = isPublic ? 201 : 202;

      describe(`for ${label} builds`, () => {

        it('should extract the contents of the build artifact', async () => {
          await curl(payload(build))
            .then(h.verifyResponse(statusCode));
          expect(h.readBuildFile(prNum, SHA, 'index.html', isPublic))
            .toContain(`PR: ${prNum} | SHA: ${SHA} | File: /index.html`);
          expect(h.readBuildFile(prNum, SHA, 'foo/bar.js', isPublic))
            .toContain(`PR: ${prNum} | SHA: ${SHA} | File: /foo/bar.js`);
          expect({ prNum, isPublic }).toExistAsABuild();
        });

        it(`should create files/directories owned by '${AIO_WWW_USER}'`, async () => {
          await curl(payload(build))
            .then(h.verifyResponse(statusCode));

          const shaDir = h.getShaDir(h.getPrDir(prNum, isPublic), SHA);
          const { stdout: allFiles } = await h.runCmd(`find ${shaDir}`);
          const { stdout: userFiles } = await h.runCmd(`find ${shaDir} -user ${AIO_WWW_USER}`);

          expect(userFiles).toBe(allFiles);
          expect(userFiles).toContain(shaDir);
          expect(userFiles).toContain(join(shaDir, 'index.html'));
          expect(userFiles).toContain(join(shaDir, 'foo', 'bar.js'));

          expect({ prNum, isPublic }).toExistAsABuild();
        });

        it('should delete the build artifact file', async () => {
          await curl(payload(build))
            .then(h.verifyResponse(statusCode));
          expect({ prNum, SHA }).not.toExistAsAnArtifact();
          expect({ prNum, isPublic }).toExistAsABuild();
        });

        it('should make the build directory non-writable', async () => {
          await curl(payload(build))
            .then(h.verifyResponse(statusCode));

          // See https://github.com/nodejs/node-v0.x-archive/issues/3045#issuecomment-4862588.
          const isNotWritable = (fileOrDir: string) => {
            const mode = fs.statSync(fileOrDir).mode;
            // tslint:disable-next-line: no-bitwise
            return !(mode & parseInt('222', 8));
          };

          const shaDir = h.getShaDir(h.getPrDir(prNum, isPublic), SHA);
          expect(isNotWritable(shaDir)).toBe(true);
          expect(isNotWritable(join(shaDir, 'index.html'))).toBe(true);
          expect(isNotWritable(join(shaDir, 'foo', 'bar.js'))).toBe(true);

          expect({ prNum, isPublic }).toExistAsABuild();
        });

        it('should ignore a legacy 40-chars long build directory (even if it starts with the same chars)',
          async () => {
          // It is possible that 40-chars long build directories exist, if they had been deployed
          // before implementing the shorter build directory names. In that case, we don't want the
          // second (shorter) name to be considered the same as the old one (even if they originate
          // from the same SHA).

          h.createDummyBuild(prNum, SHA, isPublic, false, true);
          h.writeBuildFile(prNum, SHA, 'index.html', 'My content', isPublic, true);
          expect(h.readBuildFile(prNum, SHA, 'index.html', isPublic, true)).toBe('My content');

          await curl(payload(build))
            .then(h.verifyResponse(statusCode));

          expect(h.readBuildFile(prNum, SHA, 'index.html', isPublic, false)).toContain('index.html');
          expect(h.readBuildFile(prNum, SHA, 'index.html', isPublic, true)).toBe('My content');

          expect({ prNum, isPublic, sha: SHA, isLegacy: false }).toExistAsABuild();
          expect({ prNum, isPublic, sha: SHA, isLegacy: true }).toExistAsABuild();
        });

        it(`should not overwrite existing builds`, async () => {
          // setup a build already in place
          h.createDummyBuild(prNum, SHA, isPublic);
          // distinguish this build from the downloaded one
          h.writeBuildFile(prNum, SHA, 'index.html', 'My content', isPublic);
          await curl(payload(build)).then(h.verifyResponse(409, overwriteRe));
          expect(h.readBuildFile(prNum, SHA, 'index.html', isPublic)).toBe('My content');
          expect({ prNum, isPublic }).toExistAsABuild();
          expect({ prNum }).toExistAsAnArtifact();
        });

        it(`should not overwrite existing builds (even if the SHA is different)`, async () => {
          // Since only the first few characters of the SHA are used, it is possible for two different
          // SHAs to correspond to the same directory. In that case, we don't want the second SHA to
          // overwrite the first.
          expect(SIMILAR_SHA).not.toEqual(SHA);
          expect(computeShortSha(SIMILAR_SHA)).toEqual(computeShortSha(SHA));
          h.createDummyBuild(prNum, SIMILAR_SHA, isPublic);
          expect(h.readBuildFile(prNum, SIMILAR_SHA, 'index.html', isPublic)).toContain('index.html');
          h.writeBuildFile(prNum, SIMILAR_SHA, 'index.html', 'My content', isPublic);
          expect(h.readBuildFile(prNum, SIMILAR_SHA, 'index.html', isPublic)).toBe('My content');

          await curl(payload(build)).then(h.verifyResponse(409, overwriteRe));
          expect(h.readBuildFile(prNum, SIMILAR_SHA, 'index.html', isPublic)).toBe('My content');
          expect({ prNum, isPublic, sha: SIMILAR_SHA }).toExistAsABuild();
          expect({ prNum, sha: SIMILAR_SHA }).toExistAsAnArtifact();
        });

        it('should only delete the SHA directory on error (for existing PR)', async () => {
          h.createDummyBuild(prNum, ALT_SHA, isPublic);
          await curl(payload(BuildNums.TRUST_CHECK_ERROR)).then(h.verifyResponse(500));
          expect({ prNum: PrNums.TRUST_CHECK_ERROR }).toExistAsAnArtifact();
          expect({ prNum, isPublic, sha: SHA }).not.toExistAsABuild();
          expect({ prNum, isPublic, sha: ALT_SHA }).toExistAsABuild();
        });

        describe('when the PR\'s visibility has changed', () => {

          it('should update the PR\'s visibility', async () => {
            h.createDummyBuild(prNum, ALT_SHA, !isPublic);
            await curl(payload(build)).then(h.verifyResponse(statusCode));
            expect({ prNum, isPublic }).toExistAsABuild();
            expect({ prNum, isPublic, sha: ALT_SHA }).toExistAsABuild();
          });


          it('should not overwrite existing builds (but keep the updated visibility)', async () => {
            h.createDummyBuild(prNum, SHA, !isPublic);
            await curl(payload(build)).then(h.verifyResponse(409));
            expect({ prNum, isPublic }).toExistAsABuild();
            expect({ prNum, isPublic: !isPublic }).not.toExistAsABuild();
            // since it errored we didn't clear up the downloaded artifact - perhaps we should?
            expect({ prNum }).toExistAsAnArtifact();
          });


          it('should reject the request if it fails to update the PR\'s visibility', async () => {
            // One way to cause an error is to have both a public and a hidden directory for the same PR.
            h.createDummyBuild(prNum, ALT_SHA, isPublic);
            h.createDummyBuild(prNum, ALT_SHA, !isPublic);

            const errorRegex = new RegExp(`^Request to move '${h.getPrDir(prNum, !isPublic)}' ` +
                                          `to existing directory '${h.getPrDir(prNum, isPublic)}'.`);

            await curl(payload(build)).then(h.verifyResponse(409, errorRegex));

            expect({ prNum, isPublic }).not.toExistAsABuild();

            // The bad folders should have been deleted
            expect({ prNum, sha: ALT_SHA, isPublic }).toExistAsABuild();
            expect({ prNum, sha: ALT_SHA, isPublic: !isPublic }).toExistAsABuild();

            // since it errored we didn't clear up the downloaded artifact - perhaps we should?
            expect({ prNum }).toExistAsAnArtifact();
          });
        });
      });
    });
  });


  describe(`${host}/health-check`, () => {

    it('should respond with 200', async () => {
      await Promise.all([
        h.runCmd(`curl -iL ${host}/health-check`).then(h.verifyResponse(200)),
        h.runCmd(`curl -iL ${host}/health-check/`).then(h.verifyResponse(200)),
      ]);
    });


    it('should respond with 404 if the path does not match exactly', async () => {
      await Promise.all([
        h.runCmd(`curl -iL ${host}/health-check/foo`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL ${host}/health-check-foo`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL ${host}/health-checknfoo`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL ${host}/foo/health-check`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL ${host}/foo-health-check`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL ${host}/foonhealth-check`).then(h.verifyResponse(404)),
      ]);
    });

  });


  describe(`${host}/pr-updated`, () => {
    const curl = makeCurl(`${host}/pr-updated`);

    it('should disallow non-POST requests', async () => {
      const bodyRegex = /^Unknown resource in request/;

      await Promise.all([
        curl({method: 'GET'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'PUT'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'PATCH'}).then(h.verifyResponse(404, bodyRegex)),
        curl({method: 'DELETE'}).then(h.verifyResponse(404, bodyRegex)),
      ]);
    });


    it('should respond with 400 for requests without a payload', async () => {
      const bodyRegex = /^Missing or empty 'number' field in request/;

      await Promise.all([
        curl({ data: '' }).then(h.verifyResponse(400, bodyRegex)),
        curl({ data: {} }).then(h.verifyResponse(400, bodyRegex)),
      ]);
    });


    it('should respond with 400 for requests without a \'number\' field', async () => {
      const bodyRegex = /^Missing or empty 'number' field in request/;

      await Promise.all([
        curl({ data: {} }).then(h.verifyResponse(400, bodyRegex)),
        curl({ data: { number: null} }).then(h.verifyResponse(400, bodyRegex)),
      ]);
    });


    it('should reject requests for which checking the PR visibility fails', async () => {
       await curl({ data: { number: PrNums.TRUST_CHECK_ERROR } }).then(h.verifyResponse(500, /TRUST_CHECK_ERROR/));
    });


    it('should respond with 404 for unknown paths', async () => {
      const mockPayload = JSON.stringify({number: 1}); // MockExternalApiFlags.TRUST_CHECK_ACTIVE_TRUSTED_USER });
      const cmdPrefix = `curl -iLX POST --data "${mockPayload}" ${host}`;

      await Promise.all([
        h.runCmd(`${cmdPrefix}/foo/pr-updated`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/foo-pr-updated`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/foonpr-updated`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/pr-updated/foo`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/pr-updated-foo`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/pr-updatednfoo`).then(h.verifyResponse(404)),
      ]);
    });


    it('should do nothing if PR\'s visibility is already up-to-date', async () => {
      const publicPr = PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;
      const hiddenPr = PrNums.TRUST_CHECK_UNTRUSTED;

      const checkVisibilities = (remove: boolean) => {
        // Public build is already public.
        expect({ prNum: publicPr, isPublic: false }).not.toExistAsABuild(remove);
        expect({ prNum: publicPr, isPublic: true }).toExistAsABuild(remove);
        // Hidden build is already hidden.
        expect({ prNum: hiddenPr, isPublic: false }).toExistAsABuild(remove);
        expect({ prNum: hiddenPr, isPublic: true }).not.toExistAsABuild(remove);
      };

      h.createDummyBuild(publicPr, SHA, true);
      h.createDummyBuild(hiddenPr, SHA, false);
      checkVisibilities(false);

      await Promise.all([
        curl({ data: {number: +publicPr, action: 'foo' } }).then(h.verifyResponse(200)),
        curl({ data: {number: +hiddenPr, action: 'foo' } }).then(h.verifyResponse(200)),
      ]);

      // Visibilities should not have changed, because the specified action could not have triggered a change.
      checkVisibilities(true);
    });


    it('should do nothing if \'action\' implies no visibility change', async () => {
      const publicPr = PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;
      const hiddenPr = PrNums.TRUST_CHECK_UNTRUSTED;

      const checkVisibilities = (remove: boolean) => {
        // Public build is hidden atm.
        expect({ prNum: publicPr, isPublic: false }).toExistAsABuild(remove);
        expect({ prNum: publicPr, isPublic: true }).not.toExistAsABuild(remove);
        // Hidden build is public atm.
        expect({ prNum: hiddenPr, isPublic: false }).not.toExistAsABuild(remove);
        expect({ prNum: hiddenPr, isPublic: true }).toExistAsABuild(remove);
      };

      h.createDummyBuild(publicPr, SHA, false);
      h.createDummyBuild(hiddenPr, SHA, true);
      checkVisibilities(false);

      await Promise.all([
        curl({ data: {number: +publicPr, action: 'foo' } }).then(h.verifyResponse(200)),
        curl({ data: {number: +hiddenPr, action: 'foo' } }).then(h.verifyResponse(200)),
      ]);
      // Visibilities should not have changed, because the specified action could not have triggered a change.
      checkVisibilities(true);
    });


    describe('when the visiblity has changed', () => {
      const publicPr = PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;
      const hiddenPr = PrNums.TRUST_CHECK_UNTRUSTED;

      beforeEach(() => {
        // Create initial PR builds with opposite visibilities as the ones that will be reported:
        // - The now public PR was previously hidden.
        // - The now hidden PR was previously public.
        h.createDummyBuild(publicPr, SHA, false);
        h.createDummyBuild(hiddenPr, SHA, true);

        expect({ prNum: publicPr, isPublic: false }).toExistAsABuild(false);
        expect({ prNum: publicPr, isPublic: true }).not.toExistAsABuild(false);
        expect({ prNum: hiddenPr, isPublic: false }).not.toExistAsABuild(false);
        expect({ prNum: hiddenPr, isPublic: true }).toExistAsABuild(false);
      });
      afterEach(() => {
        // Expect PRs' visibility to have been updated:
        // - The public PR should be actually public (previously it was hidden).
        // - The hidden PR should be actually hidden (previously it was public).
        expect({ prNum: publicPr, isPublic: false }).not.toExistAsABuild();
        expect({ prNum: publicPr, isPublic: true }).toExistAsABuild();
        expect({ prNum: hiddenPr, isPublic: false }).toExistAsABuild();
        expect({ prNum: hiddenPr, isPublic: true }).not.toExistAsABuild();
      });


      it('should update the PR\'s visibility (action: undefined)', async () => {
        await Promise.all([
          curl({ data: {number: +publicPr } }).then(h.verifyResponse(200)),
          curl({ data: {number: +hiddenPr } }).then(h.verifyResponse(200)),
        ]);
      });


      it('should update the PR\'s visibility (action: labeled)', async () => {
        await Promise.all([
          curl({ data: {number: +publicPr, action: 'labeled' } }).then(h.verifyResponse(200)),
          curl({ data: {number: +hiddenPr, action: 'labeled' } }).then(h.verifyResponse(200)),
        ]);
      });


      it('should update the PR\'s visibility (action: unlabeled)', async () => {
        await Promise.all([
          curl({ data: {number: +publicPr, action: 'unlabeled' } }).then(h.verifyResponse(200)),
          curl({ data: {number: +hiddenPr, action: 'unlabeled' } }).then(h.verifyResponse(200)),
        ]);
      });

    });

  });


  describe(`${host}/*`, () => {

    it('should respond with 404 for requests to unknown URLs', async () => {
      const bodyRegex = /^Unknown resource/;

      await Promise.all([
        h.runCmd(`curl -iL ${host}/index.html`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iL ${host}/`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iL ${host}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX PUT ${host}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX POST ${host}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX PATCH ${host}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX DELETE ${host}`).then(h.verifyResponse(404, bodyRegex)),
      ]);
    });

  });
});
