import { ComponentInstruction } from './instruction';
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
 * ### Example
 * {@example router/ts/on_activate/on_activate_example.ts region='onActivate'}
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
 * ### Example
 * {@example router/ts/reuse/reuse_example.ts region='reuseCmp'}
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
 * ### Example
 * {@example router/ts/on_deactivate/on_deactivate_example.ts region='onDeactivate'}
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
 * ### Example
 * {@example router/ts/reuse/reuse_example.ts region='reuseCmp'}
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
 * ### Example
 * {@example router/ts/can_deactivate/can_deactivate_example.ts region='canDeactivate'}
 */
export interface CanDeactivate {
    canDeactivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction): any;
}
