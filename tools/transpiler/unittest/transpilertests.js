var compiler = require('../index');

// fixme: copied from top of gulpfile
var OPTIONS = {
  sourceMaps: true,
  annotations: true, // parse annotations
  types: true, // parse types
  script: false, // parse as a module
  memberVariables: true, // parse class fields
  outputLanguage: 'dart'
};

describe('transpile to dart', function(){

  // https://github.com/angular/angular/issues/509
  it('should not interpolate inside old quotes', function(){
    var result = compiler.compile(OPTIONS, "test.js",
      "var a = 1;" +
      "var s1 = '${a}';" +
      "var s2 = `${a}`;");
    expect(result.js).toBe("library test;\n" +
      "var a = 1;\n" +
        // FIXME: this should escape the interpolation with backslash to fix the issue
      "var s1 = '${a}';\n" +
      "var s2 = '''${a}''';\n");
  })
});
