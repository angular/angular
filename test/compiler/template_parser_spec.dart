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
        beforeEachBindings;
import "package:angular2/src/core/di.dart" show provide;
import "test_bindings.dart" show TEST_PROVIDERS;
import "package:angular2/src/facade/lang.dart" show isPresent;
import "package:angular2/src/compiler/template_parser.dart"
    show TemplateParser, splitClasses;
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
    beforeEachBindings(() => [
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
    describe("parse", () {
      describe("nodes without bindings", () {
        it("should parse text nodes", () {
          expect(humanizeTemplateAsts(parse("a", []))).toEqual([
            [TextAst, "a", "TestComp > #text(a):nth-child(0)"]
          ]);
        });
        it("should parse elements with attributes", () {
          expect(humanizeTemplateAsts(parse("<div a=b>", []))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [AttrAst, "a", "b", "TestComp > div:nth-child(0)[a=b]"]
          ]);
        });
      });
      it("should parse ngContent", () {
        var parsed = parse("<ng-content select=\"a\">", []);
        expect(humanizeTemplateAsts(parsed)).toEqual([
          [NgContentAst, "TestComp > ng-content:nth-child(0)"]
        ]);
      });
      it("should parse bound text nodes", () {
        expect(humanizeTemplateAsts(parse("{{a}}", []))).toEqual([
          [BoundTextAst, "{{ a }}", "TestComp > #text({{a}}):nth-child(0)"]
        ]);
      });
      describe("bound properties", () {
        it("should parse and camel case bound properties", () {
          expect(humanizeTemplateAsts(parse("<div [some-prop]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "someProp",
              "v",
              null,
              "TestComp > div:nth-child(0)[[some-prop]=v]"
            ]
          ]);
        });
        it("should normalize property names via the element schema", () {
          expect(humanizeTemplateAsts(parse("<div [mapped-attr]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "mappedProp",
              "v",
              null,
              "TestComp > div:nth-child(0)[[mapped-attr]=v]"
            ]
          ]);
        });
        it("should parse and camel case bound attributes", () {
          expect(humanizeTemplateAsts(
              parse("<div [attr.some-attr]=\"v\">", []))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Attribute,
              "someAttr",
              "v",
              null,
              "TestComp > div:nth-child(0)[[attr.some-attr]=v]"
            ]
          ]);
        });
        it("should parse and dash case bound classes", () {
          expect(humanizeTemplateAsts(
              parse("<div [class.some-class]=\"v\">", []))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Class,
              "some-class",
              "v",
              null,
              "TestComp > div:nth-child(0)[[class.some-class]=v]"
            ]
          ]);
        });
        it("should parse and camel case bound styles", () {
          expect(humanizeTemplateAsts(
              parse("<div [style.some-style]=\"v\">", []))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Style,
              "someStyle",
              "v",
              null,
              "TestComp > div:nth-child(0)[[style.some-style]=v]"
            ]
          ]);
        });
        it("should parse bound properties via [...] and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div [prop]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null,
              "TestComp > div:nth-child(0)[[prop]=v]"
            ]
          ]);
        });
        it("should parse bound properties via bind- and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div bind-prop=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null,
              "TestComp > div:nth-child(0)[bind-prop=v]"
            ]
          ]);
        });
        it("should parse bound properties via {{...}} and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div prop=\"{{v}}\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "{{ v }}",
              null,
              "TestComp > div:nth-child(0)[prop={{v}}]"
            ]
          ]);
        });
      });
      describe("events", () {
        it("should parse bound events with a target", () {
          expect(humanizeTemplateAsts(parse("<div (window:event)=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundEventAst,
              "event",
              "window",
              "v",
              "TestComp > div:nth-child(0)[(window:event)=v]"
            ]
          ]);
        });
        it("should parse bound events via (...) and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div (event)=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundEventAst,
              "event",
              null,
              "v",
              "TestComp > div:nth-child(0)[(event)=v]"
            ]
          ]);
        });
        it("should camel case event names", () {
          expect(humanizeTemplateAsts(parse("<div (some-event)=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundEventAst,
              "someEvent",
              null,
              "v",
              "TestComp > div:nth-child(0)[(some-event)=v]"
            ]
          ]);
        });
        it("should parse bound events via on- and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div on-event=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundEventAst,
              "event",
              null,
              "v",
              "TestComp > div:nth-child(0)[on-event=v]"
            ]
          ]);
        });
        it("should allow events on explicit embedded templates that are emitted by a directive",
            () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "template",
              outputs: ["e"],
              type: new CompileTypeMetadata(name: "DirA"));
          expect(humanizeTemplateAsts(
              parse("<template (e)=\"f\"></template>", [dirA]))).toEqual([
            [EmbeddedTemplateAst, "TestComp > template:nth-child(0)"],
            [
              BoundEventAst,
              "e",
              null,
              "f",
              "TestComp > template:nth-child(0)[(e)=f]"
            ],
            [DirectiveAst, dirA, "TestComp > template:nth-child(0)"]
          ]);
        });
      });
      describe("bindon", () {
        it("should parse bound events and properties via [(...)] and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div [(prop)]=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null,
              "TestComp > div:nth-child(0)[[(prop)]=v]"
            ],
            [
              BoundEventAst,
              "propChange",
              null,
              "v = \$event",
              "TestComp > div:nth-child(0)[[(prop)]=v]"
            ]
          ]);
        });
        it("should parse bound events and properties via bindon- and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div bindon-prop=\"v\">", [])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "prop",
              "v",
              null,
              "TestComp > div:nth-child(0)[bindon-prop=v]"
            ],
            [
              BoundEventAst,
              "propChange",
              null,
              "v = \$event",
              "TestComp > div:nth-child(0)[bindon-prop=v]"
            ]
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
          expect(humanizeTemplateAsts(
              parse("<div a c b>", [dirA, dirB, dirC, comp]))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [AttrAst, "a", "", "TestComp > div:nth-child(0)[a=]"],
            [AttrAst, "b", "", "TestComp > div:nth-child(0)[b=]"],
            [AttrAst, "c", "", "TestComp > div:nth-child(0)[c=]"],
            [DirectiveAst, comp, "TestComp > div:nth-child(0)"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [DirectiveAst, dirB, "TestComp > div:nth-child(0)"],
            [DirectiveAst, dirC, "TestComp > div:nth-child(0)"]
          ]);
        });
        it("should locate directives in property bindings", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "[a=b]", type: new CompileTypeMetadata(name: "DirA"));
          var dirB = CompileDirectiveMetadata.create(
              selector: "[b]", type: new CompileTypeMetadata(name: "DirB"));
          expect(humanizeTemplateAsts(parse("<div [a]=\"b\">", [dirA, dirB])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "a",
              "b",
              null,
              "TestComp > div:nth-child(0)[[a]=b]"
            ],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"]
          ]);
        });
        it("should parse directive host properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              host: {"[a]": "expr"});
          expect(humanizeTemplateAsts(parse("<div></div>", [dirA]))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [
              BoundElementPropertyAst,
              PropertyBindingType.Property,
              "a",
              "expr",
              null,
              "TestComp > div:nth-child(0)"
            ]
          ]);
        });
        it("should parse directive host listeners", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              host: {"(a)": "expr"});
          expect(humanizeTemplateAsts(parse("<div></div>", [dirA]))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [BoundEventAst, "a", null, "expr", "TestComp > div:nth-child(0)"]
          ]);
        });
        it("should parse directive properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["aProp"]);
          expect(humanizeTemplateAsts(
              parse("<div [a-prop]=\"expr\"></div>", [dirA]))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [
              BoundDirectivePropertyAst,
              "aProp",
              "expr",
              "TestComp > div:nth-child(0)[[a-prop]=expr]"
            ]
          ]);
        });
        it("should parse renamed directive properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["b:a"]);
          expect(humanizeTemplateAsts(
              parse("<div [a]=\"expr\"></div>", [dirA]))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [
              BoundDirectivePropertyAst,
              "b",
              "expr",
              "TestComp > div:nth-child(0)[[a]=expr]"
            ]
          ]);
        });
        it("should parse literal directive properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["a"]);
          expect(humanizeTemplateAsts(
              parse("<div a=\"literal\"></div>", [dirA]))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [AttrAst, "a", "literal", "TestComp > div:nth-child(0)[a=literal]"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [
              BoundDirectivePropertyAst,
              "a",
              "\"literal\"",
              "TestComp > div:nth-child(0)[a=literal]"
            ]
          ]);
        });
        it("should favor explicit bound properties over literal properties",
            () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["a"]);
          expect(humanizeTemplateAsts(parse(
                  "<div a=\"literal\" [a]=\"'literal2'\"></div>", [dirA])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [AttrAst, "a", "literal", "TestComp > div:nth-child(0)[a=literal]"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [
              BoundDirectivePropertyAst,
              "a",
              "\"literal2\"",
              "TestComp > div:nth-child(0)[[a]='literal2']"
            ]
          ]);
        });
        it("should support optional directive properties", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "div",
              type: new CompileTypeMetadata(name: "DirA"),
              inputs: ["a"]);
          expect(humanizeTemplateAsts(parse("<div></div>", [dirA]))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"]
          ]);
        });
      });
      describe("variables", () {
        it("should parse variables via #... and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div #a>", []))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [VariableAst, "a", "", "TestComp > div:nth-child(0)[#a=]"]
          ]);
        });
        it("should parse variables via var-... and not report them as attributes",
            () {
          expect(humanizeTemplateAsts(parse("<div var-a>", []))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [VariableAst, "a", "", "TestComp > div:nth-child(0)[var-a=]"]
          ]);
        });
        it("should camel case variables", () {
          expect(humanizeTemplateAsts(parse("<div var-some-a>", []))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [
              VariableAst,
              "someA",
              "",
              "TestComp > div:nth-child(0)[var-some-a=]"
            ]
          ]);
        });
        it("should assign variables with empty value to the element", () {
          expect(humanizeTemplateAsts(parse("<div #a></div>", []))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [VariableAst, "a", "", "TestComp > div:nth-child(0)[#a=]"]
          ]);
        });
        it("should assign variables to directives via exportAs", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "[a]",
              type: new CompileTypeMetadata(name: "DirA"),
              exportAs: "dirA");
          expect(humanizeTemplateAsts(
              parse("<div a #a=\"dirA\"></div>", [dirA]))).toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [AttrAst, "a", "", "TestComp > div:nth-child(0)[a=]"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [VariableAst, "a", "dirA", "TestComp > div:nth-child(0)[#a=dirA]"]
          ]);
        });
        it("should report variables with values that dont match a directive as errors",
            () {
          expect(() => parse("<div #a=\"dirA\"></div>", []))
              .toThrowError('''Template parse errors:
There is no directive with "exportAs" set to "dirA" at TestComp > div:nth-child(0)[#a=dirA]''');
        });
        it("should allow variables with values that dont match a directive on embedded template elements",
            () {
          expect(humanizeTemplateAsts(
              parse("<template #a=\"b\"></template>", []))).toEqual([
            [EmbeddedTemplateAst, "TestComp > template:nth-child(0)"],
            [VariableAst, "a", "b", "TestComp > template:nth-child(0)[#a=b]"]
          ]);
        });
        it("should assign variables with empty value to components", () {
          var dirA = CompileDirectiveMetadata.create(
              selector: "[a]",
              isComponent: true,
              type: new CompileTypeMetadata(name: "DirA"),
              exportAs: "dirA",
              template: new CompileTemplateMetadata(ngContentSelectors: []));
          expect(humanizeTemplateAsts(parse("<div a #a></div>", [dirA])))
              .toEqual([
            [ElementAst, "div", "TestComp > div:nth-child(0)"],
            [AttrAst, "a", "", "TestComp > div:nth-child(0)[a=]"],
            [VariableAst, "a", "", "TestComp > div:nth-child(0)[#a=]"],
            [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
            [VariableAst, "a", "", "TestComp > div:nth-child(0)[#a=]"]
          ]);
        });
      });
      describe("explicit templates", () {
        it("should create embedded templates for <template> elements", () {
          expect(humanizeTemplateAsts(parse("<template></template>", [])))
              .toEqual([
            [EmbeddedTemplateAst, "TestComp > template:nth-child(0)"]
          ]);
        });
      });
      describe("inline templates", () {
        it("should wrap the element into an EmbeddedTemplateAST", () {
          expect(humanizeTemplateAsts(parse("<div template>", []))).toEqual([
            [EmbeddedTemplateAst, "TestComp > div:nth-child(0)"],
            [ElementAst, "div", "TestComp > div:nth-child(0)"]
          ]);
        });
        it("should parse bound properties", () {
          expect(humanizeTemplateAsts(
              parse("<div template=\"ngIf test\">", [ngIf]))).toEqual([
            [EmbeddedTemplateAst, "TestComp > div:nth-child(0)"],
            [DirectiveAst, ngIf, "TestComp > div:nth-child(0)"],
            [
              BoundDirectivePropertyAst,
              "ngIf",
              "test",
              "TestComp > div:nth-child(0)[template=ngIf test]"
            ],
            [ElementAst, "div", "TestComp > div:nth-child(0)"]
          ]);
        });
        it("should parse variables via #...", () {
          expect(humanizeTemplateAsts(
              parse("<div template=\"ngIf #a=b\">", []))).toEqual([
            [EmbeddedTemplateAst, "TestComp > div:nth-child(0)"],
            [
              VariableAst,
              "a",
              "b",
              "TestComp > div:nth-child(0)[template=ngIf #a=b]"
            ],
            [ElementAst, "div", "TestComp > div:nth-child(0)"]
          ]);
        });
        it("should parse variables via var ...", () {
          expect(humanizeTemplateAsts(
              parse("<div template=\"ngIf var a=b\">", []))).toEqual([
            [EmbeddedTemplateAst, "TestComp > div:nth-child(0)"],
            [
              VariableAst,
              "a",
              "b",
              "TestComp > div:nth-child(0)[template=ngIf var a=b]"
            ],
            [ElementAst, "div", "TestComp > div:nth-child(0)"]
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
            expect(humanizeTemplateAsts(
                parse("<div template=\"a b\" b>", [dirA, dirB]))).toEqual([
              [EmbeddedTemplateAst, "TestComp > div:nth-child(0)"],
              [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
              [
                BoundDirectivePropertyAst,
                "a",
                "b",
                "TestComp > div:nth-child(0)[template=a b]"
              ],
              [ElementAst, "div", "TestComp > div:nth-child(0)"],
              [AttrAst, "b", "", "TestComp > div:nth-child(0)[b=]"],
              [DirectiveAst, dirB, "TestComp > div:nth-child(0)"]
            ]);
          });
          it("should locate directives in variable bindings", () {
            var dirA = CompileDirectiveMetadata.create(
                selector: "[a=b]", type: new CompileTypeMetadata(name: "DirA"));
            var dirB = CompileDirectiveMetadata.create(
                selector: "[b]", type: new CompileTypeMetadata(name: "DirB"));
            expect(humanizeTemplateAsts(
                parse("<div template=\"#a=b\" b>", [dirA, dirB]))).toEqual([
              [EmbeddedTemplateAst, "TestComp > div:nth-child(0)"],
              [
                VariableAst,
                "a",
                "b",
                "TestComp > div:nth-child(0)[template=#a=b]"
              ],
              [DirectiveAst, dirA, "TestComp > div:nth-child(0)"],
              [ElementAst, "div", "TestComp > div:nth-child(0)"],
              [AttrAst, "b", "", "TestComp > div:nth-child(0)[b=]"],
              [DirectiveAst, dirB, "TestComp > div:nth-child(0)"]
            ]);
          });
        });
        it("should work with *... and use the attribute name as property binding name",
            () {
          expect(humanizeTemplateAsts(parse("<div *ng-if=\"test\">", [ngIf])))
              .toEqual([
            [EmbeddedTemplateAst, "TestComp > div:nth-child(0)"],
            [DirectiveAst, ngIf, "TestComp > div:nth-child(0)"],
            [
              BoundDirectivePropertyAst,
              "ngIf",
              "test",
              "TestComp > div:nth-child(0)[*ng-if=test]"
            ],
            [ElementAst, "div", "TestComp > div:nth-child(0)"]
          ]);
        });
        it("should work with *... and empty value", () {
          expect(humanizeTemplateAsts(parse("<div *ng-if>", [ngIf]))).toEqual([
            [EmbeddedTemplateAst, "TestComp > div:nth-child(0)"],
            [DirectiveAst, ngIf, "TestComp > div:nth-child(0)"],
            [
              BoundDirectivePropertyAst,
              "ngIf",
              "null",
              "TestComp > div:nth-child(0)[*ng-if=]"
            ],
            [ElementAst, "div", "TestComp > div:nth-child(0)"]
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
      it("should throw on invalid property names", () {
        expect(() => parse("<div [invalid-prop]></div>", []))
            .toThrowError('''Template parse errors:
Can\'t bind to \'invalidProp\' since it isn\'t a known native property in TestComp > div:nth-child(0)[[invalid-prop]=]''');
      });
      it("should report errors in expressions", () {
        expect(() => parse("<div [prop]=\"a b\"></div>", []))
            .toThrowErrorWith('''Template parse errors:
Parser Error: Unexpected token \'b\' at column 3 in [a b] in TestComp > div:nth-child(0)[[prop]=a b]''');
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
        expect(() => parse("<div>", [dirB, dirA]))
            .toThrowError('''Template parse errors:
More than one component: DirB,DirA in TestComp > div:nth-child(0)''');
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
Event binding e not emitted by any directive on an embedded template in TestComp > template:nth-child(0)
Components on an embedded template: DirA in TestComp > template:nth-child(0)
Property binding a not used by any directive on an embedded template in TestComp > template:nth-child(0)[[a]=b]''');
      });
      it("should not allow components or element bindings on inline embedded templates",
          () {
        var dirA = CompileDirectiveMetadata.create(
            selector: "[a]",
            isComponent: true,
            type: new CompileTypeMetadata(name: "DirA"),
            template: new CompileTemplateMetadata(ngContentSelectors: []));
        expect(() => parse("<div *a=\"b\">", [dirA]))
            .toThrowError('''Template parse errors:
Components on an embedded template: DirA in TestComp > div:nth-child(0)
Property binding a not used by any directive on an embedded template in TestComp > div:nth-child(0)[*a=b]''');
      });
    });
    describe("ignore elements", () {
      it("should ignore <script> elements but include them for source info",
          () {
        expect(humanizeTemplateAsts(parse("<script></script>a", []))).toEqual([
          [TextAst, "a", "TestComp > #text(a):nth-child(1)"]
        ]);
      });
      it("should ignore <style> elements but include them for source info", () {
        expect(humanizeTemplateAsts(parse("<style></style>a", []))).toEqual([
          [TextAst, "a", "TestComp > #text(a):nth-child(1)"]
        ]);
      });
      describe("<link rel=\"stylesheet\">", () {
        it("should keep <link rel=\"stylesheet\"> elements if they have an absolute non package: url",
            () {
          expect(humanizeTemplateAsts(parse(
              "<link rel=\"stylesheet\" href=\"http://someurl\"></link>a",
              []))).toEqual([
            [ElementAst, "link", "TestComp > link:nth-child(0)"],
            [
              AttrAst,
              "href",
              "http://someurl",
              "TestComp > link:nth-child(0)[href=http://someurl]"
            ],
            [
              AttrAst,
              "rel",
              "stylesheet",
              "TestComp > link:nth-child(0)[rel=stylesheet]"
            ],
            [TextAst, "a", "TestComp > #text(a):nth-child(1)"]
          ]);
        });
        it("should keep <link rel=\"stylesheet\"> elements if they have no uri",
            () {
          expect(humanizeTemplateAsts(
              parse("<link rel=\"stylesheet\"></link>a", []))).toEqual([
            [ElementAst, "link", "TestComp > link:nth-child(0)"],
            [
              AttrAst,
              "rel",
              "stylesheet",
              "TestComp > link:nth-child(0)[rel=stylesheet]"
            ],
            [TextAst, "a", "TestComp > #text(a):nth-child(1)"]
          ]);
        });
        it("should ignore <link rel=\"stylesheet\"> elements if they have a relative uri",
            () {
          expect(humanizeTemplateAsts(parse(
              "<link rel=\"stylesheet\" href=\"./other.css\"></link>a",
              []))).toEqual([
            [TextAst, "a", "TestComp > #text(a):nth-child(1)"]
          ]);
        });
        it("should ignore <link rel=\"stylesheet\"> elements if they have a package: uri",
            () {
          expect(humanizeTemplateAsts(parse(
              "<link rel=\"stylesheet\" href=\"package:somePackage\"></link>a",
              []))).toEqual([
            [TextAst, "a", "TestComp > #text(a):nth-child(1)"]
          ]);
        });
      });
      it("should ignore bindings on children of elements with ng-non-bindable",
          () {
        expect(humanizeTemplateAsts(
            parse("<div ng-non-bindable>{{b}}</div>", []))).toEqual([
          [ElementAst, "div", "TestComp > div:nth-child(0)"],
          [
            AttrAst,
            "ng-non-bindable",
            "",
            "TestComp > div:nth-child(0)[ng-non-bindable=]"
          ],
          [
            TextAst,
            "{{b}}",
            "TestComp > div:nth-child(0) > #text({{b}}):nth-child(0)"
          ]
        ]);
      });
      it("should keep nested children of elements with ng-non-bindable", () {
        expect(humanizeTemplateAsts(
                parse("<div ng-non-bindable><span>{{b}}</span></div>", [])))
            .toEqual([
          [ElementAst, "div", "TestComp > div:nth-child(0)"],
          [
            AttrAst,
            "ng-non-bindable",
            "",
            "TestComp > div:nth-child(0)[ng-non-bindable=]"
          ],
          [
            ElementAst,
            "span",
            "TestComp > div:nth-child(0) > span:nth-child(0)"
          ],
          [
            TextAst,
            "{{b}}",
            "TestComp > div:nth-child(0) > span:nth-child(0) > #text({{b}}):nth-child(0)"
          ]
        ]);
      });
      it("should ignore <script> elements inside of elements with ng-non-bindable but include them for source info",
          () {
        expect(humanizeTemplateAsts(
                parse("<div ng-non-bindable><script></script>a</div>", [])))
            .toEqual([
          [ElementAst, "div", "TestComp > div:nth-child(0)"],
          [
            AttrAst,
            "ng-non-bindable",
            "",
            "TestComp > div:nth-child(0)[ng-non-bindable=]"
          ],
          [TextAst, "a", "TestComp > div:nth-child(0) > #text(a):nth-child(1)"]
        ]);
      });
      it("should ignore <style> elements inside of elements with ng-non-bindable but include them for source info",
          () {
        expect(humanizeTemplateAsts(
            parse("<div ng-non-bindable><style></style>a</div>", []))).toEqual([
          [ElementAst, "div", "TestComp > div:nth-child(0)"],
          [
            AttrAst,
            "ng-non-bindable",
            "",
            "TestComp > div:nth-child(0)[ng-non-bindable=]"
          ],
          [TextAst, "a", "TestComp > div:nth-child(0) > #text(a):nth-child(1)"]
        ]);
      });
      it("should ignore <link rel=\"stylesheet\"> elements inside of elements with ng-non-bindable but include them for source info",
          () {
        expect(humanizeTemplateAsts(parse(
            "<div ng-non-bindable><link rel=\"stylesheet\"></link>a</div>",
            []))).toEqual([
          [ElementAst, "div", "TestComp > div:nth-child(0)"],
          [
            AttrAst,
            "ng-non-bindable",
            "",
            "TestComp > div:nth-child(0)[ng-non-bindable=]"
          ],
          [TextAst, "a", "TestComp > div:nth-child(0) > #text(a):nth-child(1)"]
        ]);
      });
      it("should convert <ng-content> elements into regular elements inside of elements with ng-non-bindable but include them for source info",
          () {
        expect(humanizeTemplateAsts(parse(
                "<div ng-non-bindable><ng-content></ng-content>a</div>", [])))
            .toEqual([
          [ElementAst, "div", "TestComp > div:nth-child(0)"],
          [
            AttrAst,
            "ng-non-bindable",
            "",
            "TestComp > div:nth-child(0)[ng-non-bindable=]"
          ],
          [
            ElementAst,
            "ng-content",
            "TestComp > div:nth-child(0) > ng-content:nth-child(0)"
          ],
          [TextAst, "a", "TestComp > div:nth-child(0) > #text(a):nth-child(1)"]
        ]);
      });
    });
  });
}

List<dynamic> humanizeTemplateAsts(List<TemplateAst> templateAsts) {
  var humanizer = new TemplateHumanizer();
  templateVisitAll(humanizer, templateAsts);
  return humanizer.result;
}

class TemplateHumanizer implements TemplateAstVisitor {
  List<dynamic> result = [];
  dynamic visitNgContent(NgContentAst ast, dynamic context) {
    this.result.add([NgContentAst, ast.sourceInfo]);
    return null;
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateAst ast, dynamic context) {
    this.result.add([EmbeddedTemplateAst, ast.sourceInfo]);
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.vars);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitElement(ElementAst ast, dynamic context) {
    this.result.add([ElementAst, ast.name, ast.sourceInfo]);
    templateVisitAll(this, ast.attrs);
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.outputs);
    templateVisitAll(this, ast.exportAsVars);
    templateVisitAll(this, ast.directives);
    templateVisitAll(this, ast.children);
    return null;
  }

  dynamic visitVariable(VariableAst ast, dynamic context) {
    this.result.add([VariableAst, ast.name, ast.value, ast.sourceInfo]);
    return null;
  }

  dynamic visitEvent(BoundEventAst ast, dynamic context) {
    this.result.add([
      BoundEventAst,
      ast.name,
      ast.target,
      expressionUnparser.unparse(ast.handler),
      ast.sourceInfo
    ]);
    return null;
  }

  dynamic visitElementProperty(BoundElementPropertyAst ast, dynamic context) {
    this.result.add([
      BoundElementPropertyAst,
      ast.type,
      ast.name,
      expressionUnparser.unparse(ast.value),
      ast.unit,
      ast.sourceInfo
    ]);
    return null;
  }

  dynamic visitAttr(AttrAst ast, dynamic context) {
    this.result.add([AttrAst, ast.name, ast.value, ast.sourceInfo]);
    return null;
  }

  dynamic visitBoundText(BoundTextAst ast, dynamic context) {
    this.result.add(
        [BoundTextAst, expressionUnparser.unparse(ast.value), ast.sourceInfo]);
    return null;
  }

  dynamic visitText(TextAst ast, dynamic context) {
    this.result.add([TextAst, ast.value, ast.sourceInfo]);
    return null;
  }

  dynamic visitDirective(DirectiveAst ast, dynamic context) {
    this.result.add([DirectiveAst, ast.directive, ast.sourceInfo]);
    templateVisitAll(this, ast.inputs);
    templateVisitAll(this, ast.hostProperties);
    templateVisitAll(this, ast.hostEvents);
    templateVisitAll(this, ast.exportAsVars);
    return null;
  }

  dynamic visitDirectiveProperty(
      BoundDirectivePropertyAst ast, dynamic context) {
    this.result.add([
      BoundDirectivePropertyAst,
      ast.directiveName,
      expressionUnparser.unparse(ast.value),
      ast.sourceInfo
    ]);
    return null;
  }
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
