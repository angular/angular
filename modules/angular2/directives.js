/**
 * @module
 * @public
 * @description
 * Common directives shipped with Angular.
 */

import {CONST_EXPR} from './src/facade/lang';
import {For} from './src/directives/for';
import {If} from './src/directives/if';
import {NonBindable} from './src/directives/non_bindable';
import {Switch, SwitchWhen, SwitchDefault} from './src/directives/switch';

export * from './src/directives/class';
export * from './src/directives/for';
export * from './src/directives/if';
export * from './src/directives/non_bindable';
export * from './src/directives/switch';

/**
 * A collection of the Angular core directives that are likely to be used in each and every Angular application.
 *
 * This collection can be used to quickly enumerate all the built-in directives in the `@View` annotation. For example,
 * instead of writing:
 *
 * ```
 * import {If, For, Switch, SwitchWhen, SwitchDefault} from 'angular2/angular2';
 * import {OtherDirective} from 'myDirectives';
 *
 * @Component({
 *  selector: 'my-component'
 * })
 * @View({
 *   templateUrl: 'myComponent.html',
 *   directives: [If, For, Switch, SwitchWhen, SwitchDefault, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 * one could enumerate all the core directives at once:
 *
 ** ```
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
export const coreDirectives:List = CONST_EXPR([
  For, If, NonBindable, Switch, SwitchWhen, SwitchDefault
]);
