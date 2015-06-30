var compiler = require('../index');
var temp = require('temp');
var fs = require('fs');

temp.track();

var DEFAULT_OPTIONS = {
  sourceMaps: false,
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  memberVariables: true // parse class fields
};

describe('transpile to es6', function() {
  var options;

  beforeEach(function() {
    options = merge(DEFAULT_OPTIONS, {outputLanguage: 'es6', typeAssertions: 'true'});
  });

  it('should preserve generic type information', function() {
    var result = compiler.compile(options, "test.js",
      "function f(a:List<string>){}");
    expect(result.js).toBe('function f(a) {\n'+
      '  assert.argumentTypes(a, assert.genericType(List, assert.type.string));\n'+
      '}\n'+
      'Object.defineProperty(f, "parameters", {get: function() {\n'+
      '    return [[assert.genericType(List, assert.type.string)]];\n'+
      '  }});\n');
  });


  it('should allow super() calls when transpiling to ES6 with source maps', function() {
    options = merge(options, {sourceMaps: true});
    var result = compiler.compile(options, "test.js",
      "class Base {}\n" +
      "class Test extends Base {" +
      "  constructor() { super(); }" +
      "}");
    expect(result.js).toBe("class Base {}\n" +
      "class Test extends Base {\n" +
      "  constructor() {\n"+
      "    super();\n"+
      "  }\n"+
      "}\n"+
      "//# sourceMappingURL=test.js.map\n");
  });

  it('should convert types to expressions', function() {
    var result = compiler.compile(options, "test.js",
      "function f(a:string) {}");
    expect(result.js).toBe('function f(a) {\n'+
      '  assert.argumentTypes(a, assert.type.string);\n'+
      '}\n' +
      'Object.defineProperty(f, "parameters", {get: function() {\n' +
      '    return [[assert.type.string]];\n' +
      '  }});\n');
  });

  it('should not convert type properties to getter/setters', function() {
    var result = compiler.compile(options, "test.js",
      "class Test {" +
      "  constructor() { this.a = 1; }" +
      "}");
    expect(result.js).toBe("class Test {\n" +
      "  constructor() {\n"+
      "    this.a = 1;\n"+
      "  }\n"+
      "}\n");
  });

  it('should remove class field declarations', function() {
    var result = compiler.compile(options, "test.js",
      "class Test {" +
      "  a:number = 1;" +
      "}");
    expect(result.js).toBe("class Test {}\n");
  });

  it('should convert types to expressions on "assert" module', function() {
    var result = compiler.compile(options, "test.js",
      "function f(a:string, b) { return a+b; }");
    expect(result.js).toBe('function f(a, b) {\n'+
      '  assert.argumentTypes(a, assert.type.string, b, assert.type.any);\n'+
      '  return a + b;\n'+
      '}\n'+
      'Object.defineProperty(f, "parameters", {get: function() {\n'+
      '    return [[assert.type.string], []];\n'+
      '  }});\n');
  });

});

describe('transpile to cjs', function() {
  var options;

  beforeEach(function() {
    options = merge(DEFAULT_OPTIONS, {modules: 'commonjs'});
  });

  function compileAndWrite(input) {
    var transpiledCode = compiler.compile(options, "test.js", input).js;
    var tempPath = temp.path({prefix: "ng2transpiler", suffix: ''});
    var fd = fs.openSync(tempPath, 'w+');
    fs.writeSync(fd, transpiledCode);
    fs.closeSync(fd);
    return tempPath.replace(/\\/g, '/');
  }

  it('should transpile export *', function() {
    var file1 = compileAndWrite('export var a = 1');
    var file2 = compileAndWrite('export * from "' + file1 + '"');
    expect(require(file2).a).toBe(1);
  });

  it('should transpile export {name}', function() {
    var file1 = compileAndWrite('export var a = 1');
    var file2 = compileAndWrite('export {a} from "' + file1 + '"');
    expect(require(file2).a).toBe(1);
  });

});


function merge(a, b) {
  var result = {};
  for (var prop in a) {
    result[prop] = a[prop];
  }
  for (var prop in b) {
    result[prop] = b[prop];
  }
  return result;
}
