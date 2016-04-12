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

function collectTopLevelSymbols(prefix: string, lib: any):
    string[] {
      var symbols: string[] = [];
      for (var name in lib) {
        var symbol = `${name}`;
        symbols.push(symbol);
      }
      return symbols;
    }

export function getSymbolsFromLibrary(name: string): string[] {
  var symbols = collectTopLevelSymbols(name, LIB_MAP[name]);
  symbols.sort();
  return symbols;
}
