import fs from 'fs';
import sh from 'shelljs';
import pre from './pre-deploy-actions.mjs';
import u from './utils.mjs';


describe('deploy-to-firebase/pre-deploy-actions:', () => {
  beforeEach(() => spyOn(u, 'logSectionHeader'));

  it('should define an undo function for each exported function', () => {
    const exportedFunctionNames = Object.keys(pre).filter(name => typeof pre[name] === 'function');

    for (const name of exportedFunctionNames) {
      expect(pre.undo[name]).
          withContext(`Testing for 'undo.${name}()'`).
          toEqual(jasmine.any(Function));
    }
  });

  describe('build()', () => {
    let cpSpy;
    let chmodSpy;
    let yarnSpy;

    beforeEach(() => {
      cpSpy = spyOn(sh, 'cp');
      chmodSpy = spyOn(sh, 'chmod');
      yarnSpy = spyOn(u, 'yarn');
    });

    it('should build the app for the appropriate mode', () => {
      pre.build({deployedUrl: 'http://example.com/foo/', deployEnv: 'bar'});
      expect(yarnSpy).toHaveBeenCalledWith('build-prod --aio_build_config=bar');
    });

    it('should remove write protection from the dist folder', () => {
      pre.build({deployedUrl: 'http://example.com/foo/', deployEnv: 'bar'});
      expect(chmodSpy).toHaveBeenCalledWith('-R', 'u+w', '../dist/bin/aio/build');
    });

    it('should add mode-specific files into the distribution', () => {
      pre.build({deployedUrl: 'http://example.com/foo/', deployEnv: 'bar'});
      expect(cpSpy).toHaveBeenCalledWith('-rf', 'src/extra-files/bar/.', 'dist');
    });

    it('should update the opensearch descriptor', () => {
      pre.build({deployedUrl: 'http://example.com/foo/', deployEnv: 'bar'});
      expect(yarnSpy).toHaveBeenCalledWith('set-opensearch-url http://example.com/foo/');
    });

    it('should add a trailing `/` to the opensearch descriptor URL (if necessary)', () => {
      pre.build({deployedUrl: '/foo', deployEnv: 'bar'});
      expect(yarnSpy).toHaveBeenCalledWith('set-opensearch-url /foo/');

      pre.build({deployedUrl: '/baz/', deployEnv: 'qux'});
      expect(yarnSpy).toHaveBeenCalledWith('set-opensearch-url /baz/');
    });

    it('should execute the operations in the correct order', () => {
      let logs = [];
      yarnSpy.and.callFake(cmd => logs.push(`yarn ${cmd}`));
      chmodSpy.and.callFake((opts, mode, file) => logs.push(`chmod ${opts} ${mode} ${file}`));
      cpSpy.and.callFake((opts, from, to) => logs.push(`cp ${opts} ${from} ${to}`));

      pre.build({deployedUrl: 'http://example.com/foo/', deployEnv: 'bar'});
      expect(logs).toEqual([
        'yarn build-prod --aio_build_config=bar',
        'chmod -R u+w ../dist/bin/aio/build',
        'yarn set-opensearch-url http://example.com/foo/',
        'cp -rf ../dist/bin/aio/build dist',
        'cp -rf src/extra-files/bar/. dist',
      ]);
    });
  });

  describe('checkPayloadSize()', () => {
    let yarnSpy;

    beforeEach(() => yarnSpy = spyOn(u, 'yarn'));

    it('should check the payload size', () => {
      pre.checkPayloadSize();
      expect(yarnSpy).toHaveBeenCalledWith('payload-size');
    });
  });

  describe('disableServiceWorker()', () => {
    let mvSpy;

    beforeEach(() => mvSpy = spyOn(sh, 'mv'));

    it('should disable the ServiceWorker by renaming the `ngsw.json` manifest', () => {
      pre.disableServiceWorker();
      expect(mvSpy).toHaveBeenCalledWith('dist/ngsw.json', 'dist/ngsw.json.bak');
    });
  });

  Object.entries(u.ORIGINS).forEach(([originLabel, origin]) => {
    [true, false].forEach(allRequests => {
      const redirectToFnName = `redirect${allRequests ? 'All' : 'NonFiles'}To${originLabel}`;

      describe(`${redirectToFnName}()`, () => {
        let readFileSpy;
        let writeFileSpy;

        beforeEach(() => {
          readFileSpy = spyOn(fs, 'readFileSync').and.returnValue('Test file content.');
          writeFileSpy = spyOn(fs, 'writeFileSync');
        });

        it('should read from and write to the Firebase config file', () => {
          pre[redirectToFnName]();

          expect(readFileSpy).toHaveBeenCalledOnceWith('firebase.json', 'utf8');
          expect(writeFileSpy).toHaveBeenCalledOnceWith('firebase.json', 'Test file content.');
        });

        it(`should add a redirect rule to '${origin}'`, () => {
          const re = allRequests ? '^(.*)$' : '^(.*/[^./]*)$';
          readFileSpy.and.returnValue(`
            {
              "foo": "bar",
              "hosting": {
                "baz": "qux",
                "redirects": [
                  {"type": 301, "regex": "/source/1", "destination": "/destination/1"},
                  {"type": 301, "source": "/source/2", "destination": "/destination/2"},
                ]
              }
            }
          `);

          pre[redirectToFnName]();

          expect(writeFileSpy.calls.first().args[1]).toBe(`
            {
              "foo": "bar",
              "hosting": {
                "baz": "qux",
                "redirects": [
                  {"type": 302, "regex": "${re}", "destination": "${origin}:1"},

                  {"type": 301, "regex": "/source/1", "destination": "/destination/1"},
                  {"type": 301, "source": "/source/2", "destination": "/destination/2"},
                ]
              }
            }
          `);
        });
      });
    });
  });

  describe('undo.build()', () => {
    let rmSpy;

    beforeEach(() => rmSpy = spyOn(sh, 'rm'));

    it('should undo `build()`', () => {
      pre.undo.build();
      expect(rmSpy).toHaveBeenCalledWith('-rf', 'dist');
    });
  });

  describe('undo.checkPayloadSize()', () => {
    // This method is a no-op, so there is nothing to test.
    // eslint-disable-next-line jasmine/expect-single-argument
    it('does not need tests', () => expect().nothing());
  });

  describe('undo.disableServiceWorker()', () => {
    let mvSpy;

    beforeEach(() => mvSpy = spyOn(sh, 'mv'));

    it('should undo `disableServiceWorker()`', () => {
      pre.undo.disableServiceWorker();
      expect(mvSpy).toHaveBeenCalledWith('dist/ngsw.json.bak', 'dist/ngsw.json');
    });
  });

  Object.entries(u.ORIGINS).forEach(([originLabel, origin]) => {
    [true, false].forEach(allRequests => {
      const redirectToFnName = `redirect${allRequests ? 'All' : 'NonFiles'}To${originLabel}`;

      describe(`undo.${redirectToFnName}()`, () => {
        let readFileSpy;
        let writeFileSpy;

        beforeEach(() => {
          readFileSpy = spyOn(fs, 'readFileSync').and.returnValue('Test file content.');
          writeFileSpy = spyOn(fs, 'writeFileSync');
        });

        it('should read from and write to the Firebase config file', () => {
          pre.undo[redirectToFnName]();

          expect(readFileSpy).toHaveBeenCalledOnceWith('firebase.json', 'utf8');
          expect(writeFileSpy).toHaveBeenCalledOnceWith('firebase.json', 'Test file content.');
        });

        it('should remove a redirect rule to `angular.io`', () => {
          const re = allRequests ? '^(.*)$' : '^(.*/[^./]*)$';
          readFileSpy.and.returnValue(`
            {
              "foo": "bar",
              "hosting": {
                "baz": "qux",
                "redirects": [
                  {"type": 302, "regex": "${re}", "destination": "${origin}:1"},

                  {"type": 301, "regex": "/source/1", "destination": "/destination/1"},
                  {"type": 301, "source": "/source/2", "destination": "/destination/2"},
                ]
              }
            }
          `);

          pre.undo[redirectToFnName]();

          expect(writeFileSpy.calls.first().args[1]).toBe(`
            {
              "foo": "bar",
              "hosting": {
                "baz": "qux",
                "redirects": [
                  {"type": 301, "regex": "/source/1", "destination": "/destination/1"},
                  {"type": 301, "source": "/source/2", "destination": "/destination/2"},
                ]
              }
            }
          `);
        });
      });
    });
  });
});
