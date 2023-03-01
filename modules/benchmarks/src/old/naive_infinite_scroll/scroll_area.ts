/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgFor} from '@angular/common';
import {Component, Directive} from '@angular/core';

import {HEIGHT, ITEM_HEIGHT, ITEMS, Offering, ROW_WIDTH, VIEW_PORT_HEIGHT, VISIBLE_ITEMS} from './common';
import {generateOfferings} from './random_data';
import {ScrollItemComponent} from './scroll_item';

@Component({
  selector: 'scroll-area',
  directives: [ScrollItemComponent, NgFor],
  template: `
    <div>
        <div id="scrollDiv"
             [style.height.px]="viewPortHeight"
             style="width: 1000px; border: 1px solid #000; overflow: scroll"
             on-scroll="onScroll($event)">
            <div id="padding"></div>
            <div id="inner">
                <scroll-item
                    *ngFor="let item of visibleItems"
                    [offering]="item">
                </scroll-item>
            </div>
        </div>
    </div>`
})
export class ScrollAreaComponent {
  private _fullList: Offering[];
  visibleItems: Offering[];

  viewPortHeight: number;
  paddingDiv;
  innerDiv;

  constructor() {
    this._fullList = generateOfferings(ITEMS);
    this.visibleItems = [];
    this.viewPortHeight = VIEW_PORT_HEIGHT;
    this.onScroll(null);
  }

  onScroll(evt) {
    let scrollTop = 0;
    if (evt != null) {
      const scrollDiv = evt.target;
      if (this.paddingDiv == null) {
        this.paddingDiv = scrollDiv.querySelector('#padding');
      }
      if (this.innerDiv == null) {
        this.innerDiv = scrollDiv.querySelector('#inner');
        this.innerDiv.style.setProperty('width', `${ROW_WIDTH}px`);
      }
      scrollTop = scrollDiv.scrollTop;
    }
    const iStart = Math.floor(scrollTop / ITEM_HEIGHT);
    const iEnd = Math.min(iStart + VISIBLE_ITEMS + 1, this._fullList.length);
    const padding = iStart * ITEM_HEIGHT;
    if (this.innerDiv != null) {
      this.innerDiv.style.setProperty('height', `${HEIGHT - padding}px`);
    }
    if (this.paddingDiv != null) {
      this.paddingDiv.style.setProperty('height', `${padding}px`);
    }
    this.visibleItems = this._fullList.slice(iStart, iEnd);
  }
}
