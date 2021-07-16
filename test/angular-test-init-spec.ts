import {TestBed} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

/*
 * Common setup / initialization for all unit tests in Angular Material and CDK.
 */

TestBed.initTestEnvironment([BrowserDynamicTestingModule], platformBrowserDynamicTesting(), {
  teardown: {destroyAfterEach: true}
});

(window as any).module = {};
(window as any).isNode = false;
(window as any).isBrowser = true;
(window as any).global = window;
