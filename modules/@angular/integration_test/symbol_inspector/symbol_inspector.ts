import * as simple_library from './simple_library';
import * as ngCommon from '@angular/common';
import * as ngCompiler from '@angular/compiler';
import * as ngCore from '@angular/core';
import * as ngInstrumentation from '@angular/core';
import * as ngPlatformBrowser from '@angular/platform-browser';
import * as ngPlatformCommon from '@angular/common';
import * as ngUpgrade from '@angular/upgrade';

const LIB_MAP = {
  'simple_library': simple_library,
  ngCommon,
  ngCompiler,
  ngCore,
  ngInstrumentation,
  ngPlatformBrowser,
  ngPlatformCommon,
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
