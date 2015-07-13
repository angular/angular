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


  describe('interfaces', function() {

    it('should mark optional properties', function() {
      processor.sourceFiles = [ 'interfaces.ts'];
      var docs = [];
      processor.$process(docs);

      var moduleDoc = docs[0];
      var exportedInterface = moduleDoc.exports[0];
      var member = exportedInterface.members[0];
      expect(member.name).toEqual('optionalProperty');
      expect(member.optional).toEqual(true);
    });


    it('should handle "call" type interfaces', function() {
      processor.sourceFiles = [ 'interfaces.ts'];
      var docs = [];
      processor.$process(docs);

      var moduleDoc = docs[0];
      var exportedInterface = moduleDoc.exports[0];

      expect(exportedInterface.callMember).toBeDefined();
      expect(exportedInterface.callMember.parameters).toEqual(['param: T']);
      expect(exportedInterface.callMember.returnType).toEqual('U');
      expect(exportedInterface.callMember.typeParameters).toEqual(['T', 'U extends Findable<T>']);
      expect(exportedInterface.newMember).toBeDefined();
      expect(exportedInterface.newMember.parameters).toEqual(['param: number']);
      expect(exportedInterface.newMember.returnType).toEqual('MyInterface');
    });
  });


  describe('ordering of members', function() {
    it('should order class members in order of appearance (by default)', function() {
      processor.sourceFiles = ['orderingOfMembers.ts'];
      var docs = [];
      processor.$process(docs);
      var classDoc = _.find(docs, { docType: 'class' });
      expect(classDoc.docType).toEqual('class');
      expect(getNames(classDoc.members)).toEqual([
        'firstItem',
        'otherMethod',
        'doStuff',
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