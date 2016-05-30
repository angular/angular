import * as simple_library from './simple_library';
import * as core from '@angular/core';
import * as core_testing from '@angular/core/testing';
import * as common from '@angular/common';
import * as common_testing from '@angular/common/testing';
import * as compiler from '@angular/compiler';
import * as compiler_testing from '@angular/compiler/testing';
import * as http from '@angular/http';
import * as http_testing from '@angular/http/testing';
import * as router_deprecated from '@angular/router-deprecated';
import * as router_deprecated_testing from '@angular/router-deprecated/testing';
import * as router from '@angular/router';
import * as router_testing from '@angular/router/testing';
import * as upgrade from '@angular/upgrade';
import * as platformBrowser from '@angular/platform-browser';
import * as platformBrowser_testing from '@angular/platform-browser/testing';
import * as platformServer from '@angular/platform-server';
import * as platformServer_testing from '@angular/platform-server/testing';

const LIB_MAP = {
  'simple_library': simple_library,
  'common': common,
  'common/testing': common_testing,
  'compiler': compiler,
  'compiler/testing': compiler_testing,
  'core': core,
  'core/testing': core_testing,
  'http': http,
  'http/testing': http_testing,
  'router-deprecated': router_deprecated,
  'router-deprecated/testing': router_deprecated_testing,
  'router': router,
  'router/testing': router_testing,
  'upgrade': upgrade,
  'platform-browser': platformBrowser,
  'platform-browser/testing': platformBrowser_testing,
  'platform-server': platformServer,
  'platform-server/testing': platformServer_testing
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
    };

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
