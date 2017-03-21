const testPackage = require('../../helpers/test-package');
const processorFactory = require('./filterPrivateDocs');
const Dgeni = require('dgeni');

describe('filterPrivateDocs processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular.io-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('filterPrivateDocs');
    expect(processor.$process).toBeDefined();
  });

  it('should run before computing-paths', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['computing-paths'])
  });

  it('should run before computing-paths', () => {
    const processor = processorFactory();
    expect(processor.$runAfter).toEqual(['extra-docs-added']);
  });

  it('should remove docs that start with a barred o', () => {
    const processor = processorFactory();
    const docs = [
      { name: 'public1'},
      { name: 'ɵPrivate1' },
      { name: 'public2'},
      { name: 'ɵPrivate2' },
      { id: 'other'}
    ];
    const filteredDocs = processor.$process(docs);
    expect(filteredDocs).toEqual([
      { name: 'public1'},
      { name: 'public2'},
      { id: 'other'}
    ]);
  })
});