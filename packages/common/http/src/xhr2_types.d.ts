/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Minimal type declaration for `xhr2`, which is a dependency of `@angular/platform-server`.
// The dynamic `import('xhr2')` in `withXhr()` is guarded by `ngServerMode` and is absent
// from browser bundles and from SSR bundles that do not use `withXhr()`. This keeps the
// import tree-shakable for bundlers running in restricted environments such as Cloudflare
// Workers or V8 isolates that cannot resolve Node.js-only packages.
declare module 'xhr2' {
  export const XMLHttpRequest: any;
  export default XMLHttpRequest;
}
