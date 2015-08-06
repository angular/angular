import {isString, StringWrapper, CONST, isBlank} from 'angular2/src/facade/lang';
import {Injectable} from 'angular2/di';
import {Pipe, BasePipe, InvalidPipeArgumentException} from './pipe';

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
@CONST()
@Injectable()
export class LowerCasePipe extends BasePipe {
  transform(value: string, args: List<any> = null): string {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentException(LowerCasePipe, value);
    }
    return StringWrapper.toLowerCase(value);
  }
}
