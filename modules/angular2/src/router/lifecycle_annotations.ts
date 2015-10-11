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
 * Defines route lifecycle hook `CanActivate`, which is called by the router to determine
 * if a component can be instantiated as part of a navigation.
 *
 * The `CanActivate` hook is called with two {@link ComponentInstruction}s as parameters, the first
 * representing
 * the current route being navigated to, and the second parameter representing the previous route or
 * `null`.
 *
 * Note that unlike other lifecycle hooks, this one uses an annotation rather than an interface.
 * This is because the `CanActivate` function is called before the component is instantiated.
 *
 * If `CanActivate` returns or resolves to `false`, the navigation is cancelled.
 * If `CanActivate` throws or rejects, the navigation is also cancelled.
 * If `CanActivate` returns or resolves to `true`, navigation continues, the component is
 * instantiated, and the {@link OnActivate} hook of that component is called if implemented.
 *
 * ## Example
 * ```
 * import {Component} from 'angular2/angular2';
 * import {CanActivate} from 'angular2/router';
 *
 * @Component({
 *   selector: 'control-panel-cmp',
 *   template: '<div>Control Panel: ...</div>'
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
