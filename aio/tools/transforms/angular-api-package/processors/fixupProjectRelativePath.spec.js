const testPackage = require('../../helpers/test-package');
const processorFactory = require('./fixupProjectRelativePath');
const Dgeni = require('dgeni');

describe('fixupProjectRelativePath processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('fixupProjectRelativePath');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toContain('readTypeScriptModules');
    expect(processor.$runBefore).toContain('processing-docs');
  });

  it('should add `packages` segment to the start of `projectRelativePath` for API docs', () => {
    const processor = processorFactory(['class', 'member']);
    const docs = [
      { docType: 'class', fileInfo: { projectRelativePath: 'a/b/c', realFilePath: '/root/a/b/c' } },
      { docType: 'member', fileInfo: { projectRelativePath: 'a/b/c/d', realFilePath: '/root/a/b/c/d' } },
      { docType: 'cli-command', fileInfo: { projectRelativePath: 'a/b/c', realFilePath: '/root/a/b/c' } },
      { docType: 'class', fileInfo: { } },
      { docType: 'class' },
    ];
    processor.$process(docs);

    expect(docs).toEqual([
      { docType: 'class', fileInfo: { projectRelativePath: 'packages/a/b/c', realFilePath: '/root/a/b/c' } },
      { docType: 'member', fileInfo: { projectRelativePath: 'packages/a/b/c/d', realFilePath: '/root/a/b/c/d' } },
      { docType: 'cli-command', fileInfo: { projectRelativePath: 'a/b/c', realFilePath: '/root/a/b/c' } },
      { docType: 'class', fileInfo: { } },
      { docType: 'class' },
    ]);
  });
});

