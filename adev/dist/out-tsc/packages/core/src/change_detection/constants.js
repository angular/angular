/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * The strategy that the default change detector uses to detect changes.
 * When set, takes effect the next time change detection is triggered.
 *
 * @see {@link /api/core/ChangeDetectorRef?tab=usage-notes Change detection usage}
 * @see {@link /best-practices/skipping-subtrees Skipping component subtrees}
 *
 * @publicApi
 */
export var ChangeDetectionStrategy;
(function (ChangeDetectionStrategy) {
  /**
   * Use the `CheckOnce` strategy, meaning that automatic change detection is deactivated
   * until reactivated by setting the strategy to `Default` (`CheckAlways`).
   * Change detection can still be explicitly invoked.
   * This strategy applies to all child directives and cannot be overridden.
   */
  ChangeDetectionStrategy[(ChangeDetectionStrategy['OnPush'] = 0)] = 'OnPush';
  /**
   * Use the default `CheckAlways` strategy, in which change detection is automatic until
   * explicitly deactivated.
   */
  ChangeDetectionStrategy[(ChangeDetectionStrategy['Default'] = 1)] = 'Default';
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
//# sourceMappingURL=constants.js.map
