'use strict';var di_1 = require("angular2/src/core/di");
var lang_1 = require("angular2/src/facade/lang");
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
exports.PLATFORM_DIRECTIVES = lang_1.CONST_EXPR(new di_1.OpaqueToken("Platform Directives"));
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
exports.PLATFORM_PIPES = lang_1.CONST_EXPR(new di_1.OpaqueToken("Platform Pipes"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxtQkFBMEIsc0JBQXNCLENBQUMsQ0FBQTtBQUNqRCxxQkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUVwRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDVSwyQkFBbUIsR0FBZ0IsaUJBQVUsQ0FBQyxJQUFJLGdCQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBRW5HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ1Usc0JBQWMsR0FBZ0IsaUJBQVUsQ0FBQyxJQUFJLGdCQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL2RpXCI7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcblxuLyoqXG4gKiBBIHRva2VuIHRoYXQgY2FuIGJlIHByb3ZpZGVkIHdoZW4gYm9vdHN0cmFwaW5nIGFuIGFwcGxpY2F0aW9uIHRvIG1ha2UgYW4gYXJyYXkgb2YgZGlyZWN0aXZlc1xuICogYXZhaWxhYmxlIGluIGV2ZXJ5IGNvbXBvbmVudCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge1BMQVRGT1JNX0RJUkVDVElWRVN9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7T3RoZXJEaXJlY3RpdmV9IGZyb20gJy4vbXlEaXJlY3RpdmVzJztcbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdteS1jb21wb25lbnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDwhLS0gY2FuIHVzZSBvdGhlciBkaXJlY3RpdmUgZXZlbiB0aG91Z2ggdGhlIGNvbXBvbmVudCBkb2VzIG5vdCBsaXN0IGl0IGluIGBkaXJlY3RpdmVzYCAtLT5cbiAqICAgICA8b3RoZXItZGlyZWN0aXZlPjwvb3RoZXItZGlyZWN0aXZlPlxuICogICBgXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKE15Q29tcG9uZW50LCBbcHJvdmlkZShQTEFURk9STV9ESVJFQ1RJVkVTLCB7dXNlVmFsdWU6IFtPdGhlckRpcmVjdGl2ZV0sIG11bHRpOnRydWV9KV0pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBQTEFURk9STV9ESVJFQ1RJVkVTOiBPcGFxdWVUb2tlbiA9IENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKFwiUGxhdGZvcm0gRGlyZWN0aXZlc1wiKSk7XG5cbi8qKlxuICogQSB0b2tlbiB0aGF0IGNhbiBiZSBwcm92aWRlZCB3aGVuIGJvb3RzdHJhcGluZyBhbiBhcHBsaWNhdGlvbiB0byBtYWtlIGFuIGFycmF5IG9mIHBpcGVzXG4gKiBhdmFpbGFibGUgaW4gZXZlcnkgY29tcG9uZW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7UExBVEZPUk1fUElQRVN9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7T3RoZXJQaXBlfSBmcm9tICcuL215UGlwZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICB7ezEyMyB8IG90aGVyLXBpcGV9fVxuICogICBgXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKE15Q29tcG9uZW50LCBbcHJvdmlkZShQTEFURk9STV9QSVBFUywge3VzZVZhbHVlOiBbT3RoZXJQaXBlXSwgbXVsdGk6dHJ1ZX0pXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFBMQVRGT1JNX1BJUEVTOiBPcGFxdWVUb2tlbiA9IENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKFwiUGxhdGZvcm0gUGlwZXNcIikpO1xuIl19