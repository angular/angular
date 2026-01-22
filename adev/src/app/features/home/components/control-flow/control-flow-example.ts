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
  <p>You selected a burger!</p>
} @else if(lang meal === 'pizza') {
  <p>You selected a pizza!</p>
} @else {
  <p>Please select a meal.</p>
}

@for(item of ShoppingList; track $index) {
  <p>{{ item }}</p>
}

@switch(user.role) {
  @case('user') {
    <p>Welcome, {{user.name}}</p>
  }
  @case('moderator')
  @case('admin') {
    <p>Welcome</p>
  }

  @default {
    <p>Welcome, guest!</p>
  }
}
`.trim();
