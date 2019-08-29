const testPackage = require('../../helpers/test-package');
const processorFactory = require('./computeSearchTitle');
const Dgeni = require('dgeni');

describe('computeSearchTitle processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('computeSearchTitleProcessor');
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['ids-computed']);
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['generateKeywordsProcessor']);
  });

  it('should compute a search title for API docs', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'class', name: 'MyClass' },
      { docType: 'interface', name: 'MyInterface' },
      { docType: 'enum', name: 'MyEnum' },
      { docType: 'function', name: 'myFunction' },
      { docType: 'pipe', name: 'MyPipe', pipeOptions: { name: 'myPipe' } },
      { docType: 'directive', name: 'MyDirective', directiveOptions: {} },
      { docType: 'decorator', name: 'MyDecorator' },
      { docType: 'package', name: 'myPackage', id: 'some/myPackage' },
      { docType: 'var', name: 'myVar' },
      { docType: 'let', name: 'myLet' },
      { docType: 'const', name: 'myConst' },
      { docType: 'type-alias', name: 'myType' },
    ];
    processor.$process(docs);
    expect(docs[0].searchTitle).toBeUndefined();
    expect(docs[1].searchTitle).toBeUndefined();
    expect(docs[2].searchTitle).toBeUndefined();
    expect(docs[3].searchTitle).toEqual('myFunction()');
    expect(docs[4].searchTitle).toBeUndefined();
    expect(docs[5].searchTitle).toBeUndefined();
    expect(docs[6].searchTitle).toBeUndefined();
    expect(docs[7].searchTitle).toEqual('some/myPackage package');
    expect(docs[8].searchTitle).toBeUndefined();
    expect(docs[9].searchTitle).toBeUndefined();
    expect(docs[10].searchTitle).toBeUndefined();
    expect(docs[11].searchTitle).toBeUndefined();
  });
});
