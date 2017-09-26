/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GetTestability, Testability, TestabilityRegistry, setTestabilityGetter, ɵglobalForWrite as globalForWrite} from '@angular/core';

import {getDOM} from '../dom/dom_adapter';

// Declare global variable in a closure friendly way.
declare const getAngularTestability: (elem: any, findInAncestors: boolean) => Testability;
// Declare global variable in a closure friendly way.
declare const getAllAngularTestabilities: () => Testability[];
// Declare global variable in a closure friendly way.
declare const getAllAngularRootElements: any[];
// Declare global variable in a closure friendly way.
declare const frameworkStabilizers: Array<(callback: any) => void>;


export class BrowserGetTestability implements GetTestability {
  static init() { setTestabilityGetter(new BrowserGetTestability()); }

  addToWindow(registry: TestabilityRegistry): void {
    globalForWrite.getAngularTestability = (elem: any, findInAncestors: boolean = true) => {
      const testability = registry.findTestabilityInTree(elem, findInAncestors);
      if (testability == null) {
        throw new Error('Could not find testability for element.');
      }
      return testability;
    };

    globalForWrite.getAllAngularTestabilities = () => registry.getAllTestabilities();

    globalForWrite.getAllAngularRootElements = () => registry.getAllRootElements();

    const whenAllStable = (callback: any /** TODO #9100 */) => {
      const testabilities = getAllAngularTestabilities();
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

    if (typeof frameworkStabilizers === 'undefined') {
      globalForWrite.frameworkStabilizers = [];
    }
    frameworkStabilizers.push(whenAllStable);
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
      return this.findTestabilityInTree(registry, getDOM().getHost(elem), true);
    }
    return this.findTestabilityInTree(registry, getDOM().parentElement(elem), true);
  }
}
