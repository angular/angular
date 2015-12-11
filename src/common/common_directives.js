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
 * 'angular2/common';
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
 * import {COMMON_DIRECTIVES} from 'angular2/common';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX2RpcmVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2NvbW1vbl9kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFCQUErQiwwQkFBMEIsQ0FBQyxDQUFBO0FBRTFELHNCQUE4QixTQUFTLENBQUMsQ0FBQTtBQUN4QywyQkFBOEIsY0FBYyxDQUFDLENBQUE7QUFFN0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBDRztBQUNVLHlCQUFpQixHQUFhLGlCQUFVLENBQUMsQ0FBQyw0QkFBZSxFQUFFLHVCQUFlLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVF9FWFBSLCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG5pbXBvcnQge0ZPUk1fRElSRUNUSVZFU30gZnJvbSAnLi9mb3Jtcyc7XG5pbXBvcnQge0NPUkVfRElSRUNUSVZFU30gZnJvbSAnLi9kaXJlY3RpdmVzJztcblxuLyoqXG4gKiBBIGNvbGxlY3Rpb24gb2YgQW5ndWxhciBjb3JlIGRpcmVjdGl2ZXMgdGhhdCBhcmUgbGlrZWx5IHRvIGJlIHVzZWQgaW4gZWFjaCBhbmQgZXZlcnkgQW5ndWxhclxuICogYXBwbGljYXRpb24uIFRoaXMgaW5jbHVkZXMgY29yZSBkaXJlY3RpdmVzIChlLmcuLCBOZ0lmIGFuZCBOZ0ZvciksIGFuZCBmb3JtcyBkaXJlY3RpdmVzIChlLmcuLFxuICogTmdNb2RlbCkuXG4gKlxuICogVGhpcyBjb2xsZWN0aW9uIGNhbiBiZSB1c2VkIHRvIHF1aWNrbHkgZW51bWVyYXRlIGFsbCB0aGUgYnVpbHQtaW4gZGlyZWN0aXZlcyBpbiB0aGUgYGRpcmVjdGl2ZXNgXG4gKiBwcm9wZXJ0eSBvZiB0aGUgYEBDb21wb25lbnRgIG9yIGBAVmlld2AgZGVjb3JhdG9ycy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIEluc3RlYWQgb2Ygd3JpdGluZzpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge05nQ2xhc3MsIE5nSWYsIE5nRm9yLCBOZ1N3aXRjaCwgTmdTd2l0Y2hXaGVuLCBOZ1N3aXRjaERlZmF1bHQsIE5nTW9kZWwsIE5nRm9ybX0gZnJvbVxuICogJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKiBpbXBvcnQge090aGVyRGlyZWN0aXZlfSBmcm9tICcuL215RGlyZWN0aXZlcyc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdteUNvbXBvbmVudC5odG1sJyxcbiAqICAgZGlyZWN0aXZlczogW05nQ2xhc3MsIE5nSWYsIE5nRm9yLCBOZ1N3aXRjaCwgTmdTd2l0Y2hXaGVuLCBOZ1N3aXRjaERlZmF1bHQsIE5nTW9kZWwsIE5nRm9ybSxcbiAqIE90aGVyRGlyZWN0aXZlXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIC4uLlxuICogfVxuICogYGBgXG4gKiBvbmUgY291bGQgaW1wb3J0IGFsbCB0aGUgY29tbW9uIGRpcmVjdGl2ZXMgYXQgb25jZTpcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0NPTU1PTl9ESVJFQ1RJVkVTfSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuICogaW1wb3J0IHtPdGhlckRpcmVjdGl2ZX0gZnJvbSAnLi9teURpcmVjdGl2ZXMnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlVXJsOiAnbXlDb21wb25lbnQuaHRtbCcsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDT01NT05fRElSRUNUSVZFUywgT3RoZXJEaXJlY3RpdmVdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IENPTU1PTl9ESVJFQ1RJVkVTOiBUeXBlW11bXSA9IENPTlNUX0VYUFIoW0NPUkVfRElSRUNUSVZFUywgRk9STV9ESVJFQ1RJVkVTXSk7XG4iXX0=