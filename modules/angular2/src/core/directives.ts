/**
 * @module
 * @description
 * Common directives shipped with Angular.
 */

import {CONST_EXPR, Type} from './facade/lang';
import {NgClass} from './directives/ng_class';
import {NgFor} from './directives/ng_for';
import {NgIf} from './directives/ng_if';
import {NgStyle} from './directives/ng_style';
import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from './directives/ng_switch';

export {NgClass} from './directives/ng_class';
export {NgFor} from './directives/ng_for';
export {NgIf} from './directives/ng_if';
export {NgStyle} from './directives/ng_style';
export {NgSwitch, NgSwitchWhen, NgSwitchDefault} from './directives/ng_switch';
export * from './directives/observable_list_diff';

/**
 * A collection of Angular core directives that are likely to be used in each and every Angular
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in directives in the `directives`
 * property of the `@View` annotation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/yakGwpCdUkg0qfzX5m8g?p=preview))
 *
 * Instead of writing:
 *
 * ```typescript
 * import {NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/angular2';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'myComponent.html',
 *   directives: [NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 * one could import all the core directives at once:
 *
 * ```typescript
 * import {CORE_DIRECTIVES} from 'angular2/angular2';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'myComponent.html',
 *   directives: [CORE_DIRECTIVES, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 */
export const CORE_DIRECTIVES: Type[] =
    CONST_EXPR([NgClass, NgFor, NgIf, NgStyle, NgSwitch, NgSwitchWhen, NgSwitchDefault]);
