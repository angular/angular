const testPackage = require('../../helpers/test-package');
const processorFactory = require('./matchUpDirectiveDecorators');
const Dgeni = require('dgeni');

describe('matchUpDirectiveDecorators processor', () => {

  it('should be available on the injector', () => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    const processor = injector.get('matchUpDirectiveDecorators');
    expect(processor.$process).toBeDefined();
    expect(processor.$runAfter).toContain('ids-computed');
    expect(processor.$runAfter).toContain('paths-computed');
    expect(processor.$runBefore).toContain('rendering-docs');
  });

  it('should extract selector and exportAs from the directive decorator on directive docs', () => {
    const docs = [{
      docType: 'directive',
      directiveOptions: { selector: 'a,b,c', exportAs: 'someExport' }
    }];
    processorFactory().$process(docs);
    expect(docs[0].selector).toEqual('a,b,c');
    expect(docs[0].exportAs).toEqual('someExport');
  });

  it('should ignore properties from the directive decorator on non-directive docs', () => {
    const docs = [{
      docType: 'class',
      directiveOptions: { selector: 'a,b,c', exportAs: 'someExport' }
    }];
    processorFactory().$process(docs);
    expect(docs[0].selector).toBeUndefined();
    expect(docs[0].exportAs).toBeUndefined();
  });

  it('should strip quotes off directive properties', () => {
    const docs = [{
      docType: 'directive',
      directiveOptions: { selector: '"a,b,c"', exportAs: '\'someExport\'' }
    }];
    processorFactory().$process(docs);
    expect(docs[0].selector).toEqual('a,b,c');
    expect(docs[0].exportAs).toEqual('someExport');
  });

  it('should extract inputs and outputs from the directive decorator', () => {
    const docs = [{
      docType: 'directive',
      directiveOptions: {
        inputs: ['a:b', 'x'],
        outputs: ['foo:foo']
      },
      members: [
        { name: 'a' },
        { name: 'x' },
        { name: 'foo' }
      ]
    }];
    processorFactory().$process(docs);
    expect(docs[0].inputs).toEqual([
      { propertyName: 'a', bindingName: 'b', memberDoc: docs[0].members[0] },
      { propertyName: 'x', bindingName: 'x', memberDoc: docs[0].members[1] }
    ]);

    expect(docs[0].outputs).toEqual([
      { propertyName: 'foo', bindingName: 'foo', memberDoc: docs[0].members[2] }
    ]);
  });

  it('should extract inputs and outputs from decorated properties', () => {
    const docs = [{
      docType: 'directive',
      directiveOptions: {},
      members: [
        { name: 'a1', decorators: [{ name: 'Input', arguments: ['a2'] }] },
        { name: 'b1', decorators: [{ name: 'Output', arguments: ['b2'] }] },
        { name: 'c1', decorators: [{ name: 'Input', arguments: [] }] },
        { name: 'd1', decorators: [{ name: 'Output', arguments: [] }] },
      ]
    }];
    processorFactory().$process(docs);
    expect(docs[0].inputs).toEqual([
      { propertyName: 'a1', bindingName: 'a2', memberDoc: docs[0].members[0] },
      { propertyName: 'c1', bindingName: 'c1', memberDoc: docs[0].members[2] }
    ]);

    expect(docs[0].outputs).toEqual([
      { propertyName: 'b1', bindingName: 'b2', memberDoc: docs[0].members[1] },
      { propertyName: 'd1', bindingName: 'd1', memberDoc: docs[0].members[3] }
    ]);
  });
});
