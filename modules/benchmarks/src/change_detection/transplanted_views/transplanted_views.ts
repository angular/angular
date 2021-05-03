/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgModule, TemplateRef, ViewChild} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {newArray} from '../util';

@Component({
  selector: 'insertion-component',
  template: `
    <ng-container *ngFor="let n of views; template: template; trackBy: trackByIndex"></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsertionComponent {
  @Input() template !: TemplateRef<{}>;
  views: any[] = [];
  @Input()
  set viewCount(n: number) {
    this.views = n > 0 ? newArray<any>(n) : [];
  }

  constructor(readonly changeDetector: ChangeDetectorRef) {}

  // use trackBy to ensure profile isn't affected by the cost to refresh ngFor.
  trackByIndex(index: number, item: any) {
    return index;
  }
}

@Component({
  selector: 'declaration-component',
  template: `
  <ng-template #template>{{trackTemplateRefresh()}}</ng-template>
  <insertion-component [template]="template" [viewCount]="viewCount"></insertion-component>
  `,
})
export class DeclarationComponent {
  @Input() viewCount = 1;
  @ViewChild(InsertionComponent) insertionComponent!: InsertionComponent;
  // Tracks number of times the template was executed to ensure it was updated during CD.
  templateRefreshCount = 0;

  trackTemplateRefresh() {
    this.templateRefreshCount++;
    return this.templateRefreshCount;
  }
}

@NgModule({
  declarations: [DeclarationComponent, InsertionComponent],
  bootstrap: [DeclarationComponent],
  imports: [BrowserModule]
})
export class TransplantedViewsModule {
}
