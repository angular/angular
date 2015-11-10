var testing_internal_1 = require('angular2/testing_internal');
var view_pool_1 = require('angular2/src/core/linker/view_pool');
var view_1 = require('angular2/src/core/linker/view');
var collection_1 = require('angular2/src/facade/collection');
function main() {
    testing_internal_1.describe('AppViewPool', function () {
        function createViewPool(_a) {
            var capacity = _a.capacity;
            return new view_pool_1.AppViewPool(capacity);
        }
        function createProtoView() {
            return new view_1.AppProtoView(null, null, null, null, null, null, null);
        }
        function createView(pv) {
            return new view_1.AppView(null, pv, null, null, null, new collection_1.Map(), null, null, null);
        }
        testing_internal_1.it('should support multiple AppProtoViews', function () {
            var vf = createViewPool({ capacity: 2 });
            var pv1 = createProtoView();
            var pv2 = createProtoView();
            var view1 = createView(pv1);
            var view2 = createView(pv2);
            vf.returnView(view1);
            vf.returnView(view2);
            testing_internal_1.expect(vf.getView(pv1)).toBe(view1);
            testing_internal_1.expect(vf.getView(pv2)).toBe(view2);
        });
        testing_internal_1.it('should reuse the newest view that has been returned', function () {
            var pv = createProtoView();
            var vf = createViewPool({ capacity: 2 });
            var view1 = createView(pv);
            var view2 = createView(pv);
            vf.returnView(view1);
            vf.returnView(view2);
            testing_internal_1.expect(vf.getView(pv)).toBe(view2);
        });
        testing_internal_1.it('should not add views when the capacity has been reached', function () {
            var pv = createProtoView();
            var vf = createViewPool({ capacity: 2 });
            var view1 = createView(pv);
            var view2 = createView(pv);
            var view3 = createView(pv);
            testing_internal_1.expect(vf.returnView(view1)).toBe(true);
            testing_internal_1.expect(vf.returnView(view2)).toBe(true);
            testing_internal_1.expect(vf.returnView(view3)).toBe(false);
            testing_internal_1.expect(vf.getView(pv)).toBe(view2);
            testing_internal_1.expect(vf.getView(pv)).toBe(view1);
        });
    });
}
exports.main = main;
//# sourceMappingURL=view_pool_spec.js.map