/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

// #docregion CamelKebabPipe
@Component({
  selector: 'camelkebab-pipe',
  template: `<div>
    Type some texts in to the below textbox. Also input a separator in the separator char box if require.
    <label>Texts: </label> <input #texts (keyup)="change(texts.value)" type="text" value="JIT-HIL">
    <label>Separator: </label> <input #separator (keyup)="changeSeparator(separator.value)" type="text" value="-">
    <p>In camelcase: <pre>'{{value | camelcase: separator}}'</pre>
    <p>In uppercase: <pre>'{{value | kebabCase: separator}}'</pre>
  </div>`
})
export class CamelKebabPipeComponent {
  value: string = '';
  separator: string = '';
  change(value: string) { this.value = value; }
  changeSeparator(value: string) { this.separator = value; }
}
// #enddocregion
