const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('disambiguateDocPaths processor', () => {
  let dgeni, injector, processor, docs;

  beforeEach(() => {
    dgeni = new Dgeni([testPackage('angular-base-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('disambiguateDocPathsProcessor');
    docs = [
      {docType: 'test-doc', id: 'test-doc', path: 'test/doc', outputPath: 'test/doc.json'},
      {docType: 'test-doc', id: 'TEST-DOC', path: 'TEST/DOC', outputPath: 'TEST/DOC.json'},
      {docType: 'test-doc', id: 'test-Doc', path: 'test/Doc', outputPath: 'test/Doc.xml'},
      {docType: 'test-doc', id: 'unique-doc', path: 'unique/doc', outputPath: 'unique/doc.json'},
      {docType: 'test-doc', id: 'other-doc', path: 'other/doc', outputPath: 'other/doc.json'},
      {docType: 'test-doc', id: 'other-DOC', path: 'other/DOC', outputPath: 'other/DOC.json'},
    ];
  });

  it('should be part of the dgeni package', () => {
    expect(processor).toBeDefined();
  });

  it('should be run before creating the sitemap', () => {
    expect(processor.$runBefore).toContain('createSitemap');
  });

  it('should create `disambiguator` documents for docs that have ambiguous outputPaths', () => {
    const numDocs = docs.length;
    processor.$process(docs);
    expect(docs.length).toEqual(numDocs + 2);
    expect(docs[docs.length - 2]).toEqual({
      docType: 'disambiguator',
      id: 'test-doc-disambiguator',
      title: 'test-doc (disambiguation)',
      aliases: ['test-doc-disambiguator'],
      path: 'test/doc',
      outputPath: 'test/doc.json',
      docs: [docs[0], docs[1]],
    });
    expect(docs[docs.length - 1]).toEqual({
      docType: 'disambiguator',
      id: 'other-doc-disambiguator',
      title: 'other-doc (disambiguation)',
      aliases: ['other-doc-disambiguator'],
      path: 'other/doc',
      outputPath: 'other/doc.json',
      docs: [docs[4], docs[5]],
    });
  });

  it('should update the path and outputPath properties of each ambiguous doc', () => {
    processor.$process(docs);
    expect(docs[0].path).toEqual('test/doc-0');
    expect(docs[0].outputPath).toEqual('test/doc-0.json');
    expect(docs[1].path).toEqual('TEST/DOC-1');
    expect(docs[1].outputPath).toEqual('TEST/DOC-1.json');

    // The non-ambiguous docs are left alone
    expect(docs[2].outputPath).toEqual('test/Doc.xml');
    expect(docs[3].outputPath).toEqual('unique/doc.json');

    expect(docs[4].path).toEqual('other/doc-0');
    expect(docs[4].outputPath).toEqual('other/doc-0.json');
    expect(docs[5].path).toEqual('other/DOC-1');
    expect(docs[5].outputPath).toEqual('other/DOC-1.json');
  });
});
