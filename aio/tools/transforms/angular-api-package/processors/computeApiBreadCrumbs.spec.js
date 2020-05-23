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

  it('should attach a breadCrumbs property to each of the API_DOC_TYPES_TO_RENDER docs', () => {
    const API_DOC_TYPES_TO_RENDER = ['class', 'interface', 'package'];
    const processor = processorFactory(API_DOC_TYPES_TO_RENDER);

    const corePackage = { docType: 'package', name: '@angular/core', id: 'core', path: 'core', isPrimaryPackage: true };
    const coreTestingPackage = { docType: 'package', name: '@angular/core/testing', id: 'core/testing', path: 'core/testing', packageInfo: { primary: corePackage } };
    const testRequestClass = { docType: 'class', name: 'InjectSetupWrapper', path: 'core/testing/test_bed', moduleDoc: coreTestingPackage };

    const docs = [
      { docType: 'class', name: 'ClassA', path: 'module-1/class-a', moduleDoc: { id: 'moduleOne', path: 'module-1' } },
      { docType: 'interface', name: 'InterfaceB', path: 'module-2/interface-b', moduleDoc: { id: 'moduleTwo', path: 'module-2' } },
      { docType: 'guide', name: 'Guide One', path: 'guide/guide-1' },
      corePackage,
      coreTestingPackage,
      testRequestClass
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
    expect(docs[3].breadCrumbs).toEqual([
      { text: 'API', path: '/api' },
      { text: '@angular/core', path: 'core' },
    ]);
    expect(docs[4].breadCrumbs).toEqual([
      { text: 'API', path: '/api' },
      { text: '@angular/core', path: 'core' },
      { text: '@angular/core/testing', path: 'core/testing' },
    ]);
    expect(docs[5].breadCrumbs).toEqual([
      { text: 'API', path: '/api' },
      { text: '@angular/core', path: 'core' },
      { text: '@angular/core/testing', path: 'core/testing' },
      { text: 'InjectSetupWrapper', path: 'core/testing/test_bed' },
    ]);
  });
});
