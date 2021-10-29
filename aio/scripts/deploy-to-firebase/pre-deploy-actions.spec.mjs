import sh from 'shelljs';
import pre from './pre-deploy-actions.mjs';
import u from './utils.mjs';


describe('deploy-to-firebase/pre-deploy-actions:', () => {
  beforeEach(() => spyOn(u, 'logSectionHeader'));

  describe('build()', () => {
    let cpSpy;
    let yarnSpy;

    beforeEach(() => {
      cpSpy = spyOn(sh, 'cp');
      yarnSpy = spyOn(u, 'yarn');
    });

    it('should build the app for the appropriate mode', () => {
      pre.build({deployedUrl: 'http://example.com/foo/', deployEnv: 'bar'});
      expect(yarnSpy).toHaveBeenCalledWith('build --configuration=bar --progress=false');
    });

    it('should add mode-specific files into the distribution', () => {
      pre.build({deployedUrl: 'http://example.com/foo/', deployEnv: 'bar'});
      expect(cpSpy).toHaveBeenCalledWith('-rf', 'src/extra-files/bar/.', 'dist/');
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
      cpSpy.and.callFake((opts, from, to) => logs.push(`cp ${opts} ${from} ${to}`));

      pre.build({deployedUrl: 'http://example.com/foo/', deployEnv: 'bar'});
      expect(logs).toEqual([
        'yarn build --configuration=bar --progress=false',
        'cp -rf src/extra-files/bar/. dist/',
        'yarn set-opensearch-url http://example.com/foo/',
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

  describe('redirectToAngularIo()', () => {
    // TODO(gkalpak): Add tests for this function.
    it('should have tests');
  });
});
