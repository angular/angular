var simple_library = require('./simple_library');
var ng = require('angular2/angular2');
var LIB_MAP = {
    'simple_library': simple_library,
    'ng': ng
};
var IGNORE = {
    captureStackTrace: true,
    stackTraceLimit: true,
    toString: true,
    originalException: true,
    originalStack: true,
    wrapperMessage: true,
    wrapperStack: true, '@@observable': true
};
function collectClassSymbols(symbols, prefix, type) {
    // static
    for (var name in type) {
        if (IGNORE[name] || name.charAt(0) == '_')
            continue;
        var suf = type[name] instanceof Function ? '()' : '';
        var symbol = prefix + "#" + name + suf;
        symbols.push(symbol);
    }
    // instance
    for (var name in type.prototype) {
        if (IGNORE[name] || name.charAt(0) == '_')
            continue;
        if (name == 'constructor')
            continue;
        var suf = '';
        try {
            if (type.prototype[name] instanceof Function)
                suf = '()';
        }
        catch (e) {
        }
        var symbol = prefix + "." + name + suf;
        symbols.push(symbol);
    }
}
function collectTopLevelSymbols(prefix, lib) {
    var symbols = [];
    for (var name in lib) {
        var symbol = "" + name;
        var ref = lib[name];
        if (ref instanceof Function) {
            if (symbol.charAt(0) == symbol.charAt(0).toLowerCase()) {
                // assume it is top level function
                symbols.push(symbol + '()');
            }
            else {
                symbols.push(symbol);
                collectClassSymbols(symbols, symbol, ref);
            }
        }
        else {
            symbols.push(symbol);
        }
    }
    return symbols;
}
function getSymbolsFromLibrary(name) {
    var symbols = collectTopLevelSymbols(name, LIB_MAP[name]);
    symbols.sort();
    return symbols;
}
exports.getSymbolsFromLibrary = getSymbolsFromLibrary;
//# sourceMappingURL=symbol_inspector.js.map