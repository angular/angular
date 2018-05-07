/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SimpleChange} from '../change_detection/change_detection_util';


/**
 * A `changes` object whose keys are property names and
 * values are instances of {@link SimpleChange}. See {@link OnChanges}
 *
 */
export interface SimpleChanges { [propName: string]: SimpleChange; }

/**
 * @usageNotes
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnChanges'}
 *
 * @description
 * Lifecycle hook that is called when any data-bound property of a directive changes.
 *
 * `ngOnChanges` is called right after the data-bound properties have been checked and before view
 * and content children are checked if at least one of them has changed.
 * The `changes` parameter contains the changed properties.
 *
 * See {@linkDocs guide/lifecycle-hooks#onchanges "Lifecycle Hooks Guide"}.
 *
 *
 */
export interface OnChanges { ngOnChanges(changes: SimpleChanges): void; }

/**
 * @usageNotes
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnInit'}
 *
 * @description
 * Lifecycle hook that is called after data-bound properties of a directive are
 * initialized.
 *
 * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
 * first time, and before any of its children have been checked. It is invoked only once when the
 * directive is instantiated.
 *
 * See {@linkDocs guide/lifecycle-hooks "Lifecycle Hooks Guide"}.
 *
 *
 */
export interface OnInit { ngOnInit(): void; }

/**
 * @usageNotes
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='DoCheck'}
 *
 * @description
 * Lifecycle hook that is called when Angular dirty checks a directive.
 *
 * `ngDoCheck` gets called to check the changes in the directives in addition to the default
 * algorithm. The default change detection algorithm looks for differences by comparing
 * bound-property values by reference across change detection runs.
 *
 * Note that a directive typically should not use both `DoCheck` and {@link OnChanges} to respond to
 * changes on the same input, as `ngOnChanges` will continue to be called when the default change
 * detector detects changes.
 *
 * See {@link KeyValueDiffers} and {@link IterableDiffers} for implementing custom dirty checking
 * for collections.
 *
 * See {@linkDocs guide/lifecycle-hooks#docheck "Lifecycle Hooks Guide"}.
 *
 *
 */
export interface DoCheck { ngDoCheck(): void; }

/**
 * @usageNotes
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='OnDestroy'}
 *
 * @description
 * Lifecycle hook that is called when a directive, pipe or service is destroyed.
 *
 * `ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
 * instance is destroyed.
 *
 * See {@linkDocs guide/lifecycle-hooks "Lifecycle Hooks Guide"}.
 *
 *
 */
export interface OnDestroy { ngOnDestroy(): void; }

/**
 *
 * @usageNotes
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterContentInit'}
 *
 * @description
 * Lifecycle hook that is called after a directive's content has been fully
 * initialized.
 *
 * See {@linkDocs guide/lifecycle-hooks#aftercontent "Lifecycle Hooks Guide"}.
 *
 *
 */
export interface AfterContentInit { ngAfterContentInit(): void; }

/**
 * @usageNotes
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterContentChecked'}
 *
 * @description
 * Lifecycle hook that is called after every check of a directive's content.
 *
 * See {@linkDocs guide/lifecycle-hooks#aftercontent "Lifecycle Hooks Guide"}.
 *
 *
 */
export interface AfterContentChecked { ngAfterContentChecked(): void; }

/**
 * @usageNotes
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterViewInit'}
 *
 * @description
 * Lifecycle hook that is called after a component's view has been fully
 * initialized.
 *
 * See {@linkDocs guide/lifecycle-hooks#afterview "Lifecycle Hooks Guide"}.
 *
 *
 */
export interface AfterViewInit { ngAfterViewInit(): void; }

/**
 * @usageNotes
 * {@example core/ts/metadata/lifecycle_hooks_spec.ts region='AfterViewChecked'}
 *
 * @description
 * Lifecycle hook that is called after every check of a component's view.
 *
 * See {@linkDocs guide/lifecycle-hooks#afterview "Lifecycle Hooks Guide"}.
 *
 *
 */
export interface AfterViewChecked { ngAfterViewChecked(): void; }
