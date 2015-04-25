import {Inject, OpaqueToken} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, List} from 'angular2/src/facade/collection';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

import * as viewModule from './view';


// TODO(tbosch): Make this an OpaqueToken as soon as our transpiler supports this!
export const APP_VIEW_POOL_CAPACITY = 'AppViewPool.viewPoolCapacity';

export class AppViewPool {
  _poolCapacityPerProtoView:number;
  _pooledViewsPerProtoView:Map<viewModule.AppProtoView, List<viewModule.AppView>>;

  constructor(@Inject(APP_VIEW_POOL_CAPACITY) poolCapacityPerProtoView) {
    this._poolCapacityPerProtoView = poolCapacityPerProtoView;
    this._pooledViewsPerProtoView = MapWrapper.create();
  }

  getView(protoView:viewModule.AppProtoView):viewModule.AppView {
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isPresent(pooledViews) && pooledViews.length > 0) {
      return ListWrapper.removeLast(pooledViews);
    }
    return null;
  }

  returnView(view:viewModule.AppView) {
    var protoView = view.proto;
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isBlank(pooledViews)) {
      pooledViews = [];
      MapWrapper.set(this._pooledViewsPerProtoView, protoView, pooledViews);
    }
    if (pooledViews.length < this._poolCapacityPerProtoView) {
      ListWrapper.push(pooledViews, view);
    }
  }

}