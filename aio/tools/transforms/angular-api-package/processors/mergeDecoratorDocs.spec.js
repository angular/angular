const testPackage = require('../../helpers/test-package');
const Dgeni = require('dgeni');

describe('mergeDecoratorDocs processor', () => {
  let processor, moduleDoc, decoratorDoc, metadataDoc, otherDoc;

  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    processor = injector.get('mergeDecoratorDocs');

    // Note that we do not include usageNotes in the tests.
    processor.propertiesToMerge = ['description', 'shortDescription'];

    moduleDoc = {};

    decoratorDoc = {
      name: 'Component',
      docType: 'const',
      shortDescription: 'decorator - short description',
      description: 'decorator - description',
      symbol: {
        valueDeclaration:
            {initializer: {expression: {text: 'makeDecorator'}, arguments: [{text: 'X'}]}}
      },
      members: [{name: 'templateUrl', description: 'templateUrl - description'}],
      moduleDoc
    };

    metadataDoc = {
      name: 'ComponentDecorator',
      docType: 'interface',
      description: 'call interface - description',
      members: [
        {
          isCallMember: true,
          description: 'call interface - call member - description',
          usageNotes: 'call interface - call member - usageNotes',
        },
        {description: 'call interface - non call member - description'}
      ],
      moduleDoc
    };

    otherDoc = {
      name: 'Y',
      docType: 'const',
      symbol: {
        valueDeclaration:
            {initializer: {expression: {text: 'otherCall'}, arguments: [{text: 'param1'}]}}
      },
      moduleDoc
    };

    moduleDoc.exports = [decoratorDoc, metadataDoc, otherDoc];
  });


  it('should change the docType of only the docs that are initialized by a call to makeDecorator',
     () => {
       processor.$process([decoratorDoc, metadataDoc, otherDoc]);
       expect(decoratorDoc.docType).toEqual('decorator');
       expect(otherDoc.docType).toEqual('const');
     });

  it('should extract the "type" of the decorator meta data', () => {
    processor.$process([decoratorDoc, metadataDoc, otherDoc]);
    expect(decoratorDoc.decoratorType).toEqual('X');
  });

  it('should copy across specified properties from the call signature doc', () => {
    processor.$process([decoratorDoc, metadataDoc, otherDoc]);
    expect(decoratorDoc.description).toEqual('call interface - call member - description');
    // Since usageNotes is not in `propertiesToMerge` it will not get copied over in these tests.
    expect(decoratorDoc.usageNotes).toBeUndefined();
    // Since `shortDescription` does not exist on the call-member this will not get overridden.
    expect(decoratorDoc.shortDescription).toEqual('decorator - short description');
  });

  it('should remove the metadataDoc from the module exports', () => {
    processor.$process([decoratorDoc, metadataDoc, otherDoc]);
    expect(moduleDoc.exports).not.toContain(metadataDoc);
  });

  it('should cope with decorators that have type params', () => {
    decoratorDoc.symbol.valueDeclaration.initializer.expression.type = {};
    processor.$process([decoratorDoc, metadataDoc, otherDoc]);
    expect(decoratorDoc.docType).toEqual('decorator');
  });

  it('should handle a type cast before the "make decorator" call', () => {
    decoratorDoc.symbol.valueDeclaration.initializer = {
      expression: decoratorDoc.symbol.valueDeclaration.initializer,
      type: {},
    };
    processor.$process([decoratorDoc, metadataDoc, otherDoc]);
    expect(decoratorDoc.docType).toEqual('decorator');
  });

  it('should handle the "make decorator" call being wrapped in a call to `attachInjectFlag()`',
     () => {
       decoratorDoc.symbol.valueDeclaration.initializer = {
         expression: {text: 'attachInjectFlag'},
         arguments: [decoratorDoc.symbol.valueDeclaration.initializer]
       };
       processor.$process([decoratorDoc, metadataDoc, otherDoc]);
       expect(decoratorDoc.docType).toEqual('decorator');
     });
});
