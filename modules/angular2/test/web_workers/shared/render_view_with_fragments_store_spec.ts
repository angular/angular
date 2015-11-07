import {
  AsyncTestCompleter,
  beforeEach,
  inject,
  describe,
  it,
  expect
} from "angular2/testing_internal";
import {
  RenderViewWithFragments,
  RenderViewRef,
  RenderFragmentRef
} from "angular2/src/core/render/api";
import {
  RenderViewWithFragmentsStore,
  WebWorkerRenderViewRef,
  WebWorkerRenderFragmentRef
} from "angular2/src/web_workers/shared/render_view_with_fragments_store";
import {ListWrapper} from "angular2/src/facade/collection";

export function main() {
  describe("RenderViewWithFragmentsStore", () => {
    describe("on WebWorker", () => {
      var store: RenderViewWithFragmentsStore;
      beforeEach(() => { store = new RenderViewWithFragmentsStore(true); });

      it("should allocate fragmentCount + 1 refs", () => {
        var view: RenderViewWithFragments = store.allocate(10);

        var viewRef: WebWorkerRenderViewRef = <WebWorkerRenderViewRef>view.viewRef;
        expect(viewRef.refNumber).toEqual(0);

        var fragmentRefs: WebWorkerRenderFragmentRef[] =
            <WebWorkerRenderFragmentRef[]>view.fragmentRefs;
        expect(fragmentRefs.length).toEqual(10);

        for (var i = 0; i < fragmentRefs.length; i++) {
          expect(fragmentRefs[i].refNumber).toEqual(i + 1);
        }
      });

      it("should not reuse a reference", () => {
        store.allocate(10);
        var view = store.allocate(0);
        var viewRef = <WebWorkerRenderViewRef>view.viewRef;
        expect(viewRef.refNumber).toEqual(11);
      });

      it("should be serializable", () => {
        var view = store.allocate(1);
        expect(store.deserializeViewWithFragments(store.serializeViewWithFragments(view)))
            .toEqual(view);
      });

      it("should remove a view and all attached fragments", () => {
        const NUM_FRAGMENTS = 5;
        var view = store.allocate(NUM_FRAGMENTS);
        var viewRef = (<WebWorkerRenderViewRef>view.viewRef).refNumber;
        store.remove(view.viewRef);

        expect(store.deserializeRenderViewRef(viewRef++)).toBeNull();
        for (var i = 0; i < NUM_FRAGMENTS; i++) {
          expect(store.deserializeRenderFragmentRef(viewRef++)).toBeNull();
        }
      });
    });

    describe("on UI", () => {
      var store: RenderViewWithFragmentsStore;
      beforeEach(() => { store = new RenderViewWithFragmentsStore(false); });
      function createMockRenderViewWithFragments(): RenderViewWithFragments {
        var view = new MockRenderViewRef();
        var fragments = ListWrapper.createGrowableSize(20);
        for (var i = 0; i < 20; i++) {
          fragments[i] = new MockRenderFragmentRef();
        }

        return new RenderViewWithFragments(view, fragments);
      }
      it("should associate views with the correct references", () => {
        var renderViewWithFragments = createMockRenderViewWithFragments();

        store.store(renderViewWithFragments, 100);
        expect(store.deserializeRenderViewRef(100)).toBe(renderViewWithFragments.viewRef);

        for (var i = 0; i < renderViewWithFragments.fragmentRefs.length; i++) {
          expect(store.deserializeRenderFragmentRef(101 + i))
              .toBe(renderViewWithFragments.fragmentRefs[i]);
        }
      });

      describe("RenderViewWithFragments", () => {
        it("should be serializable", () => {
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
          };
        });
      });

      describe("RenderViewRef", () => {
        it("should be serializable", () => {
          var renderViewWithFragments = createMockRenderViewWithFragments();
          store.store(renderViewWithFragments, 0);

          var deserialized = store.deserializeRenderViewRef(
              store.serializeRenderViewRef(renderViewWithFragments.viewRef));
          expect(deserialized).toBe(renderViewWithFragments.viewRef);
        });
      });

      describe("RenderFragmentRef", () => {
        it("should be serializable", () => {
          var renderViewWithFragments = createMockRenderViewWithFragments();
          store.store(renderViewWithFragments, 0);

          var serialized =
              store.serializeRenderFragmentRef(renderViewWithFragments.fragmentRefs[0]);
          var deserialized = store.deserializeRenderFragmentRef(serialized);

          expect(deserialized).toBe(renderViewWithFragments.fragmentRefs[0]);
        });
      });
    });
  });
}

class MockRenderViewRef extends RenderViewRef {
  constructor() { super(); }
}

class MockRenderFragmentRef extends RenderFragmentRef {
  constructor() { super(); }
}
