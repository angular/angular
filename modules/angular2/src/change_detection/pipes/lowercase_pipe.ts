import {isString, StringWrapper} from 'angular2/src/facade/lang';
import {Pipe} from './pipe';

/**
 * Implements lowercase transforms to text.
 *
 * # Example
 *
 * In this example we transform the user text lowercase.
 *
 *  ```
 * @Component({
 *   selector: "username-cmp"
 * })
 * @View({
 *   template: "Username: {{ user | lowercase }}"
 * })
 * class Username {
 *   user:string;
 * }
 *
 * ```
 *
 * @exportedAs angular2/pipes
 */
export class LowerCasePipe extends Pipe {
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
      return StringWrapper.toLowerCase(value);
    } else {
      return this._latestValue;
    }
  }
}

/**
 * @exportedAs angular2/pipes
 */
export class LowerCaseFactory {
  supports(str): boolean { return isString(str); }

  create(): Pipe { return new LowerCasePipe(); }
}
