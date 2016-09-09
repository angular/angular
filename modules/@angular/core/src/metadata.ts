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

import {AttributeMetadata, AttributeMetadataCtor, ContentChildMetadata, ContentChildrenMetadata, ContentQueryMetadataCtor, QueryMetadataCtor, ViewChildMetadata, ViewChildrenMetadata} from './metadata/di';
import {ComponentMetadata, DirectiveMetadata, HostBindingMetadata, HostBindingMetadataCtor, HostListenerMetadata, HostListenerMetadataCtor, InputMetadata, InputMetadataCtor, OutputMetadata, OutputMetadataCtor, PipeMetadata} from './metadata/directives';
import {ModuleWithProviders, NgModuleMetadata, SchemaMetadata} from './metadata/ng_module';
import {ViewEncapsulation} from './metadata/view';
import {Type} from './type';
import {ClassMetadataCtor, TypeDecorator, makeDecorator, makeParamDecorator, makePropDecorator} from './util/decorators';

export {ANALYZE_FOR_ENTRY_COMPONENTS, AttributeMetadata, ContentChildMetadata, ContentChildrenMetadata, QueryMetadata, ViewChildMetadata, ViewChildrenMetadata} from './metadata/di';
export {ComponentMetadata, DirectiveMetadata, HostBindingMetadata, HostListenerMetadata, InputMetadata, OutputMetadata, PipeMetadata} from './metadata/directives';
export {AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, DoCheck, OnChanges, OnDestroy, OnInit} from './metadata/lifecycle_hooks';
export {CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NO_ERRORS_SCHEMA, NgModuleMetadata, SchemaMetadata} from './metadata/ng_module';
export {ViewEncapsulation} from './metadata/view';



/**
 * Interface for the {@link NgModuleMetadata} decorator function.
 *
 * See {@link NgModuleMetadataFactory}.
 *
 * @stable
 */
export interface NgModuleDecorator extends TypeDecorator {}

/**
 * A decorator and constructor for {@link ComponentMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Component: typeof ComponentMetadata&ClassMetadataCtor<ComponentMetadata> =
    <any>makeDecorator(ComponentMetadata);

/**
 * A decorator and constructor for {@link DirectiveMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Directive: typeof DirectiveMetadata&ClassMetadataCtor<DirectiveMetadata> =
    <any>makeDecorator(DirectiveMetadata);

/**
 * A decorator and constructor for {@link AttributeMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Attribute: typeof AttributeMetadata&AttributeMetadataCtor =
    <any>makeParamDecorator(AttributeMetadata);

/**
 * A decorator and constructor for {@link ContentChildrenMetadata}.
 *
 * @stable
 * @Annotation
 */
export const ContentChildren: typeof ContentChildrenMetadata&ContentQueryMetadataCtor =
    <any>makePropDecorator(ContentChildrenMetadata);

/**
 * A decorator and constructor for {@link ContentChildMetadata}.
 *
 * @stable
 * @Annotation
 */
export const ContentChild: typeof ContentChildMetadata&ContentQueryMetadataCtor =
    <any>makePropDecorator(ContentChildMetadata);

/**
 * A decorator and constructor for {@link ViewChildrenMetadata}.
 *
 * @stable
 * @Annotation
 */
export const ViewChildren: typeof ViewChildrenMetadata&QueryMetadataCtor =
    <any>makePropDecorator(ViewChildrenMetadata);

/**
 * A decorator and constructor for {@link ViewChildMetadata}.
 *
 * @stable
 * @Annotation
 */
export const ViewChild: typeof ViewChildMetadata&QueryMetadataCtor =
    <any>makePropDecorator(ViewChildMetadata);

/**
 * A decorator and constructor for {@link PipeMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Pipe: typeof PipeMetadata&ClassMetadataCtor<PipeMetadata> =
    <any>makeDecorator(PipeMetadata);

/**
 * A decorator and constructor for {@link InputMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Input: typeof InputMetadata&InputMetadataCtor = <any>makePropDecorator(InputMetadata);

/**
 * A decorator and constructor for {@link OutputMetadata}.
 *
 * @stable
 * @Annotation
 */
export const Output: typeof OutputMetadata&OutputMetadataCtor =
    <any>makePropDecorator(OutputMetadata);

/**
 * A decorator and constructor for {@link HostBindingMetadata}.
 *
 * @stable
 * @Annotation
 */
export const HostBinding: typeof HostBindingMetadata&HostBindingMetadataCtor =
    <any>makePropDecorator(HostBindingMetadata);

/**
 * A decorator and constructor for {@link HostListenerMetadata}.
 *
 * @stable
 * @Annotation
 */
export const HostListener: typeof HostListenerMetadata&HostListenerMetadataCtor =
    <any>makePropDecorator(HostListenerMetadata);

/**
 * Declares an ng module.
 * @stable
 * @Annotation
 */
export const NgModule: typeof NgModuleMetadata&ClassMetadataCtor<NgModuleMetadata> =
    <any>makeDecorator(NgModuleMetadata);
