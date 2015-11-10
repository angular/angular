library angular2.src.web_workers.shared.render_proto_view_ref_store;

import "package:angular2/src/core/di.dart" show Injectable, Inject;
import "package:angular2/src/core/render/api.dart" show RenderProtoViewRef;
import "package:angular2/src/web_workers/shared/api.dart" show ON_WEB_WORKER;

@Injectable()
class RenderProtoViewRefStore {
  Map<num, RenderProtoViewRef> _lookupByIndex =
      new Map<num, RenderProtoViewRef>();
  Map<RenderProtoViewRef, num> _lookupByProtoView =
      new Map<RenderProtoViewRef, num>();
  num _nextIndex = 0;
  bool _onWebworker;
  RenderProtoViewRefStore(@Inject(ON_WEB_WORKER) onWebworker) {
    this._onWebworker = onWebworker;
  }
  RenderProtoViewRef allocate() {
    var index = this._nextIndex++;
    var result = new WebWorkerRenderProtoViewRef(index);
    this.store(result, index);
    return result;
  }

  void store(RenderProtoViewRef ref, num index) {
    this._lookupByProtoView[ref] = index;
    this._lookupByIndex[index] = ref;
  }

  RenderProtoViewRef deserialize(num index) {
    if (index == null) {
      return null;
    }
    return this._lookupByIndex[index];
  }

  num serialize(RenderProtoViewRef ref) {
    if (ref == null) {
      return null;
    }
    if (this._onWebworker) {
      return ((ref as WebWorkerRenderProtoViewRef)).refNumber;
    } else {
      return this._lookupByProtoView[ref];
    }
  }
}

class WebWorkerRenderProtoViewRef extends RenderProtoViewRef {
  num refNumber;
  WebWorkerRenderProtoViewRef(this.refNumber) : super() {
    /* super call moved to initializer */;
  }
}
