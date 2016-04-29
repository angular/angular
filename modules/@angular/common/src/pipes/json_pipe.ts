import {Injectable, PipeTransform, WrappedValue, Pipe} from '@angular/core';
import {Json} from '../../src/facade/lang';


/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
/* @ts2dart_const */
@Pipe({name: 'json', pure: false})
@Injectable()
export class JsonPipe implements PipeTransform {
  transform(value: any): string { return Json.stringify(value); }
}
