/**
 * @module
 * @public
 * @description
 * Common directives shipped with Angular.
 */

import {CONST_EXPR, Type} from './src/facade/lang';
import {NgFor} from './src/directives/ng_for';
import {NgIf} from './src/directives/ng_if';
import {NgNonBindable} from './src/directives/ng_non_bindable';
import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from './src/directives/ng_switch';

export * from './src/directives/class';
export * from './src/directives/ng_for';
export * from './src/directives/ng_if';
export * from './src/directives/ng_non_bindable';
export * from './src/directives/ng_switch';

/**
 * A collection of the Angular core directives that are likely to be used in each and every Angular
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in directives in the `@View`
 * annotation. For example,
 * instead of writing:
 *
 * ```
 * import {If, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/angular2';
 * import {OtherDirective} from 'myDirectives';
 *
 * @Component({
 *  selector: 'my-component'
 * })
 * @View({
 *   templateUrl: 'myComponent.html',
 *   directives: [If, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 * one could enumerate all the core directives at once:
 *
 * ```
 * import {coreDirectives} from 'angular2/angular2';
 * import {OtherDirective} from 'myDirectives';
 *
 * @Component({
 *  selector: 'my-component'
 * })
 * @View({
 *   templateUrl: 'myComponent.html',
 *   directives: [coreDirectives, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 *
 */
export const coreDirectives: List<Type> =
    CONST_EXPR([NgFor, NgIf, NgNonBindable, NgSwitch, NgSwitchWhen, NgSwitchDefault]);
