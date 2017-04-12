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
    h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha}.${host}/${file}`);
  const uploadBuild = (pr: string, sha: string, archive: string) => {
    const curlPost = 'curl -iLX POST --header "Authorization: Token FOO"';
    return h.runCmd(`${curlPost} --data-binary "@${archive}" ${scheme}://${host}/create-build/${pr}/${sha}`);
  };

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000);
  afterEach(() => {
    h.deletePrDir(pr9);
    h.cleanUp();
  });


  it('should be able to upload and serve a build for a new PR', done => {
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


  it('should be able to upload and serve a build for an existing PR', done => {
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


  it('should not be able to overwrite a build', done => {
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

}));
