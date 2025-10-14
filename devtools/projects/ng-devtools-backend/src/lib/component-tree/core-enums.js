/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Need to be kept in sync with Angular framework
// We can't directly import it from framework now
// because this also pulls up the security policies
// for Trusted Types, which we reinstantiate.
export var ChangeDetectionStrategy;
(function (ChangeDetectionStrategy) {
  ChangeDetectionStrategy[(ChangeDetectionStrategy['OnPush'] = 0)] = 'OnPush';
  ChangeDetectionStrategy[(ChangeDetectionStrategy['Default'] = 1)] = 'Default';
})(ChangeDetectionStrategy || (ChangeDetectionStrategy = {}));
export var AcxChangeDetectionStrategy;
(function (AcxChangeDetectionStrategy) {
  AcxChangeDetectionStrategy[(AcxChangeDetectionStrategy['Default'] = 0)] = 'Default';
  AcxChangeDetectionStrategy[(AcxChangeDetectionStrategy['OnPush'] = 1)] = 'OnPush';
})(AcxChangeDetectionStrategy || (AcxChangeDetectionStrategy = {}));
export var Framework;
(function (Framework) {
  Framework['Angular'] = 'angular';
  Framework['ACX'] = 'acx';
  Framework['Wiz'] = 'wiz';
})(Framework || (Framework = {}));
//# sourceMappingURL=core-enums.js.map
