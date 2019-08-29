// Imports
import {AIO_NGINX_HOSTNAME} from '../common/env-variables';
import {computeShortSha} from '../common/utils';
import {ALT_SHA, BuildNums, PrNums, SHA} from './constants';
import {helper as h, makeCurl, payload} from './helper';
import {customMatchers} from './jasmine-custom-matchers';

// Tests
h.runForAllSupportedSchemes((scheme, port) => describe(`integration (on ${scheme.toUpperCase()})`, () => {
  const hostname = AIO_NGINX_HOSTNAME;
  const host = `${hostname}:${port}`;
  const curlPrUpdated = makeCurl(`${scheme}://${host}/pr-updated`);

  const getFile = (pr: number, sha: string, file: string) =>
    h.runCmd(`curl -iL ${scheme}://pr${pr}-${computeShortSha(sha)}.${host}/${file}`);
  const prUpdated = (prNum: number, action?: string) => curlPrUpdated({ data: { number: prNum, action } });
  const circleBuild = makeCurl(`${scheme}://${host}/circle-build`);

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
    jasmine.addMatchers(customMatchers);
  });
  afterEach(() => h.cleanUp());


  describe('for a new/non-existing PR', () => {

    it('should be able to create and serve a public preview', async () => {
      const BUILD = BuildNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;
      const PR = PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;

      const regexPrefix = `^BUILD: ${BUILD} \\| PR: ${PR} \\| SHA: ${SHA} \\| File:`;
      const idxContentRegex = new RegExp(`${regexPrefix} \\/index\\.html$`);
      const barContentRegex = new RegExp(`${regexPrefix} \\/foo\\/bar\\.js$`);

      await circleBuild(payload(BUILD)).then(h.verifyResponse(201));
      await Promise.all([
        getFile(PR, SHA, 'index.html').then(h.verifyResponse(200, idxContentRegex)),
        getFile(PR, SHA, 'foo/bar.js').then(h.verifyResponse(200, barContentRegex)),
      ]);

      expect({ prNum: PR }).toExistAsABuild();
      expect({ prNum: PR, isPublic: false }).not.toExistAsABuild();
    });


    it('should be able to create but not serve a hidden preview', async () => {
      const BUILD = BuildNums.TRUST_CHECK_UNTRUSTED;
      const PR = PrNums.TRUST_CHECK_UNTRUSTED;

      await circleBuild(payload(BUILD)).then(h.verifyResponse(202));
      await Promise.all([
        getFile(PR, SHA, 'index.html').then(h.verifyResponse(404)),
        getFile(PR, SHA, 'foo/bar.js').then(h.verifyResponse(404)),
      ]);

      expect({ prNum: PR }).not.toExistAsABuild();
      expect({ prNum: PR, isPublic: false }).toExistAsABuild();
    });


    it('should reject if verification fails', async () => {
      const BUILD = BuildNums.TRUST_CHECK_ERROR;
      const PR = PrNums.TRUST_CHECK_ERROR;

      await circleBuild(payload(BUILD)).then(h.verifyResponse(500));
      expect({ prNum: PR }).toExistAsAnArtifact();
      expect({ prNum: PR }).not.toExistAsABuild();
      expect({ prNum: PR, isPublic: false }).not.toExistAsABuild();
    });


    it('should be able to notify that a PR has been updated (and do nothing)', async () => {
      await prUpdated(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER).then(h.verifyResponse(200));
      // The PR should still not exist.
      expect({ prNum: PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, isPublic: false }).not.toExistAsABuild();
      expect({ prNum: PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, isPublic: true }).not.toExistAsABuild();
    });

  });


  describe('for an existing PR', () => {

    it('should be able to create and serve a public preview', async () => {
      const BUILD = BuildNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;
      const PR = PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;

      const regexPrefix1 = `^PR: ${PR} \\| SHA: ${ALT_SHA} \\| File:`;
      const idxContentRegex1 = new RegExp(`${regexPrefix1} \\/index\\.html$`);
      const barContentRegex1 = new RegExp(`${regexPrefix1} \\/foo\\/bar\\.js$`);

      const regexPrefix2 = `^BUILD: ${BUILD} \\| PR: ${PR} \\| SHA: ${SHA} \\| File:`;
      const idxContentRegex2 = new RegExp(`${regexPrefix2} \\/index\\.html$`);
      const barContentRegex2 = new RegExp(`${regexPrefix2} \\/foo\\/bar\\.js$`);

      h.createDummyBuild(PR, ALT_SHA);
      await circleBuild(payload(BUILD)).then(h.verifyResponse(201));
      await Promise.all([
        getFile(PR, ALT_SHA, 'index.html').then(h.verifyResponse(200, idxContentRegex1)),
        getFile(PR, ALT_SHA, 'foo/bar.js').then(h.verifyResponse(200, barContentRegex1)),
        getFile(PR, SHA, 'index.html').then(h.verifyResponse(200, idxContentRegex2)),
        getFile(PR, SHA, 'foo/bar.js').then(h.verifyResponse(200, barContentRegex2)),
      ]);

      expect({ prNum: PR, sha: SHA }).toExistAsABuild();
      expect({ prNum: PR, sha: ALT_SHA }).toExistAsABuild();
    });


    it('should be able to create but not serve a hidden preview', async () => {
      const BUILD = BuildNums.TRUST_CHECK_UNTRUSTED;
      const PR = PrNums.TRUST_CHECK_UNTRUSTED;

      h.createDummyBuild(PR, ALT_SHA, false);
      await circleBuild(payload(BUILD)).then(h.verifyResponse(202));

      await Promise.all([
        getFile(PR, ALT_SHA, 'index.html').then(h.verifyResponse(404)),
        getFile(PR, ALT_SHA, 'foo/bar.js').then(h.verifyResponse(404)),
        getFile(PR, SHA, 'index.html').then(h.verifyResponse(404)),
        getFile(PR, SHA, 'foo/bar.js').then(h.verifyResponse(404)),
      ]);

      expect({ prNum: PR, sha: SHA }).not.toExistAsABuild();
      expect({ prNum: PR, sha: SHA, isPublic: false }).toExistAsABuild();
      expect({ prNum: PR, sha: ALT_SHA }).not.toExistAsABuild();
      expect({ prNum: PR, sha: ALT_SHA, isPublic: false }).toExistAsABuild();
    });


    it('should reject if verification fails', async () => {
      const BUILD = BuildNums.TRUST_CHECK_ERROR;
      const PR = PrNums.TRUST_CHECK_ERROR;

      h.createDummyBuild(PR, ALT_SHA, false);

      await circleBuild(payload(BUILD)).then(h.verifyResponse(500));

      expect({ prNum: PR }).toExistAsAnArtifact();
      expect({ prNum: PR }).not.toExistAsABuild();
      expect({ prNum: PR, isPublic: false }).not.toExistAsABuild();
      expect({ prNum: PR, sha: ALT_SHA, isPublic: false }).toExistAsABuild();
    });


    it('should not be able to overwrite an existing public preview', async () => {
      const BUILD = BuildNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;
      const PR = PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;

      const regexPrefix = `^PR: ${PR} \\| SHA: ${SHA} \\| File:`;
      const idxContentRegex = new RegExp(`${regexPrefix} \\/index\\.html$`);
      const barContentRegex = new RegExp(`${regexPrefix} \\/foo\\/bar\\.js$`);

      h.createDummyBuild(PR, SHA);

      await circleBuild(payload(BUILD)).then(h.verifyResponse(409));
      await Promise.all([
        getFile(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, SHA, 'index.html').then(h.verifyResponse(200, idxContentRegex)),
        getFile(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, SHA, 'foo/bar.js').then(h.verifyResponse(200, barContentRegex)),
      ]);

      expect({ prNum: PR }).toExistAsAnArtifact();
      expect({ prNum: PR }).toExistAsABuild();
    });


    it('should not be able to overwrite an existing hidden preview', async () => {
      const BUILD = BuildNums.TRUST_CHECK_UNTRUSTED;
      const PR = PrNums.TRUST_CHECK_UNTRUSTED;
      h.createDummyBuild(PR, SHA, false);

      await circleBuild(payload(BUILD)).then(h.verifyResponse(409));

      expect({ prNum: PR }).toExistAsAnArtifact();
      expect({ prNum: PR, isPublic: false }).toExistAsABuild();
    });


    it('should be able to request re-checking visibility (if outdated)', async () => {
      const publicPr = PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;
      const hiddenPr = PrNums.TRUST_CHECK_UNTRUSTED;

      h.createDummyBuild(publicPr, SHA, false);
      h.createDummyBuild(hiddenPr, SHA, true);

      // PR visibilities are outdated (i.e. the opposte of what the should).
      expect({ prNum: publicPr, sha: SHA, isPublic: false }).toExistAsABuild(false);
      expect({ prNum: publicPr, sha: SHA, isPublic: true }).not.toExistAsABuild(false);
      expect({ prNum: hiddenPr, sha: SHA, isPublic: false }).not.toExistAsABuild(false);
      expect({ prNum: hiddenPr, sha: SHA, isPublic: true }).toExistAsABuild(false);

      await Promise.all([
        prUpdated(publicPr).then(h.verifyResponse(200)),
        prUpdated(hiddenPr).then(h.verifyResponse(200)),
      ]);

      // PR visibilities should have been updated.
      expect({ prNum: publicPr, isPublic: false }).not.toExistAsABuild();
      expect({ prNum: publicPr, isPublic: true }).toExistAsABuild();
      expect({ prNum: hiddenPr, isPublic: false }).toExistAsABuild();
      expect({ prNum: hiddenPr, isPublic: true }).not.toExistAsABuild();
    });


    it('should be able to request re-checking visibility (if up-to-date)', async () => {
      const publicPr = PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER;
      const hiddenPr = PrNums.TRUST_CHECK_UNTRUSTED;

      h.createDummyBuild(publicPr, SHA, true);
      h.createDummyBuild(hiddenPr, SHA, false);

      // PR visibilities are already up-to-date.
      expect({ prNum: publicPr, sha: SHA, isPublic: false }).not.toExistAsABuild(false);
      expect({ prNum: publicPr, sha: SHA, isPublic: true }).toExistAsABuild(false);
      expect({ prNum: hiddenPr, sha: SHA, isPublic: false }).toExistAsABuild(false);
      expect({ prNum: hiddenPr, sha: SHA, isPublic: true }).not.toExistAsABuild(false);

      await Promise.all([
        prUpdated(publicPr).then(h.verifyResponse(200)),
        prUpdated(hiddenPr).then(h.verifyResponse(200)),
      ]);

      // PR visibilities are still up-to-date.
      expect({ prNum: publicPr, isPublic: true }).toExistAsABuild();
      expect({ prNum: publicPr, isPublic: false }).not.toExistAsABuild();
      expect({ prNum: hiddenPr, isPublic: true }).not.toExistAsABuild();
      expect({ prNum: hiddenPr, isPublic: false }).toExistAsABuild();
    });


    it('should reject a request if re-checking visibility fails', async () => {
      const errorPr = PrNums.TRUST_CHECK_ERROR;

      h.createDummyBuild(errorPr, SHA, true);

      expect({ prNum: errorPr, isPublic: false }).not.toExistAsABuild(false);
      expect({ prNum: errorPr, isPublic: true }).toExistAsABuild(false);

      await prUpdated(errorPr).then(h.verifyResponse(500, /TRUST_CHECK_ERROR/));

      // PR visibility should not have been updated.
      expect({ prNum: errorPr, isPublic: false }).not.toExistAsABuild();
      expect({ prNum: errorPr, isPublic: true }).toExistAsABuild();
    });


    it('should reject a request if updating visibility fails', async () => {
      // One way to cause an error is to have both a public and a hidden directory for the same PR.
      h.createDummyBuild(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, SHA, false);
      h.createDummyBuild(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, SHA, true);

      const hiddenPrDir = h.getPrDir(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, false);
      const publicPrDir = h.getPrDir(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, true);
      const bodyRegex = new RegExp(`Request to move '${hiddenPrDir}' to existing directory '${publicPrDir}'`);

      expect({ prNum: PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, isPublic: false }).toExistAsABuild(false);
      expect({ prNum: PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, isPublic: true }).toExistAsABuild(false);

      await prUpdated(PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER).then(h.verifyResponse(409, bodyRegex));

      // PR visibility should not have been updated.
      expect({ prNum: PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, isPublic: false }).toExistAsABuild();
      expect({ prNum: PrNums.TRUST_CHECK_ACTIVE_TRUSTED_USER, isPublic: true }).toExistAsABuild();
    });

  });

}));
