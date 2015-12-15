import * as simple_library from './simple_library';
import * as ngAnimate from 'angular2/animate';
import * as ngCommon from 'angular2/common';
import * as ngCompiler from 'angular2/compiler';
import * as ngCore from 'angular2/core';
import * as ngHttp from 'angular2/http';
import * as ngHttpTesting from 'angular2/http/testing';
import * as ngInstrumentation from 'angular2/instrumentation';
import * as ngPlatformBrowser from 'angular2/platform/browser';
import * as ngPlatformCommonDom from 'angular2/platform/common_dom';
// TODO(#5906): currently not compatible with our test setup
// import * as ngPlatformServer from 'angular2/platform/server';
// import * as ngPlatformWorkerApp from 'angular2/platform/worker_app';
import * as ngPlatformWorkerRender from 'angular2/platform/worker_render';
import * as ngUpgrade from 'angular2/upgrade';
import * as ngRouter from 'angular2/router';
import * as ngRouterLinkDsl from 'angular2/router/router_link_dsl';
import * as ngRouterTesting from 'angular2/router/testing';
import * as ngTesting from 'angular2/testing';

const LIB_MAP = {
  'simple_library': simple_library,
  ngAnimate,
  ngCommon,
  ngCompiler,
  ngCore,
  ngHttp,
  ngHttpTesting,
  ngInstrumentation,
  ngPlatformBrowser,
  ngPlatformCommonDom,
  // TODO(#5906): currently not compatible with our test setup
  // ngPlatformServer,
  // ngPlatformWorkerApp,
  ngPlatformWorkerRender,
  ngUpgrade,
  ngRouter,
  ngRouterLinkDsl,
  ngRouterTesting,
  ngTesting
};

const IGNORE = {
  captureStackTrace: true,
  stackTraceLimit: true,
  toString: true,
  originalException: true,
  originalStack: true,
  wrapperMessage: true,
  wrapperStack: true, '@@observable': true
};

function collectClassSymbols(symbols: string[], prefix: String, type: Function): void {
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

function collectTopLevelSymbols(prefix: string, lib: any): string[] {
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
  if (!LIB_MAP.hasOwnProperty(name)) {
    throw new Error(`Unknown barrel ${name}.`);
  }
  var symbols = collectTopLevelSymbols(name, LIB_MAP[name]);
  symbols.sort();
  return symbols;
}
