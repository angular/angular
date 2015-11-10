library angular2.test.web_workers.shared.render_view_with_fragments_store_spec;

import "package:angular2/testing_internal.dart"
    show AsyncTestCompleter, beforeEach, inject, describe, it, expect;
import "package:angular2/src/core/render/api.dart"
    show RenderViewWithFragments, RenderViewRef, RenderFragmentRef;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show
        RenderViewWithFragmentsStore,
        WebWorkerRenderViewRef,
        WebWorkerRenderFragmentRef;
import "package:angular2/src/facade/collection.dart" show ListWrapper;

main() {
  describe("RenderViewWithFragmentsStore", () {
    describe("on WebWorker", () {
      RenderViewWithFragmentsStore store;
      beforeEach(() {
        store = new RenderViewWithFragmentsStore(true);
      });
      it("should allocate fragmentCount + 1 refs", () {
        RenderViewWithFragments view = store.allocate(10);
        WebWorkerRenderViewRef viewRef =
            (view.viewRef as WebWorkerRenderViewRef);
        expect(viewRef.refNumber).toEqual(0);
        List<WebWorkerRenderFragmentRef> fragmentRefs =
            (view.fragmentRefs as List<WebWorkerRenderFragmentRef>);
        expect(fragmentRefs.length).toEqual(10);
        for (var i = 0; i < fragmentRefs.length; i++) {
          expect(fragmentRefs[i].refNumber).toEqual(i + 1);
        }
      });
      it("should not reuse a reference", () {
        store.allocate(10);
        var view = store.allocate(0);
        var viewRef = (view.viewRef as WebWorkerRenderViewRef);
        expect(viewRef.refNumber).toEqual(11);
      });
      it("should be serializable", () {
        var view = store.allocate(1);
        expect(store.deserializeViewWithFragments(
            store.serializeViewWithFragments(view))).toEqual(view);
      });
      it("should remove a view and all attached fragments", () {
        const NUM_FRAGMENTS = 5;
        var view = store.allocate(NUM_FRAGMENTS);
        var viewRef = ((view.viewRef as WebWorkerRenderViewRef)).refNumber;
        store.remove(view.viewRef);
        expect(store.deserializeRenderViewRef(viewRef++)).toBeNull();
        for (var i = 0; i < NUM_FRAGMENTS; i++) {
          expect(store.deserializeRenderFragmentRef(viewRef++)).toBeNull();
        }
      });
    });
    describe("on UI", () {
      RenderViewWithFragmentsStore store;
      beforeEach(() {
        store = new RenderViewWithFragmentsStore(false);
      });
      RenderViewWithFragments createMockRenderViewWithFragments() {
        var view = new MockRenderViewRef();
        var fragments = ListWrapper.createGrowableSize(20);
        for (var i = 0; i < 20; i++) {
          fragments[i] = new MockRenderFragmentRef();
        }
        return new RenderViewWithFragments(view, fragments);
      }
      it("should associate views with the correct references", () {
        var renderViewWithFragments = createMockRenderViewWithFragments();
        store.store(renderViewWithFragments, 100);
        expect(store.deserializeRenderViewRef(100))
            .toBe(renderViewWithFragments.viewRef);
        for (var i = 0; i < renderViewWithFragments.fragmentRefs.length; i++) {
          expect(store.deserializeRenderFragmentRef(101 + i))
              .toBe(renderViewWithFragments.fragmentRefs[i]);
        }
      });
      describe("RenderViewWithFragments", () {
        it("should be serializable", () {
          var renderViewWithFragments = createMockRenderViewWithFragments();
          store.store(renderViewWithFragments, 0);
          var deserialized = store.deserializeViewWithFragments(
              store.serializeViewWithFragments(renderViewWithFragments));
          expect(deserialized.viewRef).toBe(renderViewWithFragments.viewRef);
          expect(deserialized.fragmentRefs.length)
              .toEqual(renderViewWithFragments.fragmentRefs.length);
          for (var i = 0; i < deserialized.fragmentRefs.length; i++) {
            var val = deserialized.fragmentRefs[i];
            expect(val).toBe(renderViewWithFragments.fragmentRefs[i]);
          }
          ;
        });
      });
      describe("RenderViewRef", () {
        it("should be serializable", () {
          var renderViewWithFragments = createMockRenderViewWithFragments();
          store.store(renderViewWithFragments, 0);
          var deserialized = store.deserializeRenderViewRef(
              store.serializeRenderViewRef(renderViewWithFragments.viewRef));
          expect(deserialized).toBe(renderViewWithFragments.viewRef);
        });
      });
      describe("RenderFragmentRef", () {
        it("should be serializable", () {
          var renderViewWithFragments = createMockRenderViewWithFragments();
          store.store(renderViewWithFragments, 0);
          var serialized = store.serializeRenderFragmentRef(
              renderViewWithFragments.fragmentRefs[0]);
          var deserialized = store.deserializeRenderFragmentRef(serialized);
          expect(deserialized).toBe(renderViewWithFragments.fragmentRefs[0]);
        });
      });
    });
  });
}

class MockRenderViewRef extends RenderViewRef {
  MockRenderViewRef() : super() {
    /* super call moved to initializer */;
  }
}

class MockRenderFragmentRef extends RenderFragmentRef {
  MockRenderFragmentRef() : super() {
    /* super call moved to initializer */;
  }
}
