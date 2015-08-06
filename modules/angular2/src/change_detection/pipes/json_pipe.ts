import {isBlank, isPresent, Json, CONST} from 'angular2/src/facade/lang';
import {Injectable} from 'angular2/di';
import {Pipe, BasePipe} from './pipe';

/**
 * Implements json transforms to any object.
 *
 * # Example
 *
 * In this example we transform the user object to json.
 *
 *  ```
 * @Component({
 *   selector: "user-cmp"
 * })
 * @View({
 *   template: "User: {{ user | json }}"
 * })
 * class Username {
 *  user:Object
 *  constructor() {
 *    this.user = { name: "PatrickJS" };
 *  }
 * }
 *
 * ```
 */
@CONST()
@Injectable()
export class JsonPipe extends BasePipe {
  transform(value: any, args: List<any> = null): string { return Json.stringify(value); }
}
