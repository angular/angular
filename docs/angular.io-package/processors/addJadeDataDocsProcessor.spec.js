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

  it('should sort the exports into alphabetical order', function() {
    var docs = [
      {
        docType: 'module',
        id: 'someModule',
        exports: [
          { name: 'Beta', docType: 'class'},
          { name: 'Alpha', docType: 'class'},
          { name: 'Gamma', docType: 'class'},
          { name: 'Nu', docType: 'class'},
          { name: 'Mu', docType: 'class'}
        ],
        fileInfo: { baseName: 'x_y' },
        description: 'some description\nsecond line'
      }
    ];
    docs = processor.$process(docs);

    expect(docs[1].data).toEqual([
      { name : 'index', title : 'X Y', intro : 'some description second line' },
      { name: 'Alpha-class', title: 'Alpha', varType : undefined },
      { name: 'Beta-class', title: 'Beta', varType : undefined },
      { name: 'Gamma-class', title: 'Gamma', varType : undefined },
      { name: 'Mu-class', title: 'Mu', varType : undefined },
      { name: 'Nu-class', title: 'Nu', varType : undefined }
    ]);

  });
});
