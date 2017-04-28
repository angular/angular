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
    const docs = [ {
      docType: 'a',
      renderedContent: `
        <h1>Heading 1</h2>
        <h2>Heading with <strong>bold</strong></h2>
        <h3>Heading with encoded chars &#x26;</h3>
    `
    }];
    processor.$process(docs);
    expect(docs[0].renderedContent).toEqual(`
        <h1 id="heading-1"><a title="Link to this heading" class="header-link" aria-hidden="true" href="#heading-1"><i class="material-icons">link</i></a>Heading 1</h1>
        <h2 id="heading-with-bold"><a title="Link to this heading" class="header-link" aria-hidden="true" href="#heading-with-bold"><i class="material-icons">link</i></a>Heading with <strong>bold</strong></h2>
        <h3 id="heading-with-encoded-chars-"><a title="Link to this heading" class="header-link" aria-hidden="true" href="#heading-with-encoded-chars-"><i class="material-icons">link</i></a>Heading with encoded chars &#x26;</h3>
    `);
  });
});

