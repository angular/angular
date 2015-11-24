import { OpaqueToken } from "angular2/src/core/di";
import { CONST_EXPR } from "angular2/src/facade/lang";
/**
 * A token that can be provided when bootstraping an application to make an array of directives
 * available in every component of the application.
 *
 * ### Example
 *
 * ```typescript
 * import {PLATFORM_DIRECTIVES} from 'angular2/angular2';
 * import {OtherDirective} from './myDirectives';
 *
 * @Component({
 *   selector: 'my-component',
 *   template: `
 *     <!-- can use other directive even though the component does not list it in `directives` -->
 *     <other-directive></other-directive>
 *   `
 * })
 * export class MyComponent {
 *   ...
 * }
 *
 * bootstrap(MyComponent, [provide(PLATFORM_DIRECTIVES, {useValue: [OtherDirective], multi:true})]);
 * ```
 */
export const PLATFORM_DIRECTIVES = CONST_EXPR(new OpaqueToken("Platform Directives"));
/**
 * A token that can be provided when bootstraping an application to make an array of pipes
 * available in every component of the application.
 *
 * ### Example
 *
 * ```typescript
 * import {PLATFORM_PIPES} from 'angular2/angular2';
 * import {OtherPipe} from './myPipe';
 *
 * @Component({
 *   selector: 'my-component',
 *   template: `
 *     {{123 | other-pipe}}
 *   `
 * })
 * export class MyComponent {
 *   ...
 * }
 *
 * bootstrap(MyComponent, [provide(PLATFORM_PIPES, {useValue: [OtherPipe], multi:true})]);
 * ```
 */
export const PLATFORM_PIPES = CONST_EXPR(new OpaqueToken("Platform Pipes"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHNCQUFzQjtPQUN6QyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtBQUVuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxhQUFhLG1CQUFtQixHQUFnQixVQUFVLENBQUMsSUFBSSxXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBRW5HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0gsYUFBYSxjQUFjLEdBQWdCLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09wYXF1ZVRva2VufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG4vKipcbiAqIEEgdG9rZW4gdGhhdCBjYW4gYmUgcHJvdmlkZWQgd2hlbiBib290c3RyYXBpbmcgYW4gYXBwbGljYXRpb24gdG8gbWFrZSBhbiBhcnJheSBvZiBkaXJlY3RpdmVzXG4gKiBhdmFpbGFibGUgaW4gZXZlcnkgY29tcG9uZW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7UExBVEZPUk1fRElSRUNUSVZFU30gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtPdGhlckRpcmVjdGl2ZX0gZnJvbSAnLi9teURpcmVjdGl2ZXMnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPCEtLSBjYW4gdXNlIG90aGVyIGRpcmVjdGl2ZSBldmVuIHRob3VnaCB0aGUgY29tcG9uZW50IGRvZXMgbm90IGxpc3QgaXQgaW4gYGRpcmVjdGl2ZXNgIC0tPlxuICogICAgIDxvdGhlci1kaXJlY3RpdmU+PC9vdGhlci1kaXJlY3RpdmU+XG4gKiAgIGBcbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQge1xuICogICAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoTXlDb21wb25lbnQsIFtwcm92aWRlKFBMQVRGT1JNX0RJUkVDVElWRVMsIHt1c2VWYWx1ZTogW090aGVyRGlyZWN0aXZlXSwgbXVsdGk6dHJ1ZX0pXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFBMQVRGT1JNX0RJUkVDVElWRVM6IE9wYXF1ZVRva2VuID0gQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oXCJQbGF0Zm9ybSBEaXJlY3RpdmVzXCIpKTtcblxuLyoqXG4gKiBBIHRva2VuIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHdoZW4gYm9vdHN0cmFwaW5nIGFuIGFwcGxpY2F0aW9uIHRvIG1ha2UgYW4gYXJyYXkgb2YgcGlwZXNcbiAqIGF2YWlsYWJsZSBpbiBldmVyeSBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtQTEFURk9STV9QSVBFU30gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtPdGhlclBpcGV9IGZyb20gJy4vbXlQaXBlJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIHt7MTIzIHwgb3RoZXItcGlwZX19XG4gKiAgIGBcbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQge1xuICogICAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoTXlDb21wb25lbnQsIFtwcm92aWRlKFBMQVRGT1JNX1BJUEVTLCB7dXNlVmFsdWU6IFtPdGhlclBpcGVdLCBtdWx0aTp0cnVlfSldKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUExBVEZPUk1fUElQRVM6IE9wYXF1ZVRva2VuID0gQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oXCJQbGF0Zm9ybSBQaXBlc1wiKSk7XG4iXX0=