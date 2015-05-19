var ts = require('typescript');
var fs = require('fs');
var path = require('canonical-path');

// We need to provide our own version of CompilerHost because we want to set the
// base directory and specify what extensions to consider when trying to load a source
// file
module.exports = function createCompilerHost(log) {

  return function createCompilerHost(options, baseDir, extensions) {

    return {
      getSourceFile: function(fileName, languageVersion, onError) {
        var text, resolvedPath, resolvedPathWithExt;

        // Strip off the extension and resolve relative to the baseDir
        baseFilePath = fileName.replace(/\.[^.]+$/, '');
        resolvedPath = path.resolve(baseDir, baseFilePath);

        // Iterate through each possible extension and return the first source file that is actually found
        for(var i=0; i<extensions.length; i++) {

          // Try reading the content from files using each of the given extensions
          try {
            resolvedPathWithExt = resolvedPath + extensions[i];
            log.silly('getSourceFile:', resolvedPathWithExt);
            text = fs.readFileSync(resolvedPathWithExt, { encoding: options.charset });
            log.debug('found source file:', fileName, resolvedPathWithExt);
            return ts.createSourceFile(baseFilePath + extensions[i], text, languageVersion);
          }
          catch(e) {
            // Try again if the file simply did not exist, otherwise report the error as a warning
            if(e.code !== 'ENOENT') {
              if (onError) onError(e.message);
              log.warn('Error reading ' + resolvedPathWithExt + ' : ' + e.message);
            }
          }
        }
      },
      getDefaultLibFileName: function(options) {
        return path.resolve(path.dirname(ts.sys.getExecutingFilePath()), ts.getDefaultLibFileName(options));
      },
      writeFile: function(fileName, data, writeByteOrderMark, onError) {
        // no-op
      },
      getCurrentDirectory: function() {
        return baseDir;
      },
      useCaseSensitiveFileNames: function() {
        return ts.sys.useCaseSensitiveFileNames;
      },
      getCanonicalFileName: function(fileName) {
        // if underlying system can distinguish between two files whose names differs only in cases then file name already in canonical form.
        // otherwise use toLowerCase as a canonical form.
        return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
      },
      getNewLine: function() {
        return ts.sys.newLine;
      }
    };
  };
};