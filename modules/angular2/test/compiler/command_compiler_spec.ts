import {
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
  inject
} from 'angular2/test_lib';

import {IS_DART} from '../platform';
import {CONST_EXPR, stringify, isType, Type, isBlank} from 'angular2/src/core/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
import {MockSchemaRegistry} from './template_parser_spec';
import {Parser, Lexer} from 'angular2/src/core/change_detection/change_detection';
import {
  CommandVisitor,
  TextCmd,
  NgContentCmd,
  BeginElementCmd,
  BeginComponentCmd,
  EmbeddedTemplateCmd,
  TemplateCmd,
  visitAllCommands,
  CompiledTemplate
} from 'angular2/src/core/compiler/template_commands';
import {CommandCompiler} from 'angular2/src/compiler/command_compiler';
import {
  DirectiveMetadata,
  TypeMetadata,
  TemplateMetadata,
  SourceModule
} from 'angular2/src/compiler/api';
import {ViewEncapsulation} from 'angular2/src/core/render/api';
import {evalModule} from './eval_module';
import {escapeSingleQuoteString} from 'angular2/src/compiler/util';

const BEGIN_ELEMENT = 'BEGIN_ELEMENT';
const END_ELEMENT = 'END_ELEMENT';
const BEGIN_COMPONENT = 'BEGIN_COMPONENT';
const END_COMPONENT = 'END_COMPONENT';
const TEXT = 'TEXT';
const NG_CONTENT = 'NG_CONTENT';
const EMBEDDED_TEMPLATE = 'EMBEDDED_TEMPLATE';

// Attention: These module names have to correspond to real modules!
const MODULE_NAME = 'angular2/test/compiler/command_compiler_spec';
const TEMPLATE_COMMANDS_MODULE_NAME = 'angular2/src/core/compiler/template_commands';

// Attention: read by eval!
export class RootComp {}
export class SomeDir {}
export class AComp {}

var RootCompTypeMeta =
    new TypeMetadata({typeName: 'RootComp', id: 1, type: RootComp, typeUrl: MODULE_NAME});
var SomeDirTypeMeta =
    new TypeMetadata({typeName: 'SomeDir', id: 2, type: SomeDir, typeUrl: MODULE_NAME});
var ACompTypeMeta = new TypeMetadata({typeName: 'AComp', id: 3, type: AComp, typeUrl: MODULE_NAME});

var NESTED_COMPONENT = new CompiledTemplate('someNestedComponentId', []);

