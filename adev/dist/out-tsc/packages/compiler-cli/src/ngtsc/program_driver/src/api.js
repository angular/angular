/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const NgOriginalFile = Symbol('NgOriginalFile');
export var UpdateMode;
(function (UpdateMode) {
  /**
   * A complete update creates a completely new overlay of type-checking code on top of the user's
   * original program, which doesn't include type-checking code from previous calls to
   * `updateFiles`.
   */
  UpdateMode[(UpdateMode['Complete'] = 0)] = 'Complete';
  /**
   * An incremental update changes the contents of some files in the type-checking program without
   * reverting any prior changes.
   */
  UpdateMode[(UpdateMode['Incremental'] = 1)] = 'Incremental';
})(UpdateMode || (UpdateMode = {}));
//# sourceMappingURL=api.js.map
