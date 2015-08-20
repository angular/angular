import {ComponentInstruction} from './instruction';
import {global} from 'angular2/src/core/facade/lang';

// This is here only so that after TS transpilation the file is not empty.
// TODO(rado): find a better way to fix this, or remove if likely culprit
// https://github.com/systemjs/systemjs/issues/487 gets closed.
var __ignore_me = global;


/**
 * Defines route lifecycle method [onActivate], which is called by the router at the end of a
 * successful route navigation.
 *
 * For a single component's navigation, only one of either [onActivate] or [onReuse] will be called,
 * depending on the result of [canReuse].
 *
 * If `onActivate` returns a promise, the route change will wait until the promise settles to
 * instantiate and activate child components.
 *
 * ## Example
 * ```
 * @Directive({
 *   selector: 'my-cmp'
 * })
 * class MyCmp implements OnActivate {
 *   onActivate(next, prev) {
 *     this.log = 'Finished navigating from ' + prev.urlPath + ' to ' + next.urlPath;
 *   }
 * }
 *  ```
 */
export interface OnActivate {
  onActivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method [onReuse], which is called by the router at the end of a
 * successful route navigation when [canReuse] is implemented and returns or resolves to true.
 *
 * For a single component's navigation, only one of either [onActivate] or [onReuse] will be called,
 * depending on the result of [canReuse].
 *
 * ## Example
 * ```
 * @Directive({
 *   selector: 'my-cmp'
 * })
 * class MyCmp implements CanReuse, OnReuse {
 *   canReuse() {
 *     return true;
 *   }
 *
 *   onReuse(next, prev) {
 *     this.params = next.params;
 *   }
 * }
 *  ```
 */
export interface OnReuse {
  onReuse(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method [onDeactivate], which is called by the router before destroying
 * a component as part of a route change.
 *
 * If `onDeactivate` returns a promise, the route change will wait until the promise settles.
 *
 * ## Example
 * ```
 * @Directive({
 *   selector: 'my-cmp'
 * })
 * class MyCmp implements CanReuse, OnReuse {
 *   canReuse() {
 *     return true;
 *   }
 *
 *   onReuse(next, prev) {
 *     this.params = next.params;
 *   }
 * }
 *  ```
 */
export interface OnDeactivate {
  onDeactivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method [canReuse], which is called by the router to determine whether a
 * component should be reused across routes, or whether to destroy and instantiate a new component.
 *
 * If `canReuse` returns or resolves to `true`, the component instance will be reused.
 *
 * If `canReuse` throws or rejects, the navigation will be cancelled.
 *
 * ## Example
 * ```
 * @Directive({
 *   selector: 'my-cmp'
 * })
 * class MyCmp implements CanReuse, OnReuse {
 *   canReuse(next, prev) {
 *     return next.params.id == prev.params.id;
 *   }
 *
 *   onReuse(next, prev) {
 *     this.id = next.params.id;
 *   }
 * }
 *  ```
 */
export interface CanReuse {
  canReuse(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method [canDeactivate], which is called by the router to determine
 * if a component can be removed as part of a navigation.
 *
 * If `canDeactivate` returns or resolves to `false`, the navigation is cancelled.
 *
 * If `canDeactivate` throws or rejects, the navigation is also cancelled.
 *
 * ## Example
 * ```
 * @Directive({
 *   selector: 'my-cmp'
 * })
 * class MyCmp implements CanDeactivate {
 *   canDeactivate(next, prev) {
 *     return askUserIfTheyAreSureTheyWantToQuit();
 *   }
 * }
 *  ```
 */
export interface CanDeactivate {
  canDeactivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}
