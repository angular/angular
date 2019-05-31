/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('getUserMedia', (global: any, Zone: any, api: _ZonePrivate) => {
  function wrapFunctionArgs(func: Function, source?: string): Function {
    return function() {
      const args = Array.prototype.slice.call(arguments);
      const wrappedArgs = api.bindArguments(args, source ? source : (func as any).name);
      return func.apply(this, wrappedArgs);
    };
  }
  let navigator = global['navigator'];
  if (navigator && navigator.getUserMedia) {
    navigator.getUserMedia = wrapFunctionArgs(navigator.getUserMedia);
  }
});
