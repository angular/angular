/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Provider} from '@angular/core';

import {NgClass} from './ng_class';
import {NgFor} from './ng_for';
import {NgIf} from './ng_if';
import {NgPlural, NgPluralCase} from './ng_plural';
import {NgStyle} from './ng_style';
import {NgSwitch, NgSwitchCase, NgSwitchDefault} from './ng_switch';
import {NgTemplateOutlet} from './ng_template_outlet';

export {
  NgClass,
  NgFor,
  NgIf,
  NgPlural,
  NgPluralCase,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgTemplateOutlet
};

/**
 * A collection of Angular directives that are likely to be used in each and every Angular
 * application.
 */
export const COMMON_DIRECTIVES: Provider[] = [
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  NgPlural,
  NgPluralCase,
];
