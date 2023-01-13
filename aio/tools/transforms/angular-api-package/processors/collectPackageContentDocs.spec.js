const testPackage = require('../../helpers/test-package');
const processorFactory = require('./collectPackageContentDocs');
const Dgeni = require('dgeni');

describe('collectPackageContentDocs processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('collectPackageContentDocsProcessor');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toEqual(['tags-extracted']);
    expect(processor.$runBefore).toEqual(['computing-ids', 'processPackages']);
  });

  it('should collect any `package-content` docs in the `packageContentFiles` map', () => {
    const docs = [
      { fileInfo: { filePath: 'some/a' }, docType: 'a', id: 'a' },
      { fileInfo: { filePath: 'some/x/PACKAGE.md' }, docType: 'package-content', id: 'x' },
      { fileInfo: { filePath: 'some/b' }, docType: 'b', id: 'b' },
      { fileInfo: { filePath: 'some/y/PACKAGE.md' }, docType: 'package-content', id: 'y' },
      { fileInfo: { filePath: 'some/z/PACKAGE.md' }, docType: 'package-content', id: 'z' },
    ];
    const processor = processorFactory();
    processor.$process(docs);

    expect(processor.packageContentFiles).toEqual({
      'some/x': { fileInfo: { filePath: 'some/x/PACKAGE.md' }, docType: 'package-content', id: 'x' },
      'some/y': { fileInfo: { filePath: 'some/y/PACKAGE.md' }, docType: 'package-content', id: 'y' },
      'some/z': { fileInfo: { filePath: 'some/z/PACKAGE.md' }, docType: 'package-content', id: 'z' },
    });
  });

  it('should filter out any `package-content` docs from the collection', () => {
    const docs = [
      { fileInfo: { filePath: 'some/a' }, docType: 'a', id: 'a' },
      { fileInfo: { filePath: 'some/x/PACKAGE.md' }, docType: 'package-content', id: 'x' },
      { fileInfo: { filePath: 'some/b' }, docType: 'b', id: 'b' },
      { fileInfo: { filePath: 'some/y/PACKAGE.md' }, docType: 'package-content', id: 'y' },
      { fileInfo: { filePath: 'some/z/PACKAGE.md' }, docType: 'package-content', id: 'z' },
    ];
    const processor = processorFactory();
    const newDocs = processor.$process(docs);
    expect(newDocs).toEqual([
      { fileInfo: { filePath: 'some/a' }, docType: 'a', id: 'a' },
      { fileInfo: { filePath: 'some/b' }, docType: 'b', id: 'b' },
    ]);
  });
});
