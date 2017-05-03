const testPackage = require('../../helpers/test-package');
const processorFactory = require('./computeSearchTitle');
const Dgeni = require('dgeni');

fdescribe('computeSearchTitle processor', () => {

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

  it('should compute a search title for class-like docs', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'class', name: 'MyClass' },
      { docType: 'interface', name: 'MyInterface' },
      { docType: 'pipe', name: 'MyPipe', pipeOptions: { name: 'myPipe' } }
    ];
    processor.$process(docs);
    expect(docs[0].searchTitle).toEqual('class MyClass');
    expect(docs[0].searchTitle).toEqual('interface MyInterface');
    expect(docs[0].searchTitle).toEqual('myPipe (pipe)');
  });

  it('should compute a class search title', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'class', name: 'MyClass' }
    ];
    processor.$process(docs);
    expect(docs[0].searchTitle).toEqual('class MyClass');
  });

});



    // 'decorator',
    // 'directive',
    // 'module'
    // 'function',
    // 'var',
    // 'const',
    // 'let',
    // 'enum',
    // 'type-alias',
    // 'value-module'