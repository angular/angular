import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';

import * as viewModule from './view';

export class DomViewContainer {
  views: List<viewModule.DomView>;

  constructor() {
    // The order in this list matches the DOM order.
    this.views = [];
  }

  contentTagContainers() {
    return this.views;
  }

  nodes():List {
    var r = [];
    for (var i = 0; i < this.views.length; ++i) {
      r = ListWrapper.concat(r, this.views[i].rootNodes);
    }
    return r;
  }

}
