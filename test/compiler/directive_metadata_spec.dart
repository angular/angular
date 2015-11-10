library angular2.test.compiler.directive_metadata_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        it,
        xit,
        TestComponentBuilder;
import "package:angular2/src/compiler/directive_metadata.dart"
    show CompileDirectiveMetadata, CompileTypeMetadata, CompileTemplateMetadata;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "package:angular2/src/core/change_detection.dart"
    show ChangeDetectionStrategy;
import "package:angular2/src/core/linker/interfaces.dart" show LifecycleHooks;

main() {
  describe("DirectiveMetadata", () {
    CompileTypeMetadata fullTypeMeta;
    CompileTemplateMetadata fullTemplateMeta;
    CompileDirectiveMetadata fullDirectiveMeta;
    beforeEach(() {
      fullTypeMeta = new CompileTypeMetadata(
          name: "SomeType", moduleUrl: "someUrl", isHost: true);
      fullTemplateMeta = new CompileTemplateMetadata(
          encapsulation: ViewEncapsulation.Emulated,
          template: "<a></a>",
          templateUrl: "someTemplateUrl",
          styles: ["someStyle"],
          styleUrls: ["someStyleUrl"],
          ngContentSelectors: ["*"]);
      fullDirectiveMeta = CompileDirectiveMetadata.create(
          selector: "someSelector",
          isComponent: true,
          dynamicLoadable: true,
          type: fullTypeMeta,
          template: fullTemplateMeta,
          changeDetection: ChangeDetectionStrategy.Default,
          inputs: ["someProp"],
          outputs: ["someEvent"],
          host: {
            "(event1)": "handler1",
            "[prop1]": "expr1",
            "attr1": "attrValue2"
          },
          lifecycleHooks: [LifecycleHooks.OnChanges]);
    });
    describe("DirectiveMetadata", () {
      it("should serialize with full data", () {
        expect(CompileDirectiveMetadata.fromJson(fullDirectiveMeta.toJson()))
            .toEqual(fullDirectiveMeta);
      });
      it("should serialize with no data", () {
        var empty = CompileDirectiveMetadata.create();
        expect(CompileDirectiveMetadata.fromJson(empty.toJson()))
            .toEqual(empty);
      });
    });
    describe("TypeMetadata", () {
      it("should serialize with full data", () {
        expect(CompileTypeMetadata.fromJson(fullTypeMeta.toJson()))
            .toEqual(fullTypeMeta);
      });
      it("should serialize with no data", () {
        var empty = new CompileTypeMetadata();
        expect(CompileTypeMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });
    describe("TemplateMetadata", () {
      it("should use ViewEncapsulation.Emulated by default", () {
        expect(new CompileTemplateMetadata(encapsulation: null).encapsulation)
            .toBe(ViewEncapsulation.Emulated);
      });
      it("should serialize with full data", () {
        expect(CompileTemplateMetadata.fromJson(fullTemplateMeta.toJson()))
            .toEqual(fullTemplateMeta);
      });
      it("should serialize with no data", () {
        var empty = new CompileTemplateMetadata();
        expect(CompileTemplateMetadata.fromJson(empty.toJson())).toEqual(empty);
      });
    });
  });
}
