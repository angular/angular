const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('processNgModuleDocs processor', () => {
  let processor;
  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    processor = injector.get('processNgModuleDocs');
  });

  it('should be available on the injector', () => {
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    expect(processor.$runBefore).toEqual(['docs-processed']);
  });

  it('should run after the correct processor', () => {
    expect(processor.$runAfter).toEqual(['extractDecoratedClassesProcessor']);
  });

});
