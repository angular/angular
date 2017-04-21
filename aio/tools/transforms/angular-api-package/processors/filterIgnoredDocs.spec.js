const testPackage = require('../../helpers/test-package');
const processorFactory = require('./filterIgnoredDocs');
const Dgeni = require('dgeni');

describe('filterIgnoredDocs processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('filterIgnoredDocs');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['computing-paths']);
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['ids-computed']);
  });

  it('should remove docs that match the ignore list', () => {
    const processor = processorFactory();
    processor.ignore = [/\/VERSION$/, /ignore-me/];
    const docs = [
      { id: 'public1'},
      { id: 'ignore-me/something' },
      { id: 'public2'},
      { id: 'and-me/VERSION' }
    ];
    const filteredDocs = processor.$process(docs);
    expect(filteredDocs).toEqual([
      { id: 'public1'},
      { id: 'public2'}
    ]);
  });
});
