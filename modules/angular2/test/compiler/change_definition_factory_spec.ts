import {
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
  TestComponentBuilder
} from 'angular2/test_lib';
import {MapWrapper} from 'angular2/src/core/facade/collection';
import {isBlank} from 'angular2/src/core/facade/lang';
import {HtmlParser} from 'angular2/src/compiler/html_parser';
import {DirectiveMetadata, TypeMetadata, ChangeDetectionMetadata} from 'angular2/src/compiler/api';
import {MockSchemaRegistry} from './template_parser_spec';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
import {
  Parser,
  Lexer,
  ChangeDetectorDefinition,
  ChangeDetectorGenConfig,
  DynamicProtoChangeDetector,
  ProtoChangeDetector,
  ChangeDetectionStrategy,
  ChangeDispatcher,
  DirectiveIndex,
  Locals,
  BindingTarget,
  ChangeDetector
} from 'angular2/src/core/change_detection/change_detection';
import {Pipes} from 'angular2/src/core/change_detection/pipes';
import {createChangeDetectorDefinitions} from 'angular2/src/compiler/change_definition_factory';

export function main() {
  describe('ChangeDefinitionFactory', () => {
    var domParser: HtmlParser;
    var parser: TemplateParser;
    var dispatcher: TestDispatcher;
    var context: TestContext;
    var directive: TestDirective;
    var locals: Locals;
    var pipes: Pipes;
    var eventLocals: Locals;

    beforeEach(() => {
      domParser = new HtmlParser();
      parser = new TemplateParser(
          new Parser(new Lexer()),
          new MockSchemaRegistry({'invalidProp': false}, {'mappedAttr': 'mappedProp'}));
      context = new TestContext();
      directive = new TestDirective();
      dispatcher = new TestDispatcher([directive], []);
      locals = new Locals(null, MapWrapper.createFromStringMap({'someVar': null}));
      eventLocals = new Locals(null, MapWrapper.createFromStringMap({'$event': null}));
      pipes = new TestPipes();
    });

    function createChangeDetector(template: string, directives: DirectiveMetadata[],
                                  protoViewIndex: number = 0): ChangeDetector {
      var protoChangeDetectors =
          createChangeDetectorDefinitions(
              new TypeMetadata({typeName: 'SomeComp'}), ChangeDetectionStrategy.CheckAlways,
              new ChangeDetectorGenConfig(true, true, false),
              parser.parse(domParser.parse(template, 'TestComp'), directives))
              .map(definition => new DynamicProtoChangeDetector(definition));
      var changeDetector = protoChangeDetectors[protoViewIndex].instantiate(dispatcher);
      changeDetector.hydrate(context, locals, dispatcher, pipes);
      return changeDetector;
    }

    it('should watch element properties', () => {
      var changeDetector = createChangeDetector('<div [el-prop]="someProp">', [], 0);

      context.someProp = 'someValue';
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
    });

    it('should watch text nodes', () => {
      var changeDetector = createChangeDetector('{{someProp}}', [], 0);

      context.someProp = 'someValue';
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['textNode(null)=someValue']);
    });

    it('should handle events', () => {
      var changeDetector = createChangeDetector('<div on-click="onEvent($event)">', [], 0);

      eventLocals.set('$event', 'click');
      changeDetector.handleEvent('click', 0, eventLocals);
      expect(context.eventLog).toEqual(['click']);
    });

    it('should watch variables', () => {
      var changeDetector = createChangeDetector('<div #some-var [el-prop]="someVar">', [], 0);

      locals.set('someVar', 'someValue');
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
    });

    it('should write directive properties', () => {
      var dirMeta = new DirectiveMetadata({
        type: new TypeMetadata({typeName: 'SomeDir'}),
        selector: 'div',
        changeDetection: new ChangeDetectionMetadata({properties: ['dirProp']})
      });

      var changeDetector = createChangeDetector('<div [dir-prop]="someProp">', [dirMeta], 0);

      context.someProp = 'someValue';
      changeDetector.detectChanges();
      expect(directive.dirProp).toEqual('someValue');
    });

    it('should watch directive host properties', () => {
      var dirMeta = new DirectiveMetadata({
        type: new TypeMetadata({typeName: 'SomeDir'}),
        selector: 'div',
        changeDetection: new ChangeDetectionMetadata({hostProperties: {'elProp': 'dirProp'}})
      });

      var changeDetector = createChangeDetector('<div>', [dirMeta], 0);

      directive.dirProp = 'someValue';
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
    });

    it('should handle directive events', () => {
      var dirMeta = new DirectiveMetadata({
        type: new TypeMetadata({typeName: 'SomeDir'}),
        selector: 'div',
        changeDetection:
            new ChangeDetectionMetadata({hostListeners: {'click': 'onEvent($event)'}})
      });

      var changeDetector = createChangeDetector('<div>', [dirMeta], 0);

      eventLocals.set('$event', 'click');
      changeDetector.handleEvent('click', 0, eventLocals);
      expect(directive.eventLog).toEqual(['click']);
    });

    it('should create change detectors for embedded templates', () => {
      var changeDetector = createChangeDetector('<template>{{someProp}}<template>', [], 1);

      context.someProp = 'someValue';
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['textNode(null)=someValue']);
    });

    it('should watch expressions after embedded templates', () => {
      var changeDetector =
          createChangeDetector('<template>{{someProp2}}</template>{{someProp}}', [], 0);

      context.someProp = 'someValue';
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['textNode(null)=someValue']);
    });
  });
}

class TestContext {
  eventLog: string[] = [];
  someProp: string;
  someProp2: string;

  onEvent(value: string) { this.eventLog.push(value); }
}

class TestDirective {
  eventLog: string[] = [];
  dirProp: string;

  onEvent(value: string) { this.eventLog.push(value); }
}

class TestDispatcher implements ChangeDispatcher {
  log: string[];

  constructor(public directives: any[], public detectors: ProtoChangeDetector[]) { this.clear(); }

  getDirectiveFor(di: DirectiveIndex) { return this.directives[di.directiveIndex]; }

  getDetectorFor(di: DirectiveIndex) { return this.detectors[di.directiveIndex]; }

  clear() { this.log = []; }

  notifyOnBinding(target: BindingTarget, value) {
    this.log.push(`${target.mode}(${target.name})=${this._asString(value)}`);
  }

  logBindingUpdate(target, value) {}

  notifyAfterContentChecked() {}
  notifyAfterViewChecked() {}

  getDebugContext(a, b) { return null; }

  _asString(value) { return (isBlank(value) ? 'null' : value.toString()); }
}

class TestPipes implements Pipes {
  get(type: string) { return null; }
}
