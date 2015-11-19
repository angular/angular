library angular2.test.common.pipes.json_pipe_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        AsyncTestCompleter,
        inject,
        proxy,
        TestComponentBuilder;
import "package:angular2/src/facade/lang.dart"
    show Json, RegExp, NumberWrapper, StringWrapper;
import "package:angular2/core.dart" show JsonPipe, Component;

main() {
  describe("JsonPipe", () {
    var regNewLine = "\n";
    var inceptionObj;
    var inceptionObjString;
    var pipe;
    String normalize(String obj) {
      return StringWrapper.replace(obj, regNewLine, "");
    }
    beforeEach(() {
      inceptionObj = {
        "dream": {
          "dream": {"dream": "Limbo"}
        }
      };
      inceptionObjString = "{\n" +
          "  \"dream\": {\n" +
          "    \"dream\": {\n" +
          "      \"dream\": \"Limbo\"\n" +
          "    }\n" +
          "  }\n" +
          "}";
      pipe = new JsonPipe();
    });
    describe("transform", () {
      it("should return JSON-formatted string", () {
        expect(pipe.transform(inceptionObj)).toEqual(inceptionObjString);
      });
      it("should return JSON-formatted string even when normalized", () {
        var dream1 = normalize(pipe.transform(inceptionObj));
        var dream2 = normalize(inceptionObjString);
        expect(dream1).toEqual(dream2);
      });
      it("should return JSON-formatted string similar to Json.stringify", () {
        var dream1 = normalize(pipe.transform(inceptionObj));
        var dream2 = normalize(Json.stringify(inceptionObj));
        expect(dream1).toEqual(dream2);
      });
    });
    describe("integration", () {
      it(
          "should work with mutable objects",
          inject([TestComponentBuilder, AsyncTestCompleter],
              (TestComponentBuilder tcb, async) {
            tcb.createAsync(TestComp).then((fixture) {
              List<num> mutable = [1];
              fixture.debugElement.componentInstance.data = mutable;
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement)
                  .toHaveText("[\n  1\n]");
              mutable.add(2);
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement)
                  .toHaveText("[\n  1,\n  2\n]");
              async.done();
            });
          }));
    });
  });
}

@Component(
    selector: "test-comp", template: "{{data | json}}", pipes: const [JsonPipe])
class TestComp {
  dynamic data;
}
