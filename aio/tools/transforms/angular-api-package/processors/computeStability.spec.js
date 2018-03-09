const log = require('dgeni/lib/mocks/log')(false);
const createDocMessage = require('dgeni-packages/base/services/createDocMessage')();
const computeStability = require('./computeStability')(log, createDocMessage);
const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('computeStability processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('computeStability');
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    expect(computeStability.$runBefore).toEqual(['rendering-docs']);
  });

  it('should run after the correct processor', () => {
    expect(computeStability.$runAfter).toEqual(['tags-extracted']);
  });

  it('should compute stability based on the existence of experimental and deprecated tags', () => {
    computeStability.docTypes = ['test'];
    const docs = [
      { docType: 'test' },
      { docType: 'test', experimental: undefined },
      { docType: 'test', experimental: true },
      { docType: 'test', experimental: '' },
      { docType: 'test', deprecated: undefined },
      { docType: 'test', deprecated: true },
      { docType: 'test', deprecated: '' },
      { docType: 'test', experimental: true, deprecated: true },
    ];
    computeStability.$process(docs);
    expect(docs.map(doc => doc.stable)).toEqual([
      true,
      true,
      undefined,
      undefined,
      true,
      undefined,
      undefined,
      undefined
    ]);
  });

  it('should ignore docs that are not in the docTypes list', () => {
    computeStability.docTypes = ['test1', 'test2'];
    const docs = [
      { docType: 'test1' },
      { docType: 'test2' },
      { docType: 'test3' },
      { docType: 'test4' },
    ];
    computeStability.$process(docs);
    expect(docs.map(doc => doc.stable)).toEqual([
      true,
      true,
      undefined,
      undefined
    ]);
  });

  it('should not ignore docs where `stable` has already been defined', () => {
    computeStability.docTypes = ['test'];
    const docs = [
      { docType: 'test' },
      { docType: 'test', stable: true },
      { docType: 'test', stable: '' },
      { docType: 'test', stable: undefined },
    ];
    computeStability.$process(docs);
    expect(docs.map(doc => doc.stable)).toEqual([
      true,
      true,
      '',
      true
    ]);
  });
});
