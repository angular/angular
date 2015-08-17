import {isString, StringWrapper, CONST, isBlank} from 'angular2/src/facade/lang';
import {Injectable} from 'angular2/di';

import {PipeTransform, WrappedValue} from 'angular2/change_detection';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';


import {Pipe} from 'angular2/src/core/annotations/decorators';

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
 * @BaseView({
 *   template: "Username: {{ user | lowercase }}"
 * })
 * class Username {
 *   user:string;
 * }
 *
 * ```
 */
@CONST()
@Pipe({name: 'lowercase'})
@Injectable()
export class LowerCasePipe implements PipeTransform {
  transform(value: string, args: List<any> = null): string {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentException(LowerCasePipe, value);
    }
    return StringWrapper.toLowerCase(value);
  }
}
