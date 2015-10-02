import {isString, StringWrapper, CONST, isBlank} from 'angular2/src/core/facade/lang';
import {Pipe} from 'angular2/src/core/metadata';
import {Injectable} from 'angular2/src/core/di';
import {PipeTransform, WrappedValue} from 'angular2/src/core/change_detection';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

/**
 * Implements uppercase transforms to text.
 *
 * # Example
 *
 * In this example we change use text case to upper case
 *
 *  ```
 * import {Component, View, UpperCasePipe} from 'angular2/angular2'
 * 
 * @Component({
 *   selector: "username-cmp"
 * })
 * @View({
 *   template: "Username: {{ user | uppercase }}",
 *   pipes: [UpperCasePipe]
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
