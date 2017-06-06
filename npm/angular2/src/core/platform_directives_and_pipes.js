'use strict';"use strict";
var di_1 = require("angular2/src/core/di");
/**
 * A token that can be provided when bootstraping an application to make an array of directives
 * available in every component of the application.
 *
 * ### Example
 *
 * ```typescript
 * import {PLATFORM_DIRECTIVES} from 'angular2/core';
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
exports.PLATFORM_DIRECTIVES = 
/*@ts2dart_const*/ new di_1.OpaqueToken("Platform Directives");
/**
 * A token that can be provided when bootstraping an application to make an array of pipes
 * available in every component of the application.
 *
 * ### Example
 *
 * ```typescript
 * import {PLATFORM_PIPES} from 'angular2/core';
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
exports.PLATFORM_PIPES = new di_1.OpaqueToken("Platform Pipes");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsbUJBQTBCLHNCQUFzQixDQUFDLENBQUE7QUFFakQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ1UsMkJBQW1CO0FBQzVCLGtCQUFrQixDQUFDLElBQUksZ0JBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0FBRTlEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ1Usc0JBQWMsR0FBbUMsSUFBSSxnQkFBVyxDQUFDLGdCQUFnQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09wYXF1ZVRva2VufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcblxuLyoqXG4gKiBBIHRva2VuIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHdoZW4gYm9vdHN0cmFwaW5nIGFuIGFwcGxpY2F0aW9uIHRvIG1ha2UgYW4gYXJyYXkgb2YgZGlyZWN0aXZlc1xuICogYXZhaWxhYmxlIGluIGV2ZXJ5IGNvbXBvbmVudCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge1BMQVRGT1JNX0RJUkVDVElWRVN9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtPdGhlckRpcmVjdGl2ZX0gZnJvbSAnLi9teURpcmVjdGl2ZXMnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPCEtLSBjYW4gdXNlIG90aGVyIGRpcmVjdGl2ZSBldmVuIHRob3VnaCB0aGUgY29tcG9uZW50IGRvZXMgbm90IGxpc3QgaXQgaW4gYGRpcmVjdGl2ZXNgIC0tPlxuICogICAgIDxvdGhlci1kaXJlY3RpdmU+PC9vdGhlci1kaXJlY3RpdmU+XG4gKiAgIGBcbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQge1xuICogICAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoTXlDb21wb25lbnQsIFtwcm92aWRlKFBMQVRGT1JNX0RJUkVDVElWRVMsIHt1c2VWYWx1ZTogW090aGVyRGlyZWN0aXZlXSwgbXVsdGk6dHJ1ZX0pXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFBMQVRGT1JNX0RJUkVDVElWRVM6IE9wYXF1ZVRva2VuID1cbiAgICAvKkB0czJkYXJ0X2NvbnN0Ki8gbmV3IE9wYXF1ZVRva2VuKFwiUGxhdGZvcm0gRGlyZWN0aXZlc1wiKTtcblxuLyoqXG4gKiBBIHRva2VuIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHdoZW4gYm9vdHN0cmFwaW5nIGFuIGFwcGxpY2F0aW9uIHRvIG1ha2UgYW4gYXJyYXkgb2YgcGlwZXNcbiAqIGF2YWlsYWJsZSBpbiBldmVyeSBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtQTEFURk9STV9QSVBFU30gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge090aGVyUGlwZX0gZnJvbSAnLi9teVBpcGUnO1xuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ215LWNvbXBvbmVudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAge3sxMjMgfCBvdGhlci1waXBlfX1cbiAqICAgYFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChNeUNvbXBvbmVudCwgW3Byb3ZpZGUoUExBVEZPUk1fUElQRVMsIHt1c2VWYWx1ZTogW090aGVyUGlwZV0sIG11bHRpOnRydWV9KV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBQTEFURk9STV9QSVBFUzogT3BhcXVlVG9rZW4gPSAvKkB0czJkYXJ0X2NvbnN0Ki8gbmV3IE9wYXF1ZVRva2VuKFwiUGxhdGZvcm0gUGlwZXNcIik7XG4iXX0=