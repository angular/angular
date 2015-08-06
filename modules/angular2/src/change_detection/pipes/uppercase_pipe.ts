import {isString, StringWrapper, CONST, isBlank} from 'angular2/src/facade/lang';
import {Injectable} from 'angular2/di';
import {Pipe, BasePipe, InvalidPipeArgumentException} from './pipe';

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
@Injectable()
export class UpperCasePipe extends BasePipe {
  transform(value: string, args: List<any> = null): string {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentException(UpperCasePipe, value);
    }
    return StringWrapper.toUpperCase(value);
  }
}
