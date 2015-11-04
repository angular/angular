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

 * @cheatsheetSection
 *       Built-in directives
 *       `import {NgIf, ...} from 'angular2/angular2';`
 * @cheatsheetItem
 *       <section *ng-if="showSection">
 *       Removes or recreates a portion of the DOM tree based on the showSection expression.
 *       *ng-if
 * @cheatsheetItem
 *       <li *ng-for="#item of list">
 *       Turns the li element and its contents into a template, and uses that to instantiate a view for each item in list.
 *       '*ng-for'
 * @cheatsheetItem
 *       <div [ng-switch]="conditionExpression">\n  <template [ng-switch-when]="case1Exp">...</template>\n  <template ng-switch-when="case2LiteralString">...</template>\n  <template ng-switch-default>...</template>\n</div>
 *       Conditionally swaps the contents of the div by selecting one of the embedded templates based on the current value of conditionExpression.
 *       [ng-switch]
 *       [ng-switch-when]
 *       ng-switch-when
 *       ng-switch-default
 * @cheatsheetItem
 *       <div [ng-class]="{active: isActive, disabled: isDisabled}">
 *       Binds the presence of css classes on the element to the truthiness of the associated map values. The right-hand side expression should return {class-name: true/false} map.
 *       [ng-class]
 */
export const CORE_DIRECTIVES: Type[] =
    CONST_EXPR([NgClass, NgFor, NgIf, NgStyle, NgSwitch, NgSwitchWhen, NgSwitchDefault]);
