import {Inject, Injectable, OpaqueToken} from 'angular2/di';

import {ListWrapper, MapWrapper, Map} from 'angular2/src/core/facade/collection';
import {isPresent, isBlank, CONST_EXPR} from 'angular2/src/core/facade/lang';

import * as viewModule from './view';

export const APP_VIEW_POOL_CAPACITY = CONST_EXPR(new OpaqueToken('AppViewPool.viewPoolCapacity'));

@Injectable()
export class AppViewPool {
  _poolCapacityPerProtoView: number;
  _pooledViewsPerProtoView: Map<viewModule.AppProtoView, Array<viewModule.AppView>> = new Map();

  constructor(@Inject(APP_VIEW_POOL_CAPACITY) poolCapacityPerProtoView) {
    this._poolCapacityPerProtoView = poolCapacityPerProtoView;
  }

  getView(protoView: viewModule.AppProtoView): viewModule.AppView {
    var pooledViews = this._pooledViewsPerProtoView.get(protoView);
    if (isPresent(pooledViews) && pooledViews.length > 0) {
      return ListWrapper.removeLast(pooledViews);
    }
    return null;
  }

  returnView(view: viewModule.AppView): boolean {
    var protoView = view.proto;
    var pooledViews = this._pooledViewsPerProtoView.get(protoView);
    if (isBlank(pooledViews)) {
      pooledViews = [];
      this._pooledViewsPerProtoView.set(protoView, pooledViews);
    }
    var haveRemainingCapacity = pooledViews.length < this._poolCapacityPerProtoView;
    if (haveRemainingCapacity) {
      pooledViews.push(view);
    }
    return haveRemainingCapacity;
  }
}
