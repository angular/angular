/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Flags for renderer-specific style modifiers.
 * @publicApi
 */
export var RendererStyleFlags2;
(function (RendererStyleFlags2) {
  // TODO(misko): This needs to be refactored into a separate file so that it can be imported from
  // `node_manipulation.ts` Currently doing the import cause resolution order to change and fails
  // the tests. The work around is to have hard coded value in `node_manipulation.ts` for now.
  /**
   * Marks a style as important.
   */
  RendererStyleFlags2[(RendererStyleFlags2['Important'] = 1)] = 'Important';
  /**
   * Marks a style as using dash case naming (this-is-dash-case).
   */
  RendererStyleFlags2[(RendererStyleFlags2['DashCase'] = 2)] = 'DashCase';
})(RendererStyleFlags2 || (RendererStyleFlags2 = {}));
//# sourceMappingURL=api_flags.js.map
