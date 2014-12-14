var mockPackage = require('../mocks/mockPackage');
var Dgeni = require('dgeni');

describe('atParser service', function() {

  var dgeni, injector, parser;

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
    parser = injector.get('atParser');
  });

  it('should extract the comments from the file', function() {
    var result = parser.parseModule({
      content: fileContent,
      relativePath: 'di/src/annotations.js'
    });

    expect(result.comments[0].range.toString()).toEqual(
      '/**\n' +
       '* A parameter annotation that creates a synchronous eager dependency.\n' +
       '*\n' +
       '*    class AComponent {\n' +
       '*      constructor(@Inject("aServiceToken") aService) {}\n' +
       '*    }\n' +
       '*\n' +
       '*/'
    );
  });

  it('should extract a module AST from the file', function() {
    var result = parser.parseModule({
      content: fileContent,
      relativePath: 'di/src/annotations.js'
    });

    expect(result.moduleTree.moduleName).toEqual('di/annotations');
    expect(result.moduleTree.scriptItemList[0].type).toEqual('IMPORT_DECLARATION');

    expect(result.moduleTree.scriptItemList[1].type).toEqual('EXPORT_DECLARATION');
  });

  it('should attach comments to their following AST', function() {
    var result = parser.parseModule({
      content: fileContent,
      relativePath: 'di/src/annotations.js'
    });

    expect(result.moduleTree.scriptItemList[1].commentBefore.range.toString()).toEqual(
      '/**\n' +
       '* A parameter annotation that creates a synchronous eager dependency.\n' +
       '*\n' +
       '*    class AComponent {\n' +
       '*      constructor(@Inject("aServiceToken") aService) {}\n' +
       '*    }\n' +
       '*\n' +
       '*/'
    );
  });
});