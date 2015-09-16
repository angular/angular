var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');
var _ = require('lodash');

describe('readTypeScriptModules', function() {
  var dgeni, injector, convertPrivateClassesToInterfaces;

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    convertPrivateClassesToInterfaces = injector.get('convertPrivateClassesToInterfaces');
  });

  it('should convert private class docs to interface docs', function() {
    var docs = [
      {
        docType: 'class',
        name: 'privateClass',
        id: 'privateClass',
        constructorDoc: { private: true }
      }
    ];
    convertPrivateClassesToInterfaces(docs, false);
    expect(docs[0].docType).toEqual('interface');
  });


  it('should not touch non-private class docs', function() {
    var docs = [
      {
        docType: 'class',
        name: 'privateClass',
        id: 'privateClass',
        constructorDoc: { }
      }
    ];
    convertPrivateClassesToInterfaces(docs, false);
    expect(docs[0].docType).toEqual('class');
  });


  it('should convert the heritage since interfaces use `extends` not `implements`', function() {
    var docs = [
      {
        docType: 'class',
        name: 'privateClass',
        id: 'privateClass',
        constructorDoc: { private: true },
        heritage: 'implements parentInterface'
      }
    ];
    convertPrivateClassesToInterfaces(docs, false);
    expect(docs[0].heritage).toEqual('extends parentInterface');
  });


  it('should add new injectable reference types, if specified, to the passed in collection', function() {
    var docs = [
      {
        docType: 'class',
        name: 'privateClass',
        id: 'privateClass',
        constructorDoc: { private: true },
        heritage: 'implements parentInterface'
      }
    ];
    convertPrivateClassesToInterfaces(docs, true);
    expect(docs[1]).toEqual({
      docType : 'var',
      name : 'privateClass',
      id : 'privateClass',
      returnType : 'InjectableReference'
    });
  });

});
