/**
 * @module
 * @description
 * Common directives shipped with Angular.
 */

import {CONST_EXPR, Type} from './src/core/facade/lang';
import {NgClass} from './src/core/directives/ng_class';
import {NgFor} from './src/core/directives/ng_for';
import {NgIf} from './src/core/directives/ng_if';
import {NgNonBindable} from './src/core/directives/ng_non_bindable';
import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from './src/core/directives/ng_switch';

export * from './src/core/directives/ng_class';
export * from './src/core/directives/ng_for';
export * from './src/core/directives/ng_if';
export * from './src/core/directives/ng_non_bindable';
export * from './src/core/directives/ng_style';
export * from './src/core/directives/ng_switch';

/**
 * A collection of the Angular core directives that are likely to be used in each and every Angular
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in directives in the `@View`
 * annotation. For example,
 * instead of writing:
 *
 * ```
 * import {NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/angular2';
 * import {OtherDirective} from 'myDirectives';
 *
 * @Component({
 *  selector: 'my-component'
 * })
 * @View({
 *   templateUrl: 'myComponent.html',
 *   directives: [NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 * one could import all the core directives at once:
 *
 * ```
 * import {CORE_DIRECTIVES} from 'angular2/angular2';
 * import {OtherDirective} from 'myDirectives';
 *
 * @Component({
 *  selector: 'my-component'
 * })
 * @View({
 *   templateUrl: 'myComponent.html',
 *   directives: [CORE_DIRECTIVES, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 *
 */
export const CORE_DIRECTIVES: Type[] =
    CONST_EXPR([NgClass, NgFor, NgIf, NgNonBindable, NgSwitch, NgSwitchWhen, NgSwitchDefault]);
