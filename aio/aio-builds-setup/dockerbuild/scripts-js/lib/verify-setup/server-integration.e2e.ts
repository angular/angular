// Imports
import * as path from 'path';
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
    // Using `FAKE_VERIFICATION_ERROR` or `FAKE_VERIFIED_NOT_TRUSTED` as `authHeader`,
    // we can fake the response of the overwritten `BuildVerifier.verify()` method.
    // (See 'lib/upload-server/index-test.ts'.)
    const curlPost = `curl -iLX POST --header "Authorization: ${authHeader}"`;
    return h.runCmd(`${curlPost} --data-binary "@${archive}" ${scheme}://${host}/create-build/${pr}/${sha}`);
  };

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000);
  afterEach(() => {
    h.deletePrDir(pr9);
    h.deletePrDir(pr9, false);
    h.cleanUp();
  });


  describe('for a new PR', () => {

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

      uploadBuild(pr9, sha9, archivePath, 'FAKE_VERIFIED_NOT_TRUSTED').
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

      uploadBuild(pr9, sha9, archivePath, 'FAKE_VERIFICATION_ERROR').
        then(h.verifyResponse(403, errorRegex9)).
        then(() => {
          expect(h.buildExists(pr9)).toBe(false);
          expect(h.buildExists(pr9, '', false)).toBe(false);
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

      uploadBuild(pr9, sha9, archivePath, 'FAKE_VERIFIED_NOT_TRUSTED').
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

      uploadBuild(pr9, sha9, archivePath, 'FAKE_VERIFICATION_ERROR').
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

      uploadBuild(pr9, sha9, archivePath, 'FAKE_VERIFIED_NOT_TRUSTED').
        then(h.verifyResponse(409)).
        then(() => {
          expect(h.readBuildFile(pr9, sha9, 'index.html', false)).toMatch(idxContentRegex9);
          expect(h.readBuildFile(pr9, sha9, 'foo/bar.js', false)).toMatch(barContentRegex9);
        }).
        then(done);
    });

  });

}));
