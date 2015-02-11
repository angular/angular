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

describe('transpile to dart', function(){

  var options;
  beforeEach(function() {
    options = merge(DEFAULT_OPTIONS, {outputLanguage: 'dart'});
  });

  // https://github.com/angular/angular/issues/509
  describe('string interpolation', function() {
    it('should not interpolate inside old quotes', function(){
      var result = compiler.compile(options, "test.js",
        "var a:number = 1;" +
        "var s1:string = \"${a}\";" +
        "var s2:string = '\\${a}';" +
        "var s3:string = '$a';");
      expect(result.js).toBe("library test_dart;\n" +
      "num a = 1;\n" +
      "String s1 = \"\\${a}\";\n" +
      "String s2 = '\\${a}';\n" +
      "String s3 = '\\$a';\n");
    });

    it('should not interpolate without curly braces', function() {
      var result = compiler.compile(options, "test.js",
        "var a:number = 1;" +
        "var s1:string = `$a`;" +
        "var s2:string = `\\$a`;");
      expect(result.js).toBe("library test_dart;\n" +
      "num a = 1;\n" +
      "String s1 = '''\\$a''';\n" +
      "String s2 = '''\\$a''';\n");
    });

    it('should interpolate inside template quotes', function() {
      var result = compiler.compile(options, "test.js",
        "var a:number = 1;" +
        "var s1:string = `${a}`;");
      expect(result.js).toBe("library test_dart;\n" +
      "num a = 1;\n" +
      "String s1 = '''${a}''';\n");
    });
  });

  describe('generic', function() {

    it('should support types without generics', function() {
      var result = compiler.compile(options, "test.js",
        "var a:List = [];");
      expect(result.js).toBe("library test_dart;\nList a = [];\n");
    });

    it('should support one level generics', function() {
      var result = compiler.compile(options, "test.js",
        "var a:List<string> = [];");
      expect(result.js).toBe("library test_dart;\nList<String> a = [];\n");
    });

    it('should support multiple one level generics', function() {
      var result = compiler.compile(options, "test.js",
        "var a:List<A,B> = [];");
      expect(result.js).toBe("library test_dart;\nList<A, B> a = [];\n");
    });

    it('should support nested generics', function() {
      var result = compiler.compile(options, "test.js",
        "var a:List<A<B>> = [];");
      expect(result.js).toBe("library test_dart;\nList<A<B>> a = [];\n");
    });
  });
});

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
      "class Test {" +
      "  constructor() { super(); }" +
      "}");
    expect(result.js).toBe("class Test {\n" +
      "  constructor() {\n"+
      "    super();\n"+
      "  }\n"+
      "}\n\n"+
      "//# sourceMappingURL=test.map\n");
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
    var tempFile = temp.openSync('ng2transpiler');
    fs.writeSync(tempFile.fd, transpiledCode);
    return tempFile.path;
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
