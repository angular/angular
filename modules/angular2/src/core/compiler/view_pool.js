import {ListWrapper, MapWrapper, StringMapWrapper, List} from 'angular2/src/facade/collection';
import * as viewModule from './view';

export class ViewPool {
  _views: List<viewModule.View>;
  _capacity: number;
  constructor(capacity: number) {
    this._views = [];
    this._capacity = capacity;
  }

  pop(): viewModule.View {
    return ListWrapper.isEmpty(this._views) ? null : ListWrapper.removeLast(this._views);
  }

  push(view: viewModule.View) {
    if (this._views.length < this._capacity) {
      ListWrapper.push(this._views, view);
    }
  }

  length() {
    return this._views.length;
  }
}

