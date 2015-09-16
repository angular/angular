var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');

describe('addJadeDataDocsProcessor', function() {
  var dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    processor = injector.get('addJadeDataDocsProcessor');
  });

  it('should add a doc for each module', function() {
    var docs = [
      {
        docType: 'module',
        id: 'someModule',
        exports: [{ name: 'MyClass', docType: 'class'}],
        fileInfo: { baseName: 'x_y' },
        description: 'some description\nsecond line'
      }
    ];
    docs = processor.$process(docs);

    expect(docs[1]).toEqual({
      id : 'someModule-data',
      aliases : [ 'someModule-data' ],
      docType : 'jade-data',
      originalDoc : docs[0],
      data : [
        { name : 'index', title : 'X Y', intro : 'some description second line' },
        { name : 'MyClass-class', title : 'MyClass', varType : undefined }
      ] });
  });
});
