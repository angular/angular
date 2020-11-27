// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { ɵDomSharedStylesHost } from '@angular/platform-browser';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);

// TODO: Remove this workaround once we update to an Angular version that includes a fix for
// https://github.com/angular/angular/issues/31834
afterEach(() => {
  getTestBed().inject(ɵDomSharedStylesHost).ngOnDestroy();
});

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
