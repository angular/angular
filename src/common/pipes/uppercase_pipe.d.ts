import { PipeTransform } from 'angular2/core';
/**
 * Implements uppercase transforms to text.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 */
export declare class UpperCasePipe implements PipeTransform {
    transform(value: string, args?: any[]): string;
}
