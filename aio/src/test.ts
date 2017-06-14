// This file is required by karma.conf.js and loads recursively all the .spec and framework files

// Test dependencies.
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// List vendors here to increase test rebuild performance.
import '@angular/common';
import '@angular/common/testing';
import '@angular/core/';
import '@angular/core/testing';
import '@angular/platform-browser';
import '@angular/platform-browser/testing';
import '@angular/platform-browser/animations';
import '@angular/platform-browser-dynamic';
import '@angular/platform-browser-dynamic/testing';
import '@angular/http';
import '@angular/http/testing';
import '@angular/animations';
import '@angular/material';
import '@angular/service-worker';
import 'rxjs'; // tslint:disable-line

// Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
declare var __karma__: any;

// Prevent Karma from running prematurely.
__karma__.loaded = function () {};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// HACK: Chrome 59 disconnects if there are too many synchronous tests in a row
// because it appears to lock up the thread that communicates to Karma's socket
// This async beforeEach gets called on every spec and releases the JS thread long
// enough for the socket to continue to communicate.
// The downside is that it creates a minor performance penalty of around 10-15%
// increase in the time it takes to run out unit tests.
beforeEach((done) => done());

declare var System: any;
// Then we find all the tests.
System.import('./test-specs.ts')
  // Finally, start Karma to run the tests.
  .then(() => __karma__.start());
