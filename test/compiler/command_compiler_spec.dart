library angular2.test.compiler.command_compiler_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        xdescribe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        AsyncTestCompleter,
        inject,
        beforeEachProviders;
import "package:angular2/src/facade/lang.dart"
    show stringify, isType, Type, isBlank, serializeEnum, IS_DART;
import "package:angular2/src/facade/collection.dart" show MapWrapper;
import "package:angular2/src/facade/async.dart" show PromiseWrapper, Future;
import "package:angular2/src/compiler/template_parser.dart" show TemplateParser;
import "package:angular2/src/core/linker/template_commands.dart"
    show
        CommandVisitor,
        TextCmd,
        NgContentCmd,
        BeginElementCmd,
        BeginComponentCmd,
        EmbeddedTemplateCmd,
        TemplateCmd,
        visitAllCommands,
        CompiledComponentTemplate;
import "package:angular2/src/compiler/command_compiler.dart"
    show CommandCompiler;
import "package:angular2/src/compiler/directive_metadata.dart"
    show CompileDirectiveMetadata, CompileTypeMetadata, CompileTemplateMetadata;
import "package:angular2/src/compiler/source_module.dart"
    show SourceModule, SourceExpression, moduleRef;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "eval_module.dart" show evalModule;
import "package:angular2/src/compiler/util.dart"
    show
        escapeSingleQuoteString,
        codeGenValueFn,
        codeGenExportVariable,
        codeGenConstConstructorCall,
        MODULE_SUFFIX;
import "test_bindings.dart" show TEST_PROVIDERS;

const BEGIN_ELEMENT = "BEGIN_ELEMENT";
const END_ELEMENT = "END_ELEMENT";
const BEGIN_COMPONENT = "BEGIN_COMPONENT";
const END_COMPONENT = "END_COMPONENT";
const TEXT = "TEXT";
const NG_CONTENT = "NG_CONTENT";
const EMBEDDED_TEMPLATE = "EMBEDDED_TEMPLATE";
// Attention: These module names have to correspond to real modules!
var THIS_MODULE_URL =
    '''package:angular2/test/compiler/command_compiler_spec${ MODULE_SUFFIX}''';
var THIS_MODULE_REF = moduleRef(THIS_MODULE_URL);
var TEMPLATE_COMMANDS_MODULE_REF = moduleRef(
    '''package:angular2/src/core/linker/template_commands${ MODULE_SUFFIX}''');

// Attention: read by eval!
class RootComp {}

class SomeDir {}

class AComp {}

var RootCompTypeMeta = new CompileTypeMetadata(
    name: "RootComp", runtime: RootComp, moduleUrl: THIS_MODULE_URL);
var SomeDirTypeMeta = new CompileTypeMetadata(
    name: "SomeDir", runtime: SomeDir, moduleUrl: THIS_MODULE_URL);
var ACompTypeMeta = new CompileTypeMetadata(
    name: "AComp", runtime: AComp, moduleUrl: THIS_MODULE_URL);
