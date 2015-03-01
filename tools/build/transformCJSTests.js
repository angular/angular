var through2 = require('through2');

module.exports = function() {
  return through2.obj(function(file, encoding, done) {
    if (file.relative.substring(file.relative.length - 8) == "_spec.js") {
      var content = 
      "var parse5Adapter = require('angular2/src/dom/parse5_adapter');\r\n"
      + "parse5Adapter.Parse5DomAdapter.makeCurrent();\r\n"
      + String(file.contents)
      + "\r\n main();";
      file.contents = new Buffer(content);
    }
    this.push(file);
    done();
  });
}
