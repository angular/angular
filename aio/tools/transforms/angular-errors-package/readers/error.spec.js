const Dgeni = require('dgeni');
const path = require('canonical-path');
const testPackage = require('../../helpers/test-package');

describe('errorFileReader', () => {
  let dgeni, injector, fileReader;

  beforeEach(() => {
    dgeni = new Dgeni([testPackage('angular-errors-package', false)]);
    injector = dgeni.configureInjector();
    fileReader = injector.get('errorFileReader');
  });

  function createFileInfo(file, content, basePath) {
    return {
      fileReader: fileReader.name,
      filePath: file,
      baseName: path.basename(file, path.extname(file)),
      extension: path.extname(file).replace(/^\./, ''),
      basePath: basePath,
      relativePath: path.relative(basePath, file),
      content: content
    };
  }

  describe('defaultPattern', () => {
    it('should match .md files', () => {
      expect(fileReader.defaultPattern.test('abc.md')).toBeTruthy();
      expect(fileReader.defaultPattern.test('abc.js')).toBeFalsy();
    });
  });


  describe('getDocs', () => {
    it('should return an object containing info about the file and its contents', () => {
      const fileInfo = createFileInfo(
          'project/path/modules/someModule/foo/docs/subfolder/bar.md', 'A load of content',
          'project/path');
      expect(fileReader.getDocs(fileInfo)).toEqual([
        {docType: 'error', content: 'A load of content'}
      ]);
    });
  });
});