Map<CompileTypeMetadata, String> compTypeTemplateId =
    MapWrapper.createFromPairs([
  [RootCompTypeMeta, "rootCompId"],
  [SomeDirTypeMeta, "someDirId"],
  [ACompTypeMeta, "aCompId"]
]);
main() {
  describe("CommandCompiler", () {
    beforeEachProviders(() => TEST_PROVIDERS);
    TemplateParser parser;
    CommandCompiler commandCompiler;
    Function componentTemplateFactory;
    beforeEach(inject([TemplateParser, CommandCompiler],
        (_templateParser, _commandCompiler) {
      parser = _templateParser;
      commandCompiler = _commandCompiler;
    }));
    CompileDirectiveMetadata createComp(
        {type, selector, template, encapsulation, ngContentSelectors}) {
      if (isBlank(encapsulation)) {
        encapsulation = ViewEncapsulation.None;
      }
      if (isBlank(selector)) {
        selector = "root";
      }
      if (isBlank(ngContentSelectors)) {
        ngContentSelectors = [];
      }
      if (isBlank(template)) {
        template = "";
      }
      return CompileDirectiveMetadata.create(
          selector: selector,
          isComponent: true,
          type: type,
          template: new CompileTemplateMetadata(
              template: template,
              ngContentSelectors: ngContentSelectors,
              encapsulation: encapsulation));
    }
    CompileDirectiveMetadata createDirective(
        CompileTypeMetadata type, String selector,
        [String exportAs = null]) {
      return CompileDirectiveMetadata.create(
          selector: selector,
          exportAs: exportAs,
          isComponent: false,
          type: type);
    }
    createTests(Function run) {
      describe("text", () {
        it(
            "should create unbound text commands",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(type: RootCompTypeMeta, template: "a");
              run(rootComp, []).then((data) {
                expect(data).toEqual([
                  [TEXT, "a", false, null]
                ]);
                async.done();
              });
            }));
        it(
            "should create bound text commands",
            inject([AsyncTestCompleter], (async) {
              var rootComp =
                  createComp(type: RootCompTypeMeta, template: "{{a}}");
              run(rootComp, []).then((data) {
                expect(data).toEqual([
                  [TEXT, null, true, null]
                ]);
                async.done();
              });
            }));
      });
      describe("elements", () {
        it(
            "should create unbound element commands",
            inject([AsyncTestCompleter], (async) {
              var rootComp =
                  createComp(type: RootCompTypeMeta, template: "<div a=\"b\">");
              run(rootComp, []).then((data) {
                expect(data).toEqual([
                  [
                    BEGIN_ELEMENT,
                    "div",
                    ["a", "b"],
                    [],
                    [],
                    [],
                    false,
                    null
                  ],
                  [END_ELEMENT]
                ]);
                async.done();
              });
            }));
        it(
            "should create bound element commands",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template:
                      "<div a=\"b\" #some-var (click)=\"someHandler\" (window:scroll)=\"scrollTo()\">");
              run(rootComp, []).then((data) {
                expect(data).toEqual([
                  [
                    BEGIN_ELEMENT,
                    "div",
                    ["a", "b"],
                    [null, "click", "window", "scroll"],
                    ["someVar", null],
                    [],
                    true,
                    null
                  ],
                  [END_ELEMENT]
                ]);
                async.done();
              });
            }));
        it(
            "should create element commands with directives",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template: "<div a #some-var=\"someExport\">");
              var dir = CompileDirectiveMetadata.create(
                  selector: "[a]",
                  exportAs: "someExport",
                  isComponent: false,
                  type: SomeDirTypeMeta,
                  host: {
                    "(click)": "doIt()",
                    "(window:scroll)": "doIt()",
                    "role": "button"
                  });
              run(rootComp, [dir]).then((data) {
                expect(data).toEqual([
                  [
                    BEGIN_ELEMENT,
                    "div",
                    ["a", "", "role", "button"],
                    [null, "click", "window", "scroll"],
                    ["someVar", 0],
                    ["SomeDirType"],
                    true,
                    null
                  ],
                  [END_ELEMENT]
                ]);
                async.done();
              });
            }));
        it(
            "should merge element attributes with host attributes",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template:
                      "<div class=\"origclass\" style=\"color: red;\" role=\"origrole\" attr1>");
              var dir = CompileDirectiveMetadata.create(
                  selector: "div",
                  isComponent: false,
                  type: SomeDirTypeMeta,
                  host: {
                    "class": "newclass",
                    "style": "newstyle",
                    "role": "newrole",
                    "attr2": ""
                  });
              run(rootComp, [dir]).then((data) {
                expect(data).toEqual([
                  [
                    BEGIN_ELEMENT,
                    "div",
                    [
                      "attr1",
                      "",
                      "attr2",
                      "",
                      "class",
                      "origclass newclass",
                      "role",
                      "newrole",
                      "style",
                      "color: red; newstyle"
                    ],
                    [],
                    [],
                    ["SomeDirType"],
                    true,
                    null
                  ],
                  [END_ELEMENT]
                ]);
                async.done();
              });
            }));
        it(
            "should create nested nodes",
            inject([AsyncTestCompleter], (async) {
              var rootComp =
                  createComp(type: RootCompTypeMeta, template: "<div>a</div>");
              run(rootComp, []).then((data) {
                expect(data).toEqual([
                  [BEGIN_ELEMENT, "div", [], [], [], [], false, null],
                  [TEXT, "a", false, null],
                  [END_ELEMENT]
                ]);
                async.done();
              });
            }));
      });
      describe("components", () {
        it(
            "should create component commands",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template: "<a a=\"b\" #some-var (click)=\"someHandler\">");
              var comp = createComp(type: ACompTypeMeta, selector: "a");
              run(rootComp, [comp]).then((data) {
                expect(data).toEqual([
                  [
                    BEGIN_COMPONENT,
                    "a",
                    ["a", "b"],
                    [null, "click"],
                    ["someVar", 0],
                    ["ACompType"],
                    serializeEnum(ViewEncapsulation.None),
                    null,
                    "aCompId"
                  ],
                  [END_COMPONENT]
                ]);
                async.done();
              });
            }));
        it(
            "should store viewEncapsulation",
            inject([AsyncTestCompleter], (async) {
              var rootComp =
                  createComp(type: RootCompTypeMeta, template: "<a></a>");
              var comp = createComp(
                  type: ACompTypeMeta,
                  selector: "a",
                  encapsulation: ViewEncapsulation.Native);
              run(rootComp, [comp]).then((data) {
                expect(data).toEqual([
                  [
                    BEGIN_COMPONENT,
                    "a",
                    [],
                    [],
                    [],
                    ["ACompType"],
                    serializeEnum(ViewEncapsulation.Native),
                    null,
                    "aCompId"
                  ],
                  [END_COMPONENT]
                ]);
                async.done();
              });
            }));
        it(
            "should create nested nodes and set ngContentIndex",
            inject([AsyncTestCompleter], (async) {
              var rootComp =
                  createComp(type: RootCompTypeMeta, template: "<a>t</a>");
              var comp = createComp(
                  type: ACompTypeMeta,
                  selector: "a",
                  ngContentSelectors: ["*"]);
              run(rootComp, [comp]).then((data) {
                expect(data).toEqual([
                  [
                    BEGIN_COMPONENT,
                    "a",
                    [],
                    [],
                    [],
                    ["ACompType"],
                    serializeEnum(ViewEncapsulation.None),
                    null,
                    "aCompId"
                  ],
                  [TEXT, "t", false, 0],
                  [END_COMPONENT]
                ]);
                async.done();
              });
            }));
      });
      describe("embedded templates", () {
        it(
            "should create embedded template commands",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template: "<template a=\"b\"></template>");
              var dir = createDirective(SomeDirTypeMeta, "[a]");
              run(rootComp, [dir], 1).then((data) {
                expect(data).toEqual([
                  [
                    EMBEDDED_TEMPLATE,
                    ["a", "b"],
                    [],
                    ["SomeDirType"],
                    false,
                    null,
                    "cd1",
                    []
                  ]
                ]);
                async.done();
              });
            }));
        it(
            "should keep variable name and value for <template> elements",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template:
                      "<template #some-var=\"someValue\" #some-empty-var></template>");
              var dir = createDirective(SomeDirTypeMeta, "[a]");
              run(rootComp, [dir], 1).then((data) {
                expect(data[0][2]).toEqual(
                    ["someVar", "someValue", "someEmptyVar", "\$implicit"]);
                async.done();
              });
            }));
        it(
            "should keep variable name and value for template attributes",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template:
                      "<div template=\"var someVar=someValue; var someEmptyVar\"></div>");
              var dir = createDirective(SomeDirTypeMeta, "[a]");
              run(rootComp, [dir], 1).then((data) {
                expect(data[0][2]).toEqual(
                    ["someVar", "someValue", "someEmptyVar", "\$implicit"]);
                async.done();
              });
            }));
        it(
            "should created nested nodes",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta, template: "<template>t</template>");
              run(rootComp, [], 1).then((data) {
                expect(data).toEqual([
                  [
                    EMBEDDED_TEMPLATE,
                    [],
                    [],
                    [],
                    false,
                    null,
                    "cd1",
                    [
                      [TEXT, "t", false, null]
                    ]
                  ]
                ]);
                async.done();
              });
            }));
        it(
            "should calculate wether the template is merged based on nested ng-content elements",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template: "<template><ng-content></ng-content></template>");
              run(rootComp, [], 1).then((data) {
                expect(data).toEqual([
                  [
                    EMBEDDED_TEMPLATE,
                    [],
                    [],
                    [],
                    true,
                    null,
                    "cd1",
                    [
                      [NG_CONTENT, null]
                    ]
                  ]
                ]);
                async.done();
              });
            }));
      });
      describe("ngContent", () {
        it(
            "should create ng-content commands",
            inject([AsyncTestCompleter], (async) {
              var rootComp = createComp(
                  type: RootCompTypeMeta,
                  template: "<ng-content></ng-content>");
              run(rootComp, []).then((data) {
                expect(data).toEqual([
                  [NG_CONTENT, null]
                ]);
                async.done();
              });
            }));
      });
    }
    describe("compileComponentRuntime", () {
      beforeEach(() {
        componentTemplateFactory = (CompileDirectiveMetadata directive) {
          return () => new CompiledComponentTemplate(
              compTypeTemplateId[directive.type], null, null, null);
        };
      });
      Future<List<List<dynamic>>> run(CompileDirectiveMetadata component,
          List<CompileDirectiveMetadata> directives,
          [num embeddedTemplateCount = 0]) {
        var changeDetectorFactories = [];
        for (var i = 0; i < embeddedTemplateCount + 1; i++) {
          ((i) {
            changeDetectorFactories.add((_) => '''cd${ i}''');
          })(i);
        }
        var parsedTemplate = parser.parse(
            component.template.template, directives, component.type.name);
        var commands = commandCompiler.compileComponentRuntime(component,
            parsedTemplate, changeDetectorFactories, componentTemplateFactory);
        return PromiseWrapper.resolve(humanize(commands));
      }
      createTests(run);
    });
    describe("compileComponentCodeGen", () {
      beforeEach(() {
        componentTemplateFactory = (CompileDirectiveMetadata directive) {
          return '''${ directive . type . name}TemplateGetter''';
        };
      });
      Future<List<List<dynamic>>> run(CompileDirectiveMetadata component,
          List<CompileDirectiveMetadata> directives,
          [num embeddedTemplateCount = 0]) {
        var testDeclarations = [];
        var changeDetectorFactoryExpressions = [];
        for (var i = 0; i < embeddedTemplateCount + 1; i++) {
          var fnName = '''cd${ i}''';
          testDeclarations.add(
              '''${ codeGenValueFn ( [ "_" ] , ''' \'cd${ i}\' ''' , fnName )};''');
          changeDetectorFactoryExpressions.add(fnName);
        }
        for (var i = 0; i < directives.length; i++) {
          var directive = directives[i];
          if (directive.isComponent) {
            var nestedTemplate =
                '''${ codeGenConstConstructorCall ( TEMPLATE_COMMANDS_MODULE_REF + "CompiledComponentTemplate" )}(\'${ compTypeTemplateId [ directive . type ]}\', null, null, null)''';
            var getterName = '''${ directive . type . name}TemplateGetter''';
            testDeclarations.add(
                '''${ codeGenValueFn ( [ ] , nestedTemplate , getterName )};''');
          }
        }
        var parsedTemplate = parser.parse(
            component.template.template, directives, component.type.name);
        var sourceExpression = commandCompiler.compileComponentCodeGen(
            component,
            parsedTemplate,
            changeDetectorFactoryExpressions,
            componentTemplateFactory);
        testDeclarations
            .forEach((decl) => sourceExpression.declarations.add(decl));
        var testableModule =
            createTestableModule(sourceExpression).getSourceWithImports();
        return evalModule(testableModule.source, testableModule.imports, null);
      }
      createTests(run);
    });
  });
}

