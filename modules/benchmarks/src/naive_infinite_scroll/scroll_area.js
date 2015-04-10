import {int, FINAL} from 'angular2/src/facade/lang';
import {reflector} from 'angular2/src/reflection/reflection';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';
import {Component, Viewport, View, ViewContainer, Compiler}
    from 'angular2/angular2';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Math} from 'angular2/src/facade/math';

import {Offering, ITEMS, ITEM_HEIGHT, VISIBLE_ITEMS, VIEW_PORT_HEIGHT,
    ROW_WIDTH, HEIGHT} from './common';
import {generateOfferings} from './random_data';
import {ScrollItemComponent} from './scroll_item';
import {For} from 'angular2/directives';

@Component({
  selector: 'scroll-area',
})
@View({
  directives: [ScrollItemComponent, For],
  template: `
    <div>
        <div id="scrollDiv"
             [style]="scrollDivStyle"
             on-scroll="onScroll($event)">
            <div id="padding"></div>
            <div id="inner">
                <scroll-item
                    template="for #item of visibleItems"
                    [offering]="item">
                </scroll-item>
            </div>
        </div>
    </div>`
})
export class ScrollAreaComponent {
  _fullList:List<Offering>;
  visibleItems:List<Offering>;

  scrollDivStyle;
  paddingDiv;
  innerDiv;

  constructor() {
    this._fullList = generateOfferings(ITEMS);
    this.visibleItems = [];
    this.scrollDivStyle = MapWrapper.createFromPairs([
      ['height', `${VIEW_PORT_HEIGHT}px`],
      ['width', '1000px'],
      ['border', '1px solid #000'],
      ['overflow', 'scroll']
    ]);
    this.onScroll(null);
  }

  onScroll(evt) {
    var scrollTop = 0;
    if (evt != null) {
      var scrollDiv = evt.target;
      if (this.paddingDiv == null) {
        this.paddingDiv = scrollDiv.querySelector('#padding');
      }
      if (this.innerDiv == null) {
        this.innerDiv = scrollDiv.querySelector('#inner');
        this.innerDiv.style.setProperty('width', `${ROW_WIDTH}px`);
      }
      scrollTop = scrollDiv.scrollTop;
    }
    var iStart = Math.floor(scrollTop / ITEM_HEIGHT);
    var iEnd = Math.min(iStart + VISIBLE_ITEMS + 1, this._fullList.length);
    var padding = iStart * ITEM_HEIGHT;
    if (this.innerDiv != null) {
      this.innerDiv.style.setProperty('height', `${HEIGHT - padding}px`);
    }
    if (this.paddingDiv != null) {
      this.paddingDiv.style.setProperty('height', `${padding}px`);
    }
    this.visibleItems = ListWrapper.slice(this._fullList, iStart, iEnd);
  }
}
