// Imports
import * as path from 'path';
import {helper as h} from './helper';

// Tests
describe(`nginx`, () => {

  beforeEach(() => jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000);
  afterEach(() => h.cleanUp());


  it('should redirect HTTP to HTTPS', done => {
    const httpHost = `${h.nginxHostname}:${h.nginxPortHttp}`;
    const httpsHost = `${h.nginxHostname}:${h.nginxPortHttps}`;
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


  h.runForAllSupportedSchemes((scheme, port) => describe(`nginx (on ${scheme.toUpperCase()})`, () => {
    const hostname = h.nginxHostname;
    const host = `${hostname}:${port}`;
    const pr = '9';
    const sha9 = '9'.repeat(40);
    const sha0 = '0'.repeat(40);


    describe(`pr<pr>-<sha>.${host}/*`, () => {

      beforeEach(() => {
        h.createDummyBuild(pr, sha9);
        h.createDummyBuild(pr, sha0);
      });


      it('should return /index.html', done => {
        const origin = `${scheme}://pr${pr}-${sha9}.${host}`;
        const bodyRegex = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /index\\.html$`);

        Promise.all([
          h.runCmd(`curl -iL ${origin}/index.html`).then(h.verifyResponse(200, bodyRegex)),
          h.runCmd(`curl -iL ${origin}/`).then(h.verifyResponse(200, bodyRegex)),
          h.runCmd(`curl -iL ${origin}`).then(h.verifyResponse(200, bodyRegex)),
        ]).then(done);
      });


      it('should return /foo/bar.js', done => {
        const bodyRegex = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /foo/bar\\.js$`);

        h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha9}.${host}/foo/bar.js`).
          then(h.verifyResponse(200, bodyRegex)).
          then(done);
      });


      it('should respond with 403 for directories', done => {
        Promise.all([
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha9}.${host}/foo/`).then(h.verifyResponse(403)),
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha9}.${host}/foo`).then(h.verifyResponse(403)),
        ]).then(done);
      });


      it('should respond with 404 for unknown paths to files', done => {
        h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha9}.${host}/foo/baz.css`).
          then(h.verifyResponse(404)).
          then(done);
      });


      it('should rewrite to \'index.html\' for unknown paths that don\'t look like files', done => {
        const bodyRegex = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /index\\.html$`);

        Promise.all([
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha9}.${host}/foo/baz`).then(h.verifyResponse(200, bodyRegex)),
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha9}.${host}/foo/baz/`).then(h.verifyResponse(200, bodyRegex)),
        ]).then(done);
      });


      it('should respond with 404 for unknown PRs/SHAs', done => {
        const otherPr = 54321;
        const otherSha = '8'.repeat(40);

        Promise.all([
          h.runCmd(`curl -iL ${scheme}://pr${pr}9-${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://pr${otherPr}-${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha9}9.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${otherSha}.${host}`).then(h.verifyResponse(404)),
        ]).then(done);
      });


      it('should respond with 404 if the subdomain format is wrong', done => {
        Promise.all([
          h.runCmd(`curl -iL ${scheme}://xpr${pr}-${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://prx${pr}-${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://xx${pr}-${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://p${pr}-${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://r${pr}-${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${pr}-${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://pr${pr}${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://pr${pr}_${sha9}.${host}`).then(h.verifyResponse(404)),
        ]).then(done);
      });


      it('should reject PRs with leading zeros', done => {
        h.runCmd(`curl -iL ${scheme}://pr0${pr}-${sha9}.${host}`).
          then(h.verifyResponse(404)).
          then(done);
      });


      it('should accept SHAs with leading zeros (but not trim the zeros)', done => {
        const bodyRegex9 = new RegExp(`^PR: ${pr} | SHA: ${sha9} | File: /index\\.html$`);
        const bodyRegex0 = new RegExp(`^PR: ${pr} | SHA: ${sha0} | File: /index\\.html$`);

        Promise.all([
          h.runCmd(`curl -iL ${scheme}://pr${pr}-0${sha9}.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha9}.${host}`).then(h.verifyResponse(200, bodyRegex9)),
          h.runCmd(`curl -iL ${scheme}://pr${pr}-${sha0}.${host}`).then(h.verifyResponse(200, bodyRegex0)),
        ]).then(done);
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


    describe(`${host}/create-build/<pr>/<sha>`, () => {

      it('should disallow non-POST requests', done => {
        const url = `${scheme}://${host}/create-build/${pr}/${sha9}`;

        Promise.all([
          h.runCmd(`curl -iLX GET ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX PUT ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX PATCH ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
          h.runCmd(`curl -iLX DELETE ${url}`).then(h.verifyResponse([405, 'Not Allowed'])),
        ]).then(done);
      });


      it(`should reject files larger than ${h.uploadMaxSize}B (according to header)`, done => {
        const headers = `--header "Content-Length: ${1.5 * h.uploadMaxSize}"`;
        const url = `${scheme}://${host}/create-build/${pr}/${sha9}`;

        h.runCmd(`curl -iLX POST ${headers} ${url}`).
          then(h.verifyResponse([413, 'Request Entity Too Large'])).
          then(done);
      });


      it(`should reject files larger than ${h.uploadMaxSize}B (without header)`, done => {
        const filePath = path.join(h.buildsDir, 'snapshot.tar.gz');
        const url = `${scheme}://${host}/create-build/${pr}/${sha9}`;

        h.writeFile(filePath, {size: 1.5 * h.uploadMaxSize});

        h.runCmd(`curl -iLX POST --data-binary "@${filePath}" ${url}`).
          then(h.verifyResponse([413, 'Request Entity Too Large'])).
          then(done);
      });


      it('should pass requests through to the upload server', done => {
        h.runCmd(`curl -iLX POST ${scheme}://${host}/create-build/${pr}/${sha9}`).
          then(h.verifyResponse(401, /Missing or empty 'AUTHORIZATION' header/)).
          then(done);
      });


      it('should respond with 404 for unknown paths', done => {
        const cmdPrefix = `curl -iLX POST ${scheme}://${host}`;

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
        h.runCmd(`curl -iLX POST ${scheme}://${host}/create-build/0${pr}/${sha9}`).
          then(h.verifyResponse(404)).
          then(done);
      });


      it('should accept SHAs with leading zeros (but not trim the zeros)', done => {
        const cmdPrefix = `curl -iLX POST  ${scheme}://${host}/create-build/${pr}`;
        const bodyRegex = /Missing or empty 'AUTHORIZATION' header/;

        Promise.all([
          h.runCmd(`${cmdPrefix}/0${sha9}`).then(h.verifyResponse(404)),
          h.runCmd(`${cmdPrefix}/${sha0}`).then(h.verifyResponse(401, bodyRegex)),
        ]).then(done);
      });

    });


    describe(`${host}/*`, () => {

      it('should respond with 404 for unkown URLs (even if the resource exists)', done => {
        ['index.html', 'foo.js', 'foo/index.html'].forEach(relFilePath => {
          const absFilePath = path.join(h.buildsDir, relFilePath);
          h.writeFile(absFilePath, {content: `File: /${relFilePath}`});
        });

        Promise.all([
          h.runCmd(`curl -iL ${scheme}://${host}/index.html`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://foo.${host}/index.html`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://foo.${host}/`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://foo.${host}`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/foo.js`).then(h.verifyResponse(404)),
          h.runCmd(`curl -iL ${scheme}://${host}/foo/index.html`).then(h.verifyResponse(404)),
        ]).then(done);
      });

    });

  }));

});
