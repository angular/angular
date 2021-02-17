/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function loadFakeGlobalAPI(global: any, target: string, fakeTarget: any) {
  const OriginalTarget = global[target];
  let thirdPartyTarget: any;

  function fakeGlobalAPI(patcher?: () => void) {
    if (global[target] === fakeTarget) {
      return;
    };
    if (global[target] === OriginalTarget) {
      global[target] = fakeTarget;
    } else {
      patcher && patcher();
      thirdPartyTarget = global[target];
    }
  }

  function restoreGlobalAPI(methodNames?: string[]) {
    if (global[target] === fakeTarget) {
      global[target] = OriginalTarget;
    } else if (thirdPartyTarget) {
      methodNames && methodNames.forEach(m => {
        const originalMethod = thirdPartyTarget[Zone.__symbol__(m)];
        if (originalMethod) {
          thirdPartyTarget[m] = originalMethod;
        }
      });
      thirdPartyTarget = null;
    }
  }
  return {fakeGlobalAPI, restoreGlobalAPI};
}
