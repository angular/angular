// Imports
import * as path from 'path';
import {rm} from 'shelljs';
import {AIO_BUILDS_DIR, AIO_NGINX_HOSTNAME, AIO_NGINX_PORT_HTTP, AIO_NGINX_PORT_HTTPS} from '../common/env-variables';
import {computeShortSha} from '../common/utils';
import {PrNums} from './constants';
import {helper as h} from './helper';
import {customMatchers} from './jasmine-custom-matchers';

// Tests
describe(`nginx`, () => {

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000);
  beforeEach(() => jasmine.addMatchers(customMatchers));
  afterEach(() => h.cleanUp());


  it('should redirect HTTP to HTTPS', done => {
    const httpHost = `${AIO_NGINX_HOSTNAME}:${AIO_NGINX_PORT_HTTP}`;
    const httpsHost = `${AIO_NGINX_HOSTNAME}:${AIO_NGINX_PORT_HTTPS}`;
    const urlMap = {
      [`http://${httpHost}/`]: `https://${httpsHost}/`,
      [`http://${httpHost}/foo`]: `https://${httpsHost}/foo`,
      [`http://foo.${httpHost}/`]: `https://foo.${httpsHost}/`,
    };

    const verifyRedirection = (httpUrl: string) => h.runCmd(`curl -i ${httpUrl}`).then(result => {
      h.verifyResponse(307)(result);

      const headers = result.stdout.split(/(?:\r?\n){2,}/)[0];
      expect(headers).toContain(`Location: ${urlMap[httpUrl]}`);
    });

    Promise.
      all(Object.keys(urlMap).map(verifyRedirection)).
      then(done);
  });


  h.runForAllSupportedSchemes((scheme, port) => describe(`(on ${scheme.toUpperCase()})`, () => {
    const hostname = AIO_NGINX_HOSTNAME;
    const host = `${hostname}:${port}`;
    const pr = 9;
    const sha9 = '9'.repeat(40);
    const sha0 = '0'.repeat(40);
    const shortSha9 = computeShortSha(sha9);
    const shortSha0 = computeShortSha(sha0);


    describe(`pr<pr>-<sha>.${host}/*`, () => {

      describe('(for public builds)', () => {

        beforeEach(() => {
          h.createDummyBuild(pr, sha9);
          h.createDummyBuild(pr, sha0);
        });

        afterEach(() => {
          expect({ prNum: pr, sha: sha9 }).toExistAsABuild();
          expect({ prNum: pr, sha: sha0 }).toExistAsABuild();
        });


        it('should return /index.html', done => {
          const origin = `${scheme}://pr${pr}-${shortSha9}.${host}`;
          const bodyRegex = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /index\\.html$`);

          Promise.all([
            h.runCmd(`curl -iL ${origin}/index.html`).then(h.verifyResponse(200, bodyRegex)),
            h.runCmd(`curl -iL ${origin}/`).then(h.verifyResponse(200, bodyRegex)),
            h.runCmd(`curl -iL ${origin}`).then(h.verifyResponse(200, bodyRegex)),
          ]).then(done);
        });


        it('should return /index.html (for legacy builds)', async () => {
          const origin = `${scheme}://pr${pr}-${sha9}.${host}`;
          const bodyRegex = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /index\\.html$`);

          h.createDummyBuild(pr, sha9, true, false, true);

          await Promise.all([
            h.runCmd(`curl -iL ${origin}/index.html`).then(h.verifyResponse(200, bodyRegex)),
            h.runCmd(`curl -iL ${origin}/`).then(h.verifyResponse(200, bodyRegex)),
            h.runCmd(`curl -iL ${origin}`).then(h.verifyResponse(200, bodyRegex)),
          ]);

          expect({ prNum: pr, sha: sha9, isLegacy: true }).toExistAsABuild();
        });


        it('should return /foo/bar.js', done => {
          const bodyRegex = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /foo/bar\\.js$`);

          h.runCmd(`curl -iL ${scheme}://pr${pr}-${shortSha9}.${host}/foo/bar.js`).
            then(h.verifyResponse(200, bodyRegex)).
            then(done);
        });


        it('should return /foo/bar.js (for legacy builds)', async () => {
          const origin = `${scheme}://pr${pr}-${sha9}.${host}`;
          const bodyRegex = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /foo/bar\\.js$`);

          h.createDummyBuild(pr, sha9, true, false, true);

          await h.runCmd(`curl -iL ${origin}/foo/bar.js`).then(h.verifyResponse(200, bodyRegex));

          expect({ prNum: pr, sha: sha9, isLegacy: true }).toExistAsABuild();
        });


        it('should respond with 403 for directories', done => {
          Promise.all([
            h.runCmd(`curl -iL ${scheme}://pr${pr}-${shortSha9}.${host}/foo/`).then(h.verifyResponse(403)),
            h.runCmd(`curl -iL ${scheme}://pr${pr}-${shortSha9}.${host}/foo`).then(h.verifyResponse(403)),
          ]).then(done);
        });


        it('should respond with 404 for unknown paths to files', done => {
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${shortSha9}.${host}/foo/baz.css`).
            then(h.verifyResponse(404)).
            then(done);
        });


        it('should rewrite to \'index.html\' for unknown paths that don\'t look like files', done => {
          const origin = `${scheme}://pr${pr}-${shortSha9}.${host}`;
          const bodyRegex = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /index\\.html$`);

          Promise.all([
            h.runCmd(`curl -iL ${origin}/foo/baz`).then(h.verifyResponse(200, bodyRegex)),
            h.runCmd(`curl -iL ${origin}/foo/baz/`).then(h.verifyResponse(200, bodyRegex)),
          ]).then(done);
        });


        it('should respond with 404 for unknown PRs/SHAs', done => {
          const otherPr = 54321;
          const otherShortSha = computeShortSha('8'.repeat(40));

          Promise.all([
            h.runCmd(`curl -iL ${scheme}://pr${pr}9-${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://pr${otherPr}-${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://pr${pr}-${shortSha9}9.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://pr${pr}-${otherShortSha}.${host}`).then(h.verifyResponse(404)),
          ]).then(done);
        });


        it('should respond with 404 if the subdomain format is wrong', done => {
          Promise.all([
            h.runCmd(`curl -iL ${scheme}://xpr${pr}-${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://prx${pr}-${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://xx${pr}-${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://p${pr}-${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://r${pr}-${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://${pr}-${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://pr${pr}${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://pr${pr}_${shortSha9}.${host}`).then(h.verifyResponse(404)),
          ]).then(done);
        });


        it('should reject PRs with leading zeros', done => {
          h.runCmd(`curl -iL ${scheme}://pr0${pr}-${shortSha9}.${host}`).
            then(h.verifyResponse(404)).
            then(done);
        });


        it('should accept SHAs with leading zeros (but not trim the zeros)', done => {
          const bodyRegex9 = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /index\\.html$`);
          const bodyRegex0 = new RegExp(`^PR: ${pr} | SHA: ${sha0} | File: /index\\.html$`);

          Promise.all([
            h.runCmd(`curl -iL ${scheme}://pr${pr}-0${shortSha9}.${host}`).then(h.verifyResponse(404)),
            h.runCmd(`curl -iL ${scheme}://pr${pr}-${shortSha9}.${host}`).then(h.verifyResponse(200, bodyRegex9)),
            h.runCmd(`curl -iL ${scheme}://pr${pr}-${shortSha0}.${host}`).then(h.verifyResponse(200, bodyRegex0)),
          ]).then(done);
        });

      });


      describe('(for hidden builds)', () => {

        it('should respond with 404 for any file or directory', async () => {
          const origin = `${scheme}://pr${pr}-${shortSha9}.${host}`;
          const assert404 = h.verifyResponse(404);

          h.createDummyBuild(pr, sha9, false);

          await Promise.all([
            h.runCmd(`curl -iL ${origin}/index.html`).then(assert404),
            h.runCmd(`curl -iL ${origin}/`).then(assert404),
            h.runCmd(`curl -iL ${origin}`).then(assert404),
            h.runCmd(`curl -iL ${origin}/foo/bar.js`).then(assert404),
            h.runCmd(`curl -iL ${origin}/foo/`).then(assert404),
            h.runCmd(`curl -iL ${origin}/foo`).then(assert404),
          ]);

          expect({ prNum: pr, sha: sha9, isPublic: false }).toExistAsABuild();
        });


        it('should respond with 404 for any file or directory (for legacy builds)', async () => {
          const origin = `${scheme}://pr${pr}-${sha9}.${host}`;
          const assert404 = h.verifyResponse(404);

          h.createDummyBuild(pr, sha9, false, false, true);

          await Promise.all([
            h.runCmd(`curl -iL ${origin}/index.html`).then(assert404),
            h.runCmd(`curl -iL ${origin}/`).then(assert404),
            h.runCmd(`curl -iL ${origin}`).then(assert404),
            h.runCmd(`curl -iL ${origin}/foo/bar.js`).then(assert404),
            h.runCmd(`curl -iL ${origin}/foo/`).then(assert404),
            h.runCmd(`curl -iL ${origin}/foo`).then(assert404),
          ]);

          expect({ prNum: pr, sha: sha9, isPublic: false, isLegacy: true }).toExistAsABuild();
        });

      });

    });


    describe(`${host}/health-check`, () => {

      it('should respond with 200', done => {
        Promise.all([
          h.runCmd(`curl -iL ${scheme}://${host}/health-check`).then(h.verifyResponse(200)),
          h.runCmd(`curl -iL ${scheme}://${host}/health-check/`).then(h.verifyResponse(200)),
        ]).then(done);
      });


      it('should respond with 404 if the path does not match exactly', done => {
        Promise.all([
          h.runCmd(`curl -iL ${scheme}://${host}/health-check/foo`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/health-check-foo`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/health-checknfoo`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/foo/health-check`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/foo-health-check`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/foonhealth-check`).then(h.verifyResponse(404)),
        ]).then(done);
      });

    });


    describe(`${host}/can-have-public-preview`, () => {
      const baseUrl = `${scheme}://${host}/can-have-public-preview`;


      it('should disallow non-GET requests', async () => {
        await Promise.all([
          h.runCmd(`curl -iLX POST ${baseUrl}/42`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX PUT ${baseUrl}/42`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX PATCH ${baseUrl}/42`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX DELETE ${baseUrl}/42`).then(h.verifyResponse([405, 'Not Allowed'])),
        ]);
      });


      it('should pass requests through to the preview server', async () => {
        await h.runCmd(`curl -iLX GET ${baseUrl}/${PrNums.CHANGED_FILES_ERROR}`).
          then(h.verifyResponse(500, /CHANGED_FILES_ERROR/));
      });


      it('should respond with 404 for unknown paths', async () => {
        const cmdPrefix = `curl -iLX GET ${baseUrl}`;

        await Promise.all([
          h.runCmd(`${cmdPrefix}/foo/42`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}-foo/42`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}nfoo/42`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/42/foo`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/f00`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/`).then(h.verifyResponse(404)),
        ]);
      });

    });


    describe(`${host}/circle-build`, () => {

      it('should disallow non-POST requests', done => {
        const url = `${scheme}://${host}/circle-build`;

        Promise.all([
          h.runCmd(`curl -iLX GET ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX PUT ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX PATCH ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX DELETE ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
        ]).then(done);
      });


      it('should pass requests through to the preview server', done => {
        h.runCmd(`curl -iLX POST ${scheme}://${host}/circle-build`).
          then(h.verifyResponse(400, /Incorrect body content. Expected JSON/)).
          then(done);
      });


      it('should respond with 404 for unknown paths', done => {
        const cmdPrefix = `curl -iLX POST ${scheme}://${host}`;

        Promise.all([
          h.runCmd(`${cmdPrefix}/foo/circle-build/`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/foo-circle-build/`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/fooncircle-build/`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/circle-build/foo/`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/circle-build-foo/`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/circle-buildnfoo/`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/circle-build/pr`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/circle-build/42`).then(h.verifyResponse(404)),
        ]).then(done);
      });

    });


    describe(`${host}/pr-updated`, () => {
      const url = `${scheme}://${host}/pr-updated`;


      it('should disallow non-POST requests', done => {
        Promise.all([
          h.runCmd(`curl -iLX GET ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX PUT ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX PATCH ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX DELETE ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
        ]).then(done);
      });


      it('should pass requests through to the preview server', done => {
        const cmdPrefix = `curl -iLX POST --header "Content-Type: application/json"`;

        const cmd1 = `${cmdPrefix} ${url}`;

        Promise.all([
          h.runCmd(cmd1).then(h.verifyResponse(400, /Missing or empty 'number' field/)),
        ]).then(done);
      });


      it('should respond with 404 for unknown paths', done => {
        const cmdPrefix = `curl -iLX POST ${scheme}://${host}`;

        Promise.all([
          h.runCmd(`${cmdPrefix}/foo/pr-updated`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/foo-pr-updated`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/foonpr-updated`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/pr-updated/foo`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/pr-updated-foo`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/pr-updatednfoo`).then(h.verifyResponse(404)),
        ]).then(done);
      });

    });


    describe(`${host}/*`, () => {

      beforeEach(() => {
        ['index.html', 'foo.js', 'foo/index.html'].forEach(relFilePath => {
          const absFilePath = path.join(AIO_BUILDS_DIR, relFilePath);
          return h.writeFile(absFilePath, {content: `File: /${relFilePath}`});
        });
      });

      it('should respond with 404 for unknown URLs (even if the resource exists)', async () => {
        await Promise.all([
          h.runCmd(`curl -iL ${scheme}://${host}/index.html`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://foo.${host}/index.html`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://foo.${host}/`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://foo.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/foo.js`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/foo/index.html`).then(h.verifyResponse(404)),
        ]);
      });

      afterEach(() => {
        ['index.html', 'foo.js', 'foo/index.html', 'foo'].forEach(relFilePath => {
          const absFilePath = path.join(AIO_BUILDS_DIR, relFilePath);
          rm('-r', absFilePath);
        });
      });

    });

  }));

});
