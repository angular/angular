/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export function defineInjectable(opts) {
  return {
    token: opts.token,
    providedIn: opts.providedIn || null,
    factory: opts.factory,
    value: undefined,
  };
}
export function registerInjectable(ctor, declaration) {
  ctor.ɵprov = declaration;
  return ctor;
}
//# sourceMappingURL=injection_token.js.map
