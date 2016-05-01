import { OpaqueToken } from "angular2/src/core/di";
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
export const PLATFORM_DIRECTIVES = 
/*@ts2dart_const*/ new OpaqueToken("Platform Directives");
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
export const PLATFORM_PIPES = new OpaqueToken("Platform Pipes");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHNCQUFzQjtBQUVoRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxPQUFPLE1BQU0sbUJBQW1CO0FBQzVCLGtCQUFrQixDQUFDLElBQUksV0FBVyxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFFOUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FzQkc7QUFDSCxPQUFPLE1BQU0sY0FBYyxHQUFtQyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL2RpXCI7XG5cbi8qKlxuICogQSB0b2tlbiB0aGF0IGNhbiBiZSBwcm92aWRlZCB3aGVuIGJvb3RzdHJhcGluZyBhbiBhcHBsaWNhdGlvbiB0byBtYWtlIGFuIGFycmF5IG9mIGRpcmVjdGl2ZXNcbiAqIGF2YWlsYWJsZSBpbiBldmVyeSBjb21wb25lbnQgb2YgdGhlIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtQTEFURk9STV9ESVJFQ1RJVkVTfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7T3RoZXJEaXJlY3RpdmV9IGZyb20gJy4vbXlEaXJlY3RpdmVzJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDwhLS0gY2FuIHVzZSBvdGhlciBkaXJlY3RpdmUgZXZlbiB0aG91Z2ggdGhlIGNvbXBvbmVudCBkb2VzIG5vdCBsaXN0IGl0IGluIGBkaXJlY3RpdmVzYCAtLT5cbiAqICAgICA8b3RoZXItZGlyZWN0aXZlPjwvb3RoZXItZGlyZWN0aXZlPlxuICogICBgXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKE15Q29tcG9uZW50LCBbcHJvdmlkZShQTEFURk9STV9ESVJFQ1RJVkVTLCB7dXNlVmFsdWU6IFtPdGhlckRpcmVjdGl2ZV0sIG11bHRpOnRydWV9KV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBQTEFURk9STV9ESVJFQ1RJVkVTOiBPcGFxdWVUb2tlbiA9XG4gICAgLypAdHMyZGFydF9jb25zdCovIG5ldyBPcGFxdWVUb2tlbihcIlBsYXRmb3JtIERpcmVjdGl2ZXNcIik7XG5cbi8qKlxuICogQSB0b2tlbiB0aGF0IGNhbiBiZSBwcm92aWRlZCB3aGVuIGJvb3RzdHJhcGluZyBhbiBhcHBsaWNhdGlvbiB0byBtYWtlIGFuIGFycmF5IG9mIHBpcGVzXG4gKiBhdmFpbGFibGUgaW4gZXZlcnkgY29tcG9uZW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7UExBVEZPUk1fUElQRVN9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtPdGhlclBpcGV9IGZyb20gJy4vbXlQaXBlJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIHt7MTIzIHwgb3RoZXItcGlwZX19XG4gKiAgIGBcbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQge1xuICogICAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoTXlDb21wb25lbnQsIFtwcm92aWRlKFBMQVRGT1JNX1BJUEVTLCB7dXNlVmFsdWU6IFtPdGhlclBpcGVdLCBtdWx0aTp0cnVlfSldKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUExBVEZPUk1fUElQRVM6IE9wYXF1ZVRva2VuID0gLypAdHMyZGFydF9jb25zdCovIG5ldyBPcGFxdWVUb2tlbihcIlBsYXRmb3JtIFBpcGVzXCIpO1xuIl19