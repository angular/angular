import {CONST} from 'angular2/src/facade/lang';

/**
 * Marks a function or method as an Angular 2 entrypoint. Only necessary in Dart code.
 *
 * The optional `name` parameter will be reflected in logs when the entry point is processed.
 *
 * See [the wiki][] for detailed documentation.
 * [the wiki]: https://github.com/angular/angular/wiki/Angular-2-Dart-Transformer#entry_points
 *
 * ## Example
 *
 * ```
 * @AngularEntrypoint("name-for-debug")
 * void main() {
 *   bootstrap(MyComponent);
 * }
 * ```
 */
@CONST()
export class AngularEntrypoint {
  constructor(public name?: String) {}
}
