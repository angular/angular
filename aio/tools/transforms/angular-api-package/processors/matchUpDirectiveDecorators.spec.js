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

  it('should strip whitespace and quotes off directive properties', () => {
    const docs = [
      {
        docType: 'directive',
        directiveOptions: { selector: '"a,b,c"', exportAs: '\'someExport\'' }
      },
      {
        docType: 'directive',
        directiveOptions: { selector: ' a,b,c  ', exportAs: '  someExport  ' }
      },
      {
        docType: 'directive',
        directiveOptions: { selector: ' "a,b,c"  ', exportAs: '  \'someExport\'  ' }
      }
    ];
    processorFactory().$process(docs);
    expect(docs[0].selector).toEqual('a,b,c');
    expect(docs[0].exportAs).toEqual('someExport');
    expect(docs[1].selector).toEqual('a,b,c');
    expect(docs[1].exportAs).toEqual('someExport');
    expect(docs[2].selector).toEqual('a,b,c');
    expect(docs[2].exportAs).toEqual('someExport');
  });

  it('should extract inputs and outputs from the directive decorator', () => {
    const doc = {
      docType: 'directive',
      directiveOptions: {
        inputs: ['in1:in2', 'in3', '  in4:in5  ', '  in6  '],
        outputs: ['out1:out1', '  out2:out3  ', '  out4  ']
      },
      members: [
        { name: 'in1' },
        { name: 'in3' },
        { name: 'in4' },
        { name: 'in6' },
        { name: 'prop1' },
        { name: 'out1' },
        { name: 'out2' },
        { name: 'out4' },
        { name: 'prop2' },
      ]
    };

    processorFactory().$process([doc]);
    expect(doc.members).toEqual([
      { name: 'in1', boundTo: { type: 'Input', propertyName: 'in1', bindingName: 'in2' } },
      { name: 'in3', boundTo: { type: 'Input', propertyName: 'in3', bindingName: 'in3' } },
      { name: 'in4', boundTo: { type: 'Input', propertyName: 'in4', bindingName: 'in5' } },
      { name: 'in6', boundTo: { type: 'Input', propertyName: 'in6', bindingName: 'in6'  }},
      { name: 'prop1' },
      { name: 'out1', boundTo: { type: 'Output', propertyName: 'out1', bindingName: 'out1' } },
      { name: 'out2', boundTo: { type: 'Output', propertyName: 'out2', bindingName: 'out3' } },
      { name: 'out4', boundTo: { type: 'Output', propertyName: 'out4', bindingName: 'out4'  }},
      { name: 'prop2' },
    ]);
  });

  it('should extract inputs and outputs from decorated properties', () => {
    const doc = {
      docType: 'directive',
      directiveOptions: {},
      members: [
        { name: 'a1', decorators: [{ name: 'Input', arguments: ['a2'] }] },
        { name: 'b1', decorators: [{ name: 'Output', arguments: ['b2'] }] },
        { name: 'c1', decorators: [{ name: 'Input', arguments: [] }] },
        { name: 'd1', decorators: [{ name: 'Output', arguments: [] }] },
      ]
    };
    processorFactory().$process([doc]);
    expect(doc.members).toEqual([
      { name: 'a1', decorators: [{ name: 'Input', arguments: ['a2'] }], boundTo: { type: 'Input', propertyName: 'a1', bindingName: 'a2' } },
      { name: 'b1', decorators: [{ name: 'Output', arguments: ['b2'] }], boundTo: { type: 'Output', propertyName: 'b1', bindingName: 'b2' } },
      { name: 'c1', decorators: [{ name: 'Input', arguments: [] }], boundTo: { type: 'Input', propertyName: 'c1', bindingName: 'c1' } },
      { name: 'd1', decorators: [{ name: 'Output', arguments: [] }], boundTo: { type: 'Output', propertyName: 'd1', bindingName: 'd1' } },
    ]);
  });

  it('should merge directive inputs/outputs with decorator property inputs/outputs', () => {
    const doc = {
      docType: 'directive',
      directiveOptions: {
        inputs: ['a1:a2'],
        outputs: ['b1:b2']
      },
      members: [
        { name: 'a1' },
        { name: 'a3', decorators: [{ name: 'Input', arguments: ['a4'] }] },
        { name: 'b1' },
        { name: 'b3', decorators: [{ name: 'Output', arguments: ['b4'] }] },
      ]
    };
    processorFactory().$process([doc]);
    expect(doc.members).toEqual([
      { name: 'a1', boundTo: { type: 'Input', propertyName: 'a1', bindingName: 'a2' } },
      { name: 'a3', boundTo: { type: 'Input', propertyName: 'a3', bindingName: 'a4' }, decorators: [{ name: 'Input', arguments: ['a4'] }] },
      { name: 'b1', boundTo: { type: 'Output', propertyName: 'b1', bindingName: 'b2' } },
      { name: 'b3', boundTo: { type: 'Output', propertyName: 'b3', bindingName: 'b4' }, decorators: [{ name: 'Output', arguments: ['b4'] }] },
    ]);
  });
});
