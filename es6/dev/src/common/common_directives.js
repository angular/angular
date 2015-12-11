import { CONST_EXPR } from 'angular2/src/facade/lang';
import { FORM_DIRECTIVES } from './forms';
import { CORE_DIRECTIVES } from './directives';
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
export const COMMON_DIRECTIVES = CONST_EXPR([CORE_DIRECTIVES, FORM_DIRECTIVES]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX2RpcmVjdGl2ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29tbW9uL2NvbW1vbl9kaXJlY3RpdmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsVUFBVSxFQUFPLE1BQU0sMEJBQTBCO09BRWxELEVBQUMsZUFBZSxFQUFDLE1BQU0sU0FBUztPQUNoQyxFQUFDLGVBQWUsRUFBQyxNQUFNLGNBQWM7QUFFNUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBDRztBQUNILGFBQWEsaUJBQWlCLEdBQWEsVUFBVSxDQUFDLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFIsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbmltcG9ydCB7Rk9STV9ESVJFQ1RJVkVTfSBmcm9tICcuL2Zvcm1zJztcbmltcG9ydCB7Q09SRV9ESVJFQ1RJVkVTfSBmcm9tICcuL2RpcmVjdGl2ZXMnO1xuXG4vKipcbiAqIEEgY29sbGVjdGlvbiBvZiBBbmd1bGFyIGNvcmUgZGlyZWN0aXZlcyB0aGF0IGFyZSBsaWtlbHkgdG8gYmUgdXNlZCBpbiBlYWNoIGFuZCBldmVyeSBBbmd1bGFyXG4gKiBhcHBsaWNhdGlvbi4gVGhpcyBpbmNsdWRlcyBjb3JlIGRpcmVjdGl2ZXMgKGUuZy4sIE5nSWYgYW5kIE5nRm9yKSwgYW5kIGZvcm1zIGRpcmVjdGl2ZXMgKGUuZy4sXG4gKiBOZ01vZGVsKS5cbiAqXG4gKiBUaGlzIGNvbGxlY3Rpb24gY2FuIGJlIHVzZWQgdG8gcXVpY2tseSBlbnVtZXJhdGUgYWxsIHRoZSBidWlsdC1pbiBkaXJlY3RpdmVzIGluIHRoZSBgZGlyZWN0aXZlc2BcbiAqIHByb3BlcnR5IG9mIHRoZSBgQENvbXBvbmVudGAgb3IgYEBWaWV3YCBkZWNvcmF0b3JzLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogSW5zdGVhZCBvZiB3cml0aW5nOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7TmdDbGFzcywgTmdJZiwgTmdGb3IsIE5nU3dpdGNoLCBOZ1N3aXRjaFdoZW4sIE5nU3dpdGNoRGVmYXVsdCwgTmdNb2RlbCwgTmdGb3JtfSBmcm9tXG4gKiAnYW5ndWxhcjIvY29tbW9uJztcbiAqIGltcG9ydCB7T3RoZXJEaXJlY3RpdmV9IGZyb20gJy4vbXlEaXJlY3RpdmVzJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZVVybDogJ215Q29tcG9uZW50Lmh0bWwnLFxuICogICBkaXJlY3RpdmVzOiBbTmdDbGFzcywgTmdJZiwgTmdGb3IsIE5nU3dpdGNoLCBOZ1N3aXRjaFdoZW4sIE5nU3dpdGNoRGVmYXVsdCwgTmdNb2RlbCwgTmdGb3JtLFxuICogT3RoZXJEaXJlY3RpdmVdXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKiBgYGBcbiAqIG9uZSBjb3VsZCBpbXBvcnQgYWxsIHRoZSBjb21tb24gZGlyZWN0aXZlcyBhdCBvbmNlOlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7Q09NTU9OX0RJUkVDVElWRVN9IGZyb20gJ2FuZ3VsYXIyL2NvbW1vbic7XG4gKiBpbXBvcnQge090aGVyRGlyZWN0aXZlfSBmcm9tICcuL215RGlyZWN0aXZlcyc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGVVcmw6ICdteUNvbXBvbmVudC5odG1sJyxcbiAqICAgZGlyZWN0aXZlczogW0NPTU1PTl9ESVJFQ1RJVkVTLCBPdGhlckRpcmVjdGl2ZV1cbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQge1xuICogICAuLi5cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgQ09NTU9OX0RJUkVDVElWRVM6IFR5cGVbXVtdID0gQ09OU1RfRVhQUihbQ09SRV9ESVJFQ1RJVkVTLCBGT1JNX0RJUkVDVElWRVNdKTtcbiJdfQ==