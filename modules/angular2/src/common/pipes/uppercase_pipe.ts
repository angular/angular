import {isString, CONST, isBlank} from 'angular2/src/facade/lang';
import {PipeTransform, WrappedValue, Injectable, Pipe} from 'angular2/core';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

/**
 * Implements uppercase transforms to text.
 *
 * ### Example
 *
 * {@example core/pipes/ts/lowerupper_pipe/lowerupper_pipe_example.ts region='LowerUpperPipe'}
 */
@CONST()
@Pipe({name: 'uppercase'})
@Injectable()
export class UpperCasePipe implements PipeTransform {
  transform(value: string): string {
    if (isBlank(value)) return value;
    if (!isString(value)) {
      throw new InvalidPipeArgumentException(UpperCasePipe, value);
    }
    return value.toUpperCase();
  }
}
