const testPackage = require('../../helpers/test-package');
const processorFactory = require('./fixupRealProjectRelativePath');
const Dgeni = require('dgeni');

describe('fixupRealProjectRelativePath processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('fixupRealProjectRelativePath');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toContain('readTypeScriptModules');
    expect(processor.$runBefore).toContain('processing-docs');
  });

  it('should add `packages` segment to the start of `realProjectRelativePath` for API docs', () => {
    const processor = processorFactory(['class', 'member']);
    const docs = [
      { docType: 'class', fileInfo: { realProjectRelativePath: 'a/b/c' } },
      { docType: 'member', fileInfo: { realProjectRelativePath: 'a/b/c/d' } },
      { docType: 'cli-command', fileInfo: { realProjectRelativePath: 'a/b/c' } },
      { docType: 'class', fileInfo: { } },
      { docType: 'class' },
    ];
    processor.$process(docs);

    expect(docs).toEqual([
      { docType: 'class', fileInfo: { realProjectRelativePath: 'packages/a/b/c' } },
      { docType: 'member', fileInfo: { realProjectRelativePath: 'packages/a/b/c/d' } },
      { docType: 'cli-command', fileInfo: { realProjectRelativePath: 'a/b/c' } },
      { docType: 'class', fileInfo: { } },
      { docType: 'class' },
    ]);
  });
});

