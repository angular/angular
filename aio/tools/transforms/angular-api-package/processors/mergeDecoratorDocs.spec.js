var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('mergeDecoratorDocs processor', () => {
  var dgeni, injector, processor, moduleDoc, decoratorDoc, metadataDoc, decoratorDocWithTypeAssertion, otherDoc;

  beforeEach(() => {
    dgeni = new Dgeni([testPackage('angular-api-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('mergeDecoratorDocs');

    moduleDoc = {};

    decoratorDoc = {
      name: 'Component',
      docType: 'const',
      description: 'A description of the metadata for the Component decorator',
      exportSymbol: {
        valueDeclaration:
            {initializer: {expression: {text: 'makeDecorator'}, arguments: [{text: 'X'}]}}
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
      callMember: {
        description: 'The actual description of the call signature',
        whatItDoes: 'Does something cool...',
        howToUse: 'Use it like this...'
      },
      moduleDoc
    };

    decoratorDocWithTypeAssertion = {
      name: 'Y',
      docType: 'var',
      exportSymbol: {
        valueDeclaration: {
          initializer: {
            expression:
                {type: {}, expression: {text: 'makeDecorator'}, arguments: [{text: 'Y'}]}
          }
        }
      },
      moduleDoc
    };
    otherDoc = {
      name: 'Y',
      docType: 'var',
      exportSymbol: {
        valueDeclaration:
            {initializer: {expression: {text: 'otherCall'}, arguments: [{text: 'param1'}]}}
      },
      moduleDoc
    };

    moduleDoc.exports = [decoratorDoc, metadataDoc, decoratorDocWithTypeAssertion, otherDoc];
  });


  it('should change the docType of only the docs that are initialied by a call to makeDecorator', () => {
    processor.$process([decoratorDoc, metadataDoc, decoratorDocWithTypeAssertion, otherDoc]);
    expect(decoratorDoc.docType).toEqual('decorator');
    expect(decoratorDocWithTypeAssertion.docType).toEqual('decorator');
    expect(otherDoc.docType).toEqual('var');
  });

  it('should extract the "type" of the decorator meta data', () => {
    processor.$process([decoratorDoc, metadataDoc, decoratorDocWithTypeAssertion, otherDoc]);
    expect(decoratorDoc.decoratorType).toEqual('X');
    expect(decoratorDocWithTypeAssertion.decoratorType).toEqual('Y');
  });

  it('should copy across properties from the call signature doc', () => {
    processor.$process([decoratorDoc, metadataDoc, decoratorDocWithTypeAssertion, otherDoc]);
    expect(decoratorDoc.description).toEqual('The actual description of the call signature');
    expect(decoratorDoc.whatItDoes).toEqual('Does something cool...');
    expect(decoratorDoc.howToUse).toEqual('Use it like this...');
  });

  it('should remove the metadataDoc from the module exports', () => {
    processor.$process([decoratorDoc, metadataDoc, decoratorDocWithTypeAssertion, otherDoc]);
    expect(moduleDoc.exports).not.toContain(metadataDoc);
  });
});
