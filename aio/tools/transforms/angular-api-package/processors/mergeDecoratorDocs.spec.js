var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('mergeDecoratorDocs processor', () => {
  let processor, moduleDoc, decoratorDoc, metadataDoc, otherDoc;

  beforeEach(() => {
    const dgeni = new Dgeni([testPackage('angular-api-package')]);
    const injector = dgeni.configureInjector();
    processor = injector.get('mergeDecoratorDocs');

    moduleDoc = {};

    decoratorDoc = {
      name: 'Component',
      docType: 'const',
      description: 'A description of the metadata for the Component decorator',
      symbol: {
        valueDeclaration: { initializer: { expression: { text: 'makeDecorator' }, arguments: [{ text: 'X' }] } }
      },
      members: [
        { name: 'templateUrl', description: 'A description of the templateUrl property' }
      ],
      moduleDoc
    };

    metadataDoc = {
      name: 'ComponentDecorator',
      docType: 'interface',
      description: 'A description of the interface for the call signature for the Component decorator',
      members: [
        {
          isCallMember: true,
          description: 'The actual description of the call signature',
          whatItDoes: 'Does something cool...',
          howToUse: 'Use it like this...'
        },
        {
          description: 'Some other member'
        }
      ],
      moduleDoc
    };

    otherDoc = {
      name: 'Y',
      docType: 'const',
      symbol: {
        valueDeclaration: { initializer: { expression: { text: 'otherCall' }, arguments: [{ text: 'param1' }] } }
      },
      moduleDoc
    };

    moduleDoc.exports = [decoratorDoc, metadataDoc, otherDoc];
  });


  it('should change the docType of only the docs that are initialized by a call to makeDecorator', () => {
    processor.$process([decoratorDoc, metadataDoc, otherDoc]);
    expect(decoratorDoc.docType).toEqual('decorator');
    expect(otherDoc.docType).toEqual('const');
  });

  it('should extract the "type" of the decorator meta data', () => {
    processor.$process([decoratorDoc, metadataDoc, otherDoc]);
    expect(decoratorDoc.decoratorType).toEqual('X');
  });

  it('should copy across properties from the call signature doc', () => {
    processor.$process([decoratorDoc, metadataDoc, otherDoc]);
    expect(decoratorDoc.description).toEqual('The actual description of the call signature');
    expect(decoratorDoc.whatItDoes).toEqual('Does something cool...');
    expect(decoratorDoc.howToUse).toEqual('Use it like this...');
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
});
