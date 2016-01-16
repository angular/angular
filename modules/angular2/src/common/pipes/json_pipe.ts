import {isBlank, isPresent, Json, CONST} from 'angular2/src/facade/lang';
import {Injectable, PipeTransform, WrappedValue, Pipe} from 'angular2/core';

/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
@CONST()
@Pipe({name: 'json', pure: false})
@Injectable()
export class JsonPipe implements PipeTransform {
  transform(value: any, args: any[] = null): string { return Json.stringify(value); }
}
