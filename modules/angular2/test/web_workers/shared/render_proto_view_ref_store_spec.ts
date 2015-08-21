import {AsyncTestCompleter, inject, describe, it, expect} from "angular2/test_lib";
import {RenderProtoViewRef} from "angular2/src/render/api";
import {RenderProtoViewRefStore} from "angular2/src/web_workers/shared/render_proto_view_ref_store";

export function main() {
  describe("RenderProtoViewRefStore", () => {
    it("should store and return the correct reference", () => {
      var store = new RenderProtoViewRefStore(true);
      var ref1 = new RenderProtoViewRef();
      var index1 = store.storeRenderProtoViewRef(ref1);
      expect(store.retreiveRenderProtoViewRef(index1)).toBe(ref1);
      var ref2 = new RenderProtoViewRef();
      var index2 = store.storeRenderProtoViewRef(ref2);
      expect(store.retreiveRenderProtoViewRef(index2)).toBe(ref2);
    });

    it("should cache index numbers", () => {
      var store = new RenderProtoViewRefStore(true);
      var ref = new RenderProtoViewRef();
      var index = store.storeRenderProtoViewRef(ref);
      expect(store.storeRenderProtoViewRef(ref)).toEqual(index);
    });
  });
}
