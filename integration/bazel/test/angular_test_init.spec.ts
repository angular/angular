// Tests will compile framework declarations in JIT.
import '@angular/compiler';

import {TestBed} from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment([BrowserDynamicTestingModule], platformBrowserDynamicTesting());
