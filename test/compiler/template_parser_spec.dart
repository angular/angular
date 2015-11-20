library angular2.test.compiler.template_parser_spec;

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
        inject,
        beforeEachProviders;
import "package:angular2/src/core/di.dart" show provide;
import "test_bindings.dart" show TEST_PROVIDERS;
import "package:angular2/src/facade/lang.dart" show isPresent;
import "package:angular2/src/compiler/template_parser.dart"
    show TemplateParser, splitClasses, TEMPLATE_TRANSFORMS;
import "package:angular2/src/compiler/directive_metadata.dart"
    show CompileDirectiveMetadata, CompileTypeMetadata, CompileTemplateMetadata;
import "package:angular2/src/compiler/template_ast.dart"
    show
        templateVisitAll,
        TemplateAstVisitor,
        TemplateAst,
        NgContentAst,
        EmbeddedTemplateAst,
        ElementAst,
        VariableAst,
        BoundEventAst,
        BoundElementPropertyAst,
        BoundDirectivePropertyAst,
        AttrAst,
        BoundTextAst,
        TextAst,
        PropertyBindingType,
        DirectiveAst;
import "package:angular2/src/compiler/schema/element_schema_registry.dart"
    show ElementSchemaRegistry;
import "schema_registry_mock.dart" show MockSchemaRegistry;
import "../core/change_detection/parser/unparser.dart" show Unparser;

