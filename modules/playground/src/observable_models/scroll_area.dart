library benchmarks.src.naive_infinite_scroll.scroll_area;

import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/math.dart" show Math;
import "package:angular2/angular2.dart" show Component, Directive, View, ChangeDetectionStrategy;
import "common.dart"
    show
        Offering,
        ITEMS,
        ITEM_HEIGHT,
        VISIBLE_ITEMS,
        VIEW_PORT_HEIGHT,
        ROW_WIDTH,
        HEIGHT;
import "random_data.dart" show generateOfferings;
import "scroll_item.dart" show ScrollItemComponent;
import "package:angular2/common.dart" show NgFor;

@Component(selector: "scroll-area", changeDetection: ChangeDetectionStrategy.OnPushObserve)
@View(directives: const [ScrollItemComponent, NgFor], template: '''
    <div>
        <div id="scrollDiv"
             [style.height.px]="viewPortHeight"
             style="width: 1000px; border: 1px solid #000; overflow: scroll"
             on-scroll="onScroll(\$event)">
            <div id="padding"></div>
            <div id="inner">
                <scroll-item
                    template="ng-for #item of visibleItems"
                    [offering]="item">
                </scroll-item>
            </div>
        </div>
    </div>''')
class ScrollAreaComponent {
  List<Offering> _fullList;
  List<Offering> visibleItems;
  num viewPortHeight;
  var paddingDiv;
  var innerDiv;
  ScrollAreaComponent() {
    this._fullList = generateOfferings(ITEMS);
    this.visibleItems = [];
    this.viewPortHeight = VIEW_PORT_HEIGHT;
    this.onScroll(null);
  }
  onScroll(evt) {
    var scrollTop = 0;
    if (evt != null) {
      var scrollDiv = evt.target;
      if (this.paddingDiv == null) {
        this.paddingDiv = scrollDiv.querySelector("#padding");
      }
      if (this.innerDiv == null) {
        this.innerDiv = scrollDiv.querySelector("#inner");
        this.innerDiv.style.setProperty("width", '''${ ROW_WIDTH}px''');
      }
      scrollTop = scrollDiv.scrollTop;
    }
    var iStart = Math.floor(scrollTop / ITEM_HEIGHT);
    var iEnd = Math.min(iStart + VISIBLE_ITEMS + 1, this._fullList.length);
    var padding = iStart * ITEM_HEIGHT;
    if (this.innerDiv != null) {
      this.innerDiv.style.setProperty("height", '''${ HEIGHT - padding}px''');
    }
    if (this.paddingDiv != null) {
      this.paddingDiv.style.setProperty("height", '''${ padding}px''');
    }
    this.visibleItems = ListWrapper.slice(this._fullList, iStart, iEnd);
  }
}
