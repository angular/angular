const testPackage = require('../../helpers/test-package');
const processorFactory = require('./processAliasDocs');
const Dgeni = require('dgeni');
const mockLogFactory = require('dgeni/lib/mocks/log');
const createDocMessageFactory = require('dgeni-packages/base/services/createDocMessage');

describe('processAliasDocs processor', () => {

  let getDocFromAlias, log, createDocMessage, processor;

  beforeEach(() => {
    getDocFromAlias = jasmine.createSpy('getDocFromAlias');
    log = mockLogFactory(false);
    createDocMessage = createDocMessageFactory();
    processor = processorFactory(getDocFromAlias, log, createDocMessage);
  });

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('processAliasDocs');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    expect(processor.$runBefore).toEqual(['filterPrivateDocs']);
  });

  it('should run after the correct processor', () => {
    expect(processor.$runAfter).toEqual(['tags-extracted', 'ids-computed']);
  });

  it('should ignore docs that do not have an `@alias` tag', () => {
    const docs = [{}];
    getDocFromAlias.and.returnValue([{ prop1: 'prop-1', prop2: 'prop-2', prop3: 'prop-3' }]);
    processor.$process(docs);
    expect(docs).toEqual([{}]);
  });

  it('should copy over properties from a valid alias doc', () => {
    const docs = [{ aliasDocId: 'alias-doc' }];
    getDocFromAlias.and.returnValue([{ prop1: 'prop-1', prop2: 'prop-2', prop3: 'prop-3' }]);
    processor.$process(docs);
    expect(docs).toEqual([
      { prop1: 'prop-1', prop2: 'prop-2', prop3: 'prop-3' }
    ]);
  });

  it('should error if `@alias` does not match a doc', () => {
    const docs = [{ aliasDocId: 'alias-doc' }];
    getDocFromAlias.and.returnValue([]);
    expect(() => processor.$process(docs)).toThrowError('There is no doc that matches "@alias alias-doc" - doc');
  });

  it('should error if `@alias` matches more than one doc', () => {
    const docs = [{ aliasDocId: 'alias-doc' }];
    getDocFromAlias.and.returnValue([{id: 'alias-1'}, {id: 'alias-2'}]);
    expect(() => processor.$process(docs)).toThrowError('There is more than one doc that matches "@alias alias-doc": alias-1, alias-2. - doc');
  });

  it('should remove all but the specified properties from the original doc', () => {
    processor.propertiesToKeep = ['x', 'y'];
    const docs = [{ aliasDocId: 'alias-doc', x: 'original-x', z: 'original-z' }];
    getDocFromAlias.and.returnValue([{}]);
    processor.$process(docs);
    expect(docs).toEqual([{ x: 'original-x' }]);
  });

  it('should copy over all but the specified properties from the aliased doc', () => {
    processor.propertiesToKeep = ['x', 'y'];
    const docs = [{ aliasDocId: 'alias-doc', x: 'original-x', z: 'original-z' }];
    getDocFromAlias.and.returnValue([{ x: 'alias-x', y: 'alias-y', z: 'alias-z' }]);
    processor.$process(docs);
    expect(docs).toEqual([{ x: 'original-x', z: 'alias-z' }]);
  });

  it('should have default properties to keep', () => {
    expect(processor.propertiesToKeep).toEqual([
      'name', 'id', 'aliases', 'fileInfo', 'startingLine', 'endingLine',
      'path', 'originalModule', 'outputPath', 'privateExport', 'moduleDoc'
    ]);
  });
});
