/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ɵgetDOM as getDOM} from '@angular/common';
import {ɵglobal as global, ɵRuntimeError as RuntimeError} from '@angular/core';
export class BrowserGetTestability {
  addToWindow(registry) {
    global['getAngularTestability'] = (elem, findInAncestors = true) => {
      const testability = registry.findTestabilityInTree(elem, findInAncestors);
      if (testability == null) {
        throw new RuntimeError(
          5103 /* RuntimeErrorCode.TESTABILITY_NOT_FOUND */,
          (typeof ngDevMode === 'undefined' || ngDevMode) &&
            'Could not find testability for element.',
        );
      }
      return testability;
    };
    global['getAllAngularTestabilities'] = () => registry.getAllTestabilities();
    global['getAllAngularRootElements'] = () => registry.getAllRootElements();
    const whenAllStable = (callback) => {
      const testabilities = global['getAllAngularTestabilities']();
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
  findTestabilityInTree(registry, elem, findInAncestors) {
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
      return this.findTestabilityInTree(registry, elem.host, true);
    }
    return this.findTestabilityInTree(registry, elem.parentElement, true);
  }
}
//# sourceMappingURL=testability.js.map
