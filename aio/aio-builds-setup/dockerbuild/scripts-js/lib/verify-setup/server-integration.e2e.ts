// Imports
import * as path from 'path';
import * as c from './constants';
import {helper as h} from './helper';

// Tests
h.runForAllSupportedSchemes((scheme, port) => describe(`integration (on ${scheme.toUpperCase()})`, () => {
  const hostname = h.nginxHostname;
  const host = `${hostname}:${port}`;
  const pr9 = '9';
  const sha9 = '9'.repeat(40);
  const sha0 = '0'.repeat(40);
  const archivePath = path.join(h.buildsDir, 'snapshot.tar.gz');

  const getFile = (pr: string, sha: string, file: string) =>
    h.runCmd(`curl -iL ${scheme}://pr${pr}-${h.getShordSha(sha)}.${host}/${file}`);
  const uploadBuild = (pr: string, sha: string, archive: string, authHeader = 'Token FOO') => {
    const curlPost = `curl -iLX POST --header "Authorization: ${authHeader}"`;
    return h.runCmd(`${curlPost} --data-binary "@${archive}" ${scheme}://${host}/create-build/${pr}/${sha}`);
  };
  const prUpdated = (pr: number, action?: string) => {
    const url = `${scheme}://${host}/pr-updated`;
    const payloadStr = JSON.stringify({number: pr, action});
    return h.runCmd(`curl -iLX POST --header "Content-Type: application/json" --data '${payloadStr}' ${url}`);
  };

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000);
  afterEach(() => {
    h.deletePrDir(pr9);
    h.deletePrDir(pr9, false);
    h.cleanUp();
  });


  describe('for a new/non-existing PR', () => {

    it('should be able to upload and serve a public build', done => {
      const regexPrefix9 = `^PR: uploaded\\/${pr9} \\| SHA: ${sha9} \\| File:`;
      const idxContentRegex9 = new RegExp(`${regexPrefix9} \\/index\\.html$`);
      const barContentRegex9 = new RegExp(`${regexPrefix9} \\/foo\\/bar\\.js$`);

      h.createDummyArchive(pr9, sha9, archivePath);

      uploadBuild(pr9, sha9, archivePath).
        then(() => Promise.all([
          getFile(pr9, sha9, 'index.html').then(h.verifyResponse(200, idxContentRegex9)),
          getFile(pr9, sha9, 'foo/bar.js').then(h.verifyResponse(200, barContentRegex9)),
        ])).
        then(done);
    });


    it('should be able to upload but not serve a hidden build', done => {
      const regexPrefix9 = `^PR: uploaded\\/${pr9} \\| SHA: ${sha9} \\| File:`;
      const idxContentRegex9 = new RegExp(`${regexPrefix9} \\/index\\.html$`);
      const barContentRegex9 = new RegExp(`${regexPrefix9} \\/foo\\/bar\\.js$`);

      h.createDummyArchive(pr9, sha9, archivePath);

      uploadBuild(pr9, sha9, archivePath, c.BV_verify_verifiedNotTrusted).
        then(() => Promise.all([
          getFile(pr9, sha9, 'index.html').then(h.verifyResponse(404)),
          getFile(pr9, sha9, 'foo/bar.js').then(h.verifyResponse(404)),
        ])).
        then(() => {
          expect(h.buildExists(pr9, sha9)).toBe(false);
          expect(h.buildExists(pr9, sha9, false)).toBe(true);
          expect(h.readBuildFile(pr9, sha9, 'index.html', false)).toMatch(idxContentRegex9);
          expect(h.readBuildFile(pr9, sha9, 'foo/bar.js', false)).toMatch(barContentRegex9);
        }).
        then(done);
    });


    it('should reject an upload if verification fails', done => {
      const errorRegex9 = new RegExp(`Error while verifying upload for PR ${pr9}: Test`);

      h.createDummyArchive(pr9, sha9, archivePath);

      uploadBuild(pr9, sha9, archivePath, c.BV_verify_error).
        then(h.verifyResponse(403, errorRegex9)).
        then(() => {
          expect(h.buildExists(pr9)).toBe(false);
          expect(h.buildExists(pr9, '', false)).toBe(false);
        }).
        then(done);
    });


    it('should be able to notify that a PR has been updated (and do nothing)', done => {
      prUpdated(+pr9).
        then(h.verifyResponse(200)).
        then(() => {
          // The PR should still not exist.
          expect(h.buildExists(pr9, '', false)).toBe(false);
          expect(h.buildExists(pr9, '', true)).toBe(false);
        }).
        then(done);
    });

  });


  describe('for an existing PR', () => {

    it('should be able to upload and serve a public build', done => {
      const regexPrefix0 = `^PR: ${pr9} \\| SHA: ${sha0} \\| File:`;
      const idxContentRegex0 = new RegExp(`${regexPrefix0} \\/index\\.html$`);
      const barContentRegex0 = new RegExp(`${regexPrefix0} \\/foo\\/bar\\.js$`);

      const regexPrefix9 = `^PR: uploaded\\/${pr9} \\| SHA: ${sha9} \\| File:`;
      const idxContentRegex9 = new RegExp(`${regexPrefix9} \\/index\\.html$`);
      const barContentRegex9 = new RegExp(`${regexPrefix9} \\/foo\\/bar\\.js$`);

      h.createDummyBuild(pr9, sha0);
      h.createDummyArchive(pr9, sha9, archivePath);

      uploadBuild(pr9, sha9, archivePath).
        then(() => Promise.all([
          getFile(pr9, sha0, 'index.html').then(h.verifyResponse(200, idxContentRegex0)),
          getFile(pr9, sha0, 'foo/bar.js').then(h.verifyResponse(200, barContentRegex0)),
          getFile(pr9, sha9, 'index.html').then(h.verifyResponse(200, idxContentRegex9)),
          getFile(pr9, sha9, 'foo/bar.js').then(h.verifyResponse(200, barContentRegex9)),
        ])).
        then(done);
    });


    it('should be able to upload but not serve a hidden build', done => {
      const regexPrefix0 = `^PR: ${pr9} \\| SHA: ${sha0} \\| File:`;
      const idxContentRegex0 = new RegExp(`${regexPrefix0} \\/index\\.html$`);
      const barContentRegex0 = new RegExp(`${regexPrefix0} \\/foo\\/bar\\.js$`);

      const regexPrefix9 = `^PR: uploaded\\/${pr9} \\| SHA: ${sha9} \\| File:`;
      const idxContentRegex9 = new RegExp(`${regexPrefix9} \\/index\\.html$`);
      const barContentRegex9 = new RegExp(`${regexPrefix9} \\/foo\\/bar\\.js$`);

      h.createDummyBuild(pr9, sha0, false);
      h.createDummyArchive(pr9, sha9, archivePath);

      uploadBuild(pr9, sha9, archivePath, c.BV_verify_verifiedNotTrusted).
        then(() => Promise.all([
          getFile(pr9, sha0, 'index.html').then(h.verifyResponse(404)),
          getFile(pr9, sha0, 'foo/bar.js').then(h.verifyResponse(404)),
          getFile(pr9, sha9, 'index.html').then(h.verifyResponse(404)),
          getFile(pr9, sha9, 'foo/bar.js').then(h.verifyResponse(404)),
        ])).
        then(() => {
          expect(h.buildExists(pr9, sha9)).toBe(false);
          expect(h.buildExists(pr9, sha9, false)).toBe(true);
          expect(h.readBuildFile(pr9, sha0, 'index.html', false)).toMatch(idxContentRegex0);
          expect(h.readBuildFile(pr9, sha0, 'foo/bar.js', false)).toMatch(barContentRegex0);
          expect(h.readBuildFile(pr9, sha9, 'index.html', false)).toMatch(idxContentRegex9);
          expect(h.readBuildFile(pr9, sha9, 'foo/bar.js', false)).toMatch(barContentRegex9);
        }).
        then(done);
    });


    it('should reject an upload if verification fails', done => {
      const errorRegex9 = new RegExp(`Error while verifying upload for PR ${pr9}: Test`);

      h.createDummyBuild(pr9, sha0);
      h.createDummyArchive(pr9, sha9, archivePath);

      uploadBuild(pr9, sha9, archivePath, c.BV_verify_error).
        then(h.verifyResponse(403, errorRegex9)).
        then(() => {
          expect(h.buildExists(pr9)).toBe(true);
          expect(h.buildExists(pr9, sha0)).toBe(true);
          expect(h.buildExists(pr9, sha9)).toBe(false);
        }).
        then(done);

    });


    it('should not be able to overwrite an existing public build', done => {
      const regexPrefix9 = `^PR: ${pr9} \\| SHA: ${sha9} \\| File:`;
      const idxContentRegex9 = new RegExp(`${regexPrefix9} \\/index\\.html$`);
      const barContentRegex9 = new RegExp(`${regexPrefix9} \\/foo\\/bar\\.js$`);

      h.createDummyBuild(pr9, sha9);
      h.createDummyArchive(pr9, sha9, archivePath);

      uploadBuild(pr9, sha9, archivePath).
        then(h.verifyResponse(409)).
        then(() => Promise.all([
          getFile(pr9, sha9, 'index.html').then(h.verifyResponse(200, idxContentRegex9)),
          getFile(pr9, sha9, 'foo/bar.js').then(h.verifyResponse(200, barContentRegex9)),
        ])).
        then(done);
    });


    it('should not be able to overwrite an existing hidden build', done => {
      const regexPrefix9 = `^PR: ${pr9} \\| SHA: ${sha9} \\| File:`;
      const idxContentRegex9 = new RegExp(`${regexPrefix9} \\/index\\.html$`);
      const barContentRegex9 = new RegExp(`${regexPrefix9} \\/foo\\/bar\\.js$`);

      h.createDummyBuild(pr9, sha9, false);
      h.createDummyArchive(pr9, sha9, archivePath);

      uploadBuild(pr9, sha9, archivePath, c.BV_verify_verifiedNotTrusted).
        then(h.verifyResponse(409)).
        then(() => {
          expect(h.readBuildFile(pr9, sha9, 'index.html', false)).toMatch(idxContentRegex9);
          expect(h.readBuildFile(pr9, sha9, 'foo/bar.js', false)).toMatch(barContentRegex9);
        }).
        then(done);
    });


    it('should be able to request re-checking visibility (if outdated)', done => {
      const publicPr = pr9;
      const hiddenPr = String(c.BV_getPrIsTrusted_notTrusted);

      h.createDummyBuild(publicPr, sha9, false);
      h.createDummyBuild(hiddenPr, sha9, true);

      // PR visibilities are outdated (i.e. the opposte of what the should).
      expect(h.buildExists(publicPr, '', false)).toBe(true);
      expect(h.buildExists(publicPr, '', true)).toBe(false);
      expect(h.buildExists(hiddenPr, '', false)).toBe(false);
      expect(h.buildExists(hiddenPr, '', true)).toBe(true);

      Promise.
        all([
          prUpdated(+publicPr).then(h.verifyResponse(200)),
          prUpdated(+hiddenPr).then(h.verifyResponse(200)),
        ]).
        then(() => {
          // PR visibilities should have been updated.
          expect(h.buildExists(publicPr, '', false)).toBe(false);
          expect(h.buildExists(publicPr, '', true)).toBe(true);
          expect(h.buildExists(hiddenPr, '', false)).toBe(true);
          expect(h.buildExists(hiddenPr, '', true)).toBe(false);
        }).
        then(() => {
          h.deletePrDir(publicPr, true);
          h.deletePrDir(hiddenPr, false);
        }).
        then(done);
    });


    it('should be able to request re-checking visibility (if up-to-date)', done => {
      const publicPr = pr9;
      const hiddenPr = String(c.BV_getPrIsTrusted_notTrusted);

      h.createDummyBuild(publicPr, sha9, true);
      h.createDummyBuild(hiddenPr, sha9, false);

      // PR visibilities are already up-to-date.
      expect(h.buildExists(publicPr, '', false)).toBe(false);
      expect(h.buildExists(publicPr, '', true)).toBe(true);
      expect(h.buildExists(hiddenPr, '', false)).toBe(true);
      expect(h.buildExists(hiddenPr, '', true)).toBe(false);

      Promise.
        all([
          prUpdated(+publicPr).then(h.verifyResponse(200)),
          prUpdated(+hiddenPr).then(h.verifyResponse(200)),
        ]).
        then(() => {
          // PR visibilities are still up-to-date.
          expect(h.buildExists(publicPr, '', false)).toBe(false);
          expect(h.buildExists(publicPr, '', true)).toBe(true);
          expect(h.buildExists(hiddenPr, '', false)).toBe(true);
          expect(h.buildExists(hiddenPr, '', true)).toBe(false);
        }).
        then(done);
    });


    it('should reject a request if re-checking visibility fails', done => {
      const errorPr = String(c.BV_getPrIsTrusted_error);

      h.createDummyBuild(errorPr, sha9, true);

      expect(h.buildExists(errorPr, '', false)).toBe(false);
      expect(h.buildExists(errorPr, '', true)).toBe(true);

      prUpdated(+errorPr).
        then(h.verifyResponse(500, /Test/)).
        then(() => {
          // PR visibility should not have been updated.
          expect(h.buildExists(errorPr, '', false)).toBe(false);
          expect(h.buildExists(errorPr, '', true)).toBe(true);
        }).
        then(done);
    });


    it('should reject a request if updating visibility fails', done => {
      // One way to cause an error is to have both a public and a hidden directory for the same PR.
      h.createDummyBuild(pr9, sha9, false);
      h.createDummyBuild(pr9, sha9, true);

      const hiddenPrDir = h.getPrDir(pr9, false);
      const publicPrDir = h.getPrDir(pr9, true);
      const bodyRegex = new RegExp(`Request to move '${hiddenPrDir}' to existing directory '${publicPrDir}'`);

      expect(h.buildExists(pr9, '', false)).toBe(true);
      expect(h.buildExists(pr9, '', true)).toBe(true);

      prUpdated(+pr9).
        then(h.verifyResponse(409, bodyRegex)).
        then(() => {
          // PR visibility should not have been updated.
          expect(h.buildExists(pr9, '', false)).toBe(true);
          expect(h.buildExists(pr9, '', true)).toBe(true);
        }).
        then(done);
    });

  });

}));
