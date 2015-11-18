var testing_internal_1 = require("angular2/testing_internal");
var api_1 = require("angular2/src/core/render/api");
var render_proto_view_ref_store_1 = require("angular2/src/web_workers/shared/render_proto_view_ref_store");
function main() {
    testing_internal_1.describe("RenderProtoViewRefStore", function () {
        testing_internal_1.describe("on WebWorker", function () {
            var store;
            testing_internal_1.beforeEach(function () { store = new render_proto_view_ref_store_1.RenderProtoViewRefStore(true); });
            testing_internal_1.it("should allocate refs", function () {
                testing_internal_1.expect(store.allocate().refNumber).toBe(0);
                testing_internal_1.expect(store.allocate().refNumber).toBe(1);
            });
            testing_internal_1.it("should be serializable", function () {
                var protoView = store.allocate();
                testing_internal_1.expect(store.deserialize(store.serialize(protoView))).toEqual(protoView);
            });
        });
        testing_internal_1.describe("on UI", function () {
            var store;
            testing_internal_1.beforeEach(function () { store = new render_proto_view_ref_store_1.RenderProtoViewRefStore(false); });
            testing_internal_1.it("should associate views with the correct references", function () {
                var renderProtoViewRef = new api_1.RenderProtoViewRef();
                store.store(renderProtoViewRef, 100);
                testing_internal_1.expect(store.deserialize(100)).toBe(renderProtoViewRef);
            });
            testing_internal_1.it("should be serializable", function () {
                var renderProtoViewRef = new api_1.RenderProtoViewRef();
                store.store(renderProtoViewRef, 0);
                var deserialized = store.deserialize(store.serialize(renderProtoViewRef));
                testing_internal_1.expect(deserialized).toBe(renderProtoViewRef);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=render_proto_view_ref_store_spec.js.map