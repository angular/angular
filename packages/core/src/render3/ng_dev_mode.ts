/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


declare global {
  const ngDevMode: null|NgDevModePerfCounters;
  interface NgDevModePerfCounters {
    firstTemplatePass: number;
    tNode: number;
    tView: number;
    rendererCreateTextNode: number;
    rendererSetText: number;
    rendererCreateElement: number;
    rendererAddEventListener: number;
    rendererSetAttribute: number;
    rendererRemoveAttribute: number;
    rendererSetProperty: number;
    rendererSetClassName: number;
    rendererAddClass: number;
    rendererRemoveClass: number;
    rendererSetStyle: number;
    rendererRemoveStyle: number;
  }
}



declare let global: any;
export const ngDevModeResetPerfCounters: () => void =
    (typeof ngDevMode == 'undefined' && (function(global: {ngDevMode: NgDevModePerfCounters}) {
       function ngDevModeResetPerfCounters() {
         global.ngDevMode = {
           firstTemplatePass: 0,
           tNode: 0,
           tView: 0,
           rendererCreateTextNode: 0,
           rendererSetText: 0,
           rendererCreateElement: 0,
           rendererAddEventListener: 0,
           rendererSetAttribute: 0,
           rendererRemoveAttribute: 0,
           rendererSetProperty: 0,
           rendererSetClassName: 0,
           rendererAddClass: 0,
           rendererRemoveClass: 0,
           rendererSetStyle: 0,
           rendererRemoveStyle: 0,
         };
       }
       ngDevModeResetPerfCounters();
       return ngDevModeResetPerfCounters;
     })(typeof window != 'undefined' && window || typeof self != 'undefined' && self ||
        typeof global != 'undefined' && global)) as() => void;
