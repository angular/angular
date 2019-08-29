var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');
var path = require('path');

describe('collectExampleRegions processor', () => {
  var injector, processor, exampleMap, regionParser;

  beforeEach(function() {

    regionParser = jasmine.createSpy('regionParser').and.callFake(function(contents, extension) {
      return { contents: 'PARSED:' + contents, regions: {dummy: extension} };
    });

    const dgeni =
        new Dgeni([testPackage('examples-package', true).factory('regionParser', function() {
          return regionParser;
        })]);

    injector = dgeni.configureInjector();
    exampleMap = injector.get('exampleMap');
    processor = injector.get('collectExamples');

    processor.exampleFolders = ['examples-1', 'examples-2'];
  });

  describe('$process', () => {

    it('should initialise the `exampleMap` even if there are no examples to collect', () => {
      processor.$process([]);
      expect(exampleMap['examples-1']).toEqual(jasmine.any(Object));
      expect(exampleMap['examples-2']).toEqual(jasmine.any(Object));
    });

    it('should identify example files that are in the exampleFolders', () => {
      const docs = [
        createDoc('A', 'examples-1/x/app.js'), createDoc('B', 'examples-1/y/index.html'),
        createDoc('C', 'examples-2/s/app.js'), createDoc('D', 'examples-2/t/style.css'),
        createDoc('E', 'other/b/c.js')
      ];

      processor.$process(docs);

      expect(exampleMap['examples-1']['x/app.js']).toBeDefined();
      expect(exampleMap['examples-1']['y/index.html']).toBeDefined();
      expect(exampleMap['examples-2']['s/app.js']).toBeDefined();
      expect(exampleMap['examples-2']['t/style.css']).toBeDefined();

      expect(exampleMap['other']).toBeUndefined();
    });

    it('should remove example files from the docs collection', () => {
      const docs = [
        createDoc('Example A', 'examples-1/x/app.js'),
        createDoc('Example B', 'examples-1/y/index.html'),
        createDoc('Other doc 1', 'examples-2/t/style.css', 'content'),
        createDoc('Example C', 'examples-2/s/app.js'),
        createDoc('Other doc 2', 'other/b/c.js', 'content')
      ];

      const processedDocs = processor.$process(docs);

      expect(processedDocs.filter(doc => doc.docType === 'example-file')).toEqual([]);
    });

    it('should not remove docs from the docs collection that are not example files', () => {
      const docs = [
        createDoc('Example A', 'examples-1/x/app.js'),
        createDoc('Example B', 'examples-1/y/index.html'),
        createDoc('Other doc 1', 'examples-2/t/style.css', 'content'),
        createDoc('Example C', 'examples-2/s/app.js'),
        createDoc('Other doc 2', 'other/b/c.js', 'content')
      ];

      const processedDocs = processor.$process(docs);

      expect(processedDocs.filter(doc => doc.docType !== 'example-file'))
          .toEqual(jasmine.objectContaining([
            createDoc('Other doc 1', 'examples-2/t/style.css', 'content'),
            createDoc('Other doc 2', 'other/b/c.js', 'content')
          ]));
    });

    it('should call `regionParser` from with the content and file extension of each example doc',
      () => {
        const docs = [
          createDoc('Example A', 'examples-1/x/app.js'),
          createDoc('Example B', 'examples-1/y/index.html'),
          createDoc('Other doc 1', 'examples-2/t/style.css', 'content'),
          createDoc('Example C', 'examples-2/s/app.js'),
          createDoc('Other doc 2', 'other/b/c.js', 'content')
        ];

        processor.$process(docs);

        expect(regionParser).toHaveBeenCalledTimes(3);
        expect(regionParser).toHaveBeenCalledWith('Example A', 'js');
        expect(regionParser).toHaveBeenCalledWith('Example B', 'html');
        expect(regionParser).toHaveBeenCalledWith('Example C', 'js');
      });


    it('should attach parsed content as renderedContent to the example file docs', () => {
      const docs = [
        createDoc('A', 'examples-1/x/app.js'),
        createDoc('B', 'examples-1/y/index.html'),
        createDoc('C', 'examples-2/s/app.js'),
        createDoc('D', 'examples-2/t/style.css'),
      ];

      processor.$process(docs);

      expect(exampleMap['examples-1']['x/app.js'].renderedContent).toEqual('PARSED:A');
      expect(exampleMap['examples-1']['y/index.html'].renderedContent).toEqual('PARSED:B');
      expect(exampleMap['examples-2']['s/app.js'].renderedContent).toEqual('PARSED:C');
      expect(exampleMap['examples-2']['t/style.css'].renderedContent).toEqual('PARSED:D');

    });

    it('should create region docs for each region in the example file docs', () => {
      const docs = [
        createDoc('/* #docregion X */\nA', 'examples-1/x/app.js'),
        createDoc('<!-- #docregion Y -->\nB', 'examples-1/y/index.html'),
        createDoc('/* #docregion Z */\nC', 'examples-2/t/style.css'),
      ];

      const newDocs = processor.$process(docs);

      expect(newDocs.length).toEqual(3);
      expect(newDocs).toEqual([
        jasmine.objectContaining({
          docType: 'example-region',
          name: 'dummy',
          id: 'examples-1/x/app.js#dummy',
          contents: 'js'
        }),
        jasmine.objectContaining({
          docType: 'example-region',
          name: 'dummy',
          id: 'examples-1/y/index.html#dummy',
          contents: 'html'
        }),
        jasmine.objectContaining({
          docType: 'example-region',
          name: 'dummy',
          id: 'examples-2/t/style.css#dummy',
          contents: 'css'
        })
      ]);
    });

    it('should attach region docs to the example file docs', () => {
      const docs = [
        createDoc('/* #docregion X */\nA', 'examples-1/x/app.js'),
        createDoc('<!-- #docregion Y -->\nB', 'examples-1/y/index.html'),
        createDoc('/* #docregion Z */\nC', 'examples-2/t/style.css'),
      ];

      processor.$process(docs);

      expect(exampleMap['examples-1']['x/app.js'].regions).toEqual({
        dummy: {
          docType: 'example-region',
          path: 'examples-1/x/app.js',
          name: 'dummy',
          id: 'examples-1/x/app.js#dummy',
          aliases: ['examples-1/x/app.js#dummy'],
          contents: 'js'
        }
      });
      expect(exampleMap['examples-1']['y/index.html'].regions).toEqual({
        dummy: {
          docType: 'example-region',
          path: 'examples-1/y/index.html',
          name: 'dummy',
          id: 'examples-1/y/index.html#dummy',
          aliases: ['examples-1/y/index.html#dummy'],
          contents: 'html'
        }
      });
      expect(exampleMap['examples-2']['t/style.css'].regions).toEqual({
        dummy: {
          docType: 'example-region',
          path: 'examples-2/t/style.css',
          name: 'dummy',
          id: 'examples-2/t/style.css#dummy',
          aliases: ['examples-2/t/style.css#dummy'],
          contents: 'css'
        }
      });
    });
  });

  describe('filtered examples', () => {
    it('should indicate if an example was filtered', () => {
      processor.registerIgnoredExamples(['c/d/e', 'e/f/g'], 'path/to/gitignore');
      processor.registerIgnoredExamples(['x/y/z'], 'path/to/other/gitignore');
      expect(processor.isExampleIgnored('a/b/c')).toBeFalsy();
      expect(processor.isExampleIgnored('c/d/e')).toEqual('path/to/gitignore');
      expect(processor.isExampleIgnored('e/f/g')).toEqual('path/to/gitignore');
      expect(processor.isExampleIgnored('x/y/z')).toEqual('path/to/other/gitignore');
    });
  });
});


function createDoc(content, relativePath, docType) {
  return {
    fileInfo: {relativePath: relativePath, extension: path.extname(relativePath).substr(1)},
    content: content,
    docType: docType || 'example-file',
    startingLine: 1
  };
}
