var ts = require('typescript');

// These are the extension that we should consider when trying to load a module
var extensions = ['.ts', '.js', '.es6']

// We need to provide our own version of CompilerHost because, at the moment, there is
// a mix of `.ts`, `.es6` and `.js` (atScript) files in the project and the TypeScript
// compiler only looks for `.ts` files when trying to load imports.
module.exports = function createCompilerHost(log) {
  return function createCompilerHost(options) {

    var host = ts.createCompilerHost(options);

    // Override the `getSourceFile` implementation to also look for js and es6 files
    var getSourceFile = host.getSourceFile;
    host.getSourceFile = function(filename, languageVersion, onError) {
      // Iterate through each possible extension and return the first source file that is actually found
      for(var i=0; i<extensions.length; i++) {
        var extension = extensions[i];
        var altFileName = filename.replace(/\.ts$/, extension);
        log.silly('getSourceFile:', altFileName);
        var sourceFile = getSourceFile.call(host, altFileName, languageVersion, onError);
        if(sourceFile) {
          log.debug('found source file:', altFileName);
          return sourceFile;
        }
      }
    };

    return host;
  };
};