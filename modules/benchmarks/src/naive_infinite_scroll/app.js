import {int, isPresent} from 'angular2/src/facade/lang';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';
import {Component, View} from 'angular2/angular2';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {ScrollAreaComponent} from './scroll_area';
import {If, For} from 'angular2/directives';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {document} from 'angular2/src/facade/browser';


@Component({selector: 'scroll-app'})
@View({
  directives: [ScrollAreaComponent, If, For],
  template: `
  <div>
    <div style="display: flex">
      <scroll-area id="testArea"></scroll-area>
    </div>
    <div template="if scrollAreas.length > 0">
      <p>Following tables are only here to add weight to the UI:</p>
      <scroll-area template="for #scrollArea of scrollAreas"></scroll-area>
    </div>
  </div>`
})
export class App {
  scrollAreas:List<int>;
  iterationCount:int;
  scrollIncrement:int;

  constructor() {
    var appSize = getIntParameter('appSize');
    this.iterationCount = getIntParameter('iterationCount');
    this.scrollIncrement = getIntParameter('scrollIncrement');
    appSize = appSize > 1 ? appSize - 1 : 0;  // draw at least one table
    this.scrollAreas = [];
    for (var i = 0; i < appSize; i++) {
      ListWrapper.push(this.scrollAreas, i);
    }
    bindAction('#run-btn', () => {
      this.runBenchmark();
    });
    bindAction('#reset-btn', () => {
      this._getScrollDiv().scrollTop = 0;
      var existingMarker = this._locateFinishedMarker();
      if (isPresent(existingMarker)) {
        DOM.removeChild(document.body, existingMarker);
      }
    });
  }

  runBenchmark() {
    var scrollDiv = this._getScrollDiv();
    var n:int = this.iterationCount;
    var scheduleScroll;
    scheduleScroll = () => {
      PromiseWrapper.setTimeout(() => {
        scrollDiv.scrollTop += this.scrollIncrement;
        n--;
        if (n > 0) {
          scheduleScroll();
        } else {
          this._scheduleFinishedMarker();
        }
      }, 0);
    }
    scheduleScroll();
  }

  // Puts a marker indicating that the test is finished.
  _scheduleFinishedMarker() {
    var existingMarker = this._locateFinishedMarker();
    if (isPresent(existingMarker)) {
      // Nothing to do, the marker is already there
      return;
    }
    PromiseWrapper.setTimeout(() => {
      var finishedDiv = DOM.createElement('div');
      finishedDiv.id = 'done';
      DOM.setInnerHTML(finishedDiv, 'Finished');
      DOM.appendChild(document.body, finishedDiv);
    }, 0);
  }

  _locateFinishedMarker() {
    return DOM.querySelector(document.body, '#done');
  }

  _getScrollDiv() {
    return DOM.query('body /deep/ #testArea /deep/ #scrollDiv');
  }
}
