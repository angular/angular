/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {Platform} from '@angular/cdk/platform';
import {TestBed} from '@angular/core/testing';
import {Frame} from '../../../ng-devtools';
import {ChromeApplicationOperations} from './chrome-application-operations';

describe('ChromeApplicationOperations', () => {
  let operations: ChromeApplicationOperations;

  beforeEach(() => {
    // Mock chrome global
    (globalThis as any).chrome = {
      devtools: {
        inspectedWindow: {
          eval: jasmine.createSpy('eval'),
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [ChromeApplicationOperations, {provide: Platform, useValue: {FIREFOX: false}}],
    });
    operations = TestBed.inject(ChromeApplicationOperations);
  });

  afterEach(() => {
    delete (globalThis as any).chrome;
  });

  describe('viewSource', () => {
    it('should call chrome.devtools.inspectedWindow.eval with correct string', () => {
      const target: Frame = {
        name: 'test1',
        id: 0,
        url: new URL('http://localhost:4200/url'),
      } as any;
      operations.viewSource([0, 0], target, 0);

      expect(chrome.devtools.inspectedWindow.eval).toHaveBeenCalledWith(
        'inspect(inspectedApplication.findConstructorByPosition("[0,0]", 0))',
        {frameURL: 'http://localhost:4200/url'},
      );
    });
  });
});
