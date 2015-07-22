import {isString, StringWrapper, CONST} from 'angular2/src/facade/lang';
import {Pipe, BasePipe, PipeFactory} from './pipe';
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
@CONST()
export class UpperCasePipe extends BasePipe implements PipeFactory {
  supports(str: any): boolean { return isString(str); }

  transform(value: string, args: List<any> = null): string {
    return StringWrapper.toUpperCase(value);
  }

  create(cdRef: ChangeDetectorRef): Pipe { return this; }
}
