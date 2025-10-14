/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Describes the scope of the caller's interest in template type-checking results.
 */
export var OptimizeFor;
(function (OptimizeFor) {
  /**
   * Indicates that a consumer of a `TemplateTypeChecker` is only interested in results for a
   * given file, and wants them as fast as possible.
   *
   * Calling `TemplateTypeChecker` methods successively for multiple files while specifying
   * `OptimizeFor.SingleFile` can result in significant unnecessary overhead overall.
   */
  OptimizeFor[(OptimizeFor['SingleFile'] = 0)] = 'SingleFile';
  /**
   * Indicates that a consumer of a `TemplateTypeChecker` intends to query for results pertaining
   * to the entire user program, and so the type-checker should internally optimize for this case.
   *
   * Initial calls to retrieve type-checking information may take longer, but repeated calls to
   * gather information for the whole user program will be significantly faster with this mode of
   * optimization.
   */
  OptimizeFor[(OptimizeFor['WholeProgram'] = 1)] = 'WholeProgram';
})(OptimizeFor || (OptimizeFor = {}));
//# sourceMappingURL=checker.js.map
