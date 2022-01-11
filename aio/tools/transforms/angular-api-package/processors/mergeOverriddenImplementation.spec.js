const testPackage = require('../../helpers/test-package');
const processorFactory = require('./mergeOverriddenImplementation');
const Dgeni = require('dgeni');
const mockLogFactory = require('dgeni/lib/mocks/log');
const createDocMessageFactory = require('dgeni-packages/base/services/createDocMessage');

describe('mergeOverriddenImplementation processor', () => {

  let getDocFromAlias, log, createDocMessage, processor;

  beforeEach(() => {
    getDocFromAlias = jasmine.createSpy('getDocFromAlias');
    log = mockLogFactory(false);
    createDocMessage = createDocMessageFactory();
    processor = processorFactory(getDocFromAlias, log, createDocMessage);
  });

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('mergeOverriddenImplementation');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    expect(processor.$runBefore).toEqual(['filterPrivateDocs']);
  });

  it('should run after the correct processor', () => {
    expect(processor.$runAfter).toEqual(['tags-extracted', 'ids-computed']);
  });

  it('should ignore docs that do not have a `@overriddenImplementation` tag', () => {
    const docs = [{}];
    getDocFromAlias.and.returnValue([{ prop1: 'prop-1', prop2: 'prop-2', prop3: 'prop-3' }]);
    processor.$process(docs);
    expect(docs).toEqual([{}]);
  });

  it('should replace properties with those from the implementation and constructor docs', () => {
    const exportedNameDoc = {
      overriddenImplementation: 'Foo has an overridden implementation.', // This processor should apply
      declaration: { // Imitate a valid AST
        name: {getText: () => 'Foo'},
        type: {getText: () => 'FooCtor'},
        initializer: {
          expression: {getText: () => 'FooImpl'},
        },
      },
      exportedProp: true, // This prop will be removed
    };
    const docs = [exportedNameDoc];

    const fakeGetDocs = (docName) => {
      switch(docName) {
        case 'Foo': return [exportedNameDoc];
        case 'FooCtor': return [{ctorProp: true, members: [{name: 'new'}]}];
        case 'FooImpl': return [{implProp: true}];
      }
    };

    getDocFromAlias.and.callFake(fakeGetDocs);
    processor.$process(docs);

    expect(docs).toEqual([{
      // Property copied from the implementation
      implProp: true,
      // Constructor signature property
      constructorDoc: {name: 'new'},
      // The exported symbol should be explicitly marked non-internal
      internal: false,
      privateExport: false,
    }]);
  });

  it('should have default properties to keep', () => {
    expect(processor.propertiesToKeep).toEqual([
      'name', 'id', 'aliases', 'fileInfo', 'startingLine', 'endingLine',
      'path', 'originalModule', 'outputPath', 'privateExport', 'moduleDoc'
    ]);
  });
});
