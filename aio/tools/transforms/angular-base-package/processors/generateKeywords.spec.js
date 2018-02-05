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
      { docType: 'class', name: 'A', searchTitle: 'searchTitle A', title: 'title A', vFile: { headings: { h1: ['vFile A'] } } },
      { docType: 'class', name: 'B', title: 'title B', vFile: { headings: { h1: ['vFile B'] } } },
      { docType: 'class', name: 'C', vFile: { title: 'vFile C', headings: { h1: ['vFile C'] } } },
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
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data).toEqual([
      jasmine.objectContaining({ title: 'class PublicExport', type: 'class'})
    ]);
  });

  it('should add title words to the search terms', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      {
        docType: 'class',
        name: 'PublicExport',
        searchTitle: 'class PublicExport',
        vFile: { headings: { h2: ['heading A', 'heading B'] } }
      },
    ];
    processor.$process(docs);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data[0].titleWords).toEqual('class PublicExport');
  });

  it('should add heading words to the search terms', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      {
        docType: 'class',
        name: 'PublicExport',
        searchTitle: 'class PublicExport',
        vFile: { headings: { h2: ['Important heading', 'Secondary heading'] } }
      },
    ];
    processor.$process(docs);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data[0].headingWords).toEqual('heading important secondary');
  });

  it('should add member doc properties to the search terms', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      {
        docType: 'class',
        name: 'PublicExport',
        searchTitle: 'class PublicExport',
        vFile: { headings: { h2: ['heading A'] } },
        content: 'Some content with ngClass in it.',
        members: [
          { name: 'instanceMethodA' },
          { name: 'instancePropertyA' },
          { name: 'instanceMethodB' },
          { name: 'instancePropertyB' },
        ],
        statics: [
          { name: 'staticMethodA' },
          { name: 'staticPropertyA' },
          { name: 'staticMethodB' },
          { name: 'staticPropertyB' },
        ],
      },
    ];
    processor.$process(docs);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data[0].members).toEqual(
      'instancemethoda instancemethodb instancepropertya instancepropertyb staticmethoda staticmethodb staticpropertya staticpropertyb'
    );
  });

  it('should process terms prefixed with "ng" to include the term stripped of "ng"', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      {
        docType: 'class',
        name: 'PublicExport',
        searchTitle: 'ngController',
        vFile: { headings: { h2: ['ngModel'] } },
        content: 'Some content with ngClass in it.'
      },
    ];
    processor.$process(docs);
    const keywordsDoc = docs[docs.length - 1];
    expect(keywordsDoc.data[0].titleWords).toEqual('ngController Controller');
    expect(keywordsDoc.data[0].headingWords).toEqual('model ngmodel');
    expect(keywordsDoc.data[0].keywords).toContain('class');
    expect(keywordsDoc.data[0].keywords).toContain('ngclass');
  });

  it('should generate renderedContent property', () => {
    const processor = processorFactory(mockLogger, mockReadFilesProcessor);
    const docs = [
      {
        docType: 'class',
        name: 'SomeClass',
        description: 'The is the documentation for the SomeClass API.',
        vFile: { headings: { h1: ['SomeClass'], h2: ['Some heading'] } }
      },
    ];
    processor.$process(docs);
    const keywordsDoc = docs[docs.length - 1];
    expect(JSON.parse(keywordsDoc.renderedContent)).toEqual(
      [{
        'title':'SomeClass',
        'type':'class',
        'titleWords':'SomeClass',
        'headingWords':'heading some someclass',
        'keywords':'api class documentation for is someclass the',
        'members':''
      }]
    );
  });
});
