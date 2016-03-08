import {isPresent} from 'angular2/src/facade/lang';
import {getIntParameter, bindAction} from 'angular2/src/testing/benchmark_util';
import {TimerWrapper} from 'angular2/src/facade/async';
import {ScrollAreaComponent} from './scroll_area';
import {NgIf, NgFor} from 'angular2/common';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {document} from 'angular2/src/facade/browser';

import {Component, Directive} from 'angular2/core';


@Component({
  selector: 'scroll-app',
  directives: [ScrollAreaComponent, NgIf, NgFor],
  template: `
  <div>
    <div style="display: flex">
      <scroll-area id="testArea"></scroll-area>
    </div>
    <div template="ngIf scrollAreas.length > 0">
      <p>Following tables are only here to add weight to the UI:</p>
      <scroll-area template="ngFor #scrollArea of scrollAreas"></scroll-area>
    </div>
  </div>`
})
export class App {
  scrollAreas: number[];
  iterationCount: number;
  scrollIncrement: number;

  constructor() {
    var appSize = getIntParameter('appSize');
    this.iterationCount = getIntParameter('iterationCount');
    this.scrollIncrement = getIntParameter('scrollIncrement');
    appSize = appSize > 1 ? appSize - 1 : 0;  // draw at least one table
    this.scrollAreas = [];
    for (var i = 0; i < appSize; i++) {
      this.scrollAreas.push(i);
    }
    bindAction('#run-btn', () => { this.runBenchmark(); });
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
    var n: number = this.iterationCount;
    var scheduleScroll;
    scheduleScroll = () => {
      TimerWrapper.setTimeout(() => {
        scrollDiv.scrollTop += this.scrollIncrement;
        n--;
        if (n > 0) {
          scheduleScroll();
        } else {
          this._scheduleFinishedMarker();
        }
      }, 0);
    };
    scheduleScroll();
  }

  // Puts a marker indicating that the test is finished.
  _scheduleFinishedMarker() {
    var existingMarker = this._locateFinishedMarker();
    if (isPresent(existingMarker)) {
      // Nothing to do, the marker is already there
      return;
    }
    TimerWrapper.setTimeout(() => {
      var finishedDiv = DOM.createElement('div');
      finishedDiv.id = 'done';
      DOM.setInnerHTML(finishedDiv, 'Finished');
      DOM.appendChild(document.body, finishedDiv);
    }, 0);
  }

  _locateFinishedMarker() { return DOM.querySelector(document.body, '#done'); }

  _getScrollDiv() { return DOM.query('body /deep/ #scrollDiv'); }
}
