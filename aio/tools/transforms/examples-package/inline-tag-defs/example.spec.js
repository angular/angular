var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('example inline-tag-def', function() {
  let injector, tag, collectExamples, exampleMap;

  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('examples-package', true)]);
    injector = dgeni.configureInjector();
    tag = injector.get('exampleInlineTagDef');
    collectExamples = injector.get('collectExamples');
    exampleMap = injector.get('exampleMap');
  });

  it('should be available as a service', () => {
    expect(tag).toBeDefined();
    expect(tag.name).toEqual('example');
  });

  describe('handler', () => {
    let handler;

    beforeEach(() => {
      handler = tag.handler;
      collectExamples.exampleFolders = ['examples'];
      exampleMap['examples'] = {
        'test/url': { regions: {
          '': { renderedContent: 'whole file' },
          'region-1': { renderedContent: 'region 1 contents' }
        } }
      };
    });

    it('should throw an error if there is no matching example', () => {
      expect(function() {
        handler({}, 'example', 'missing/uri');
      }).toThrowError();

      expect(function() {
        handler({}, 'example', 'test/url missing-region');
      }).toThrowError();
    });

    it('should contain the whole contents from the example file if no region is specified', () => {
      expect(handler({}, 'example', 'test/url')).toEqual('<code-example>\nwhole file\n</code-example>');
    });

    it('should contain the region contents from the example file if a region is specified', () => {
      expect(handler({}, 'example', 'test/url region-1')).toEqual('<code-example>\nregion 1 contents\n</code-example>');
    });

    it('should add a title if specified', () => {
      expect(handler({}, 'example', 'test/url region-1 \'Some Title\'')).toEqual('<code-example title="Some Title">\nregion 1 contents\n</code-example>');
      expect(handler({}, 'example', 'test/url region-1 Some Title')).toEqual('<code-example title="Some Title">\nregion 1 contents\n</code-example>');
    });

    it('should contain the whole contents from the example file if an empty ("") region is specified', () => {
      expect(handler({}, 'example', 'test/url \'\'')).toEqual('<code-example>\nwhole file\n</code-example>');
      expect(handler({}, 'example', 'test/url \'\' Some Title')).toEqual('<code-example title="Some Title">\nwhole file\n</code-example>');
    });

    it('should add in linenum attribute if specified', () => {
      expect(handler({}, 'example', 'test/url --linenums=\'false\'')).toEqual('<code-example linenums="false">\nwhole file\n</code-example>');
      expect(handler({}, 'example', 'test/url --linenums=\'true\'')).toEqual('<code-example linenums="true">\nwhole file\n</code-example>');
      expect(handler({}, 'example', 'test/url --linenums=\'15\'')).toEqual('<code-example linenums="15">\nwhole file\n</code-example>');
    });
  });
});

