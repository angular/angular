/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

import {ViewEncapsulation} from './interfaces/view_encapsulation';
import {Attribute, ContentChild, ContentChildren, Query, ViewChild, ViewChildren} from './metadata/di';
import {Component, Directive, HostBinding, HostListener, Input, Output, Pipe} from './metadata/directives';
import {DoBootstrap, ModuleWithProviders, NgModule, SchemaMetadata} from './metadata/ng_module';

export {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, OnChanges, OnDestroy, OnInit} from './interfaces/lifecycle_hooks';
export {ViewEncapsulation} from './interfaces/view_encapsulation';
export {ANALYZE_FOR_ENTRY_COMPONENTS, Attribute, ContentChild, ContentChildDecorator, ContentChildren, ContentChildrenDecorator, Query, ViewChild, ViewChildDecorator, ViewChildren, ViewChildrenDecorator} from './metadata/di';
export {Component, ComponentDecorator, Directive, DirectiveDecorator, HostBinding, HostListener, Input, Output, Pipe} from './metadata/directives';
export {CUSTOM_ELEMENTS_SCHEMA, DoBootstrap, ModuleWithProviders, NO_ERRORS_SCHEMA, NgModule, SchemaMetadata} from './metadata/ng_module';