export function main() {
  describe('CommandCompiler', () => {
    var domParser: HtmlParser;
    var parser: TemplateParser;
    var commandCompiler: CommandCompiler;
    var componentTemplateFactory: Function;

    beforeEach(() => {
      domParser = new HtmlParser();
      parser = new TemplateParser(
          new Parser(new Lexer()),
          new MockSchemaRegistry({'invalidProp': false}, {'mappedAttr': 'mappedProp'}));
      commandCompiler = new CommandCompiler();
    });

    function createComp({type, selector, template, encapsulation, ngContentSelectors}: {
      type?: TypeMetadata,
      selector?: string,
      template?: string,
      encapsulation?: ViewEncapsulation,
      ngContentSelectors?: string[]
    }): DirectiveMetadata {
      if (isBlank(encapsulation)) {
        encapsulation = ViewEncapsulation.None;
      }
      if (isBlank(selector)) {
        selector = 'root';
      }
      if (isBlank(ngContentSelectors)) {
        ngContentSelectors = [];
      }
      if (isBlank(template)) {
        template = '';
      }
      return new DirectiveMetadata({
        selector: selector,
        isComponent: true,
        type: type,
        template: new TemplateMetadata({
          template: template,
          ngContentSelectors: ngContentSelectors,
          encapsulation: encapsulation
        })
      });
    }

    function createDirective(type: TypeMetadata, selector: string): DirectiveMetadata {
      return new DirectiveMetadata({selector: selector, isComponent: false, type: type});
    }


    function createTests(run: Function) {
      describe('text', () => {

        it('should create unbound text commands', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({type: RootCompTypeMeta, template: 'a'});
             run(rootComp, [])
                 .then((data) => {
                   expect(data).toEqual([[TEXT, 'a', false, null]]);
                   async.done();
                 });
           }));

        it('should create bound text commands', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({type: RootCompTypeMeta, template: '{{a}}'});
             run(rootComp, [])
                 .then((data) => {
                   expect(data).toEqual([[TEXT, null, true, null]]);
                   async.done();
                 });
           }));

      });

      describe('elements', () => {

        it('should create unbound element commands', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({type: RootCompTypeMeta, template: '<div a="b">'});
             run(rootComp, [])
                 .then((data) => {
                   expect(data).toEqual([
                     [BEGIN_ELEMENT, 'div', ['a', 'b'], [], [], [], false, null],
                     [END_ELEMENT]
                   ]);
                   async.done();
                 });
           }));

        it('should create bound element commands', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({
               type: RootCompTypeMeta,
               template: '<div a="b" #some-var="someValue" (click)="someHandler">'
             });
             var dir = createDirective(SomeDirTypeMeta, '[a]');
             run(rootComp, [dir])
                 .then((data) => {
                   expect(data).toEqual([
                     [
                       BEGIN_ELEMENT,
                       'div',
                       ['a', 'b'],
                       ['click'],
                       ['someVar', 'someValue'],
                       ['SomeDirType'],
                       true,
                       null
                     ],
                     [END_ELEMENT]
                   ]);
                   async.done();
                 });
           }));

        it('should emulate style encapsulation', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({
               type: RootCompTypeMeta,
               template: '<div>',
               encapsulation: ViewEncapsulation.Emulated
             });
             run(rootComp, [])
                 .then((data) => {
                   expect(data).toEqual([
                     [BEGIN_ELEMENT, 'div', ['_ngcontent-1', ''], [], [], [], false, null],
                     [END_ELEMENT]
                   ]);
                   async.done();
                 });
           }));

        it('should create nested nodes', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({type: RootCompTypeMeta, template: '<div>a</div>'});
             run(rootComp, [])
                 .then((data) => {
                   expect(data).toEqual([
                     [BEGIN_ELEMENT, 'div', [], [], [], [], false, null],
                     [TEXT, 'a', false, null],
                     [END_ELEMENT]
                   ]);
                   async.done();
                 });
           }));
      });

      describe('components', () => {

        it('should create component commands', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({
               type: RootCompTypeMeta,
               template: '<a a="b" #some-var="someValue" (click)="someHandler">'
             });
             var comp = createComp({type: ACompTypeMeta, selector: 'a'});
             run(rootComp, [comp])
                 .then((data) => {
                   expect(data).toEqual([
                     [
                       BEGIN_COMPONENT,
                       'a',
                       ['a', 'b'],
                       ['click'],
                       ['someVar', 'someValue'],
                       ['ACompType'],
                       false,
                       null,
                       'AComp'
                     ],
                     [END_COMPONENT]
                   ]);
                   async.done();
                 });
           }));

        it('should emulate style encapsulation on host elements',
           inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({
               type: RootCompTypeMeta,
               template: '<a></a>',
               encapsulation: ViewEncapsulation.Emulated
             });
             var comp = createComp(
                 {type: ACompTypeMeta, selector: 'a', encapsulation: ViewEncapsulation.Emulated});
             run(rootComp, [comp])
                 .then((data) => {
                   expect(data).toEqual([
                     [
                       BEGIN_COMPONENT,
                       'a',
                       ['_nghost-3', '', '_ngcontent-1', ''],
                       [],
                       [],
                       ['ACompType'],
                       false,
                       null,
                       'AComp'
                     ],
                     [END_COMPONENT]
                   ]);
                   async.done();
                 });
           }));

        it('should set nativeShadow flag', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({type: RootCompTypeMeta, template: '<a></a>'});
             var comp = createComp(
                 {type: ACompTypeMeta, selector: 'a', encapsulation: ViewEncapsulation.Native});
             run(rootComp, [comp])
                 .then((data) => {
                   expect(data).toEqual([
                     [BEGIN_COMPONENT, 'a', [], [], [], ['ACompType'], true, null, 'AComp'],
                     [END_COMPONENT]
                   ]);
                   async.done();
                 });
           }));

        it('should create nested nodes and set ngContentIndex',
           inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({type: RootCompTypeMeta, template: '<a>t</a>'});
             var comp = createComp({type: ACompTypeMeta, selector: 'a', ngContentSelectors: ['*']});
             run(rootComp, [comp])
                 .then((data) => {
                   expect(data).toEqual([
                     [BEGIN_COMPONENT, 'a', [], [], [], ['ACompType'], false, null, 'AComp'],
                     [TEXT, 't', false, 0],
                     [END_COMPONENT]
                   ]);
                   async.done();
                 });
           }));
      });

      describe('embedded templates', () => {
        it('should create embedded template commands', inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({
               type: RootCompTypeMeta,
               template: '<template a="b" #some-var="someValue"></template>'
             });
             var dir = createDirective(SomeDirTypeMeta, '[a]');
             run(rootComp, [dir])
                 .then((data) => {
                   expect(data).toEqual([
                     [
                       EMBEDDED_TEMPLATE,
                       ['a', 'b'],
                       ['someVar', 'someValue'],
                       ['SomeDirType'],
                       false,
                       null,
                       []
                     ]
                   ]);
                   async.done();
                 });
           }));

        it('should created nested nodes', inject([AsyncTestCompleter], (async) => {
             var rootComp =
                 createComp({type: RootCompTypeMeta, template: '<template>t</template>'});
             run(rootComp, [])
                 .then((data) => {
                   expect(data).toEqual(
                       [[EMBEDDED_TEMPLATE, [], [], [], false, null, [[TEXT, 't', false, null]]]]);
                   async.done();
                 });
           }));

        it('should calculate wether the template is merged based on nested ng-content elements',
           inject([AsyncTestCompleter], (async) => {
             var rootComp = createComp({
               type: RootCompTypeMeta,
               template: '<template><ng-content></ng-content></template>'
             });
             run(rootComp, [])
                 .then((data) => {
                   expect(data).toEqual(
                       [[EMBEDDED_TEMPLATE, [], [], [], true, null, [[NG_CONTENT, null]]]]);
                   async.done();
                 });
           }));

      });

      describe('ngContent', () => {
        it('should create ng-content commands', inject([AsyncTestCompleter], (async) => {
             var rootComp =
                 createComp({type: RootCompTypeMeta, template: '<ng-content></ng-content>'});
             run(rootComp, [])
                 .then((data) => {
                   expect(data).toEqual([[NG_CONTENT, null]]);
                   async.done();
                 });
           }));
      });
    }

    describe('compileComponentRuntime', () => {
      beforeEach(() => {
        componentTemplateFactory = (directiveType: TypeMetadata) => {
          return new CompiledTemplate(directiveType.typeName, []);
        };
      });

      function run(component: DirectiveMetadata, directives: DirectiveMetadata[]):
          Promise<any[][]> {
        var parsedTemplate = parser.parse(
            domParser.parse(component.template.template, component.type.typeName), directives);
        var commands = commandCompiler.compileComponentRuntime(component, parsedTemplate,
                                                               componentTemplateFactory);
        return PromiseWrapper.resolve(humanize(commands));
      }

      createTests(run);
    });


    describe('compileComponentCodeGen', () => {
      beforeEach(() => {
        componentTemplateFactory = (directiveType: TypeMetadata, imports: string[][]) => {
          imports.push([TEMPLATE_COMMANDS_MODULE_NAME, 'tcm']);
          return `new tcm.CompiledTemplate(${escapeSingleQuoteString(directiveType.typeName)}, [])`;
        };
      });

      function run(component: DirectiveMetadata, directives: DirectiveMetadata[]):
          Promise<any[][]> {
        var parsedTemplate = parser.parse(
            domParser.parse(component.template.template, component.type.typeName), directives);
        var sourceModule = commandCompiler.compileComponentCodeGen(component, parsedTemplate,
                                                                   componentTemplateFactory);
        var testableModule = createTestableModule(sourceModule);
        return evalModule(testableModule.source, testableModule.imports, null);
      }

      createTests(run);
    });

  });
}

