/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {
  GetTestability,
  Testability,
  TestabilityRegistry,
  ɵglobal as global,
  ɵRuntimeError as RuntimeError,
} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

export class BrowserGetTestability implements GetTestability {
  addToWindow(registry: TestabilityRegistry): void {
    global['getAngularTestability'] = (elem: any, findInAncestors: boolean = true) => {
      const testability = registry.findTestabilityInTree(elem, findInAncestors);
      if (testability == null) {
        throw new RuntimeError(
          RuntimeErrorCode.TESTABILITY_NOT_FOUND,
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
            'Could not find testability for element.',
        );
      }
      return testability;
    };

    global['getAllAngularTestabilities'] = () => registry.getAllTestabilities();

    global['getAllAngularRootElements'] = () => registry.getAllRootElements();

    const whenAllStable = (callback: () => void) => {
      const testabilities = global['getAllAngularTestabilities']() as Testability[];
      let count = testabilities.length;
      const decrement = function () {
        count--;
        if (count == 0) {
          callback();
        }
      };
      testabilities.forEach((testability) => {
        testability.whenStable(decrement);
      });
    };

    if (!global['frameworkStabilizers']) {
      global['frameworkStabilizers'] = [];
    }
    global['frameworkStabilizers'].push(whenAllStable);
  }

  findTestabilityInTree(
    registry: TestabilityRegistry,
    elem: any,
    findInAncestors: boolean,
  ): Testability | null {
    if (elem == null) {
      return null;
    }
    const t = registry.getTestability(elem);
    if (t != null) {
      return t;
    } else if (!findInAncestors) {
      return null;
    }
    if (getDOM().isShadowRoot(elem)) {
      return this.findTestabilityInTree(registry, (<any>elem).host, true);
    }
    return this.findTestabilityInTree(registry, elem.parentElement, true);
  }
}
