import {Inject, OpaqueToken} from 'angular2/di';
import {ListWrapper, MapWrapper, Map, List} from 'angular2/src/facade/collection';
import {isPresent, isBlank} from 'angular2/src/facade/lang';

import {RenderView} from './view';
import {RenderProtoView} from './proto_view';


// TODO(tbosch): Make this an OpaqueToken as soon as our transpiler supports this!
export const RENDER_VIEW_POOL_CAPACITY = 'RenderViewPool.viewPoolCapacity';

// Attention: keep this class in sync with AppViewPool!
export class RenderViewPool {
  _poolCapacityPerProtoView:number;
  _pooledViewsPerProtoView:Map<RenderProtoView, List<RenderView>>;

  constructor(@Inject(RENDER_VIEW_POOL_CAPACITY) poolCapacityPerProtoView) {
    this._poolCapacityPerProtoView = poolCapacityPerProtoView;
    this._pooledViewsPerProtoView = MapWrapper.create();
  }

  getView(protoView:RenderProtoView):RenderView {
    var pooledViews = MapWrapper.get(this._pooledViewsPerProtoView, protoView);
    if (isPresent(pooledViews) && pooledViews.length > 0) {
      return ListWrapper.removeLast(pooledViews);
    }
    return null;
  }

  returnView(view:RenderView) {
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