// Attention: read by eval!
export function humanize(cmds: TemplateCmd[]): any[][] {
  var visitor = new CommandHumanizer();
  visitAllCommands(visitor, cmds);
  return visitor.result;
}

function checkAndStringifyType(type: Type): string {
  expect(isType(type)).toBe(true);
  return `${stringify(type)}Type`;
}

class CommandHumanizer implements CommandVisitor {
  result: any[][] = [];
  visitText(cmd: TextCmd, context: any): any {
    this.result.push([TEXT, cmd.value, cmd.isBound, cmd.ngContentIndex]);
    return null;
  }
  visitNgContent(cmd: NgContentCmd, context: any): any {
    this.result.push([NG_CONTENT, cmd.ngContentIndex]);
    return null;
  }
  visitBeginElement(cmd: BeginElementCmd, context: any): any {
    this.result.push([
      BEGIN_ELEMENT,
      cmd.name,
      cmd.attrNameAndValues,
      cmd.eventNames,
      cmd.variableNameAndValues,
      cmd.directives.map(checkAndStringifyType),
      cmd.isBound,
      cmd.ngContentIndex
    ]);
    return null;
  }
  visitEndElement(context: any): any {
    this.result.push([END_ELEMENT]);
    return null;
  }
  visitBeginComponent(cmd: BeginComponentCmd, context: any): any {
    this.result.push([
      BEGIN_COMPONENT,
      cmd.name,
      cmd.attrNameAndValues,
      cmd.eventNames,
      cmd.variableNameAndValues,
      cmd.directives.map(checkAndStringifyType),
      cmd.nativeShadow,
      cmd.ngContentIndex,
      cmd.template.id
    ]);
    return null;
  }
  visitEndComponent(context: any): any {
    this.result.push([END_COMPONENT]);
    return null;
  }
  visitEmbeddedTemplate(cmd: EmbeddedTemplateCmd, context: any): any {
    this.result.push([
      EMBEDDED_TEMPLATE,
      cmd.attrNameAndValues,
      cmd.variableNameAndValues,
      cmd.directives.map(checkAndStringifyType),
      cmd.isMerged,
      cmd.ngContentIndex,
      humanize(cmd.children)
    ]);
    return null;
  }
}

function createTestableModule(sourceModule: SourceModule): SourceModule {
  var testableSource;
  var testableImports = [[MODULE_NAME, 'mocks']].concat(sourceModule.imports);
  if (IS_DART) {
    testableSource = `${sourceModule.source}
  run(_) { return mocks.humanize(COMMANDS); }`;
  } else {
    testableSource = `${sourceModule.source}
  exports.run = function(_) { return mocks.humanize(COMMANDS); }`;
  }
  return new SourceModule(null, testableSource, testableImports);
}