var expressionUnparser = new Unparser();
main() {
  describe("TemplateParser", () {
    beforeEachProviders(() => [
          TEST_PROVIDERS,
          provide(ElementSchemaRegistry,
              useValue: new MockSchemaRegistry(
                  {"invalidProp": false}, {"mappedAttr": "mappedProp"}))
        ]);
    TemplateParser parser;
    var ngIf;
    beforeEach(inject([TemplateParser], (_parser) {
      parser = _parser;
      ngIf = CompileDirectiveMetadata.create(
          selector: "[ng-if]",
          type: new CompileTypeMetadata(name: "NgIf"),
          inputs: ["ngIf"]);
    }));
    List<TemplateAst> parse(
        String template, List<CompileDirectiveMetadata> directives) {
      return parser.parse(template, directives, "TestComp");
    }
    describe("template transform", () {
      beforeEachProviders(() => [
            provide(TEMPLATE_TRANSFORMS,
                useValue: new FooAstTransformer(), multi: true)
          ]);
      it("should transform TemplateAST", () {
        expect(humanizeTplAst(parse("<div>", []))).toEqual([
          [ElementAst, "foo"]
        ]);
      });
      describe("multiple", () {
        beforeEachProviders(() => [
              provide(TEMPLATE_TRANSFORMS,
                  useValue: new BarAstTransformer(), multi: true)
            ]);
        it("should compose transformers", () {
          expect(humanizeTplAst(parse("<div>", []))).toEqual([
            [ElementAst, "bar"]
          ]);
        });
      });
    });
    describe("parse", () {
      describe("nodes without bindings", () {
        it("should parse text nodes", () {
          expect(humanizeTplAst(parse("a", []))).toEqual([
            [TextAst, "a"]
          ]);
        });
        it("should parse elements with attributes", () {
          expect(humanizeTplAst(parse("<div a=b>", []))).toEqual([
            [ElementAst, "div"],
            [AttrAst, "a", "b"]
          ]);
        });
      });
      it("should parse ngContent", () {
        var parsed = parse("<ng-content select=\"a\">", []);
        expect(humanizeTplAst(parsed)).toEqual([
          [NgContentAst]
        ]);
      });
      it("should parse bound text nodes", () {
        expect(humanizeTplAst(parse("{{a}}", []))).toEqual([
          [BoundTextAst, "{{ a }}"]
        ]);
      });
      describe("bound properties", () {
        it("should parse mixed case bound properties", () {
          expect(humanizeTplAst(parse("<div [someProp]=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "someProp",
              "v",
              null
            ]
          ]);
        });
        it("should parse and camel case bound properties", () {
          expect(humanizeTplAst(parse("<div [some-prop]=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "someProp",
              "v",
              null
            ]
          ]);
        });
        it("should normalize property names via the element schema", () {
          expect(humanizeTplAst(parse("<div [mapped-attr]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "mappedProp",
              "v",
              null
            ]
          ]);
        });
        it("should parse mixed case bound attributes", () {
          expect(humanizeTplAst(parse("<div [attr.someAttr]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Attribute,
              "someAttr",
              "v",
              null
            ]
          ]);
        });
        it("should parse and camel case bound attributes", () {
          expect(humanizeTplAst(parse("<div [attr.some-attr]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Attribute,
              "someAttr",
              "v",
              null
            ]
          ]);
          expect(humanizeTplAst(parse("<div [ATTR.some-attr]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Attribute,
              "someAttr",
              "v",
              null
            ]
          ]);
        });
        it("should parse and dash case bound classes", () {
          expect(humanizeTplAst(parse("<div [class.some-class]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Class,
              "some-class",
              "v",
              null
            ]
          ]);
          expect(humanizeTplAst(parse("<div [CLASS.some-class]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Class,
              "some-class",
              "v",
              null
            ]
          ]);
        });
        it("should parse mixed case bound classes", () {
          expect(humanizeTplAst(parse("<div [class.someClass]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Class,
              "someClass",
              "v",
              null
            ]
          ]);
        });
        it("should parse and camel case bound styles", () {
          expect(humanizeTplAst(parse("<div [style.some-style]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Style,
              "someStyle",
              "v",
              null
            ]
          ]);
          expect(humanizeTplAst(parse("<div [STYLE.some-style]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Style,
              "someStyle",
              "v",
              null
            ]
          ]);
        });
        it("should parse and mixed case bound styles", () {
          expect(humanizeTplAst(parse("<div [style.someStyle]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Style,
              "someStyle",
              "v",
              null
            ]
          ]);
        });
        it("should parse bound properties via [...] and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div [prop]=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null
            ]
          ]);
        });
        it("should parse bound properties via bind- and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div bind-prop=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null
            ]
          ]);
          expect(humanizeTplAst(parse("<div BIND-prop=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null
            ]
          ]);
        });
        it("should parse bound properties via {{...}} and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div prop=\"{{v}}\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "{{ v }}",
              null
            ]
          ]);
        });
      });
      describe("events", () {
        it("should parse bound events with a target", () {
          expect(humanizeTplAst(parse("<div (window:event)=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [BoundEventAst, "event", "window", "v"]
          ]);
        });
        it("should parse bound events via (...) and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div (event)=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [BoundEventAst, "event", null, "v"]
          ]);
        });
        it("should parse and camel case event names", () {
          expect(humanizeTplAst(parse("<div (some-event)=\"v\">", [])))
              .toEqual([
            [ElementAst, "div"],
            [BoundEventAst, "someEvent", null, "v"]
          ]);
        });
        it("should parse mixed case event names", () {
          expect(humanizeTplAst(parse("<div (someEvent)=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [BoundEventAst, "someEvent", null, "v"]
          ]);
        });
        it("should parse bound events via on- and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div on-event=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [BoundEventAst, "event", null, "v"]
          ]);
          expect(humanizeTplAst(parse("<div ON-event=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [BoundEventAst, "event", null, "v"]
          ]);
        });
        it("should allow events on explicit embedded templates that are emitted by a directive",
            () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "template",
              outputs: ["e"],
              type: new CompileTypeMetadata(name: "DirA"));
          expect(humanizeTplAst(
              parse("<template (e)=\"f\"></template>", [dirA]))).toEqual([
            [EmbeddedTemplateAst],
            [BoundEventAst, "e", null, "f"],
            [DirectiveAst, dirA]
          ]);
        });
      });
      describe("bindon", () {
        it("should parse bound events and properties via [(...)] and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div [(prop)]=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null
            ],
            [BoundEventAst, "propChange", null, "v = \$event"]
          ]);
        });
        it("should parse bound events and properties via bindon- and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div bindon-prop=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null
            ],
            [BoundEventAst, "propChange", null, "v = \$event"]
          ]);
          expect(humanizeTplAst(parse("<div BINDON-prop=\"v\">", []))).toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null
            ],
            [BoundEventAst, "propChange", null, "v = \$event"]
          ]);
        });
      });
      describe("directives", () {
        it("should locate directives components first and ordered by the directives array in the View",
            () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "[a]", type: new CompileTypeMetadata(name: "DirA"));
          var dirB = CompileDirectiveMetadata.create(
              selector: "[b]", type: new CompileTypeMetadata(name: "DirB"));
          var dirC = CompileDirectiveMetadata.create(
              selector: "[c]", type: new CompileTypeMetadata(name: "DirC"));
          var comp = CompileDirectiveMetadata.create(
              selector: "div",
              isComponent: true,
              type: new CompileTypeMetadata(name: "ZComp"),
              template: new CompileTemplateMetadata(ngContentSelectors: []));
          expect(humanizeTplAst(parse("<div a c b>", [dirA, dirB, dirC, comp])))
              .toEqual([
            [ElementAst, "div"],
            [AttrAst, "a", ""],
            [AttrAst, "c", ""],
            [AttrAst, "b", ""],
            [DirectiveAst, comp],
            [DirectiveAst, dirA],
            [DirectiveAst, dirB],
            [DirectiveAst, dirC]
          ]);
        });
        it("should locate directives in property bindings", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "[a=b]", type: new CompileTypeMetadata(name: "DirA"));
          var dirB = CompileDirectiveMetadata.create(
              selector: "[b]", type: new CompileTypeMetadata(name: "DirB"));
          expect(humanizeTplAst(parse("<div [a]=\"b\">", [dirA, dirB])))
              .toEqual([
            [ElementAst, "div"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "a",
              "b",
              null
            ],
            [DirectiveAst, dirA]
          ]);
        });
        it("should parse directive host properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              host: {"[a]": "expr"});
          expect(humanizeTplAst(parse("<div></div>", [dirA]))).toEqual([
            [ElementAst, "div"],
            [DirectiveAst, dirA],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "a",
              "expr",
              null
            ]
          ]);
        });
        it("should parse directive host listeners", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              host: {"(a)": "expr"});
          expect(humanizeTplAst(parse("<div></div>", [dirA]))).toEqual([
            [ElementAst, "div"],
            [DirectiveAst, dirA],
            [BoundEventAst, "a", null, "expr"]
          ]);
        });
        it("should parse directive properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["aProp"]);
          expect(humanizeTplAst(parse("<div [a-prop]=\"expr\"></div>", [dirA])))
              .toEqual([
            [ElementAst, "div"],
            [DirectiveAst, dirA],
            [BoundDirectivePropertyAst, "aProp", "expr"]
          ]);
        });
        it("should parse renamed directive properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["b:a"]);
          expect(humanizeTplAst(parse("<div [a]=\"expr\"></div>", [dirA])))
              .toEqual([
            [ElementAst, "div"],
            [DirectiveAst, dirA],
            [BoundDirectivePropertyAst, "b", "expr"]
          ]);
        });
        it("should parse literal directive properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["a"]);
          expect(humanizeTplAst(parse("<div a=\"literal\"></div>", [dirA])))
              .toEqual([
            [ElementAst, "div"],
            [AttrAst, "a", "literal"],
            [DirectiveAst, dirA],
            [BoundDirectivePropertyAst, "a", "\"literal\""]
          ]);
        });
        it("should favor explicit bound properties over literal properties",
            () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["a"]);
          expect(humanizeTplAst(parse(
                  "<div a=\"literal\" [a]=\"'literal2'\"></div>", [dirA])))
              .toEqual([
            [ElementAst, "div"],
            [AttrAst, "a", "literal"],
            [DirectiveAst, dirA],
            [BoundDirectivePropertyAst, "a", "\"literal2\""]
          ]);
        });
        it("should support optional directive properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["a"]);
          expect(humanizeTplAst(parse("<div></div>", [dirA]))).toEqual([
            [ElementAst, "div"],
            [DirectiveAst, dirA]
          ]);
        });
      });
      describe("variables", () {
        it("should parse variables via #... and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div #a>", []))).toEqual([
            [ElementAst, "div"],
            [VariableAst, "a", ""]
          ]);
        });
        it("should parse variables via var-... and not report them as attributes",
            () {
          expect(humanizeTplAst(parse("<div var-a>", []))).toEqual([
            [ElementAst, "div"],
            [VariableAst, "a", ""]
          ]);
          expect(humanizeTplAst(parse("<div VAR-a>", []))).toEqual([
            [ElementAst, "div"],
            [VariableAst, "a", ""]
          ]);
        });
        it("should camel case variables", () {
          expect(humanizeTplAst(parse("<div var-some-a>", []))).toEqual([
            [ElementAst, "div"],
            [VariableAst, "someA", ""]
          ]);
        });
        it("should assign variables with empty value to the element", () {
          expect(humanizeTplAst(parse("<div #a></div>", []))).toEqual([
            [ElementAst, "div"],
            [VariableAst, "a", ""]
          ]);
        });
        it("should assign variables to directives via exportAs", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "[a]",
              type: new CompileTypeMetadata(name: "DirA"),
              exportAs: "dirA");
          expect(humanizeTplAst(parse("<div a #a=\"dirA\"></div>", [dirA])))
              .toEqual([
            [ElementAst, "div"],
            [AttrAst, "a", ""],
            [DirectiveAst, dirA],
            [VariableAst, "a", "dirA"]
          ]);
        });
        it("should report variables with values that dont match a directive as errors",
            () {
          expect(() => parse("<div #a=\"dirA\"></div>", []))
              .toThrowError('''Template parse errors:
There is no directive with "exportAs" set to "dirA" ("<div [ERROR ->]#a="dirA"></div>"): TestComp@0:5''');
        });
        it("should allow variables with values that dont match a directive on embedded template elements",
            () {
          expect(humanizeTplAst(parse("<template #a=\"b\"></template>", [])))
              .toEqual([
            [EmbeddedTemplateAst],
            [VariableAst, "a", "b"]
          ]);
        });
        it("should assign variables with empty value to components", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "[a]",
              isComponent: true,
              type: new CompileTypeMetadata(name: "DirA"),
              exportAs: "dirA",
              template: new CompileTemplateMetadata(ngContentSelectors: []));
          expect(humanizeTplAst(parse("<div a #a></div>", [dirA]))).toEqual([
            [ElementAst, "div"],
            [AttrAst, "a", ""],
            [VariableAst, "a", ""],
            [DirectiveAst, dirA],
            [VariableAst, "a", ""]
          ]);
        });
      });
      describe("explicit templates", () {
        it("should create embedded templates for <template> elements", () {
          expect(humanizeTplAst(parse("<template></template>", []))).toEqual([
            [EmbeddedTemplateAst]
          ]);
          expect(humanizeTplAst(parse("<TEMPLATE></TEMPLATE>", []))).toEqual([
            [EmbeddedTemplateAst]
          ]);
        });
      });
      describe("inline templates", () {
        it("should wrap the element into an EmbeddedTemplateAST", () {
          expect(humanizeTplAst(parse("<div template>", []))).toEqual([
            [EmbeddedTemplateAst],
            [ElementAst, "div"]
          ]);
          expect(humanizeTplAst(parse("<div TEMPLATE>", []))).toEqual([
            [EmbeddedTemplateAst],
            [ElementAst, "div"]
          ]);
        });
        it("should parse bound properties", () {
          expect(humanizeTplAst(parse("<div template=\"ngIf test\">", [ngIf])))
              .toEqual([
            [EmbeddedTemplateAst],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, "ngIf", "test"],
            [ElementAst, "div"]
          ]);
        });
        it("should parse variables via #...", () {
          expect(humanizeTplAst(parse("<div template=\"ngIf #a=b\">", [])))
              .toEqual([
            [EmbeddedTemplateAst],
            [VariableAst, "a", "b"],
            [ElementAst, "div"]
          ]);
        });
        it("should parse variables via var ...", () {
          expect(humanizeTplAst(parse("<div template=\"ngIf var a=b\">", [])))
              .toEqual([
            [EmbeddedTemplateAst],
            [VariableAst, "a", "b"],
            [ElementAst, "div"]
          ]);
        });
        describe("directives", () {
          it("should locate directives in property bindings", () {
            var dirA = CompileDirectiveMetadata.create(
                selector: "[a=b]",
                type: new CompileTypeMetadata(name: "DirA"),
                inputs: ["a"]);
            var dirB = CompileDirectiveMetadata.create(
                selector: "[b]", type: new CompileTypeMetadata(name: "DirB"));
            expect(humanizeTplAst(
                parse("<div template=\"a b\" b>", [dirA, dirB]))).toEqual([
              [EmbeddedTemplateAst],
              [DirectiveAst, dirA],
              [BoundDirectivePropertyAst, "a", "b"],
              [ElementAst, "div"],
              [AttrAst, "b", ""],
              [DirectiveAst, dirB]
            ]);
          });
          it("should locate directives in variable bindings", () {
            var dirA = CompileDirectiveMetadata.create(
                selector: "[a=b]", type: new CompileTypeMetadata(name: "DirA"));
            var dirB = CompileDirectiveMetadata.create(
                selector: "[b]", type: new CompileTypeMetadata(name: "DirB"));
            expect(humanizeTplAst(
                parse("<div template=\"#a=b\" b>", [dirA, dirB]))).toEqual([
              [EmbeddedTemplateAst],
              [VariableAst, "a", "b"],
              [DirectiveAst, dirA],
              [ElementAst, "div"],
              [AttrAst, "b", ""],
              [DirectiveAst, dirB]
            ]);
          });
        });
        it("should work with *... and use the attribute name as property binding name",
            () {
          expect(humanizeTplAst(parse("<div *ng-if=\"test\">", [ngIf])))
              .toEqual([
            [EmbeddedTemplateAst],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, "ngIf", "test"],
            [ElementAst, "div"]
          ]);
        });
        it("should work with *... and empty value", () {
          expect(humanizeTplAst(parse("<div *ng-if>", [ngIf]))).toEqual([
            [EmbeddedTemplateAst],
            [DirectiveAst, ngIf],
            [BoundDirectivePropertyAst, "ngIf", "null"],
            [ElementAst, "div"]
          ]);
        });
      });
    });
    describe("content projection", () {
      CompileDirectiveMetadata createComp(
          String selector, List<String> ngContentSelectors) {
        return CompileDirectiveMetadata.create(
            selector: selector,
            isComponent: true,
            type: new CompileTypeMetadata(name: "SomeComp"),
            template: new CompileTemplateMetadata(
                ngContentSelectors: ngContentSelectors));
      }
      describe("project text nodes", () {
        it("should project text nodes with wildcard selector", () {
          expect(humanizeContentProjection(parse("<div>hello</div>", [
            createComp("div", ["*"])
          ]))).toEqual([
            ["div", null],
            ["#text(hello)", 0]
          ]);
        });
      });
      describe("project elements", () {
        it("should project elements with wildcard selector", () {
          expect(humanizeContentProjection(parse("<div><span></span></div>", [
            createComp("div", ["*"])
          ]))).toEqual([
            ["div", null],
            ["span", 0]
          ]);
        });
        it("should project elements with css selector", () {
          expect(
              humanizeContentProjection(parse("<div><a x></a><b></b></div>", [
            createComp("div", ["a[x]"])
          ]))).toEqual([
            ["div", null],
            ["a", 0],
            ["b", null]
          ]);
        });
      });
      describe("embedded templates", () {
        it("should project embedded templates with wildcard selector", () {
          expect(humanizeContentProjection(
              parse("<div><template></template></div>", [
            createComp("div", ["*"])
          ]))).toEqual([
            ["div", null],
            ["template", 0]
          ]);
        });
        it("should project embedded templates with css selector", () {
          expect(humanizeContentProjection(
              parse("<div><template x></template><template></template></div>", [
            createComp("div", ["template[x]"])
          ]))).toEqual([
            ["div", null],
            ["template", 0],
            ["template", null]
          ]);
        });
      });
      describe("ng-content", () {
        it("should project ng-content with wildcard selector", () {
          expect(humanizeContentProjection(
              parse("<div><ng-content></ng-content></div>", [
            createComp("div", ["*"])
          ]))).toEqual([
            ["div", null],
            ["ng-content", 0]
          ]);
        });
        it("should project ng-content with css selector", () {
          expect(humanizeContentProjection(parse(
              "<div><ng-content x></ng-content><ng-content></ng-content></div>",
              [
            createComp("div", ["ng-content[x]"])
          ]))).toEqual([
            ["div", null],
            ["ng-content", 0],
            ["ng-content", null]
          ]);
        });
      });
      it("should project into the first matching ng-content", () {
        expect(
            humanizeContentProjection(parse("<div>hello<b></b><a></a></div>", [
          createComp("div", ["a", "b", "*"])
        ]))).toEqual([
          ["div", null],
          ["#text(hello)", 2],
          ["b", 1],
          ["a", 0]
        ]);
      });
      it("should project into wildcard ng-content last", () {
        expect(humanizeContentProjection(parse("<div>hello<a></a></div>", [
          createComp("div", ["*", "a"])
        ]))).toEqual([
          ["div", null],
          ["#text(hello)", 0],
          ["a", 1]
        ]);
      });
      it("should only project direct child nodes", () {
        expect(humanizeContentProjection(
            parse("<div><span><a></a></span><a></a></div>", [
          createComp("div", ["a"])
        ]))).toEqual([
          ["div", null],
          ["span", null],
          ["a", null],
          ["a", 0]
        ]);
      });
      it("should project nodes of nested components", () {
        expect(humanizeContentProjection(parse("<a><b>hello</b></a>", [
          createComp("a", ["*"]),
          createComp("b", ["*"])
        ]))).toEqual([
          ["a", null],
          ["b", 0],
          ["#text(hello)", 0]
        ]);
      });
      it("should project children of components with ng-non-bindable", () {
        expect(humanizeContentProjection(
            parse("<div ng-non-bindable>{{hello}}<span></span></div>", [
          createComp("div", ["*"])
        ]))).toEqual([
          ["div", null],
          ["#text({{hello}})", 0],
          ["span", 0]
        ]);
      });
    });
    describe("splitClasses", () {
      it("should keep an empty class", () {
        expect(splitClasses("a")).toEqual(["a"]);
      });
      it("should split 2 classes", () {
        expect(splitClasses("a b")).toEqual(["a", "b"]);
      });
      it("should trim classes", () {
        expect(splitClasses(" a  b ")).toEqual(["a", "b"]);
      });
    });
    describe("error cases", () {
      it("should report invalid property names", () {
        expect(() => parse("<div [invalid-prop]></div>", []))
            .toThrowError('''Template parse errors:
Can\'t bind to \'invalidProp\' since it isn\'t a known native property ("<div [ERROR ->][invalid-prop]></div>"): TestComp@0:5''');
      });
      it("should report errors in expressions", () {
        expect(() => parse("<div [prop]=\"a b\"></div>", []))
            .toThrowErrorWith('''Template parse errors:
Parser Error: Unexpected token \'b\' at column 3 in [a b] in TestComp@0:5 ("<div [ERROR ->][prop]="a b"></div>"): TestComp@0:5''');
      });
      it("should not throw on invalid property names if the property is used by a directive",
          () {
        var dirA = CompileDirectiveMetadata.create(
            selector: "div",
            type: new CompileTypeMetadata(name: "DirA"),
            inputs: ["invalidProp"]);
        expect(() => parse("<div [invalid-prop]></div>", [dirA])).not.toThrow();
      });
      it("should not allow more than 1 component per element", () {
        var dirA = CompileDirectiveMetadata.create(
            selector: "div",
            isComponent: true,
            type: new CompileTypeMetadata(name: "DirA"),
            template: new CompileTemplateMetadata(ngContentSelectors: []));
        var dirB = CompileDirectiveMetadata.create(
            selector: "div",
            isComponent: true,
            type: new CompileTypeMetadata(name: "DirB"),
            template: new CompileTemplateMetadata(ngContentSelectors: []));
        expect(() => parse("<div/>", [dirB, dirA]))
            .toThrowError('''Template parse errors:
More than one component: DirB,DirA ("[ERROR ->]<div/>"): TestComp@0:0''');
      });
      it("should not allow components or element bindings nor dom events on explicit embedded templates",
          () {
        var dirA = CompileDirectiveMetadata.create(
            selector: "[a]",
            isComponent: true,
            type: new CompileTypeMetadata(name: "DirA"),
            template: new CompileTemplateMetadata(ngContentSelectors: []));
        expect(() => parse("<template [a]=\"b\" (e)=\"f\"></template>", [dirA]))
            .toThrowError('''Template parse errors:
Event binding e not emitted by any directive on an embedded template ("<template [a]="b" [ERROR ->](e)="f"></template>"): TestComp@0:18
Components on an embedded template: DirA ("[ERROR ->]<template [a]="b" (e)="f"></template>"): TestComp@0:0
Property binding a not used by any directive on an embedded template ("[ERROR ->]<template [a]="b" (e)="f"></template>"): TestComp@0:0''');
      });
      it("should not allow components or element bindings on inline embedded templates",
          () {
        var dirA = CompileDirectiveMetadata.create(
            selector: "[a]",
            isComponent: true,
            type: new CompileTypeMetadata(name: "DirA"),
            template: new CompileTemplateMetadata(ngContentSelectors: []));
        expect(() => parse("<div *a=\"b\"></div>", [dirA]))
            .toThrowError('''Template parse errors:
Components on an embedded template: DirA ("[ERROR ->]<div *a="b"></div>"): TestComp@0:0
Property binding a not used by any directive on an embedded template ("[ERROR ->]<div *a="b"></div>"): TestComp@0:0''');
      });
    });
    describe("ignore elements", () {
      it("should ignore <script> elements", () {
        expect(humanizeTplAst(parse("<script></script>a", []))).toEqual([
          [TextAst, "a"]
        ]);
      });
      it("should ignore <style> elements", () {
        expect(humanizeTplAst(parse("<style></style>a", []))).toEqual([
          [TextAst, "a"]
        ]);
      });
      describe("<link rel=\"stylesheet\">", () {
        it("should keep <link rel=\"stylesheet\"> elements if they have an absolute non package: url",
            () {
          expect(humanizeTplAst(parse(
              "<link rel=\"stylesheet\" href=\"http://someurl\"></link>a",
              []))).toEqual([
            [ElementAst, "link"],
            [AttrAst, "rel", "stylesheet"],
            [AttrAst, "href", "http://someurl"],
            [TextAst, "a"]
          ]);
        });
        it("should keep <link rel=\"stylesheet\"> elements if they have no uri",
            () {
          expect(humanizeTplAst(parse("<link rel=\"stylesheet\"></link>a", [])))
              .toEqual([
            [ElementAst, "link"],
            [AttrAst, "rel", "stylesheet"],
            [TextAst, "a"]
          ]);
          expect(humanizeTplAst(parse("<link REL=\"stylesheet\"></link>a", [])))
              .toEqual([
            [ElementAst, "link"],
            [AttrAst, "REL", "stylesheet"],
            [TextAst, "a"]
          ]);
        });
        it("should ignore <link rel=\"stylesheet\"> elements if they have a relative uri",
            () {
          expect(humanizeTplAst(parse(
              "<link rel=\"stylesheet\" href=\"./other.css\"></link>a",
              []))).toEqual([
            [TextAst, "a"]
          ]);
          expect(humanizeTplAst(parse(
              "<link rel=\"stylesheet\" HREF=\"./other.css\"></link>a",
              []))).toEqual([
            [TextAst, "a"]
          ]);
        });
        it("should ignore <link rel=\"stylesheet\"> elements if they have a package: uri",
            () {
          expect(humanizeTplAst(parse(
              "<link rel=\"stylesheet\" href=\"package:somePackage\"></link>a",
              []))).toEqual([
            [TextAst, "a"]
          ]);
        });
      });
      it("should ignore bindings on children of elements with ng-non-bindable",
          () {
        expect(humanizeTplAst(parse("<div ng-non-bindable>{{b}}</div>", [])))
            .toEqual([
          [ElementAst, "div"],
          [AttrAst, "ng-non-bindable", ""],
          [TextAst, "{{b}}"]
        ]);
        expect(humanizeTplAst(parse("<div NG-NON-BINDABLE>{{b}}</div>", [])))
            .toEqual([
          [ElementAst, "div"],
          [AttrAst, "NG-NON-BINDABLE", ""],
          [TextAst, "{{b}}"]
        ]);
      });
      it("should keep nested children of elements with ng-non-bindable", () {
        expect(humanizeTplAst(
                parse("<div ng-non-bindable><span>{{b}}</span></div>", [])))
            .toEqual([
          [ElementAst, "div"],
          [AttrAst, "ng-non-bindable", ""],
          [ElementAst, "span"],
          [TextAst, "{{b}}"]
        ]);
      });
      it("should ignore <script> elements inside of elements with ng-non-bindable",
          () {
        expect(humanizeTplAst(
                parse("<div ng-non-bindable><script></script>a</div>", [])))
            .toEqual([
          [ElementAst, "div"],
          [AttrAst, "ng-non-bindable", ""],
          [TextAst, "a"]
        ]);
      });
      it("should ignore <style> elements inside of elements with ng-non-bindable",
          () {
        expect(humanizeTplAst(
            parse("<div ng-non-bindable><style></style>a</div>", []))).toEqual([
          [ElementAst, "div"],
          [AttrAst, "ng-non-bindable", ""],
          [TextAst, "a"]
        ]);
      });
      it("should ignore <link rel=\"stylesheet\"> elements inside of elements with ng-non-bindable",
          () {
        expect(humanizeTplAst(parse(
            "<div ng-non-bindable><link rel=\"stylesheet\"></link>a</div>",
            []))).toEqual([
          [ElementAst, "div"],
          [AttrAst, "ng-non-bindable", ""],
          [TextAst, "a"]
        ]);
      });
      it("should convert <ng-content> elements into regular elements inside of elements with ng-non-bindable",
          () {
        expect(humanizeTplAst(parse(
                "<div ng-non-bindable><ng-content></ng-content>a</div>", [])))
            .toEqual([
          [ElementAst, "div"],
          [AttrAst, "ng-non-bindable", ""],
          [ElementAst, "ng-content"],
          [TextAst, "a"]
        ]);
      });
    });
    describe("source spans", () {
      it("should support ng-content", () {
        var parsed = parse("<ng-content select=\"a\">", []);
        expect(humanizeTplAstSourceSpans(parsed)).toEqual([
          [NgContentAst, "<ng-content select=\"a\">"]
        ]);
      });
      it("should support embedded template", () {
        expect(humanizeTplAstSourceSpans(parse("<template></template>", [])))
            .toEqual([
          [EmbeddedTemplateAst, "<template>"]
        ]);
      });
      it("should support element and attributes", () {
        expect(humanizeTplAstSourceSpans(parse("<div key=value>", [])))
            .toEqual([
          [ElementAst, "div", "<div key=value>"],
          [AttrAst, "key", "value", "key=value"]
        ]);
      });
      it("should support variables", () {
        var dirA = CompileDirectiveMetadata.create(
            selector: "[a]",
            type: new CompileTypeMetadata(name: "DirA"),
            exportAs: "dirA");
        expect(humanizeTplAstSourceSpans(
            parse("<div a #a=\"dirA\"></div>", [dirA]))).toEqual([
          [ElementAst, "div", "<div a #a=\"dirA\">"],
          [AttrAst, "a", "", "a"],
          [DirectiveAst, dirA, "<div a #a=\"dirA\">"],
          [VariableAst, "a", "dirA", "#a=\"dirA\""]
        ]);
      });
      it("should support event", () {
        expect(humanizeTplAstSourceSpans(
            parse("<div (window:event)=\"v\">", []))).toEqual([
          [ElementAst, "div", "<div (window:event)=\"v\">"],
          [BoundEventAst, "event", "window", "v", "(window:event)=\"v\""]
        ]);
      });
      it("should support element property", () {
        expect(humanizeTplAstSourceSpans(parse("<div [someProp]=\"v\">", [])))
            .toEqual([
          [ElementAst, "div", "<div [someProp]=\"v\">"],
          [
            BoundElementPropertyAst,
            PropertyBindingType.Property,
            "someProp",
            "v",
            null,
            "[someProp]=\"v\""
          ]
        ]);
      });
      it("should support bound text", () {
        expect(humanizeTplAstSourceSpans(parse("{{a}}", []))).toEqual([
          [BoundTextAst, "{{ a }}", "{{a}}"]
        ]);
      });
      it("should support text nodes", () {
        expect(humanizeTplAstSourceSpans(parse("a", []))).toEqual([
          [TextAst, "a", "a"]
        ]);
      });
      it("should support directive", () {
        var dirA = CompileDirectiveMetadata.create(
            selector: "[a]", type: new CompileTypeMetadata(name: "DirA"));
        var comp = CompileDirectiveMetadata.create(
            selector: "div",
            isComponent: true,
            type: new CompileTypeMetadata(name: "ZComp"),
            template: new CompileTemplateMetadata(ngContentSelectors: []));
        expect(humanizeTplAstSourceSpans(parse("<div a>", [dirA, comp])))
            .toEqual([
          [ElementAst, "div", "<div a>"],
          [AttrAst, "a", "", "a"],
          [DirectiveAst, comp, "<div a>"],
          [DirectiveAst, dirA, "<div a>"]
        ]);
      });
      it("should support directive property", () {
        var dirA = CompileDirectiveMetadata.create(
            selector: "div",
            type: new CompileTypeMetadata(name: "DirA"),
            inputs: ["aProp"]);
        expect(humanizeTplAstSourceSpans(
            parse("<div [a-prop]=\"foo | bar\"></div>", [dirA]))).toEqual([
          [ElementAst, "div", "<div [a-prop]=\"foo | bar\">"],
          [DirectiveAst, dirA, "<div [a-prop]=\"foo | bar\">"],
          [
            BoundDirectivePropertyAst,
            "aProp",
            "(foo | bar)",
            "[a-prop]=\"foo | bar\""
          ]
        ]);
      });
    });
  });
}

