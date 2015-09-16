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
        exports: [
          { name: 'someObj', docType: 'var', symbolTypeName: 'MyClass', originalModule: 'some/private/module' }
        ],
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
        { name : 'index', title : 'X Y', intro : 'some description second line', docType : 'module' },
        { name : 'someObj-var', title : 'someObj', varType : 'MyClass', docType: 'var', originalModule: 'some/private/module' }
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
      { name : 'index', title : 'X Y', intro : 'some description second line', docType : 'module' },
      { name: 'Alpha-class', title: 'Alpha', docType: 'class' },
      { name: 'Beta-class', title: 'Beta', docType: 'class' },
      { name: 'Gamma-class', title: 'Gamma', docType: 'class' },
      { name: 'Mu-class', title: 'Mu', docType: 'class' },
      { name: 'Nu-class', title: 'Nu', docType: 'class' }
    ]);

  });
});
