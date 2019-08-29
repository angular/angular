const testPackage = require('../../helpers/test-package');
const processorFactory = require('./filterHiddenCommands');
const Dgeni = require('dgeni');

describe('filterHiddenCommands processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('cli-docs-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('filterHiddenCommands');
    expect(processor.$process).toBeDefined();
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['files-read']);
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['processCliContainerDoc', 'createSitemap']);
  });

  it('should remove CLI command docs that are hidden', () => {
    const processor = processorFactory();
    const filtered = processor.$process([
      { docType: 'cli-command', id: 'one' },
      { docType: 'cli-command', id: 'two', hidden: true },
      { docType: 'cli-command', id: 'three', hidden: false },
      { docType: 'other-doc', id: 'four', hidden: true },
      { docType: 'other-doc', id: 'five', hidden: false },
    ]);
    expect(filtered).toEqual([
      { docType: 'cli-command', id: 'one' },
      { docType: 'cli-command', id: 'three', hidden: false },
      { docType: 'other-doc', id: 'four', hidden: true },
      { docType: 'other-doc', id: 'five', hidden: false },
    ]);
  });
});
