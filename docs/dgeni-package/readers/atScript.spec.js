var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');

describe('atScript file reader', function() {

  var dgeni, injector, reader;

  var fileContent =
    'import {CONST} from "facade/lang";\n' +
    '\n' +
    '/**\n' +
     '* A parameter annotation that creates a synchronous eager dependency.\n' +
     '*\n' +
     '*    class AComponent {\n' +
     '*      constructor(@Inject("aServiceToken") aService) {}\n' +
     '*    }\n' +
     '*\n' +
     '*/\n' +
    'export class Inject {\n' +
      'token;\n' +
      '@CONST()\n' +
      'constructor(token) {\n' +
        'this.token = token;\n' +
      '}\n' +
    '}';


  beforeEach(function() {
    dgeni = new Dgeni([mockPackage()]);
    injector = dgeni.configureInjector();
    reader = injector.get('atScriptFileReader');
  });


  it('should provide a default pattern', function() {
    expect(reader.defaultPattern).toEqual(/\.js|\.es6|\.ts$/);
  });


  it('should parse the file using the atParser and return a single doc', function() {

    var atParser = injector.get('atParser');
    spyOn(atParser, 'parseModule').and.callThrough();

    var docs = reader.getDocs({
      content: fileContent,
      relativePath: 'di/src/annotations.js'
    });

    expect(atParser.parseModule).toHaveBeenCalled();
    expect(docs.length).toEqual(1);
    expect(docs[0].docType).toEqual('module');
  });

});
