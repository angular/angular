/**
 * Indicates that the result of a {@link Pipe} transformation has not changed since the last time the pipe was called.
 *
 * Suppose we have a pipe that computes changes in an array by performing a simple diff operation. If
 * we call this pipe with the same array twice, it will return `NO_CHANGE` the second time.
 *
 * @exportedAs angular2/pipes
 */

export var NO_CHANGE = new Object();

/**
 * An interface for extending the list of pipes known to Angular.
 *
 * If you are writing a custom {@link Pipe}, you must extend this interface.
 *
 * #Example
 *
 * ```
 * class DoublePipe extends Pipe {
 *  supports(obj) {
 *    return true;
 *  }
 *
 *  transform(value) {
 *    return `${value}${value}`;
 *  }
 * }
 * ```
 *
 * @exportedAs angular2/pipes
 */
export class Pipe {
  supports(obj):boolean {return false;}
  onDestroy() {}
  transform(value:any):any {return null;}
}
