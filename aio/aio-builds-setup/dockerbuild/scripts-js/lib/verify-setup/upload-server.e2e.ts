// Imports
import * as fs from 'fs';
import * as path from 'path';
import {CmdResult, helper as h} from './helper';

// Tests
describe('upload-server (on HTTP)', () => {
  const hostname = h.uploadHostname;
  const port = h.uploadPort;
  const host = `${hostname}:${port}`;
  const pr = '9';
  const sha9 = '9'.repeat(40);
  const sha0 = '0'.repeat(40);

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000);
  afterEach(() => h.cleanUp());


  describe(`${host}/create-build/<pr>/<sha>`, () => {
    const authorizationHeader = `--header "Authorization: Token FOO"`;
    const xFileHeader = `--header "X-File: ${h.buildsDir}/snapshot.tar.gz"`;
    const curl = `curl -iL ${authorizationHeader} ${xFileHeader}`;


    it('should disallow non-GET requests', done => {
      const url = `http://${host}/create-build/${pr}/${sha9}`;
      const bodyRegex = /^Unsupported method/;

      Promise.all([
        h.runCmd(`curl -iLX PUT ${url}`).then(h.verifyResponse(405, bodyRegex)),
        h.runCmd(`curl -iLX POST ${url}`).then(h.verifyResponse(405, bodyRegex)),
        h.runCmd(`curl -iLX PATCH ${url}`).then(h.verifyResponse(405, bodyRegex)),
        h.runCmd(`curl -iLX DELETE ${url}`).then(h.verifyResponse(405, bodyRegex)),
      ]).then(done);
    });


    it('should reject requests without an \'AUTHORIZATION\' header', done => {
      const headers1 = '';
      const headers2 = '--header "AUTHORIXATION: "';
      const url = `http://${host}/create-build/${pr}/${sha9}`;
      const bodyRegex = /^Missing or empty 'AUTHORIZATION' header/;

      Promise.all([
        h.runCmd(`curl -iL ${headers1} ${url}`).then(h.verifyResponse(401, bodyRegex)),
        h.runCmd(`curl -iL  ${headers2} ${url}`).then(h.verifyResponse(401, bodyRegex)),
      ]).then(done);
    });


    it('should reject requests without an \'X-FILE\' header', done => {
      const headers1 = authorizationHeader;
      const headers2 = `${authorizationHeader} --header "X-FILE: "`;
      const url = `http://${host}/create-build/${pr}/${sha9}`;
      const bodyRegex = /^Missing or empty 'X-FILE' header/;

      Promise.all([
        h.runCmd(`curl -iL ${headers1} ${url}`).then(h.verifyResponse(400, bodyRegex)),
        h.runCmd(`curl -iL ${headers2} ${url}`).then(h.verifyResponse(400, bodyRegex)),
      ]).then(done);
    });


    it('should respond with 404 for unknown paths', done => {
      const cmdPrefix = `${curl} http://${host}`;

      Promise.all([
        h.runCmd(`${cmdPrefix}/foo/create-build/${pr}/${sha9}`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/foo-create-build/${pr}/${sha9}`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/fooncreate-build/${pr}/${sha9}`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/create-build/foo/${pr}/${sha9}`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/create-build-foo/${pr}/${sha9}`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/create-buildnfoo/${pr}/${sha9}`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/create-build/pr${pr}/${sha9}`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/create-build/${pr}/${sha9}42`).then(h.verifyResponse(404)),
      ]).then(done);
    });


    it('should reject PRs with leading zeros', done => {
      h.runCmd(`${curl} http://${host}/create-build/0${pr}/${sha9}`).
        then(h.verifyResponse(404)).
        then(done);
    });


    it('should accept SHAs with leading zeros (but not trim the zeros)', done => {
      Promise.all([
        h.runCmd(`${curl} http://${host}/create-build/${pr}/0${sha9}`).then(h.verifyResponse(404)),
        h.runCmd(`${curl} http://${host}/create-build/${pr}/${sha9}`).then(h.verifyResponse(500)),
        h.runCmd(`${curl} http://${host}/create-build/${pr}/${sha0}`).then(h.verifyResponse(500)),
      ]).then(done);
    });


    it('should not overwrite existing builds', done => {
      h.createDummyBuild(pr, sha9);
      expect(h.readBuildFile(pr, sha9, 'index.html')).toContain('index.html');

      h.writeBuildFile(pr, sha9, 'index.html', 'My content');
      expect(h.readBuildFile(pr, sha9, 'index.html')).toBe('My content');

      h.runCmd(`${curl} http://${host}/create-build/${pr}/${sha9}`).
        then(h.verifyResponse(409, /^Request to overwrite existing directory/)).
        then(() => expect(h.readBuildFile(pr, sha9, 'index.html')).toBe('My content')).
        then(done);
    });


    it('should delete the PR directory on error (for new PR)', done => {
      const prDir = path.join(h.buildsDir, pr);

      h.runCmd(`${curl} http://${host}/create-build/${pr}/${sha9}`).
        then(h.verifyResponse(500)).
        then(() => expect(fs.existsSync(prDir)).toBe(false)).
        then(done);
    });


    it('should only delete the SHA directory on error (for existing PR)', done => {
      const prDir = path.join(h.buildsDir, pr);
      const shaDir = path.join(prDir, sha9);

      h.createDummyBuild(pr, sha0);

      h.runCmd(`${curl} http://${host}/create-build/${pr}/${sha9}`).
        then(h.verifyResponse(500)).
        then(() => {
          expect(fs.existsSync(shaDir)).toBe(false);
          expect(fs.existsSync(prDir)).toBe(true);
        }).
        then(done);
    });


    describe('on successful upload', () => {
      const archivePath = path.join(h.buildsDir, 'snapshot.tar.gz');
      let uploadPromise: Promise<CmdResult>;

      beforeEach(() => {
        h.createDummyArchive(pr, sha9, archivePath);
        uploadPromise = h.runCmd(`${curl} http://${host}/create-build/${pr}/${sha9}`);
      });
      afterEach(() => h.deletePrDir(pr));


      it('should respond with 201', done => {
        uploadPromise.then(h.verifyResponse(201)).then(done);
      });


      it('should extract the contents of the uploaded file', done => {
        uploadPromise.
          then(() => {
            expect(h.readBuildFile(pr, sha9, 'index.html')).toContain(`uploaded/${pr}`);
            expect(h.readBuildFile(pr, sha9, 'foo/bar.js')).toContain(`uploaded/${pr}`);
          }).
          then(done);
      });


      it(`should create files/directories owned by '${h.wwwUser}'`, done => {
        const shaDir = path.join(h.buildsDir, pr, sha9);
        const idxPath = path.join(shaDir, 'index.html');
        const barPath = path.join(shaDir, 'foo', 'bar.js');

        uploadPromise.
          then(() => Promise.all([
            h.runCmd(`find ${shaDir}`),
            h.runCmd(`find ${shaDir} -user ${h.wwwUser}`),
          ])).
          then(([{stdout: allFiles}, {stdout: userFiles}]) => {
            expect(userFiles).toBe(allFiles);
            expect(userFiles).toContain(shaDir);
            expect(userFiles).toContain(idxPath);
            expect(userFiles).toContain(barPath);
          }).
          then(done);
      });


      it('should delete the uploaded file', done => {
        expect(fs.existsSync(archivePath)).toBe(true);
        uploadPromise.
          then(() => expect(fs.existsSync(archivePath)).toBe(false)).
          then(done);
      });


      it('should make the build directory non-writable', done => {
        const shaDir = path.join(h.buildsDir, pr, sha9);
        const idxPath = path.join(shaDir, 'index.html');
        const barPath = path.join(shaDir, 'foo', 'bar.js');

        // See https://github.com/nodejs/node-v0.x-archive/issues/3045#issuecomment-4862588.
        const isNotWritable = (fileOrDir: string) => {
          const mode = fs.statSync(fileOrDir).mode;
          // tslint:disable-next-line: no-bitwise
          return !(mode & parseInt('222', 8));
        };

        uploadPromise.
          then(() => {
            expect(isNotWritable(shaDir)).toBe(true);
            expect(isNotWritable(idxPath)).toBe(true);
            expect(isNotWritable(barPath)).toBe(true);
          }).
          then(done);
      });

    });

  });


  describe(`${host}/health-check`, () => {

    it('should respond with 200', done => {
      Promise.all([
        h.runCmd(`curl -iL http://${host}/health-check`).then(h.verifyResponse(200)),
        h.runCmd(`curl -iL http://${host}/health-check/`).then(h.verifyResponse(200)),
      ]).then(done);
    });


    it('should respond with 404 if the path does not match exactly', done => {
      Promise.all([
        h.runCmd(`curl -iL http://${host}/health-check/foo`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL http://${host}/health-check-foo`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL http://${host}/health-checknfoo`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL http://${host}/foo/health-check`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL http://${host}/foo-health-check`).then(h.verifyResponse(404)),
        h.runCmd(`curl -iL http://${host}/foonhealth-check`).then(h.verifyResponse(404)),
      ]).then(done);
    });

  });


  describe(`${host}/*`, () => {

    it('should respond with 404 for GET requests to unknown URLs', done => {
      const bodyRegex = /^Unknown resource/;

      Promise.all([
        h.runCmd(`curl -iL http://${host}/index.html`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iL http://${host}/`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iL http://${host}`).then(h.verifyResponse(404, bodyRegex)),
      ]).then(done);
    });


    it('should respond with 405 for non-GET requests to any URL', done => {
      const bodyRegex = /^Unsupported method/;

      Promise.all([
        h.runCmd(`curl -iLX PUT http://${host}`).then(h.verifyResponse(405, bodyRegex)),
        h.runCmd(`curl -iLX POST http://${host}`).then(h.verifyResponse(405, bodyRegex)),
        h.runCmd(`curl -iLX PATCH http://${host}`).then(h.verifyResponse(405, bodyRegex)),
        h.runCmd(`curl -iLX DELETE http://${host}`).then(h.verifyResponse(405, bodyRegex)),
      ]).then(done);
    });

  });

});
