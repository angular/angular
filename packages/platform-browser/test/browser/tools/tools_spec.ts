/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef, Injector, ɵglobal as global} from '@angular/core';
import {ComponentRef} from '@angular/core/src/render3';
import {isNode} from '@angular/private/testing';
import {disableDebugTools, enableDebugTools} from '../../../index';

import {AngularProfiler} from '../../../src/browser/tools/common_tools';

describe('profiler', () => {
  if (isNode) {
    // Jasmine will throw if there are no tests.
    it('should pass', () => {});
    return;
  }

  beforeEach(() => {
    enableDebugTools({
      injector: Injector.create({
        providers: [
          {
            provide: ApplicationRef,
            useValue: jasmine.createSpyObj('ApplicationRef', [
              'bootstrap',
              'tick',
              'attachView',
              'detachView',
            ]),
            deps: [],
          },
        ],
      }),
    } as ComponentRef<any>);
  });

  afterEach(() => {
    disableDebugTools();
  });

  it('should time change detection', () => {
    callNgProfilerTimeChangeDetection();
  });

  it('should time change detection with recording', () => {
    callNgProfilerTimeChangeDetection({'record': true});
  });
});

export function callNgProfilerTimeChangeDetection(config?: {record: true}): void {
  (global.ng.profiler as AngularProfiler).timeChangeDetection(config);
}
