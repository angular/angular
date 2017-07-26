var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');
const plugin = require('./h1-checker');

describe('h1Checker postprocessor', () => {
  let processor, createDocMessage;

  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-base-package')]);
    const injector = dgeni.configureInjector();
    createDocMessage = injector.get('createDocMessage');
    processor = injector.get('postProcessHtml');
    processor.docTypes = ['a'];
    processor.plugins = [plugin];
  });

  it('should complain if there is more than one h1 in a document', () => {
    const doc = {
      docType: 'a',
      renderedContent: `
        <h1>Heading 1</h2>
        <h2>Heading 2</h2>
        <h1>Heading 1a</h1>
    `
    };
    expect(() => processor.$process([doc])).toThrowError(createDocMessage('More than one h1 found in ' + doc.renderedContent, doc));
  });

  it('should not complain if there is exactly one h1 in a document', () => {
    const doc = {
      docType: 'a',
      renderedContent: `
        <h1>Heading 1</h2>
        <h2>Heading 2</h2>
    `
    };
    expect(() => processor.$process([doc])).not.toThrow();
  });

  it('should not complain if there are no h1s in a document', () => {
    const doc = {
      docType: 'a',
      renderedContent: `
        <h2>Heading 2</h2>
    `
    };
    expect(() => processor.$process([doc])).not.toThrow();
  });

  it('should attach the h1 text to the vFile', () => {
    const doc = {
      docType: 'a',
      renderedContent: '<h1>Heading 1</h1>'
    };
    processor.$process([doc]);
    expect(doc.vFile.title).toEqual('Heading 1');
  });

  it('should clean aria-hidden anchors from h1 text added to the vFile', () => {
    const doc = {
      docType: 'a',
      renderedContent:
        '<h1 class="no-toc" id="what-is-angular">' +
          '<a title="Link to this heading" class="header-link" aria-hidden="true" href="docs#what-is-angular">' +
            '<i class="material-icons">link</i>' +
          '</a>What is Angular?' +
        '</h1>'
    };
    processor.$process([doc]);
    expect(doc.vFile.title).toEqual('What is Angular?');
  });

  it('should not break if the h1 is empty (except for an aria-hidden anchor)', () => {
    const doc = {
      docType: 'a',
      renderedContent: `
        <h1><a aria-hidden="true"></a></h1>
      `
    };
    expect(() => processor.$process([doc])).not.toThrow();
  });
});
