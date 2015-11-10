library angular2.test.core.linker.directive_resolver_spec;

import "package:angular2/testing_internal.dart"
    show ddescribe, describe, it, iit, expect, beforeEach;
import "package:angular2/src/core/linker/directive_resolver.dart"
    show DirectiveResolver;
import "package:angular2/src/core/metadata.dart"
    show
        DirectiveMetadata,
        Directive,
        Input,
        Output,
        HostBinding,
        HostListener,
        ContentChildren,
        ContentChildrenMetadata,
        ViewChildren,
        ViewChildrenMetadata,
        ContentChild,
        ContentChildMetadata,
        ViewChild,
        ViewChildMetadata;

@Directive(selector: "someDirective")
class SomeDirective {}

@Directive(selector: "someChildDirective")
class SomeChildDirective extends SomeDirective {}

@Directive(selector: "someDirective", inputs: const ["c"])
class SomeDirectiveWithInputs {
  @Input() var a;
  @Input("renamed") var b;
  var c;
}

@Directive(selector: "someDirective", outputs: const ["c"])
class SomeDirectiveWithOutputs {
  @Output() var a;
  @Output("renamed") var b;
  var c;
}

@Directive(selector: "someDirective", properties: const ["a"])
class SomeDirectiveWithProperties {}

@Directive(selector: "someDirective", events: const ["a"])
class SomeDirectiveWithEvents {}

@Directive(selector: "someDirective")
class SomeDirectiveWithSetterProps {
  @Input("renamed") set a(value) {}
}

@Directive(selector: "someDirective")
class SomeDirectiveWithGetterOutputs {
  @Output("renamed") get a {
    return null;
  }
}

@Directive(selector: "someDirective", host: const {"[c]": "c"})
class SomeDirectiveWithHostBindings {
  @HostBinding() var a;
  @HostBinding("renamed") var b;
  var c;
}

@Directive(selector: "someDirective", host: const {"(c)": "onC()"})
class SomeDirectiveWithHostListeners {
  @HostListener("a") onA() {}
  @HostListener("b", const ["\$event.value"]) onB(value) {}
}

@Directive(
    selector: "someDirective",
    queries: const {"cs": const ContentChildren("c")})
class SomeDirectiveWithContentChildren {
  @ContentChildren("a") dynamic as;
  var c;
}

@Directive(
    selector: "someDirective", queries: const {"cs": const ViewChildren("c")})
class SomeDirectiveWithViewChildren {
  @ViewChildren("a") dynamic as;
  var c;
}

@Directive(
    selector: "someDirective", queries: const {"c": const ContentChild("c")})
class SomeDirectiveWithContentChild {
  @ContentChild("a") dynamic a;
  var c;
}

@Directive(
    selector: "someDirective", queries: const {"c": const ViewChild("c")})
class SomeDirectiveWithViewChild {
  @ViewChild("a") dynamic a;
  var c;
}

class SomeDirectiveWithoutMetadata {}

main() {
  describe("DirectiveResolver", () {
    var resolver;
    beforeEach(() {
      resolver = new DirectiveResolver();
    });
    it("should read out the Directive metadata", () {
      var directiveMetadata = resolver.resolve(SomeDirective);
      expect(directiveMetadata).toEqual(new DirectiveMetadata(
          selector: "someDirective",
          inputs: [],
          outputs: [],
          host: {},
          queries: {}));
    });
    it("should throw if not matching metadata is found", () {
      expect(() {
        resolver.resolve(SomeDirectiveWithoutMetadata);
      }).toThrowError(
          "No Directive annotation found on SomeDirectiveWithoutMetadata");
    });
    it("should not read parent class Directive metadata", () {
      var directiveMetadata = resolver.resolve(SomeChildDirective);
      expect(directiveMetadata).toEqual(new DirectiveMetadata(
          selector: "someChildDirective",
          inputs: [],
          outputs: [],
          host: {},
          queries: {}));
    });
    describe("inputs", () {
      it("should append directive inputs", () {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithInputs);
        expect(directiveMetadata.inputs).toEqual(["c", "a", "b: renamed"]);
      });
      it("should work with getters and setters", () {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithSetterProps);
        expect(directiveMetadata.inputs).toEqual(["a: renamed"]);
      });
    });
    describe("outputs", () {
      it("should append directive outputs", () {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithOutputs);
        expect(directiveMetadata.outputs).toEqual(["c", "a", "b: renamed"]);
      });
      it("should work with getters and setters", () {
        var directiveMetadata =
            resolver.resolve(SomeDirectiveWithGetterOutputs);
        expect(directiveMetadata.outputs).toEqual(["a: renamed"]);
      });
    });
    describe("host", () {
      it("should append host bindings", () {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithHostBindings);
        expect(directiveMetadata.host)
            .toEqual({"[c]": "c", "[a]": "a", "[renamed]": "b"});
      });
      it("should append host listeners", () {
        var directiveMetadata =
            resolver.resolve(SomeDirectiveWithHostListeners);
        expect(directiveMetadata.host).toEqual(
            {"(c)": "onC()", "(a)": "onA()", "(b)": "onB(\$event.value)"});
      });
    });
    describe("queries", () {
      it("should append ContentChildren", () {
        var directiveMetadata =
            resolver.resolve(SomeDirectiveWithContentChildren);
        expect(directiveMetadata.queries).toEqual(
            {"cs": new ContentChildren("c"), "as": new ContentChildren("a")});
      });
      it("should append ViewChildren", () {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithViewChildren);
        expect(directiveMetadata.queries).toEqual(
            {"cs": new ViewChildren("c"), "as": new ViewChildren("a")});
      });
      it("should append ContentChild", () {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithContentChild);
        expect(directiveMetadata.queries)
            .toEqual({"c": new ContentChild("c"), "a": new ContentChild("a")});
      });
      it("should append ViewChild", () {
        var directiveMetadata = resolver.resolve(SomeDirectiveWithViewChild);
        expect(directiveMetadata.queries)
            .toEqual({"c": new ViewChild("c"), "a": new ViewChild("a")});
      });
    });
  });
}
