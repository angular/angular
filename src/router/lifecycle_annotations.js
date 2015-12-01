'use strict';/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */
var decorators_1 = require('angular2/src/core/util/decorators');
var lifecycle_annotations_impl_1 = require('./lifecycle_annotations_impl');
var lifecycle_annotations_impl_2 = require('./lifecycle_annotations_impl');
exports.canReuse = lifecycle_annotations_impl_2.canReuse;
exports.canDeactivate = lifecycle_annotations_impl_2.canDeactivate;
exports.onActivate = lifecycle_annotations_impl_2.onActivate;
exports.onReuse = lifecycle_annotations_impl_2.onReuse;
exports.onDeactivate = lifecycle_annotations_impl_2.onDeactivate;
/**
 * Defines route lifecycle hook `CanActivate`, which is called by the router to determine
 * if a component can be instantiated as part of a navigation.
 *
 * <aside class="is-right">
 * Note that unlike other lifecycle hooks, this one uses an annotation rather than an interface.
 * This is because the `CanActivate` function is called before the component is instantiated.
 * </aside>
 *
 * The `CanActivate` hook is called with two {@link ComponentInstruction}s as parameters, the first
 * representing the current route being navigated to, and the second parameter representing the
 * previous route or `null`.
 *
 * ```typescript
 * @CanActivate((next, prev) => boolean | Promise<boolean>)
 * ```
 *
 * If `CanActivate` returns or resolves to `false`, the navigation is cancelled.
 * If `CanActivate` throws or rejects, the navigation is also cancelled.
 * If `CanActivate` returns or resolves to `true`, navigation continues, the component is
 * instantiated, and the {@link OnActivate} hook of that component is called if implemented.
 *
 * ### Example
 *
 * {@example router/ts/can_activate/can_activate_example.ts region='canActivate' }
 */
exports.CanActivate = decorators_1.makeDecorator(lifecycle_annotations_impl_1.CanActivate);
//# sourceMappingURL=lifecycle_annotations.js.map