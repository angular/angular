var ts = require('typescript');

module.exports = function tsParser(createCompilerHost, log) {

  return {

    options: {
      allowNonTsExtensions: true
    },

    parse: function(fileNames, baseDir) {
      // This is the easiest way I could find to ensure that we loaded
      // modules with paths relative to the baseDir
      process.chdir(baseDir);

      // "Compile" a program from the given module filenames, to get hold of a
      // typeChecker that can be used to interrogate the modules, exports and so on.
      var host = createCompilerHost(this.options);
      var program = ts.createProgram(fileNames, this.options, host);
      var typeChecker = program.getTypeChecker();

      // Create an array of module symbols for each file we were given
      var moduleSymbols = [];
      fileNames.forEach(function(fileName) {
        var sourceFile = program.getSourceFile(fileName);

        if (!sourceFile) {
          throw new Error('Invalid source file: ' + fileName);
        } else if (!sourceFile.symbol) {
          // Some files contain only a comment and no actual module code
          log.warn('No module code found in ' + fileName);
        } else {
          moduleSymbols.push(sourceFile.symbol);
        }
      });


      moduleSymbols.forEach(function(tsModule) {

        // The type checker has a nice helper function that returns an array of Symbols
        // representing the exports for a given module
        tsModule.exportArray = typeChecker.getExportsOfModule(tsModule);

        // Although 'star' imports (e.g. `export * from 'some/module';) get resolved automatically
        // by the compiler/binder, it seems that explicit imports (e.g. `export {SomeClass} from 'some/module'`)
        // do not so we have to do a little work.
        tsModule.exportArray.forEach(function(moduleExport) {
          if (moduleExport.flags & 8388608 /* Alias */) {
            // To maintain the alias information (particularly the alias name)
            // we just attach the original "resolved" symbol to the alias symbol
            moduleExport.resolvedSymbol = typeChecker.getAliasedSymbol(moduleExport);
          }
        });
      });

      moduleSymbols.typeChecker = typeChecker;

      return {
        moduleSymbols: moduleSymbols,
        typeChecker: typeChecker,
        program: program,
        host: host
      };
    }
  };


};
