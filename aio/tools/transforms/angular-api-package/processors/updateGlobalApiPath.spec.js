const testPackage = require('../../helpers/test-package');
const processorFactory = require('./updateGlobalApiPath');
const Dgeni = require('dgeni');

describe('updateGlobalApiPath processor', () => {
  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('updateGlobalApiPathProcessor');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['disambiguateDocPathsProcessor', 'processNgModuleDocs']);
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['paths-computed']);
  });

  it('should update the paths of namespaced global APIs', () => {
    const processor = processorFactory();
    const docs = [{
      docType: 'function',
      moduleDoc: { moduleFolder: 'folder' },
      name: 'ng.withNamespace',
      globalNamespace: 'ng',
      unprefixedName: 'withNamespace',
      global: true
    }];
    processor.$process(docs);
    expect(docs[0].path).toBe('folder/ngWithNamespace');
    expect(docs[0].outputPath).toBe('folder/ngWithNamespace.json');
  });
});
