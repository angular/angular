import {ListWrapper, MapWrapper, List} from 'angular2/src/core/facade/collection';

import * as viewModule from './view';

export class DomViewContainer {
  // The order in this list matches the DOM order.
  views: List<viewModule.DomView> = [];
}
