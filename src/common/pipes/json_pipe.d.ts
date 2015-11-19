import { PipeTransform } from 'angular2/src/core/change_detection';
/**
 * Transforms any input value using `JSON.stringify`. Useful for debugging.
 *
 * ### Example
 * {@example core/pipes/ts/json_pipe/json_pipe_example.ts region='JsonPipe'}
 */
export declare class JsonPipe implements PipeTransform {
    transform(value: any, args?: any[]): string;
}
