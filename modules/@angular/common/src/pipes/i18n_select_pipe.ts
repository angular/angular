import {Injectable, PipeTransform, Pipe} from '@angular/core';
import {isStringMap} from '@angular/facade/lang';
import {StringMapWrapper} from '@angular/facade/collection';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

/**
 *
 *  Generic selector that displays the string that matches the current value.
 *
 *  ## Usage
 *
 *  expression | i18nSelect:mapping
 *
 *  where `mapping` is an object that indicates the text that should be displayed
 *  for different values of the provided `expression`.
 *
 *  ## Example
 *
 *  ```
 *  <div>
 *    {{ gender | i18nSelect: inviteMap }}
 *  </div>
 *
 *  class MyApp {
 *    gender: string = 'male';
 *    inviteMap: any = {
 *      'male': 'Invite her.',
 *      'female': 'Invite him.',
 *      'other': 'Invite them.'
 *    }
 *    ...
 *  }
 *  ```
 */
/* @ts2dart_const */
@Pipe({name: 'i18nSelect', pure: true})
@Injectable()
export class I18nSelectPipe implements PipeTransform {
  transform(value: string, args: any[] = null): string {
    var mapping: {[key: string]: string} = <{[count: string]: string}>(args[0]);
    if (!isStringMap(mapping)) {
      throw new InvalidPipeArgumentException(I18nSelectPipe, mapping);
    }

    return StringMapWrapper.contains(mapping, value) ? mapping[value] : mapping['other'];
  }
}
