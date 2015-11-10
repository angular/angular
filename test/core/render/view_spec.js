var testing_internal_1 = require('angular2/testing_internal');
var view_1 = require('angular2/src/core/render/view');
function main() {
    testing_internal_1.describe('DefaultRenderView', function () {
        testing_internal_1.describe('hydrate', function () {
            testing_internal_1.it('should register global event listeners', function () {
                var addCount = 0;
                var adder = function () { addCount++; };
                var view = new view_1.DefaultRenderView([], [], [], [], [adder], []);
                view.hydrate();
                testing_internal_1.expect(addCount).toBe(1);
            });
        });
        testing_internal_1.describe('dehydrate', function () {
            testing_internal_1.it('should deregister global event listeners', function () {
                var removeCount = 0;
                var adder = function () { return function () { removeCount++; }; };
                var view = new view_1.DefaultRenderView([], [], [], [], [adder], []);
                view.hydrate();
                view.dehydrate();
                testing_internal_1.expect(removeCount).toBe(1);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=view_spec.js.map