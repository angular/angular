import {isString, StringWrapper} from 'angular2/src/facade/lang';
import {Pipe} from './pipe';

/**
 * Implements uppercase transforms to text.
 *
 * # Example
 *
 * In this example we transform the user text uppercase.
 *
 *  ```
 * @Component({
 *   selector: "username-cmp"
 * })
 * @View({
 *   template: "Username: {{ user | uppercase }}"
 * })
 * class Username {
 *   user:string;
 * }
 *
 * ```
 *
 * @exportedAs angular2/pipes
 */
export class UpperCasePipe extends Pipe {
  _latestValue: string;
  constructor() {
    super();
    this._latestValue = null;
  }
  supports(str): boolean { return isString(str); }

  onDestroy(): void { this._latestValue = null; }

  transform(value: string): string {
    if (this._latestValue !== value) {
      this._latestValue = value;
      return StringWrapper.toUpperCase(value);
    } else {
      return this._latestValue;
    }
  }
}

/**
 * @exportedAs angular2/pipes
 */
export class UpperCaseFactory {
  supports(str): boolean { return isString(str); }

  create(): Pipe { return new UpperCasePipe(); }
}
