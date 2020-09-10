/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */


export {Attribute, AttributeDecorator} from './di/metadata_attr';
export {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, OnChanges, OnDestroy, OnInit} from './interface/lifecycle_hooks';
export {ANALYZE_FOR_ENTRY_COMPONENTS, ContentChild, ContentChildDecorator, ContentChildren, ContentChildrenDecorator, Query, ViewChild, ViewChildDecorator, ViewChildren, ViewChildrenDecorator} from './metadata/di';
export {Component, ComponentDecorator, Directive, DirectiveDecorator, HostBinding, HostBindingDecorator, HostListener, HostListenerDecorator, Input, InputDecorator, Output, OutputDecorator, Pipe, PipeDecorator} from './metadata/directives';
export {DoBootstrap} from './metadata/do_boostrap';
export {ModuleWithProviders, NgModule, NgModuleDecorator} from './metadata/ng_module';
export {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, SchemaMetadata} from './metadata/schema';
export {ViewEncapsulation} from './metadata/view';
