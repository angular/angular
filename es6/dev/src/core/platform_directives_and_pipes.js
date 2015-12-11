import { OpaqueToken } from "angular2/src/core/di";
import { CONST_EXPR } from "angular2/src/facade/lang";
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
export const PLATFORM_DIRECTIVES = CONST_EXPR(new OpaqueToken("Platform Directives"));
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
export const PLATFORM_PIPES = CONST_EXPR(new OpaqueToken("Platform Pipes"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fZGlyZWN0aXZlc19hbmRfcGlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHNCQUFzQjtPQUN6QyxFQUFDLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtBQUVuRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxhQUFhLG1CQUFtQixHQUFnQixVQUFVLENBQUMsSUFBSSxXQUFXLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO0FBRW5HOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0JHO0FBQ0gsYUFBYSxjQUFjLEdBQWdCLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09wYXF1ZVRva2VufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmltcG9ydCB7Q09OU1RfRVhQUn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG4vKipcbiAqIEEgdG9rZW4gdGhhdCBjYW4gYmUgcHJvdmlkZWQgd2hlbiBib290c3RyYXBpbmcgYW4gYXBwbGljYXRpb24gdG8gbWFrZSBhbiBhcnJheSBvZiBkaXJlY3RpdmVzXG4gKiBhdmFpbGFibGUgaW4gZXZlcnkgY29tcG9uZW50IG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7UExBVEZPUk1fRElSRUNUSVZFU30gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge090aGVyRGlyZWN0aXZlfSBmcm9tICcuL215RGlyZWN0aXZlcyc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8IS0tIGNhbiB1c2Ugb3RoZXIgZGlyZWN0aXZlIGV2ZW4gdGhvdWdoIHRoZSBjb21wb25lbnQgZG9lcyBub3QgbGlzdCBpdCBpbiBgZGlyZWN0aXZlc2AgLS0+XG4gKiAgICAgPG90aGVyLWRpcmVjdGl2ZT48L290aGVyLWRpcmVjdGl2ZT5cbiAqICAgYFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChNeUNvbXBvbmVudCwgW3Byb3ZpZGUoUExBVEZPUk1fRElSRUNUSVZFUywge3VzZVZhbHVlOiBbT3RoZXJEaXJlY3RpdmVdLCBtdWx0aTp0cnVlfSldKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUExBVEZPUk1fRElSRUNUSVZFUzogT3BhcXVlVG9rZW4gPSBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbihcIlBsYXRmb3JtIERpcmVjdGl2ZXNcIikpO1xuXG4vKipcbiAqIEEgdG9rZW4gdGhhdCBjYW4gYmUgcHJvdmlkZWQgd2hlbiBib290c3RyYXBpbmcgYW4gYXBwbGljYXRpb24gdG8gbWFrZSBhbiBhcnJheSBvZiBwaXBlc1xuICogYXZhaWxhYmxlIGluIGV2ZXJ5IGNvbXBvbmVudCBvZiB0aGUgYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge1BMQVRGT1JNX1BJUEVTfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7T3RoZXJQaXBlfSBmcm9tICcuL215UGlwZSc7XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnbXktY29tcG9uZW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICB7ezEyMyB8IG90aGVyLXBpcGV9fVxuICogICBgXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKE15Q29tcG9uZW50LCBbcHJvdmlkZShQTEFURk9STV9QSVBFUywge3VzZVZhbHVlOiBbT3RoZXJQaXBlXSwgbXVsdGk6dHJ1ZX0pXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFBMQVRGT1JNX1BJUEVTOiBPcGFxdWVUb2tlbiA9IENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKFwiUGxhdGZvcm0gUGlwZXNcIikpO1xuIl19