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
  beforeEachProviders
} from 'angular2/testing_internal';
import {MapWrapper} from 'angular2/src/facade/collection';
import {
  CompileDirectiveMetadata,
  CompileTypeMetadata
} from 'angular2/src/compiler/directive_metadata';
import {TemplateParser} from 'angular2/src/compiler/template_parser';
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
import {createChangeDetectorDefinitions} from 'angular2/src/compiler/change_definition_factory';
import {TestDirective, TestDispatcher, TestPipes} from './change_detector_mocks';

import {TEST_PROVIDERS} from './test_bindings';

export function main() {
  describe('ChangeDefinitionFactory', () => {
    beforeEachProviders(() => TEST_PROVIDERS);

    var parser: TemplateParser;
    var dispatcher: TestDispatcher;
    var context: TestContext;
    var directive: TestDirective;
    var locals: Locals;
    var pipes: Pipes;

    beforeEach(inject([TemplateParser], (_templateParser) => {
      parser = _templateParser;
      context = new TestContext();
      directive = new TestDirective();
      dispatcher = new TestDispatcher([directive], []);
      locals = new Locals(null, MapWrapper.createFromStringMap({'someVar': null}));
      pipes = new TestPipes();
    }));

    function createChangeDetector(template: string, directives: CompileDirectiveMetadata[],
                                  protoViewIndex: number = 0): ChangeDetector {
      var protoChangeDetectors =
          createChangeDetectorDefinitions(new CompileTypeMetadata({name: 'SomeComp'}),
                                          ChangeDetectionStrategy.Default,
                                          new ChangeDetectorGenConfig(true, false, false),
                                          parser.parse(template, directives, [], 'TestComp'))
              .map(definition => new DynamicProtoChangeDetector(definition));
      var changeDetector = protoChangeDetectors[protoViewIndex].instantiate();
      changeDetector.hydrate(context, locals, dispatcher, pipes);
      return changeDetector;
    }

    it('should watch element properties', () => {
      var changeDetector = createChangeDetector('<div [elProp]="someProp">', [], 0);

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

    it('should handle events on regular elements', () => {
      var changeDetector = createChangeDetector('<div on-click="onEvent($event)">', [], 0);

      changeDetector.handleEvent('click', 0, 'click');
      expect(context.eventLog).toEqual(['click']);
    });

    it('should handle events on template elements', () => {
      var dirMeta = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'SomeDir'}),
        selector: 'template',
        outputs: ['click']
      });
      var changeDetector =
          createChangeDetector('<template on-click="onEvent($event)">', [dirMeta], 0);

      changeDetector.handleEvent('click', 0, 'click');
      expect(context.eventLog).toEqual(['click']);
    });

    it('should handle events with targets', () => {
      var changeDetector = createChangeDetector('<div (window:click)="onEvent($event)">', [], 0);

      changeDetector.handleEvent('window:click', 0, 'click');
      expect(context.eventLog).toEqual(['click']);
    });

    it('should watch variables', () => {
      var changeDetector = createChangeDetector('<div #someVar [elProp]="someVar">', [], 0);

      locals.set('someVar', 'someValue');
      changeDetector.detectChanges();
      expect(dispatcher.log).toEqual(['elementProperty(elProp)=someValue']);
    });

    it('should write directive properties', () => {
      var dirMeta = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'SomeDir'}),
        selector: '[dirProp]',
        inputs: ['dirProp']
      });

      var changeDetector = createChangeDetector('<div [dirProp]="someProp">', [dirMeta], 0);

      context.someProp = 'someValue';
      changeDetector.detectChanges();
      expect(directive.dirProp).toEqual('someValue');
    });

    it('should write template directive properties', () => {
      var dirMeta = CompileDirectiveMetadata.create({
        type: new CompileTypeMetadata({name: 'SomeDir'}),
        selector: '[dirProp]',
        inputs: ['dirProp']
      });

      var changeDetector = createChangeDetector('<template [dirProp]="someProp">', [dirMeta], 0);

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

      changeDetector.handleEvent('click', 0, 'click');
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
