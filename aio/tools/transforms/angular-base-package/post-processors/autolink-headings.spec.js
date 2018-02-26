var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');
const plugin = require('./autolink-headings');

describe('autolink-headings postprocessor', () => {
  let processor;

  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-base-package')]);
    const injector = dgeni.configureInjector();
    processor = injector.get('postProcessHtml');
    processor.docTypes = ['a'];
    processor.plugins = [plugin];
  });

  it('should add anchors to headings', () => {
    const originalContent = `
      <h1>Heading 1</h2>
      <h2>Heading with <strong>bold</strong></h2>
      <h3>Heading with encoded chars &#x26;</h3>
    `;
    const processedContent = `
      <h1 id="heading-1">Heading 1<a title="Link to this heading" class="header-link" aria-hidden="true" href="#heading-1"><i class="material-icons">link</i></a></h1>
      <h2 id="heading-with-bold">Heading with <strong>bold</strong><a title="Link to this heading" class="header-link" aria-hidden="true" href="#heading-with-bold"><i class="material-icons">link</i></a></h2>
      <h3 id="heading-with-encoded-chars-">Heading with encoded chars &#x26;<a title="Link to this heading" class="header-link" aria-hidden="true" href="#heading-with-encoded-chars-"><i class="material-icons">link</i></a></h3>
    `;

    const docs = [{docType: 'a', renderedContent: originalContent}];
    processor.$process(docs);
    expect(docs[0].renderedContent).toBe(processedContent);
  });

  it('should ignore headings with the `no-anchor` class', () => {
    const originalContent = `
      <h1 class="no-anchor">Heading 1</h2>
      <h2 class="no-anchor">Heading with <strong>bold</strong></h2>
      <h3 class="no-anchor">Heading with encoded chars &#x26;</h3>
    `;
    const processedContent = `
      <h1 class="no-anchor" id="heading-1">Heading 1</h1>
      <h2 class="no-anchor" id="heading-with-bold">Heading with <strong>bold</strong></h2>
      <h3 class="no-anchor" id="heading-with-encoded-chars-">Heading with encoded chars &#x26;</h3>
    `;

    const docs = [{docType: 'a', renderedContent: originalContent}];
    processor.$process(docs);
    expect(docs[0].renderedContent).toBe(processedContent);
  });
});

