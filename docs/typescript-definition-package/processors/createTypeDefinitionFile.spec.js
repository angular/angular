var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');
var path = require('canonical-path');
var _ = require('lodash');

describe('createTypeDefinitionFile processor', function() {
  var dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    processor = injector.get('createTypeDefinitionFile');

    // Initialize the processor
    processor.typeDefinitions = [{
      id: 'angular2/angular2',
      modules: { 'angular2/angular2': 'angular2/angular2' }
    }];
  });



  describe('classes with private constructors', function() {
    
    it('should convert heritage from `implements` into `extends`', function() {
      
      // Create some mock docs for testing
      var docs = [
        {
          id: 'angular2/angular2',
          exports: [
            { docType: 'class', heritage: 'implements Xyz', constructorDoc: { private: true }  }
          ]
        }
      ];

      docs = processor.$process(docs);
      
      expect(docs.length).toEqual(1);
      expect(docs[0].docType).toEqual('type-definition');

      var moduleDoc = docs[0].moduleDocs['angular2/angular2'].doc;
      expect(moduleDoc.exports.length).toEqual(2);
      expect(moduleDoc.exports[0].heritage).toEqual('extends Xyz');
    });
  });
	
});