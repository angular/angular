/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Component, Input} from '@angular/core';

@Component({
  selector: 'class-bindings',
  template: `
  <div>
  <p>{{ msg }}</p>
  <div *ngFor="let obj of list; let i = index" [title]="msg + i">
    <span [class]="msg">{{ obj.text }}</span>
    <span class="baz">one</span>
    <span class="qux">two</span>
    <div>
      <span class="qux">three</span>
      <span class="qux">four</span>
      <span class="baz">five</span>
      <div>
        <span class="qux">six</span>
        <span class="baz">seven</span>
        <span [class]="msg">eight</span>
      </div>
    </div>
  </div>
</div>
  `
})
export class ClassBindingsComponent {
  @Input() msg: string = '';
  @Input() list: string[]|null = null;
}
