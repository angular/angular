var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');
var path = require('canonical-path');

describe('readTypeScriptModules', function() {
  var dgeni, injector, processor;

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    processor = injector.get('readTypeScriptModules');
    processor.basePath = path.resolve(__dirname, '../mocks/');
  });


  describe('ignoreExportsMatching', function() {
    it('should ignore exports that match items in the `ignoreExportsMatching` property', function() {
      processor.sourceFiles = [ 'readTypeScriptModules/ignoreExportsMatching.ts'];
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
      processor.sourceFiles = [ 'readTypeScriptModules/ignoreExportsMatching.ts'];
      var docs = [];
      processor.$process(docs);

      var moduleDoc = docs[0];
      expect(moduleDoc.docType).toEqual('module');
      expect(moduleDoc.exports).toEqual([
        jasmine.objectContaining({ name: 'OKToExport' }),
        jasmine.objectContaining({ name: '_thisIsPrivate' }),
        jasmine.objectContaining({ name: 'thisIsOK' })
      ]);
    });
  });
});