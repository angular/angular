var mockPackage = require('../../mocks/mockPackage');
var Dgeni = require('dgeni');
var path = require('canonical-path');

describe('tsParser', function() {
  var dgeni, injector, parser;

  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    parser = injector.get('tsParser');
  });

  it("should parse a TS file", function() {
    var parseInfo = parser.parse(['testSrc.ts'], path.resolve(__dirname, '../../mocks/tsParser'));
    var tsModules = parseInfo.moduleSymbols;
    expect(tsModules.length).toEqual(1);
    expect(tsModules[0].exportArray.length).toEqual(3);
    expect(tsModules[0].exportArray.map(function(i) { return i.name; })).toEqual(['MyClass', 'myFn', 'x']);
  });
});