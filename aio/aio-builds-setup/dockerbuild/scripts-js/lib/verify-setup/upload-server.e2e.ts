// Imports
import * as fs from 'fs';
import * as path from 'path';
import * as c from './constants';
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
    const defaultHeaders = `${authorizationHeader} ${xFileHeader}`;
    const curl = (url: string, headers = defaultHeaders) => `curl -iL ${headers} ${url}`;


    it('should disallow non-GET requests', done => {
      const url = `http://${host}/create-build/${pr}/${sha9}`;
      const bodyRegex = /^Unknown resource/;

      Promise.all([
        h.runCmd(`curl -iLX PUT ${url}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX POST ${url}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX PATCH ${url}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX DELETE ${url}`).then(h.verifyResponse(404, bodyRegex)),
      ]).then(done);
    });


    it('should reject requests without an \'AUTHORIZATION\' header', done => {
      const headers1 = '';
      const headers2 = '--header "AUTHORIXATION: "';
      const url = `http://${host}/create-build/${pr}/${sha9}`;
      const bodyRegex = /^Missing or empty 'AUTHORIZATION' header/;

      Promise.all([
        h.runCmd(curl(url, headers1)).then(h.verifyResponse(401, bodyRegex)),
        h.runCmd(curl(url, headers2)).then(h.verifyResponse(401, bodyRegex)),
      ]).then(done);
    });


    it('should reject requests without an \'X-FILE\' header', done => {
      const headers1 = authorizationHeader;
      const headers2 = `${authorizationHeader} --header "X-FILE: "`;
      const url = `http://${host}/create-build/${pr}/${sha9}`;
      const bodyRegex = /^Missing or empty 'X-FILE' header/;

      Promise.all([
        h.runCmd(curl(url, headers1)).then(h.verifyResponse(400, bodyRegex)),
        h.runCmd(curl(url, headers2)).then(h.verifyResponse(400, bodyRegex)),
      ]).then(done);
    });


    it('should reject requests for which the PR verification fails', done => {
      const headers = `--header "Authorization: ${c.BV_verify_error}" ${xFileHeader}`;
      const url = `http://${host}/create-build/${pr}/${sha9}`;
      const bodyRegex = new RegExp(`Error while verifying upload for PR ${pr}: Test`);

      h.runCmd(curl(url, headers)).
        then(h.verifyResponse(403, bodyRegex)).
        then(done);
    });


    it('should respond with 404 for unknown paths', done => {
      const cmdPrefix = curl(`http://${host}`);

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
      h.runCmd(curl(`http://${host}/create-build/0${pr}/${sha9}`)).
        then(h.verifyResponse(404)).
        then(done);
    });


    it('should accept SHAs with leading zeros (but not trim the zeros)', done => {
      Promise.all([
        h.runCmd(curl(`http://${host}/create-build/${pr}/0${sha9}`)).then(h.verifyResponse(404)),
        h.runCmd(curl(`http://${host}/create-build/${pr}/${sha9}`)).then(h.verifyResponse(500)),
        h.runCmd(curl(`http://${host}/create-build/${pr}/${sha0}`)).then(h.verifyResponse(500)),
      ]).then(done);
    });


    [true, false].forEach(isPublic => describe(`(for ${isPublic ? 'public' : 'hidden'} builds)`, () => {
      const authorizationHeader2 = isPublic ?
        authorizationHeader : `--header "Authorization: ${c.BV_verify_verifiedNotTrusted}"`;
      const cmdPrefix = curl('', `${authorizationHeader2} ${xFileHeader}`);
      const overwriteRe = RegExp(`^Request to overwrite existing ${isPublic ? 'public' : 'non-public'} directory`);


      it('should not overwrite existing builds', done => {
        h.createDummyBuild(pr, sha9, isPublic);
        expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toContain('index.html');

        h.writeBuildFile(pr, sha9, 'index.html', 'My content', isPublic);
        expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toBe('My content');

        h.runCmd(`${cmdPrefix} http://${host}/create-build/${pr}/${sha9}`).
          then(h.verifyResponse(409, overwriteRe)).
          then(() => expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toBe('My content')).
          then(done);
      });


      it('should not overwrite existing builds (even if the SHA is different)', done => {
        // Since only the first few characters of the SHA are used, it is possible for two different
        // SHAs to correspond to the same directory. In that case, we don't want the second SHA to
        // overwrite the first.

        const sha9Almost = sha9.replace(/.$/, '8');
        expect(sha9Almost).not.toBe(sha9);

        h.createDummyBuild(pr, sha9, isPublic);
        expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toContain('index.html');

        h.writeBuildFile(pr, sha9, 'index.html', 'My content', isPublic);
        expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toBe('My content');

        h.runCmd(`${cmdPrefix} http://${host}/create-build/${pr}/${sha9Almost}`).
          then(h.verifyResponse(409, overwriteRe)).
          then(() => expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toBe('My content')).
          then(done);
      });


      it('should delete the PR directory on error (for new PR)', done => {
        h.runCmd(`${cmdPrefix} http://${host}/create-build/${pr}/${sha9}`).
          then(h.verifyResponse(500)).
          then(() => expect(h.buildExists(pr, '', isPublic)).toBe(false)).
          then(done);
      });


      it('should only delete the SHA directory on error (for existing PR)', done => {
        h.createDummyBuild(pr, sha0, isPublic);

        h.runCmd(`${cmdPrefix} http://${host}/create-build/${pr}/${sha9}`).
          then(h.verifyResponse(500)).
          then(() => {
            expect(h.buildExists(pr, sha9, isPublic)).toBe(false);
            expect(h.buildExists(pr, '', isPublic)).toBe(true);
          }).
          then(done);
      });


      describe('on successful upload', () => {
        const archivePath = path.join(h.buildsDir, 'snapshot.tar.gz');
        const statusCode = isPublic ? 201 : 202;
        let uploadPromise: Promise<CmdResult>;

        beforeEach(() => {
          h.createDummyArchive(pr, sha9, archivePath);
          uploadPromise = h.runCmd(`${cmdPrefix} http://${host}/create-build/${pr}/${sha9}`);
        });
        afterEach(() => h.deletePrDir(pr, isPublic));


        it(`should respond with ${statusCode}`, done => {
          uploadPromise.then(h.verifyResponse(statusCode)).then(done);
        });


        it('should extract the contents of the uploaded file', done => {
          uploadPromise.
            then(() => {
              expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toContain(`uploaded/${pr}`);
              expect(h.readBuildFile(pr, sha9, 'foo/bar.js', isPublic)).toContain(`uploaded/${pr}`);
            }).
            then(done);
        });


        it(`should create files/directories owned by '${h.wwwUser}'`, done => {
          const prDir = h.getPrDir(pr, isPublic);
          const shaDir = h.getShaDir(prDir, sha9);
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
          const prDir = h.getPrDir(pr, isPublic);
          const shaDir = h.getShaDir(prDir, sha9);
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


        it('should ignore a legacy 40-chars long build directory (even if it starts with the same chars)', done => {
          // It is possible that 40-chars long build directories exist, if they had been deployed
          // before implementing the shorter build directory names. In that case, we don't want the
          // second (shorter) name to be considered the same as the old one (even if they originate
          // from the same SHA).

          h.createDummyBuild(pr, sha9, isPublic, false, true);
          expect(h.readBuildFile(pr, sha9, 'index.html', isPublic, true)).toContain('index.html');

          h.writeBuildFile(pr, sha9, 'index.html', 'My content', isPublic, true);
          expect(h.readBuildFile(pr, sha9, 'index.html', isPublic, true)).toBe('My content');

          h.runCmd(`${cmdPrefix} http://${host}/create-build/${pr}/${sha9}`).
            then(h.verifyResponse(statusCode)).
            then(() => {
              expect(h.buildExists(pr, sha9, isPublic)).toBe(true);
              expect(h.buildExists(pr, sha9, isPublic, true)).toBe(true);
              expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toContain('index.html');
              expect(h.readBuildFile(pr, sha9, 'index.html', isPublic, true)).toBe('My content');
            }).
            then(done);
        });

      });


      describe('when the PR\'s visibility has changed', () => {
        const archivePath = path.join(h.buildsDir, 'snapshot.tar.gz');
        const statusCode = isPublic ? 201 : 202;

        const checkPrVisibility = (isPublic2: boolean) => {
          expect(h.buildExists(pr, '', isPublic2)).toBe(true);
          expect(h.buildExists(pr, '', !isPublic2)).toBe(false);
          expect(h.buildExists(pr, sha0, isPublic2)).toBe(true);
          expect(h.buildExists(pr, sha0, !isPublic2)).toBe(false);
        };
        const uploadBuild = (sha: string) => h.runCmd(`${cmdPrefix} http://${host}/create-build/${pr}/${sha}`);

        beforeEach(() => {
          h.createDummyBuild(pr, sha0, !isPublic);
          h.createDummyArchive(pr, sha9, archivePath);
          checkPrVisibility(!isPublic);
        });
        afterEach(() => h.deletePrDir(pr, isPublic));


        it('should update the PR\'s visibility', done => {
          uploadBuild(sha9).
            then(h.verifyResponse(statusCode)).
            then(() => {
              checkPrVisibility(isPublic);
              expect(h.buildExists(pr, sha9, isPublic)).toBe(true);
              expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toContain(`uploaded/${pr}`);
              expect(h.readBuildFile(pr, sha9, 'index.html', isPublic)).toContain(sha9);
            }).
            then(done);
        });


        it('should not overwrite existing builds (but keep the updated visibility)', done => {
          expect(h.buildExists(pr, sha0, isPublic)).toBe(false);

          uploadBuild(sha0).
            then(h.verifyResponse(409, overwriteRe)).
            then(() => {
              checkPrVisibility(isPublic);
              expect(h.readBuildFile(pr, sha0, 'index.html', isPublic)).toContain(pr);
              expect(h.readBuildFile(pr, sha0, 'index.html', isPublic)).not.toContain(`uploaded/${pr}`);
              expect(h.readBuildFile(pr, sha0, 'index.html', isPublic)).toContain(sha0);
              expect(h.readBuildFile(pr, sha0, 'index.html', isPublic)).not.toContain(sha9);
            }).
            then(done);
        });


        it('should reject the request if it fails to update the PR\'s visibility', done => {
          // One way to cause an error is to have both a public and a hidden directory for the same PR.
          h.createDummyBuild(pr, sha0, isPublic);

          expect(h.buildExists(pr, sha0, isPublic)).toBe(true);
          expect(h.buildExists(pr, sha0, !isPublic)).toBe(true);

          const errorRegex = new RegExp(`^Request to move '${h.getPrDir(pr, !isPublic)}' ` +
                                        `to existing directory '${h.getPrDir(pr, isPublic)}'.`);

          uploadBuild(sha9).
            then(h.verifyResponse(409, errorRegex)).
            then(() => {
              expect(h.buildExists(pr, sha0, isPublic)).toBe(true);
              expect(h.buildExists(pr, sha0, !isPublic)).toBe(true);
              expect(h.buildExists(pr, sha9, isPublic)).toBe(false);
              expect(h.buildExists(pr, sha9, !isPublic)).toBe(false);
            }).
            then(done);
        });

      });

    }));

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


  describe(`${host}/pr-updated`, () => {
    const url = `http://${host}/pr-updated`;

    // Helpers
    const curl = (payload?: {number: number, action?: string}) => {
      const payloadStr = payload && JSON.stringify(payload) || '';
      return `curl -iLX POST --header "Content-Type: application/json" --data '${payloadStr}' ${url}`;
    };


    it('should disallow non-POST requests', done => {
      const bodyRegex = /^Unknown resource in request/;

      Promise.all([
        h.runCmd(`curl -iLX GET ${url}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX PUT ${url}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX PATCH ${url}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX DELETE ${url}`).then(h.verifyResponse(404, bodyRegex)),
      ]).then(done);
    });


    it('should respond with 400 for requests without a payload', done => {
      const bodyRegex = /^Missing or empty 'number' field in request/;

      h.runCmd(curl()).
        then(h.verifyResponse(400, bodyRegex)).
        then(done);
    });


    it('should respond with 400 for requests without a \'number\' field', done => {
      const bodyRegex = /^Missing or empty 'number' field in request/;

      Promise.all([
        h.runCmd(curl({} as any)).then(h.verifyResponse(400, bodyRegex)),
        h.runCmd(curl({number: null} as any)).then(h.verifyResponse(400, bodyRegex)),
      ]).then(done);
    });


    it('should reject requests for which checking the PR visibility fails', done => {
      h.runCmd(curl({number: c.BV_getPrIsTrusted_error})).
        then(h.verifyResponse(500, /Test/)).
        then(done);
    });


    it('should respond with 404 for unknown paths', done => {
      const mockPayload = JSON.stringify({number: +pr});
      const cmdPrefix = `curl -iLX POST --data "${mockPayload}" http://${host}`;

      Promise.all([
        h.runCmd(`${cmdPrefix}/foo/pr-updated`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/foo-pr-updated`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/foonpr-updated`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/pr-updated/foo`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/pr-updated-foo`).then(h.verifyResponse(404)),
        h.runCmd(`${cmdPrefix}/pr-updatednfoo`).then(h.verifyResponse(404)),
      ]).then(done);
    });


    it('should do nothing if PR\'s visibility is already up-to-date', done => {
      const publicPr = pr;
      const hiddenPr = String(c.BV_getPrIsTrusted_notTrusted);
      const checkVisibilities = () => {
        // Public build is already public.
        expect(h.buildExists(publicPr, '', false)).toBe(false);
        expect(h.buildExists(publicPr, '', true)).toBe(true);
        // Hidden build is already hidden.
        expect(h.buildExists(hiddenPr, '', false)).toBe(true);
        expect(h.buildExists(hiddenPr, '', true)).toBe(false);
      };

      h.createDummyBuild(publicPr, sha9, true);
      h.createDummyBuild(hiddenPr, sha9, false);
      checkVisibilities();

      Promise.
        all([
          h.runCmd(curl({number: +publicPr, action: 'foo'})).then(h.verifyResponse(200)),
          h.runCmd(curl({number: +hiddenPr, action: 'foo'})).then(h.verifyResponse(200)),
        ]).
        // Visibilities should not have changed, because the specified action could not have triggered a change.
        then(checkVisibilities).
        then(done);
    });


    it('should do nothing if \'action\' implies no visibility change', done => {
      const publicPr = pr;
      const hiddenPr = String(c.BV_getPrIsTrusted_notTrusted);
      const checkVisibilities = () => {
        // Public build is hidden atm.
        expect(h.buildExists(publicPr, '', false)).toBe(true);
        expect(h.buildExists(publicPr, '', true)).toBe(false);
        // Hidden build is public atm.
        expect(h.buildExists(hiddenPr, '', false)).toBe(false);
        expect(h.buildExists(hiddenPr, '', true)).toBe(true);
      };

      h.createDummyBuild(publicPr, sha9, false);
      h.createDummyBuild(hiddenPr, sha9, true);
      checkVisibilities();

      Promise.
        all([
          h.runCmd(curl({number: +publicPr, action: 'foo'})).then(h.verifyResponse(200)),
          h.runCmd(curl({number: +hiddenPr, action: 'foo'})).then(h.verifyResponse(200)),
        ]).
        // Visibilities should not have changed, because the specified action could not have triggered a change.
        then(checkVisibilities).
        then(done);
    });


    describe('when the visiblity has changed', () => {
      const publicPr = pr;
      const hiddenPr = String(c.BV_getPrIsTrusted_notTrusted);

      beforeEach(() => {
        // Create initial PR builds with opposite visibilities as the ones that will be reported:
        // - The now public PR was previously hidden.
        // - The now hidden PR was previously public.
        h.createDummyBuild(publicPr, sha9, false);
        h.createDummyBuild(hiddenPr, sha9, true);

        expect(h.buildExists(publicPr, '', false)).toBe(true);
        expect(h.buildExists(publicPr, '', true)).toBe(false);
        expect(h.buildExists(hiddenPr, '', false)).toBe(false);
        expect(h.buildExists(hiddenPr, '', true)).toBe(true);
      });
      afterEach(() => {
        // Expect PRs' visibility to have been updated:
        // - The public PR should be actually public (previously it was hidden).
        // - The hidden PR should be actually hidden (previously it was public).
        expect(h.buildExists(publicPr, '', false)).toBe(false);
        expect(h.buildExists(publicPr, '', true)).toBe(true);
        expect(h.buildExists(hiddenPr, '', false)).toBe(true);
        expect(h.buildExists(hiddenPr, '', true)).toBe(false);

        h.deletePrDir(publicPr, true);
        h.deletePrDir(hiddenPr, false);
      });


      it('should update the PR\'s visibility (action: undefined)', done => {
        Promise.all([
          h.runCmd(curl({number: +publicPr})).then(h.verifyResponse(200)),
          h.runCmd(curl({number: +hiddenPr})).then(h.verifyResponse(200)),
        ]).then(done);
      });


      it('should update the PR\'s visibility (action: labeled)', done => {
        Promise.all([
          h.runCmd(curl({number: +publicPr, action: 'labeled'})).then(h.verifyResponse(200)),
          h.runCmd(curl({number: +hiddenPr, action: 'labeled'})).then(h.verifyResponse(200)),
        ]).then(done);
      });


      it('should update the PR\'s visibility (action: unlabeled)', done => {
        Promise.all([
          h.runCmd(curl({number: +publicPr, action: 'unlabeled'})).then(h.verifyResponse(200)),
          h.runCmd(curl({number: +hiddenPr, action: 'unlabeled'})).then(h.verifyResponse(200)),
        ]).then(done);
      });

    });

  });


  describe(`${host}/*`, () => {

    it('should respond with 404 for requests to unknown URLs', done => {
      const bodyRegex = /^Unknown resource/;

      Promise.all([
        h.runCmd(`curl -iL http://${host}/index.html`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iL http://${host}/`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iL http://${host}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX PUT http://${host}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX POST http://${host}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX PATCH http://${host}`).then(h.verifyResponse(404, bodyRegex)),
        h.runCmd(`curl -iLX DELETE http://${host}`).then(h.verifyResponse(404, bodyRegex)),
      ]).then(done);
    });

  });

});
