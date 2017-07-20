const testPackage = require('../../helpers/test-package');
const mockLogger = require('dgeni/lib/mocks/log')(false);
const processorFactory = require('./generateKeywords');
const Dgeni = require('dgeni');

const mockReadFilesProcessor = {
  basePath: 'base/path'
};

describe('generateKeywords processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-base-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('generateKeywordsProcessor');
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    expect(processor.$runAfter).toEqual(['postProcessHtml']);
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    expect(processor.$runBefore).toEqual(['writing-files']);
  });

  it('should ignore internal and private exports', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      { docType: 'class', name: 'PublicExport' },
      { docType: 'class', name: 'PrivateExport', privateExport: true },
      { docType: 'class', name: 'InternalExport', internal: true }
    ];
    processor.$process(docs);
    expect(docs[docs.length - 1].data).toEqual([
      jasmine.objectContaining({ title: 'PublicExport', type: 'class'})
    ]);
  });

  it('should compute `doc.searchTitle` from the doc properties if not already provided', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      { docType: 'class', name: 'A', searchTitle: 'searchTitle A', title: 'title A', vFile: { title: 'vFile A'} },
      { docType: 'class', name: 'B', title: 'title B', vFile: { title: 'vFile B'} },
      { docType: 'class', name: 'C', vFile: { title: 'vFile C'} },
      { docType: 'class', name: 'D' },
    ];
    processor.$process(docs);
    expect(docs[docs.length - 1].data).toEqual([
      jasmine.objectContaining({ title: 'searchTitle A' }),
      jasmine.objectContaining({ title: 'title B' }),
      jasmine.objectContaining({ title: 'vFile C' }),
      jasmine.objectContaining({ title: 'D' }),
    ]);
  });

  it('should use `doc.searchTitle` as the title in the search index', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      { docType: 'class', name: 'PublicExport', searchTitle: 'class PublicExport' },
    ];
    processor.$process(docs);
    expect(docs[docs.length - 1].data).toEqual([
      jasmine.objectContaining({ title: 'class PublicExport', type: 'class'})
    ]);
  });

  it('should generate renderedContent property', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      { docType: 'class', name: 'SomeClass', description: 'The is the documentation for the SomeClass API.' },
    ];
    processor.$process(docs);
    expect(docs[docs.length - 1].renderedContent).toEqual(
      '[{"title":"SomeClass","type":"class","titleWords":"SomeClass","keywords":"api class documentation for is someclass the","members":""}]'
    );
  });
});
