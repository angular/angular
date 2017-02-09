var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('mergeDecoratorDocs processor', function() {
  var dgeni, injector, processor, decoratorDoc, decoratorDocWithTypeAssertion, otherDoc;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('angular.io-package')]);
    injector = dgeni.configureInjector();
    processor = injector.get('mergeDecoratorDocs');

    decoratorDoc = {
      name: 'X',
      docType: 'var',
      exportSymbol: {
        valueDeclaration:
            {initializer: {expression: {text: 'makeDecorator'}, arguments: [{text: 'X'}]}}
      }
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
      }
    };
    otherDoc = {
      name: 'Y',
      docType: 'var',
      exportSymbol: {
        valueDeclaration:
            {initializer: {expression: {text: 'otherCall'}, arguments: [{text: 'param1'}]}}
      }
    };
  });


  it('should change the docType of only the docs that are initialied by a call to makeDecorator',
     function() {
       processor.$process([decoratorDoc, decoratorDocWithTypeAssertion, otherDoc]);
       expect(decoratorDoc.docType).toEqual('decorator');
       expect(decoratorDocWithTypeAssertion.docType).toEqual('decorator');
       expect(otherDoc.docType).toEqual('var');
     });

  it('should extract the "type" of the decorator meta data', function() {
    processor.$process([decoratorDoc, decoratorDocWithTypeAssertion, otherDoc]);
    expect(decoratorDoc.decoratorType).toEqual('X');
    expect(decoratorDocWithTypeAssertion.decoratorType).toEqual('Y');
  });
});