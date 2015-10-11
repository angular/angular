import {ComponentInstruction} from './instruction';
import {global} from 'angular2/src/core/facade/lang';

// This is here only so that after TS transpilation the file is not empty.
// TODO(rado): find a better way to fix this, or remove if likely culprit
// https://github.com/systemjs/systemjs/issues/487 gets closed.
var __ignore_me = global;


/**
 * Defines route lifecycle method `onActivate`, which is called by the router at the end of a
 * successful route navigation.
 *
 * For a single component's navigation, only one of either {@link OnActivate} or {@link OnReuse}
 * will be called depending on the result of {@link CanReuse}.
 *
 * The `onActivate` hook is called with two {@link ComponentInstruction}s as parameters, the first
 * representing the current route being navigated to, and the second parameter representing the
 * previous route or `null`.
 *
 * If `onActivate` returns a promise, the route change will wait until the promise settles to
 * instantiate and activate child components.
 *
 * ## Example
 * ```
 * import {Component} from 'angular2/angular2';
 * import {OnActivate, ComponentInstruction} from 'angular2/router';
 *
 * @Component({
 *   selector: 'my-cmp',
 *   template: '<div>hello!</div>'
 * })
 * class MyCmp implements OnActivate {
 *   onActivate(next: ComponentInstruction, prev: ComponentInstruction) {
 *     this.log = 'Finished navigating from ' + prev.urlPath + ' to ' + next.urlPath;
 *   }
 * }
 * ```
 */
export interface OnActivate {
  onActivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method `onReuse`, which is called by the router at the end of a
 * successful route navigation when {@link CanReuse} is implemented and returns or resolves to true.
 *
 * For a single component's navigation, only one of either {@link OnActivate} or {@link OnReuse}
 * will be called, depending on the result of {@link CanReuse}.
 *
 * The `onReuse` hook is called with two {@link ComponentInstruction}s as parameters, the first
 * representing the current route being navigated to, and the second parameter representing the
 * previous route or `null`.
 *
 * ## Example
 * ```
 * import {Component} from 'angular2/angular2';
 * import {CanReuse, OnReuse, ComponentInstruction} from 'angular2/router';
 *
 * @Component({
 *   selector: 'my-cmp',
 *   template: '<div>hello!</div>'
 * })
 * class MyCmp implements CanReuse, OnReuse {
 *   canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
 *     return true;
 *   }
 *
 *   onReuse(next: ComponentInstruction, prev: ComponentInstruction) {
 *     this.params = next.params;
 *   }
 * }
 * ```
 */
export interface OnReuse {
  onReuse(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method `onDeactivate`, which is called by the router before destroying
 * a component as part of a route change.
 *
 * The `onDeactivate` hook is called with two {@link ComponentInstruction}s as parameters, the first
 * representing the current route being navigated to, and the second parameter representing the
 * previous route.
 *
 * If `onDeactivate` returns a promise, the route change will wait until the promise settles.
 *
 * ## Example
 * ```
 * import {Component} from 'angular2/angular2';
 * import {OnDeactivate, ComponentInstruction} from 'angular2/router';
 *
 * @Component({
 *   selector: 'my-cmp',
 *   template: '<div>hello!</div>'
 * })
 * class MyCmp implements OnDeactivate {
 *   onDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
 *     return this.doFadeAwayAnimation();
 *   }
 * }
 *  ```
 */
export interface OnDeactivate {
  onDeactivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method `canReuse`, which is called by the router to determine whether a
 * component should be reused across routes, or whether to destroy and instantiate a new component.
 *
 * The `canReuse` hook is called with two {@link ComponentInstruction}s as parameters, the first
 * representing the current route being navigated to, and the second parameter representing the
 * previous route.
 *
 * If `canReuse` returns or resolves to `true`, the component instance will be reused and the
 * {@link OnDeactivate} hook will be run. If `canReuse` returns or resolves to `false`, a new
 * component will be instantiated, and the existing component will be deactivated and removed as
 * part of the navigation.
 *
 * If `canReuse` throws or rejects, the navigation will be cancelled.
 *
 * ## Example
 * ```
 * import {Component} from 'angular2/angular2';
 * import {CanReuse, OnReuse, ComponentInstruction} from 'angular2/router';
 *
 * @Component({
 *   selector: 'my-cmp',
 *   template: '<div>hello!</div>'
 * })
 * class MyCmp implements CanReuse, OnReuse {
 *   canReuse(next: ComponentInstruction, prev: ComponentInstruction) {
 *     return next.params.id == prev.params.id;
 *   }
 *
 *   onReuse(next: ComponentInstruction, prev: ComponentInstruction) {
 *     this.id = next.params.id;
 *   }
 * }
 *  ```
 */
export interface CanReuse {
  canReuse(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}

/**
 * Defines route lifecycle method `canDeactivate`, which is called by the router to determine
 * if a component can be removed as part of a navigation.
 *
 * The `canDeactivate` hook is called with two {@link ComponentInstruction}s as parameters, the
 * first representing the current route being navigated to, and the second parameter
 * representing the previous route.
 *
 * If `canDeactivate` returns or resolves to `false`, the navigation is cancelled. If it returns or
 * resolves to `true`, then the navigation continues, and the component will be deactivated
 * (the {@link OnDeactivate} hook will be run) and removed.
 *
 * If `canDeactivate` throws or rejects, the navigation is also cancelled.
 *
 * ## Example
 * ```
 * import {Component} from 'angular2/angular2';
 * import {CanDeactivate, ComponentInstruction} from 'angular2/router';
 *
 * @Component({
 *   selector: 'my-cmp',
 *   template: '<div>hello!</div>'
 * })
 * class MyCmp implements CanDeactivate {
 *   canDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
 *     return askUserIfTheyAreSureTheyWantToQuit();
 *   }
 * }
 *  ```
 */
export interface CanDeactivate {
  canDeactivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}