// Attention: read by eval!
List<List<dynamic>> humanize(List<TemplateCmd> cmds) {
  var visitor = new CommandHumanizer();
  visitAllCommands(visitor, cmds);
  return visitor.result;
}

String checkAndStringifyType(Type type) {
  expect(isType(type)).toBe(true);
  return '''${ stringify ( type )}Type''';
}

class CommandHumanizer implements CommandVisitor {
  List<List<dynamic>> result = [];
  dynamic visitText(TextCmd cmd, dynamic context) {
    this.result.add([TEXT, cmd.value, cmd.isBound, cmd.ngContentIndex]);
    return null;
  }

  dynamic visitNgContent(NgContentCmd cmd, dynamic context) {
    this.result.add([NG_CONTENT, cmd.ngContentIndex]);
    return null;
  }

  dynamic visitBeginElement(BeginElementCmd cmd, dynamic context) {
    this.result.add([
      BEGIN_ELEMENT,
      cmd.name,
      cmd.attrNameAndValues,
      cmd.eventTargetAndNames,
      cmd.variableNameAndValues,
      cmd.directives.map(checkAndStringifyType).toList(),
      cmd.isBound,
      cmd.ngContentIndex
    ]);
    return null;
  }

  dynamic visitEndElement(dynamic context) {
    this.result.add([END_ELEMENT]);
    return null;
  }

