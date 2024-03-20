const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('extractPipeParams processor', () => {
  let processor;
  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    processor = injector.get('extractPipeParams');
  });

  it('should be available on the injector', () => {
    expect(processor.$process).toBeDefined();
  });

  it('should run before the correct processor', () => {
    expect(processor.$runBefore).toEqual(['docs-processed']);
  });

  it('should run after the correct processor', () => {
    expect(processor.$runAfter).toEqual(['extractDecoratedClassesProcessor']);
  });

  it('should throw an error if the pipe document does not contain a `transform` method', () => {
    expect(() => processor.$process([{ docType: 'pipe' }])).toThrowError('Missing `transform` method - pipes must implement PipeTransform interface - doc (pipe) ');
    expect(() => processor.$process([{ docType: 'pipe', members: [] }])).toThrowError('Missing `transform` method - pipes must implement PipeTransform interface - doc (pipe) ');
    expect(() => processor.$process([{ docType: 'pipe', members: [ { name: 'notTransform' }] }])).toThrowError('Missing `transform` method - pipes must implement PipeTransform interface - doc (pipe) ');
  });

  it('should extract the pipe name', () => {
    const docs = [ { docType: 'pipe', pipeOptions: { name: 'testPipe' }, members: [ { name: 'transform', parameterDocs: [] }] } ];
    processor.$process(docs);
    expect(docs[0].pipeName).toEqual('testPipe');
  });

  it('should extract the value parameter', () => {
    const valueParam = {};
    const pipeParam1 = {};
    const pipeParam2 = {};
    const docs = [ { docType: 'pipe', pipeOptions: { name: 'testPipe' }, members: [
      { name: 'transform', parameterDocs: [valueParam, pipeParam1, pipeParam2] }
    ] } ];
    processor.$process(docs);
    expect(docs[0].valueParam).toBe(valueParam);
  });

  it('should extract the pipe parameters', () => {
    const valueParam = {};
    const pipeParam1 = {};
    const pipeParam2 = {};
    const docs = [ { docType: 'pipe', pipeOptions: { name: 'testPipe' }, members: [
      { name: 'transform', parameterDocs: [valueParam, pipeParam1, pipeParam2] }
    ] } ];
    processor.$process(docs);
    expect(docs[0].pipeParams.length).toEqual(2);
    expect(docs[0].pipeParams[0]).toBe(pipeParam1);
    expect(docs[0].pipeParams[1]).toBe(pipeParam2);
  });
});


