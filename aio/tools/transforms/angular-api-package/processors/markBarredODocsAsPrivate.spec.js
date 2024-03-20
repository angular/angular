const testPackage = require('../../helpers/test-package');
const processorFactory = require('./markBarredODocsAsPrivate');
const Dgeni = require('dgeni');

describe('markBarredODocsAsPrivate processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('markBarredODocsAsPrivate');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toContain('readTypeScriptModules');
    expect(processor.$runBefore).toContain('adding-extra-docs');
  });

  it('should mark docs starting with barred-o ɵ as private', () => {
    const processor = processorFactory();
    const docs = [
      { name: 'ɵPrivate' },
      { name: 'public' }
    ];
    processor.$process(docs);

    expect(docs[0].privateExport).toBeTruthy();
    expect(docs[1].privateExport).toBeFalsy();
  });
});

