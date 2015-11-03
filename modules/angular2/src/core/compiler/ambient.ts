import {OpaqueToken} from "angular2/src/core/di";
import {CONST_EXPR} from "angular2/src/core/facade/lang";

/**
 * A token that can be provided when bootstraping an application to make an array of directives
 * available in every component of the application.
 *
 * ### Example
 *
 * ```typescript
 * import {AMBIENT_DIRECTIVES} from 'angular2/angular2';
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
 * bootstrap(MyComponent, [provide(AMBIENT_DIRECTIVES, {useValue: [OtherDirective], multi:true})]);
 * ```
 */
export const AMBIENT_DIRECTIVES: OpaqueToken = CONST_EXPR(new OpaqueToken("Ambient Directives"));

/**
 * A token that can be provided when bootstraping an application to make an array of pipes
 * available in every component of the application.
 *
 * ### Example
 *
 * ```typescript
 * import {AMBIENT_PIPES} from 'angular2/angular2';
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
 * bootstrap(MyComponent, [provide(AMBIENT_PIPES, {useValue: [OtherPipe], multi:true})]);
 * ```
 */
export const AMBIENT_PIPES: OpaqueToken = CONST_EXPR(new OpaqueToken("Ambient Pipes"));