  dynamic visitBeginComponent(BeginComponentCmd cmd, dynamic context) {
    this.result.add([
      BEGIN_COMPONENT,
      cmd.name,
      cmd.attrNameAndValues,
      cmd.eventTargetAndNames,
      cmd.variableNameAndValues,
      cmd.directives.map(checkAndStringifyType).toList(),
      serializeEnum(cmd.encapsulation),
      cmd.ngContentIndex,
      cmd.templateId
    ]);
    return null;
  }

  dynamic visitEndComponent(dynamic context) {
    this.result.add([END_COMPONENT]);
    return null;
  }

  dynamic visitEmbeddedTemplate(EmbeddedTemplateCmd cmd, dynamic context) {
    this.result.add([
      EMBEDDED_TEMPLATE,
      cmd.attrNameAndValues,
      cmd.variableNameAndValues,
      cmd.directives.map(checkAndStringifyType).toList(),
      cmd.isMerged,
      cmd.ngContentIndex,
      cmd.changeDetectorFactory(null),
      humanize(cmd.children)
    ]);
    return null;
  }
}

SourceModule createTestableModule(SourceExpression source) {
  var resultExpression =
      '''${ THIS_MODULE_REF}humanize(${ source . expression})''';
  var testableSource = '''${ source . declarations . join ( "\n" )}
  ${ codeGenValueFn ( [ "_" ] , resultExpression , "_run" )};
  ${ codeGenExportVariable ( "run" )}_run;
  ''';
  return new SourceModule(null, testableSource);
}
