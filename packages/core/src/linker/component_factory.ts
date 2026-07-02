/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ChangeDetectorRef} from '../change_detection/change_detection';
import type {Injector} from '../di/injector';
import type {Type} from '../interface/type';

import type {ElementRef} from './element_ref';
import type {ViewRef} from './view_ref';

/**
 * Represents a component created by a `ComponentFactory`.
 * Provides access to the component instance and related objects,
 * and provides the means of destroying the instance.
 *
 * @see [Programmatically rendering components](guide/components/programmatic-rendering)
 *
 * @publicApi
 */
export abstract class ComponentRef<C> {
  /**
   * Updates a specified input name to a new value. Using this method will properly mark for check
   * component using the `OnPush` change detection strategy. It will also assure that the
   * `OnChanges` lifecycle hook runs when a dynamically created component is change-detected.
   *
   * @param name The name of an input.
   * @param value The new value of an input.
   */
  abstract setInput(name: string, value: unknown): void;

  /**
   * The host or anchor element for this component instance.
   */
  abstract get location(): ElementRef;

  /**
   * The dependency injector for this component instance.
   */
  abstract get injector(): Injector;

  /**
   * This component instance.
   */
  abstract get instance(): C;

  /**
   * The host view defined by the template
   * for this component instance.
   */
  abstract get hostView(): ViewRef;

  /**
   * The change detector for this component instance.
   */
  abstract get changeDetectorRef(): ChangeDetectorRef;

  /**
   * The type of this component (as created by a `ComponentFactory` class).
   */
  abstract get componentType(): Type<any>;

  /**
   * Destroys the component instance and all of the data structures associated with it.
   */
  abstract destroy(): void;

  /**
   * A lifecycle hook that provides additional developer-defined cleanup
   * functionality for the component.
   * @param callback A handler function that cleans up developer-defined data
   * associated with this component. Called when the `destroy()` method is invoked.
   */
  abstract onDestroy(callback: Function): void;
}
