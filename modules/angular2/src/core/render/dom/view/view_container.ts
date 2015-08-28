import {ListWrapper, MapWrapper} from 'angular2/src/core/facade/collection';

import * as viewModule from './view';

export class DomViewContainer {
  // The order in this list matches the DOM order.
  views: Array<viewModule.DomView> = [];
}
