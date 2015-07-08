import {isString, StringWrapper, CONST} from 'angular2/src/facade/lang';
import {Pipe, PipeFactory} from './pipe';
import {ChangeDetectorRef} from '../change_detector_ref';

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
 */
export class UpperCasePipe implements Pipe {
  _latestValue: string = null;

  supports(str: any): boolean { return isString(str); }

  onDestroy(): void { this._latestValue = null; }

  transform(value: string, args: List<any> = null): string {
    if (this._latestValue !== value) {
      this._latestValue = value;
      return StringWrapper.toUpperCase(value);
    } else {
      return this._latestValue;
    }
  }
}

@CONST()
export class UpperCaseFactory implements PipeFactory {
  supports(str: any): boolean { return isString(str); }

  create(cdRef: ChangeDetectorRef): Pipe { return new UpperCasePipe(); }
}
