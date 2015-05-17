var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');
var path = require('canonical-path');
var _ = require('lodash');

describe('readTypeScriptModules', function() {
  var dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    processor = injector.get('readTypeScriptModules');
    processor.basePath = path.resolve(__dirname, '../mocks/readTypeScriptModules');
  });


  describe('ignoreExportsMatching', function() {
    it('should ignore exports that match items in the `ignoreExportsMatching` property', function() {
      processor.sourceFiles = [ 'ignoreExportsMatching.ts'];
      processor.ignoreExportsMatching = [/^_/];
      var docs = [];
      processor.$process(docs);

      var moduleDoc = docs[0];
      expect(moduleDoc.docType).toEqual('module');
      expect(moduleDoc.exports).toEqual([
        jasmine.objectContaining({ name: 'OKToExport' }),
        jasmine.objectContaining({ name: 'thisIsOK' })
      ]);
    });

    it('should only ignore `___esModule` exports by default', function() {
      processor.sourceFiles = [ 'ignoreExportsMatching.ts'];
      var docs = [];
      processor.$process(docs);

      var moduleDoc = docs[0];
      expect(moduleDoc.docType).toEqual('module');
      expect(getNames(moduleDoc.exports)).toEqual([
        'OKToExport',
        '_thisIsPrivate',
        'thisIsOK'
      ]);
    });
  });


  describe('ordering of members', function() {
    it('should order class members alphabetically (by default)', function() {
      processor.sourceFiles = ['orderingOfMembers.ts'];
      var docs = [];
      processor.$process(docs);
      var classDoc = _.find(docs, { docType: 'class' });
      expect(classDoc.docType).toEqual('class');
      expect(getNames(classDoc.members)).toEqual([
        'doStuff',
        'firstItem',
        'otherMethod'
      ]);
    });


    it('should not order class members if not sortClassMembers is false', function() {
      processor.sourceFiles = ['orderingOfMembers.ts'];
      processor.sortClassMembers = false;
      var docs = [];
      processor.$process(docs);
      var classDoc = _.find(docs, { docType: 'class' });
      expect(classDoc.docType).toEqual('class');
      expect(getNames(classDoc.members)).toEqual([
        'firstItem',
        'otherMethod',
        'doStuff'
      ]);
    });
  });
});

function getNames(collection) {
  return collection.map(function(item) { return item.name; });
}