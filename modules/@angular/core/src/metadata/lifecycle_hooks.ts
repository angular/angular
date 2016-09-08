/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SimpleChange} from '../change_detection/change_detection_util';

/**
 * @stable
 */
export enum LifecycleHooks {
  OnInit,
  OnDestroy,
  DoCheck,
  OnChanges,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked
}

/**
 * A `changes` object whose keys are property names and
 * values are instances of {@link SimpleChange}. See {@link OnChanges}
 * @stable
 */
export interface SimpleChanges { [propName: string]: SimpleChange; }

export var LIFECYCLE_HOOKS_VALUES = [
  LifecycleHooks.OnInit, LifecycleHooks.OnDestroy, LifecycleHooks.DoCheck, LifecycleHooks.OnChanges,
  LifecycleHooks.AfterContentInit, LifecycleHooks.AfterContentChecked, LifecycleHooks.AfterViewInit,
  LifecycleHooks.AfterViewChecked
];

/**
 *
 * `ngOnChanges` is called right after the data-bound properties have been checked and before view
 * and content children are checked if at least one of them has changed.
 * The `changes` parameter contains all of the changed properties.
 *
 * For more detail, see the
 * {@linkDocs guide/lifecycle-hooks#onchanges "Lifecycle Hooks Guide"}.
 *
 * @whatItDoes Lifecycle hook that is called when any data-bound property of a directive changes.
 * @howToUse
 * {@example core/ts/metadata/test/lifecycle_hooks_example_spec.ts region='OnChanges'}
 *
 * @stable
 */
export abstract class OnChanges { abstract ngOnChanges(changes: SimpleChanges): void; }

/**
 * `ngOnInit` is called right after the directive's data-bound properties have been checked for the
 * first time, and before any of its children have been checked. It is invoked only once when the
 * directive is instantiated.
 *
 * For more detail, see the
 * {@linkDocs guide/lifecycle-hooks "Lifecycle Hooks Guide"}.
 *
 * @whatItDoes Lifecycle hook that is called after data-bound properties of a directive are
 * initialized.
 * @howToUse
 * {@example core/ts/metadata/test/lifecycle_hooks_example_spec.ts region='OnInit'}
 *
 * @stable
 */
export abstract class OnInit { abstract ngOnInit(): void; }

/**
 * `ngDoCheck` gets called to check the changes in the directives in addition to the default
 * algorithm. The default change detection algorithm looks for differences by comparing
 * bound-property values
 * by reference across change detection runs.
 *
 * Note that a directive typically should not use both `DoCheck` and {@link OnChanges} to respond to
 * changes on the same input, as `ngOnChanges` will continue to be called when the default change
 * detector
 * detects changes.
 *
 * See {@link KeyValueDiffers} and {@link IterableDiffers} for implementing custom dirty checking
 * for collections.
 *
 * For more detail, see the
 * {@linkDocs guide/lifecycle-hooks#docheck "Lifecycle Hooks Guide"}.
 *
 * @whatItDoes Lifecycle hook that is called when Angular dirty checks a directive.
 * @howToUse
 * {@example core/ts/metadata/test/lifecycle_hooks_example_spec.ts region='DoCheck'}
 *
 * @stable
 */
export abstract class DoCheck { abstract ngDoCheck(): void; }

/**
 *
 * `ngOnDestroy` callback is typically used for any custom cleanup that needs to occur when the
 * instance is destroyed.
 *
 * For more detail, see the
 * {@linkDocs guide/lifecycle-hooks "Lifecycle Hooks Guide"}.
 *
 * @whatItDoes Lifecycle hook that is called when a directive or pipe is destroyed.
 * @howToUse
 * {@example core/ts/metadata/test/lifecycle_hooks_example_spec.ts region='OnDestroy'}
 *
 * @stable
 */
export abstract class OnDestroy { abstract ngOnDestroy(): void; }

/**
 *
 * For more detail, see the
 * {@linkDocs guide/lifecycle-hooks#aftercontent "Lifecycle Hooks Guide"}.
 *
 * @whatItDoes Lifecycle hook that is called after a directive's content has been fully
 * initialized.
 * @howToUse
 * {@example core/ts/metadata/test/lifecycle_hooks_example_spec.ts region='AfterContentInit'}
 *
 * @stable
 */
export abstract class AfterContentInit { abstract ngAfterContentInit(): void; }

/**
 * For more detail, see the
 * {@linkDocs guide/lifecycle-hooks#aftercontent "Lifecycle Hooks Guide"}.
 *
 * @whatItDoes Lifecycle hook that is called after every check of a directive's content.
 * @howToUse
 * {@example core/ts/metadata/test/lifecycle_hooks_example_spec.ts region='AfterContentChecked'}
 *
 * @stable
 */
export abstract class AfterContentChecked { abstract ngAfterContentChecked(): void; }

/**
 * For more detail, see the
 * {@linkDocs guide/lifecycle-hooks#afterview "Lifecycle Hooks Guide"}.
 *
 * @whatItDoes Lifecycle hook that is called after a component's view has been fully
 * initialized.
 * @howToUse
 * {@example core/ts/metadata/test/lifecycle_hooks_example_spec.ts region='AfterViewInit'}
 *
 * @stable
 */
export abstract class AfterViewInit { abstract ngAfterViewInit(): void; }

/**
 * For more detail, see the
 * {@linkDocs guide/lifecycle-hooks#afterview "Lifecycle Hooks Guide"}.
 *
 * @whatItDoes Lifecycle hook that is called after every check of a component's view.
 * @howToUse
 * {@example core/ts/metadata/test/lifecycle_hooks_example_spec.ts region='AfterViewChecked'}
 *
 * @stable
 */
export abstract class AfterViewChecked { abstract ngAfterViewChecked(): void; }
