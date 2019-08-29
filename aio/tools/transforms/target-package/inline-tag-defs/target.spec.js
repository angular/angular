var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('target inline-tag-def', function() {
  var dgeni, injector, targetInlineTagDef;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('target-package', true)]);
    injector = dgeni.configureInjector();
    targetInlineTagDef = injector.get('targetInlineTagDef');
  });


  it('should filter out content that does not match the targetEnvironments', function() {

    var doc = {};

    var targetEnvironments = injector.get('targetEnvironments');
    targetEnvironments.addAllowed('js', true);
    targetEnvironments.addAllowed('es6', true);
    targetEnvironments.addAllowed('ts', false);

    var result = targetInlineTagDef.handler(doc, 'target', {tag: 'es6 ts', content: 'abc'});
    expect(result).toEqual('abc');

    result = targetInlineTagDef.handler(doc, 'target', {tag: 'ts', content: 'xyz'});
    expect(result).toEqual('');
  });


  it('should not filter anything if there are no doc nor global target environments', function() {
    var doc = {};

    var result = targetInlineTagDef.handler(doc, 'target', {tag: 'es6 ts', content: 'abc'});
    expect(result).toEqual('abc');

    result = targetInlineTagDef.handler(doc, 'target', {tag: 'ts', content: 'xyz'});
    expect(result).toEqual('xyz');
  });
});