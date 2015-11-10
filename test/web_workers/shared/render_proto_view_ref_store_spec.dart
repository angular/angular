library angular2.test.web_workers.shared.render_proto_view_ref_store_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        ddescribe,
        beforeEach,
        it,
        expect;
import "package:angular2/src/core/render/api.dart" show RenderProtoViewRef;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show WebWorkerRenderProtoViewRef;

main() {
  describe("RenderProtoViewRefStore", () {
    describe("on WebWorker", () {
      RenderProtoViewRefStore store;
      beforeEach(() {
        store = new RenderProtoViewRefStore(true);
      });
      it("should allocate refs", () {
        expect(((store.allocate() as WebWorkerRenderProtoViewRef)).refNumber)
            .toBe(0);
        expect(((store.allocate() as WebWorkerRenderProtoViewRef)).refNumber)
            .toBe(1);
      });
      it("should be serializable", () {
        var protoView = store.allocate();
        expect(store.deserialize(store.serialize(protoView)))
            .toEqual(protoView);
      });
    });
    describe("on UI", () {
      RenderProtoViewRefStore store;
      beforeEach(() {
        store = new RenderProtoViewRefStore(false);
      });
      it("should associate views with the correct references", () {
        var renderProtoViewRef = new RenderProtoViewRef();
        store.store(renderProtoViewRef, 100);
        expect(store.deserialize(100)).toBe(renderProtoViewRef);
      });
      it("should be serializable", () {
        var renderProtoViewRef = new RenderProtoViewRef();
        store.store(renderProtoViewRef, 0);
        var deserialized =
            store.deserialize(store.serialize(renderProtoViewRef));
        expect(deserialized).toBe(renderProtoViewRef);
      });
    });
  });
}