List<dynamic> humanizeTplAst(List<TemplateAst> templateAsts) {
  var humanizer = new TemplateHumanizer(false);
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

List<dynamic> humanizeTplAstSourceSpans(List<TemplateAst> templateAsts) {
  var humanizer = new TemplateHumanizer(true);
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateHumanizer implements TemplateAstVisitor {
  bool includeSourceSpan;
  List<dynamic> result = [];
  TemplateHumanizer(this.includeSourceSpan) {}
  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    var res = [NgContentAst];
    this.result.add(this._appendContext(ast, res));
    return null;
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    var res = [EmbeddedTemplateAst];
    this.result.add(this._appendContext(ast, res));
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.vars);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    var res = [ElementAst, ast.name];
    this.result.add(this._appendContext(ast, res));
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.exportAsVars);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitVariable(VariableAst ast, dynamic context) {
    var res = [VariableAst, ast.name, ast.value];
    this.result.add(this._appendContext(ast, res));
    return null;
  }

  dynamic visitEvent(BoundEventAst ast, dynamic context) {
    var res = [
      BoundEventAst,
      ast.name,
      ast.target,
      expressionUnparser.unparse(ast.handler)
    ];
    this.result.add(this._appendContext(ast, res));
    return null;
  }

  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context) {
    var res = [
      BoundElementPropertyAst,
      ast.type,
      ast.name,
      expressionUnparser.unparse(ast.value),
      ast.unit
    ];
    this.result.add(this._appendContext(ast, res));
    return null;
  }

  dynamic visitAttr(AttrAst ast, dynamic context) {
    var res = [AttrAst, ast.name, ast.value];
    this.result.add(this._appendContext(ast, res));
    return null;
  }

  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    var res = [BoundTextAst, expressionUnparser.unparse(ast.value)];
    this.result.add(this._appendContext(ast, res));
    return null;
  }

  dynamic visitText(TextAst ast, dynamic context) {
    var res = [TextAst, ast.value];
    this.result.add(this._appendContext(ast, res));
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, dynamic context) {
    var res = [DirectiveAst, ast.directive];
    this.result.add(this._appendContext(ast, res));
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.hostProperties);
    templateVisitAll(this, ast.hostEvents);
    templateVisitAll(this, ast.exportAsVars);
    return null;
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    var res = [
      BoundDirectivePropertyAst,
      ast.directiveName,
      expressionUnparser.unparse(ast.value)
    ];
    this.result.add(this._appendContext(ast, res));
    return null;
  }

  List<dynamic> _appendContext(TemplateAst ast, List<dynamic> input) {
    if (!this.includeSourceSpan) return input;
    input.add(ast.sourceSpan.toString());
    return input;
  }
}

