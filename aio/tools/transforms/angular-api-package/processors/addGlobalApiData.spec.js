const testPackage = require('../../helpers/test-package');
const processorFactory = require('./addGlobalApiData');
const Dgeni = require('dgeni');

describe('addGlobalApiData processor', () => {
  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('addGlobalApiDataProcessor');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory();
    expect(processor.$runBefore).toEqual(['computing-ids']);
  });

  it('should mark global APIs correctly', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'function', name: 'noNamespace', globalApi: '' },
      { docType: 'function', name: 'withNamespace', globalApi: 'ng' },
      { docType: 'function', name: 'notGlobal' },
    ];
    processor.$process(docs);
    expect(docs[0].global).toBe(true);
    expect(docs[1].global).toBe(true);
    expect(docs[2].global).toBeUndefined();
  });

  it('should prefix global APIs with the namespace, if one is defined', () => {
    const processor = processorFactory();
    const docs = [
      { docType: 'function', name: 'noNamespace', globalApi: '' },
      { docType: 'function', name: 'withNamespace', globalApi: 'ng' },
      { docType: 'function', name: 'notGlobal' },
    ];
    processor.$process(docs);
    expect(docs[0].name).toBe('noNamespace');
    expect(docs[1].name).toBe('ng.withNamespace');
    expect(docs[2].name).toBe('notGlobal');

    expect(docs[0].unprefixedName).toBeUndefined();
    expect(docs[1].unprefixedName).toBe('withNamespace');
    expect(docs[2].unprefixedName).toBeUndefined();

    expect(docs[0].globalNamespace).toBeUndefined();
    expect(docs[1].globalNamespace).toBe('ng');
    expect(docs[2].globalNamespace).toBeUndefined();
  });
});
