import {
  AsyncTestCompleter,
  inject,
  describe,
  ddescribe,
  beforeEach,
  it,
  expect
} from "angular2/test_lib";
import {RenderProtoViewRef} from "angular2/src/core/render/api";
import {RenderProtoViewRefStore} from "angular2/src/web_workers/shared/render_proto_view_ref_store";
import {
  WebWorkerRenderProtoViewRef
} from "angular2/src/web_workers/shared/render_proto_view_ref_store";
import {RenderProtoViewRef_} from "../../../src/core/render/api";

export function main() {
  describe("RenderProtoViewRefStore", () => {
    describe("on WebWorker", () => {
      var store: RenderProtoViewRefStore;
      beforeEach(() => { store = new RenderProtoViewRefStore(true); });

      it("should allocate refs", () => {
        expect((<WebWorkerRenderProtoViewRef>store.allocate()).refNumber).toBe(0);
        expect((<WebWorkerRenderProtoViewRef>store.allocate()).refNumber).toBe(1);
      });

      it("should be serializable", () => {
        var protoView = store.allocate();
        expect(store.deserialize(store.serialize(protoView))).toEqual(protoView);
      });

    });

    describe("on UI", () => {
      var store: RenderProtoViewRefStore;
      beforeEach(() => { store = new RenderProtoViewRefStore(false); });

      it("should associate views with the correct references", () => {
        var renderProtoViewRef = new RenderProtoViewRef_();

        store.store(renderProtoViewRef, 100);
        expect(store.deserialize(100)).toBe(renderProtoViewRef);
      });

      it("should be serializable", () => {
        var renderProtoViewRef = new RenderProtoViewRef_();
        store.store(renderProtoViewRef, 0);

        var deserialized = store.deserialize(store.serialize(renderProtoViewRef));
        expect(deserialized).toBe(renderProtoViewRef);
      });

    });

  });
}
