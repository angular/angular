var ts = require('typescript');

module.exports = function getExportDocType(log) {

  return function(symbol) {
    if(symbol.flags & ts.SymbolFlags.FunctionScopedVariable) {
      return 'var';
    }
    if(symbol.flags & ts.SymbolFlags.BlockScopedVariable) {
      return getBlockScopedVariableDocType(symbol);
    }
    if(symbol.flags & ts.SymbolFlags.Function) {
      return 'function';
    }
    if(symbol.flags & ts.SymbolFlags.Class) {
      return 'class';
    }
    if(symbol.flags & ts.SymbolFlags.Interface) {
      return 'interface';
    }
    if(symbol.flags & ts.SymbolFlags.ConstEnum) {
      return 'enum';
    }
    if(symbol.flags & ts.SymbolFlags.RegularEnum) {
      return 'enum';
    }
    if(symbol.flags & ts.SymbolFlags.Property) {
      return 'module-property';
    }
    if(symbol.flags & ts.SymbolFlags.TypeAlias) {
      return 'type-alias';
    }

    log.warn('getExportDocType(): Unknown symbol type', {
      symbolName: symbol.name,
      symbolType: symbol.flags,
      symbolTarget: symbol.target,
      file: ts.getSourceFileOfNode(symbol.declarations[0]).fileName
    });
    return 'unknown';
  }

  function getBlockScopedVariableDocType(symbol) {

    var node = symbol.valueDeclaration;
    while(node) {
      if ( node.flags & 0x2000 /* const */) {
        // DefinitelyTyped is still TS 1.4 so const is not allowed.
        // https://github.com/borisyankov/DefinitelyTyped/issues/4564
        return 'var'; // change to const when targetting TS 1.5
      }
      node = node.parent;
    }
    return 'let';
  }
};