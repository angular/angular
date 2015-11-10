library angular2.test.core.render.view_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        expect,
        iit,
        inject,
        it,
        xit;
import "package:angular2/src/core/render/view.dart" show DefaultRenderView;

main() {
  describe("DefaultRenderView", () {
    describe("hydrate", () {
      it("should register global event listeners", () {
        var addCount = 0;
        var adder = () {
          addCount++;
        };
        var view = new DefaultRenderView<dynamic>([], [], [], [], [adder], []);
        view.hydrate();
        expect(addCount).toBe(1);
      });
    });
    describe("dehydrate", () {
      it("should deregister global event listeners", () {
        var removeCount = 0;
        var adder = () => () {
              removeCount++;
            };
        var view = new DefaultRenderView<dynamic>([], [], [], [], [adder], []);
        view.hydrate();
        view.dehydrate();
        expect(removeCount).toBe(1);
      });
    });
  });
}
