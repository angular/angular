import {describe, beforeEach, it, expect, iit, ddescribe, el} from 'angular2/test_lib';
import {IMPLEMENTS} from 'angular2/src/facade/lang';
import {PropertyBindingParser} from 'angular2/src/render/dom/compiler/property_binding_parser';
import {CompilePipeline} from 'angular2/src/render/dom/compiler/compile_pipeline';
import {MapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {CompileElement} from 'angular2/src/render/dom/compiler/compile_element';
import {CompileStep} from 'angular2/src/render/dom/compiler/compile_step';
import {CompileControl} from 'angular2/src/render/dom/compiler/compile_control';
import {Lexer, Parser} from 'angular2/change_detection';
import {ElementBinderBuilder} from 'angular2/src/render/dom/view/proto_view_builder';

var EMPTY_MAP = MapWrapper.create();

export function main() {
  describe('PropertyBindingParser', () => {
    function createPipeline(hasNestedProtoView = false) {
      return new CompilePipeline([
        new MockStep((parent, current, control) => {
          if (hasNestedProtoView) {
            current.bindElement().bindNestedProtoView(el('<template></template>'));
          }
        }),
        new PropertyBindingParser(new Parser(new Lexer()))
      ]);
    }

    function process(element, hasNestedProtoView = false): List<ElementBinderBuilder> {
      return ListWrapper.map(createPipeline(hasNestedProtoView).process(element),
                             (compileElement) => compileElement.inheritedElementBinder);
    }

    it('should detect [] syntax', () => {
      var results = process(el('<div [a]="b"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a').source).toEqual('b');
    });

    it('should detect [] syntax only if an attribute name starts and ends with []', () => {
      expect(process(el('<div z[a]="b"></div>'))[0]).toBe(null);
      expect(process(el('<div [a]v="b"></div>'))[0]).toBe(null);
    });

    it('should detect bind- syntax', () => {
      var results = process(el('<div bind-a="b"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a').source).toEqual('b');
    });

    it('should detect bind- syntax only if an attribute name starts with bind',
       () => { expect(process(el('<div _bind-a="b"></div>'))[0]).toEqual(null); });

    it('should detect interpolation syntax', () => {
      var results = process(el('<div a="{{b}}"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a').source).toEqual('{{b}}');
    });

    it('should store property setters as camel case', () => {
      var element = el('<div bind-some-prop="1">');
      var results = process(element);
      expect(MapWrapper.get(results[0].propertyBindings, 'someProp')).toBeTruthy();
    });

    it('should detect var- syntax', () => {
      var results = process(el('<template var-a="b"></template>'));
      expect(MapWrapper.get(results[0].variableBindings, 'b')).toEqual('a');
    });

    it('should store variable binding for a template element on the nestedProtoView', () => {
      var results = process(el('<template var-george="washington"></p>'), true);
      expect(results[0].variableBindings).toEqual(EMPTY_MAP);
      expect(MapWrapper.get(results[0].nestedProtoView.variableBindings, 'washington'))
          .toEqual('george');
    });

    it('should store variable binding for a non-template element using shorthand syntax on the nestedProtoView',
       () => {
         var results = process(el('<template #george="washington"></template>'), true);
         expect(results[0].variableBindings).toEqual(EMPTY_MAP);
         expect(MapWrapper.get(results[0].nestedProtoView.variableBindings, 'washington'))
             .toEqual('george');
       });

    it('should store variable binding for a non-template element', () => {
      var results = process(el('<p var-george="washington"></p>'));
      expect(MapWrapper.get(results[0].variableBindings, 'washington')).toEqual('george');
    });

    it('should store variable binding for a non-template element using shorthand syntax', () => {
      var results = process(el('<p #george="washington"></p>'));
      expect(MapWrapper.get(results[0].variableBindings, 'washington')).toEqual('george');
    });

    it('should store a variable binding with an implicit value', () => {
      var results = process(el('<p var-george></p>'));
      expect(MapWrapper.get(results[0].variableBindings, '\$implicit')).toEqual('george');
    });

    it('should store a variable binding with an implicit value using shorthand syntax', () => {
      var results = process(el('<p #george></p>'));
      expect(MapWrapper.get(results[0].variableBindings, '\$implicit')).toEqual('george');
    });

    it('should detect variable bindings only if an attribute name starts with #', () => {
      var results = process(el('<p b#george></p>'));
      expect(results[0]).toEqual(null);
    });

    it('should detect () syntax', () => {
      var results = process(el('<div (click)="b()"></div>'));
      var eventBinding = results[0].eventBindings[0];
      expect(eventBinding.source.source).toEqual('b()');
      expect(eventBinding.fullName).toEqual('click');
      // "(click[])" is not an expected syntax and is only used to validate the regexp
      results = process(el('<div (click[])="b()"></div>'));
      eventBinding = results[0].eventBindings[0];
      expect(eventBinding.source.source).toEqual('b()');
      expect(eventBinding.fullName).toEqual('click[]');
    });

    it('should detect () syntax only if an attribute name starts and ends with ()', () => {
      expect(process(el('<div z(a)="b()"></div>'))[0]).toEqual(null);
      expect(process(el('<div (a)v="b()"></div>'))[0]).toEqual(null);
    });

    it('should parse event handlers using () syntax as actions', () => {
      var results = process(el('<div (click)="foo=bar"></div>'));
      var eventBinding = results[0].eventBindings[0];
      expect(eventBinding.source.source).toEqual('foo=bar');
      expect(eventBinding.fullName).toEqual('click');
    });

    it('should detect on- syntax', () => {
      var results = process(el('<div on-click="b()"></div>'));
      var eventBinding = results[0].eventBindings[0];
      expect(eventBinding.source.source).toEqual('b()');
      expect(eventBinding.fullName).toEqual('click');
    });

    it('should parse event handlers using on- syntax as actions', () => {
      var results = process(el('<div on-click="foo=bar"></div>'));
      var eventBinding = results[0].eventBindings[0];
      expect(eventBinding.source.source).toEqual('foo=bar');
      expect(eventBinding.fullName).toEqual('click');
    });

    it('should store bound properties as temporal attributes', () => {
      var results = createPipeline().process(el('<div bind-a="b" [c]="d"></div>'));
      expect(MapWrapper.get(results[0].attrs(), 'a')).toEqual('b');
      expect(MapWrapper.get(results[0].attrs(), 'c')).toEqual('d');
    });

    it('should store variables as temporal attributes', () => {
      var results = createPipeline().process(el('<div var-a="b" #c="d"></div>'));
      expect(MapWrapper.get(results[0].attrs(), 'a')).toEqual('b');
      expect(MapWrapper.get(results[0].attrs(), 'c')).toEqual('d');
    });

    it('should detect [()] syntax', () => {
      var results = process(el('<div [(a)]="b"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a').source).toEqual('b');
      expect(results[0].eventBindings[0].source.source).toEqual('b=$event');
    });

    it('should detect bindon- syntax', () => {
      var results = process(el('<div bindon-a="b"></div>'));
      expect(MapWrapper.get(results[0].propertyBindings, 'a').source).toEqual('b');
      expect(results[0].eventBindings[0].source.source).toEqual('b=$event');
    });
  });
}

class MockStep implements CompileStep {
  processClosure: Function;
  constructor(process) { this.processClosure = process; }
  process(parent: CompileElement, current: CompileElement, control: CompileControl) {
    this.processClosure(parent, current, control);
  }
}
