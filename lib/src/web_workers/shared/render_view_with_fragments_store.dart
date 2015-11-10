library angular2.src.web_workers.shared.render_view_with_fragments_store;

import "package:angular2/src/core/di.dart" show Injectable, Inject;
import "package:angular2/src/core/render/api.dart"
    show RenderViewRef, RenderFragmentRef, RenderViewWithFragments;
import "package:angular2/src/web_workers/shared/api.dart" show ON_WEB_WORKER;
import "package:angular2/src/facade/collection.dart"
    show MapWrapper, ListWrapper;

@Injectable()
class RenderViewWithFragmentsStore {
  num _nextIndex = 0;
  bool _onWebWorker;
  Map<num, dynamic /* RenderViewRef | RenderFragmentRef */ > _lookupByIndex;
  Map<dynamic /* RenderViewRef | RenderFragmentRef */, num> _lookupByView;
  Map<RenderViewRef, List<RenderFragmentRef>> _viewFragments;
  RenderViewWithFragmentsStore(@Inject(ON_WEB_WORKER) onWebWorker) {
    this._onWebWorker = onWebWorker;
    this._lookupByIndex =
        new Map<num, dynamic /* RenderViewRef | RenderFragmentRef */ >();
    this._lookupByView =
        new Map<dynamic /* RenderViewRef | RenderFragmentRef */, num>();
    this._viewFragments = new Map<RenderViewRef, List<RenderFragmentRef>>();
  }
  RenderViewWithFragments allocate(num fragmentCount) {
    var initialIndex = this._nextIndex;
    var viewRef = new WebWorkerRenderViewRef(this._nextIndex++);
    var fragmentRefs = ListWrapper.createGrowableSize(fragmentCount);
    for (var i = 0; i < fragmentCount; i++) {
      fragmentRefs[i] = new WebWorkerRenderFragmentRef(this._nextIndex++);
    }
    var renderViewWithFragments =
        new RenderViewWithFragments(viewRef, fragmentRefs);
    this.store(renderViewWithFragments, initialIndex);
    return renderViewWithFragments;
  }

  void store(RenderViewWithFragments view, num startIndex) {
    this._lookupByIndex[startIndex] = view.viewRef;
    this._lookupByView[view.viewRef] = startIndex;
    startIndex++;
    view.fragmentRefs.forEach((ref) {
      this._lookupByIndex[startIndex] = ref;
      this._lookupByView[ref] = startIndex;
      startIndex++;
    });
    this._viewFragments[view.viewRef] = view.fragmentRefs;
  }

  void remove(RenderViewRef view) {
    this._removeRef(view);
    var fragments = this._viewFragments[view];
    fragments.forEach((fragment) {
      this._removeRef(fragment);
    });
    (this._viewFragments.containsKey(view) &&
        (this._viewFragments.remove(view) != null || true));
  }

  _removeRef(dynamic /* RenderViewRef | RenderFragmentRef */ ref) {
    var index = this._lookupByView[ref];
    (this._lookupByView.containsKey(ref) &&
        (this._lookupByView.remove(ref) != null || true));
    (this._lookupByIndex.containsKey(index) &&
        (this._lookupByIndex.remove(index) != null || true));
  }

  num serializeRenderViewRef(RenderViewRef viewRef) {
    return this._serializeRenderFragmentOrViewRef(viewRef);
  }

  num serializeRenderFragmentRef(RenderFragmentRef fragmentRef) {
    return this._serializeRenderFragmentOrViewRef(fragmentRef);
  }

  RenderViewRef deserializeRenderViewRef(num ref) {
    if (ref == null) {
      return null;
    }
    return this._retrieve(ref);
  }

  RenderFragmentRef deserializeRenderFragmentRef(num ref) {
    if (ref == null) {
      return null;
    }
    return this._retrieve(ref);
  }

  dynamic /* RenderViewRef | RenderFragmentRef */ _retrieve(num ref) {
    if (ref == null) {
      return null;
    }
    if (!this._lookupByIndex.containsKey(ref)) {
      return null;
    }
    return this._lookupByIndex[ref];
  }

  num _serializeRenderFragmentOrViewRef(
      dynamic /* RenderViewRef | RenderFragmentRef */ ref) {
    if (ref == null) {
      return null;
    }
    if (this._onWebWorker) {
      return ((ref
              as dynamic /* WebWorkerRenderFragmentRef | WebWorkerRenderViewRef */))
          .serialize();
    } else {
      return this._lookupByView[ref];
    }
  }

  Map<String, dynamic> serializeViewWithFragments(
      RenderViewWithFragments view) {
    if (view == null) {
      return null;
    }
    if (this._onWebWorker) {
      return {
        "viewRef": ((view.viewRef as WebWorkerRenderViewRef)).serialize(),
        "fragmentRefs": view.fragmentRefs
            .map((val) => ((val as dynamic)).serialize())
            .toList()
      };
    } else {
      return {
        "viewRef": this._lookupByView[view.viewRef],
        "fragmentRefs":
            view.fragmentRefs.map((val) => this._lookupByView[val]).toList()
      };
    }
  }

  RenderViewWithFragments deserializeViewWithFragments(
      Map<String, dynamic> obj) {
    if (obj == null) {
      return null;
    }
    var viewRef = this.deserializeRenderViewRef(obj["viewRef"]);
    var fragments = ((obj["fragmentRefs"] as List<dynamic>))
        .map((val) => this.deserializeRenderFragmentRef(val))
        .toList();
    return new RenderViewWithFragments(viewRef, fragments);
  }
}

class WebWorkerRenderViewRef extends RenderViewRef {
  num refNumber;
  WebWorkerRenderViewRef(this.refNumber) : super() {
    /* super call moved to initializer */;
  }
  num serialize() {
    return this.refNumber;
  }

  static WebWorkerRenderViewRef deserialize(num ref) {
    return new WebWorkerRenderViewRef(ref);
  }
}

class WebWorkerRenderFragmentRef extends RenderFragmentRef {
  num refNumber;
  WebWorkerRenderFragmentRef(this.refNumber) : super() {
    /* super call moved to initializer */;
  }
  num serialize() {
    return this.refNumber;
  }

  static WebWorkerRenderFragmentRef deserialize(num ref) {
    return new WebWorkerRenderFragmentRef(ref);
  }
}
