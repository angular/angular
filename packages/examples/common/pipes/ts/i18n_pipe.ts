/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {I18nPluralPipe, I18nSelectPipe} from '@angular/common';

// #docregion I18nPluralPipeComponent
@Component({
  selector: 'i18n-plural-pipe',
  imports: [I18nPluralPipe],
  template: `<div>{{ messages.length | i18nPlural: messageMapping }}</div>`,
})
export class I18nPluralPipeComponent {
  messages: any[] = ['Message 1'];
  messageMapping: {[k: string]: string} = {
    '=0': 'No messages.',
    '=1': 'One message.',
    'other': '# messages.',
  };
}
// #enddocregion

// #docregion I18nSelectPipeComponent
@Component({
  selector: 'i18n-select-pipe',
  imports: [I18nSelectPipe],
  template: `<div>{{ gender | i18nSelect: inviteMap }}</div>`,
})
export class I18nSelectPipeComponent {
  gender: string = 'male';
  inviteMap: any = {'male': 'Invite him.', 'female': 'Invite her.', 'other': 'Invite them.'};
}
//#enddocregion
