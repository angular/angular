library angular2.src.core.linker.view_pool;

import "package:angular2/src/core/di.dart" show Inject, Injectable, OpaqueToken;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/facade/collection.dart" show MapWrapper, Map;
import "view.dart" as viewModule;

const APP_VIEW_POOL_CAPACITY =
    const OpaqueToken("AppViewPool.viewPoolCapacity");

@Injectable()
class AppViewPool {
  /** @internal */
  num _poolCapacityPerProtoView;
  /** @internal */
  var _pooledViewsPerProtoView =
      new Map<viewModule.AppProtoView, List<viewModule.AppView>>();
  AppViewPool(@Inject(APP_VIEW_POOL_CAPACITY) poolCapacityPerProtoView) {
    this._poolCapacityPerProtoView = poolCapacityPerProtoView;
  }
  viewModule.AppView getView(viewModule.AppProtoView protoView) {
    var pooledViews = this._pooledViewsPerProtoView[protoView];
    if (isPresent(pooledViews) && pooledViews.length > 0) {
      return pooledViews.removeLast();
    }
    return null;
  }

  bool returnView(viewModule.AppView view) {
    var protoView = view.proto;
    var pooledViews = this._pooledViewsPerProtoView[protoView];
    if (isBlank(pooledViews)) {
      pooledViews = [];
      this._pooledViewsPerProtoView[protoView] = pooledViews;
    }
    var haveRemainingCapacity =
        pooledViews.length < this._poolCapacityPerProtoView;
    if (haveRemainingCapacity) {
      pooledViews.add(view);
    }
    return haveRemainingCapacity;
  }
}
