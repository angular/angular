/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgIf, NgTemplateOutlet} from '@angular/common';
import {Component, enableProdMode, Input} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';

@Component({
  selector: 'deep',
  standalone: true,
  imports: [NgIf],
  template: `<deep *ngIf="depth > 1" [depth]="depth - 1" /> Level: {{ depth }}`,
})
class Deep {
  @Input({required: true}) depth!: number;
}

@Component({
  selector: 'app-component',
  standalone: true,
  imports: [NgTemplateOutlet, Deep],
  template: `
    <button id="swapOutFull" (click)="swapOutFull()">Swap out full context</button>
    <button id="modifyProperty" (click)="modifyProperty()">Modify property</button>
    <button id="modifyDeepProperty" (click)="modifyDeepProperty()">Modify deep property</button>
    <button id="addNewProperty" (click)="addNewProperty()">Add new property</button>

    <ng-template #templateRef let-implicit let-a="a" let-b="b" let-deep="deep" let-new="new">
      <p>Implicit: {{ implicit }}</p>
      <p>A: {{ a }}</p>
      <p>B: {{ b }}</p>
      <p>Deep: {{ deep.next.text }}</p>
      <p>New: {{ new }}</p>

      <deep [depth]="20" />
    </ng-template>

    <div>
      <p>Outlet</p>
      <ng-template [ngTemplateOutlet]="templateRef" [ngTemplateOutletContext]="context" />
    </div>
  `,
})
class AppComponent {
  context: {
    $implicit: unknown;
    a: unknown;
    b: unknown;
    deep: {next: {text: unknown}};
    new?: unknown;
  } = {
    $implicit: 'Default Implicit',
    a: 'Default A',
    b: 'Default B',
    deep: {next: {text: 'Default deep text'}},
  };

  swapOutFull() {
    this.context = {
      $implicit: 'New Implicit new Object',
      a: 'New A new Object',
      b: 'New B new Object',
      deep: {next: {text: 'New Deep text new Object'}},
    };
  }

  modifyProperty() {
    this.context.a = 'Modified a';
  }

  modifyDeepProperty() {
    this.context.deep.next.text = 'Modified deep a';
  }

  addNewProperty() {
    this.context.new = 'New property set';
  }
}

enableProdMode();
bootstrapApplication(AppComponent);
