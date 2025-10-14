/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */
export {Attribute} from './di/metadata_attr';
export {ContentChild, ContentChildren, Query, ViewChild, ViewChildren} from './metadata/di';
export {
  Component,
  Directive,
  HostBinding,
  HostListener,
  Input,
  Output,
  Pipe,
} from './metadata/directives';
export {NgModule} from './metadata/ng_module';
export {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from './metadata/schema';
export {ViewEncapsulation} from './metadata/view';
//# sourceMappingURL=metadata.js.map
