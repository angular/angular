const testPackage = require('../../helpers/test-package');
const processorFactory = require('./migrateLegacyJSDocTags');
const log = require('dgeni/lib/mocks/log')(false);
const createDocMessage = require('dgeni-packages/base/services/createDocMessage')();
const Dgeni = require('dgeni');

describe('migrateLegacyJSDocTags processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('migrateLegacyJSDocTags');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    const processor = processorFactory(log, createDocMessage);
    expect(processor.$runBefore).toEqual(['processing-docs']);
  });

  it('should run after the correct processor', () => {
    const processor = processorFactory(log, createDocMessage);
    expect(processor.$runAfter).toEqual(['tags-extracted']);
  });

  it('should migrate `howToUse` property to `usageNotes` property', () => {
    const processor = processorFactory(log, createDocMessage);
    const docs = [
      { howToUse: 'this is how to use it' }
    ];
    processor.$process(docs);
    expect(docs[0].howToUse).toBe(null);
    expect(docs[0].usageNotes).toEqual('this is how to use it');
  });

  it('should migrate `whatItDoes` property to the `description`', () => {
    const processor = processorFactory(log, createDocMessage);
    const docs = [
      { whatItDoes: 'what it does' },
      { whatItDoes: 'what it does', description: 'the description' },
      { description: 'the description' }
    ];
    processor.$process(docs);
    expect(docs[0].whatItDoes).toBe(null);
    expect(docs[0].description).toEqual('what it does');

    expect(docs[1].whatItDoes).toBe(null);
    expect(docs[1].description).toEqual('what it does\n\nthe description');

    expect(docs[2].whatItDoes).toBeUndefined();
    expect(docs[2].description).toEqual('the description');
  });

  it('should ignore docs that have neither `howToUse` nor `whatItDoes` properties', () => {
    const processor = processorFactory(log, createDocMessage);
    const docs = [
      { },
      { description: 'the description' }
    ];
    processor.$process(docs);
    expect(docs).toEqual([
      { },
      { description: 'the description' }
    ]);
  });
});