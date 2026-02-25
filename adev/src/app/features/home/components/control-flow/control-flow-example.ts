/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {CodeBlock} from '../code-block/code-block';

@Component({
  selector: 'adev-control-flow-example',
  imports: [RouterLink, CodeBlock],
  templateUrl: './control-flow-example.html',
  styleUrls: ['./control-flow-example.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ControlFlowExample {
  Example = example;
}

const example = `
@if(meal() === 'burger') {
  <p>Siz burger seçdiniz!</p>
} @else if(meal() === 'pizza') {
  <p>Siz pizza seçdiniz!</p>
} @else {
  <p>Zəhmət olmasa, bir yemək seçin.</p>
}

@for(item of ShoppingList; track $index) {
  <p>{{ item }}</p>
}

@switch(user.role) {
  @case('user') {
    <p>Xoş gəldiniz, {{user.name}}</p>
  }
  @case('moderator')
  @case('admin') {
    <p>Xoş gəldiniz</p>
  }

  @default {
    <p>Xoş gəldiniz, qonaq!</p>
  }
}
`.trim();
