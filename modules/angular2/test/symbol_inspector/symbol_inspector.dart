library angular.symbol_inspector.symbol_inspector;

import 'dart:mirrors';
import './simple_library.dart' as simple_library;
import 'package:angular2/common.dart';
import 'package:angular2/compiler.dart';
import 'package:angular2/core.dart';
import 'package:angular2/instrumentation.dart';
import 'package:angular2/platform/browser.dart';

const IGNORE = const {
  'runtimeType': true,
  'toString': true,
  'noSuchMethod': true,
  'hashCode': true,
  'originalException': true,
  'originalStack': true
};

const LIB_MAP = const {
  'simple_library': 'angular2.test.symbol_inspector.simple_library',
  'ngCommon': 'angular2.common',
  'ngCompiler': 'angular2.compiler',
  'ngCore': 'angular2.core',
  'ngInstrumentation': 'angular2.instrumentation',
  'ngPlatformBrowser': 'angular2.platform.browser',
  'ngPlatformCommon': 'angular2.platform.common'
};

// Have this list here to trick dart to force import.
var libs = [simple_library.A, Component, Form, COMPILER_PROVIDERS, NgIf, wtfCreateScope, Title];

List<String> getSymbolsFromLibrary(String name) {
  var libraryName = LIB_MAP[name];
  if (libs.isEmpty) throw "No libriries loaded.";
  if (libraryName == null) throw "Don't know how to load '$name' library.";
  var lib = currentMirrorSystem().findLibrary(new Symbol(libraryName));
  var names = [];
  extractSymbols(lib).addTo(names);
  names.sort();
  // remove duplicates;
  var lastValue;
  names = names.where((v) {
    var duplicate = v == lastValue;
    lastValue = v;
    return !duplicate;
  }).toList();
  return names;
}

class ExportedSymbol {
  Symbol symbol;
  DeclarationMirror declaration;
  LibraryMirror library;

  ExportedSymbol(this.symbol, this.declaration, this.library);

  addTo(List<String> names) {
    var name = unwrapSymbol(symbol);
    if (declaration is MethodMirror) {
      names.add(name);
    } else if (declaration is ClassMirror) {
      var classMirror = declaration as ClassMirror;
      if (classMirror.isAbstract) name = '$name';
      names.add(name);
    } else if (declaration is TypedefMirror) {
      names.add(name);
    } else if (declaration is VariableMirror) {
      names.add(name);
    } else {
      throw 'UNEXPECTED: $declaration';
    }
  }

  toString() => unwrapSymbol(symbol);
}

class LibraryInfo {
  List<ExportedSymbol> names;
  Map<Symbol, List<Symbol>> symbolsUsedForName;

  LibraryInfo(this.names, this.symbolsUsedForName);

  addTo(List<String> names) {
    this.names.forEach((ExportedSymbol es) => es.addTo(names));
    //this.names.addAll(symbolsUsedForName.keys.map(unwrapSymbol));
  }
}

Iterable<Symbol> _getUsedSymbols(
    DeclarationMirror decl, seenDecls, path, onlyType) {
  if (seenDecls.containsKey(decl.qualifiedName)) return [];
  seenDecls[decl.qualifiedName] = true;

  if (decl.isPrivate) return [];

  path = "$path -> $decl";

  var used = [];

  if (decl is TypedefMirror) {
    TypedefMirror tddecl = decl;
    used.addAll(_getUsedSymbols(tddecl.referent, seenDecls, path, onlyType));
  }
  if (decl is FunctionTypeMirror) {
    FunctionTypeMirror ftdecl = decl;

    ftdecl.parameters.forEach((ParameterMirror p) {
      used.addAll(_getUsedSymbols(p.type, seenDecls, path, onlyType));
    });
    used.addAll(_getUsedSymbols(ftdecl.returnType, seenDecls, path, onlyType));
  } else if (decl is TypeMirror) {
    var tdecl = decl;
    used.add(tdecl.qualifiedName);
  }

  if (!onlyType) {
    if (decl is ClassMirror) {
      ClassMirror cdecl = decl;
      cdecl.declarations.forEach((s, d) {
        try {
          used.addAll(_getUsedSymbols(d, seenDecls, path, false));
        } catch (e, s) {
          print("Got error [$e] when visiting $d\n$s");
        }
      });
    }
  }

  // Strip out type variables.
  if (decl is TypeMirror) {
    TypeMirror tdecl = decl;
    var typeVariables = tdecl.typeVariables.map((tv) => tv.qualifiedName);
    used = used.where((x) => !typeVariables.contains(x));
  }

  return used;
}

LibraryInfo extractSymbols(LibraryMirror lib, [String printPrefix = ""]) {
  List<ExportedSymbol> exportedSymbols = [];
  Map<Symbol, List<Symbol>> used = {};

  printPrefix += "  ";
  lib.declarations.forEach((Symbol symbol, DeclarationMirror decl) {
    if (decl.isPrivate) return;

    // Work-around for dartbug.com/18271
    if (decl is TypedefMirror && unwrapSymbol(symbol).startsWith('_')) return;

    exportedSymbols.add(new ExportedSymbol(symbol, decl, lib));
    used[decl.qualifiedName] = _getUsedSymbols(decl, {}, "", false);
  });

  lib.libraryDependencies.forEach((LibraryDependencyMirror libDep) {
    LibraryMirror target = libDep.targetLibrary;
    if (!libDep.isExport) return;

    var childInfo = extractSymbols(target, printPrefix);
    var childNames = childInfo.names;

    // If there was a "show" or "hide" on the exported library, filter the results.
    // This API needs love :-(
    var showSymbols = [], hideSymbols = [];
    libDep.combinators.forEach((CombinatorMirror c) {
      if (c.isShow) {
        showSymbols.addAll(c.identifiers);
      }
      if (c.isHide) {
        hideSymbols.addAll(c.identifiers);
      }
    });

    // I don't think you can show and hide from the same library
    assert(showSymbols.isEmpty || hideSymbols.isEmpty);
    if (!showSymbols.isEmpty) {
      childNames = childNames.where((symAndLib) {
        return showSymbols.contains(symAndLib.symbol);
      });
    }
    if (!hideSymbols.isEmpty) {
      childNames = childNames.where((symAndLib) {
        return !hideSymbols.contains(symAndLib.symbol);
      });
    }

    exportedSymbols.addAll(childNames);
    used.addAll(childInfo.symbolsUsedForName);
  });
  return new LibraryInfo(exportedSymbols, used);
}

var _SYMBOL_NAME = new RegExp('"(.*)"');
unwrapSymbol(sym) => _SYMBOL_NAME.firstMatch(sym.toString()).group(1);
