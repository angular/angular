import {Injectable, PipeTransform, WrappedValue, Pipe} from '@angular/core';
import {Json, CONST} from '../../facade/lang';


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
