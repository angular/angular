var ngdocFileReaderFactory = require('./ngdoc');
var path = require('canonical-path');

describe('ngdocFileReader', function() {

  var fileReader;

  var createFileInfo = function(file, content, basePath) {
    return {
      fileReader: fileReader.name,
      filePath: file,
      baseName: path.basename(file, path.extname(file)),
      extension: path.extname(file).replace(/^\./, ''),
      basePath: basePath,
      relativePath: path.relative(basePath, file),
      content: content
    };
  };


  beforeEach(function() {
    fileReader = ngdocFileReaderFactory();
  });


  describe('defaultPattern', function() {
    it('should match .md files', function() {
      expect(fileReader.defaultPattern.test('abc.md')).toBeTruthy();
      expect(fileReader.defaultPattern.test('abc.js')).toBeFalsy();
    });
  });


  describe('getDocs', function() {
    it('should return an object containing info about the file and its contents', function() {
      var fileInfo = createFileInfo('project/path/modules/someModule/foo/docs/subfolder/bar.ngdoc', 'A load of content', 'project/path');
      expect(fileReader.getDocs(fileInfo)).toEqual([{
        docType: 'guide',
        content: 'A load of content',
        startingLine: 1
      }]);
    });
  });
});

