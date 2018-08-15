const processorFactory = require('./removeInjectableConstructors');
const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('removeInjectableConstructors processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('removeInjectableConstructors');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toEqual(['processing-docs', 'splitDescription']);
    expect(processor.$runBefore).toEqual(['docs-processed']);
  });

  it('should remove undocumented constructors from docs that have an "Injectable" decorator on them', () => {
    const processor = processorFactory();
    const docs = [
      { constructorDoc: {} },
      { constructorDoc: {}, decorators: [] },
      { constructorDoc: {}, decorators: [{ name: 'Injectable' }] },
      { constructorDoc: {}, decorators: [{ name: 'Component' }] },
      { constructorDoc: {}, decorators: [{ name: 'Directive' }] },
      { constructorDoc: {}, decorators: [{ name: 'Pipe' }] },
      { constructorDoc: {}, decorators: [{ name: 'Other' }, { name: 'Injectable' }] },
      { constructorDoc: {}, decorators: [{ name: 'Other' }] },

      { constructorDoc: { shortDescription: 'Blah' } },
      { constructorDoc: { shortDescription: 'Blah' }, decorators: [] },
      { constructorDoc: { shortDescription: 'Blah' }, decorators: [{ name: 'Injectable' }] },
      { constructorDoc: { shortDescription: 'Blah' }, decorators: [{ name: 'Component' }] },
      { constructorDoc: { shortDescription: 'Blah' }, decorators: [{ name: 'Directive' }] },
      { constructorDoc: { shortDescription: 'Blah' }, decorators: [{ name: 'Pipe' }] },
      { constructorDoc: { shortDescription: 'Blah' }, decorators: [{ name: 'Other' }, { name: 'Injectable' }] },
      { constructorDoc: { shortDescription: 'Blah' }, decorators: [{ name: 'Other' }] },
    ];

    processor.$process(docs);

    expect(docs[0].constructorDoc).toBeDefined();
    expect(docs[1].constructorDoc).toBeDefined();
    expect(docs[2].constructorDoc).toBeUndefined();
    expect(docs[3].constructorDoc).toBeUndefined();
    expect(docs[4].constructorDoc).toBeUndefined();
    expect(docs[5].constructorDoc).toBeUndefined();
    expect(docs[6].constructorDoc).toBeUndefined();
    expect(docs[7].constructorDoc).toBeDefined();

    expect(docs[8].constructorDoc).toBeDefined();
    expect(docs[9].constructorDoc).toBeDefined();
    expect(docs[10].constructorDoc).toBeDefined();
    expect(docs[11].constructorDoc).toBeDefined();
    expect(docs[12].constructorDoc).toBeDefined();
    expect(docs[13].constructorDoc).toBeDefined();
    expect(docs[14].constructorDoc).toBeDefined();
    expect(docs[15].constructorDoc).toBeDefined();
  });
});
