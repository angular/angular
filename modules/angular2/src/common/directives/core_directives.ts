import {CONST_EXPR, Type} from 'angular2/src/facade/lang';
import {NgClass} from './ng_class';
import {NgFor} from './ng_for';
import {NgIf} from './ng_if';
import {NgTemplateOutlet} from './ng_template_outlet';
import {NgStyle} from './ng_style';
import {NgSwitch, NgSwitchWhen, NgSwitchDefault} from './ng_switch';
import {NgPlural, NgPluralCase} from './ng_plural';

/**
 * A collection of Angular core directives that are likely to be used in each and every Angular
 * application.
 *
 * This collection can be used to quickly enumerate all the built-in directives in the `directives`
 * property of the `@Component` annotation.
 *
 * ### Example ([live demo](http://plnkr.co/edit/yakGwpCdUkg0qfzX5m8g?p=preview))
 *
 * Instead of writing:
 *
 * ```typescript
 * import {NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault} from 'angular2/common';
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
 * import {CORE_DIRECTIVES} from 'angular2/common';
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
export const CORE_DIRECTIVES: Type[] = CONST_EXPR([
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  NgStyle,
  NgSwitch,
  NgSwitchWhen,
  NgSwitchDefault,
  NgPlural,
  NgPluralCase
]);
