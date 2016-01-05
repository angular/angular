library angular2.test.web_workers.shared.render_store_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        ddescribe,
        beforeEach,
        it,
        expect;
import "package:angular2/src/web_workers/shared/render_store.dart"
    show RenderStore;

main() {
  describe("RenderStoreSpec", () {
    RenderStore store;
    beforeEach(() {
      store = new RenderStore();
    });
    it("should allocate ids", () {
      expect(store.allocateId()).toBe(0);
      expect(store.allocateId()).toBe(1);
    });
    it("should serialize objects", () {
      var id = store.allocateId();
      var obj = "testObject";
      store.store(obj, id);
      expect(store.serialize(obj)).toBe(id);
    });
    it("should deserialize objects", () {
      var id = store.allocateId();
      var obj = "testObject";
      store.store(obj, id);
      expect(store.deserialize(id)).toBe(obj);
    });
  });
}
