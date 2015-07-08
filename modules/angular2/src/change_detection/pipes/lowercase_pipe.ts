import {isString, StringWrapper, CONST} from 'angular2/src/facade/lang';
import {Pipe, PipeFactory} from './pipe';
import {ChangeDetectorRef} from '../change_detector_ref';

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
 */
export class LowerCasePipe implements Pipe {
  _latestValue: string = null;

  supports(str: any): boolean { return isString(str); }

  onDestroy(): void { this._latestValue = null; }

  transform(value: string, args: List<any> = null): string {
    if (this._latestValue !== value) {
      this._latestValue = value;
      return StringWrapper.toLowerCase(value);
    } else {
      return this._latestValue;
    }
  }
}

@CONST()
export class LowerCaseFactory implements PipeFactory {
  supports(str: any): boolean { return isString(str); }

  create(cdRef: ChangeDetectorRef): Pipe { return new LowerCasePipe(); }
}
