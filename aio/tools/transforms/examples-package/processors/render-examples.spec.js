var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('renderExamples processor', () => {
  var injector, processor, exampleMap, collectExamples;

  beforeEach(function() {
    const dgeni = new Dgeni([testPackage('examples-package', true)]);
    injector = dgeni.configureInjector();

    exampleMap = injector.get('exampleMap');
    processor = injector.get('renderExamples');
    collectExamples = injector.get('collectExamples');
    exampleMap = injector.get('exampleMap');

    collectExamples.exampleFolders = ['examples'];
    exampleMap['examples'] = {
      'test/url': { regions: {
        '': { renderedContent: 'whole file' },
        'region-1': { renderedContent: 'region 1 contents' }
      } }
    };
  });

  it('should run before the correct processor', () => {
    expect(processor.$runBefore).toEqual(['writing-files']);
  });

  it('should run after the correct processor', () => {
    expect(processor.$runAfter).toEqual(['docs-rendered']);
  });

  ['code-example', 'code-pane'].forEach(CODE_TAG =>
    describe(CODE_TAG, () => {
      it(`should ignore a <${CODE_TAG}> tags with no path attribute`, () => {
        const docs = [
          { renderedContent: `Some text\n<${CODE_TAG}>Some code</${CODE_TAG}>\n<${CODE_TAG} class="anti-pattern" title="Bad Code">do not do this</${CODE_TAG}>` }
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`Some text\n<${CODE_TAG}>Some code</${CODE_TAG}>\n<${CODE_TAG} class="anti-pattern" title="Bad Code">do not do this</${CODE_TAG}>`);
      });

      it(`should replace the content of the <${CODE_TAG}> tag with the whole contents from an example file if a path is provided`, () => {
        const docs = [
          { renderedContent: `<${CODE_TAG} path="test/url">Some code</${CODE_TAG}>`}
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`<${CODE_TAG} path="test/url">\nwhole file\n</${CODE_TAG}>`);
      });

      it(`should replace all instances of <${CODE_TAG}> tags`, () => {
        const docs = [
          { renderedContent: `<${CODE_TAG} path="test/url">Some code</${CODE_TAG}><${CODE_TAG} path="test/url" region="region-1">Other code</${CODE_TAG}>`}
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`<${CODE_TAG} path="test/url">\nwhole file\n</${CODE_TAG}><${CODE_TAG} path="test/url" region="region-1">\nregion 1 contents\n</${CODE_TAG}>`);
      });

      it('should contain the region contents from the example file if a region is specified', () => {
        const docs = [
          { renderedContent: `<${CODE_TAG} path="test/url" region="region-1">Some code</${CODE_TAG}>` }
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`<${CODE_TAG} path="test/url" region="region-1">\nregion 1 contents\n</${CODE_TAG}>`);
      });

      it(`should replace the content of the <${CODE_TAG}> tag with the whole contents from an example file if the region is empty`, () => {
        const docs = [
          { renderedContent: `<${CODE_TAG} path="test/url" region="">Some code</${CODE_TAG}>` }
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`<${CODE_TAG} path="test/url" region="">\nwhole file\n</${CODE_TAG}>`);
      });

      it('should pass along all attributes including path and region', () => {
        const openTag = `<${CODE_TAG} class="special" path="test/url" linenums="15" region="region-1" id="some-id">`;

        const docs = [  { renderedContent: `${openTag}Some code</${CODE_TAG}>` }
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`${openTag}\nregion 1 contents\n</${CODE_TAG}>`);
      });

      it('should cope with spaces and double quotes inside attribute values', () => {
        const docs = [
          { renderedContent: `<${CODE_TAG} title='a "quoted" value' path="test/url"></${CODE_TAG}>`}
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`<${CODE_TAG} title="a &quot;quoted&quot; value" path="test/url">\nwhole file\n</${CODE_TAG}>`);
      });
    })
  );
});
