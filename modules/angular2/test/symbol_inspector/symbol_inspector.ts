import * as simple_library from './simple_library';
import * as ngCommon from 'angular2/common';
import * as ngCompiler from 'angular2/compiler';
import * as ngCore from 'angular2/core';
import * as ngInstrumentation from 'angular2/instrumentation';
import * as ngPlatformBrowser from 'angular2/platform/browser';
import * as ngUpgrade from 'angular2/upgrade';

const LIB_MAP = {
  'simple_library': simple_library,
  ngCommon,
  ngCompiler,
  ngCore,
  ngInstrumentation,
  ngPlatformBrowser,
  ngUpgrade
};

const IGNORE =
    {
      captureStackTrace: true,
      stackTraceLimit: true,
      toString: true,
      originalException: true,
      originalStack: true,
      wrapperMessage: true,
      wrapperStack: true, '@@observable': true
    }

function collectClassSymbols(symbols: string[], prefix: String, type: Function):
    void {
      // static
      for (var name in type) {
        if (IGNORE[name] || name.charAt(0) == '_') continue;
        var suf = type[name] instanceof Function ? '()' : '';
        var symbol = `${prefix}#${name}${suf}`;
        symbols.push(symbol);
      }

      // instance
      for (var name in type.prototype) {
        if (IGNORE[name] || name.charAt(0) == '_') continue;
        if (name == 'constructor') continue;
        var suf = '';
        try {
          if (type.prototype[name] instanceof Function) suf = '()';
        } catch (e) {
        }
        var symbol = `${prefix}.${name}${suf}`;
        symbols.push(symbol);
      }
    }

function collectTopLevelSymbols(prefix: string, lib: any):
    string[] {
      var symbols: string[] = [];
      for (var name in lib) {
        var symbol = `${name}`;
        var ref = lib[name];
        if (ref instanceof Function) {
          if (symbol.charAt(0) == symbol.charAt(0).toLowerCase()) {
            // assume it is top level function
            symbols.push(symbol + '()');
          } else {
            symbols.push(symbol);
            collectClassSymbols(symbols, symbol, ref);
          }
        } else {
          symbols.push(symbol);
        }
      }
      return symbols;
    }

export function getSymbolsFromLibrary(name: string): string[] {
  var symbols = collectTopLevelSymbols(name, LIB_MAP[name]);
  symbols.sort();
  return symbols;
}
