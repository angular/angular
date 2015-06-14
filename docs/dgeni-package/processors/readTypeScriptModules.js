var glob = require('glob');
var path = require('canonical-path');
var _ = require('lodash');
var ts = require('typescript');

module.exports = function readTypeScriptModules(tsParser, readFilesProcessor, modules, getFileInfo,
                                                getExportDocType, getContent, log) {

  return {
    $runAfter: ['files-read'],
    $runBefore: ['parsing-tags'],

    $validate: {
      sourceFiles: {presence: true},
      basePath: {presence: true},
      hidePrivateMembers: {inclusion: [true, false]},
      sortClassMembers: {inclusion: [true, false]},
      ignoreExportsMatching: {}
    },

    // A collection of globs that identify those modules for which we should create docs
    sourceFiles: [],
    // The base path from which to load the source files
    basePath: '.',
    // We can ignore members of classes that are private
    hidePrivateMembers: true,
    // We can sort class members alphabetically
    sortClassMembers: true,
    // We can provide a collection of strings or regexes to ignore exports whose export names match
    ignoreExportsMatching: ['___esModule'],

    $process: function(docs) {

      // Convert ignoreExportsMatching to an array of regexes
      var ignoreExportsMatching = convertToRegexCollection(this.ignoreExportsMatching);

      var hidePrivateMembers = this.hidePrivateMembers;
      var sortClassMembers = this.sortClassMembers;

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
          if (anyMatches(ignoreExportsMatching, exportSymbol.name)) return;

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
                exportDoc.members.push(memberDoc);
              }
            }

            if (sortClassMembers) {
              exportDoc.members.sort(function(a, b) {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;
                return 0;
              });
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
    var typeParamString = '';
    var heritageString = '';

    exportSymbol.declarations.forEach(function(decl) {
      var sourceFile = ts.getSourceFileOfNode(decl);

      if (decl.typeParameters) {
        typeParamString = '<' + getText(sourceFile, decl.typeParameters) + '>';
      }

      if (decl.heritageClauses) {
        decl.heritageClauses.forEach(function(heritage) {

          if (heritage.token == ts.SyntaxKind.ExtendsKeyword) {
            heritageString += " extends ";
            heritage.types.forEach(function(typ, idx) {
              heritageString += (idx > 0 ? ', ' : '') + typ.getFullText();
            });
          }

          if (heritage.token == ts.SyntaxKind.ImplementsKeyword) {
            heritageString += " implements ";
            heritage.types.forEach(function(typ, idx) {
              heritageString += (idx > 0 ? ', ' : '') + typ.getFullText();
            });
          }
        });
      }
    });

    //Make sure duplicate aliases aren't created, so "Ambiguous link" warnings are prevented
    var aliasNames = [name, moduleDoc.id + '/' + name];
    if (typeParamString) {
      aliasNames.push(name + typeParamString);
      aliasNames.push(moduleDoc.id + '/' + name + typeParamString);
    }

    var exportDoc = {
      docType: getExportDocType(exportSymbol),
      name: name,
      id: moduleDoc.id + '/' + name,
      typeParams: typeParamString,
      heritage: heritageString,
      aliases: aliasNames,
      moduleDoc: moduleDoc,
      content: getContent(exportSymbol),
      fileInfo: getFileInfo(exportSymbol, basePath),
      location: getLocation(exportSymbol)
    };
    if(exportSymbol.flags & ts.SymbolFlags.Function) {
      exportDoc.parameters = getParameters(typeChecker, exportSymbol);
    }
    if(exportSymbol.flags & ts.SymbolFlags.Value) {
      exportDoc.returnType = getReturnType(typeChecker, exportSymbol);
    }
    return exportDoc;
  }

  function createMemberDoc(memberSymbol, classDoc, basePath, typeChecker) {
    var memberDoc = {
      docType: 'member',
      classDoc: classDoc,
      name: memberSymbol.name,
      content: getContent(memberSymbol),
      fileInfo: getFileInfo(memberSymbol, basePath),
      location: getLocation(memberSymbol)
    };

    if (memberSymbol.flags & ts.SymbolFlags.Method) {
      // NOTE: we use the property name `parameters` here so we don't conflict
      // with the `params` property that will be updated by dgeni reading the
      // `@param` tags from the docs
      memberDoc.parameters = getParameters(typeChecker, memberSymbol);
    }

    if (memberSymbol.flags & ts.SymbolFlags.Constructor) {
      memberDoc.parameters = getParameters(typeChecker, memberSymbol);
      memberDoc.name = 'constructor';
    }

    if(memberSymbol.flags & ts.SymbolFlags.Value) {
      memberDoc.returnType = getReturnType(typeChecker, memberSymbol);
    }

    return memberDoc;
  }

  function getParameters(typeChecker, symbol) {
    var declaration = symbol.valueDeclaration || symbol.declarations[0];
    var sourceFile = ts.getSourceFileOfNode(declaration);
    if (!declaration.parameters) {
      var location = getLocation(symbol);
      throw new Error('missing declaration parameters for "' + symbol.name +
        '" in ' + sourceFile.fileName +
        ' at line ' + location.start.line);
    }
    return declaration.parameters.map(function(parameter) {
      var paramText = getText(sourceFile, parameter.name);
      if (parameter.questionToken || parameter.initializer) {
        paramText += '?';
      }
      if (parameter.type) {
        paramText += ':' + getType(sourceFile, parameter.type);
      }
      return paramText.trim();
    });
  }

  function getReturnType(typeChecker, symbol) {
    var declaration = symbol.valueDeclaration || symbol.declarations[0];
    var sourceFile = ts.getSourceFileOfNode(declaration);
    if (declaration.type) {
      return getType(sourceFile, declaration.type).trim();
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


  // Strip any local renamed imports from the front of types
  function getType(sourceFile, type) {
    var text = getText(sourceFile, type);
    while (text.indexOf(".") >= 0) {
      // Keep namespaced symbols in Rx
      if (text.match(/^\s*Rx\./)) break;
      // handle the case List<thing.stuff> -> List<stuff>
      text = text.replace(/([^.<]*)\.([^>]*)/, "$2");
    }
    return text;
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

function convertToRegexCollection(items) {
  if (!items) return [];

  // Must be an array
  if (!_.isArray(items)) {
    items = [items];
  }

  // Convert string to exact matching regexes
  return items.map(function(item) {
    return _.isString(item) ? new RegExp('^' + item + '$') : item;
  });
}

function anyMatches(regexes, item) {
  for(var i=0; i<regexes.length; ++i) {
    if ( item.match(regexes[i]) ) return true;
  }
  return false;
}