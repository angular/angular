'use strict';var lang_1 = require('angular2/src/facade/lang');
var forms_1 = require('./forms');
var directives_1 = require('./directives');
/**
 * A collection of Angular core directives that are likely to be used in each and every Angular
 * application. This includes core directives (e.g., NgIf and NgFor), and forms directives (e.g.,
 * NgModel).
 *
 * This collection can be used to quickly enumerate all the built-in directives in the `directives`
 * property of the `@Component` or `@View` decorators.
 *
 * ### Example
 *
 * Instead of writing:
 *
 * ```typescript
 * import {NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, NgModel, NgForm} from
 * 'angular2/angular2';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'myComponent.html',
 *   directives: [NgClass, NgIf, NgFor, NgSwitch, NgSwitchWhen, NgSwitchDefault, NgModel, NgForm,
 * OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 * one could import all the common directives at once:
 *
 * ```typescript
 * import {COMMON_DIRECTIVES} from 'angular2/angular2';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   templateUrl: 'myComponent.html',
 *   directives: [COMMON_DIRECTIVES, OtherDirective]
 * })
 * export class MyComponent {
 *   ...
 * }
 * ```
 */
exports.COMMON_DIRECTIVES = lang_1.CONST_EXPR([directives_1.CORE_DIRECTIVES, forms_1.FORM_DIRECTIVES]);
//# sourceMappingURL=common_directives.js.map