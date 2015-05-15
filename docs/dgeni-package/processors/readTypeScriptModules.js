var glob = require('glob');
var path = require('canonical-path');
var _ = require('lodash');
var ts = require('typescript');

module.exports = function readTypeScriptModules(tsParser, readFilesProcessor, modules, getFileInfo, getExportDocType, getContent, log) {

  return {
    $runAfter: ['files-read'],
    $runBefore: ['parsing-tags'],

    $validate: {
      sourceFiles: {presence: true},
      basePath: {presence: true},
      hidePrivateMembers: { inclusion: [true, false] },
      hideSpecialExports: { inclusion: [true, false] }
    },

    sourceFiles: [],
    basePath: '.',
    hidePrivateMembers: false,
    hideSpecialExports: true,

    $process: function(docs) {

      var hideSpecialExports = this.hideSpecialExports;
      var hidePrivateMembers = this.hidePrivateMembers;

      var basePath = path.resolve(readFilesProcessor.basePath, this.basePath);
      var filesPaths = expandSourceFiles(this.sourceFiles, basePath);
      var parseInfo = tsParser.parse(filesPaths, this.basePath);
      var moduleSymbols = parseInfo.moduleSymbols;

      // Iterate through each of the modules that were parsed and generate a module doc
      // as well as docs for each module's exports.
      moduleSymbols.forEach(function(moduleSymbol) {

        var moduleDoc = createModuleDoc(moduleSymbol, basePath);

        // Add this module doc to the module lookup collection and the docs collection
        modules[moduleDoc.id] = moduleDoc;
        docs.push(moduleDoc);

        // Iterate through this module's exports and generate a doc for each
        moduleSymbol.exportArray.forEach(function(exportSymbol) {

          // Ignore exports starting with an underscore
          if (hideSpecialExports && exportSymbol.name.charAt(0) === '_') return;

          // If the symbol is an Alias then for most things we want the original resolved symbol
          var resolvedExport = exportSymbol.resolvedSymbol || exportSymbol;
          var exportDoc = createExportDoc(exportSymbol.name, resolvedExport, moduleDoc, basePath, parseInfo.typeChecker);
          log.debug('>>>> EXPORT: ' + exportDoc.name + ' (' + exportDoc.docType + ') from ' + moduleDoc.id);

          // Generate docs for each of the export's members
          if (resolvedExport.flags & ts.SymbolFlags.HasMembers) {

            exportDoc.members = [];
            for(var memberName in resolvedExport.members) {
              log.silly('>>>>>> member: ' + memberName + ' from ' + exportDoc.id + ' in ' + moduleDoc.id);
              var memberSymbol = resolvedExport.members[memberName];
              var memberDoc = createMemberDoc(memberSymbol, exportDoc, basePath, parseInfo.typeChecker);

              // We special case the constructor and sort the other members alphabetically
              if (memberSymbol.flags & ts.SymbolFlags.Constructor) {
                exportDoc.constructorDoc = memberDoc;
                docs.push(memberDoc);
              } else if (!hidePrivateMembers || memberSymbol.name.charAt(0) !== '_') {
                docs.push(memberDoc);
                insertSorted(exportDoc.members, memberDoc, 'name');
              }
            }
          }

          // Add this export doc to its module doc
          moduleDoc.exports.push(exportDoc);
          docs.push(exportDoc);
        });
      });
    }
  };


  function createModuleDoc(moduleSymbol, basePath) {
    var id = moduleSymbol.name.replace(/^"|"$/g, '');
    var moduleDoc = {
      docType: 'module',
      id: id,
      aliases: [id],
      moduleTree: moduleSymbol,
      content: getContent(moduleSymbol),
      exports: [],
      fileInfo: getFileInfo(moduleSymbol, basePath),
      location: getLocation(moduleSymbol)
    };
    return moduleDoc;
  }

  function createExportDoc(name, exportSymbol, moduleDoc, basePath, typeChecker) {
    var exportDoc = {
      docType: getExportDocType(exportSymbol),
      name: name,
      id: name,
      aliases: [name],
      moduleDoc: moduleDoc,
      content: getContent(exportSymbol),
      fileInfo: getFileInfo(exportSymbol, basePath),
      location: getLocation(exportSymbol)
    };
    if(exportSymbol.flags & ts.SymbolFlags.Function) {
      exportDoc.parameters = getParameters(typeChecker, exportSymbol);
      exportDoc.returnType = getReturnType(typeChecker, exportSymbol);
    }
    return exportDoc;
  }

  function createMemberDoc(memberSymbol, classDoc, basePath, typeChecker) {
    var memberDoc = {
      docType: 'member',
      classDoc: classDoc,
      name: memberSymbol.name,
      id: memberSymbol.name,
      content: getContent(memberSymbol),
      fileInfo: getFileInfo(memberSymbol, basePath),
      location: getLocation(memberSymbol)
    };

    if (memberSymbol.flags & ts.SymbolFlags.Method) {
      // NOTE: we use the property name `parameters` here so we don't conflict
      // with the `params` property that will be updated by dgeni reading the
      // `@param` tags from the docs
      memberDoc.parameters = getParameters(typeChecker, memberSymbol);
      memberDoc.returnType = getReturnType(typeChecker, memberSymbol);
    }

    if (memberSymbol.flags & ts.SymbolFlags.Constructor) {
      memberDoc.parameters = getParameters(typeChecker, memberSymbol);
      memberDoc.name = 'constructor';
    }

    return memberDoc;
  }


  function getParameters(typeChecker, symbol) {
    var declaration = symbol.valueDeclaration || symbol.declarations[0];
    var sourceFile = ts.getSourceFileOfNode(declaration);
    if(!declaration.parameters) {
      console.log(declaration);
      throw 'missing declaration parameters';
    }
    var signature = typeChecker.getSignatureFromDeclaration(declaration);
    return declaration.parameters.map(function(parameter) {
      return getText(sourceFile, parameter).trim();
    });
  }

  function getReturnType(typeChecker, symbol) {
    var declaration = symbol.valueDeclaration || symbol.declarations[0];
    var sourceFile = ts.getSourceFileOfNode(declaration);
    if(declaration.type) {
      var signature = typeChecker.getSignatureFromDeclaration(declaration);
      return getText(sourceFile, declaration.type).trim();
    }
  }


  function expandSourceFiles(sourceFiles, basePath) {
    var filePaths = [];
    sourceFiles.forEach(function(sourcePattern) {
      filePaths = filePaths.concat(glob.sync(sourcePattern, { cwd: basePath }));
    });
    return filePaths;
  }


  function getText(sourceFile, node) {
    return sourceFile.text.substring(node.pos, node.end);
  }


  function getLocation(symbol) {
    var node = symbol.valueDeclaration || symbol.declarations[0];
    var sourceFile = ts.getSourceFileOfNode(node);
    var location = {
      start: ts.getLineAndCharacterOfPosition(sourceFile, node.pos),
      end: ts.getLineAndCharacterOfPosition(sourceFile, node.end)
    };
    return location;
  }

};

function insertSorted(collection, item, property) {
  var index = collection.length;
  while(index>0) {
    if(collection[index-1][property] < item[property]) break;
    index -= 1;
  }
  collection.splice(index, 0, item);
}
