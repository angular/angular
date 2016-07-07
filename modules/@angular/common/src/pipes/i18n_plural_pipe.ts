/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Pipe, PipeTransform} from '@angular/core';
import {StringWrapper, isBlank, isStringMap} from '../facade/lang';
import {NgLocalization, getPluralCategory} from '../localization';
import {InvalidPipeArgumentException} from './invalid_pipe_argument_exception';

const _INTERPOLATION_REGEXP: RegExp = /#/g;

/**
 *  Maps a value to a string that pluralizes the value properly.
 *
 *  ## Usage
 *
 *  expression | i18nPlural:mapping
 *
 *  where `expression` is a number and `mapping` is an object that mimics the ICU format,
 *  see http://userguide.icu-project.org/formatparse/messages
 *
 *  ## Example
 *
 *  ```
 *  class MyLocalization extends NgLocalization {
 *    getPluralCategory(value: any) {
 *      if(value > 1) {
 *        return 'other';
 *      }
 *    }
 *  }
 *
 *  @Component({
 *    selector: 'app',
 *    template: `
 *      <div>
 *        {{ messages.length | i18nPlural: messageMapping }}
 *      </div>
 *    `,
 *    providers: [{provide: NgLocalization, useClass: MyLocalization}]
 *  })
 *
 *  class MyApp {
 *    messages: any[];
 *    messageMapping: {[k:string]: string} = {
 *      '=0': 'No messages.',
 *      '=1': 'One message.',
 *      'other': '# messages.'
 *    }
 *    ...
 *  }
 *  ```
 *
 * @experimental
 */
@Pipe({name: 'i18nPlural', pure: true})
export class I18nPluralPipe implements PipeTransform {
  constructor(private _localization: NgLocalization) {}

  transform(value: number, pluralMap: {[count: string]: string}): string {
    if (isBlank(value)) return '';

    if (!isStringMap(pluralMap)) {
      throw new InvalidPipeArgumentException(I18nPluralPipe, pluralMap);
    }

    const key = getPluralCategory(value, Object.getOwnPropertyNames(pluralMap), this._localization);

    return StringWrapper.replaceAll(pluralMap[key], _INTERPOLATION_REGEXP, value.toString());
  }
}
