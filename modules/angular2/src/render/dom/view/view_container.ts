import {ListWrapper, MapWrapper, List} from 'angular2/src/facade/collection';

import * as viewModule from './view';

export class DomViewContainer {
  // The order in this list matches the DOM order.
  views: List<viewModule.DomView> = [];

  contentTagContainers() { return this.views; }

  nodes(): List</*node*/ any> {
    var r = [];
    for (var i = 0; i < this.views.length; ++i) {
      r = ListWrapper.concat(r, this.views[i].rootNodes);
    }
    return r;
  }
}
