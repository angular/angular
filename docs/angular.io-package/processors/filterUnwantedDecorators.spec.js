var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');

describe('filterUnwantedDecorators', function() {
  var dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    processor = injector.get('filterUnwantedDecorators');
  });


  it('should remove decorators specified by name', function() {
    var docs = [
      { id: 'doc1', decorators: [ { name: 'A' }, { name: 'B' } ] },
      { id: 'doc2', decorators: [ { name: 'B' }, { name: 'C' } ] },
      { id: 'doc3', decorators: [ { name: 'A' }, { name: 'C' } ] }
    ];
    processor.decoratorsToIgnore = ['D', 'B'];
    docs = processor.$process(docs);

    expect(docs).toEqual([
      { id: 'doc1', decorators: [ { name: 'A' } ] },
      { id: 'doc2', decorators: [ { name: 'C' } ] },
      { id: 'doc3', decorators: [ { name: 'A' }, { name: 'C' } ] }
    ]);
  });


  it('should ignore docs that have no decorators', function() {
    var docs = [
      { id: 'doc1', decorators: [ { name: 'A' }, { name: 'B' } ] },
      { id: 'doc2' },
      { id: 'doc3', decorators: [ { name: 'A' }, { name: 'C' } ] }
    ];
    processor.decoratorsToIgnore = ['D', 'B'];
    docs = processor.$process(docs);

    expect(docs).toEqual([
      { id: 'doc1', decorators: [ { name: 'A' } ] },
      { id: 'doc2' },
      { id: 'doc3', decorators: [ { name: 'A' }, { name: 'C' } ] }
    ]);
  });
});
