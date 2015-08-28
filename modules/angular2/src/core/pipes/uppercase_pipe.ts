import {isString, StringWrapper, CONST, isBlank} from 'angular2/src/core/facade/lang';
import {Injectable} from 'angular2/di';

import {PipeTransform, WrappedValue} from 'angular2/change_detection';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

import {Pipe} from '../metadata';

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
@Pipe({name: 'uppercase'})
@Injectable()
export class UpperCasePipe implements PipeTransform {
  transform(value: string, args: any[] = null): string {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentException(UpperCasePipe, value);
    }
    return StringWrapper.toUpperCase(value);
  }
}
