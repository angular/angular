const testPackage = require('../../helpers/test-package');
const processorFactory = require('./computeApiBreadCrumbs');
const Dgeni = require('dgeni');

describe('angular-api-package: computeApiBreadCrumbs processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('computeApiBreadCrumbs');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toEqual(['paths-computed']);
    expect(processor.$runBefore).toEqual(['rendering-docs']);
  });

  it('should attach a breadCrumbs property to each of the EXPORT_DOC_TYPES docs', () => {
    const EXPORT_DOC_TYPES = ['class', 'interface'];
    const processor = processorFactory(EXPORT_DOC_TYPES);

    const docs = [
      { docType: 'class', name: 'ClassA', path: 'module-1/class-a', moduleDoc: { id: 'moduleOne', path: 'module-1' } },
      { docType: 'interface', name: 'InterfaceB', path: 'module-2/interface-b', moduleDoc: { id: 'moduleTwo', path: 'module-2' } },
      { docType: 'guide', name: 'Guide One', path: 'guide/guide-1' },
    ];
    processor.$process(docs);

    expect(docs[0].breadCrumbs).toEqual([
      { text: 'API', path: '/api' },
      { text: '@angular/moduleOne', path: 'module-1' },
      { text: 'ClassA', path: 'module-1/class-a' },
    ]);
    expect(docs[1].breadCrumbs).toEqual([
      { text: 'API', path: '/api' },
      { text: '@angular/moduleTwo', path: 'module-2' },
      { text: 'InterfaceB', path: 'module-2/interface-b' },
    ]);
    expect(docs[2].breadCrumbs).toBeUndefined();
  });
});