String sourceInfo(TemplateAst ast) {
  return '''${ ast . sourceSpan}: ${ ast . sourceSpan . start}''';
}

List<dynamic> humanizeContentProjection(List<TemplateAst> templateAsts) {
  var humanizer = new TemplateContentProjectionHumanizer();
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateContentProjectionHumanizer implements TemplateAstVisitor {
  List<dynamic> result = [];
  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    this.result.add(["ng-content", ast.ngContentIndex]);
    return null;
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    this.result.add(["template", ast.ngContentIndex]);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    this.result.add([ast.name, ast.ngContentIndex]);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitVariable(VariableAst ast, dynamic context) {
    return null;
  }

  dynamic visitEvent(BoundEventAst ast, dynamic context) {
    return null;
  }

  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context) {
    return null;
  }

  dynamic visitAttr(AttrAst ast, dynamic context) {
    return null;
  }

  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    this.result.add([
      '''#text(${ expressionUnparser . unparse ( ast . value )})''',
      ast.ngContentIndex
    ]);
    return null;
  }

  dynamic visitText(TextAst ast, dynamic context) {
    this.result.add(['''#text(${ ast . value})''', ast.ngContentIndex]);
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, dynamic context) {
    return null;
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    return null;
  }
}

class FooAstTransformer implements TemplateAstVisitor {
  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    if (ast.name != "div") return ast;
    return new ElementAst(
        "foo", [], [], [], [], [], [], ast.ngContentIndex, ast.sourceSpan);
  }

  dynamic visitVariable(VariableAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitEvent(BoundEventAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitAttr(AttrAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitText(TextAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitDirective(DirectiveAst ast, dynamic context) {
    throw "not implemented";
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    throw "not implemented";
  }
}

class BarAstTransformer extends FooAstTransformer {
  dynamic visitElement(ElementAst ast, dynamic context) {
    if (ast.name != "foo") return ast;
    return new ElementAst(
        "bar", [], [], [], [], [], [], ast.ngContentIndex, ast.sourceSpan);
  }
}
