const testPackage = require('../../helpers/test-package');
const processorFactory = require('./renderLinkInfo');
const extractLinks = require('dgeni-packages/base/services/extractLinks')();
const Dgeni = require('dgeni');

describe('renderLinkInfo processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-base-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('renderLinkInfo');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory(extractLinks);
    expect(processor.$runBefore).toEqual(['convertToJsonProcessor']);
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory(extractLinks);
    expect(processor.$runAfter).toEqual(['fixInternalDocumentLinks']);
  });

  it('should add HTML comments for links out of docs', () => {
    const processor = processorFactory(extractLinks);
    processor.docTypes = ['test'];
    const docs = [
      { path: 'test-1', docType: 'test', renderedContent: '<a href="a/b/c"></a><a href="x/y/z"></a>' },
      { path: 'test-2', docType: 'test', renderedContent: '<a href="foo"></a><a href="bar"></a>' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'test-1',
        docType: 'test',
        renderedContent: '<a href="a/b/c"></a><a href="x/y/z"></a>\n' +
                         '<!-- links to this doc:\n-->\n' +
                         '<!-- links from this doc:\n - a/b/c\n - x/y/z\n-->'
      },
      {
        path: 'test-2',
        docType: 'test',
        renderedContent: '<a href="foo"></a><a href="bar"></a>\n' +
                         '<!-- links to this doc:\n-->\n' +
                         '<!-- links from this doc:\n - bar\n - foo\n-->'
      },
    ]);
  });

  it('should order links alphabetically', () => {
    const processor = processorFactory(extractLinks);
    processor.docTypes = ['test'];
    const docs = [
      { path: 'test-1', docType: 'test', renderedContent: '<a href="orange"></a><a href="apple"></a><a href="banana"></a>' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'test-1',
        docType: 'test',
        renderedContent: '<a href="orange"></a><a href="apple"></a><a href="banana"></a>\n' +
                         '<!-- links to this doc:\n-->\n' +
                         '<!-- links from this doc:\n - apple\n - banana\n - orange\n-->'
      },
    ]);
  });

  it('should list repeated links only once', () => {
    const processor = processorFactory(extractLinks);
    processor.docTypes = ['test'];
    const docs = [
      { path: 'test-1', docType: 'test', renderedContent: '<a href="banana"></a><a href="apple"></a><a href="banana"></a>' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'test-1',
        docType: 'test',
        renderedContent: '<a href="banana"></a><a href="apple"></a><a href="banana"></a>\n' +
                         '<!-- links to this doc:\n-->\n' +
                         '<!-- links from this doc:\n - apple\n - banana\n-->'
      },
    ]);
  });

  it('should list internal links before external', () => {
    const processor = processorFactory(extractLinks);
    processor.docTypes = ['test'];
    const docs = [
      { path: 'test-1', docType: 'test', renderedContent: '<a href="https://www.google.com"></a><a href="apple"></a><a href="ftp://myfile.org"></a>' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'test-1',
        docType: 'test',
        renderedContent: '<a href="https://www.google.com"></a><a href="apple"></a><a href="ftp://myfile.org"></a>\n' +
                         '<!-- links to this doc:\n-->\n' +
                         '<!-- links from this doc:\n - apple\n - ftp://myfile.org\n - https://www.google.com\n-->'
      },
    ]);
  });

  it('should ignore docs that do not have the specified docType', () => {
    const processor = processorFactory(extractLinks);
    processor.docTypes = ['test'];
    const docs = [
      { path: 'test-1', docType: 'test', renderedContent: '<a href="a/b/c"></a><a href="x/y/z"></a>' },
      { path: 'test-2', docType: 'test2', renderedContent: '<a href="foo"></a><a href="bar"></a>' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'test-1',
        docType: 'test',
        renderedContent: '<a href="a/b/c"></a><a href="x/y/z"></a>\n' +
                         '<!-- links to this doc:\n-->\n' +
                         '<!-- links from this doc:\n - a/b/c\n - x/y/z\n-->'
      },
      {
        path: 'test-2',
        docType: 'test2',
        renderedContent: '<a href="foo"></a><a href="bar"></a>'
      },
    ]);
  });

  it('should add HTML comments for links into docs', () => {
    const processor = processorFactory(extractLinks);
    processor.docTypes = ['test'];
    const docs = [
      { path: 'test-1', docType: 'test', renderedContent: '<a href="test-2"></a>' },
      { path: 'test-2', docType: 'test', renderedContent: '<a href="test-1"></a><a href="test-3"></a>' },
      { path: 'test-3', docType: 'test', renderedContent: '<a href="test-1"></a><a href="test-2"></a>' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'test-1',
        docType: 'test',
        renderedContent: '<a href="test-2"></a>\n' +
        '<!-- links to this doc:\n - test-2\n - test-3\n-->\n' +
        '<!-- links from this doc:\n - test-2\n-->'
      },
      {
        path: 'test-2',
        docType: 'test',
        renderedContent: '<a href="test-1"></a><a href="test-3"></a>\n' +
        '<!-- links to this doc:\n - test-1\n - test-3\n-->\n' +
        '<!-- links from this doc:\n - test-1\n - test-3\n-->'
      },
      {
        path: 'test-3',
        docType: 'test',
        renderedContent: '<a href="test-1"></a><a href="test-2"></a>\n' +
        '<!-- links to this doc:\n - test-2\n-->\n' +
        '<!-- links from this doc:\n - test-1\n - test-2\n-->'
      },
    ]);
  });

  it('should not include links to themselves', () => {
    const processor = processorFactory(extractLinks);
    processor.docTypes = ['test'];
    const docs = [
      { path: 'test-1', docType: 'test', renderedContent: '<a href="test-2"></a>' },
      { path: 'test-2', docType: 'test', renderedContent: '<a href="test-1"></a><a href="test-2"></a>' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'test-1',
        docType: 'test',
        renderedContent: '<a href="test-2"></a>\n' +
        '<!-- links to this doc:\n - test-2\n-->\n' +
        '<!-- links from this doc:\n - test-2\n-->'
      },
      {
        path: 'test-2',
        docType: 'test',
        renderedContent: '<a href="test-1"></a><a href="test-2"></a>\n' +
        '<!-- links to this doc:\n - test-1\n-->\n' +
        '<!-- links from this doc:\n - test-1\n-->'
      },
    ]);
  });

  it('should match links that contain fragments or queries', () => {
    const processor = processorFactory(extractLinks);
    processor.docTypes = ['test'];
    const docs = [
      { path: 'test-1', docType: 'test', renderedContent: '<a href="test-2#foo"></a>' },
      { path: 'test-2', docType: 'test', renderedContent: '<a href="test-1?some-query"></a>' },
      { path: 'test-3', docType: 'test', renderedContent: '<a href="test-1?some-query#foo"></a>' },
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      {
        path: 'test-1',
        docType: 'test',
        renderedContent: '<a href="test-2#foo"></a>\n' +
        '<!-- links to this doc:\n - test-2\n - test-3\n-->\n' +
        '<!-- links from this doc:\n - test-2#foo\n-->'
      },
      {
        path: 'test-2',
        docType: 'test',
        renderedContent: '<a href="test-1?some-query"></a>\n' +
        '<!-- links to this doc:\n - test-1\n-->\n' +
        '<!-- links from this doc:\n - test-1?some-query\n-->'
      },
      {
        path: 'test-3',
        docType: 'test',
        renderedContent: '<a href="test-1?some-query#foo"></a>\n' +
        '<!-- links to this doc:\n-->\n' +
        '<!-- links from this doc:\n - test-1?some-query#foo\n-->'
      },
    ]);
  });
});
