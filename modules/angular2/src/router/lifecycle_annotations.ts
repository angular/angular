/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */

import {makeDecorator} from 'angular2/src/core/util/decorators';
import {CanActivate as CanActivateAnnotation} from './lifecycle_annotations_impl';
import {Promise} from 'angular2/src/core/facade/async';
import {ComponentInstruction} from 'angular2/src/router/instruction';

export {
  canReuse,
  canDeactivate,
  onActivate,
  onReuse,
  onDeactivate
} from './lifecycle_annotations_impl';

/**
 * Defines route lifecycle method [canActivate], which is called by the router to determine
 * if a component can be instantiated as part of a navigation.
 *
 * Note that unlike other lifecycle hooks, this one uses an annotation rather than an interface.
 * This is because [canActivate] is called before the component is instantiated.
 *
 * If `canActivate` returns or resolves to `false`, the navigation is cancelled.
 *
 * If `canActivate` throws or rejects, the navigation is also cancelled.
 *
 * ## Example
 * ```
 * @Directive({
 *   selector: 'control-panel-cmp'
 * })
 * @CanActivate(() => checkIfUserIsLoggedIn())
 * class ControlPanelCmp {
 *   // ...
 * }
 *  ```
 */
export var CanActivate:
    (hook: (next: ComponentInstruction, prev: ComponentInstruction) => Promise<boolean>| boolean) =>
        ClassDecorator = makeDecorator(CanActivateAnnotation);
