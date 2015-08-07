import {isBlank, isPresent, Json, CONST} from 'angular2/src/facade/lang';
import {Injectable} from 'angular2/di';

import {PipeTransform, WrappedValue, BasePipeTransform} from 'angular2/change_detection';

import {Pipe} from 'angular2/src/core/annotations/decorators';

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
@Pipe({name: 'json'})
@Injectable()
export class JsonPipe extends BasePipeTransform {
  transform(value: any, args: List<any> = null): string { return Json.stringify(value); }
}
