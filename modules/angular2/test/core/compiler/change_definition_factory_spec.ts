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
  TestComponentBuilder,
  beforeEachBindings
} from 'angular2/test_lib';
import {MapWrapper} from 'angular2/src/core/facade/collection';
import {
  CompileDirectiveMetadata,
  CompileTypeMetadata
} from 'angular2/src/core/compiler/directive_metadata';
import {TemplateParser} from 'angular2/src/core/compiler/template_parser';
import {
  Parser,
  Lexer,
  ChangeDetectorDefinition,
  ChangeDetectorGenConfig,
  DynamicProtoChangeDetector,
  ChangeDetectionStrategy,
  ChangeDispatcher,
  DirectiveIndex,
  Locals,
  BindingTarget,
  ChangeDetector
} from 'angular2/src/core/change_detection/change_detection';
import {Pipes} from 'angular2/src/core/change_detection/pipes';
import {
  createChangeDetectorDefinitions
} from 'angular2/src/core/compiler/change_definition_factory';
import {TestDirective, TestDispatcher, TestPipes} from './change_detector_mocks';

import {TEST_PROVIDERS} from './test_bindings';

export function main() {
  describe('ChangeDefinitionFactory', () => {
    beforeEachBindings(() => TEST_PROVIDERS);

    var parser: TemplateParser;
    var dispatcher: TestDispatcher;
    var context: TestContext;
    var directive: TestDirective;
    var locals: Locals;
    var pipes: Pipes;
    var eventLocals: Locals;

    beforeEach(inject([TemplateParser], (_templateParser) => {
      parser = _templateParser;
      context = new TestContext();
      directive = new TestDirective();
      dispatcher = new TestDispatcher([directive], []);
      locals = new Locals(null, MapWrapper.createFromStringMap({'someVar': null}));
      eventLocals = new Locals(null, MapWrapper.createFromStringMap({'$event': null}));
      pipes = new TestPipes();
    }));

    function createChangeDetector(template: string, directives: CompileDirectiveMetadata[],
                                  protoViewIndex: number = 0): ChangeDetector {
      var protoChangeDetectors =
          createChangeDetectorDefinitions(new CompileTypeMetadata({name: 'SomeComp'}),
                                          ChangeDetectionStrategy.Default,
                                          new ChangeDetectorGenConfig(true, true, false, false),
                                          parser.parse(template, directives, 'TestComp'))
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

    it('should handle events with targets', () => {
      var changeDetector = createChangeDetector('<div (window:click)="onEvent($event)">', [], 0);

      eventLocals.set('$event', 'click');
      changeDetector.handleEvent('window:click', 0, eventLocals);
      expect(context.eventLog).toEqual(['click']);
    });

    it('should watch variables', () => {
      var changeDetector = createChangeDetector('<div #some-var [el-prop]="someVar">', [], 0);

      locals.set('someVar', 'someValue');
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
    });

    it('should write directive properties', () => {
      var dirMeta = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'SomeDir'}),
        selector: '[dir-prop]',
        inputs: ['dirProp']
      });

      var changeDetector = createChangeDetector('<div [dir-prop]="someProp">', [dirMeta], 0);

      context.someProp = 'someValue';
      changeDetector.detectChanges();
      expect(directive.dirProp).toEqual('someValue');
    });

    it('should write template directive properties', () => {
      var dirMeta = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'SomeDir'}),
        selector: '[dir-prop]',
        inputs: ['dirProp']
      });

      var changeDetector = createChangeDetector('<template [dir-prop]="someProp">', [dirMeta], 0);

      context.someProp = 'someValue';
      changeDetector.detectChanges();
      expect(directive.dirProp).toEqual('someValue');
    });

    it('should watch directive host properties', () => {
      var dirMeta = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'SomeDir'}),
        selector: 'div',
        host: {'[elProp]': 'dirProp'}
      });

      var changeDetector = createChangeDetector('<div>', [dirMeta], 0);

      directive.dirProp = 'someValue';
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
    });

    it('should handle directive events', () => {
      var dirMeta = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'SomeDir'}),
        selector: 'div',
        host: {'(click)': 'onEvent($event)'}
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
