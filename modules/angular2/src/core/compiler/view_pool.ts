import {Inject, Injectable, OpaqueToken} from 'angular2/di';

import {ListWrapper, MapWrapper, Map, List} from 'angular2/src/facade/collection';
import {isPresent, isBlank, CONST_EXPR} from 'angular2/src/facade/lang';

import * as viewModule from './view';

export const APP_VIEW_POOL_CAPACITY = CONST_EXPR(new OpaqueToken('AppViewPool.viewPoolCapacity'));

@Injectable()
export class AppViewPool {
  _poolCapacityPerProtoView: number;
  _pooledViewsPerProtoView: Map<viewModule.AppProtoView, List<viewModule.AppView>> =
      MapWrapper.create();

  constructor(@Inject(APP_VIEW_POOL_CAPACITY) poolCapacityPerProtoView) {
    this._poolCapacityPerProtoView = poolCapacityPerProtoView;
  }

  getView(protoView: viewModule.AppProtoView): viewModule.AppView {
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isPresent(pooledViews) && pooledViews.length > 0) {
      return ListWrapper.removeLast(pooledViews);
    }
    return null;
  }

  returnView(view: viewModule.AppView): boolean {
    var protoView = view.proto;
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isBlank(pooledViews)) {
      pooledViews = [];
      MapWrapper.set(this._pooledViewsPerProtoView, protoView, pooledViews);
    }
    var haveRemainingCapacity = pooledViews.length < this._poolCapacityPerProtoView;
    if (haveRemainingCapacity) {
      ListWrapper.push(pooledViews, view);
    }
    return haveRemainingCapacity;
  }
}
