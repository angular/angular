/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export var FactoryTarget;
(function (FactoryTarget) {
  FactoryTarget[(FactoryTarget['Directive'] = 0)] = 'Directive';
  FactoryTarget[(FactoryTarget['Component'] = 1)] = 'Component';
  FactoryTarget[(FactoryTarget['Injectable'] = 2)] = 'Injectable';
  FactoryTarget[(FactoryTarget['Pipe'] = 3)] = 'Pipe';
  FactoryTarget[(FactoryTarget['NgModule'] = 4)] = 'NgModule';
})(FactoryTarget || (FactoryTarget = {}));
export var R3TemplateDependencyKind;
(function (R3TemplateDependencyKind) {
  R3TemplateDependencyKind[(R3TemplateDependencyKind['Directive'] = 0)] = 'Directive';
  R3TemplateDependencyKind[(R3TemplateDependencyKind['Pipe'] = 1)] = 'Pipe';
  R3TemplateDependencyKind[(R3TemplateDependencyKind['NgModule'] = 2)] = 'NgModule';
})(R3TemplateDependencyKind || (R3TemplateDependencyKind = {}));
export var ViewEncapsulation;
(function (ViewEncapsulation) {
  ViewEncapsulation[(ViewEncapsulation['Emulated'] = 0)] = 'Emulated';
  // Historically the 1 value was for `Native` encapsulation which has been removed as of v11.
  ViewEncapsulation[(ViewEncapsulation['None'] = 2)] = 'None';
  ViewEncapsulation[(ViewEncapsulation['ShadowDom'] = 3)] = 'ShadowDom';
  ViewEncapsulation[(ViewEncapsulation['IsolatedShadowDom'] = 4)] = 'IsolatedShadowDom';
})(ViewEncapsulation || (ViewEncapsulation = {}));
//# sourceMappingURL=compiler_facade_interface.js.map
