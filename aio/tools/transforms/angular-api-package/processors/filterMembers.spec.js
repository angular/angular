const processorFactory = require('./filterMembers');
const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('filterMembers processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('filterMembers');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toEqual(['processing-docs']);
    expect(processor.$runBefore).toEqual(['docs-processed']);
  });

  it('should remove members that match one of the not allowed patterns', () => {
    const processor = processorFactory();
    processor.notAllowedPatterns = [/^foo/, /bar$/];
    const docs = [
      // Doc without members.
      { },

      // Doc with static members only.
      {
        statics: [
          { name: 'fooStatic' },  // Will be removed.
          { name: 'FOOStatic' },
          { name: 'barStatic' },
          { name: 'statiCbar' },  // Will be removed.
        ],
      },

      // Doc with instance members only.
      {
        members: [
          { name: 'fooInstance' },  // Will be removed.
          { name: 'FOOInstance' },
          { name: 'barInstance' },
          { name: 'instancEbar' },  // Will be removed.
        ],
      },

      // Doc with both static and instance members.
      {
        statics: [
          { name: 'fooStatic' },  // Will be removed.
          { name: 'FOOStatic' },
          { name: 'barStatic' },
          { name: 'statiCbar' },  // Will be removed.
        ],
        members: [
          { name: 'fooInstance' },  // Will be removed.
          { name: 'FOOInstance' },
          { name: 'barInstance' },
          { name: 'instancEbar' },  // Will be removed.
        ],
      },
    ];

    processor.$process(docs);

    expect(docs).toEqual([
      { },
      {
        statics: [ { name: 'FOOStatic' }, { name: 'barStatic' } ],
      },
      {
        members: [ { name: 'FOOInstance' }, { name: 'barInstance' } ],
      },
      {
        statics: [ { name: 'FOOStatic' }, { name: 'barStatic' } ],
        members: [ { name: 'FOOInstance' }, { name: 'barInstance' } ],
      },
    ]);
  });

  it('should remove no members by default', () => {
    const processor = processorFactory();
    const expectedDocs = [
      {
        statics: [
          { name: '' },
          { name: 'foo' },
          { name: '__bar' },
          { name: 'ngBazDef' },
        ],
        members: [
          { name: '' },
          { name: 'foo' },
          { name: '__bar' },
          { name: 'ngBazDef' },
        ],
      },
    ];
    const actualDocs = JSON.parse(JSON.stringify(expectedDocs));

    processor.$process(actualDocs);

    expect(processor.notAllowedPatterns).toEqual([]);
    expect(actualDocs).toEqual(expectedDocs);
  });
});
