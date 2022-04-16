/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
import {GetTestability, Testability, TestabilityRegistry, ɵglobal as global} from '@angular/core';

export class BrowserGetTestability implements GetTestability {
  addToWindow(registry: TestabilityRegistry): void {
    global['getAngularTestability'] = (elem: any, findInAncestors: boolean = true) => {
      const testability = registry.findTestabilityInTree(elem, findInAncestors);
      if (testability == null) {
        throw new Error('Could not find testability for element.');
      }
      return testability;
    };

    global['getAllAngularTestabilities'] = () => registry.getAllTestabilities();

    global['getAllAngularRootElements'] = () => registry.getAllRootElements();

    const whenAllStable = (callback: any /** TODO #9100 */) => {
      const testabilities = global['getAllAngularTestabilities']();
      let count = testabilities.length;
      let didWork = false;
      const decrement = function(didWork_: any /** TODO #9100 */) {
        didWork = didWork || didWork_;
        count--;
        if (count == 0) {
          callback(didWork);
        }
      };
      testabilities.forEach(function(testability: any /** TODO #9100 */) {
        testability.whenStable(decrement);
      });
    };

    if (!global['frameworkStabilizers']) {
      global['frameworkStabilizers'] = [];
    }
    global['frameworkStabilizers'].push(whenAllStable);
  }

  findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean):
      Testability|null {
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
