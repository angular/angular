var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('renderExamples processor', () => {
  var injector, processor, collectExamples, exampleMap, log;

  beforeEach(function() {
    const dgeni = new Dgeni([testPackage('examples-package', true)]);
    injector = dgeni.configureInjector();

    processor = injector.get('renderExamples');
    collectExamples = injector.get('collectExamples');
    exampleMap = injector.get('exampleMap');
    log = injector.get('log');

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
          { renderedContent: `Some text\n<${CODE_TAG}>Some code</${CODE_TAG}>\n<${CODE_TAG} class="anti-pattern" title="Bad Code">do <strong>not</strong> do this</${CODE_TAG}>` }
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`Some text\n<${CODE_TAG}>Some code</${CODE_TAG}>\n<${CODE_TAG} class="anti-pattern" title="Bad Code">do <strong>not</strong> do this</${CODE_TAG}>`);
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
          { renderedContent: `<${CODE_TAG} header='a "quoted" value' path="test/url"></${CODE_TAG}>`}
        ];
        processor.$process(docs);
        expect(docs[0].renderedContent).toEqual(`<${CODE_TAG} header="a &quot;quoted&quot; value" path="test/url">\nwhole file\n</${CODE_TAG}>`);
      });

      it('should throw an exception if the code-example tag is not closed correctly', () => {
        const docs = [
          { renderedContent: `<${CODE_TAG} path="test/url"></p></${CODE_TAG}>`}
        ];
        expect(() => processor.$process(docs)).toThrowError(
          'Badly formed example: <' + CODE_TAG + ' path="test/url"></p> - closing tag does not match opening tag.\n' +
          ' - Perhaps you forgot to put a blank line before the example?');
      });

      it('should not throw if `ignoreBrokenExamples` is set to true', () => {
        processor.ignoreBrokenExamples = true;
        const docs = [
          { renderedContent: `<${CODE_TAG} path="test/url"></p></${CODE_TAG}>`},
          { renderedContent: `<${CODE_TAG} path="test/url" region="missing"></${CODE_TAG}>`},
          { renderedContent: `<${CODE_TAG} path="missing/url"></${CODE_TAG}>`}
        ];
        expect(() => processor.$process(docs)).not.toThrow();
        expect(log.warn).toHaveBeenCalledWith(
          'Badly formed example: <' + CODE_TAG + ' path="test/url"></p> - closing tag does not match opening tag.\n' +
          ' - Perhaps you forgot to put a blank line before the example? - doc');
        expect(log.warn).toHaveBeenCalledWith(
          'Missing example region... relativePath: "test/url", region: "missing". - doc\n' +
          'Regions available are: "", "region-1" - doc');
        expect(log.warn).toHaveBeenCalledWith(
          'Missing example file... relativePath: "missing/url". - doc\n' +
          'Example files can be found in the following relative paths: "examples" - doc');
      });

      it('should throw an exception if any code-example tag has a `title` attribute', () => {
        const docs = [
          {
            name: 'Document A',
            renderedContent: `
              Example 1: <${CODE_TAG} path="test/url" header="This is a header "></${CODE_TAG}>
              Example 2: <${CODE_TAG} path="test/url" title="This is a title 2"></${CODE_TAG}>
            `,
          },
          {
            name: 'Document B',
            renderedContent: `
              Example 3: <${CODE_TAG} path="test/url" title="This is a title 3"></${CODE_TAG}>
              Example 4: <${CODE_TAG} path="test/url" header="This is a header 4"></${CODE_TAG}>
            `,
          },
        ];

        expect(() => processor.$process(docs)).toThrowError(
          'Some code snippets use the `title` attribute instead of `header`.');

        expect(log.error).toHaveBeenCalledTimes(2);
        expect(log.error).toHaveBeenCalledWith(
          `Using the "title" attribute for specifying a ${CODE_TAG} header is no longer supported. ` +
          'Use the "header" attribute instead.\n' +
          `<${CODE_TAG} path="test/url" title="This is a title 2"> - doc "Document A"`);
        expect(log.error).toHaveBeenCalledWith(
          `Using the "title" attribute for specifying a ${CODE_TAG} header is no longer supported. ` +
          'Use the "header" attribute instead.\n' +
          `<${CODE_TAG} path="test/url" title="This is a title 3"> - doc "Document B"`);
      });

      it('should throw an exception for `title` attribute even if `ignoreBrokenExamples` is set to true', () => {
        processor.ignoreBrokenExamples = true;
        const docs = [
          { renderedContent: `<${CODE_TAG} path="test/url" title="This is a title"></${CODE_TAG}>` },
        ];
        expect(() => processor.$process(docs)).toThrowError(
          'Some code snippets use the `title` attribute instead of `header`.');
      });

      it('should throw an exception for `title` attribute even if there is no `path` attribute', () => {
        const docs = [
          { renderedContent: `<${CODE_TAG} title="This is a title">Hard-coded contents.</${CODE_TAG}>` },
        ];
        expect(() => processor.$process(docs)).toThrowError(
          'Some code snippets use the `title` attribute instead of `header`.');
      });
    })
  );
});
