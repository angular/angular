import {isBlank, isPresent, CONST, Json} from 'angular2/src/facade/lang';
import {Pipe, PipeFactory} from './pipe';

// HACK: workaround for Traceur behavior.
// It expects all transpiled modules to contain this marker.
// TODO: remove this when we no longer use traceur
export var __esModule = true;


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
 *
 * @exportedAs angular2/pipes
 */
export class JsonPipe extends Pipe {
  _latestRef: any;
  _latestValue: any;
  constructor() {
    super();
    this._latestRef = null;
    this._latestValue = null;
  }

  onDestroy(): void {
    if (isPresent(this._latestValue)) {
      this._latestRef = null;
      this._latestValue = null;
    }
  }

  supports(obj): boolean { return true; }

  transform(value): any {
    if (value === this._latestRef) {
      return this._latestValue;
    } else {
      return this._prettyPrint(value);
    }
  }

  _prettyPrint(value) {
    this._latestRef = value;
    this._latestValue = Json.stringify(value);
    return this._latestValue;
  }
}

/**
 * Provides a factory for [JsonPipeFactory].
 *
 * @exportedAs angular2/pipes
 */
@CONST()
export class JsonPipeFactory extends PipeFactory {
  constructor() { super(); }

  supports(obj): boolean { return true; }

  create(cdRef): Pipe { return new JsonPipe(); }
}
